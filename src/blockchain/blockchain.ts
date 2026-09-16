import { MINING_REWARD, REWARD_INPUT } from '../config/constants.js';
import type { BlockData } from '../types/index.js';
import { cryptoHash } from '../util/index.js';
import { Transaction } from '../wallet/transaction.js';
import { Wallet } from '../wallet/wallet.js';

import { Block } from './block.js';

/**
 * The chain of mined blocks, plus the consensus rules that govern it.
 *
 * Nodes converge by adopting the longest *valid* chain they see; every rule
 * that makes a chain valid lives in `isValidChain` and `validTransactionData`.
 */
export class Blockchain {
  chain: Block[] = [Block.genesis()];

  /** The most recent block. The chain always has at least the genesis block. */
  get lastBlock(): Block {
    const last = this.chain[this.chain.length - 1];
    if (!last) {
      throw new Error('Blockchain is empty; it must always contain a genesis block.');
    }
    return last;
  }

  addBlock({ data }: { data: BlockData }): Block {
    const newBlock = Block.mineBlock({ lastBlock: this.lastBlock, data });
    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Adopts `chain` if it is longer and valid.
   *
   * `validateTransactions` is off by default because the expensive
   * transaction-data check is only needed for chains received from peers,
   * not for locally built ones.
   */
  replaceChain(
    chain: Block[],
    validateTransactions = false,
    onSuccess?: () => void
  ): void {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid');
      return;
    }

    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error('The incoming chain has invalid data');
      return;
    }

    onSuccess?.();
    console.log('replacing chain with', chain);
    this.chain = chain;
  }

  /**
   * Checks every transaction on `chain` against the rules a block must obey:
   * exactly one reward of the correct amount, correctly signed transfers,
   * inputs matching the sender's real balance, and no duplicates.
   */
  validTransactionData({ chain }: { chain: readonly Block[] }): boolean {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      if (!block || !Array.isArray(block.data)) continue;

      const transactionSet = new Set<Transaction>();
      let rewardTransactionCount = 0;

      for (const transaction of block.data as Transaction[]) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;

          if (rewardTransactionCount > 1) {
            console.error('Miner rewards exceed limit');
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('Miner reward amount is invalid');
            return false;
          }

          continue;
        }

        if (!Transaction.validTransaction(transaction)) {
          console.error('Invalid transaction');
          return false;
        }

        const trueBalance = Wallet.calculateBalance({
          chain: this.chain,
          address: transaction.input.address,
        });

        if (transaction.input.amount !== trueBalance) {
          console.error('Invalid input amount');
          return false;
        }

        if (transactionSet.has(transaction)) {
          console.error('An identical transaction appears more than once in the block');
          return false;
        }

        transactionSet.add(transaction);
      }
    }

    return true;
  }

  /**
   * Verifies a chain's structural integrity: the right genesis block, hashes
   * that link each block to its predecessor, hashes that match their contents,
   * and difficulty that never jumps by more than one.
   */
  static isValidChain(chain: readonly Block[]): boolean {
    const genesis = chain[0];
    if (!genesis) return false;
    if (JSON.stringify(genesis) !== JSON.stringify(Block.genesis())) return false;

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const previousBlock = chain[i - 1];
      if (!block || !previousBlock) return false;

      const { timestamp, lastHash, hash, nonce, difficulty, data } = block;

      if (lastHash !== previousBlock.hash) return false;
      if (hash !== cryptoHash(timestamp, lastHash, data, nonce, difficulty))
        return false;
      if (Math.abs(previousBlock.difficulty - difficulty) > 1) return false;
    }

    return true;
  }
}
