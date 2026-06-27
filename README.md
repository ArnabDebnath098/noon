# noon-app

Mobile-first noon app. Three decoupled layers:

```
noon-app/
├── frontend/   # React (Vite) + Tailwind CSS + Framer Motion — mobile-first UI
├── backend/    # Express REST API (serves /api/* and static /storage)
└── storage/    # Product images & uploads (separate asset/data layer)
```

## Frontend (`frontend/`)

React + Vite, styled with Tailwind, animated with Framer Motion. Uses the
**Noontree** brand font (loaded from `public/fonts/Noontree`).

```
src/
├── components/
│   ├── layout/   # MobileLayout — the mobile-first app shell
│   └── common/   # shared/reusable UI
├── pages/        # route pages (Home is currently an empty placeholder)
├── routes/       # AppRoutes — central route table
├── services/     # api.js — backend calls
├── hooks/        # custom hooks
├── context/      # React context providers
└── utils/        # helpers
```

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173  (proxies /api -> backend)
```

## Backend (`backend/`)

Express API, fully separate from the frontend.

```
src/
├── config/       # env + paths (incl. STORAGE_DIR)
├── routes/       # route definitions
├── controllers/  # request handlers (stubs for now)
├── models/       # data models
├── middleware/   # express middleware
└── utils/        # helpers
```

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

Endpoints: `GET /api/health`, `GET /api/products` (returns empty list for now).
Static assets served at `/storage/...`.

## Storage (`storage/`)

Holds product images and uploads, served statically by the backend. See
`storage/README.md`.
