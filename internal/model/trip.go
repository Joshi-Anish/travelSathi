package model

import "time"

type Trip struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	Destination  string    `json:"destination"`
	DurationDays int       `json:"duration_days"`
	StartDate    *string   `json:"start_date,omitempty"`
	BudgetUSD    *float64  `json:"budget_usd,omitempty"`
	Travelers    int       `json:"travelers"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
