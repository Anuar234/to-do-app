package main

import (
	"context"
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
	loadTasks()
}

func (a *App) GetTasks() []Task{
	return tasks
}

func (a *App) AddTask(title string) Task {
	return addTask(title)
}

func (a *App) ToggleTask(id int64) {
	toggleTask(id)
} 	

func (a *App) DeleteTask(id int64){
	deleteTask(id)
}
