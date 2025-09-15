import { useState, useEffect } from "react";
import { GetTasks, AddTask, ToggleTask, DeleteTask } from "../wailsjs/go/main/App";
import "../src/App.css"

export default function App() {
  const [tasks, setTasks] = useState([]); 
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "active" | "completed"
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"
  const [theme, setTheme] = useState("light");
  const [priority, setPriority] = useState("medium");
  const [prioritySort, setPrioritySort] = useState("all");
  const [dueDate, setDueDate] = useState("");
  const [dueFilter, setDueFilter] = useState("all");
  const priorityOrder = ["high", "medium", "low"];

  
  const parseDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  dt.setHours(0,0,0,0);
  return dt;
};
  

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
  const res = await GetTasks();
  console.log("Raw response from backend:", res);
  if (res && res.length > 0) {
    console.log("First task structure:", res[0]);
    console.log("All keys in first task:", Object.keys(res[0]));
  }
  setTasks(res || []);
}

  // Универсально получить дату из объекта задачи (подстраховка под разный формат)
  function getCreatedDate(task) {
    const v = task.created_at ?? task.CreatedAt ?? task.createdAt;
    return v ? new Date(v) : new Date(0);
  }

  const getDueDate = (task) => {
    return task.due_date ?? task.DueDate ?? task.dueDate;
  };

  // Фильтрация основана на выполненных и не выполненных задач

const filteredTasks = tasks
  .filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  })
  .filter(t => {
    const dueValue = getDueDate(t);
    console.log(`Task "${t.title}" due value:`, dueValue); // Отладка
    
    if (!dueValue) {
      return dueFilter === "all";
    }
    
    const due = parseDate(dueValue);
    console.log(`Parsed due date for "${t.title}":`, due); // Отладка
    
    if (!due) {
      return dueFilter === "all";
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    console.log(`Filter: ${dueFilter}, Due: ${due.toDateString()}, Today: ${today.toDateString()}`); // Отладка
    
    switch(dueFilter) {
      case "overdue":
        return due < today;
      case "today":
        return due.getTime() === today.getTime();
      case "week":
        const weekEnd = new Date(today.getTime() + 7*24*60*60*1000);
        return due >= today && due <= weekEnd;
      default:
        return true;
    }
  });

const sortedTasks = [...filteredTasks].sort((a, b) => {
  // Основная сортировка по дате (всегда применяется)
  const da = getCreatedDate(a);
  const db = getCreatedDate(b);
  const dateSort = sortOrder === "newest" ? db - da : da - db;

  if (prioritySort !== "all") {
    const pa = (a.priority || "medium").toLowerCase() === prioritySort ? 0 : 1;
    const pb = (b.priority || "medium").toLowerCase() === prioritySort ? 0 : 1;
    
    if (pa !== pb) return pa - pb;
    return dateSort;
  }
  return dateSort;
});

const handleAdd = async () => {
    const title = newTask.trim();
    if (!title) return;

    const taskData = {
        title,
        completed: false,
        dueDate: dueDate || "",
        priority: priority || "medium",
    };

    console.log("Sending taskData to backend:", taskData);
    console.log("dueDate value:", dueDate);

    await AddTask(taskData);

    setNewTask("");
    setDueDate("");
    setPriority("medium");

    await loadTasks();
};

  const handleToggle = async (id) => {
    await ToggleTask(id);
    setTasks((prev) =>
        prev.map((t) => t.id === id ? {...t, completed: !t.completed}: t)
    );
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm("Вы уверены что хотите удалить эту задачу?")
    if (!confirmation) return; // если отменили

    // удаление задачи
    await DeleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
  <div className="container">
  <h1>To-Do List</h1>

  {/* --- Тема и добавление задачи --- */}
  <div className="input-row">
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? "Тёмная" : "Светлая"}
    </button>

    <input
      value={newTask}
      onChange={(e) => setNewTask(e.target.value)}
      placeholder="Введите задачу..."
      onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
    />
    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
      <option value="low">Низкий</option>
      <option value="medium">Средний</option>
      <option value="high">Высокий</option>
    </select>
    <button onClick={handleAdd}>Добавить</button>
  </div>

  {/* --- Фильтры по статусу --- */}
  <div className="filters filter-row">
    <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>Все</button>
    <button onClick={() => setFilter("active")} className={filter === "active" ? "active" : ""}>Активные</button>
    <button onClick={() => setFilter("completed")} className={filter === "completed" ? "active" : ""}>Выполненные</button>
  </div>

  {/* --- Сортировка --- */}
  <div className="filters filter-row">
    <button onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>
      {sortOrder === "newest" ? "Сортировать: Новые" : "Сортировать: Старые"}
    </button>

    <button onClick={() => {
      const order = ["all", "high", "medium", "low"];
      const nextIndex = (order.indexOf(prioritySort) + 1) % order.length;
      setPrioritySort(order[nextIndex]);
    }}>
      {prioritySort === "all" ? "Приоритет: Все" : `Приоритет: ${prioritySort.charAt(0).toUpperCase() + prioritySort.slice(1)}`}
    </button>
  </div>

  {/* --- Список задач --- */}
<ul className="task-list">
  {sortedTasks.map((t) => (
    <li key={t.id} className={`task-item ${(t.priority || "low").toLowerCase()}`}>
      <span className={`task-title ${t.completed ? "done" : ""}`} onClick={() => handleToggle(t.id)}>
        <span className="task-icon">{t.completed ? "✅" : "⬜"}</span>
        {t.title || "(без названия)"}
      </span>

      <span className={`priority-badge ${(t.priority || "medium").toLowerCase()}`}>
        {t.priority || "medium"}
      </span>

      <small className="task-date">{formatDate(getCreatedDate(t))}</small>
      {(() => {
        const dueValue = getDueDate(t);
        if (dueValue) {
          const dueDate = parseDate(dueValue);
          if (dueDate) {
            const today = new Date();
            today.setHours(0,0,0,0);
            
            let className = "task-due";
            let prefix = "До: ";
            
            if (dueDate < today) {
              className += " overdue";
              prefix = "Просрочено: ";
            } else if (dueDate.getTime() === today.getTime()) {
              className += " today";
              prefix = "Сегодня: ";
            }
            
            return <small className={className}>{prefix}{dueDate.toLocaleDateString()}</small>;
          }
        }
        return null;
      })()}

      <button className="task-delete" onClick={() => handleDelete(t.id)}>✕</button>
    </li>
  ))}
</ul>
</div>
)}

// Стили кнопок (простые inline-стили)
const btnStyle = {
  padding: "6px 10px",
  marginRight: 6,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer"
};
const activeBtnStyle = {
  ...btnStyle,
  background: "#007bff",
  color: "#fff",
  border: "1px solid #007bff"
};

// Небольшая функция форматирования даты
function formatDate(d) {
  if (!d) return "";
  return d.toLocaleString();
}
