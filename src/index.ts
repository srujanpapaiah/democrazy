import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from './app.js';
import { Blockchain } from './blockchain/blockchain.js';
import type { Block } from './blockchain/block.js';
import { config } from './config/env.js';
import { TransactionMiner } from './mining/transaction-miner.js';
import { PubSub } from './network/pubsub.js';
import { TransactionPool, type TransactionMap } from './wallet/transaction-pool.js';
import { Wallet } from './wallet/wallet.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// Built layout is dist/server/index.js alongside dist/client/.
const clientDir = path.resolve(here, '../client');

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, wallet });
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub,
});

const app = createApp({
  blockchain,
  transactionPool,
  wallet,
  pubsub,
  transactionMiner,
  clientDir,
});

/**
 * Pulls the chain and pending transactions from the root node.
 *
 * A peer starting up knows only its own genesis block, so without this it
 * would mine on a stale chain and be rejected by the network. Failures are
 * logged rather than fatal: the node can still catch up via broadcasts.
 */
async function syncWithRootState(): Promise<void> {
  const { rootNodeAddress } = config;

  try {
    const response = await fetch(`${rootNodeAddress}/api/blocks`);
    if (response.ok) {
      const rootChain = (await response.json()) as Block[];
      console.log('Replacing chain on sync with the root node.');
      blockchain.replaceChain(rootChain);
    }
  } catch (error) {
    console.error(
      'Could not sync chain from root node:',
      error instanceof Error ? error.message : error
    );
  }

  try {
    const response = await fetch(`${rootNodeAddress}/api/transaction-pool-map`);
    if (response.ok) {
      const rootTransactionPoolMap = (await response.json()) as TransactionMap;
      console.log('Replacing transaction pool on sync with the root node.');
      transactionPool.setMap(rootTransactionPoolMap);
    }
  } catch (error) {
    console.error(
      'Could not sync transaction pool from root node:',
      error instanceof Error ? error.message : error
    );
  }
}

const server = app.listen(config.port, () => {
  console.log(`Node listening on http://localhost:${config.port}`);

  if (config.isPeer) {
    void syncWithRootState();
  }
});

/**
 * Closes the HTTP listener and the PubNub connection before exiting so
 * in-flight requests finish and the process does not hang on an open socket.
 */
async function shutdown(signal: string): Promise<void> {
  console.log(`\nReceived ${signal}, shutting down.`);

  server.close(error => {
    if (error) console.error('Error closing server:', error);
  });

  await pubsub.disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
