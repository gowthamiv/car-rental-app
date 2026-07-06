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
```

---

## 5. Frontend Structure

```
client/src/
├── api/
│   ├── client.ts               # Axios instance + interceptors (auth token, 401 handling)
│   ├── authApi.ts
│   └── reservationApi.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useReservationDraft.ts
│   ├── usePricing.ts
│   ├── useReservations.ts
│   └── useDebouncedValue.ts
├── context/
│   ├── AuthContext.context.ts
│   ├── AuthProvider.tsx
│   ├── ReservationDraftContext.context.ts
│   └── ReservationDraftProvider.tsx
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── Header.module.css
│   ├── CategoryOptionCard/
│   │   ├── CategoryOptionCard.tsx
│   │   └── CategoryOptionCard.module.css
│   ├── ReservationForm/
│   │   ├── ReservationForm.tsx
│   │   └── ReservationForm.module.css
│   └── ProtectedRoute/
│       └── ProtectedRoute.tsx
├── pages/
│   ├── LoginPage/
│   ├── OtpVerifyPage/
│   ├── NewReservationPage/
│   ├── OptionsListPage/
│   ├── ReserveFormPage/
│   ├── ConfirmationPage/
│   ├── MyReservationsPage/
│   └── ReservationDetailPage/
│       (each folder: PageName.tsx + PageName.module.css)
├── constants/
│   └── category.config.ts
├── types/
│   ├── reservation.types.ts
│   └── auth.types.ts
├── utils/
│   ├── errorUtil.ts
│   ├── pricing.ts
│   └── format.ts
├── index.css                     # @import "tailwindcss";
└── App.tsx                       # routes, providers, ProtectedRoute wiring
```

### 5.1 Routing table

| Path | Component | Protected? |
|---|---|---|
| `/login` | LoginPage | No |
| `/verify-otp` | OtpVerifyPage | No |
| `/new-reservation` | NewReservationPage | Yes |
| `/options` | OptionsListPage | Yes |
| `/reserve` | ReserveFormPage | Yes |
| `/confirmation/:id` | ConfirmationPage | Yes |
| `/reservations` | MyReservationsPage | Yes |
| `/reservations/:id` | ReservationDetailPage | Yes |

### 5.2 End-to-end user flow

1. **Login** → mobile number → OTP requested (auto-filled in dev mode) → verify → JWT stored in `AuthContext`
2. **New Reservation** → dates + estimated mileage → navigates to Options with router state
3. **Get Options** → `usePricing()` fetches (debounced on mileage changes) → cards sorted ascending by price, "Best value" highlighted, unavailable categories disabled
4. **Select category** → written to `ReservationDraftContext` → navigates to Reserve
5. **Reserve** → confirm renter details (confirmation page)→ **click view reservations which navigates directly to My Reservations**
6. **My Reservations** → list with inline **Modify** and **Cancel** buttons per active row
7. **Modify** (`ReservationDetailPage`) → live price recalculation and live date validation as fields change; Save/Cancel both return to My Reservations
8. **Cancel** → confirm dialog → cancelled in place (list, not detail page) or via detail page

## 6. Design Patterns Applied (Backend)

| Pattern | Applied to |
|---|---|
| Strategy | Pricing per category |
| Factory | `PricingFactory` |
| Repository (interface + implementation) | Data access layer |
| Facade | `ReservationService` |
| Constructor Dependency Injection | All services, no Singletons |
| Rich domain model | `Reservation` class |
| Custom exception hierarchy | `errors/` + global `errorHandler` |

Full rationale for each — see [design-decisions.md](./design-decisions.md).

## 7. Non-Functional Additions

| Area | Implementation |
|---|---|
| Localization | `Intl.NumberFormat` / `Intl.DateTimeFormat` via `utils/format.ts` |
| Accessibility | `aria-label`, `role="alert"` + `aria-live` |
| Security | `helmet()`, OTP + general rate limiting, Zod validation, JWT auth, ownership checks, dev-only error detail |


## 8. Known Limitations

- All data is in-memory and resets on server restart
- Auth token lives only in React memory — refreshing the browser logs the user out
- OTP delivery is simulated, not sent via a real SMS gateway
- Renter details collected on the Reserve form are not persisted server-side

## 9. Background Theme
- Added a new Shared Component for Sharing the background across the application
├── pages/
    ├── AppBackground (has AppBackground.tsx, AppBackground.module.css)