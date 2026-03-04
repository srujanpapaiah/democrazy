# AGENTS.md

## Cursor Cloud specific instructions

**Democrazy** is a TypeScript Proof-of-Work blockchain platform with a separated frontend/backend architecture.

### Architecture

- **Backend** (`/backend`): Express + TypeScript on port 3001. Blockchain logic, REST API, JWT auth, user store.
- **Frontend** (`/frontend`): Next.js 14 (App Router) + TypeScript + Tailwind CSS on port 3000. Proxies `/api/*` to backend.

### Running the application

1. Start backend: `cd backend && npx ts-node-dev --transpile-only src/index.ts`
2. Start frontend: `cd frontend && npx next dev --port 3000`
3. Both must be running for the app to work (frontend proxies API calls to backend via `next.config.js` rewrites).

### Testing

- Backend tests: `cd backend && npx jest --forceExit` (6 suites, 62 tests)
- Frontend lint: `cd frontend && npx next lint`

### Key details

- User data stored in `backend/data/users.json` (created automatically on first registration)
- JWT secret defaults to a hardcoded value; set `JWT_SECRET` env var in production
- PubNub credentials are hardcoded in `backend/src/app/pubsub.ts`
- The `npm run dev` scripts in each package.json start the respective dev servers
- Backend uses `ts-node-dev` for hot reload; frontend uses Next.js built-in HMR
