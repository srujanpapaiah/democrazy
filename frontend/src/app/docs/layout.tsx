'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/blockchain', label: 'What is Blockchain?' },
  { href: '/docs/proof-of-work', label: 'Proof of Work' },
  { href: '/docs/transactions', label: 'Transactions' },
  { href: '/docs/mining', label: 'Mining' },
  { href: '/docs/wallets', label: 'Wallets & Keys' },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8">
      <aside className="w-52 shrink-0 hidden md:block">
        <div className="sticky top-20 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Documentation</div>
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className={`block px-3 py-2 rounded-lg text-sm transition-colors ${pathname === s.href ? 'text-blue-400 bg-blue-500/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {s.label}
            </Link>
          ))}
        </div>
      </aside>
      <article className="flex-1 min-w-0 prose-invert max-w-none">
        {children}
      </article>
    </div>
  );
}
