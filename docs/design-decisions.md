# Car Rental Application — Design Decisions

> See [architecture.md](./architecture.md) for folder structure, API contract, and system layout.

This document captures every significant technical choice made while designing and building this
application, along with the reasoning behind it and the alternatives that were considered and set
aside. It's organized roughly in the order decisions were made.

---

## 1. Language & platform

### TypeScript over plain JavaScript (both frontend and backend)
- The assignment is aligned towards following OO design principles and should be extendable in the future
- Supports compile-time type safety and can catch bugs due to typos instead of at runtime
- Better documentation for reading the code
- The added setup cost over plain JS is close to zero with Vite's `react-ts` template and a standard `tsconfig.json` on the backend

### Node.js + Express (backend)
- Enables using the same language (TypeScript) across both frontend and backend, keeping type syntax and tooling consistent even though types themselves aren't shared as a package between the two
- Express has near-zero boilerplate to get a REST API running, keeping the focus on business logic (pricing, availability, auth) rather than framework configuration
- Express over Next.js: Next.js is primarily a frontend framework (SSR/SSG, file-based routing) with API routes as a secondary feature — using it as a backend means working against its routing conventions to express a clean layered architecture (controller → service → repository), and it introduces rendering/build concerns unrelated to a pure API service
- Express over Fastify/Koa: Express is the ecosystem standard with the largest documentation and community base; Fastify's raw performance edge and Koa's async-first middleware model solve problems (high throughput, deeply nested async chains) that don't apply at this app's scale (8 endpoints, no high-throughput requirement)

---

## 2. Storage
### In-memory storage (`Map`-backed repositories) over a real database
- This is the scope of the assignment, which is agreed on
- Plain `Map` objects behind a `Repository` interface give O(1) lookups by ID and are simple to seed with test/default data
- Wrapping storage behind a `Repository` interface keeps it swappable for a real database later without changes to service code
- Data resets on server restart, since nothing is persisted to disk

---

## 3. Authentication

### Mobile number + OTP + JWT (Authentication)
- The assignment requires mobile-based authentication, so the flow is built around a mobile number as the user's identity, verified via a one-time password
- Managed auth providers (Firebase Phone Auth, Twilio Verify, Auth0/Clerk/Supabase) require additional account setup, billing, and verification steps to integrate an external SMS/identity service
- A custom OTP + JWT flow avoids that setup entirely — OTP generation and verification are handled in-process, and JWT is issued on successful verification for session handling
- No external service dependency or API key management is introduced for authentication

---

## 4. Availability / inventory

### Fixed inventory count per category, checked against overlapping active reservations
- Per the specification, the number of vehicles available in each category depends on traffic (demand) for that category
- Rather than building a separate, fully dynamic inventory-management system as its own requirement, a fixed inventory count per category is maintained for now
- Availability for a given date range is calculated as the fixed inventory count minus the count of active reservations whose dates overlap the requested range

## 5. Backend design patterns Used and Why

| Pattern | Why chosen |
|---|---|
| **Strategy** (pricing) | One class per vehicle category implementing a common interface — eliminates conditional branching (`if/else` per category) and matches the per-category pricing rules in the spec directly. |
| **Factory** (`PricingFactory`) | Resolves the correct pricing strategy from a `VehicleCategory` at runtime, so no other code needs a switch statement to pick a pricing class. |
| **Repository (interface + implementation)** | Abstracts storage behind an interface so an in-memory implementation can be swapped for a real database later without touching service code. |
| **Facade** (`ReservationService`) | Exposes exactly the 4-method public contract from the original Java spec, hiding pricing/availability/repository orchestration underneath — a direct, recognizable translation of the original requirement. |
| **Constructor Dependency Injection** | Every service receives its dependencies via constructor, all instantiated once in `app.ts`. Chosen over a DI framework (InversifyJS/tsyringe) since manual wiring is simpler and fully sufficient at this app's scale — a framework would add config overhead solving a problem this project doesn't have. |
| **Rich domain model** (`Reservation` as a class) | `cancel()`, `isActive()`, `overlaps()`, `durationDays` live on the object itself, directly serving the original assignment's OO design requirement, rather than a plain data interface with logic scattered across services. |
| **Custom exception hierarchy** | `ValidationError`, `AvailabilityError`, `ReservationNotFoundError`, `AuthenticationError`, each mapped to an HTTP status, with one global error-handler middleware as the only place that writes error responses. Chosen over throwing generic `Error` objects so callers can type-check (`instanceof`) and so status codes aren't decided ad hoc at each throw site. |

