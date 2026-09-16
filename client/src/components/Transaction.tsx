import type { Transaction as TransactionModel } from '../types';

interface Props {
  transaction: TransactionModel;
}

const REWARD_ADDRESS = '*authorized-reward*';

function truncate(address: string): string {
  return address.length > 24 ? `${address.slice(0, 24)}…` : address;
}

/** One transfer: who signed it, and who received what. */
export default function Transaction({ transaction }: Props) {
  const { input, outputMap } = transaction;
  const isReward = input.address === REWARD_ADDRESS;

  return (
    <article className="transaction">
      <header className="transaction-from">
        {isReward ? (
          <span className="badge-reward">Mining reward</span>
        ) : (
          <>
            <span className="label">From</span>
            <code className="address" title={input.address}>
              {truncate(input.address)}
            </code>
            {input.amount !== undefined && (
              <span className="text-secondary">balance {input.amount}</span>
            )}
          </>
        )}
      </header>

      <ul className="transaction-outputs">
        {Object.entries(outputMap).map(([recipient, amount]) => (
          <li key={recipient}>
            <span className="label">To</span>
            <code className="address" title={recipient}>
              {truncate(recipient)}
            </code>
            <span className="amount">{amount}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
