'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

export default function TransactPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-surface-border border-t-blue-500 rounded-full animate-spin" /></div>;
  if (!user) { router.push('/auth/login'); return null; }

  const handleSubmit = async () => {
    if (!recipient.trim()) { setStatus({ type: 'error', message: 'Enter a recipient address.' }); return; }
    if (!amount || Number(amount) <= 0) { setStatus({ type: 'error', message: 'Enter a valid amount.' }); return; }

    setSubmitting(true);
    setStatus(null);

    try {
      await api.transactions.create(recipient, Number(amount));
      setStatus({ type: 'success', message: 'Transaction submitted!' });
      setTimeout(() => router.push('/pool'), 1000);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Send Transaction</h1>
        <p className="text-sm text-slate-500">Transfer tokens to another wallet address</p>
      </div>

      <div className="max-w-md mx-auto bg-surface-2 border border-surface-border rounded-xl p-6">
        {status && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {status.message}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Recipient Address</label>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Enter wallet address..." className="w-full bg-black/25 border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors" />
        </div>
        <div className="mb-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="1" placeholder="0" className="w-full bg-black/25 border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors" />
        </div>
        <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Send Transaction'}
        </button>
        <div className="text-center mt-3">
          <Link href="/pool" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">View Transaction Pool</Link>
        </div>
      </div>
    </div>
  );
}
