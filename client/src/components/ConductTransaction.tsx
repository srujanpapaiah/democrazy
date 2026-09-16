import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../api/client';

export default function ConductTransaction() {
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    const trimmedRecipient = recipient.trim();
    const parsedAmount = Number(amount);

    // Validated here as well as on the node so the user gets immediate
    // feedback instead of a round trip.
    if (!trimmedRecipient) {
      setError('Enter a recipient address.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.conductTransaction(trimmedRecipient, parsedAmount);
      void navigate('/transaction-pool');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel form-panel">
      <h1 className="h4">Send currency</h1>
      <p className="text-secondary">
        Signed by this node&rsquo;s wallet and broadcast to connected peers.
      </p>

      <form onSubmit={event => void handleSubmit(event)} noValidate>
        <div className="field">
          <label htmlFor="recipient">Recipient address</label>
          <input
            id="recipient"
            name="recipient"
            className="form-control"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="04a78366e95f9ceed375…"
            value={recipient}
            onChange={event => setRecipient(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            className="form-control"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="50"
            value={amount}
            onChange={event => setAmount(event.target.value)}
          />
        </div>

        {error && (
          <p className="status status--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-danger" disabled={isSubmitting}>
          {isSubmitting ? 'Signing…' : 'Send transaction'}
        </button>
      </form>
    </section>
  );
}
