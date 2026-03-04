export default function ProofOfWorkPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Proof of Work</h1>
      <p className="text-slate-400 mb-8">
        How miners compete to solve cryptographic puzzles and why that secures the network.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">The Mining Puzzle</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Proof of Work (PoW) requires miners to find a special number — called a <strong>nonce</strong> —
        such that when the block's data is hashed together with that nonce, the resulting hash meets
        a target requirement. In Democrazy, the hash must start with a certain number of leading
        zeros when represented in binary. The more leading zeros required, the harder the puzzle.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Cryptographic Hash Requirements</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Democrazy converts the SHA-256 hex digest to binary and checks whether the first
        N characters are zeros, where N is the current <code className="text-blue-400">difficulty</code>.
        Because SHA-256 output is uniformly distributed, each additional leading zero bit roughly
        doubles the expected number of nonce attempts.
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
        <pre>{`// Hex-to-binary conversion used in Democrazy
const hexToBinary = (hex) =>
  hex.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');

// Mining loop: increment nonce until hash meets difficulty
do {
  nonce++;
  timestamp = Date.now();
  difficulty = adjustDifficulty({ originalBlock: lastBlock, timestamp });
  hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
} while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Difficulty Adjustment</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        If blocks are mined too quickly, the network increases difficulty; if too slowly, it
        decreases. Democrazy targets a <code className="text-blue-400">MINE_RATE</code> of
        1000 ms per block. After each block, the algorithm compares the time elapsed since the
        previous block to the target:
      </p>
      <ul className="list-disc list-inside text-slate-300 mb-4 space-y-1">
        <li>If the block was mined in less than 1000 ms → difficulty increases by 1.</li>
        <li>If the block took longer than 1000 ms → difficulty decreases by 1 (minimum of 1).</li>
      </ul>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`const adjustDifficulty = ({ originalBlock, timestamp }) => {
  const { difficulty } = originalBlock;
  if (difficulty < 1) return 1;
  if (timestamp - originalBlock.timestamp < MINE_RATE) return difficulty + 1;
  return difficulty - 1;
};`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Why PoW Secures the Network</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        PoW makes rewriting history computationally expensive. To alter a past block, an attacker
        must re-mine that block <em>and</em> every block after it faster than the rest of the
        network produces new blocks. The honest chain will always outpace an attacker who controls
        less than half the network's hashing power.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">The 51% Attack</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        If a single entity controls more than 50% of the network's mining power, it can outpace the
        honest chain and perform a <strong>51% attack</strong>: double-spending coins, censoring
        transactions, or rewriting recent history. In practice this is prohibitively expensive on
        large networks like Bitcoin, but it remains a theoretical risk for smaller chains.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Energy Cost Tradeoff</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The computational work in PoW translates to real-world energy consumption. This is by design:
        expending energy makes attacks expensive. Critics argue the energy cost is wasteful, while
        proponents argue it provides an unforgeable, physics-backed security guarantee that no
        alternative consensus mechanism has yet fully replicated at Bitcoin's scale.
      </p>
    </div>
  );
}
