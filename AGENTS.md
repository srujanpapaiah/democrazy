# AGENTS.md

## Cursor Cloud specific instructions

**Democrazy** is a JavaScript Proof-of-Work blockchain application with an Express backend (port 3000) and a React frontend built by Parcel.

### Dependency version fixes

The `package.json` had several dependency version mismatches that were fixed:
- `uuid` downgraded to v3 (code uses `require('uuid/v1')`, removed in uuid v7+)
- `react-router-dom` downgraded to v5 (code uses `Switch`/`Router` with `history`, removed in v6)
- `history` downgraded to v4 (required by react-router-dom v5)
- `pubnub` downgraded to v4 (v7+ requires `userId` config not present in the code)
- `express-rate-limit` v5 added (code uses constructor-style API `new RateLimit()`, v7+ changed default export)
- Parcel build script updated from `--out-dir` (v1 flag) to `--dist-dir` (v2 flag)
- Added `"targets": { "main": false }` to prevent Parcel v2 conflict with `"main": "index.js"`

### Running the application

- **Tests:** `npx jest --forceExit` (6 suites, 77 tests). The `npm test` script uses `--watchAll` which is interactive.
- **Build client:** `npm run build-client` (Parcel builds React frontend into `client/dist/`)
- **Start server:** `node index.js` (serves API + static frontend on port 3000)
- **Start dev server with hot reload:** Use `nodemon index.js` for backend. For frontend dev: `npm run dev-client`.
- **Peer node:** `GENERATE_PEER_PORT=true node index.js` starts a peer on a random port (3001-4000)

### Caveats

- The server has a strict rate limiter: 5 requests per minute. When testing APIs via curl, space out requests or wait 60s between batches.
- On startup, `index.js` mines 10 blocks with sample transactions (takes a few seconds). The server is ready when it prints `listening at localhost:3000`.
- PubNub credentials are hardcoded in `app/pubsub.js`. The PubNub cloud service is used for peer-to-peer communication but is not required for single-node operation.
- The `npm run dev` script uses Windows `start` command and won't work on Linux. Use `nodemon index.js` directly instead.
- `redis` is listed as a dependency but is not used anywhere in the codebase.
