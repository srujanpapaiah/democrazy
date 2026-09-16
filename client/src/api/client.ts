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
 * Performs a JSON request against the node.
 *
 * The node reports failures as `{ type: 'error', message }`, so the body is
 * read on error paths too — otherwise the user sees a bare status code
 * instead of the reason their transaction was rejected.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the node. Is it running?');
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
