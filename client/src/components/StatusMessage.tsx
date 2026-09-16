interface Props {
  isLoading: boolean;
  error: string | null;
  /** What is being loaded, e.g. "blocks" — used in the loading announcement. */
  label: string;
  onRetry?: () => void;
}

/**
 * Shared loading and error presentation.
 *
 * Both states are announced to assistive technology: a spinner nobody is told
 * about looks identical to a page that has silently frozen.
 */
export default function StatusMessage({ isLoading, error, label, onRetry }: Props) {
  if (isLoading) {
    return (
      <p className="status status--loading" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading {label}…
      </p>
    );
  }

  if (error) {
    return (
      <div className="status status--error" role="alert">
        <span>{error}</span>
        {onRetry && (
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}
