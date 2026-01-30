import Head from 'expo-router/head';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type TaskEntry = {
  id: string;
  task: string;
  createdAt: string;
  status: 'scheduled' | 'started' | 'deferred';
  startedAt?: string;
  deferredAt?: string;
};

type TaskResponse = {
  success: boolean;
  entry?: TaskEntry;
  archive?: TaskEntry[];
  stats?: {
    total: number;
    auditLogCount: number;
  };
  note?: string;
  error?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function TaskDemoExample() {
  const [archive, setArchive] = useState<TaskEntry[]>([]);
  const [stats, setStats] = useState<TaskResponse['stats'] | null>(null);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [polling, setPolling] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArchive = useCallback(async () => {
    try {
      setError(null);
      console.log('[Task] Fetching archive...');
      const response = await fetch('/api/task?limit=10');
      console.log('[Task] Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TaskResponse = await response.json();
      console.log('[Task] Archive result:', result);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load tasks');
      }

      const nextArchive = result.archive ?? [];
      console.log('[Task] Setting archive with', nextArchive.length, 'entries');
      setArchive(nextArchive);
      setStats(result.stats ?? null);
      setNote(result.note ?? '');
      const hasPending = nextArchive.some((entry) => entry.status !== 'deferred');
      console.log('[Task] Has pending entries:', hasPending);
      return hasPending;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Task] Fetch error:', err);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const startTask = useCallback(async () => {
    try {
      setCreating(true);
      setError(null);
      console.log('[Task] Creating new task...');
      const response = await fetch('/api/task', { method: 'POST' });
      console.log('[Task] POST response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TaskResponse = await response.json();
      console.log('[Task] POST result:', result);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create task');
      }

      console.log('[Task] Fetching archive after creation...');
      await fetchArchive();

      console.log('[Task] Starting polling loop...');
      setPolling(true);
      for (let attempt = 0; attempt < 5; attempt += 1) {
        console.log('[Task] Poll attempt', attempt + 1, 'of 5');
        await sleep(650);
        const stillPending = await fetchArchive();
        if (!stillPending) {
          console.log('[Task] No more pending entries, stopping polling');
          break;
        }
      }
      console.log('[Task] Polling complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Task] Error in startTask:', err);
      setError(message);
    } finally {
      setCreating(false);
      setPolling(false);
    }
  }, [fetchArchive]);

  useEffect(() => {
    fetchArchive();
  }, [fetchArchive]);

  return (
    <>
      <Head>
        <title>Simple Task Demo</title>
        <meta name="description" content="runTask + deferTask demo with simple tasks" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Simple Task Demo</Text>
        <Text style={styles.body}>
          Tap the button to create a task. The API response returns immediately while
          <Text style={styles.bold}> runTask</Text> starts the task after a short delay (simulated work) and
          <Text style={styles.bold}> deferTask</Text> marks it deferred after the response.
        </Text>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.primaryButton, creating && styles.buttonDisabled]} onPress={startTask} disabled={creating}>
            <Text style={styles.primaryButtonText}>{creating ? 'Starting...' : 'Start Task'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={fetchArchive}>
            <Text style={styles.secondaryButtonText}>Refresh</Text>
          </Pressable>
          <Pressable
            style={[styles.dangerButton, resetting && styles.buttonDisabled]}
            onPress={async () => {
              if (!confirm('Reset all task data? This will clear the archive.')) return;
              try {
                setResetting(true);
                const res = await fetch('/api/task', { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to reset tasks');
                await fetchArchive();
                alert('Task data reset');
              } catch (err) {
                console.error(err);
                alert('Failed to reset task data');
              } finally {
                setResetting(false);
              }
            }}
          >
            <Text style={styles.dangerButtonText}>{resetting ? 'Resetting...' : 'Reset Data'}</Text>
          </Pressable>
        </View>

        {(loading || polling) && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#7b4ddb" />
            <Text style={styles.loadingText}>{loading ? 'Loading archive...' : 'Waiting for deferred update...'}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>⚠️ Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Task Snapshot</Text>
          <Text style={styles.statsText}>Archive size: {stats?.total ?? archive.length}</Text>
          <Text style={styles.statsText}>Audit log entries (runTask): {stats?.auditLogCount ?? 0}</Text>
          {note ? <Text style={styles.statsNote}>{note}</Text> : null}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <Text style={styles.sectionSubtitle}>Deferred status appears after a moment.</Text>
        </View>

        {archive.length === 0 && !loading && (
          <Text style={styles.emptyText}>No tasks yet. Start one to populate the archive.</Text>
        )}

        {archive.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{entry.task}</Text>
              <Text style={entry.status === 'deferred' ? styles.statusDone : styles.statusPending}>
                {entry.status === 'deferred' ? 'Deferred' : 'Working...'}
              </Text>
            </View>
            <Text style={styles.timestamp}>Created: {new Date(entry.createdAt).toLocaleTimeString()}</Text>
            {entry.startedAt ? <Text style={styles.detailText}>Started: {new Date(entry.startedAt).toLocaleTimeString()}</Text> : null}
            {entry.deferredAt ? (
              <Text style={styles.detailText}>Deferred: {new Date(entry.deferredAt).toLocaleTimeString()}</Text>
            ) : (
              <Text style={styles.pendingText}>Deferred update incoming via deferTask…</Text>
            )}
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Production Uses</Text>
          <Text style={styles.sectionSubtitle}>Where runTask and deferTask fit in real apps.</Text>
        </View>

        <View style={styles.useCaseCard}>
          <Text style={styles.useCaseItem}>• Log analytics without blocking the response.</Text>
          <Text style={styles.useCaseItem}>• Send emails or push notifications after a user action.</Text>
          <Text style={styles.useCaseItem}>• Refresh cached data in the background.</Text>
          <Text style={styles.useCaseItem}>• Process webhook payloads while responding fast.</Text>
          <Text style={styles.useCaseItem}>• Generate thumbnails or reports after uploads.</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf7ff' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#2b104f' },
  body: { fontSize: 15, color: '#4a4a4a', lineHeight: 22 },
  bold: { fontWeight: '700', color: '#2b104f' },
  actionsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  primaryButton: {
    backgroundColor: '#7b4ddb',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#7b4ddb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryButtonText: { color: '#7b4ddb', fontWeight: '700' },
  dangerButton: {
    borderWidth: 2,
    borderColor: '#d93025',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dangerButtonText: { color: '#d93025', fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#5a5a5a', fontSize: 14 },
  errorCard: {
    borderWidth: 2,
    borderColor: '#d93025',
    backgroundColor: '#fff1f0',
    padding: 14,
    borderRadius: 12,
  },
  errorTitle: { fontWeight: '700', color: '#d93025', marginBottom: 6 },
  errorText: { color: '#7a1c1c' },
  statsCard: {
    borderWidth: 2,
    borderColor: '#e1d9f5',
    backgroundColor: '#f7f2ff',
    padding: 14,
    borderRadius: 14,
  },
  statsTitle: { fontWeight: '700', marginBottom: 6, color: '#2b104f' },
  statsText: { color: '#4a4a4a', marginBottom: 4 },
  statsNote: { marginTop: 6, color: '#7a6fa5', fontStyle: 'italic' },
  sectionHeader: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2b104f' },
  sectionSubtitle: { color: '#6b5d8a', marginTop: 4 },
  emptyText: { color: '#6b5d8a', fontStyle: 'italic' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e6dff8',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardTitle: { flex: 1, fontWeight: '700', color: '#2b104f' },
  statusPending: { color: '#c08400', fontWeight: '700' },
  statusDone: { color: '#1b7f5a', fontWeight: '700' },
  timestamp: { marginTop: 6, color: '#7a6fa5', fontSize: 12 },
  detailText: { marginTop: 6, color: '#3b3b3b' },
  pendingText: { marginTop: 10, color: '#c08400', fontStyle: 'italic' },
  useCaseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e6dff8',
  },
  useCaseItem: { color: '#4a4a4a', marginBottom: 6 },
});
