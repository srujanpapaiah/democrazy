/** Mirrors the wire format served by the node's `/api` routes. */

export type OutputMap = Record<string, number>;

export interface TransactionInput {
  address: string;
  timestamp?: number;
  amount?: number;
  signature?: unknown;
}

export interface Transaction {
  id: string;
  input: TransactionInput;
  outputMap: OutputMap;
}

export interface Block {
  timestamp: number;
  lastHash: string;
  hash: string;
  /** Transactions in production; the mining endpoint accepts arbitrary data. */
  data: unknown;
  nonce: number;
  difficulty: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
}

export type TransactionMap = Record<string, Transaction>;

/** Narrows a block's payload, which is only typed as `unknown` on the wire. */
export function blockTransactions(block: Block): Transaction[] {
  if (!Array.isArray(block.data)) return [];
  return block.data.filter(
    (entry): entry is Transaction =>
      typeof entry === 'object' && entry !== null && 'outputMap' in entry
  );
}
