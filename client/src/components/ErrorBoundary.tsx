import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes so one broken component does not blank the page.
 *
 * Must be a class: React exposes no hook equivalent of `componentDidCatch`.
 */
export default class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="app-shell">
        <main className="container py-5" role="alert">
          <h1 className="h4">Something went wrong</h1>
          <p className="text-secondary">
            The page failed to render. Reloading usually clears it.
          </p>
          <pre className="error-detail">{error.message}</pre>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </main>
      </div>
    );
  }
}
