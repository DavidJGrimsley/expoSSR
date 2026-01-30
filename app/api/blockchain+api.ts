import { createHash } from 'crypto';

type Block = {
  index: number;
  timestamp: string;
  data: string;
  previousHash: string;
  hash: string;
  nonce: number;
};

type BlockchainResponse = {
  success: boolean;
  chain?: Block[];
  block?: Block;
  error?: string;
};

const hashBlock = (index: number, timestamp: string, data: string, previousHash: string, nonce: number) => {
  return createHash('sha256')
    .update(`${index}|${timestamp}|${data}|${previousHash}|${nonce}`)
    .digest('hex');
};

const createGenesisBlock = (): Block => {
  const timestamp = new Date().toISOString();
  const data = 'Genesis block';
  const previousHash = '0';
  const nonce = 0;
  const hash = hashBlock(0, timestamp, data, previousHash, nonce);
  return { index: 0, timestamp, data, previousHash, hash, nonce };
};

// Use a simple file-backed chain for the demo so the chain grows across requests during development.
const getChainPath = async () => {
  const path = await import('path');
  return path.join(process.cwd(), 'temp', 'blockchain.json');
};

const readChain = async (): Promise<Block[]> => {
  try {
    const fs = await import('fs/promises');
    const chainPath = await getChainPath();
    const raw = await fs.readFile(chainPath, 'utf8').catch((err: any) => {
      if (err?.code === 'ENOENT') return null;
      throw err;
    });

    if (!raw) {
      const genesis = createGenesisBlock();
      await writeChain([genesis]);
      return [genesis];
    }

    try {
      const parsed = JSON.parse(raw) as Block[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const genesis = createGenesisBlock();
        await writeChain([genesis]);
        return [genesis];
      }
      return parsed;
    } catch (err) {
      console.warn('[Blockchain API] Failed to parse chain JSON, recreating genesis.', err);
      const genesis = createGenesisBlock();
      await writeChain([genesis]);
      return [genesis];
    }
  } catch (err) {
    console.warn('[Blockchain API] readChain failed, falling back to memory.', err);
    return [createGenesisBlock()];
  }
};

const writeChain = async (next: Block[]) => {
  try {
    const fs = await import('fs/promises');
    const path = await getChainPath();
    const pth = await import('path');
    await fs.mkdir(pth.dirname(path), { recursive: true });
    await fs.writeFile(path, JSON.stringify(next, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Blockchain API] writeChain failed.', err);
  }
};

const createBlock = (data: string, previousBlock: Block): Block => {
  const index = previousBlock.index + 1;
  const timestamp = new Date().toISOString();
  const previousHash = previousBlock.hash;

  // Simple proof-of-work demo: find a nonce such that the hash begins with DIFFICULTY_PREFIX.
  // This is intentionally tiny for demo purposes. Increasing the prefix (e.g., '000') makes mining slower.
  const DIFFICULTY_PREFIX = '00';
  let nonce = 0;
  let hash = hashBlock(index, timestamp, data, previousHash, nonce);
  const MAX_ATTEMPTS = 200000; // safety cap to avoid long blocking

  while (!hash.startsWith(DIFFICULTY_PREFIX) && nonce < MAX_ATTEMPTS) {
    nonce += 1;
    hash = hashBlock(index, timestamp, data, previousHash, nonce);
  }

  // If we didn't find a qualifying hash under the cap, we still return the last hash & nonce.
  return { index, timestamp, data, previousHash, hash, nonce };
};

export async function GET() {
  const chain = await readChain();
  const response: BlockchainResponse = {
    success: true,
    chain,
  };

  return Response.json(response);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = typeof body?.data === 'string' && body.data.trim().length > 0 ? body.data.trim() : 'Sample payload';

    const chain = await readChain();
    const latest = chain[chain.length - 1];
    const block = createBlock(data, latest);
    const next = [...chain, block];
    await writeChain(next);

    const response: BlockchainResponse = {
      success: true,
      block,
      chain: next,
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('[Blockchain API] POST error:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to create block.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const genesis = createGenesisBlock();
    await writeChain([genesis]);
    return Response.json({ success: true, chain: [genesis] });
  } catch (error) {
    console.error('[Blockchain API] DELETE error:', error);
    return Response.json({ success: false, error: 'Failed to clear chain.' }, { status: 500 });
  }
}