### Constructor Dependency Injection over Singleton (repositories)
- Both approaches guarantee a single shared instance of each repository — the difference is how that single instance is created and accessed
- Singleton (`getInstance()`) hardcodes instance creation inside the class itself, making it harder to substitute a mock repository in unit tests without extra workarounds
- Constructor Dependency Injection creates each repository once in the composition root (`app.ts`) and passes it into every service that needs it via the constructor — same single-instance guarantee, without the `getInstance()` boilerplate
- Services depend on the repository type itself, not on how that instance is obtained, making it straightforward to pass in a different (e.g., mock) implementation for testing
- Avoids hidden global state accessed via a static method call from anywhere in the codebase — dependencies are explicit in each class's constructor signature

### Deliberately not used: Builder, Observer, Decorator, DI frameworks, sub-splitting `AvailabilityService`, a full DTO-mapping layer
Each was considered during a design review and explicitly rejected as disproportionate to the app's
scale — e.g., splitting `AvailabilityService` into `InventoryManager` + `AvailabilityCalculator` would
add layers to solve a single business rule; a full DTO layer (Request DTO → Domain → Response DTO)
would add mapping ceremony that shared TypeScript types already provide for free at this size. Adding
these would read as pattern-checkbox-ticking rather than solving a real problem.

---

## 6. Request/response handling

### Zod for request validation, applied as middleware before the controller
Validation happens once, at the route level (`validate(schema)`), before any controller code runs — a
controller never sees an unvalidated body. Zod was chosen over hand-written validation or Joi for its
TypeScript-first design (schemas double as type inference sources) and minimal boilerplate.

### Global error handler, not per-route try/catch
Every service throws typed `AppError` subclasses; Express 5's native support for forwarding thrown
errors from route handlers means no controller needs manual `try/catch` — errors propagate to one
`errorHandler` middleware that maps error type to HTTP status and writes the response. This keeps
"deciding what HTTP response an error produces" in exactly one place.

### Controllers contain zero business logic
Every controller function does exactly three things: read the (already-validated) request, call one
service method, map the result to a response. Any conditional business rule (e.g., pricing thresholds,
availability checks) belongs in a service — enforced as a hard rule during a design review pass, not
left as an implicit convention.

---

## 7. Logging & configuration

### `ILogger` interface + `ConsoleLogger`
- A logging interface exists so the logging implementation is swappable later without touching any calling code
- `ConsoleLogger` is the only implementation provided, since a console-output logger is sufficient for a local demo
- Services and controllers depend on the `ILogger` interface, not the concrete class, keeping logging calls decoupled from how logs are actually written

### Centralized `config.ts`, no `process.env` scattered across files
- Every environment-driven value (port, JWT secret/expiry, OTP TTL, dev-mode flag) is read once in `config.ts` and imported everywhere else
- Keeps a single source of truth for configuration — changing one value doesn't require hunting across multiple files that each read `process.env` directly

---

## 8. Frontend architecture

### React Router v6/7 over TanStack Router, Next.js routing, or no router
- Since the app is built in React, React Router is the natural fit for client-side routing
- Supports a clean `ProtectedRoute` pattern for auth-gating via nested routes and `<Outlet />`
- New protected pages can be added under the existing guard with zero changes to the guard itself

### Context API + `useReducer` over Redux, Zustand, RxJS, or a Pub-Sub event bus
- The app has only two genuinely shared pieces of state: auth (token/user) and the in-progress reservation draft
- Redux/Zustand solve prop-drilling and complex derived state at a scale this app doesn't have
- RxJS solves composable async streams (debouncing, websockets, cancellation) — the app's only async work is one-shot HTTP requests, already handled by Promises
- A Pub-Sub event bus solves decoupled messaging between unrelated distant components, which doesn't apply here since the components reacting to an event are the same ones triggering it

### Axios over native `fetch`
- Automatic JSON parsing and error-throwing on non-2xx responses, unlike native `fetch` which requires manually checking `response.ok`
- Request/response interceptors used to auto-attach the JWT header and globally handle 401s by triggering logout, without repeating that logic in every API call

