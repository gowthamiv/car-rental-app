# Car Rental Application — Architecture

> See [design-decisions.md](./design-decisions.md) for the rationale behind each choice below.

---

## 1. Original Assignment Requirements (Reference)

Public interface must expose 4 methods:
1. Reserve a single car
2. Modify the reservation for a single car
3. Cancel the reservation for a single car
4. Get Options for reserving

**Vehicle categories:** SEDAN, SUV, VAN, PICKUP TRUCK

**Pricing rules:**

| Category | Rule |
|---|---|
| SEDAN | < 10 days → $20/day; else $15/day |
| VAN | $22/day flat |
| SUV | $15/day + $0.50/mile × daily mileage |
| PICKUP TRUCK | $30/day flat |

`Get Options` returns all categories with total price, **sorted ascending by price**.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Backend runtime | Node.js 24 (Active LTS) |
| Backend framework | Express 5 |
| Backend language | TypeScript |
| Validation | Zod |
| Auth | Mobile number + OTP (simulated) + JWT |
| Security middleware | `helmet`, `express-rate-limit` |
| Storage | In-memory (`Map`-backed repositories) |
| Frontend framework | React 19 |
| Frontend build tool | Vite |
| Frontend language | TypeScript |
| Routing | React Router |
| Styling | Tailwind CSS v4 + CSS Modules (`@apply`) |
| HTTP client | Axios |
| State management | Context API + `useReducer`, custom hooks |
| Icons | lucide-react |

---

## 3. High-Level Architecture

```
┌───────────────────┐        HTTPS/REST (JSON)        ┌───────────────────────┐
│   React (SPA)      │ ───────────────────────────────▶ │  Node.js + Express     │
│  TypeScript + Vite  │ ◀─────────────────────────────── │  TypeScript            │
│  React Router       │                                   │  Layered architecture  │
│  Context API         │                                   │  In-memory storage      │
│  Axios               │                                   └───────────────────────┘
└───────────────────┘
```

Single repository, two top-level folders:
```
car-rental-app/
├── client/
├── server/
├── docs/
│   ├── architecture.md
│   └── design-decisions.md
├── car-rental-api.postman_collection.json
├── car-rental-local.postman_environment.json
└── README.md
```

---

## 4. Backend Structure

```
server/src/
├── config/
│   └── config.ts
├── domain/
│   ├── Reservation.ts          # class: cancel(), isActive(), overlaps(), durationDays
│   ├── VehicleCategory.ts
│   └── User.ts
├── errors/
│   ├── AppError.ts
│   ├── ValidationError.ts
│   ├── AvailabilityError.ts
│   ├── ReservationNotFoundError.ts
│   └── AuthenticationError.ts
├── pricing/
│   ├── PricingStrategy.ts
│   ├── SedanPricing.ts
│   ├── SuvPricing.ts
│   ├── VanPricing.ts
│   ├── PickupPricing.ts
│   ├── PricingFactory.ts
│   └── PricingService.ts
├── repositories/
│   ├── IReservationRepository.ts
│   ├── MemoryReservationRepository.ts
│   ├── IInventoryRepository.ts
│   ├── MemoryInventoryRepository.ts
│   ├── IUserRepository.ts
│   └── MemoryUserRepository.ts
├── services/
│   ├── AvailabilityService.ts
│   ├── auth/
│   │   ├── OtpService.ts
│   │   ├── JwtService.ts
│   │   └── UserService.ts
│   └── ReservationService.ts     # Facade — the 4-method public contract
├── validation/
│   ├── reservationSchemas.ts
│   └── authSchemas.ts
├── middleware/
│   ├── authMiddleware.ts
│   ├── validate.ts
│   └── errorHandler.ts
├── logging/
│   ├── ILogger.ts
│   └── ConsoleLogger.ts
├── controllers/
│   ├── authController.ts
│   └── reservationController.ts
├── routes/
│   ├── authRoutes.ts
│   └── reservationRoutes.ts
├── types/
│   └── AuthenticatedRequest.ts   # extends Express Request with `user`
└── app.ts                        # composition root
```

### 4.1 Request flow

```
HTTP request
     │
     ▼
generalLimiter (30 req/min, all /api/*)
     │
     ▼
validate() middleware  ──(invalid)──▶  ValidationError (400)  ──▶  errorHandler ──▶ JSON response
     │ (valid)
     ▼
authMiddleware (protected routes only)  ──(invalid/missing token)──▶  AuthenticationError (401)
     │ (valid)
     ▼
Controller  (delegates only — no business logic)
     │
     ▼
Service (Facade / domain logic)
     │
     ▼
Response sent to client
```

`/api/auth/*` additionally passes through `otpLimiter` (5 req/5min) before `validate()`.

### 4.2 REST API contract

| Method | Endpoint | Auth | Rate limit | Notes |
|---|---|---|---|---|
| POST | `/api/auth/request-otp` | No | otpLimiter | Returns OTP in dev mode |
| POST | `/api/auth/verify-otp` | No | otpLimiter | Returns `{ token, userId }` |
| POST | `/api/options` | No | generalLimiter | Sorted ascending by price; includes `availableCount` |
| POST | `/api/reservations` | Yes | generalLimiter | Validates availability before booking |
| GET | `/api/reservations` | Yes | generalLimiter | Logged-in user's reservations |
| GET | `/api/reservations/:id` | Yes | generalLimiter | Ownership-checked single reservation |
| PUT | `/api/reservations/:id` | Yes | generalLimiter | Re-validates availability, recalculates price |
| DELETE | `/api/reservations/:id` | Yes | generalLimiter | Cancels, frees inventory |
| GET | `/health` | No | — | Health check |

### 4.3 Availability calculation

```
- Availability is calculated based on overlapping slots of reservations
- A reservation being edited doesn't count as a conflict against its own current slot.

---

## 5. Frontend Structure