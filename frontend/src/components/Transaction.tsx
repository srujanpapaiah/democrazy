'use client';

import { TransactionData } from '@/types';

export default function Transaction({ transaction }: { transaction: TransactionData }) {
  const { input, outputMap } = transaction;
  const isMiningReward = input.address === '*authorized-reward*';
  const recipients = Object.keys(outputMap);

  if (isMiningReward) {
    const miner = recipients[0];
    return (
      <div className="bg-black/20 border border-white/5 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Mining Reward</span>
          <span className="font-mono font-semibold text-sm text-amber-400">+{outputMap[miner]}</span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">To</span>
          <span className="font-mono text-slate-400">{miner.substring(0, 24)}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 border border-white/5 rounded-lg p-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">From</span>
          <span className="font-mono text-slate-400">{input.address.substring(0, 24)}...</span>
        </div>
        <span className="text-slate-500 font-mono">Bal: {input.amount}</span>
      </div>
      {recipients.map((r) => (
        <div key={r} className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded-md px-3 py-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">{r === input.address ? 'Change' : 'To'}</span>
            <span className="font-mono text-slate-400">{r.substring(0, 20)}...</span>
          </div>
          <span className={`font-mono font-semibold ${r === input.address ? 'text-slate-500' : 'text-amber-400'}`}>{outputMap[r]}</span>
        </div>
      ))}
    </div>
  );
}
