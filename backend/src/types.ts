export interface BlockData {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: any[];
  nonce: number;
  difficulty: number;
}

export interface TransactionOutput {
  [address: string]: number;
}

export interface TransactionInput {
  timestamp: number;
  amount: number;
  address: string;
  signature: any;
}

export interface TransactionData {
  id: string;
  outputMap: TransactionOutput;
  input: TransactionInput | { address: string };
}

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  walletKeys: {
    publicKey: string;
    privateKey: string;
  };
  createdAt: number;
}

export interface AuthPayload {
  userId: string;
  username: string;
}
