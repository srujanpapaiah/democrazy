import PubNub from 'pubnub';
import Blockchain from '../blockchain';
import TransactionPool from '../wallet/transaction-pool';
import Wallet from '../wallet';
import Transaction from '../wallet/transaction';

const credentials = {
  publishKey: 'pub-c-a1bdca5d-e5b4-4b70-87df-0e879f9661e2',
  subscribeKey: 'sub-c-9ecd48c4-4456-11ea-ab08-365870080d62',
  secretKey: 'sec-c-MzZhM2YwMmQtY2U5NS00OGM5LWJlZDktYzRiMzNlMDZiMGYx',
};

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
};

class PubSub {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  wallet: Wallet;
  pubnub: PubNub;

  constructor({
    blockchain,
    transactionPool,
    wallet,
  }: {
    blockchain: Blockchain;
    transactionPool: TransactionPool;
    wallet: Wallet;
  }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    this.pubnub = new PubNub(credentials as any);
    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
    this.pubnub.addListener(this.listener());
  }

  listener(): any {
    return {
      message: (messageObject: any) => {
        const { channel, message } = messageObject;
        console.log(`Message received. Channel: ${channel}.`);
        const parsedMessage = JSON.parse(message);

        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage, true, () => {
              this.transactionPool.clearBlockchainTransactions({ chain: parsedMessage });
            });
            break;
          case CHANNELS.TRANSACTION:
            if (parsedMessage.input.address !== this.wallet.publicKey) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
          default:
            return;
        }
      },
    };
  }

  publish({ channel, message }: { channel: string; message: string }): void {
    this.pubnub.publish({ message, channel } as any);
  }

  broadcastChain(): void {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  broadcastTransaction(transaction: Transaction): void {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

export default PubSub;
