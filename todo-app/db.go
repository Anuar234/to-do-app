package main

import (
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var db *sqlx.DB

func initDB() {
	var err error

	dsn := "user=postgres password=postgres dbname=todoapp sslmode=disable port=5433"
	db, err = sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatal("Failed to connect to DB: ", err)
	}
	log.Println("Connected to PostgreSQL")
}