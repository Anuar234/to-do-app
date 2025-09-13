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
  const [dueDate, setDueDate] = useState("");
  const priorityOrder = ["high", "mediгm", "low"];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const res = await GetTasks();
    setTasks(res || []);
  }

  // Универсально получить дату из объекта задачи (подстраховка под разный формат)
  function getCreatedDate(task) {
    const v = task.created_at ?? task.CreatedAt ?? task.createdAt;
    return v ? new Date(v) : new Date(0);
  }

  // Фильтрация основана на выполненных и не выполненных задач
  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return !!t.completed;
    return true;
  });

  // Сортировка по дате
  const sortedTasks = [...filteredTasks]
  .sort((a, b) => {
    // сначала сортируем по приоритету
    const pa = priorityOrder.indexOf(a.priority || "medium");
    const pb = priorityOrder.indexOf(b.priority || "medium");
    if (pa !== pb) return pa - pb;

    // потом по дате
    const da = getCreatedDate(a);
    const db = getCreatedDate(b);
    return sortOrder === "newest" ? db - da : da - db;
  });


  // Действия: add / toggle / delete — после каждого запроса обновляем список (чтобы sync с бэкендом)
const handleAdd = async () => {
    const title = newTask.trim();
    if (!title) return;

    const taskData = {
        title,
        completed: false,     // по умолчанию
        dueDate: dueDate || "", // поле соответствует Go структуре
        priority: priority || "medium",
    };

    // Передаём объект taskData, а не только title
    await AddTask(taskData);

    // Сбрасываем поля
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

    <button onClick={() => setTheme(theme === "light" ? "dark": "light")}>
        {theme === "light" ? "Тёмная" : "Светлая"}
    </button>

    <div className="input-row">
      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Введите задачу..."
        onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
      />

      <input 
      type="date" 
        value={dueDate} 
        onChange={(e) => setDueDate(e.target.value)}
        placeholder="Введите дату..." 
/>


      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="low"> Низкий</option>
        <option value="mediгm">Средний</option>
        <option value="high">Высокий</option>
      </select>
      <button onClick={handleAdd}>Добавить</button>
    </div>

    <div className="filters">
      <div>
        <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>Все</button>
        <button onClick={() => setFilter("active")} className={filter === "active" ? "active" : ""}>Активные</button>
        <button onClick={() => setFilter("completed")} className={filter === "completed" ? "active" : ""}>Выполненные</button>
      </div>

      <div style={{ marginLeft: "auto" }}>
        <button onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>
          {sortOrder === "newest" ? "Сортировать: новые" : "Сортировать: старые"}
        </button>
      </div>
    </div>

    <ul className="task-list">
      {sortedTasks.length === 0 && <li style={{ color: "#666" }}>Задач нет</li>}
      {sortedTasks.map((t) => (
        <li key={t.id} className="task-item">
          <span
            className={`task-title ${t.completed ? "done" : ""}`}
            onClick={() => handleToggle(t.id)}
          >
            <span className="task-icon">
              {t.completed ? "✅" : "⬜"}
            </span>
            {t.title || t.Title || "(без названия)"}
          </span>

          <small className="task-date">{formatDate(getCreatedDate(t))}</small>

          <button className="task-delete" onClick={() => handleDelete(t.id)}>✕</button>
        </li>
      ))}
    </ul>
  </div>
);

}

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
