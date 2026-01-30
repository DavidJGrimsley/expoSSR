import { Link, useLoaderData, type ErrorBoundaryProps } from 'expo-router';
import Head from 'expo-router/head';
import { Suspense } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Simulate different data fetching scenarios
export async function loader(request: Request | undefined) {
  // Simulate multiple async operations
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Access environment variables (server-only - never exposed to client)
  const nodeEnv = process.env.NODE_ENV || 'development';

  const databaseURL = process.env.DATABASE_URL || 'not-set';
  const openAIApiKey = process.env.OPENAI_API_KEY || 'not-set';
  const expoPublicApiUrl = process.env.EXPO_PUBLIC_API_URL || 'not-set';
  
  // Simulate fetching from multiple sources (like calling APIs, databases)
  const userData = {
    name: 'Demo User',
    role: 'Developer',
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  };
  
  const statsData = {
    totalPosts: 42,
    totalViews: 1337,
    totalComments: 256,
    engagementRate: 78.5,
  };
  
  // Server-only computation
  const serverTime = new Date().toISOString();
  const randomServerValue = Math.floor(Math.random() * 1000);
  
  // Demonstrate request access (only available in server mode)
  const requestInfo = request ? {
    method: request.method,
    hasHeaders: true,
    userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...' || 'unknown',
  } : null;
  
  return {
    user: userData,
    stats: statsData,
    serverInfo: {
      time: serverTime,
      randomValue: randomServerValue,
      nodeEnv,
      openAIApiKey,
      databaseURL,
      expoPublicApiUrl
    },
    requestInfo,
    features: {
      suspense: true,
      errorBoundary: true,
      dynamicParams: true,
      requestAccess: request !== undefined,
      staticExport: request === undefined,
    },
    comparisonData: {
      apiRoutesAvailable: true,
      clientFetchAvailable: true,
      dataLoadersAvailable: true,
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
        <Text style={styles.errorNoteTitle}>📋 Error Boundary Details</Text>
        <Text style={styles.errorNoteText}>
          This ErrorBoundary caught the error from the loader function.
          In a production app, you might:
        </Text>
        <Text style={styles.errorNoteText}>
          • Log the error to a service like Sentry
        </Text>
        <Text style={styles.errorNoteText}>
          • Show a custom error UI matching your design
        </Text>
        <Text style={styles.errorNoteText}>
          • Provide context-specific recovery actions
        </Text>
        <Text style={styles.errorNoteText}>
          • Redirect to a safe fallback page
        </Text>
      </View>

      <Link href="/" style={styles.backLink}>
        <Text style={styles.backLinkText}>← Back to Home</Text>
      </Link>
    </ScrollView>
  );
}

function DataLoadersContent() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Head>
        <title>Data Loaders Demo</title>
        <meta name="description" content="Comprehensive demonstration of Expo Router data loaders with API routes comparison" />
      </Head>
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📦 Data Loaders Demo</Text>
        <Text style={styles.subtitle}>
          A comprehensive showcase of data loaders alongside API routes and client-side fetch
        </Text>

        {/* Three-Way Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Three Data Fetching Approaches</Text>
          <Text style={styles.sectionSubtitle}>
            This app demonstrates three ways to fetch data. Each has its place in modern web development.
          </Text>
          
          <View style={styles.methodCard}>
            <Text style={styles.methodNumber}>1</Text>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Client-Side Fetch (/blog)</Text>
              <Text style={styles.methodDesc}>
                Component mounts → useEffect → fetch('/api/blog') → setState → re-render
              </Text>
              <Text style={styles.methodPros}>✅ Interactive updates, polling, real-time data</Text>
              <Text style={styles.methodCons}>❌ Loading states, no SEO, waterfall delays, layout shift</Text>
              <Text style={styles.methodNote}>
                💡 The /blog route uses client-side fetch that calls an API route (/api/blog), but it could be making a call to any other API. 
                It's perfect for dynamic updates after page load.
              </Text>
              <Link href="/blog">
                <Text style={styles.methodLink}>Example: /blog →</Text>
              </Link>
            </View>
          </View>

          <View style={styles.methodCard}>
            <Text style={styles.methodNumber}>2</Text>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>API Routes (/examples/api)</Text>
              <Text style={styles.methodDesc}>
                Server endpoint (+api.ts) → client fetches → displays data
              </Text>
              <Text style={styles.methodPros}>✅ Server-side logic, secrets safe, reusable endpoints</Text>
              <Text style={styles.methodCons}>❌ Still requires client fetch, loading states, no SSR benefit</Text>
              <Text style={styles.methodNote}>
                💡 API routes are server-only endpoints perfect for form submissions, mutations, 
                and data that client JavaScript needs to fetch dynamically.
              </Text>
              <Link href="/examples/api">
                <Text style={styles.methodLink}>Example: /examples/api →</Text>
              </Link>
            </View>
          </View>

          <View style={[styles.methodCard, styles.highlightedCard]}>
            <Text style={[styles.methodNumber, styles.highlightedNumber]}>3</Text>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Data Loaders (This Page)</Text>
              <Text style={styles.methodDesc}>
                Server loader() → data embedded in HTML → instant render (no fetch!)
              </Text>
              <Text style={styles.methodPros}>✅ No loading states, perfect SEO, fastest render, no layout shift</Text>
              <Text style={styles.methodCons}>❌ Not for real-time updates or user-triggered dynamic actions</Text>
              <Text style={styles.methodNote}>
                💡 Data loaders run on the server and embed data directly in the HTML response. 
                Perfect for initial page loads that need SEO and instant content display.
              </Text>
              <Text style={styles.methodCurrent}>📍 You are here!</Text>
            </View>
          </View>
        </View>

        {/* Feature Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Data Loader Features</Text>
          <View style={styles.featureGrid}>
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
              note="(Server mode only)"
            />
          </View>
        </View>

        {/* Server Info */}
        <View style={[styles.section, styles.serverSection]}>
          <Text style={styles.sectionTitle}>⚙️ Server-Side Information</Text>
          <InfoRow label="Server Time" value={new Date(data.serverInfo.time).toLocaleString()} />
          <InfoRow label="Environment" value={data.serverInfo.nodeEnv} />
          <InfoRow label="Random Server Value" value={data.serverInfo.randomValue.toString()} />
          <InfoRow label="Random Server Value" value={data.serverInfo.randomValue.toString()} />
          <InfoRow label="databaseURL" value={data.serverInfo.databaseURL} />
          <InfoRow label="openAIApiKey" value={data.serverInfo.openAIApiKey} />
          <InfoRow label="expoPublicApiUrl" value={data.serverInfo.expoPublicApiUrl} />
          <Text style={styles.serverNote}>
            🔒 Environment variables are server-only. They never leak to the client bundle (unless you explicitly expose them like I did PURELY for demonstration),
            even when used in loaders. This makes loaders perfect for API keys, database
            credentials, and other secrets.
          </Text>
        </View>

        {/* Request Info (Server Mode Only) */}
        {data.requestInfo && (
          <View style={[styles.section, styles.requestSection]}>
            <Text style={styles.sectionTitle}>🌐 Request Information</Text>
            <InfoRow label="Method" value={data.requestInfo.method} />
            <InfoRow label="User Agent" value={data.requestInfo.userAgent} />
            <Text style={styles.requestNote}>
              ℹ️ In server mode (web.output: "server"), loaders receive the incoming HTTP
              request. You can access headers, cookies, query params, and more.
            </Text>
          </View>
        )}

        {!data.requestInfo && (
          <View style={[styles.section, styles.staticSection]}>
            <Text style={styles.sectionTitle}>📦 Static Export Mode</Text>
            <Text style={styles.staticNote}>
              This would mean the app was built with web.output: "static". The loader
              ran at build time, and request is undefined. Data is baked into HTML files.
            </Text>
          </View>
        )}

        {/* User Data */}
        <View style={[styles.section, styles.userSection]}>
          <Text style={styles.sectionTitle}>👤 User Data (Simulated)</Text>
          <InfoRow label="Name" value={data.user.name} />
          <InfoRow label="Role" value={data.user.role} />
          <InfoRow label="Last Login" value={new Date(data.user.lastLogin).toLocaleString()} />
          <InfoRow label="Theme" value={data.user.preferences.theme} />
          <InfoRow 
            label="Notifications" 
            value={data.user.preferences.notifications ? 'Enabled' : 'Disabled'} 
          />
        </View>

        {/* Stats */}
        <View style={[styles.section, styles.statsSection]}>
          <Text style={styles.sectionTitle}>📊 Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Posts" value={data.stats.totalPosts} />
            <StatCard label="Views" value={data.stats.totalViews} />
            <StatCard label="Comments" value={data.stats.totalComments} />
            <StatCard label="Engagement" value={`${data.stats.engagementRate}%`} />
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
                BEFORE the component renders. It has full access to:
              </Text>
              <Text style={styles.stepBullet}>• Databases (Postgres, MongoDB, etc.)</Text>
              <Text style={styles.stepBullet}>• File systems (fs/promises)</Text>
              <Text style={styles.stepBullet}>• External APIs (with secret keys)</Text>
              <Text style={styles.stepBullet}>• Environment variables</Text>
              <Text style={styles.stepBullet}>• Request headers & cookies (server mode)</Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Data Serialization</Text>
              <Text style={styles.stepText}>
                The returned data is serialized (JSON.stringify) and embedded in the HTML response.
                Only the data is sent - never the loader code, secrets, or imports.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Component Hydration</Text>
              <Text style={styles.stepText}>
                <Text style={styles.code}>useLoaderData()</Text> accesses the pre-loaded
                data instantly. No useEffect, no fetch, no loading states.
              </Text>
            </View>
          </View>
        </View>

        {/* When to Use What */}
        <View style={[styles.section, styles.whenSection]}>
          <Text style={styles.sectionTitle}>🤔 When to Use Each Method</Text>
          
          <View style={styles.useCase}>
            <Text style={styles.useCaseTitle}>Use Data Loaders When:</Text>
            <Text style={styles.useCaseItem}>✓ Data is needed at page load (blog posts, products)</Text>
            <Text style={styles.useCaseItem}>✓ SEO is critical (landing pages, articles)</Text>
            <Text style={styles.useCaseItem}>✓ You want the fastest perceived performance</Text>
            <Text style={styles.useCaseItem}>✓ Data doesn't change during page view</Text>
          </View>

          <View style={styles.useCase}>
            <Text style={styles.useCaseTitle}>Use API Routes When:</Text>
            <Text style={styles.useCaseItem}>✓ Client needs to trigger actions (POST, DELETE)</Text>
            <Text style={styles.useCaseItem}>✓ Real-time updates or polling</Text>
            <Text style={styles.useCaseItem}>✓ Form submissions or mutations</Text>
            <Text style={styles.useCaseItem}>✓ Third-party integrations need server logic</Text>
          </View>

          <View style={styles.useCase}>
            <Text style={styles.useCaseTitle}>Use Client Fetch When:</Text>
            <Text style={styles.useCaseItem}>✓ Data updates based on user interaction</Text>
            <Text style={styles.useCaseItem}>✓ Infinite scroll or pagination</Text>
            <Text style={styles.useCaseItem}>✓ Public APIs that don't need secrets</Text>
            <Text style={styles.useCaseItem}>✓ SEO is not a concern</Text>
          </View>

          <View style={styles.hybridNote}>
            <Text style={styles.hybridTitle}>💡 Pro Tip: Use Them Together!</Text>
            <Text style={styles.hybridText}>
              A blog post page might use a data loader for the initial post content,
              then use an API route when a user submits a comment. Best of both worlds!
            </Text>
          </View>
        </View>

        {/* Static vs Server */}
        <View style={[styles.section, styles.comparisonSection]}>
          <Text style={styles.sectionTitle}>⚡ Static vs Server Rendering</Text>
          
          <View style={styles.renderModeBox}>
            <Text style={styles.renderModeLabel}>web.output: "static"</Text>
            <Text style={styles.renderModeText}>
              • Loader runs at build time (npx expo export){'\n'}
              • Data baked into HTML files{'\n'}
              • No server required for hosting{'\n'}
              • request parameter is undefined{'\n'}
              • Perfect for: blogs, docs, marketing sites{'\n'}
              • Deployment: Vercel, Netlify, GitHub Pages
            </Text>
          </View>

          <View style={[styles.renderModeBox, styles.serverBox]}>
            <Text style={styles.renderModeLabel}>web.output: "server" (Current)</Text>
            <Text style={styles.renderModeText}>
              • Loader runs on each request{'\n'}
              • Dynamic, personalized content{'\n'}
              • Access to request headers/cookies{'\n'}
              • Real-time data fetching{'\n'}
              • Perfect for: dashboards, user profiles, e-commerce{'\n'}
              • Deployment: VPS, Docker, cloud functions
            </Text>
          </View>
        </View>

        {/* Best Practices */}
        <View style={[styles.section, styles.bestPracticesSection]}>
          <Text style={styles.sectionTitle}>✅ Best Practices</Text>
          
          <BestPractice 
            icon="✓"
            title="Type Safety"
            text="Use typeof loader with useLoaderData for full TypeScript inference"
          />
          <BestPractice 
            icon="✓"
            title="Error Handling"
            text="Export an ErrorBoundary to catch and handle loader failures gracefully"
          />
          <BestPractice 
            icon="✓"
            title="Suspense Boundaries"
            text="Wrap components with Suspense to show loading states while loader runs"
          />
          <BestPractice 
            icon="✓"
            title="Secrets Management"
            text="Keep API keys in environment variables - they never reach the client bundle"
          />
          <BestPractice 
            icon="✓"
            title="Performance"
            text="Keep loaders fast - they block page rendering. Cache when possible."
          />
          <BestPractice 
            icon="⚠"
            title="Avoid Heavy Computations"
            text="Don't run expensive operations in loaders - offload to background jobs if needed"
          />
          <BestPractice 
            icon="⚠"
            title="Data Size"
            text="Don't return massive datasets - they bloat the HTML. Paginate or lazy load."
          />
        </View>

        {/* Examples in This App */}
        <View style={[styles.section, styles.examplesSection]}>
          <Text style={styles.sectionTitle}>🧪 Examples in This App</Text>
          <Text style={styles.examplesNote}>
            These examples use data loaders or highlight loader-friendly patterns for initial page data.
          </Text>
          
          <ExampleLink 
            href="/blog"
            title="Client-Side Fetch"
            description="Blog with useEffect + fetch to API routes"
          />
          <ExampleLink 
            href="/blog-loader"
            title="Data Loaders"
            description="Same blog, but with server-side data loaders"
          />
          <ExampleLink 
            href="/examples/api"
            title="API Routes Info"
            description="Demonstrates server-only capabilities"
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

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BestPractice({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <View style={styles.bestPracticeItem}>
      <Text style={styles.bestPracticeIcon}>{icon}</Text>
      <View style={styles.bestPracticeContent}>
        <Text style={styles.bestPracticeTitle}>{title}</Text>
        <Text style={styles.bestPracticeText}>{text}</Text>
      </View>
    </View>
  );
}

function ExampleLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href as any} style={styles.exampleLink}>
      <View style={styles.exampleCard}>
        <Text style={styles.exampleTitle}>{title}</Text>
        <Text style={styles.exampleDesc}>{description}</Text>
        <Text style={styles.exampleArrow}>→</Text>
      </View>
    </Link>
  );
}

