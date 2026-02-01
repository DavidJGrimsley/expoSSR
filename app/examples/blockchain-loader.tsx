import Head from 'expo-router/head';
import { useLoaderData } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// ensure ActivityIndicator is considered "used" by linters/TS when JSX detection may fail
void ActivityIndicator;

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

type LoaderRequest = {
  url?: string;
};

function getRequestOrigin(request?: LoaderRequest) {
  if (!request?.url) return null;
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

export async function loader(request: LoaderRequest | undefined) {
  const origin = getRequestOrigin(request);
  
  if (!origin) {
    return {
      success: true,
      chain: [] as Block[],
    };
  }

  try {
    const response = await fetch(`${origin}/api/blockchain`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: BlockchainResponse = await response.json();
    return result;
  } catch (error) {
    console.error('[Blockchain Loader] Error fetching chain:', error);
    return {
      success: false,
      chain: [] as Block[],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default function BlockchainLoaderExample() {
  const initialData = useLoaderData<typeof loader>();
  const [chain, setChain] = useState<Block[]>(initialData.chain ?? []);
  const [creating, setCreating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(initialData.error ?? null);

  const fetchChain = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/blockchain');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BlockchainResponse = await response.json();
      if (!result.success || !result.chain) {
        throw new Error(result.error || 'Failed to load chain');
      }

      setChain(result.chain);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  }, []);

  const addBlock = useCallback(async () => {
    try {
      setCreating(true);
      setError(null);
      const payload = `Sample payload ${new Date().toLocaleTimeString()}`;
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BlockchainResponse = await response.json();
      if (!result.success || !result.chain) {
        throw new Error(result.error || 'Failed to create block');
      }

      setChain(result.chain);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setCreating(false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Blockchain with Data Loader</title>
        <meta name="description" content="Data loader + blockchain operation example" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Blockchain Operation (Data Loader)</Text>

        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>💡 Data Loader + API Routes Pattern</Text>
          <Text style={styles.body}>
            This page demonstrates <Text style={styles.bold}>data loaders calling API routes</Text> for blockchain operations. The loader function runs server-side during SSR and calls the internal <Text style={styles.mono}>/api/blockchain</Text> route to fetch the existing chain. This provides instant server-rendered content on first load.
          </Text>
          <Text style={styles.body}>
            After the page loads, interactions (adding blocks, clearing the chain) use client-side fetch to the same API route. The API route accesses Node.js crypto APIs and performs proof-of-work mining server-side, which is impossible in React Native.
          </Text>
          <Text style={styles.caption}>
            <Text style={styles.bold}>Key benefits:</Text> Fast initial page load with SSR, access to Node.js-only libraries (crypto, web3, ethers), secure environment variables for RPC providers and private keys.
          </Text>
        </View>

        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>💡 Why This Requires API Routes</Text>
          <Text style={styles.body}>
            Blockchain libraries like <Text style={styles.mono}>web3.js</Text>, <Text style={styles.mono}>ethers.js</Text>, and the Node.js <Text style={styles.mono}>crypto</Text> module are NOT compatible with React Native. They rely on Node.js-specific APIs that do not exist in the JavaScript runtime used by Expo/React Native.
          </Text>
          <Text style={styles.body}>
            <Text style={styles.bold}>API Routes solve this problem.</Text> Because API routes run on a Node.js server (not in the app), you can use any Node.js library — including full blockchain SDKs, cryptographic signing, RPC providers (Infura, Alchemy), and private key management.
          </Text>
          <Text style={styles.body}>
            This demo shows how your Expo app UI can interact with server-side blockchain operations through simple HTTP requests, enabling features that would otherwise be impossible in a pure React Native app.
          </Text>
        </View>

        <View>
          <Text style={styles.subHeader}>What This Demo Shows</Text>
          <Text style={styles.body}>
            This is a simplified simulation demonstrating the core concept of linked blocks with proof-of-work mining. It runs entirely on the server via API routes — there is no peer-to-peer network, no real accounts, and no private keys used here.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• <Text style={styles.bold}>Background work:</Text> Mining (finding a hash with a specific pattern) happens server-side</Text>
            <Text style={styles.bullet}>• <Text style={styles.bold}>Server-only capabilities:</Text> Uses the Node.js crypto module (<Text style={styles.mono}>import {'{createHash}'} from &quot;crypto&quot;</Text>) for SHA-256 hashing</Text>
            <Text style={styles.bullet}>• <Text style={styles.bold}>Simple proof-of-work:</Text> Each block requires finding a nonce that produces a hash starting with 00</Text>
            <Text style={styles.bullet}>• <Text style={styles.bold}>Persistence:</Text> Chain is stored in a local file for development purposes</Text>
          </View>

          <Text style={styles.subHeader}>Important differences from real blockchain systems</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• <Text style={styles.bold}>Accounts & signing:</Text> Real blockchains require accounts and cryptographic signing with private keys. In production, private keys and RPC provider secrets must be stored securely in environment variables (e.g. <Text style={styles.mono}>.env</Text>) and never committed to source control.</Text>
            <Text style={styles.bullet}>• <Text style={styles.bold}>Network interaction:</Text> Real transactions are broadcast to a peer-to-peer network or submitted to an RPC provider (Infura, Alchemy, QuickNode) and require provider endpoints and API keys.</Text>
            <Text style={styles.bullet}>• <Text style={styles.bold}>Production complexity:</Text> Real systems must handle transaction confirmations, chain reorganizations, gas/fee estimation, nonce management, retries, and idempotency.</Text>
            <Text style={styles.bullet}>• <Text style={styles.bold}>Mining difficulty:</Text> Real blockchains use much higher difficulty (requiring significant compute power), while this demo uses a trivial prefix check for illustration.</Text>
          </View>

          <Text style={styles.body}>
            This demo stores the chain in a local file (<Text style={styles.mono}>temp/blockchain.json</Text>) so blocks persist while your dev server is running. On serverless platforms the filesystem may be ephemeral; for production use a database or secure state store.
          </Text>

          <Text style={styles.subHeader}>Understanding Proof-of-Work & Nonce</Text>
          <Text style={styles.body}>
            A <Text style={styles.bold}>nonce</Text> (number used once) is incremented during mining to find a hash that meets the difficulty requirement. Here is how it works:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>1. The miner starts with nonce = 0</Text>
            <Text style={styles.bullet}>2. It hashes the block data + nonce</Text>
            <Text style={styles.bullet}>3. If the hash does not meet the requirement (e.g., start with 00), increment nonce and try again</Text>
            <Text style={styles.bullet}>4. Repeat until a valid hash is found</Text>
          </View>
          <Text style={styles.body}>
            This demo uses a prefix of 00 (easy to find), but real blockchains like Bitcoin require many leading zeros, making mining computationally expensive and energy-intensive. The difficulty adjusts over time to maintain consistent block times.
          </Text>
          <Text style={styles.body}>
            The blockchain logic runs in <Text style={styles.mono}>/app/api/blockchain+api.ts</Text>, which executes on the Node.js server. This allows:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Access to Node.js <Text style={styles.mono}>crypto</Text> module for SHA-256 hashing</Text>
            <Text style={styles.bullet}>• File system operations (<Text style={styles.mono}>fs/promises</Text>) for persistence</Text>
            <Text style={styles.bullet}>• Ability to use full blockchain SDKs if needed (web3.js, ethers.js, @solana/web3.js)</Text>
            <Text style={styles.bullet}>• Secure environment variable access for keys and secrets</Text>
            <Text style={styles.bullet}>• Background processing without blocking the React Native UI</Text>
          </View>
          <Text style={styles.body}>
            Your Expo app simply makes HTTP requests to these API routes, keeping the UI responsive while complex operations happen server-side.
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.primaryButton, creating && styles.buttonDisabled]} onPress={addBlock} disabled={creating}>
            <Text style={styles.primaryButtonText}>{creating ? 'Adding...' : 'Add Block'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={fetchChain}>
            <Text style={styles.secondaryButtonText}>Refresh</Text>
          </Pressable>
          <Pressable
            style={[styles.dangerButton, clearing && styles.buttonDisabled]}
            onPress={async () => {
              if (!confirm('Clear chain? This will reset to the genesis block.')) return;
              try {
                setClearing(true);
                const res = await fetch('/api/blockchain', { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to clear chain');
                await fetchChain();
              } catch (err) {
                console.error(err);
                alert('Failed to clear chain');
              } finally {
                setClearing(false);
              }
            }}
          >
            <Text style={styles.dangerButtonText}>{clearing ? 'Clearing...' : 'Clear Chain'}</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={async () => {
              try {
                const res = await fetch('/api/blockchain');
                if (!res.ok) throw new Error('Failed to fetch chain');
                const payload = await res.json();
                const blob = new Blob([JSON.stringify(payload.chain ?? payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                window.open(url);
              } catch (err) {
                console.error(err);
                alert('Failed to export chain');
              }
            }}
          >
            <Text style={styles.secondaryButtonText}>Export Chain</Text>
          </Pressable>
        </View>
        <Text style={styles.smallNote}>Mining difficulty (demo): prefix 00 — higher values increase compute work and slow block creation.</Text>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>⚠️ Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Chain</Text>
          <Text style={styles.sectionSubtitle}>Each block stores the previous hash.</Text>
        </View>

        {chain.length === 0 && <Text style={styles.emptyText}>No blocks yet.</Text>}

        {chain.map((block) => (
          <View key={block.hash} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Block #{block.index}</Text>
              <Text style={styles.badge}>Nonce {block.nonce}</Text>
            </View>
            <Text style={styles.detailText}>Data: {block.data}</Text>
            <Text style={styles.detailText}>Hash: {block.hash}</Text>
            <Text style={styles.detailText}>Previous: {block.previousHash}</Text>
            <Text style={styles.timestamp}>Created: {new Date(block.timestamp).toLocaleTimeString()}</Text>
          </View>
        ))}

        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>📚 How This Works</Text>
          <View style={styles.stepList}>
            <Text style={styles.stepText}>
              <Text style={styles.stepNumber}>1.</Text> <Text style={styles.bold}>Loader Function (Server-Side):</Text> When you navigate to this page, the loader calls <Text style={styles.mono}>/api/blockchain</Text> on the server before rendering. The server returns the current blockchain.
            </Text>
            <Text style={styles.stepText}>
              <Text style={styles.stepNumber}>2.</Text> <Text style={styles.bold}>SSR with Data:</Text> React Native renders the page server-side with the blockchain data already populated. The HTML is sent to the browser instantly.
            </Text>
            <Text style={styles.stepText}>
              <Text style={styles.stepNumber}>3.</Text> <Text style={styles.bold}>Client Hydration:</Text> Once JavaScript loads, React takes over and makes the page interactive.
            </Text>
            <Text style={styles.stepText}>
              <Text style={styles.stepNumber}>4.</Text> <Text style={styles.bold}>Client-Side Interactions:</Text> Adding blocks and clearing the chain use client-side fetch to <Text style={styles.mono}>/api/blockchain</Text>, which performs proof-of-work mining server-side.
            </Text>
            <Text style={styles.stepText}>
              <Text style={styles.stepNumber}>5.</Text> <Text style={styles.bold}>Server-Only Operations:</Text> The API route accesses the Node.js crypto module and filesystem, which are unavailable in React Native.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fb' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1b1b1f', marginBottom: 12 },
  highlightCard: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  highlightTitle: { fontSize: 18, fontWeight: '700', color: '#1565c0', marginBottom: 4 },
  body: { fontSize: 15, color: '#444', lineHeight: 22 },
  bold: { fontWeight: '700', color: '#111' },
  subHeader: { fontSize: 16, fontWeight: '700', marginTop: 10, marginBottom: 6, color: '#111' },
  bulletList: { paddingLeft: 6, marginBottom: 10 },
  bullet: { fontSize: 14, color: '#444', marginBottom: 6, lineHeight: 20 },
  mono: { fontFamily: 'monospace', backgroundColor: '#e9ecef', paddingHorizontal: 4, borderRadius: 4 },
  caption: { fontSize: 13, color: '#555', lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  primaryButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  dangerButton: {
    borderWidth: 2,
    borderColor: '#d93025',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dangerButtonText: { color: '#d93025', fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryButtonText: { color: '#0066cc', fontWeight: '700' },
  smallNote: { color: '#6b6b6b', marginTop: 8, fontSize: 13 },
  errorCard: {
    borderWidth: 2,
    borderColor: '#d93025',
    backgroundColor: '#fff1f0',
    padding: 14,
    borderRadius: 12,
  },
  errorTitle: { fontWeight: '700', color: '#d93025', marginBottom: 6 },
  errorText: { color: '#7a1c1c' },
  sectionHeader: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1b1b1f' },
  sectionSubtitle: { color: '#666', marginTop: 4 },
  emptyText: { color: '#666', fontStyle: 'italic' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e5ef',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardTitle: { flex: 1, fontWeight: '700', color: '#1b1b1f' },
  badge: { color: '#0066cc', fontWeight: '700' },
  detailText: { marginTop: 6, color: '#333' },
  timestamp: { marginTop: 8, color: '#777', fontSize: 12 },
  explanationCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e5ef',
    padding: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  explanationTitle: { fontSize: 18, fontWeight: '700', color: '#1b1b1f', marginBottom: 12 },
  stepList: { gap: 12 },
  stepText: { fontSize: 14, color: '#444', lineHeight: 20 },
  stepNumber: { fontWeight: '700', color: '#0066cc' },
});
