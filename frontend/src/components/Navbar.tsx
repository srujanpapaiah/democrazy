'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? 'text-blue-400 bg-blue-500/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-border bg-surface-0/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white hover:text-blue-400 transition-colors">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">D</span>
          Democrazy
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/blocks" className={linkClass('/blocks')}>Blocks</Link>
          {user && (
            <>
              <Link href="/transact" className={linkClass('/transact')}>Transact</Link>
              <Link href="/pool" className={linkClass('/pool')}>Pool</Link>
            </>
          )}
          <Link href="/docs" className={linkClass('/docs')}>Docs</Link>

          <div className="w-px h-6 bg-surface-border mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">{user.username}</span>
              <button onClick={logout} className="px-3 py-1.5 text-xs font-medium text-slate-400 border border-surface-border rounded-lg hover:text-white hover:border-slate-500 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition-opacity">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
