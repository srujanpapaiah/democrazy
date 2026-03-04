export default function WalletsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Wallets &amp; Cryptographic Keys</h1>
      <p className="text-slate-400 mb-8">
        How elliptic curve cryptography protects your identity and proves ownership of funds.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Elliptic Curve Cryptography</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Democrazy uses the <strong>secp256k1</strong> elliptic curve — the same curve used by
        Bitcoin — to generate key pairs. Elliptic curve cryptography (ECC) provides the same
        security level as RSA with much shorter key lengths, making it ideal for a blockchain
        where keys are embedded in every transaction and broadcast across the network.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Public &amp; Private Key Pairs</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Each wallet generates a random <strong>private key</strong> (a 256-bit integer) and derives
        a corresponding <strong>public key</strong> (a point on the secp256k1 curve). The public
        key serves as the wallet's address — it can be shared freely. The private key must remain
        secret because anyone who possesses it can sign transactions and spend the wallet's funds.
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Generate a key pair
const keyPair = ec.genKeyPair();
const publicKey  = keyPair.getPublic().encode('hex');
const privateKey = keyPair.getPrivate('hex');`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Digital Signatures</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        When a wallet creates a transaction, it <strong>signs</strong> the output map data using
        its private key. The signature is a pair of large numbers (r, s) that can only be produced
        by someone who knows the private key but can be <em>verified</em> by anyone who knows the
        public key. This is the core mechanism that prevents impersonation.
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`// Signing
const signature = keyPair.sign(cryptoHash(data));

// Verification (by any node)
const isValid = ec.keyFromPublic(publicKey, 'hex')
  .verify(cryptoHash(data), signature);`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Verifying Transaction Authenticity</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Every node on the network independently verifies each transaction before accepting it.
        Verification involves re-hashing the transaction's output map and checking the signature
        against the sender's public key. If the signature is invalid — meaning the data was
        tampered with or the signer doesn't hold the corresponding private key — the transaction
        is rejected.
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`const verifySignature = ({ publicKey, data, signature }) => {
  const key = ec.keyFromPublic(publicKey, 'hex');
  return key.verify(cryptoHash(data), signature);
};`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Wallet Balance Calculation</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        A wallet's balance is not stored in a single location. Instead, Democrazy calculates it
        by scanning the chain from the <strong>most recent block backwards</strong>. It looks for
        the latest block that contains an output for the wallet's address and uses that output
        amount plus any outputs received in subsequent blocks. If no outputs exist on chain, the
        wallet defaults to the <code className="text-blue-400">STARTING_BALANCE</code> of <strong>1000 tokens</strong>.
      </p>
      <div className="bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm text-slate-300 mb-4">
        <pre>{`static calculateBalance({ chain, address }) {
  let outputsTotal = 0;
  let hasConductedTransaction = false;

  for (let i = chain.length - 1; i > 0; i--) {
    const block = chain[i];
    for (const transaction of block.data) {
      if (transaction.input.address === address) {
        hasConductedTransaction = true;
      }
      if (transaction.outputMap[address]) {
        outputsTotal += transaction.outputMap[address];
      }
    }
    if (hasConductedTransaction) break;
  }

  return hasConductedTransaction
    ? outputsTotal
    : STARTING_BALANCE + outputsTotal;
}`}</pre>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-white">Security Considerations</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The security of the entire system rests on the assumption that deriving a private key from
        a public key is computationally infeasible. The secp256k1 curve provides approximately
        128 bits of security, meaning a brute-force attack would require roughly 2¹²⁸ operations —
        far beyond what any existing or foreseeable computer can achieve.
      </p>
    </div>
  );
}
