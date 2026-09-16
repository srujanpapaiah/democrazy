import type { BlockProps, TransactionInput } from '../types/index.js';

/** Target time between blocks, in milliseconds. Drives difficulty adjustment. */
export const MINE_RATE = 1_000;

/** Leading-zero bits a block hash must have before the first block is mined. */
export const INITIAL_DIFFICULTY = 3;

/**
 * The hard-coded first block every node agrees on.
 *
 * Every field is fixed: a node whose genesis block differs by even one
 * character will reject — and be rejected by — the rest of the network.
 */
export const GENESIS_DATA: BlockProps = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};

/** Balance credited to a wallet that has never transacted. */
export const STARTING_BALANCE = 1_000;

/** Sentinel input marking a block's single miner-reward transaction. */
export const REWARD_INPUT: TransactionInput = { address: '*authorized-reward*' };

/** Amount paid to the miner of each block. */
export const MINING_REWARD = 50;
