export default function TransactionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Transactions</h1>
      <p className="text-slate-400 mb-8">
        How value moves between wallets using output maps, digital signatures, and validation rules.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">The Output Map Model</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Democrazy uses a UTXO-like <strong>output map</strong> to track who receives what in each
        transaction. The <code className="text-blue-400">outputMap</code> is a plain object whose
        keys are wallet addresses and whose values are the amounts each address receives. Every
        transaction explicitly records where the funds go — including the sender's own change output.
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`// Example outputMap
{
  "recipient-address": 50,
  "sender-address":   950   // change returned to sender
}
// sender had 1000, sent 50, keeps 950`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Sender Change Output</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        When a sender spends tokens, the remaining balance is explicitly routed back to their own
        address inside the same <code className="text-blue-400">outputMap</code>. The starting
        balance in Democrazy is <strong>1000 tokens</strong>. If a wallet with 1000 tokens sends
        200 to a recipient, the output map will contain 200 for the recipient and 800 as change
        for the sender.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Transaction Input</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Each transaction also carries an <code className="text-blue-400">input</code> object that
        records the sender's public key, their balance at the time of signing, and the digital
        signature. The input is what allows the network to verify the transaction's authenticity.
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`input: {
  timestamp: 1698271200000,
  amount:    1000,              // sender's balance at signing time
  address:   '04a1b2c3…',      // sender's public key
  signature: { r: '…', s: '…' }
}`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Validation Rules</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        A transaction is valid only if two conditions hold:
      </p>
      <ul className="list-disc list-inside text-slate-300 mb-4 space-y-1">
        <li>
          <strong>Signature verification</strong> — the signature in the input must be verifiable
          with the sender's public key against the output map data.
        </li>
        <li>
          <strong>Output total check</strong> — the sum of all values in the output map must equal
          the sender's input amount. No tokens can be created or destroyed in a normal transaction.
        </li>
      </ul>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`const validTransactionData = ({ transaction }) => {
  const { input: { address, amount, signature }, outputMap } = transaction;
  const outputTotal = Object.values(outputMap)
    .reduce((total, amount) => total + amount, 0);

  if (outputTotal !== amount) return false;
  if (!verifySignature({ publicKey: address, data: outputMap, signature })) return false;
  return true;
};`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Updating Transactions</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Before a transaction is mined into a block, the sender can update it to send additional
        amounts to new recipients. Each update recalculates the sender's change output, re-signs
        the transaction, and generates a fresh input timestamp. This allows batching multiple
        sends into one transaction.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Reward Transactions</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        When a miner successfully mines a block, a special <strong>reward transaction</strong> is
        created. This transaction has no real sender — its input address is set to a special
        marker (<code className="text-blue-400">*authorized-reward*</code>). The output map grants
        the miner a <code className="text-blue-400">MINING_REWARD</code> of <strong>50 tokens</strong>.
        Reward transactions are the only way new tokens enter circulation.
      </p>
    </div>
  );
}
