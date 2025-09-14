package main

import (
	"encoding/json"
	"os"
	"time"
)

type Task struct {
	ID        	int64  		`json:"id" db:"id"` 
	Title     	string 		`json:"title" db:"title"`
	Completed 	bool   		`json:"completed" db:"completed"`
	CreatedAt 	time.Time 	`json:"created_at" db:"created_at"`
	DueDate 	*time.Time 		`json:"due_date,omitempty" db:"due_date"`
	Priority 	string 		`json:"priority,omitempty" db:"priority"`
}

var tasks []Task
const filename = "tasks.json"

// func loadTasks() {
// 	data, err := os.ReadFile(filename)
// 	if err == nil {
// 		json.Unmarshal(data, &tasks)
// 	}
// }

func saveTasks() {
	data, _ := json.MarshalIndent(tasks, "", " ")
	os.WriteFile(filename, data, 0644)
}

// func addTask(title string) Task {
// 	task := Task{
// 		ID: time.Now().UnixNano(),
// 		Title: title,
// 		Completed: false,
// 		CreatedAt: time.Now(),
// 	}

// 	tasks = append(tasks, task)
// 	saveTasks()
// 	return task
// }


func toggleTask(id int64) {
	for i := range tasks {
		if tasks[i].ID == id {
			tasks[i].Completed = !tasks[i].Completed
			break
		}
	}
	saveTasks()
}

// func deleteTask(id int64) {
// 	newTasks := []Task{}
// 	for _, t := range tasks {
// 		if t.ID != id {
// 			newTasks = append(newTasks, t)
// 		}
// 	}
// 	tasks = newTasks
// 	saveTasks()
// }