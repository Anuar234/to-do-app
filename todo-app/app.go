package main

import (
	"context"
	"fmt"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	initDB()
}

func (a *App) GetTasks() []Task{
	var tasks []Task
	err := db.Select(&tasks, "SELECT * FROM tasks ORDER BY created_at DESC")
	if err != nil {
		fmt.Println("DB error: ", err)
		return []Task{}
	}
	return tasks
}

func (a *App) AddTask(task Task) Task {
	err := db.QueryRow(
		`INSERT INTO tasks (title, completed, priority, due_date)
		VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
		task.Title, task.Completed, task.Priority, task.DueDate,
	).Scan(&task.ID, &task.CreatedAt)

	if err != nil {
		fmt.Println("insert error", err)
	}

	return task
}

func (a *App) ToggleTask(id int64) {
	toggleTask(id)
} 	

func (a *App) DeleteTask(id int64){
	_, err := db.Exec("DELETE FROM tasks WHERE id=$1", id)
	if err != nil {
		fmt.Println("Delete error", err)
	}
}

