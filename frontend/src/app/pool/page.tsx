'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { TransactionData } from '@/types';
import Transaction from '@/components/Transaction';

const POLL_MS = 10000;

export default function PoolPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pool, setPool] = useState<TransactionData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [mining, setMining] = useState(false);

  useEffect(() => {
    if (!user && !loading) return;
    const load = () => {
      api.transactions.getPool().then((m) => { setPool(Object.values(m)); setFetching(false); }).catch(() => setFetching(false));
    };
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [user, loading]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-surface-border border-t-blue-500 rounded-full animate-spin" /></div>;
  if (!user) { router.push('/auth/login'); return null; }

  const handleMine = async () => {
    setMining(true);
    try {
      await api.transactions.mine();
      router.push('/blocks');
    } catch {
      alert('Mining failed. Try again.');
    } finally {
      setMining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transaction Pool</h1>
          <p className="text-sm text-slate-500">{pool.length > 0 ? `${pool.length} pending` : 'Waiting for transactions...'}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/transact" className="px-4 py-2 text-sm font-medium border border-surface-border text-slate-400 rounded-lg hover:text-white hover:border-slate-500 transition-colors">New Transaction</Link>
          {pool.length > 0 && (
            <button onClick={handleMine} disabled={mining} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
              {mining ? 'Mining...' : 'Mine Transactions'}
            </button>
          )}
        </div>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center py-16 text-slate-500">
          <div className="w-8 h-8 border-2 border-surface-border border-t-blue-500 rounded-full animate-spin mb-3" />
          Loading pool...
        </div>
      ) : pool.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl opacity-40 mb-3">&#9878;</div>
          <p>No pending transactions</p>
          <Link href="/transact" className="text-sm text-blue-400 hover:underline mt-1 inline-block">Send a transaction</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {pool.map((tx) => <Transaction key={tx.id} transaction={tx} />)}
          <div className="text-center pt-4">
            <button onClick={handleMine} disabled={mining} className="px-6 py-3 font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
              {mining ? 'Mining...' : 'Mine All Transactions'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
