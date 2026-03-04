import Transaction from './transaction';
import Wallet from '.';
import { verifySignature } from '../util';
import { REWARD_INPUT, MINING_REWARD } from '../config';

describe('Transaction', () => {
  let transaction: Transaction;
  let senderWallet: Wallet;
  let recipient: string;
  let amount: number;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = 'recipient-public-key';
    amount = 50;
    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it('has an `id`', () => {
    expect(transaction).toHaveProperty('id');
  });

  describe('outputMap', () => {
    it('has the `outputMap`', () => {
      expect(transaction).toHaveProperty('outputMap');
    });

    it('outputs the amount to the recipient', () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it('outputs the remaining balance for the `senderWallet`', () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
    });
  });

  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input');
    });

    it('has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });

    it('sets the `amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it('sets the `address` to the `senderWallet` publicKey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it('signs the input', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature,
        })
      ).toBe(true);
    });
  });

  describe('validTransaction()', () => {
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });

    describe('when the transaction is valid', () => {
      it('returns true', () => {
        expect(Transaction.validTransaction(transaction)).toBe(true);
      });
    });

    describe('when the transaction is invalid', () => {
      describe('and a transaction outputMap value is invalid', () => {
        it('returns false', () => {
          transaction.outputMap[senderWallet.publicKey] = 999999;
          expect(Transaction.validTransaction(transaction)).toBe(false);
        });
      });

      describe('and the transaction input signature is invalid', () => {
        it('returns false', () => {
          transaction.input.signature = new Wallet().sign('data');
          expect(Transaction.validTransaction(transaction)).toBe(false);
        });
      });
    });
  });

  describe('update()', () => {
    let originalSignature: any;
    let originalSenderOutput: number;
    let nextRecipient: string;
    let nextAmount: number;

    describe('and the amount is invalid', () => {
      it('throws an error', () => {
        expect(() => {
          transaction.update({ senderWallet, recipient: 'foo', amount: 999999 });
        }).toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      beforeEach(() => {
        originalSignature = transaction.input.signature;
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
        nextRecipient = 'next-recipient';
        nextAmount = 50;
        transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount });
      });

      it('outputs the amount to the next recipient', () => {
        expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
      });

      it('subtracts the amount from the original sender output amount', () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
      });

      it('maintains a total output that matches the input amount', () => {
        expect(Object.values(transaction.outputMap).reduce((t, a) => t + a, 0)).toEqual(transaction.input.amount);
      });

      it('re-signs the transaction', () => {
        expect(transaction.input.signature).not.toEqual(originalSignature);
      });
    });
  });

  describe('rewardTransaction()', () => {
    let rewardTransaction: Transaction;
    let minerWallet: Wallet;

    beforeEach(() => {
      minerWallet = new Wallet();
      rewardTransaction = Transaction.rewardTransaction({ minerWallet });
    });

    it('creates a transaction with the reward input', () => {
      expect(rewardTransaction.input).toEqual(REWARD_INPUT);
    });

    it('creates ones transaction for the miner with the `MINING_REWARD`', () => {
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
    });
  });
});
