package main

import (
	"context"
	"log"
	"os"

	"github.com/Joshi-Anish/travelSathi/internal/db"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Create context
	ctx := context.Background()

	// Connect to database
	pool, err := db.NewPool(ctx)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	defer pool.Close()

	log.Println("Successfully connected to database!")

	// Port to run on
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server ready on port %s", port)
}
