export interface User {
  id: string;
  username: string;
  email?: string;
  publicKey: string;
  balance?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WalletInfo {
  address: string;
  balance: number;
}

export interface BlockData {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: TransactionData[];
  nonce: number;
  difficulty: number;
}

export interface TransactionData {
  id: string;
  outputMap: { [address: string]: number };
  input: {
    timestamp?: number;
    amount?: number;
    address: string;
    signature?: any;
  };
}
