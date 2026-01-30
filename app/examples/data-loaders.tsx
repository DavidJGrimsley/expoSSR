import { useLoaderData, type ErrorBoundaryProps } from 'expo-router';
import Head from 'expo-router/head';
import { Suspense } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Simulate different data fetching scenarios
// This loader demonstrates what you COULD fetch in a real app
export async function loader(request: Request | undefined) {
  // ⚠️ Artificial 800ms delay to simulate real API/database calls
  // In production, this would be actual network/database time
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Access environment variables (server-only, never exposed to client)
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // 📊 Simulated data - in a real app, you'd fetch from:
  // - Database: const user = await db.users.findById(userId)
  // - API: const stats = await fetch('https://api.example.com/stats')
  // - File system: const data = await fs.readFile('data.json')
  const userData = {
    name: 'Demo User',
    role: 'Developer',
    lastLogin: new Date().toISOString(),
  };
  
  const statsData = {
    totalPosts: 42,
    totalViews: 1337,
    totalComments: 256,
  };
  
  // Server-only computation (happens on every request in server mode)
  const serverTime = new Date().toISOString();
  const randomServerValue = Math.floor(Math.random() * 1000);
  
  return {
    user: userData,
    stats: statsData,
    serverInfo: {
      time: serverTime,
      randomValue: randomServerValue,
      nodeEnv,
    },
    features: {
      suspense: true,
      errorBoundary: true,
      dynamicParams: true,
      requestAccess: request !== undefined,
      staticExport: request === undefined,
    },
  };
}

// Error boundary demonstration
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <ScrollView contentContainerStyle={styles.errorContainer}>
      <Text style={styles.errorEmoji}>💥</Text>
      <Text style={styles.errorTitle}>Loader Error</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Pressable style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryButtonText}>Retry Loading</Text>
      </Pressable>
      <View style={styles.errorNote}>
        <Text style={styles.errorNoteText}>
          This ErrorBoundary caught the error from the loader function.
          It prevents the entire app from crashing and provides a recovery mechanism.
        </Text>
      </View>
    </ScrollView>
  );
}

