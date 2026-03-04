'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BlockData } from '@/types';
import Block from '@/components/Block';

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.blocks.getAll().then((b) => { setBlocks(b); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Block Explorer</h1>
        <p className="text-sm text-slate-500">{blocks.length > 0 ? `${blocks.length} blocks on the chain` : 'Loading...'}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 text-slate-500">
          <div className="w-8 h-8 border-2 border-surface-border border-t-blue-500 rounded-full animate-spin mb-3" />
          Loading blockchain...
        </div>
      ) : (
        [...blocks].reverse().map((block, i) => (
          <Block key={block.hash} block={block} index={blocks.length - 1 - i} total={blocks.length} />
        ))
      )}
    </div>
  );
}
