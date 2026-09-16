import type { Block } from '../blockchain/block.js';

import { Transaction } from './transaction.js';

export type TransactionMap = Record<string, Transaction>;

/**
 * Transactions that have been broadcast but not yet mined into a block.
 *
 * Miners draw from here; entries are cleared once they appear on the chain.
 */
export class TransactionPool {
  transactionMap: TransactionMap = {};

  clear(): void {
    this.transactionMap = {};
  }

  setTransaction(transaction: Transaction): void {
    this.transactionMap[transaction.id] = transaction;
  }

  setMap(transactionMap: TransactionMap): void {
    this.transactionMap = transactionMap;
  }

  /**
   * Finds this address's pending transaction, if any, so a second transfer
   * amends it instead of double-spending the same balance.
   */
  existingTransaction({
    inputAddress,
  }: {
    inputAddress: string;
  }): Transaction | undefined {
    return Object.values(this.transactionMap).find(
      transaction => transaction.input.address === inputAddress
    );
  }

  /** The subset of pooled transactions that pass signature and balance checks. */
  validTransactions(): Transaction[] {
    return Object.values(this.transactionMap).filter(transaction =>
      Transaction.validTransaction(transaction)
    );
  }

  /** Drops every pooled transaction that already appears on `chain`. */
  clearBlockchainTransactions({ chain }: { chain: readonly Block[] }): void {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      if (!block || !Array.isArray(block.data)) continue;

      for (const transaction of block.data as Transaction[]) {
        delete this.transactionMap[transaction.id];
      }
    }
  }
}
