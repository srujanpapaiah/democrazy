import Blockchain from '../blockchain';
import TransactionPool from '../wallet/transaction-pool';
import Wallet from '../wallet';
import PubSub from './pubsub';
import Transaction from '../wallet/transaction';

class TransactionMiner {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  wallet: Wallet;
  pubsub: PubSub;

  constructor({
    blockchain,
    transactionPool,
    wallet,
    pubsub,
  }: {
    blockchain: Blockchain;
    transactionPool: TransactionPool;
    wallet: Wallet;
    pubsub: PubSub;
  }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransactions(): void {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(Transaction.rewardTransaction({ minerWallet: this.wallet }));
    this.blockchain.addBlock({ data: validTransactions });
    this.pubsub.broadcastChain();
    this.transactionPool.clear();
  }
}

export default TransactionMiner;
