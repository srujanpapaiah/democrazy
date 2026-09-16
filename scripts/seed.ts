/**
 * Seeds a running node with demo wallets, transactions and mined blocks.
 *
 * This used to run inline on every server start, which meant no node could
 * boot without first mining ten blocks. It is opt-in now:
 *
 *   npm run dev:server        # in one terminal
 *   npx tsx scripts/seed.ts   # in another
 */
const ROOT_NODE = process.env['ROOT_NODE_ADDRESS'] ?? 'http://localhost:3000';

const ROUNDS = 10;

async function post(endpoint: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${ROOT_NODE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POST ${endpoint} failed (${response.status}): ${text}`);
  }

  return response.json();
}

async function walletAddress(): Promise<string> {
  const response = await fetch(`${ROOT_NODE}/api/wallet-info`);
  if (!response.ok) {
    throw new Error(`Could not reach node at ${ROOT_NODE}. Is it running?`);
  }
  const info = (await response.json()) as { address: string };
  return info.address;
}

async function main(): Promise<void> {
  const address = await walletAddress();
  console.log(`Seeding node at ${ROOT_NODE}`);

  for (let round = 0; round < ROUNDS; round++) {
    await post('/api/transact', { recipient: `demo-recipient-${round}`, amount: 5 });
    await post('/api/mine-transactions');
    console.log(`  round ${round + 1}/${ROUNDS} mined`);
  }

  console.log(`Done. Node wallet: ${address.slice(0, 20)}…`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
