import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseApiResult<T> {
  data: T | undefined;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Loads data from the node, tracking loading and error state.
 *
 * Pass `pollMs` to keep the data fresh — the transaction pool changes as peers
 * broadcast. The fetcher is held in a ref so callers can pass an inline arrow
 * function without the effect re-subscribing on every render.
 */
export function useApi<T>(fetcher: () => Promise<T>, pollMs?: number): UseApiResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      if (!isMountedRef.current) return;
      setData(result);
      setError(null);
    } catch (caught) {
      if (!isMountedRef.current) return;
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    if (!pollMs) return;

    const intervalId = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(intervalId);
  }, [load, pollMs]);

  return { data, error, isLoading, refetch: load };
}
