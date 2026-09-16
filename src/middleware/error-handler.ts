import type { NextFunction, Request, Response } from 'express';

/** An error carrying the HTTP status it should be reported with. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Rejects unknown `/api/*` paths with JSON rather than the SPA fallback. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ type: 'error', message: 'Not found' });
}

/**
 * Converts thrown errors into JSON responses.
 *
 * Unexpected errors are logged in full but reported generically, so internal
 * details and stack traces never reach a client.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ type: 'error', message: error.message });
    return;
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ type: 'error', message: 'Internal server error' });
}
