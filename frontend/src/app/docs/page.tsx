import Link from 'next/link';

const topics = [
  { href: '/docs/blockchain', title: 'What is Blockchain?', desc: 'Understand the distributed ledger technology that powers Bitcoin and cryptocurrencies.' },
  { href: '/docs/proof-of-work', title: 'Proof of Work', desc: 'Learn how miners compete to solve cryptographic puzzles and secure the network.' },
  { href: '/docs/transactions', title: 'Transactions', desc: 'How value is transferred between wallets using digital signatures and output maps.' },
  { href: '/docs/mining', title: 'Mining', desc: 'The process of validating transactions and adding new blocks to the chain.' },
  { href: '/docs/wallets', title: 'Wallets & Keys', desc: 'Public-key cryptography, key pairs, and how wallets control your funds.' },
];

export default function DocsIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Democrazy Documentation</h1>
      <p className="text-slate-400 mb-8 max-w-2xl">
        Democrazy is a JavaScript-based Proof-of-Work blockchain that replicates the consensus mechanism used in Bitcoin.
        This documentation explains every concept from the ground up.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map((t) => (
          <Link key={t.href} href={t.href} className="group bg-surface-2 border border-surface-border rounded-xl p-5 hover:border-blue-500/30 transition-colors">
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">{t.title}</h3>
            <p className="text-sm text-slate-500">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
