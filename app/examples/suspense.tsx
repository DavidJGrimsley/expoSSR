import { Link } from 'expo-router';
import Head from 'expo-router/head';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

type SuspenseData = {
  message: string;
  timestamp: string;
};

// Simple async function to simulate data fetching
async function fetchData(delay: number, label: string) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return { 
    message: label, 
    timestamp: new Date().toISOString() 
  };
}

// Create a resource that manages promise state for Suspense
// This is the standard React Suspense pattern - throw a promise while pending
function createResource<T>(fetchFn: () => Promise<T>) {
  let status = 'pending';
  let result: T | null = null;
  let error: Error | null = null;
  
  const suspender = fetchFn().then(
    (data) => {
      status = 'success';
      result = data;
    },
    (err) => {
      status = 'error';
      error = err;
    }
  );

  return {
    read(): T {
      if (status === 'pending') {
        throw suspender; // Suspense will catch this
      } else if (status === 'error') {
        throw error;
      } else if (status === 'success') {
        return result as T;
      }
      throw new Error('Unexpected Suspense resource state');
    }
  };
}

// Create resources for each data source (outside component to prevent recreation)
const resources: Record<'quick' | 'medium' | 'slow', ReturnType<typeof createResource<SuspenseData>> | null> = {
  quick: null,
  medium: null,
  slow: null,
};

// Helper to get or create a resource
function getResource(key: 'quick' | 'medium' | 'slow', fetchFn: () => Promise<SuspenseData>) {
  if (!resources[key]) {
    resources[key] = createResource(fetchFn);
  }
  return resources[key]!;
}

// Components that fetch data with different delays
function QuickDataComponent() {
  const resource = getResource('quick', () => fetchData(1500, 'Quick data loaded (1.5s delay)'));
  const quickData = resource.read();
  
  return (
    <View style={styles.dataCard}>
      <Text style={styles.dataTitle}>⚡ Quick Component</Text>
      <Text style={styles.dataText}>{quickData.message}</Text>
      <Text style={styles.timestamp}>Timestamp: {quickData.timestamp}</Text>
    </View>
  );
}

function MediumDataComponent() {
  const resource = getResource('medium', () => fetchData(4000, 'Medium data loaded (4s delay)'));
  const mediumData = resource.read();
  
  return (
    <View style={styles.dataCard}>
      <Text style={styles.dataTitle}>🚀 Medium Component</Text>
      <Text style={styles.dataText}>{mediumData.message}</Text>
      <Text style={styles.timestamp}>Timestamp: {mediumData.timestamp}</Text>
    </View>
  );
}

function SlowDataComponent() {
  const resource = getResource('slow', () => fetchData(8000, 'Slow data loaded (8s delay)'));
  const slowData = resource.read();
  
  return (
    <View style={styles.dataCard}>
      <Text style={styles.dataTitle}>🐌 Slow Component</Text>
      <Text style={styles.dataText}>{slowData.message}</Text>
      <Text style={styles.timestamp}>Timestamp: {slowData.timestamp}</Text>
    </View>
  );
}

// Loading fallback components with styled indicators
function QuickLoading() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading quick data (1.5s)...</Text>
      <Text style={styles.loadingSubtext}>This should appear first</Text>
    </View>
  );
}

function MediumLoading() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="large" color="#FF9500" />
      <Text style={styles.loadingText}>Loading medium data (4s)...</Text>
      <Text style={styles.loadingSubtext}>This should appear after quick</Text>
    </View>
  );
}

function SlowLoading() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="large" color="#FF3B30" />
      <Text style={styles.loadingText}>Loading slow data (8s)...</Text>
      <Text style={styles.loadingSubtext}>This should appear last</Text>
    </View>
  );
}

