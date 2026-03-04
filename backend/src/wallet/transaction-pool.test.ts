import TransactionPool from './transaction-pool';
import Transaction from './transaction';
import Wallet from '.';
import Blockchain from '../blockchain';

describe('TransactionPool', () => {
  let transactionPool: TransactionPool;
  let transaction: Transaction;
  let senderWallet: Wallet;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({ senderWallet, recipient: 'fake-recipient', amount: 50 });
  });

  describe('setTransaction()', () => {
    it('adds a transaction', () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  describe('existingTransaction()', () => {
    it('returns an existing transaction given an input address', () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })).toBe(transaction);
    });
  });

  describe('validTransactions()', () => {
    let validTransactions: Transaction[];
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation();
      validTransactions = [];

      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({ senderWallet, recipient: 'any-recipient', amount: 30 });

        if (i % 3 === 0) {
          transaction.input.amount = 999999;
        } else if (i % 3 === 1) {
          transaction.input.signature = new Wallet().sign('foo');
        } else {
          validTransactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });

    it('returns valid transactions', () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });
  });

  describe('clear()', () => {
    it('clears the transactions', () => {
      transactionPool.setTransaction(transaction);
      transactionPool.clear();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  describe('clearBlockchainTransactions()', () => {
    it('clears the pool of any existing blockchain transactions', () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap: { [id: string]: Transaction } = {};

      for (let i = 0; i < 6; i++) {
        const t = new Transaction({ senderWallet: new Wallet(), recipient: 'foo', amount: 20 });
        transactionPool.setTransaction(t);

        if (i % 2 === 0) {
          blockchain.addBlock({ data: [t] });
        } else {
          expectedTransactionMap[t.id] = t;
        }
      }

      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });
      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});
