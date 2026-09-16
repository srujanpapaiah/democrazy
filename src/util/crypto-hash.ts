import { createHash } from 'node:crypto';

/**
 * Hashes its arguments with SHA-256, returning a hex digest.
 *
 * Inputs are sorted before hashing so that argument order does not affect the
 * result — callers across the codebase pass a block's fields in different
 * orders, and every one of them must agree on the hash.
 */
export function cryptoHash(...inputs: unknown[]): string {
  return createHash('sha256')
    .update(
      inputs
        .map(input => JSON.stringify(input))
        .sort()
        .join(' ')
    )
    .digest('hex');
}
