package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Joshi-Anish/travelSathi/internal/auth"
	"github.com/Joshi-Anish/travelSathi/internal/middleware"
	"github.com/Joshi-Anish/travelSathi/internal/model"
)

type TripHandler struct {
	DB *pgxpool.Pool
}

type createTripRequest struct {
	Destination  string   `json:"destination"`
	DurationDays int      `json:"duration_days"`
	StartDate    *string  `json:"start_date"`
	BudgetUSD    *float64 `json:"budget_usd"`
	Travelers    int      `json:"travelers"`
}

func (h *TripHandler) CreateTrip(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserContextKey)
	if claims == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	userClaims := claims.(*auth.Claims)

	var req createTripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Destination == "" || req.DurationDays <= 0 {
		http.Error(w, "destination and duration_days are required", http.StatusBadRequest)
		return
	}

	if req.Travelers == 0 {
		req.Travelers = 1
	}

	var trip model.Trip
	err := h.DB.QueryRow(r.Context(),
		`INSERT INTO trips (user_id, destination, duration_days, start_date, budget_usd, travelers)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, user_id, destination, duration_days, start_date, budget_usd, travelers, status, created_at, updated_at`,
		userClaims.UserID, req.Destination, req.DurationDays, req.StartDate, req.BudgetUSD, req.Travelers,
	).Scan(
		&trip.ID, &trip.UserID, &trip.Destination, &trip.DurationDays,
		&trip.StartDate, &trip.BudgetUSD, &trip.Travelers, &trip.Status,
		&trip.CreatedAt, &trip.UpdatedAt,
	)
	if err != nil {
		http.Error(w, "could not create trip", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(trip)
}

func (h *TripHandler) GetTrips(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserContextKey)
	if claims == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	userClaims := claims.(*auth.Claims)

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, user_id, destination, duration_days, start_date, budget_usd, travelers, status, created_at, updated_at
		 FROM trips WHERE user_id = $1 ORDER BY created_at DESC`,
		userClaims.UserID,
	)
	if err != nil {
		http.Error(w, "could not fetch trips", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	trips := []model.Trip{}
	for rows.Next() {
		var trip model.Trip
		if err := rows.Scan(
			&trip.ID, &trip.UserID, &trip.Destination, &trip.DurationDays,
			&trip.StartDate, &trip.BudgetUSD, &trip.Travelers, &trip.Status,
			&trip.CreatedAt, &trip.UpdatedAt,
		); err != nil {
			http.Error(w, "could not scan trip", http.StatusInternalServerError)
			return
		}
		trips = append(trips, trip)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trips)
}

func (h *TripHandler) GetTrip(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserContextKey)
	if claims == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	userClaims := claims.(*auth.Claims)
	tripID := chi.URLParam(r, "id")

	var trip model.Trip
	err := h.DB.QueryRow(r.Context(),
		`SELECT id, user_id, destination, duration_days, start_date, budget_usd, travelers, status, created_at, updated_at
		 FROM trips WHERE id = $1 AND user_id = $2`,
		tripID, userClaims.UserID,
	).Scan(
		&trip.ID, &trip.UserID, &trip.Destination, &trip.DurationDays,
		&trip.StartDate, &trip.BudgetUSD, &trip.Travelers, &trip.Status,
		&trip.CreatedAt, &trip.UpdatedAt,
	)
	if err != nil {
		http.Error(w, "trip not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trip)
}

func (h *TripHandler) DeleteTrip(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserContextKey)
	if claims == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	userClaims := claims.(*auth.Claims)
	tripID := chi.URLParam(r, "id")

	result, err := h.DB.Exec(r.Context(),
		`DELETE FROM trips WHERE id = $1 AND user_id = $2`,
		tripID, userClaims.UserID,
	)
	if err != nil {
		http.Error(w, "could not delete trip", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, "trip not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
