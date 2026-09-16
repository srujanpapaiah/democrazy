import PubNub, { type Listener } from 'pubnub';

import type { Blockchain } from '../blockchain/blockchain.js';
import { config } from '../config/env.js';
import type { Transaction } from '../wallet/transaction.js';
import type { TransactionPool } from '../wallet/transaction-pool.js';
import type { Wallet } from '../wallet/wallet.js';

export const CHANNELS = {
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
} as const;

export interface PubSubArgs {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  wallet: Wallet;
}

/**
 * Broadcasts chain and transaction updates between nodes over PubNub.
 *
 * Credentials come from the environment. When they are absent the class
 * degrades to a no-op so a single node still runs standalone — a missing
 * broadcast channel should not stop the blockchain itself from working.
 */
export class PubSub {
  private readonly blockchain: Blockchain;
  private readonly transactionPool: TransactionPool;
  private readonly wallet: Wallet;
  private readonly pubnub: PubNub | null;

  constructor({ blockchain, transactionPool, wallet }: PubSubArgs) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    if (!config.pubnub.isConfigured) {
      console.warn(
        'PubNub keys are not configured — peer-to-peer broadcast is disabled. ' +
          'Set PUBNUB_PUBLISH_KEY and PUBNUB_SUBSCRIBE_KEY to enable it.'
      );
      this.pubnub = null;
      return;
    }

    this.pubnub = new PubNub({
      publishKey: config.pubnub.publishKey,
      subscribeKey: config.pubnub.subscribeKey,
      userId: `node-${config.port}`,
    });

    this.pubnub.addListener(this.listener());
    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
  }

  private listener(): Listener {
    return {
      message: messageObject => {
        const { channel, message } = messageObject;

        if (typeof message !== 'string') return;

        let parsed: unknown;
        try {
          parsed = JSON.parse(message);
        } catch {
          // Anything on a public channel is untrusted; a peer sending
          // malformed JSON must not take this node down.
          console.error(`Discarded unparseable message on channel ${channel}`);
          return;
        }

        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            this.handleChainMessage(parsed);
            break;
          case CHANNELS.TRANSACTION:
            this.handleTransactionMessage(parsed);
            break;
          default:
            break;
        }
      },
    };
  }

  private handleChainMessage(parsed: unknown): void {
    if (!Array.isArray(parsed)) return;

    this.blockchain.replaceChain(parsed, true, () => {
      this.transactionPool.clearBlockchainTransactions({ chain: parsed });
    });
  }

  private handleTransactionMessage(parsed: unknown): void {
    const transaction = parsed as Transaction | null;
    if (!transaction?.input?.address) return;

    // Our own broadcasts come back to us; re-pooling them is harmless but noisy.
    if (transaction.input.address === this.wallet.publicKey) return;

    this.transactionPool.setTransaction(transaction);
  }

  private publish(channel: string, message: string): void {
    if (!this.pubnub) return;

    void this.pubnub.publish({ channel, message }).catch((error: unknown) => {
      console.error('Failed to publish message:', error);
    });
  }

  broadcastChain(): void {
    this.publish(CHANNELS.BLOCKCHAIN, JSON.stringify(this.blockchain.chain));
  }

  broadcastTransaction(transaction: Transaction): void {
    this.publish(CHANNELS.TRANSACTION, JSON.stringify(transaction));
  }

  /** Releases the PubNub connection so the process can exit cleanly. */
  async disconnect(): Promise<void> {
    if (!this.pubnub) return;
    this.pubnub.unsubscribeAll();
    await this.pubnub.destroy();
  }
}
