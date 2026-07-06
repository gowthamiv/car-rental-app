# Car Rental App — Local Setup

Repository: https://github.com/gowthamiv/car-rental-app

A full-stack car rental reservation app — React + TypeScript frontend, Node.js + Express + TypeScript backend.

## Prerequisites

- **Node.js v24.x** (Active LTS)
- npm (bundled with Node)
- Git

## 1. Clone the repository

```bash
git clone https://github.com/gowthamiv/car-rental-app.git
cd car-rental-app
```

## 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```
PORT=4000
JWT_SECRET=your-local-dev-secret
JWT_EXPIRES_IN_SECONDS=7200
OTP_TTL_MS=300000
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```
Runs on **http://localhost:4000**. Verify it's up:
```bash
curl http://localhost:4000/health
```

## 3. Frontend setup

Open a **second terminal**:
```bash
cd client
npm install
```

Create a `.env` file inside `client/`:
```
VITE_API_BASE_URL=http://localhost:4000/api
```

Start the frontend:
```bash
npm run dev
```
Runs on **http://localhost:5173**.

## 4. Use the app

Open **http://localhost:5173** in your browser. Both the backend (port 4000) and frontend (port 5173) must be running at the same time.

1. Log in with any mobile number
2. The OTP is shown directly on screen in dev mode (no real SMS is sent) — auto-filled for convenience
3. Verify, then set a date range on **New Reservation**
4. Compare categories on **Get Options**, select one, and confirm on **Reserve**
5. Manage bookings from **My Reservations**

## Notes

- Data is stored **in-memory only** — restarting the backend clears all reservations and users.
- Refreshing the browser logs you out (session token lives only in memory, not persisted).

## Documentation
- [Architecture](docs/architecture.md) — folder structure, layers, API contract, request flow
- [Design Decisions](docs/design-decisions.md) — patterns and rationale, scope decisions, assumptions
