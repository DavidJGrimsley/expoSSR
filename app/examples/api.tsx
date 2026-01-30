import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

type ApiResponse = {
  success: boolean;
  message: string;
  serverOnlyData: {
    serverTime: string;
    environmentCheck: {
      hasOpenAIKey: boolean;
      openAIKey?: string;
      hasDbUrl: boolean;
      dbUrl?: string;
      expoPublicApiUrl?: string;
      nodeVersion: string;
    };
    stats: {
      requestCount: number;
      uptime: number;
    };
  };
  note: string;
  error?: string;
};

export default function APIExample() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.success) {
          setApiData(result);
        } else {
          setError(result.error || 'Failed to fetch API data');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error fetching API data: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, []);

  return (
    <>
      <Head>
        <title>API Routes Example</title>
        <meta name="description" content="Example of API route with server-only capabilities" />
        <meta property="og:title" content="API Routes Example" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>API Routes Example</Text>
        <Text style={styles.body}>
          This page fetches data from /api which can access server-only features like environment variables, file systems, and databases.
        </Text>
        <Text style={styles.note}>Data fetched from API route at runtime.</Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Fetching from /api...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>❌ Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && apiData && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Server-Only Capabilities</Text>
              <Text style={styles.explanation}>
                API routes execute on the server and can access resources that the client cannot.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>What API Routes Can Do</Text>
              <Text style={styles.cardBody}>{apiData.message}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Server Information</Text>
              <View style={styles.resultRow}>
                <Text style={styles.label}>Server Time:</Text>
                <Text style={styles.successValue}>{apiData.serverOnlyData.serverTime}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.label}>Node Version:</Text>
                <Text style={styles.successValue}>{apiData.serverOnlyData.environmentCheck.nodeVersion}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.label}>Server Uptime:</Text>
                <Text style={styles.successValue}>{apiData.serverOnlyData.stats.uptime.toFixed(2)}s</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.label}>Request Count:</Text>
                <Text style={styles.successValue}>{apiData.serverOnlyData.stats.requestCount}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Environment Variables (Server-Side Access)</Text>
              <View style={styles.resultRow}>
                <Text style={styles.label}>OPENAI_API_KEY:</Text>
                <Text style={apiData.serverOnlyData.environmentCheck.hasOpenAIKey ? styles.successValue : styles.failedValue}>
                  {apiData.serverOnlyData.environmentCheck.hasOpenAIKey 
                    ? `${apiData.serverOnlyData.environmentCheck.openAIKey} ✓` 
                    : 'Not set ✗'}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.label}>DATABASE_URL:</Text>
                <Text style={apiData.serverOnlyData.environmentCheck.hasDbUrl ? styles.successValue : styles.failedValue}>
                  {apiData.serverOnlyData.environmentCheck.hasDbUrl 
                    ? `${apiData.serverOnlyData.environmentCheck.dbUrl} ✓` 
                    : 'Not set ✗'}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.label}>EXPO_PUBLIC_API_URL:</Text>
                <Text style={styles.successValue}>
                  {apiData.serverOnlyData.environmentCheck.expoPublicApiUrl || 'Not set'}
                </Text>
              </View>
              <Text style={styles.infoText}>
                These values are only accessible on the server. The client receives them via the API response.
              </Text>
            </View>

            <View style={styles.successCard}>
              <Text style={styles.successTitle}>✓ API Route Success</Text>
              <Text style={styles.successText}>{apiData.note}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 16, color: '#333', marginBottom: 8, lineHeight: 24 },
  note: { fontSize: 14, color: '#666', marginBottom: 24 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#333' },
  explanation: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 12 },
  loadingContainer: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  loadingText: { marginTop: 10, fontSize: 15, color: '#666' },
  card: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#0066cc' },
  cardBody: { fontSize: 15, color: '#444', lineHeight: 22 },
  resultRow: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  failedValue: { 
    fontSize: 14, 
    color: '#cc0000',
    fontFamily: 'monospace',
    backgroundColor: '#fff5f5',
    padding: 8,
    borderRadius: 6,
  },
  successValue: { 
    fontSize: 14, 
    color: '#008800',
    fontFamily: 'monospace',
    backgroundColor: '#f0fff0',
    padding: 8,
    borderRadius: 6,
  },
  infoText: { 
    fontSize: 13, 
    color: '#666', 
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  errorCard: {
    borderWidth: 2,
    borderColor: '#cc0000',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff5f5',
    marginBottom: 16,
  },
  errorTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#cc0000' },
  errorText: { fontSize: 15, color: '#cc0000', lineHeight: 22 },
  successCard: {
    borderWidth: 2,
    borderColor: '#4caf50',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#f1f8f4',
    marginBottom: 16,
  },
  successTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#2e7d32' },
  successText: { fontSize: 15, color: '#2e7d32', lineHeight: 22 },
});
