# Democrazy

A proof-of-work blockchain written in TypeScript, with a React explorer front end.

It implements the core of the Bitcoin consensus model — SHA-256 proof of work,
dynamic difficulty adjustment, secp256k1 signatures, UTXO-style balances, a
transaction pool, miner rewards, and longest-valid-chain resolution between
peers.

## Requirements

- Node.js 20.19+ (see `.nvmrc`)

## Quick start

```bash
npm install
cp .env.example .env     # optional — only needed for peer-to-peer broadcast
npm run dev
```

`npm run dev` starts two processes:

| Process | URL                     | What it does                                 |
| ------- | ----------------------- | -------------------------------------------- |
| server  | <http://localhost:3000> | The blockchain node and its `/api` routes    |
| client  | <http://localhost:5173> | Vite dev server, proxying `/api` to the node |

Open <http://localhost:5173> during development. In production the node serves
the built client itself:

```bash
npm run build
npm start                # http://localhost:3000
```

## Running a second node

A peer boots on a random port and syncs its chain from the root node:

```bash
npm run dev:peer
```

To fill a node with demo blocks and transactions:

```bash
npx tsx scripts/seed.ts
```

## Peer-to-peer broadcast

Nodes share blocks and transactions over PubNub. Without credentials a node
still runs standalone — it just will not see other nodes. To connect a network,
put the same keys from <https://admin.pubnub.com> in every node's `.env`:

```
PUBNUB_PUBLISH_KEY=...
PUBNUB_SUBSCRIBE_KEY=...
```

## Scripts

| Script                  | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Server + client with hot reload                          |
| `npm run dev:server`    | Node only                                                |
| `npm run dev:peer`      | Node on a random port, syncing from the root node        |
| `npm run build`         | Compile server to `dist/server`, client to `dist/client` |
| `npm start`             | Run the built server                                     |
| `npm test`              | Run the test suite once                                  |
| `npm run test:watch`    | Re-run tests on change                                   |
| `npm run test:coverage` | Tests with a coverage report                             |
| `npm run typecheck`     | Typecheck server and client                              |
| `npm run lint`          | ESLint                                                   |
| `npm run format`        | Prettier                                                 |
| `npm run verify`        | Typecheck + lint + test (what CI runs)                   |

## API

All routes are under `/api`, rate limited to 120 requests per minute per IP.

| Method | Route                       | Description                                     |
| ------ | --------------------------- | ----------------------------------------------- |
| `GET`  | `/api/blocks`               | The full chain                                  |
| `GET`  | `/api/blocks/length`        | Chain height, without transferring the chain    |
| `POST` | `/api/mine`                 | Mine a block over arbitrary `{ data }`          |
| `POST` | `/api/transact`             | Sign `{ recipient, amount }` from this wallet   |
| `GET`  | `/api/transaction-pool-map` | Pending transactions                            |
| `POST` | `/api/mine-transactions`    | Mine the pool into a block and claim the reward |
| `GET`  | `/api/wallet-info`          | This node's address and balance                 |

Errors come back as `{ "type": "error", "message": "..." }` with a matching
HTTP status.

## Project layout

```
src/                  Blockchain node
  blockchain/         Block, chain, and consensus rules
  wallet/             Wallet, transaction, transaction pool
  mining/             Transaction miner
  network/            PubNub peer broadcast
  routes/             Express API routes
  middleware/         Error handling
  config/             Chain constants and environment config
  util/               Hashing and signature helpers
client/src/           React explorer
  api/                Typed API client
  hooks/              Data-fetching hooks
  components/         UI
scripts/              Developer scripts
```

## Testing

77 tests cover the consensus rules — hashing, difficulty adjustment, chain
validation, signature verification, balance calculation, and transaction-pool
behaviour.

```bash
npm test
```

## Deployment

`vercel.json` deploys the **client** as a static site: it builds with
`npm run build:client` and serves `dist/client`, rewriting unmatched paths to
`index.html` so client-side routes resolve. Requests under `/api` are excluded
from that rewrite.

The **node cannot run on serverless**, and that is a property of the design
rather than a configuration gap:

- The chain, the transaction pool and the wallet keypair all live in process
  memory (`src/index.ts`). Each serverless invocation may land on a fresh
  instance, so the chain resets to the genesis block and the wallet address
  changes between requests.
- Proof-of-work mining is an unbounded loop (`Block.mineBlock`). As difficulty
  climbs it will exceed any function execution limit.
- The PubNub subscription needs a long-lived process to receive broadcasts.

So the node runs on Render (`render.yaml`), which keeps a process alive.

### Deploying the node to Render

1. Render dashboard → **New → Blueprint** → point it at this repo. It reads
   `render.yaml` and creates a free web service.
2. Once it has a URL, set **`CORS_ORIGINS`** on the service to the Vercel URL
   serving the client, e.g. `https://democrazy.vercel.app`. Without it the
   browser blocks every cross-origin request.

The Render URL works standalone too — the node serves the built client from
`dist/client`, so the whole app is reachable there without Vercel.

### Pointing the Vercel client at the node

Set **`VITE_API_BASE_URL`** in the Vercel project to the Render URL and
redeploy. It is read at build time, so a redeploy is required for a change to
take effect. Left unset, the client calls `/api` on its own origin.

> **Free tier:** Render spins a free service down after ~15 minutes idle, and
> the next request takes up to a minute while it wakes. The client surfaces
> this rather than looking broken. Paid instances stay warm.

Making the node genuinely serverless would instead mean moving chain and pool
state into a shared store such as Redis or Postgres.

## License

ISC
