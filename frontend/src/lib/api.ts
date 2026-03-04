const API_BASE = '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  auth: {
    register: (username: string, email: string, password: string) =>
      request<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      }),
    login: (username: string, password: string) =>
      request<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    me: () => request<{ user: any }>('/api/auth/me'),
  },
  blocks: {
    getAll: () => request<any[]>('/api/blocks'),
    getLength: () => request<number>('/api/blocks/length'),
  },
  wallet: {
    getInfo: () => request<{ address: string; balance: number }>('/api/wallet'),
  },
  transactions: {
    create: (recipient: string, amount: number) =>
      request<{ type: string; transaction: any }>('/api/transact', {
        method: 'POST',
        body: JSON.stringify({ recipient, amount }),
      }),
    getPool: () => request<Record<string, any>>('/api/transaction-pool'),
    mine: () => request<{ success: boolean; blockCount: number }>('/api/mine-transactions', { method: 'POST' }),
  },
};
