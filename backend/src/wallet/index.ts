import { ec, cryptoHash } from '../util';
import Transaction from './transaction';
import { STARTING_BALANCE } from '../config';
import Block from '../blockchain/block';

class Wallet {
  balance: number;
  publicKey: string;
  keyPair: any;

  constructor({ privateKey }: { privateKey?: string } = {}) {
    this.balance = STARTING_BALANCE;

    if (privateKey) {
      this.keyPair = ec.keyFromPrivate(privateKey, 'hex');
    } else {
      this.keyPair = ec.genKeyPair();
    }

    this.publicKey = this.keyPair.getPublic().encode('hex', false);
  }

  get privateKey(): string {
    return this.keyPair.getPrivate('hex');
  }

  sign(data: any): any {
    return this.keyPair.sign(cryptoHash(data));
  }

  createTransaction({
    recipient,
    amount,
    chain,
  }: {
    recipient: string;
    amount: number;
    chain?: Block[];
  }): Transaction {
    if (chain) {
      this.balance = Wallet.calculateBalance({ chain, address: this.publicKey });
    }

    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }

  static calculateBalance({ chain, address }: { chain: Block[]; address: string }): number {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      for (const transaction of block.data) {
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

export default Wallet;
