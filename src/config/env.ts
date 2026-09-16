/**
 * Environment configuration, read and validated once at startup.
 *
 * Reading `process.env` anywhere else makes it impossible to tell what a
 * deployment actually needs, so every variable the server understands is
 * declared here.
 */

const DEFAULT_PORT = 3000;

function readPort(): number {
  const raw = process.env['PORT'];
  if (raw === undefined || raw === '') return DEFAULT_PORT;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 65_535) {
    throw new Error(`Invalid PORT: "${raw}" is not a port number between 0 and 65535.`);
  }
  return parsed;
}

/**
 * Peers run on a random port so several nodes can share one machine. The
 * root node keeps the default port so peers know where to sync from.
 */
function resolvePort(defaultPort: number): number {
  if (process.env['GENERATE_PEER_PORT'] === 'true') {
    return defaultPort + Math.ceil(Math.random() * 1_000);
  }
  return defaultPort;
}

const defaultPort = readPort();
const port = resolvePort(defaultPort);

const pubnubPublishKey = process.env['PUBNUB_PUBLISH_KEY'] ?? '';
const pubnubSubscribeKey = process.env['PUBNUB_SUBSCRIBE_KEY'] ?? '';
const pubnubSecretKey = process.env['PUBNUB_SECRET_KEY'] ?? '';

export const config = {
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isProduction: process.env['NODE_ENV'] === 'production',

  /** Port this node listens on — randomised when running as a peer. */
  port,

  /** True when this process was started as a peer of the root node. */
  isPeer: port !== defaultPort,

  /** Root node this process syncs its chain and transaction pool from. */
  rootNodeAddress:
    process.env['ROOT_NODE_ADDRESS'] ?? `http://localhost:${defaultPort}`,

  pubnub: {
    publishKey: pubnubPublishKey,
    subscribeKey: pubnubSubscribeKey,
    secretKey: pubnubSecretKey,
    /**
     * PubNub rejects a client with blank keys, so peer-to-peer broadcast
     * stays switched off until all three are supplied.
     */
    isConfigured: Boolean(pubnubPublishKey && pubnubSubscribeKey),
  },

  rateLimit: {
    windowMs: 60_000,
    max: 120,
  },
} as const;

export type Config = typeof config;