### Custom hooks (`useAuth`, `usePricing`, `useReservations`) wrapping API calls and context
- Each hook owns its own `loading`/`error` state, so pages get consistent async handling without repeating `try/catch` logic
- Pages stay presentation-only, calling a hook and rendering — no fetch or state logic inside page components

### Tailwind CSS + CSS Modules (`@apply`)
- Tailwind's utility scale keeps spacing, color, and typography consistent across components without hand-rolled values drifting between files
- CSS Modules auto-scope class names (hashed at build time), preventing collisions between components that reuse simple names like `.card` or `.header`
- `@apply` inside `.module.css` combines both — Tailwind's design tokens without long utility-class strings cluttering JSX
- Each component owns a co-located stylesheet, keeping styles physically next to the code that uses them
- Pure CSS output, no CSS-in-JS runtime cost, no extra component library dependency

### Vite (with React)
- Native ES modules in development — the dev server starts almost instantly and serves files on demand, rather than bundling the entire app upfront like older tooling (e.g., Create React App/Webpack-based setups)
- Fast Hot Module Replacement (HMR) — component edits reflect in the browser within milliseconds without a full page reload, preserving component state during development
- Built-in TypeScript support out of the box — no separate Babel/TypeScript loader configuration needed to get a `.tsx` project running
- First-class official React template (`--template react-ts`) that scaffolds ESLint, TypeScript config, and React Fast Refresh together in one command
- Uses Rollup under the hood for production builds, which produces smaller, more optimized bundles with effective tree-shaking and code-splitting support (used later for the route-level lazy loading)
- Actively the current standard tooling recommendation for new React projects, with a smaller, simpler configuration surface than Webpack-based alternatives

---

## 9. API design
- Matches the REST contract directly from the backend — request and response shapes on the frontend mirror what the API expects and returns
- No extra computation or transformation needed on the UI side before rendering data or sending a request to the server

---

## 10. Tooling & repository strategy

### Single Git repository (monorepo-style `client/` + `server/`)
- Built by a single developer for the current scope, making one repository easier to reference and manage
- Simpler versioning — one commit history covers both frontend and backend changes together
- The system is modular enough (clear folder separation between `client/` and `server/`) that splitting into separate repositories isn't necessary
- Can be extended to a multi-repo or multi-frontend setup later if the project grows to support multiple clients or independent teams

---

## 11. Localization
- Currency and date values are formatted using the browser's native `Intl` API (`Intl.NumberFormat`, `Intl.DateTimeFormat`) instead of manual string formatting like `.toFixed(2)`
- Centralizes currency/date display logic in one `utils/format.ts` file, reused across all pages showing prices or dates
- Out of scope: multi-language support (translation files, a library like `react-i18next`) — the app is single-language (English) with no user-facing requirement for multiple locales
- Out of scope: locale/currency selection based on user region — currency is fixed to USD and dates to a single locale format

---

## 12. Accessibility
- `aria-label` added to icon-only buttons so screen readers announce their purpose
- `role="alert"` / `aria-live="polite"` added to error messages so they're announced as they appear, not just shown visually
- A visible `focus-visible` outline added globally for keyboard navigation, since default browser focus rings are often lost on custom-styled inputs/buttons
- Out of scope: a full WCAG audit or screen-reader testing pass — targeted fixes were applied, not a comprehensive accessibility review

---

## 13. Security
- `helmet()` applied globally to set standard HTTP security headers
- Rate limiting on OTP endpoints (5 requests per 5 minutes) to prevent brute-forcing a 6-digit code, plus a general API rate limit (30 requests per minute) as a broader backstop
- Request bodies validated via Zod schemas before reaching any controller or service
- JWT-based auth required on all reservation endpoints; ownership check on reservation reads so one user can't view another user's booking by guessing an ID
- Error responses only include internal detail (e.g., stack traces) in development mode — production returns a generic message
- Out of scope: CSP fine-tuning, HSTS, and a formal penetration test — `helmet()`'s defaults plus the above are treated as a reasonable baseline, not a full security hardening pass

## 14. Out of Scope Concepts
- Real SMS OTP config
- Vehicle Category Inventory management
- As In-memory DB is used, the data gets erased after server restart and user logsout on reload
- Styles like onFocus, hover custom styles, themes can be done as extension
- Performance metrics like code-splitting and lazy loading can be done as the assignment grows in size