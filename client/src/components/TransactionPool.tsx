import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

import StatusMessage from './StatusMessage';
import Transaction from './Transaction';

const POLL_INTERVAL_MS = 10_000;

export default function TransactionPool() {
  const navigate = useNavigate();
  const { data, error, isLoading, refetch } = useApi(
    () => api.getTransactionPool(),
    POLL_INTERVAL_MS
  );

  const [mineError, setMineError] = useState<string | null>(null);
  const [isMining, setIsMining] = useState(false);

  const transactions = Object.values(data ?? {});

  async function handleMine(): Promise<void> {
    setMineError(null);
    setIsMining(true);
    try {
      await api.mineTransactions();
      void navigate('/blocks');
    } catch (caught) {
      setMineError(caught instanceof Error ? caught.message : 'Mining failed.');
    } finally {
      setIsMining(false);
    }
  }

  return (
    <section className="stack">
      <div className="page-heading">
        <h1 className="h4 mb-0">Transaction pool</h1>
        <span className="text-secondary">
          {transactions.length} pending · refreshes every {POLL_INTERVAL_MS / 1000}s
        </span>
      </div>

      <StatusMessage
        isLoading={isLoading}
        error={error}
        label="the transaction pool"
        onRetry={() => void refetch()}
      />

      {!isLoading && !error && transactions.length === 0 && (
        <p className="panel text-secondary mb-0">
          No pending transactions. Send some currency to fill the pool.
        </p>
      )}

      {transactions.map(transaction => (
        <div key={transaction.id} className="panel">
          <Transaction transaction={transaction} />
        </div>
      ))}

      {mineError && (
        <p className="status status--error" role="alert">
          {mineError}
        </p>
      )}

      <div>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => void handleMine()}
          disabled={isMining}
        >
          {isMining ? 'Mining…' : 'Mine the transactions'}
        </button>
        <p className="text-secondary mt-2 mb-0">
          Mining seals the pending transactions into a block and pays this node the
          reward.
        </p>
      </div>
    </section>
  );
}
