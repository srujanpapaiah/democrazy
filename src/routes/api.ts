import { Router } from 'express';

import type { Blockchain } from '../blockchain/blockchain.js';
import { HttpError } from '../middleware/error-handler.js';
import type { TransactionMiner } from '../mining/transaction-miner.js';
import type { PubSub } from '../network/pubsub.js';
import type { TransactionPool } from '../wallet/transaction-pool.js';
import { Wallet } from '../wallet/wallet.js';

export interface ApiDependencies {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  wallet: Wallet;
  pubsub: PubSub;
  transactionMiner: TransactionMiner;
}

interface TransactRequestBody {
  recipient?: unknown;
  amount?: unknown;
}

/**
 * Validates a transfer request.
 *
 * Request bodies are untrusted: without these checks a blank recipient or a
 * negative amount would be signed into a block and become permanent.
 */
function parseTransactBody(body: TransactRequestBody): {
  recipient: string;
  amount: number;
} {
  const { recipient, amount } = body;

  if (typeof recipient !== 'string' || recipient.trim() === '') {
    throw new HttpError(400, 'A non-empty `recipient` address is required.');
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, '`amount` must be a positive number.');
  }

  return { recipient, amount };
}

export function createApiRouter({
  blockchain,
  transactionPool,
  wallet,
  pubsub,
  transactionMiner,
}: ApiDependencies): Router {
  const router = Router();

  router.get('/blocks', (_req, res) => {
    res.json(blockchain.chain);
  });

  /** Paginated chain access, for clients that should not pull the whole chain. */
  router.get('/blocks/length', (_req, res) => {
    res.json({ length: blockchain.chain.length });
  });

  router.post('/mine', (req, res) => {
    const { data } = req.body as { data?: unknown };

    if (data === undefined) {
      throw new HttpError(400, '`data` is required.');
    }

    const block = blockchain.addBlock({ data });
    pubsub.broadcastChain();

    res.status(201).json({ type: 'success', block });
  });

  router.post('/transact', (req, res) => {
    const { recipient, amount } = parseTransactBody(req.body as TransactRequestBody);

    // A wallet amends its pending transaction rather than creating a second
    // one, so the same balance cannot be committed twice.
    let transaction = transactionPool.existingTransaction({
      inputAddress: wallet.publicKey,
    });

    try {
      if (transaction) {
        transaction.update({ senderWallet: wallet, recipient, amount });
      } else {
        transaction = wallet.createTransaction({
          recipient,
          amount,
          chain: blockchain.chain,
        });
      }
    } catch (error) {
      throw new HttpError(
        400,
        error instanceof Error ? error.message : 'Unable to create transaction.'
      );
    }

    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
  });

  router.get('/transaction-pool-map', (_req, res) => {
    res.json(transactionPool.transactionMap);
  });

  // Mining mutates the chain, so this is a POST. The original API exposed it
  // as a GET, which let any page trigger mining with an <img> tag.
  router.post('/mine-transactions', (_req, res) => {
    const block = transactionMiner.mineTransactions();
    res.status(201).json({ type: 'success', block });
  });

  router.get('/wallet-info', (_req, res) => {
    const address = wallet.publicKey;

    res.json({
      address,
      balance: Wallet.calculateBalance({ chain: blockchain.chain, address }),
    });
  });

  return router;
}
