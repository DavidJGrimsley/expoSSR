import Head from 'expo-router/head';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type GardenSeed = {
  id: string;
  plantedAt: string;
  stage: 'queued' | 'seed' | 'bloom';
  emoji?: string;
  color?: string;
  bloomAt?: string;
  bloomedAt?: string;
};

type GardenResponse = {
  success: boolean;
  seed?: GardenSeed;
  garden?: GardenSeed[];
  note?: string;
  error?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function GardenTaskExample() {
  const [garden, setGarden] = useState<GardenSeed[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [plantingCount, setPlantingCount] = useState(0);
  const [polling, setPolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const pendingSeeds = useMemo(
    () => garden.filter((seed) => seed.stage !== 'bloom').length,
    [garden]
  );

  const fetchGarden = useCallback(async () => {
    try {
      setError(null);
      console.log('[Garden] Fetching garden...');
      const response = await fetch('/api/garden?limit=50');
      console.log('[Garden] Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GardenResponse = await response.json();
      console.log('[Garden] Garden result:', result);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load garden');
      }

      const nextGarden = result.garden ?? [];
      console.log('[Garden] Setting garden with', nextGarden.length, 'seeds');
      setGarden(nextGarden);
      setNote(result.note ?? '');
      const hasPending = nextGarden.some((seed) => seed.stage !== 'bloom');
      console.log('[Garden] Has pending seeds:', hasPending);
      return { hasPending, count: nextGarden.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Garden] Fetch error:', err);
      setError(message);
      return { hasPending: false, count: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    await fetchGarden();
    setRefreshing(false);
  }, [fetchGarden]);

  const plantSeed = useCallback(async () => {
    try {
      setPlantingCount((count) => count + 1);
      setError(null);
      console.log('[Garden] Planting new seed...');
      const response = await fetch('/api/garden', { method: 'POST' });
      console.log('[Garden] POST response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GardenResponse = await response.json();
      console.log('[Garden] POST result:', result);
      if (!result.success) {
        throw new Error(result.error || 'Failed to plant seed');
      }

      console.log('[Garden] Fetching garden after planting...');
      await fetchGarden();

      console.log('[Garden] Starting polling loop...');
      setPolling(true);
      for (let attempt = 0; attempt < 12; attempt += 1) {
        console.log('[Garden] Poll attempt', attempt + 1, 'of 6');
        await sleep(650);
        const { hasPending, count } = await fetchGarden();
        if (!hasPending && count > 0) {
          console.log('[Garden] No more pending seeds, stopping polling');
          break;
        }
      }
      console.log('[Garden] Polling complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Garden] Error in plantSeed:', err);
      setError(message);
    } finally {
      setPlantingCount((count) => Math.max(0, count - 1));
      setPolling(false);
    }
  }, [fetchGarden]);

  useEffect(() => {
    fetchGarden();
  }, [fetchGarden]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pendingSeeds === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchGarden();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchGarden, pendingSeeds]);

  const resetGarden = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      console.log('[Garden] Resetting garden data...');
      const response = await fetch('/api/garden', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchGarden();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Garden] Reset error:', err);
      setError(message);
    } finally {
      setRefreshing(false);
    }
  }, [fetchGarden]);

  return (
    <>
      <Head>
        <title>Pixel Garden Tasks</title>
        <meta name="description" content="runTask + deferTask demo with a pixel garden" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>🌱 Pixel Garden Tasks</Text>
        <Text style={styles.body}>
          Plant a seed and watch <Text style={styles.bold}>runTask</Text> add it to the garden while
          <Text style={styles.bold}> deferTask</Text> blooms it a few moments later. Each flower seed has a different &apos;time to bloom&apos; so we can see them finishing at different times.
        </Text>
        <Text style={styles.caption}>
          The UI renders on the JavaScript thread, while the API route runs on a server worker (a runtime
          instance that handles one request at a time). Tasks execute on the server worker, so they don&apos;t
          block UI rendering; the UI only updates when fetch results arrive back on the JS thread.
        </Text>

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryButton} onPress={plantSeed}>
            <Text style={styles.primaryButtonText} selectable={false}>
              {plantingCount > 0 ? `Planting (${plantingCount})...` : 'Plant a Seed'}
            </Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleRefresh}>
            <Text style={styles.secondaryButtonText} selectable={false}>
              {refreshing ? 'Refreshing…' : 'Refresh Data'}
            </Text>
          </Pressable>
          <Pressable style={styles.dangerButton} onPress={resetGarden}>
            <Text style={styles.dangerButtonText} selectable={false}>Reset Data</Text>
          </Pressable>
        </View>

        <Text style={styles.refreshNote}>
          Refresh Data pulls the latest garden state from the server worker so any blooms finished in the
          background appear immediately. The garden shows up to 50 seeds/blooms at a time.
        </Text>

        {(loading || polling || refreshing) && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2f855a" />
            <Text style={styles.loadingText}>
              {loading || refreshing ? 'Loading garden...' : 'Waiting for blooms...'}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>⚠️ Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Garden Status</Text>
          <Text style={styles.statsText}>Total blooms: {garden.filter((seed) => seed.stage === 'bloom').length}</Text>
          <Text style={styles.statsText}>Seeds still growing: {pendingSeeds}</Text>
          {note ? <Text style={styles.statsNote}>{note}</Text> : null}
        </View>

        <View style={styles.grid}>
          {garden.length === 0 && !loading && (
            <Text style={styles.emptyText}>No plants yet. Plant a seed to begin.</Text>
          )}
          {garden.map((seed) => (
            <View key={seed.id} style={styles.card}>
              {seed.stage !== 'bloom' && seed.bloomAt ? (
                <Text style={styles.countdownText}>
                  {(() => {
                    const remaining = Math.ceil((new Date(seed.bloomAt).getTime() - now) / 1000);
                    return remaining > 0 ? `${remaining}s` : 'Ready';
                  })()}
                </Text>
              ) : null}
              <Text style={styles.seedEmoji}>
                {seed.stage === 'bloom' ? seed.emoji : '🌱'}
              </Text>
              <Text style={styles.seedLabel}>
                {seed.stage === 'bloom' ? seed.color : 'Growing'}
              </Text>
              <Text style={[styles.seedStatus, { color: seed.stage === 'bloom' ? '#2f855a' : '#265a40' }]}>
                {seed.stage === 'bloom' ? 'Bloomed' : 'Waiting...'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6fff8' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1f4b2e' },
  body: { fontSize: 15, color: '#3f4a3f', lineHeight: 22 },
  caption: { fontSize: 13, color: '#4e5b4e', lineHeight: 20 },
  bold: { fontWeight: '700', color: '#1f4b2e' },
  actionsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  primaryButton: {
    backgroundColor: '#2f855a',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', userSelect: 'none' },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#2f855a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryButtonText: { color: '#2f855a', fontWeight: '700', userSelect: 'none' },
  dangerButton: {
    borderWidth: 2,
    borderColor: '#d93025',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  dangerButtonText: { color: '#d93025', fontWeight: '700', userSelect: 'none' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#4a5a4a', fontSize: 14 },
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
    borderColor: '#d8eedc',
    backgroundColor: '#ecfdf3',
    padding: 14,
    borderRadius: 14,
  },
  statsTitle: { fontWeight: '700', marginBottom: 6, color: '#1f4b2e' },
  statsText: { color: '#3f4a3f', marginBottom: 4 },
  statsNote: { marginTop: 6, color: '#5f7a63', fontStyle: 'italic' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    padding: 24,
    backgroundColor: '#af9b81',
    justifyContent: 'center',
    borderRadius: 12,
    width: '70%',
    alignSelf: 'center',
  },
  emptyText: { color: '#5f7a63', fontStyle: 'italic' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    borderWidth: 2,
    borderColor: '#d8eedc',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    width: '6%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  seedEmoji: { fontSize: 28 },
  seedLabel: { fontSize: 13, fontWeight: '700', color: '#1f4b2e', textAlign: 'center' },
  seedStatus: { fontSize: 12, color: '#265a40', textAlign: 'center' },
  countdownText: { fontSize: 11, color: '#265a40', fontWeight: '700' },
  refreshNote: { fontSize: 12, color: '#3f4a3f', marginTop: 6 },
});
