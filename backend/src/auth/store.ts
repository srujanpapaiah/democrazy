import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v1 as uuidv1 } from 'uuid';
import { UserRecord } from '../types';
import Wallet from '../wallet';

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const ensureDataDir = (): void => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf-8');
  }
};

const readUsers = (): UserRecord[] => {
  ensureDataDir();
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
};

const writeUsers = (users: UserRecord[]): void => {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

export const createUser = async (username: string, email: string, password: string): Promise<UserRecord> => {
  const users = readUsers();

  if (users.find((u) => u.username === username)) {
    throw new Error('Username already taken');
  }
  if (users.find((u) => u.email === email)) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const wallet = new Wallet();

  const user: UserRecord = {
    id: uuidv1(),
    username,
    email,
    passwordHash,
    walletKeys: {
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    },
    createdAt: Date.now(),
  };

  users.push(user);
  writeUsers(users);
  return user;
};

export const authenticateUser = async (username: string, password: string): Promise<UserRecord> => {
  const users = readUsers();
  const user = users.find((u) => u.username === username);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  return user;
};

export const findUserById = (userId: string): UserRecord | undefined => {
  const users = readUsers();
  return users.find((u) => u.id === userId);
};

export const getAllUsers = (): UserRecord[] => {
  return readUsers();
};