export default function DataLoadersDemo() {
  return (
    <Suspense fallback={
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading comprehensive demo...</Text>
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
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorNote: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    maxWidth: 400,
  },
  errorNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorNoteText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
    marginBottom: 4,
  },
  backLink: {
    marginTop: 12,
  },
  backLinkText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
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
  methodCard: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    gap: 12,
  },
  highlightedCard: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  methodNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#666',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  highlightedNumber: {
    backgroundColor: '#0066cc',
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111',
  },
  methodDesc: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    lineHeight: 18,
  },
  methodPros: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 2,
  },
  methodCons: {
    fontSize: 12,
    color: '#c62828',
    marginBottom: 4,
  },
  methodNote: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    marginBottom: 6,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  methodLink: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  methodCurrent: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '600',
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureGrid: {
    gap: 10,
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
  serverNote: {
    marginTop: 12,
    fontSize: 13,
    color: '#4a148c',
    lineHeight: 18,
  },
  requestSection: {
    backgroundColor: '#e1f5fe',
  },
  requestNote: {
    marginTop: 12,
    fontSize: 13,
    color: '#01579b',
    lineHeight: 18,
  },
  staticSection: {
    backgroundColor: '#fff8e1',
  },
  staticNote: {
    fontSize: 14,
    color: '#f57f17',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    width: 160,
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
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
    marginBottom: 6,
  },
  stepBullet: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginBottom: 2,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    fontSize: 13,
  },
  whenSection: {
    backgroundColor: '#fce4ec',
  },
  useCase: {
    marginBottom: 16,
  },
  useCaseTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111',
  },
  useCaseItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
    lineHeight: 18,
  },
  hybridNote: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  hybridTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#c2185b',
  },
  hybridText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  comparisonSection: {
    backgroundColor: '#e0f2f1',
  },
  renderModeBox: {
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
  renderModeLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  renderModeText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  bestPracticesSection: {
    backgroundColor: '#e0f7fa',
  },
  bestPracticeItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  bestPracticeIcon: {
    fontSize: 16,
    width: 24,
  },
  bestPracticeContent: {
    flex: 1,
  },
  bestPracticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  bestPracticeText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  examplesSection: {
    backgroundColor: '#f3e5f5',
  },
  examplesNote: {
    fontSize: 13,
    color: '#5e35b1',
    marginBottom: 12,
    lineHeight: 18,
  },
  exampleLink: {
    marginBottom: 12,
  },
  exampleCard: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  exampleDesc: {
    fontSize: 13,
    color: '#666',
  },
  exampleArrow: {
    position: 'absolute',
    right: 14,
    top: '50%',
    fontSize: 20,
    color: '#9c27b0',
  },
});
