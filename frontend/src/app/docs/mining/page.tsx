export default function MiningPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Mining</h1>
      <p className="text-slate-400 mb-8">
        The complete flow of collecting transactions, constructing blocks, and earning rewards.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">The Mining Flow</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Mining in Democrazy follows a well-defined pipeline. When a miner decides to mine, the
        system executes these steps in order:
      </p>
      <ol className="list-decimal list-inside text-slate-300 mb-4 space-y-2">
        <li>Collect all valid transactions from the <strong>transaction pool</strong>.</li>
        <li>Append a <strong>reward transaction</strong> that pays the miner 50 tokens.</li>
        <li>Mine a new block containing those transactions (find a valid nonce).</li>
        <li>Broadcast the updated chain to all peers on the network.</li>
        <li>Clear the local transaction pool of mined transactions.</li>
      </ol>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`class TransactionMiner {
  mineTransactions() {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(
      Transaction.rewardTransaction({ minerWallet: this.wallet })
    );
    this.blockchain.addBlock({ data: validTransactions });
    this.pubsub.broadcastChain();
    this.transactionPool.clear();
  }
}`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Block Structure</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Every block in the Democrazy chain contains six fields that together guarantee integrity
        and ordering:
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
        <pre>{`{
  timestamp:  1698271200000,       // ms since epoch when block was mined
  lastHash:   '0x7f3a…',          // hash of the previous block
  hash:       '0xb2e1…',          // SHA-256 hash of this block's contents
  nonce:      184729,              // value iterated to solve the PoW puzzle
  difficulty: 4,                   // number of leading binary zeros required
  data:       [ tx1, tx2, … ]     // array of transactions included in this block
}`}</pre>
      </div>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The <code className="text-blue-400">hash</code> is derived from all other fields:
        <code className="text-blue-400"> cryptoHash(timestamp, lastHash, data, nonce, difficulty)</code>.
        Any change to any field produces an entirely different hash, making tampering detectable.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Transaction Pool</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Before transactions are mined, they live in a <strong>transaction pool</strong> — a
        temporary holding area shared across nodes. When a wallet creates or updates a transaction,
        it is broadcast to the pool on every peer. Miners draw from this pool when constructing a
        block. Only transactions that pass validation (correct signature and balanced outputs) are
        included.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">The Transaction Miner</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Democrazy encapsulates the mining workflow in a <code className="text-blue-400">TransactionMiner</code> class
        that wires together four dependencies: the blockchain instance, the transaction pool, the
        miner's wallet, and the pub/sub network layer. Calling <code className="text-blue-400">mineTransactions()</code> orchestrates
        the entire pipeline — from pulling valid transactions to broadcasting the new chain —
        in a single method call.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Incentive Structure</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Miners are rewarded with <strong>50 tokens</strong> (the <code className="text-blue-400">MINING_REWARD</code>)
        for every block they successfully mine. This reward is the only mechanism for creating new
        tokens and serves two purposes: it compensates miners for the computational resources they
        expend and it distributes new tokens into the economy over time.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Chain Replacement</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        When a peer receives a newly broadcast chain, it checks whether the incoming chain is
        longer than its current chain and whether every block is valid. If both conditions are met,
        the node replaces its chain. This <strong>longest valid chain</strong> rule is how the
        network converges on a single source of truth without a central coordinator.
      </p>
    </div>
  );
}
