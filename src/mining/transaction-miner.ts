import type { Block } from '../blockchain/block.js';
import type { Blockchain } from '../blockchain/blockchain.js';
import type { PubSub } from '../network/pubsub.js';
import { Transaction } from '../wallet/transaction.js';
import type { TransactionPool } from '../wallet/transaction-pool.js';
import type { Wallet } from '../wallet/wallet.js';

export interface TransactionMinerArgs {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  wallet: Wallet;
  pubsub: PubSub;
}

/** Packs pooled transactions into a block and claims the mining reward. */
export class TransactionMiner {
  private readonly blockchain: Blockchain;
  private readonly transactionPool: TransactionPool;
  private readonly wallet: Wallet;
  private readonly pubsub: PubSub;

  constructor({ blockchain, transactionPool, wallet, pubsub }: TransactionMinerArgs) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  /**
   * Mines every valid pooled transaction into a new block, appends the miner's
   * reward, broadcasts the result, and clears the pool.
   */
  mineTransactions(): Block {
    const validTransactions = this.transactionPool.validTransactions();

    validTransactions.push(Transaction.rewardTransaction({ minerWallet: this.wallet }));

    const block = this.blockchain.addBlock({ data: validTransactions });

    this.pubsub.broadcastChain();
    this.transactionPool.clear();

    return block;
  }
}
