'use client';

import { useState } from 'react';
import { BlockData } from '@/types';
import Transaction from './Transaction';

export default function Block({ block, index, total }: { block: BlockData; index: number; total: number }) {
  const [expanded, setExpanded] = useState(false);
  const blockNum = total - index;
  const isGenesis = index === 0;
  const txCount = block.data.length;
  const hashDisplay = `${block.hash.substring(0, 16)}...${block.hash.slice(-8)}`;

  return (
    <div className="bg-surface-2 border border-surface-border rounded-xl p-4 mb-2 transition-colors hover:border-blue-500/20">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => txCount > 0 && setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
            {isGenesis ? 'G' : blockNum}
          </div>
          <div>
            <div className="font-mono text-sm text-slate-300">{hashDisplay}</div>
            <div className="text-xs text-slate-500">{isGenesis ? 'Genesis Block' : new Date(block.timestamp).toLocaleString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isGenesis && <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">Genesis</span>}
          {txCount > 0 && <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{txCount} tx{txCount !== 1 ? 's' : ''}</span>}
          {txCount > 0 && (
            <button className="text-xs font-medium text-slate-400 border border-surface-border px-2.5 py-1 rounded-lg hover:text-blue-400 hover:border-blue-500/40 transition-colors">
              {expanded ? 'Hide' : 'View'}
            </button>
          )}
        </div>
      </div>
      {expanded && txCount > 0 && (
        <div className="mt-3 pt-3 border-t border-surface-border space-y-2">
          {block.data.map((tx) => <Transaction key={tx.id} transaction={tx} />)}
        </div>
      )}
    </div>
  );
}
