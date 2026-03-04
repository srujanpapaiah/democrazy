import hexToBinary from 'hex-to-binary';
import { GENESIS_DATA, MINE_RATE } from '../config';
import { cryptoHash } from '../util/crypto-hash';
import { BlockData } from '../types';

class Block {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: any[];
  nonce: number;
  difficulty: number;

  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }: BlockData) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis(): Block {
    return new this(GENESIS_DATA as BlockData);
  }

  static mineBlock({ lastBlock, data }: { lastBlock: Block; data: any[] }): Block {
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let hash: string;
    let timestamp: number;
    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this({ timestamp, lastHash, hash, data, nonce, difficulty });
  }

  static adjustDifficulty({
    originalBlock,
    timestamp,
  }: {
    originalBlock: Block;
    timestamp: number;
  }): number {
    const { difficulty } = originalBlock;
    if (difficulty < 1) return 1;
    if (timestamp - originalBlock.timestamp > MINE_RATE) return difficulty - 1;
    return difficulty + 1;
  }
}

export default Block;
