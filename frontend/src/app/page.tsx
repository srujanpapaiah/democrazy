'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

export default function Home() {
  const { user, loading } = useAuth();
  const [wallet, setWallet] = useState<{ address: string; balance: number } | null>(null);
  const [blockCount, setBlockCount] = useState<number | null>(null);

  useEffect(() => {
    api.blocks.getAll().then((b) => setBlockCount(b.length)).catch(() => {});
    if (user) {
      api.wallet.getInfo().then(setWallet).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-surface-border border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="relative rounded-2xl border border-surface-border bg-gradient-to-br from-surface-0 via-[#1a1040] to-surface-0 p-10 text-center mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.06),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.06),transparent_50%)]" />
        <div className="relative">
          <h1 className="text-4xl font-bold mb-2">Welcome to <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Democrazy</span></h1>
          <p className="text-slate-400 max-w-lg mx-auto mb-6">A JavaScript Proof-of-Work blockchain. Explore blocks, send transactions, and mine rewards.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {user ? (
              <>
                <Link href="/transact" className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity">Send Transaction</Link>
                <Link href="/blocks" className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-surface-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors">Explore Blocks</Link>
                <Link href="/pool" className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-surface-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors">Transaction Pool</Link>
              </>
            ) : (
              <>
                <Link href="/auth/register" className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity">Create Account</Link>
                <Link href="/blocks" className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-surface-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors">Explore Blocks</Link>
                <Link href="/docs" className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-surface-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors">Read Docs</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-2 border border-surface-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold">{blockCount ?? '...'}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">Total Blocks</div>
        </div>
        <div className="bg-surface-2 border border-surface-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-emerald-400">{wallet ? wallet.balance : user ? '...' : '--'}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">Your Balance</div>
        </div>
        <div className="bg-surface-2 border border-surface-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-purple-400">50</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">Mining Reward</div>
        </div>
      </div>

      {user && wallet && (
        <div className="bg-surface-2 border border-surface-border rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Your Wallet</div>
          <div className="font-mono text-xs text-slate-400 bg-black/20 border border-white/5 rounded-lg p-3 break-all">{wallet.address}</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{wallet.balance}</span>
            <span className="text-sm text-slate-500">tokens</span>
          </div>
        </div>
      )}
    </div>
  );
}
