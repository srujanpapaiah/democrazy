import { useMemo, useState } from 'react';

import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

import Block from './Block';
import StatusMessage from './StatusMessage';

const PAGE_SIZE = 5;

export default function Blocks() {
  const { data: blocks, error, isLoading, refetch } = useApi(() => api.getBlocks());
  const [page, setPage] = useState(0);

  const allBlocks = useMemo(() => blocks ?? [], [blocks]);
  const pageCount = Math.max(1, Math.ceil(allBlocks.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const visible = useMemo(
    () => allBlocks.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [allBlocks, safePage]
  );

  return (
    <section className="stack">
      <div className="page-heading">
        <h1 className="h4 mb-0">Blocks</h1>
        {allBlocks.length > 0 && (
          <span className="text-secondary">{allBlocks.length} on this chain</span>
        )}
      </div>

      <StatusMessage
        isLoading={isLoading}
        error={error}
        label="blocks"
        onRetry={() => void refetch()}
      />

      {visible.map((block, offset) => (
        <Block key={block.hash} block={block} index={safePage * PAGE_SIZE + offset} />
      ))}

      {pageCount > 1 && (
        <nav className="pagination" aria-label="Block pages">
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            onClick={() => setPage(current => Math.max(0, current - 1))}
            disabled={safePage === 0}
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))}
            disabled={safePage >= pageCount - 1}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
