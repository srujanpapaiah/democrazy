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

## License

ISC
