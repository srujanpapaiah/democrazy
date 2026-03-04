'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { router.push('/'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center mb-1">Sign In</h1>
        <p className="text-sm text-slate-500 text-center mb-6">Access your blockchain wallet</p>

        <form onSubmit={handleSubmit} className="bg-surface-2 border border-surface-border rounded-xl p-6 space-y-4">
          {error && <div className="p-3 rounded-lg text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-black/25 border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/25 border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-slate-500">
            No account? <Link href="/auth/register" className="text-blue-400 hover:underline">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
