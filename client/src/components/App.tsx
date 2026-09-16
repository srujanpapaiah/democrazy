import { Link } from 'react-router-dom';

import { api } from '../api/client';
import logo from '../assets/logo.png';
import { useApi } from '../hooks/useApi';

import StatusMessage from './StatusMessage';

const WALLET_POLL_MS = 15_000;

export default function App() {
  const {
    data: wallet,
    error,
    isLoading,
    refetch,
  } = useApi(() => api.getWalletInfo(), WALLET_POLL_MS);

  return (
    <section className="stack">
      <div className="hero">
        <img className="hero-logo" src={logo} alt="" width={96} height={96} />
        <h1>Democrazy</h1>
        <p className="text-secondary">
          A proof-of-work blockchain. Mine blocks, send currency between wallets and
          watch the chain converge across peers.
        </p>
      </div>

      <div className="panel">
        <h2 className="panel-title">This node&rsquo;s wallet</h2>

        <StatusMessage
          isLoading={isLoading}
          error={error}
          label="wallet"
          onRetry={() => void refetch()}
        />

        {wallet && (
          <dl className="wallet-info">
            <dt>Balance</dt>
            <dd className="balance">{wallet.balance.toLocaleString()}</dd>

            <dt>Address</dt>
            <dd>
              <code className="address" title={wallet.address}>
                {wallet.address}
              </code>
            </dd>
          </dl>
        )}
      </div>

      <div className="card-grid">
        <Link to="/blocks" className="action-card">
          <h3>Blocks</h3>
          <p>Browse every mined block and the transactions inside it.</p>
        </Link>
        <Link to="/conduct-transaction" className="action-card">
          <h3>Send currency</h3>
          <p>Sign a transfer from this wallet to any address.</p>
        </Link>
        <Link to="/transaction-pool" className="action-card">
          <h3>Transaction pool</h3>
          <p>See pending transactions and mine them into a block.</p>
        </Link>
      </div>
    </section>
  );
}
