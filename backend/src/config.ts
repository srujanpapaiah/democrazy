export const MINE_RATE = 1000;
export const INITIAL_DIFFICULTY = 3;

export const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [] as any[],
};

export const STARTING_BALANCE = 1000;

export const REWARD_INPUT = { address: '*authorized-reward*' };

export const MINING_REWARD = 50;

export const JWT_SECRET = process.env.JWT_SECRET || 'democrazy-secret-key-change-in-production';
export const JWT_EXPIRY = '7d';
