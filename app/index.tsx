
'use client';

import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SessionData {
  payload: {
    issuedAt: number;
    nonce: string;
  };
  signature: string;
}

export default function Index() {
  // =========================================================================
  // CLIENT-SIDE STATE: These values are populated after hydration when we
  // can safely read from the DOM (browser environment only).
  // =========================================================================
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs ONLY in the browser (client-side)
    // On native platforms, the meta tag doesn't exist in the DOM
    try {
      // Read the meta tag that was injected by server-side rendering (+html.tsx)
      const metaElement = document.querySelector('meta[name="x-session"]');
      if (!metaElement) {
        setError('Meta tag not found (not running on web)');
        setLoading(false);
        return;
      }

      // Extract base64 content
      const encoded = metaElement.getAttribute('content');
      if (!encoded) {
        setError('No session data in meta tag');
        setLoading(false);
        return;
      }

      // Decode base64 using Web API (browser-safe)
      const decoded = atob(encoded);

      // Parse JSON
      const data = JSON.parse(decoded) as SessionData;
      setSessionData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse session data');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* ===================================================================
          TITLE: Proof of concept demo
          =================================================================== */}
      <Text style={styles.title}>SSR Signed Session Demo</Text>

      {/* ===================================================================
          STATUS LINE
          =================================================================== */}
      {loading && <Text style={styles.subtitle}>Reading meta tag...</Text>}
      {error && <Text style={styles.subtitle}>⚠️ {error}</Text>}

      {/* ===================================================================
          SESSION DATA DISPLAY
          
          The signature proves that this data was created on the server:
          - The nonce is random (crypto.randomUUID() on server)
          - The signature is HMAC SHA256 signed with the server's secret
          - Every reload changes the nonce and signature
          - Only the server can generate a valid signature
          
          If this was client-side only, we couldn't prove the secret exists
          on the server without shipping the secret to the client.
          =================================================================== */}
      {sessionData && (
        <View style={styles.dataContainer}>
          <Text style={styles.label}>✓ Session Token Received</Text>

          {/* Issued At (Unix timestamp) */}
          <View style={styles.dataBlock}>
            <Text style={styles.blockLabel}>Issued At:</Text>
            <Text style={styles.blockValue}>{sessionData.payload.issuedAt}</Text>
            <Text style={styles.blockSubtext}>
              {new Date(sessionData.payload.issuedAt).toLocaleString()}
            </Text>
          </View>

          {/* Nonce (random UUID) */}
          <View style={styles.dataBlock}>
            <Text style={styles.blockLabel}>Nonce (Server-Generated UUID):</Text>
            <Text style={styles.blockValue}>{sessionData.payload.nonce}</Text>
            <Text style={styles.blockSubtext}>Changes on every page reload</Text>
          </View>

          {/* Signature (HMAC SHA256) */}
          <View style={styles.dataBlock}>
            <Text style={styles.blockLabel}>HMAC-SHA256 Signature:</Text>
            <Text style={styles.blockValue}>{sessionData.signature}</Text>
            <Text style={styles.blockSubtext}>
              Proves server-side execution (requires server secret)
            </Text>
          </View>

          {/* Explanation */}
          <View style={styles.explanation}>
            <Text style={styles.explanationTitle}>How It Works:</Text>
            <Text style={styles.explanationText}>
              1. Server (+html.tsx) generates payload + timestamp{'\n'}
              2. Server signs with HMAC-SHA256 using secret key{'\n'}
              3. Server injects BASE64(payload + signature) in HTML{'\n'}
              4. Browser (client) reads meta tag and displays values{'\n'}
              5. Reload page → new nonce + new signature
            </Text>
          </View>
        </View>
      )}

      {/* Navigation Links */}
      <View style={styles.linksContainer}>
        <Link href="/blog">
          <Link.Trigger>
            <Text style={styles.link}>→ Blog Routes</Text>
          </Link.Trigger>
          <Link.Preview />
        </Link>

        <Link href="/marvel-comics">
          <Link.Trigger>
            <Text style={styles.link}>→ Marvel Comics Routes</Text>
          </Link.Trigger>
          <Link.Preview />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  dataContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 12,
  },
  dataBlock: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  blockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blockValue: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#000',
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  blockSubtext: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  explanation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  linksContainer: {
    gap: 12,
  },
  link: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '600',
  },
});
