# travelSathi 🧭

> AI-powered travel planner for Nepal and beyond — plan your trip, estimate costs, and get local recommendations in seconds.

---

## Overview

travelSathi is a full-stack travel planning application that takes your destination and trip duration as input and returns a complete, AI-generated trip plan — best routes, travel options, estimated costs, stay recommendations, daily itinerary, and local tips.

Built as a final-year portfolio project with a focus on clean backend architecture, AI integration, and real-world usability.

---

## Features

- 🗺️ **Smart Route Planning** — Get the best route options from your location to your destination
- 🚌 **Travel Mode Suggestions** — Compare bus, bike, flight, and other options with cost estimates
- 🏨 **Stay Recommendations** — Accommodation suggestions with estimated nightly costs
- 💰 **Budget Estimation** — Full trip cost breakdown before you leave
- 📅 **Day-by-Day Itinerary** — AI-generated daily plan tailored to your duration
- ⭐ **Local Tips** — Best things to do, eat, and experience at your destination
- 🔐 **User Auth** — JWT-based authentication, save and revisit your trip plans

---

## Tech Stack

**Backend**
- [Go](https://golang.org/) — core language
- [chi](https://github.com/go-chi/chi) — HTTP router
- [pgx](https://github.com/jackc/pgx) — PostgreSQL driver
- [golang-jwt](https://github.com/golang-jwt/jwt) — authentication
- [godotenv](https://github.com/joho/godotenv) — environment config

**AI**
- [Claude API (Anthropic)](https://www.anthropic.com/) — trip planning, recommendations, cost estimation

**Frontend**
- React + Tailwind CSS

**Database**
- PostgreSQL

---

## Project Structure

```
travelSathi/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── auth/
│   ├── db/
│   ├── handler/
│   ├── middleware/
│   └── model/
├── .env
├── go.mod
└── README.md
```

---

## Getting Started

### Prerequisites
- Go 1.21+
- PostgreSQL
- Anthropic API key

### Setup

```bash
# Clone the repo
git clone https://github.com/Joshi-Anish/travelSathi.git
cd travelSathi

# Install dependencies
go mod tidy

# Set up environment variables
cp .env.example .env
# Fill in your DB credentials and Anthropic API key

# Run the server
go run cmd/api/main.go
```

### Environment Variables

```env
DB_URL=postgres://user:password@localhost:5432/travelsathi
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_api_key
PORT=8080
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |
| POST | `/trips/plan` | Generate an AI trip plan |
| GET | `/trips` | Get all saved trips |
| GET | `/trips/:id` | Get a specific trip |
| DELETE | `/trips/:id` | Delete a trip |

---

## Roadmap

- [x] Project setup and structure
- [ ] Database schema and connection
- [ ] JWT authentication
- [ ] AI trip planning endpoint
- [ ] Save and retrieve trips
- [ ] React frontend
- [ ] Deployment

---

## Author

**Anish Joshi**
Computer Engineering — Pokhara University
[GitHub](https://github.com/Joshi-Anish) · [LinkedIn](https://linkedin.com/in/anish-joshi)

---

> Built with the goal of making travel planning in Nepal smarter and more accessible.
