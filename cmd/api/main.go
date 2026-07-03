package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"github.com/Joshi-Anish/travelSathi/internal/db"
	"github.com/Joshi-Anish/travelSathi/internal/handler"
	authmiddleware "github.com/Joshi-Anish/travelSathi/internal/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()

	pool, err := db.NewPool(ctx)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	defer pool.Close()

	log.Println("Successfully connected to database!")

	authHandler := &handler.AuthHandler{DB: pool}
	tripHandler := &handler.TripHandler{DB: pool}

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	// Public routes
	r.Post("/api/auth/register", authHandler.Register)
	r.Post("/api/auth/login", authHandler.Login)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(authmiddleware.AuthMiddleware)
		r.Post("/api/trips", tripHandler.CreateTrip)
		r.Get("/api/trips", tripHandler.GetTrips)
		r.Get("/api/trips/{id}", tripHandler.GetTrip)
		r.Delete("/api/trips/{id}", tripHandler.DeleteTrip)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
