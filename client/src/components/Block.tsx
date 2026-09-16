import { useId, useState } from 'react';

import { blockTransactions, type Block as BlockModel } from '../types';

import Transaction from './Transaction';

interface Props {
  block: BlockModel;
  index: number;
}

export default function Block({ block, index }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = useId();

  const transactions = blockTransactions(block);
  const hasTransactions = transactions.length > 0;

  return (
    <article className="panel block">
      <header className="block-header">
        <span className="block-index">#{index}</span>
        <time dateTime={new Date(block.timestamp).toISOString()}>
          {new Date(block.timestamp).toLocaleString()}
        </time>
        <span className="block-difficulty">difficulty {block.difficulty}</span>
      </header>

      <dl className="block-meta">
        <dt>Hash</dt>
        <dd>
          <code className="hash" title={block.hash}>
            {block.hash}
          </code>
        </dd>
      </dl>

      {hasTransactions ? (
        <>
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            onClick={() => setIsExpanded(current => !current)}
            aria-expanded={isExpanded}
            aria-controls={detailsId}
          >
            {isExpanded ? 'Hide' : 'Show'} {transactions.length} transaction
            {transactions.length === 1 ? '' : 's'}
          </button>

          {isExpanded && (
            <div id={detailsId} className="block-transactions">
              {transactions.map(transaction => (
                <Transaction key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-secondary mb-0">
          <span className="label">Data</span> <code>{JSON.stringify(block.data)}</code>
        </p>
      )}
    </article>
  );
}
