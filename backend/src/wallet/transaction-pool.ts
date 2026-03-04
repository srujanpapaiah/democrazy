import Transaction from './transaction';
import Block from '../blockchain/block';

class TransactionPool {
  transactionMap: { [id: string]: Transaction };

  constructor() {
    this.transactionMap = {};
  }

  clear(): void {
    this.transactionMap = {};
  }

  setTransaction(transaction: Transaction): void {
    this.transactionMap[transaction.id] = transaction;
  }

  setMap(transactionPoolMap: { [id: string]: Transaction }): void {
    this.transactionMap = transactionPoolMap;
  }

  existingTransaction({ inputAddress }: { inputAddress: string }): Transaction | undefined {
    const transactions = Object.values(this.transactionMap);
    return transactions.find((t) => t.input.address === inputAddress);
  }

  validTransactions(): Transaction[] {
    return Object.values(this.transactionMap).filter((transaction) =>
      Transaction.validTransaction(transaction)
    );
  }

  clearBlockchainTransactions({ chain }: { chain: Block[] }): void {
    for (let i = 1; i < chain.length; i++) {
      for (const transaction of chain[i].data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }
}

export default TransactionPool;
