import Wallet from '.';
import Transaction from './transaction';
import { verifySignature } from '../util';
import Blockchain from '../blockchain';
import { STARTING_BALANCE } from '../config';

describe('Wallet', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance');
  });

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });

  describe('signing data', () => {
    const data = 'foobar';

    it('verifies a signature', () => {
      expect(verifySignature({ publicKey: wallet.publicKey, data, signature: wallet.sign(data) })).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      expect(verifySignature({ publicKey: wallet.publicKey, data, signature: new Wallet().sign(data) })).toBe(false);
    });
  });

  describe('createTransaction()', () => {
    describe('and the amount exceeds the balance', () => {
      it('throws an error', () => {
        expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' })).toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      let transaction: Transaction;
      let amount: number;
      let recipient: string;

      beforeEach(() => {
        amount = 50;
        recipient = 'foo-recipient';
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it('creates an instance of `Transaction`', () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('outputs the amount the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });

    describe('and a chain is passed', () => {
      it('calls `Wallet.calculateBalance`', () => {
        const calculateBalanceMock = jest.fn();
        const original = Wallet.calculateBalance;
        Wallet.calculateBalance = calculateBalanceMock.mockReturnValue(STARTING_BALANCE);

        wallet.createTransaction({ amount: 10, recipient: 'foo', chain: new Blockchain().chain });
        expect(calculateBalanceMock).toHaveBeenCalled();

        Wallet.calculateBalance = original;
      });
    });
  });

  describe('calculateBalance()', () => {
    let blockchain: Blockchain;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    describe('and there are no outputs for the wallet', () => {
      it('returns the `STARTING_BALANCE`', () => {
        expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })).toEqual(STARTING_BALANCE);
      });
    });

    describe('and there are outputs for the wallet', () => {
      let transactionOne: Transaction;
      let transactionTwo: Transaction;

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({ amount: 50, recipient: wallet.publicKey });
        transactionTwo = new Wallet().createTransaction({ amount: 60, recipient: wallet.publicKey });
        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });

      it('adds the sum of all outputs to the wallet balance', () => {
        expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })).toEqual(
          STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey]
        );
      });
    });
  });
});
