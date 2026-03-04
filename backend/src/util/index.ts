import { ec as EC } from 'elliptic';
import { cryptoHash } from './crypto-hash';

const ec = new EC('secp256k1');

export const verifySignature = ({
  publicKey,
  data,
  signature,
}: {
  publicKey: string;
  data: any;
  signature: any;
}): boolean => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
  return keyFromPublic.verify(cryptoHash(data), signature);
};

export { ec, cryptoHash };
