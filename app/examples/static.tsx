import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { STATIC_DATA } from '../../data/static';

export default function StaticExample() {
  // Try to access environment variables on the client
  // This will fail for non-EXPO_PUBLIC variables
  const clientOpenAIKey = typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined;
  const clientDbUrl = typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined;
  const clientExpoPublic = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : undefined;
  
  return (
    <>
      <Head>
        <title>Static Example</title>
        <meta name="description" content="Static example page without SSR data loaders." />
        <meta name="twitter:card" content="summary" />
      </Head>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Static Example</Text>
        <Text style={styles.body}>{STATIC_DATA}</Text>
        <Text style={styles.note}>No API calls, no loaders — just module data.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client-Side Environment Access (FAILS)</Text>
          <Text style={styles.explanation}>
            This page attempts to access process.env directly on the client. Only EXPO_PUBLIC_ variables work.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attempting to Access Server-Only Variables</Text>
          <View style={styles.resultRow}>
            <Text style={styles.label}>OPENAI_API_KEY:</Text>
            <Text style={styles.failedValue}>
              {clientOpenAIKey || 'undefined ✗ (Client cannot access)'}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.label}>DATABASE_URL:</Text>
            <Text style={styles.failedValue}>
              {clientDbUrl || 'undefined ✗ (Client cannot access)'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attempting to Access EXPO_PUBLIC Variable</Text>
          <View style={styles.resultRow}>
            <Text style={styles.label}>EXPO_PUBLIC_API_URL:</Text>
            <Text style={styles.successValue}>
              {clientExpoPublic || 'undefined ✓ (Works if set in .env)'}
            </Text>
          </View>
          <Text style={styles.infoText}>
            EXPO_PUBLIC_ variables are bundled into the client build and are accessible on both client and server.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Security Note</Text>
          <Text style={styles.warningText}>
            Never prefix sensitive data with EXPO_PUBLIC_. Those values are visible to anyone who inspects your JavaScript bundle.
          </Text>
        </View>
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
  card: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#0066cc' },
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
  warningCard: {
    borderWidth: 2,
    borderColor: '#ff9800',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff8e1',
    marginBottom: 16,
  },
  warningTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#e65100' },
  warningText: { fontSize: 15, color: '#e65100', lineHeight: 22 },
});
