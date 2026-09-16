const NIBBLES: Readonly<Record<string, string>> = {
  '0': '0000',
  '1': '0001',
  '2': '0010',
  '3': '0011',
  '4': '0100',
  '5': '0101',
  '6': '0110',
  '7': '0111',
  '8': '1000',
  '9': '1001',
  a: '1010',
  b: '1011',
  c: '1100',
  d: '1101',
  e: '1110',
  f: '1111',
};

/**
 * Expands a hexadecimal string into its binary representation, four bits per
 * hex digit.
 *
 * Proof-of-work counts leading zero *bits*, not zero hex digits, which is what
 * makes difficulty adjustable one bit at a time. Unknown characters expand to
 * nothing, matching the `hex-to-binary` package this replaces.
 */
export function hexToBinary(hex: string): string {
  let binary = '';
  for (const char of hex.toLowerCase()) {
    binary += NIBBLES[char] ?? '';
  }
  return binary;
}
