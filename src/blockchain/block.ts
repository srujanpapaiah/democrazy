import { GENESIS_DATA, MINE_RATE } from '../config/constants.js';
import type { BlockData, BlockProps } from '../types/index.js';
import { cryptoHash, hexToBinary } from '../util/index.js';

export interface MineBlockArgs {
  lastBlock: BlockProps;
  data: BlockData;
}

export interface AdjustDifficultyArgs {
  originalBlock: BlockProps;
  timestamp?: number;
}

/**
 * One link in the chain: a payload plus the proof-of-work that seals it.
 *
 * Fields stay mutable because chain validation must be able to detect
 * tampering — the tests mutate blocks to prove `isValidChain` catches it.
 */
export class Block implements BlockProps {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: BlockData;
  nonce: number;
  difficulty: number;

  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }: BlockProps) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  /** The fixed first block. Every node must produce an identical one. */
  static genesis(): Block {
    return new Block(GENESIS_DATA);
  }

  /**
   * Performs proof-of-work: increments a nonce until the hash has `difficulty`
   * leading zero bits.
   *
   * Difficulty is re-evaluated on every attempt because it depends on the
   * current timestamp — a long-running mine gets easier as it goes.
   */
  static mineBlock({ lastBlock, data }: MineBlockArgs): Block {
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let nonce = 0;
    let timestamp: number;
    let hash: string;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

    return new Block({ timestamp, lastHash, data, difficulty, nonce, hash });
  }

  /**
   * Nudges difficulty by one to steer block times toward `MINE_RATE`: harder
   * when the last block came in fast, easier when it came in slow.
   *
   * Moving by one keeps `isValidChain`'s jumped-difficulty check meaningful,
   * which is what stops an attacker lowering difficulty to forge a long chain.
   */
  static adjustDifficulty({ originalBlock, timestamp }: AdjustDifficultyArgs): number {
    const { difficulty } = originalBlock;

    if (difficulty < 1) return 1;

    if (timestamp !== undefined && timestamp - originalBlock.timestamp > MINE_RATE) {
      return difficulty - 1;
    }

    return difficulty + 1;
  }
}
