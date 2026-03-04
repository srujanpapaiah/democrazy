import { v1 as uuidv1 } from 'uuid';
import { verifySignature } from '../util';
import { REWARD_INPUT, MINING_REWARD } from '../config';
import Wallet from './index';
import { TransactionOutput } from '../types';

class Transaction {
  id: string;
  outputMap: TransactionOutput;
  input: any;

  constructor({
    senderWallet,
    recipient,
    amount,
    outputMap,
    input,
  }: {
    senderWallet?: Wallet;
    recipient?: string;
    amount?: number;
    outputMap?: TransactionOutput;
    input?: any;
  }) {
    this.id = uuidv1();
    this.outputMap = outputMap || this.createOutputMap({ senderWallet: senderWallet!, recipient: recipient!, amount: amount! });
    this.input = input || this.createInput({ senderWallet: senderWallet!, outputMap: this.outputMap });
  }

  createOutputMap({
    senderWallet,
    recipient,
    amount,
  }: {
    senderWallet: Wallet;
    recipient: string;
    amount: number;
  }): TransactionOutput {
    const outputMap: TransactionOutput = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }

  createInput({ senderWallet, outputMap }: { senderWallet: Wallet; outputMap: TransactionOutput }): any {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  update({
    senderWallet,
    recipient,
    amount,
  }: {
    senderWallet: Wallet;
    recipient: string;
    amount: number;
  }): void {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error('Amount exceeds balance');
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  static validTransaction(transaction: Transaction): boolean {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount, 0);

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction({ minerWallet }: { minerWallet: Wallet }): Transaction {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }
}

export default Transaction;
