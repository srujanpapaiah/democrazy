import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import Blockchain from './blockchain';
import PubSub from './app/pubsub';
import TransactionPool from './wallet/transaction-pool';
import Wallet from './wallet';
import TransactionMiner from './app/transaction-miner';
import { authMiddleware, AuthRequest } from './auth/middleware';
import { createUser, authenticateUser } from './auth/store';
import { JWT_SECRET, JWT_EXPIRY } from './config';

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const serverWallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, wallet: serverWallet });

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// --- Auth Routes (public) ---

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  try {
    const user = await createUser(username, email, password);
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.walletKeys.publicKey,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    const user = await authenticateUser(username, password);
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.walletKeys.publicKey,
      },
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({
    user: {
      id: req.user!.userId,
      username: req.user!.username,
      publicKey: req.wallet!.publicKey,
      balance: Wallet.calculateBalance({
        chain: blockchain.chain,
        address: req.wallet!.publicKey,
      }),
    },
  });
});

// --- Public Blockchain Routes ---

app.get('/api/blocks', (_req, res) => {
  res.json(blockchain.chain);
});

app.get('/api/blocks/length', (_req, res) => {
  res.json(blockchain.chain.length);
});

// --- Protected Routes ---

app.get('/api/wallet', authMiddleware, (req: AuthRequest, res) => {
  const address = req.wallet!.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({ chain: blockchain.chain, address }),
  });
});

app.post('/api/transact', authMiddleware, (req: AuthRequest, res) => {
  const { amount, recipient } = req.body;
  const wallet = req.wallet!;

  let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
    return;
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool', authMiddleware, (_req, res) => {
  res.json(transactionPool.transactionMap);
});

app.post('/api/mine-transactions', authMiddleware, (req: AuthRequest, res) => {
  const wallet = req.wallet!;
  const miner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });
  miner.mineTransactions();
  res.json({ success: true, blockCount: blockchain.chain.length });
});

// --- Start Server ---

const DEFAULT_PORT = 3001;
let PEER_PORT: number | undefined;

if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || Number(process.env.PORT) || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});

export default app;
