import elliptic from 'elliptic';

import type { Signature } from '../types/index.js';

import { cryptoHash } from './crypto-hash.js';

const { ec: EC } = elliptic;

/** The secp256k1 curve — the same one Bitcoin uses. */
export const ec = new EC('secp256k1');

export interface VerifySignatureArgs {
  publicKey: string;
  data: unknown;
  signature: Signature;
}

/**
 * Checks that `signature` over `data` was produced by the private key paired
 * with `publicKey`.
 *
 * Returns false rather than throwing on a malformed key or signature: callers
 * are validating untrusted data off the network, where bad input is expected
 * rather than exceptional.
 */
export function verifySignature({
  publicKey,
  data,
  signature,
}: VerifySignatureArgs): boolean {
  try {
    return ec.keyFromPublic(publicKey, 'hex').verify(cryptoHash(data), signature);
  } catch {
    return false;
  }
}
