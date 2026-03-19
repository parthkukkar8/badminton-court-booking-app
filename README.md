# 🏸 BadmintonBook

A full-stack badminton court booking platform built with modern technologies.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Router
- **Backend:** Node.js, Express.js (Microservices)
- **Database:** MongoDB with Geospatial Queries
- **Cache:** Redis
- **Auth:** Google OAuth 2.0 + JWT
- **Coming Soon:** Kafka, Docker, Razorpay, Socket.io

## 🏗️ Architecture
```
badminton-app/
├── services/
│   ├── auth-service/     (port 3001)
│   └── court-service/    (port 3002)
├── frontend/             (port 5173)
└── admin-portal/         (port 5174)
```

## 🚀 How to Run Locally

### Prerequisites
- Node.js v18+
- MongoDB
- Redis

### Steps

1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/badminton-app.git
cd badminton-app
```

2. Setup each service
```bash
# Auth Service
cd services/auth-service
npm install
cp .env.example .env  # fill in your values

# Court Service
cd services/court-service
npm install
cp .env.example .env

# Frontend
cd frontend
npm install

# Admin Portal
cd admin-portal
npm install
```

3. Start all services
```bash
# Terminal 1
mongod

# Terminal 2
redis-server

# Terminal 3
cd services/auth-service && npm run dev

# Terminal 4
cd services/court-service && npm run dev

# Terminal 5
cd frontend && npm run dev

# Terminal 6
cd admin-portal && npm run dev
```

## ✅ Features Built
- Google OAuth 2.0 login for users and admin
- Admin portal to add/delete courts
- Nearby courts search using MongoDB geospatial queries
- Redis caching for court search results
- JWT authentication with refresh tokens

## 🔲 Coming Soon
- Slot booking with real-time updates (Socket.io)
- Payment integration (Razorpay)
- Event-driven notifications (Kafka)
- Containerization (Docker)
- API Gateway (Nginx)