function DataLoadersContent() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Head>
        <title>Data Loaders Demo</title>
        <meta name="description" content="Comprehensive demonstration of Expo Router data loaders" />
      </Head>
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📦 Data Loaders Demo</Text>
        <Text style={styles.subtitle}>
          A comprehensive showcase of Expo Router data loader capabilities
        </Text>

        {/* Feature Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Features Demonstrated</Text>
          <View style={styles.featureList}>
            <FeatureItem 
              enabled={data.features.suspense} 
              label="Suspense Integration" 
            />
            <FeatureItem 
              enabled={data.features.errorBoundary} 
              label="Error Boundaries" 
            />
            <FeatureItem 
              enabled={data.features.dynamicParams} 
              label="Dynamic Route Params" 
            />
            <FeatureItem 
              enabled={data.features.requestAccess} 
              label="Request Object Access" 
              note="(Server rendering only)"
            />
            <FeatureItem 
              enabled={data.features.staticExport} 
              label="Static Export Support" 
              note="(Build-time execution)"
            />
          </View>
        </View>

        {/* Server Info */}
        <View style={[styles.section, styles.serverSection]}>
          <Text style={styles.sectionTitle}>⚙️ Server-Side Information</Text>
          <Text style={styles.sectionNote}>
            This section shows data that was generated on the server. In a real app, 
            you'd query databases, call APIs, or read files here.
          </Text>
          <InfoRow label="Server Time" value={new Date(data.serverInfo.time).toLocaleString()} />
          <InfoRow label="Environment" value={data.serverInfo.nodeEnv} />
          <InfoRow label="Random Server Value" value={data.serverInfo.randomValue.toString()} />
          <Text style={styles.serverNote}>
            💡 The random value changes on each request, proving the loader runs fresh 
            every time (in server mode). This would be a database query in production.
          </Text>
        </View>

        {/* User Data */}
        <View style={[styles.section, styles.userSection]}>
          <Text style={styles.sectionTitle}>👤 User Data (Simulated)</Text>
          <Text style={styles.sectionNote}>
            Example of what you'd fetch from a user database or authentication service.
          </Text>
          <InfoRow label="Name" value={data.user.name} />
          <InfoRow label="Role" value={data.user.role} />
          <InfoRow label="Last Login" value={new Date(data.user.lastLogin).toLocaleString()} />
        </View>

        {/* Stats */}
        <View style={[styles.section, styles.statsSection]}>
          <Text style={styles.sectionTitle}>📊 Statistics</Text>
          <Text style={styles.sectionNote}>
            Example dashboard stats - in production, you'd query your analytics database.
          </Text>
          <View style={styles.statsGrid}>
            <StatCard label="Posts" value={data.stats.totalPosts} />
            <StatCard label="Views" value={data.stats.totalViews} />
            <StatCard label="Comments" value={data.stats.totalComments} />
          </View>
        </View>

        {/* How It Works */}
        <View style={[styles.section, styles.howItWorksSection]}>
          <Text style={styles.sectionTitle}>🔍 How Data Loaders Work</Text>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Loader Execution</Text>
              <Text style={styles.stepText}>
                The <Text style={styles.code}>loader()</Text> function runs on the server
                BEFORE the component renders. It can access databases, APIs, file systems,
                and environment variables.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Data Serialization</Text>
              <Text style={styles.stepText}>
                The returned data is serialized and embedded in the HTML response.
                Secret keys and server-only code never reach the client.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Component Hydration</Text>
              <Text style={styles.stepText}>
                <Text style={styles.code}>useLoaderData()</Text> accesses the pre-loaded
                data instantly. No loading states, no fetch calls, instant rendering.
              </Text>
            </View>
          </View>
        </View>

        {/* Static vs Server */}
        <View style={[styles.section, styles.comparisonSection]}>
          <Text style={styles.sectionTitle}>⚡ Static vs Server Rendering</Text>
          
          <View style={styles.comparisonBox}>
            <Text style={styles.comparisonLabel}>web.output: "static"</Text>
            <Text style={styles.comparisonText}>
              • Loader runs at build time{'\n'}
              • Data baked into HTML files{'\n'}
              • No server required for hosting{'\n'}
              • request parameter is undefined{'\n'}
              • Great for blogs, docs, marketing sites
            </Text>
          </View>

          <View style={[styles.comparisonBox, styles.serverBox]}>
            <Text style={styles.comparisonLabel}>web.output: "server"</Text>
            <Text style={styles.comparisonText}>
              • Loader runs on each request{'\n'}
              • Dynamic, personalized content{'\n'}
              • Access to request headers/cookies{'\n'}
              • Real-time data fetching{'\n'}
              • Required for user-specific content
            </Text>
          </View>

          <Text style={styles.currentMode}>
            📍 This app is currently using: <Text style={styles.code}>server</Text> mode
          </Text>
        </View>

        {/* Best Practices */}
        <View style={[styles.section, styles.bestPracticesSection]}>
          <Text style={styles.sectionTitle}>✅ Best Practices</Text>
          
          <BestPractice 
            icon="✓"
            text="Use loaders for data that must be available at render time"
          />
          <BestPractice 
            icon="✓"
            text="Keep secrets in loaders - they never reach the client bundle"
          />
          <BestPractice 
            icon="✓"
            text="Wrap components with Suspense for loading states"
          />
          <BestPractice 
            icon="✓"
            text="Export ErrorBoundary to handle loader failures gracefully"
          />
          <BestPractice 
            icon="✓"
            text="Use TypeScript's typeof loader for type-safe data access"
          />
          <BestPractice 
            icon="⚠"
            text="Avoid heavy computations - loaders should be fast"
          />
        </View>
      </ScrollView>
    </>
  );
}

// Helper Components
function FeatureItem({ enabled, label, note }: { enabled: boolean; label: string; note?: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{enabled ? '✅' : '❌'}</Text>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureLabel}>{label}</Text>
        {note && <Text style={styles.featureNote}>{note}</Text>}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BestPractice({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.bestPracticeItem}>
      <Text style={styles.bestPracticeIcon}>{icon}</Text>
      <Text style={styles.bestPracticeText}>{text}</Text>
    </View>
  );
}

export default function DataLoadersDemo() {
  return (
    <Suspense fallback={
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading data from server...</Text>
        <Text style={styles.loadingSubtext}>
          This Suspense fallback shows while the loader runs
        </Text>
      </View>
    }>
      <DataLoadersContent />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#d32f2f',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorNote: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorNoteText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 15,
    color: '#333',
  },
  featureNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  serverSection: {
    backgroundColor: '#f3e5f5',
  },
  sectionNote: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  serverNote: {
    marginTop: 12,
    fontSize: 13,
    color: '#4a148c',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    width: 140,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  userSection: {
    backgroundColor: '#e3f2fd',
  },
  statsSection: {
    backgroundColor: '#e8f5e9',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  howItWorksSection: {
    backgroundColor: '#fff8e1',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff6f00',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  stepText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    fontSize: 13,
  },
  comparisonSection: {
    backgroundColor: '#fce4ec',
  },
  comparisonBox: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  serverBox: {
    borderLeftColor: '#2196f3',
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  comparisonText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  currentMode: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  bestPracticesSection: {
    backgroundColor: '#e0f2f1',
  },
  bestPracticeItem: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  bestPracticeIcon: {
    fontSize: 16,
    width: 24,
  },
  bestPracticeText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
