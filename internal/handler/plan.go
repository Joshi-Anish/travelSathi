package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Joshi-Anish/travelSathi/internal/auth"
	"github.com/Joshi-Anish/travelSathi/internal/middleware"
)

type PlanHandler struct {
	DB *pgxpool.Pool
}

type tripPlan struct {
	ID              string          `json:"id"`
	TripID          string          `json:"trip_id"`
	RawResponse     string          `json:"raw_response"`
	RouteSummary    string          `json:"route_summary"`
	Itinerary       json.RawMessage `json:"itinerary"`
	BudgetBreakdown json.RawMessage `json:"budget_breakdown"`
	LocalTips       string          `json:"local_tips"`
	GeneratedAt     time.Time       `json:"generated_at"`
}

func (h *PlanHandler) GeneratePlan(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserContextKey)
	if claims == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	userClaims := claims.(*auth.Claims)
	tripID := chi.URLParam(r, "id")

	// Verify trip belongs to user
	var destination string
	var durationDays int
	var travelers int
	err := h.DB.QueryRow(r.Context(),
		`SELECT destination, duration_days, travelers FROM trips WHERE id = $1 AND user_id = $2`,
		tripID, userClaims.UserID,
	).Scan(&destination, &durationDays, &travelers)
	if err != nil {
		http.Error(w, "trip not found", http.StatusNotFound)
		return
	}

	// Generate plan (mocked for now)
	raw, route, itinerary, budget, tips := generateMockPlan(destination, durationDays, travelers)

	// Save to DB
	var plan tripPlan
	err = h.DB.QueryRow(r.Context(),
		`INSERT INTO trip_plans (trip_id, raw_response, route_summary, itinerary, budget_breakdown, local_tips)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, trip_id, raw_response, route_summary, itinerary, budget_breakdown, local_tips, generated_at`,
		tripID, raw, route, itinerary, budget, tips,
	).Scan(
		&plan.ID, &plan.TripID, &plan.RawResponse, &plan.RouteSummary,
		&plan.Itinerary, &plan.BudgetBreakdown, &plan.LocalTips, &plan.GeneratedAt,
	)
	if err != nil {
		http.Error(w, "could not save plan", http.StatusInternalServerError)
		return
	}

	// Update trip status to planned
	h.DB.Exec(r.Context(),
		`UPDATE trips SET status = 'planned' WHERE id = $1`,
		tripID,
	)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(plan)
}

func generateMockPlan(destination string, days, travelers int) (raw, route string, itinerary, budget json.RawMessage, tips string) {
	raw = "This is a mock Claude response for " + destination

	route = "Fly to " + destination + " via Kathmandu. Local transport by taxi and hiking trails."

	itineraryData := []map[string]interface{}{}
	for i := 1; i <= days; i++ {
		itineraryData = append(itineraryData, map[string]interface{}{
			"day":           i,
			"title":         "Day " + fmt.Sprint(i) + " in " + destination,
			"activities":    []string{"Morning hike", "Local sightseeing", "Evening at lakeside"},
			"accommodation": "Local guesthouse",
			"meals":         []string{"Breakfast included", "Lunch at local restaurant", "Dinner at hotel"},
		})
	}
	itineraryJSON, _ := json.Marshal(itineraryData)
	itinerary = itineraryJSON

	budgetData := map[string]interface{}{
		"accommodation": 50 * days * travelers,
		"food":          30 * days * travelers,
		"transport":     40 * travelers,
		"activities":    20 * days * travelers,
		"total":         (50+30+20)*days*travelers + 40*travelers,
		"currency":      "USD",
	}
	budgetJSON, _ := json.Marshal(budgetData)
	budget = budgetJSON

	tips = "Best time to visit " + destination + " is October-November. Carry cash as ATMs are limited. Respect local customs."

	return
}