export default function SuspensePage() {
  // Clear resources on mount to allow fresh loads each visit
  useEffect(() => {
    resources.quick = null;
    resources.medium = null;
    resources.slow = null;
  }, []);

  return (
    <>
      <Head>
        <title>Suspense Demonstration</title>
        <meta name="description" content="Progressive rendering with nested Suspense boundaries" />
      </Head>

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.mainTitle}>🎭 Suspense Demonstration</Text>
          <Text style={styles.subtitle}>
            Progressive rendering with client-side fetching and nested Suspense boundaries
          </Text>
          
          <View style={styles.aboutBox}>
            <Text style={styles.aboutTitle}>📖 About This Page</Text>
            <Text style={styles.aboutText}>
              This page demonstrates <Text style={styles.bold}>nested Suspense boundaries</Text> with 
              client-side data fetching. Each section loads at different speeds, showing how Suspense 
              enables progressive rendering.
            </Text>
            <View style={styles.delayList}>
              <Text style={styles.delayItem}>• <Text style={styles.bold}>Quick:</Text> 1.5s delay</Text>
              <Text style={styles.delayItem}>• <Text style={styles.bold}>Medium:</Text> 4s delay</Text>
              <Text style={styles.delayItem}>• <Text style={styles.bold}>Slow:</Text> 8s delay</Text>
            </View>
          </View>

          <View style={styles.howItWorksBox}>
            <Text style={styles.howItWorksTitle}>🔧 The Resource Pattern</Text>
            <Text style={styles.howItWorksText}>
              Each component uses a &quot;resource&quot; pattern that throws a Promise while loading, 
              triggering React Suspense. When the Promise resolves, the resource updates its 
              internal state and React re-renders with the data.
            </Text>
            <Text style={styles.howItWorksText}>
              ⚠️ This is the standard Suspense pattern — <Text style={styles.bold}>no setState during render</Text>. 
              The resource manages promise state outside React to avoid render-time updates.
            </Text>
            <Text style={styles.howItWorksText}>
              💡 In real apps, use libraries like <Text style={styles.mono}>TanStack Query</Text> or{' '}
              <Text style={styles.mono}>SWR</Text> that implement this pattern with caching, 
              revalidation, and optimizations.
            </Text>
          </View>

          {/* Level 1: Quick data with its own Suspense boundary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Level 1: Quick Loading</Text>
            <Text style={styles.sectionSubtitle}>Individual Suspense boundary — loads first</Text>
            <Suspense fallback={<QuickLoading />}>
              <QuickDataComponent />
            </Suspense>
          </View>

          {/* Level 2: Medium data - nested deeper */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Level 2: Medium Loading</Text>
            <Text style={styles.sectionSubtitle}>
              Nested Suspense boundary — loads independently of Level 1
            </Text>
            <Suspense fallback={<MediumLoading />}>
              <MediumDataComponent />
            </Suspense>
          </View>

          {/* Level 3: Slow data - deepest nesting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Level 3: Slow Loading</Text>
            <Text style={styles.sectionSubtitle}>
              Deeply nested Suspense — doesn&apos;t block components above
            </Text>
            <Suspense fallback={<SlowLoading />}>
              <SlowDataComponent />
            </Suspense>
          </View>

          {/* Comparison with other approaches */}
          <View style={styles.comparisonBox}>
            <Text style={styles.comparisonTitle}>🔍 Compare with Other Pages</Text>
            
            <Link href="/blog" style={styles.comparisonLink}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemTitle}>📄 /blog (Client Fetch + API Route)</Text>
                <Text style={styles.comparisonItemText}>
                  Uses client-side fetch with API routes. Single loading state at component level, 
                  entire page waits for all data.
                </Text>
              </View>
            </Link>

            <Link href="/blog-loader" style={styles.comparisonLink}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemTitle}>📦 /blog-loader (Data Loaders)</Text>
                <Text style={styles.comparisonItemText}>
                  Server-side data loading. No Suspense boundary needed — shows data immediately 
                  or not at all. Perfect for initial page loads.
                </Text>
              </View>
            </Link>

            <Link href="/examples/data-loaders" style={styles.comparisonLink}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemTitle}>🎯 /examples/data-loaders</Text>
                <Text style={styles.comparisonItemText}>
                  Demonstrates multiple data loaders in one page. All loaders run in parallel on 
                  the server, data arrives together in the HTML.
                </Text>
              </View>
            </Link>
          </View>

          {/* Key Takeaways */}
          <View style={styles.keyTakeawaysBox}>
            <Text style={styles.keyTakeawaysTitle}>✨ Key Takeaways</Text>
            
            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>1</Text>
              <Text style={styles.takeawayText}>
                <Text style={styles.bold}>Independent boundaries:</Text> Each Suspense boundary 
                controls its own loading state independently. Fast content shows first.
              </Text>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>2</Text>
              <Text style={styles.takeawayText}>
                <Text style={styles.bold}>Progressive rendering:</Text> Nested boundaries enable 
                progressive content display, improving perceived performance.
              </Text>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>3</Text>
              <Text style={styles.takeawayText}>
                <Text style={styles.bold}>Resource pattern required:</Text> Throw promises WITHOUT 
                setState during render. Manage state outside React.
              </Text>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>4</Text>
              <Text style={styles.takeawayText}>
                <Text style={styles.bold}>React Native limitation:</Text> React&apos;s <Text style={styles.mono}>use</Text> hook 
                isn&apos;t fully supported yet. Without it, you need the resource pattern.
              </Text>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>5</Text>
              <Text style={styles.takeawayText}>
                <Text style={styles.bold}>Data loaders are different:</Text> Loaders serialize return values 
                — can&apos;t pass live Promise objects. All data arrives together server-side.
              </Text>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>6</Text>
              <Text style={styles.takeawayText}>
                <Text style={styles.bold}>Combining approaches:</Text> Use data loaders for initial page data, 
                Suspense for progressive client-side updates and interactions.
              </Text>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>7</Text>
              <Text style={styles.takeawayText}>
                <Text style={styles.bold}>Production tip:</Text> Use libraries like TanStack Query or SWR 
                that implement the resource pattern with caching and revalidation.
              </Text>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>8</Text>
              <Text style={styles.takeawayText}>
                <Text style={styles.bold}>When to use what:</Text> Loaders for SEO-critical content, 
                Suspense for interactive features and progressive enhancement.
              </Text>
            </View>
          </View>

          <View style={styles.refreshNote}>
            <Text style={styles.refreshNoteText}>
              🔄 <Text style={styles.bold}>Refresh the page</Text> to see the progressive loading sequence again!
            </Text>
          </View>

          <Link href="/" style={styles.homeLink}>
            <Text style={styles.homeLinkText}>← Back to Home</Text>
          </Link>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  aboutBox: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    borderWidth: 3,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1976D2',
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  delayList: {
    marginTop: 8,
  },
  delayItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  bold: {
    fontWeight: '700',
  },
  mono: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 14,
  },
  howItWorksBox: {
    backgroundColor: '#fff3e0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    borderWidth: 3,
    borderColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#E65100',
  },
  howItWorksText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  dataCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2E7D32',
  },
  dataText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  loadingCard: {
    backgroundColor: '#f5f5f5',
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    minHeight: 150,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  comparisonBox: {
    backgroundColor: '#f3e5f5',
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
    borderWidth: 3,
    borderColor: '#9C27B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#6A1B9A',
  },
  comparisonLink: {
    textDecorationLine: 'none',
  },
  comparisonItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#CE93D8',
  },
  comparisonItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#6A1B9A',
  },
  comparisonItemText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  keyTakeawaysBox: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  keyTakeawaysTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2E7D32',
  },
  takeawayItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  takeawayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    backgroundColor: '#C8E6C9',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  takeawayText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  refreshNote: {
    backgroundColor: '#fff9c4',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FBC02D',
  },
  refreshNoteText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  homeLink: {
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  homeLinkText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
  },
});
