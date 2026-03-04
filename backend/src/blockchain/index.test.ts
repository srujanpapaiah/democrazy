import Blockchain from '.';
import Block from './block';
import { cryptoHash } from '../util/crypto-hash';
import Wallet from '../wallet';
import Transaction from '../wallet/transaction';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  let newChain: Blockchain;
  let originalChain: Block[];

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
  });

  it('contains a `chain` Array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block to the chain', () => {
    const newData = ['foo bar'];
    blockchain.addBlock({ data: newData });
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });

  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0] = { ...blockchain.chain[0], data: ['fake'] } as Block;
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe('when the chain starts with the genesis block and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: ['Bears'] });
        blockchain.addBlock({ data: ['Beets'] });
        blockchain.addBlock({ data: ['BSG'] });
      });

      describe('and a lastHash reference has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'broken-lastHash';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with an invalid field', () => {
        it('returns false', () => {
          blockchain.chain[2].data = ['bad'];
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with a jumped difficulty', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const timestamp = Date.now();
          const nonce = 0;
          const data: any[] = [];
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash(timestamp, lastBlock.hash, difficulty, nonce, data);
          const badBlock = new Block({ timestamp, lastHash: lastBlock.hash, hash, nonce, difficulty, data });
          blockchain.chain.push(badBlock);
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain does not contain any invalid blocks', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe('replaceChain()', () => {
    let logSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation();
      errorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      logSpy.mockRestore();
      errorSpy.mockRestore();
    });

    describe('when the new chain is not longer', () => {
      it('does not replace the chain', () => {
        newChain.chain[0] = { ...newChain.chain[0], data: ['x'] } as Block;
        blockchain.replaceChain(newChain.chain);
        expect(blockchain.chain).toEqual(originalChain);
      });
    });

    describe('when the new chain is longer', () => {
      beforeEach(() => {
        newChain.addBlock({ data: ['Bears'] });
        newChain.addBlock({ data: ['Beets'] });
        newChain.addBlock({ data: ['BSG'] });
      });

      describe('and the chain is invalid', () => {
        it('does not replace the chain', () => {
          newChain.chain[2].hash = 'fake-hash';
          blockchain.replaceChain(newChain.chain);
          expect(blockchain.chain).toEqual(originalChain);
        });
      });

      describe('and the chain is valid', () => {
        it('replaces the chain', () => {
          blockchain.replaceChain(newChain.chain);
          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });
  });
});
