import { useState, useEffect } from "react";
import {GetTasks, AddTask, ToggleTask, DeleteTask} from "../wailsjs/go/main/App"

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");

    useEffect(() => {
        GetTasks().then(setTasks);
    }, []); 

    const addTask = async () => {
        if (!newTask.trim()) return;
        const task = await AddTask(newTask);
        setTasks([...tasks, task]);
        setNewTask("");
    };

    const toggleTask = async (id) => {
        await ToggleTask(id);
        setTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed}: t));
    };

    const deleteTask = async (id) => {
        await Delete(id);
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">To-Do List</h1>
            <div className="flex gap-2 mb-4">
                <input className="border p-2 flex-1" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Введите задачу"
                />
                <button className="bg-blue-500 text-white px-4" onClick={addTask}>+</button>
            </div>

            <ul>
                {tasks.map(t => (
                    <li key={t.id} className="flex justify-between p-2 border-b">
                        <span
                        className={`cursor-pointer ${t.completed ? "line-through text-gray-500" : ""}`}
                        onClick={() => toggleTask(t.id)}
                        >
                            {t.title}
                        </span>
                        <button className="text-red-500" onClick={() => deleteTask(t.id)}>X</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;