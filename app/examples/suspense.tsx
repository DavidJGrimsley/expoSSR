import { Link } from 'expo-router';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

// Simple async function to simulate data fetching
async function fetchData(delay: number, label: string) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return { 
    message: label, 
    timestamp: new Date().toISOString() 
  };
}

// Create a resource that manages promise state for Suspense
function createResource<T>(fetchFn: () => Promise<T>) {
  let status = 'pending';
  let result: T;
  let error: Error;
  
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
    read() {
      if (status === 'pending') {
        throw suspender; // Suspense will catch this
      } else if (status === 'error') {
        throw error;
      } else if (status === 'success') {
        return result;
      }
    }
  };
}

// Create resources for each data source (outside component to prevent recreation)
const resources = {
  quick: null as ReturnType<typeof createResource> | null,
  medium: null as ReturnType<typeof createResource> | null,
  slow: null as ReturnType<typeof createResource> | null,
};

// Helper to get or create a resource
function getResource<T>(key: 'quick' | 'medium' | 'slow', fetchFn: () => Promise<T>) {
  if (!resources[key]) {
    resources[key] = createResource(fetchFn);
  }
  return resources[key]!;
}

// Components that fetch data with different delays
function QuickDataComponent() {
  const resource = getResource('quick', () => fetchData(1500, 'Quick data (1.5s)'));
  const quickData = resource.read();
  
  return (
    <View style={styles.dataCard}>
      <Text style={styles.dataTitle}>⚡ Quick Component</Text>
      <Text style={styles.dataText}>{quickData.message}</Text>
      <Text style={styles.timestamp}>{quickData.timestamp}</Text>
    </View>
  );
}

function MediumDataComponent() {
  const resource = getResource('medium', () => fetchData(4000, 'Medium data (4s)'));
  const mediumData = resource.read();
  
  return (
    <View style={styles.dataCard}>
      <Text style={styles.dataTitle}>🚀 Medium Component</Text>
      <Text style={styles.dataText}>{mediumData.message}</Text>
      <Text style={styles.timestamp}>{mediumData.timestamp}</Text>
    </View>
  );
}

function SlowDataComponent() {
  const resource = getResource('slow', () => fetchData(8000, 'Slow data (8s)'));
  const slowData = resource.read();
  
  return (
    <View style={styles.dataCard}>
      <Text style={styles.dataTitle}>🐌 Slow Component</Text>
      <Text style={styles.dataText}>{slowData.message}</Text>
      <Text style={styles.timestamp}>{slowData.timestamp}</Text>
    </View>
  );
}

// Loading fallback components
function QuickLoading() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="small" color="#007AFF" />
      <Text style={styles.loadingText}>Loading quick data...</Text>
    </View>
  );
}

function MediumLoading() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="small" color="#FF9500" />
      <Text style={styles.loadingText}>Loading medium data...</Text>
    </View>
  );
}

function SlowLoading() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="small" color="#FF3B30" />
      <Text style={styles.loadingText}>Loading slow data...</Text>
    </View>
  );
}

export default function SuspensePage() {
  // Clear resources on mount to allow fresh loads
  useEffect(() => {
    resources.quick = null;
    resources.medium = null;
    resources.slow = null;
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>🎭 Suspense Demonstration</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>About This Page:</Text>
          <Text style={styles.infoText}>
            This page demonstrates nested Suspense boundaries with client-side data fetching. 
            Each section loads at different speeds, showing progressive rendering.
          </Text>
          <Text style={styles.infoText}>
            • Quick: 1.5s delay{'\n'}
            • Medium: 4s delay{'\n'}
            • Slow: 8s delay
          </Text>
          <Text style={styles.infoText}>
            💡 Each component uses a "resource" pattern that throws a Promise while loading, 
            triggering React Suspense. When the Promise resolves, the resource updates its 
            internal state, and React re-renders the component with the data.
          </Text>
          <Text style={styles.infoText}>
            ⚠️ This is the standard Suspense pattern (no state updates during render). 
            Real apps would use libraries like TanStack Query or SWR that implement 
            this pattern properly with caching, revalidation, etc.
          </Text>
          <Text style={styles.infoText}>
            🔄 Refresh the page to see the loading sequence again!
          </Text>
        </View>

        {/* Level 1: Quick data with its own Suspense boundary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level 1: Quick Loading (Individual Suspense)</Text>
          <Suspense fallback={<QuickLoading />}>
            <QuickDataComponent />
          </Suspense>
        </View>

        {/* Level 2: Medium data - nested deeper */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level 2: Medium Loading (Nested Suspense)</Text>
          <Text style={styles.helperText}>
            This section has its own Suspense boundary, so it loads independently
          </Text>
          <Suspense fallback={<MediumLoading />}>
            <MediumDataComponent />
          </Suspense>
        </View>

        {/* Level 3: Slow data - deepest nesting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level 3: Slow Loading (Deeply Nested)</Text>
          <Text style={styles.helperText}>
            This one takes the longest but doesn't block the components above
          </Text>
          <Suspense fallback={<SlowLoading />}>
            <SlowDataComponent />
          </Suspense>
        </View>

        {/* Comparison notes */}
        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>🔍 Compare with Other Pages:</Text>
          <Text style={styles.comparisonText}>
            <Link href="/blog-loader">
              <Text style={styles.link}>📄 /blog-loader</Text>
            </Link>
            {' '}- No Suspense boundary, shows data immediately or not at all
          </Text>
          <Text style={styles.comparisonText}>
            <Link href="/blog">
              <Text style={styles.link}>📄 /blog</Text>
            </Link>
            {' '}- Single Suspense at top level, entire page waits for all data
          </Text>
          <Text style={styles.comparisonText}>
            <Link href="/examples/data-loaders">
              <Text style={styles.link}>📄 /examples/data-loaders</Text>
            </Link>
            {' '}- Multiple independent loaders demonstrating parallel loading
          </Text>
        </View>

        <View style={styles.keyTakeaways}>
          <Text style={styles.keyTitle}>✨ Key Takeaways:</Text>
          <Text style={styles.keyPoint}>
            1. Each Suspense boundary controls its own loading state independently
          </Text>
          <Text style={styles.keyPoint}>
            2. Nested boundaries enable progressive rendering (fast content shows first)
          </Text>
          <Text style={styles.keyPoint}>
            3. Components throw Promises to trigger Suspense (standard Suspense pattern)
          </Text>
          <Text style={styles.keyPoint}>
            4. With data loaders: call useLoaderData in child components + wrap with Suspense
          </Text>
          <Text style={styles.keyPoint}>
            5. For progressive loading with loaders: use separate routes/loaders per section
          </Text>
          <Text style={styles.keyPoint}>
            6. This creates better perceived performance than showing a single loading state
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  dataText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  loadingCard: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  comparisonBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#E65100',
  },
  comparisonText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  keyTakeaways: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  keyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E7D32',
  },
  keyPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 6,
  },
});