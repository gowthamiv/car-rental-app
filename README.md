Car Rental Application

A full-stack car rental reservation system built with React + TypeScript (frontend)
and Node.js + Express + TypeScript (backend), implementing the 4 core operations —
reserve, modify, cancel, and get pricing options — across 4 vehicle categories
(Sedan, SUV, Van, Pickup Truck).

Architecture

See docs/architecture.md for the full design document,
including design patterns used (Strategy, Factory, Repository, Facade, constructor
Dependency Injection, rich domain model) and all scope decisions confirmed with
the interviewer.

Prerequisites


Node.js v24.x (Active LTS)
npm (bundled with Node)
Git


Project structure

car-rental-app/
├── server/          # Node.js + Express + TypeScript backend
├── client/          # React + TypeScript frontend (Vite)
├── docs/
│   └── architecture.md
└── README.md

Setup & run — backend

bashcd server
npm install

Create a .env file in server/ (copy from .env.example if present):

PORT=4000
JWT_SECRET=your-local-dev-secret
JWT_EXPIRES_IN_SECONDS=7200
OTP_TTL_MS=300000
NODE_ENV=development

Start the backend:

bashnpm run dev

Runs on http://localhost:4000. Confirm it's up:

bashcurl http://localhost:4000/health

Setup & run — frontend

Open a second terminal:

bashcd client
npm install

Create a .env file in client/:

VITE_API_BASE_URL=http://localhost:4000/api

Start the frontend:

bashnpm run dev

Runs on http://localhost:5173. Both servers must be running simultaneously
for the app to work end to end.