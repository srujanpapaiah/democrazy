import type { ec as EC } from 'elliptic';

import type { Block } from '../blockchain/block.js';
import { STARTING_BALANCE } from '../config/constants.js';
import type { OutputMap, Signature } from '../types/index.js';
import { cryptoHash, ec } from '../util/index.js';

import { Transaction } from './transaction.js';

export interface CreateTransactionArgs {
  recipient: string;
  amount: number;
  chain?: readonly Block[];
}

export interface CalculateBalanceArgs {
  chain: readonly Block[];
  address: string;
}

/**
 * A secp256k1 keypair plus the balance derived from the chain.
 *
 * `balance` is a cache, not the source of truth: the authoritative balance is
 * always recomputed from the chain by `calculateBalance`.
 */
export class Wallet {
  balance: number = STARTING_BALANCE;
  readonly keyPair: EC.KeyPair;
  readonly publicKey: string;

  constructor() {
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex', false);
  }

  sign(data: OutputMap | string): Signature {
    return this.keyPair.sign(cryptoHash(data));
  }

  /**
   * Signs a transfer to `recipient`.
   *
   * When a chain is supplied the wallet's balance is refreshed from it first,
   * so a wallet that has received funds since it was constructed can spend
   * them. Throws if the amount exceeds the balance.
   */
  createTransaction({ recipient, amount, chain }: CreateTransactionArgs): Transaction {
    if (chain) {
      this.balance = Wallet.calculateBalance({ chain, address: this.publicKey });
    }

    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }

  /**
   * Replays the chain backwards to total up what `address` currently holds.
   *
   * The walk stops at the address's most recent outgoing transaction: that
   * transaction already paid the remaining balance back to the sender, so
   * anything earlier is spent and must not be counted twice.
   */
  static calculateBalance({ chain, address }: CalculateBalanceArgs): number {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];
      if (!block || !Array.isArray(block.data)) continue;

      for (const transaction of block.data as Transaction[]) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap[address];
        if (addressOutput) {
          outputsTotal += addressOutput;
        }
      }

      if (hasConductedTransaction) break;
    }

    return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
  }
}
