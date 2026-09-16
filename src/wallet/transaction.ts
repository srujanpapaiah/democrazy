import { v1 as uuid } from 'uuid';

import { MINING_REWARD, REWARD_INPUT } from '../config/constants.js';
import type { OutputMap, TransactionInput } from '../types/index.js';
import { verifySignature } from '../util/index.js';

import type { Wallet } from './wallet.js';

/** A brand-new transfer, signed by the sender. */
interface NewTransactionArgs {
  senderWallet: Wallet;
  recipient: string;
  amount: number;
}

/** A transaction rebuilt from existing parts, e.g. a miner reward. */
interface RawTransactionArgs {
  outputMap: OutputMap;
  input: TransactionInput;
}

export type TransactionArgs = NewTransactionArgs | RawTransactionArgs;

export interface UpdateArgs {
  senderWallet: Wallet;
  recipient: string;
  amount: number;
}

/**
 * A transfer of currency between wallets.
 *
 * A transaction records where the money went (`outputMap`) and proves who
 * authorised it (`input`). The sender's own remaining balance is one of the
 * outputs, so the outputs always sum to the sender's balance at signing time —
 * the invariant `validTransaction` checks.
 */
export class Transaction {
  readonly id: string;
  outputMap: OutputMap;
  input: TransactionInput;

  constructor(args: TransactionArgs) {
    this.id = uuid();

    if ('outputMap' in args) {
      this.outputMap = args.outputMap;
      this.input = args.input;
      return;
    }

    this.outputMap = this.createOutputMap(args);
    this.input = this.createInput({
      senderWallet: args.senderWallet,
      outputMap: this.outputMap,
    });
  }

  private createOutputMap({
    senderWallet,
    recipient,
    amount,
  }: NewTransactionArgs): OutputMap {
    return {
      [recipient]: amount,
      [senderWallet.publicKey]: senderWallet.balance - amount,
    };
  }

  private createInput({
    senderWallet,
    outputMap,
  }: {
    senderWallet: Wallet;
    outputMap: OutputMap;
  }): TransactionInput {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  /**
   * Adds another recipient to an already-signed transaction, re-signing it.
   *
   * A wallet with a pending transaction amends it rather than creating a
   * second one, so its balance can only be committed once.
   */
  update({ senderWallet, recipient, amount }: UpdateArgs): void {
    const senderBalance = this.outputMap[senderWallet.publicKey] ?? 0;

    if (amount > senderBalance) {
      throw new Error('Amount exceeds balance');
    }

    this.outputMap[recipient] = (this.outputMap[recipient] ?? 0) + amount;
    this.outputMap[senderWallet.publicKey] = senderBalance - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  /**
   * Verifies a transaction's outputs against its signed input.
   *
   * Reward transactions carry no signed amount and so never pass this check;
   * `Blockchain.validTransactionData` validates them separately.
   */
  static validTransaction(transaction: Transaction): boolean {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmount) => total + outputAmount,
      0
    );

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if (
      !signature ||
      !verifySignature({ publicKey: address, data: outputMap, signature })
    ) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  /** Mints the single reward paid to whoever mines the next block. */
  static rewardTransaction({ minerWallet }: { minerWallet: Wallet }): Transaction {
    return new Transaction({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }
}
