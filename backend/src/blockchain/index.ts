import Block from './block';
import { cryptoHash } from '../util/crypto-hash';
import Transaction from '../wallet/transaction';

class Blockchain {
  chain: Block[];

  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }: { data: any[] }): void {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });
    this.chain.push(newBlock);
  }

  replaceChain(chain: Block[], validateTransactions = false, onSuccess?: () => void): void {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid');
      return;
    }

    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error('The incoming chain has invalid transaction data');
      return;
    }

    if (onSuccess) onSuccess();
    console.log('replacing chain with', chain);
    this.chain = chain;
  }

  validTransactionData({ chain }: { chain: Block[] }): boolean {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set<string>();
      let rewardTransactionCount = 0;

      for (const transaction of block.data) {
        if ((transaction as any).input.address === '*authorized-reward*') {
          rewardTransactionCount++;
          if (rewardTransactionCount > 1) {
            console.error('Miner reward exceeds limit');
            return false;
          }
          if (Object.values((transaction as any).outputMap)[0] !== 50) {
            console.error('Miner reward amount is invalid');
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error('Invalid transaction');
            return false;
          }
          if (transactionSet.has((transaction as any).id)) {
            console.error('Duplicate transaction in block');
            return false;
          }
          transactionSet.add((transaction as any).id);
        }
      }
    }
    return true;
  }

  static isValidChain(chain: Block[]): boolean {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
      const actualLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== actualLastHash) return false;
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;

      const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
      if (hash !== validatedHash) return false;
    }
    return true;
  }
}

export default Blockchain;
