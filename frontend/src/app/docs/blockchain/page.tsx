export default function BlockchainPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">What is Blockchain?</h1>
      <p className="text-slate-400 mb-8">
        A deep dive into the distributed ledger technology that underpins Bitcoin and Democrazy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Definition</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        A blockchain is a continuously growing list of records — called <strong>blocks</strong> — that
        are linked together using cryptographic hashes. Each block contains a timestamp, transaction
        data, and a reference to the hash of the previous block, forming an immutable chain of data
        that no single party can alter without detection.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">How Blocks Are Linked</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Every block stores the hash of the block that came before it. This creates a directed chain:
        if someone tampers with an earlier block, its hash changes, which breaks the reference stored
        in the next block, and so on all the way to the tip of the chain. The network rejects any
        chain whose hashes are inconsistent.
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
        <pre>{`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Block 0     │     │  Block 1     │     │  Block 2     │
│  (Genesis)   │◄────│  lastHash: 0 │◄────│  lastHash: 1 │
│  hash: 0x3a… │     │  hash: 0x7f… │     │  hash: 0xb2… │
│  data: []    │     │  data: [tx…] │     │  data: [tx…] │
└──────────────┘     └──────────────┘     └──────────────┘`}</pre>
      </div>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Each arrow represents the <code className="text-blue-400">lastHash</code> pointer. Block 1
        stores the hash of Block 0, and Block 2 stores the hash of Block 1.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Immutability</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Because every block's hash depends on the data it contains <em>and</em> the hash of the
        previous block, changing even a single byte in an old block cascades through the entire
        chain. Recalculating all subsequent hashes requires more computational power than the rest
        of the honest network combined — making the chain practically tamper-proof.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Distributed Ledger</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        A blockchain is not stored in one place. Every node in the network keeps a full copy of
        the chain. When a new block is mined, it is broadcast to all peers. Each peer independently
        validates the block and appends it to its own copy. This redundancy means there is no
        single point of failure and no central authority.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">How Democrazy Implements It</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Democrazy starts with a hardcoded <strong>genesis block</strong> — the very first block
        in the chain — that every node agrees on. New blocks are hashed with <strong>SHA-256</strong>,
        the same algorithm used by Bitcoin. A chain is only considered valid if:
      </p>
      <ul className="list-disc list-inside text-slate-300 mb-4 space-y-1">
        <li>The first block matches the genesis block exactly.</li>
        <li>Every subsequent block's <code className="text-blue-400">lastHash</code> equals the previous block's <code className="text-blue-400">hash</code>.</li>
        <li>Re-hashing a block with its stored fields produces the stored hash.</li>
        <li>Difficulty has not been adjusted by more than 1 between consecutive blocks.</li>
      </ul>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`// Simplified chain validation
for (let i = 1; i < chain.length; i++) {
  const block = chain[i];
  const lastBlock = chain[i - 1];

  if (block.lastHash !== lastBlock.hash) return false;
  if (block.hash !== cryptoHash(/* fields */)) return false;
  if (Math.abs(lastBlock.difficulty - block.difficulty) > 1) return false;
}
return true;`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Why It Matters</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Blockchain removes the need for a trusted third party. Traditional databases rely on an
        administrator to guarantee integrity. A blockchain replaces that trust with mathematics:
        SHA-256 hashing, distributed consensus, and economic incentives that make cheating
        prohibitively expensive.
      </p>
    </div>
  );
}
