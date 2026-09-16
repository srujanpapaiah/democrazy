import type { Block, Transaction, TransactionMap, WalletInfo } from '../types';

/** An error carrying the message the node reported, ready to show a user. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  message?: string;
}

/**
 * Where the node lives.
 *
 * Empty by default, so requests go to `/api` on the current origin — correct
 * for local dev (Vite proxies it) and for the node serving the client itself.
 * Set `VITE_API_BASE_URL` at build time when the client is hosted apart from
 * the node; the node must then list this client's origin in `CORS_ORIGINS`.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

/**
 * Performs a JSON request against the node.
 *
 * The node reports failures as `{ type: 'error', message }`, so the body is
 * read on error paths too — otherwise the user sees a bare status code
 * instead of the reason their transaction was rejected.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(
      0,
      API_BASE
        ? `Could not reach the node at ${API_BASE}. It may be starting up — free hosts sleep when idle and can take up to a minute to wake.`
        : 'Could not reach the node. Is it running?'
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as ErrorBody;
      if (body.message) message = body.message;
    } catch {
      // Non-JSON error body; the status-based message stands.
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export const api = {
  getBlocks: (): Promise<Block[]> => request<Block[]>('/blocks'),

  getWalletInfo: (): Promise<WalletInfo> => request<WalletInfo>('/wallet-info'),

  getTransactionPool: (): Promise<TransactionMap> =>
    request<TransactionMap>('/transaction-pool-map'),

  conductTransaction: (recipient: string, amount: number) =>
    request<{ type: string; transaction: Transaction }>('/transact', {
      method: 'POST',
      body: JSON.stringify({ recipient, amount }),
    }),

  mineTransactions: () =>
    request<{ type: string; block: Block }>('/mine-transactions', {
      method: 'POST',
    }),
};
