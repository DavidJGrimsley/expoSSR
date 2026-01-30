import { useLoaderData, type ErrorBoundaryProps } from 'expo-router';
import Head from 'expo-router/head';
import { Suspense } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { BLOG_POSTS } from '../../data/load';

// Server-side data loader with dynamic route params
// This runs on the SERVER and receives the URL parameter (id)
export async function loader(request: Request | undefined, params: { id: string }) {
  // ⚠️ Artificial delay simulates real API/database call
  // In production: const post = await db.posts.findById(params.id)
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const post = BLOG_POSTS.find(p => p.id === params.id);
  
  if (!post) {
    throw new Error(`Post with ID "${params.id}" not found`);
  }
  
  return {
    post,
    loadedAt: new Date().toISOString(),
    params,
  };
}

// Error boundary for loader errors
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>❌ Error Loading Post</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Pressable style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

function PostContent() {
  const data = useLoaderData<typeof loader>();
  const { post, loadedAt, params } = data;

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.content.substring(0, 150)} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content.substring(0, 150)} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <View style={styles.container}>
        <Text style={styles.title}>{post.title}</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.author}>By {post.author}</Text>
          <Text style={styles.date}>
            {new Date(post.publishedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📦 Data Loader Details</Text>
          <Text style={styles.infoText}>
            • Post ID from URL: {params.id}
          </Text>
          <Text style={styles.infoText}>
            • Loaded at: {new Date(loadedAt).toLocaleTimeString()}
          </Text>
          <Text style={styles.infoText}>
            • Method: Server-side loader
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>🔍 How SSR + Data Loaders Work Together</Text>
          <Text style={styles.noteText}>
            <Text style={styles.bold}>SSR (Server-Side Rendering)</Text> means the HTML is 
            generated on the server, not in the browser. But SSR alone doesn't fetch data.
          </Text>
          <Text style={styles.noteText} style={{ marginTop: 6 }}>
            <Text style={styles.bold}>Data Loaders</Text> fetch the data that SSR needs to 
            render complete HTML. Together they enable:
          </Text>
          <Text style={styles.noteText}>
            • Complete HTML with content (not just empty shells)
          </Text>
          <Text style={styles.noteText}>
            • Perfect SEO - search engines see actual content
          </Text>
          <Text style={styles.noteText}>
            • Instant display - no "loading..." states
          </Text>
          <Text style={styles.noteText}>
            • Secrets safe - API keys stay on server
          </Text>
          <Text style={styles.noteText} style={{ marginTop: 6 }}>
            Try /blog-loader/2 or /blog-loader/3. Invalid IDs trigger ErrorBoundary.
          </Text>
        </View>

        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>📊 Comparison</Text>
          <Text style={styles.comparisonText}>
            • <Text style={styles.mono}>/blog/[id]</Text> - No loader, params from useLocalSearchParams()
          </Text>
          <Text style={styles.comparisonText}>
            • <Text style={styles.mono}>/blog-loader/[id]</Text> - Server loader with params, data pre-fetched
          </Text>
        </View>
      </View>
    </>
  );
}

export default function PostPage() {
  return (
      <Suspense fallback={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading post from server...</Text>
        </View>
      }>
        <PostContent />
      </Suspense>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    backgroundColor: '#c2e4ed',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 12,
    color: '#111',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  author: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  content: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  noteBox: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
    lineHeight: 18,
  },
  comparisonBox: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
  },
  comparisonTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  comparisonText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  mono: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
  },
  bold: {
    fontWeight: '600',
    color: '#111',
  },
});
