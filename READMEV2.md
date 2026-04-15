# VinoVault modular starter

This scaffold turns the basic Vite starter into a small full-stack layout that matches the VinoVault design documents:

- React frontend with a top menu bar and five feature tabs
- Express backend with one route module per feature
- Socket.IO placeholder for chat
- Local MongoDB via Mongoose
- Minimal shared files so teammates mostly stay inside their own feature folders

## Why this structure reduces merge conflicts

### Frontend
Each teammate mainly works in:

- `frontend/src/features/inventory`
- `frontend/src/features/recommendations`
- `frontend/src/features/reviews`
- `frontend/src/features/social`
- `frontend/src/features/wishlist`

Shared files should change rarely:

- `frontend/src/App.tsx`
- `frontend/src/config/features.ts`
- `frontend/src/components/*`

### Backend
Each teammate mainly works in:

- `backend/src/features/inventory`
- `backend/src/features/recommendations`
- `backend/src/features/reviews`
- `backend/src/features/social`
- `backend/src/features/wishlist`

Shared files should change rarely:

- `backend/src/app/registerFeatureRoutes.js`
- `backend/src/common/*`
- `backend/src/socket/registerSocketServer.js`

## Run locally

### 1. Start MongoDB
Use a local MongoDB instance:

`mongodb://127.0.0.1:27017/vinovault`

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Recommended next step per teammate

- Inventory owner: add cellar schemas, builder-like construction flow, reminder preference endpoints
- Discovery owner: add search filters, ranking logic, recommendation service
- Review owner: add review schemas, create/list routes, external metadata connector
- Social owner: add profile/friendship models, state-based relationship logic, socket chat integration
- Wishlist owner: add wishlist CRUD, price snapshot schema, observer-style tracking service

## Suggested conventions

- Keep cross-feature types small and stable
- Do not import one feature UI directly into another feature folder
- Expose backend features through routes and service boundaries only
- Use shared notification and catalog helpers instead of duplicating connector logic
