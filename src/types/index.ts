import type { ec } from 'elliptic';

/** A signature produced by a wallet's secp256k1 keypair. */
export type Signature = ec.Signature;

/**
 * Maps a recipient's public key to the amount credited to them by a
 * transaction. The sender's own key maps to their remaining balance.
 */
export type OutputMap = Record<string, number>;

/**
 * The authenticated half of a transaction.
 *
 * Reward transactions are minted by the network rather than signed by a
 * wallet, so they carry only an `address`; every other field is absent.
 * `Transaction.validTransaction` rejects such inputs, and
 * `Blockchain.validTransactionData` handles rewards separately.
 */
export interface TransactionInput {
  address: string;
  timestamp?: number;
  amount?: number;
  signature?: Signature;
}

/**
 * A block's payload.
 *
 * In production this is always a list of transactions, but blocks are mined
 * over arbitrary data in the mining and chain-validation paths, so consumers
 * must narrow before reading it.
 */
export type BlockData = unknown;

/** The wire shape of a block, as returned by `GET /api/blocks`. */
export interface BlockProps {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: BlockData;
  nonce: number;
  difficulty: number;
}
