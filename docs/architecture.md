src/
├── types/
│   ├── reservation.types.ts
│   └── auth.types.ts
├── constants/
│   └── category-config.ts    # renamed from categories.ts

src/context/
├── AuthContext.context.ts          # createContext + types only
├── AuthProvider.tsx                 # AuthProvider component only
├── ReservationDraftContext.context.ts
└── ReservationDraftProvider.tsx

Why this fixes it, and what changes downstream

Each .tsx file now exports only a component (AuthProvider, ReservationDraftProvider) — satisfies Fast Refresh's requirement
Each .context.ts file exports only non-component values (the context object + its type) — fine, since Fast Refresh's rule specifically targets files mixed between components and other exports, not non-component files entirely
hooks/useAuth.ts (the next file to build) will import AuthContext from AuthContext.context.ts, not from AuthProvider.tsx
App.tsx will import AuthProvider from AuthProvider.tsx (not from a combined file)src/components/

├── Header/
│   ├── Header.tsx
│   └── Header.module.css
├── ProtectedRoute.tsx
├── CategoryOptionCard.tsx
├── CategoryOptionCard.module.css
├── ReservationForm.tsx
└── ReservationForm.module.css

