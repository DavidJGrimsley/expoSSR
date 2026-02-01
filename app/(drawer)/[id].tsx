import { Link, useLoaderData, type ErrorBoundaryProps } from 'expo-router';
import Head from 'expo-router/head';
import { Suspense } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BLOG_POSTS, type BlogPost } from '../../data/API';

type LoaderRequest = {
  url?: string;
};

interface BlogDetailResponse {
  success: boolean;
  kind: 'detail';
  data: BlogPost;
  error?: string;
}

function getRequestOrigin(request?: LoaderRequest) {
  if (!request?.url) return null;
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

// Server-side data loader with dynamic route params
export async function loader(
  request: LoaderRequest | undefined,
  params: Record<string, string | string[]>
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const origin = getRequestOrigin(request);
  const idParam = params.id;
  const postId = Array.isArray(idParam) ? idParam[0] : idParam;

  if (origin) {
    const response = await fetch(`${origin}/api/blog/${encodeURIComponent(postId ?? '')}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BlogDetailResponse = await response.json();

    if (!result.success || result.kind !== 'detail') {
      throw new Error(result.error || `Post with ID "${postId ?? ''}" not found`);
    }

    return {
      post: result.data,
      loadedAt: new Date().toISOString(),
      params: { id: postId ?? '' },
      method: 'data-loader',
    };
  }

  // Static export fallback (no request object)
  const post = BLOG_POSTS.find(p => p.id === postId);

  if (!post) {
    throw new Error(`Post with ID "${postId ?? ''}" not found`);
  }

  return {
    post,
    loadedAt: new Date().toISOString(),
    params: { id: postId ?? '' },
    method: 'data-loader',
  };
}

// Error boundary for loader errors
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <ScrollView contentContainerStyle={styles.errorContainer}>
      <Text style={styles.errorEmoji}>❌</Text>
      <Text style={styles.errorTitle}>Error Loading Post</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      
      <Pressable style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>

      <View style={styles.errorNote}>
        <Text style={styles.errorNoteTitle}>🔍 What Happened?</Text>
        <Text style={styles.errorNoteText}>
          The data loader threw an error while fetching the post. This could happen if:
        </Text>
        <Text style={styles.errorNoteText}>
          • The post ID doesn&apos;t exist in the database
        </Text>
        <Text style={styles.errorNoteText}>
          • An external API call failed
        </Text>
        <Text style={styles.errorNoteText}>
          • A database connection error occurred
        </Text>
        <Text style={[styles.errorNoteText, { marginTop: 8 }]}>
          The ErrorBoundary caught this error and prevented the app from crashing.
          You can customize this UI to match your app&apos;s design.
        </Text>
      </View>

      <Link href="/blog-loader" style={styles.backLink}>
        <Text style={styles.backLinkText}>← Back to Blog</Text>
      </Link>
    </ScrollView>
  );
}

function PostContent() {
  const data = useLoaderData<typeof loader>();
  const { post, loadedAt, params, method } = data;

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <ScrollView style={styles.container}>
        <Link href="/blog-loader" style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Blog</Text>
        </Link>

        <Text style={styles.title}>{post.title}</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.author}>By {post.author}</Text>
          <Text style={styles.date}>
            {formatDate(post.date)} • {post.readTime} min read
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📦 Data Loader Metadata</Text>
          <Text style={styles.infoText}>
            • Post ID from URL: {params.id}
          </Text>
          <Text style={styles.infoText}>
            • Loaded at: {new Date(loadedAt).toLocaleTimeString()}
          </Text>
          <Text style={styles.infoText}>
            • Method: {method}
          </Text>
          <Text style={styles.infoText}>
            • Tags: {post.tags.join(', ')}
          </Text>
          <Text style={styles.infoNote}>
            💡 The loader() function ran on the server and called the internal API route
            before rendering this page. Secrets stay on the server, and the serialized
            data is embedded in the HTML response.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>

        <View style={styles.howItWorksBox}>
          <Text style={styles.howItWorksTitle}>🔍 How SSR + Data Loaders Work Together</Text>
          <Text style={styles.howItWorksText}>
            <Text style={styles.howItWorksBold}>SSR (Server-Side Rendering)</Text> means the HTML is 
            generated on the server, not in the browser. But SSR alone doesn&apos;t fetch data.
          </Text>
          <Text style={styles.howItWorksText}>
            <Text style={styles.howItWorksBold}>Data Loaders</Text> fetch the data that SSR needs to 
            render complete HTML. Together they enable:
          </Text>
          <View style={styles.howItWorksList}>
            <Text style={styles.howItWorksStep}>
              1. <Text style={styles.howItWorksBold}>Request arrives:</Text> Browser requests /blog-loader/{params.id}
            </Text>
            <Text style={styles.howItWorksStep}>
              2. <Text style={styles.howItWorksBold}>Loader executes:</Text> loader() function runs on server with route params
            </Text>
            <Text style={styles.howItWorksStep}>
              3. <Text style={styles.howItWorksBold}>Data fetched:</Text> Post data retrieved from database/API (with secrets safe)
            </Text>
            <Text style={styles.howItWorksStep}>
              4. <Text style={styles.howItWorksBold}>Serialization:</Text> Data converted to JSON, embedded in HTML
            </Text>
            <Text style={styles.howItWorksStep}>
              5. <Text style={styles.howItWorksBold}>Component renders:</Text> Full HTML with content sent to browser
            </Text>
            <Text style={styles.howItWorksStep}>
              6. <Text style={styles.howItWorksBold}>Instant display:</Text> No loading states, perfect SEO, complete content
            </Text>
          </View>
          <Text style={styles.howItWorksNote}>
            ⚠️ Try visiting /blog-loader/999 to see the ErrorBoundary catch invalid post IDs
          </Text>
        </View>

        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>🔄 Comparison: Client Fetch + API Routes vs Data Loaders</Text>
          
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>/blog/[id] (Client-Side Fetch + API Route):</Text>
            <Text style={styles.comparisonText}>
              1. Component mounts with loading state{'\n'}
              2. useEffect triggers fetch to /api/blog/[id]{'\n'}
              3. API route processes request on server{'\n'}
              4. Response returns to client{'\n'}
              5. setState updates and re-renders{'\n'}
              6. Content displays (waterfall delay, loading spinner)
            </Text>
            <Text style={styles.comparisonNote}>
              ❌ Loading states, no SEO, waterfall delays, layout shifts
            </Text>
          </View>

          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>/blog-loader/[id] (Server-Side Data Loader):</Text>
            <Text style={styles.comparisonText}>
              1. Server receives request for /blog-loader/[id]{'\n'}
              2. loader() runs on server with params{'\n'}
              3. Data embedded in HTML response{'\n'}
              4. Component renders immediately with data{'\n'}
              5. No loading state, no useEffect, no fetch{'\n'}
              6. Perfect SEO, instant display, complete HTML
            </Text>
            <Text style={styles.comparisonNote}>
              ✅ Fastest perceived load, perfect SEO, no layout shifts
            </Text>
          </View>
        </View>

        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>✅ Key Advantages</Text>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🚀</Text>
            <Text style={styles.benefitText}>
              <Text style={styles.benefitBold}>Performance:</Text> No client-side fetch means
              faster perceived load time and no layout shift
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🔒</Text>
            <Text style={styles.benefitText}>
              <Text style={styles.benefitBold}>Security:</Text> API keys and secrets stay on
              the server, never exposed to the client bundle
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🔍</Text>
            <Text style={styles.benefitText}>
              <Text style={styles.benefitBold}>SEO:</Text> Content in the HTML response means
              perfect crawling and social media previews
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>
              <Text style={styles.benefitBold}>DX:</Text> No useEffect, no loading states, no
              fetch logic - just clean component code
            </Text>
          </View>
        </View>

        <View style={styles.apiLoaderBox}>
          <Text style={styles.apiLoaderTitle}>🤔 Can You Use Both API Routes AND Data Loaders?</Text>
          <Text style={styles.apiLoaderText}>
            Yes! They serve different purposes:
          </Text>
          <Text style={styles.apiLoaderText}>
            • <Text style={styles.mono}>API Routes</Text>: For client-side JavaScript to fetch
            data (actions, forms, dynamic updates)
          </Text>
          <Text style={styles.apiLoaderText}>
            • <Text style={styles.mono}>Data Loaders</Text>: For server-side page data that&apos;s
            needed at render time (initial page load)
          </Text>
          <Text style={styles.apiLoaderText}>
            • <Text style={styles.mono}>This Page</Text>: Uses a data loader to fetch the blog post from the API route!
          </Text>
          <Text style={styles.apiLoaderText} >
            Example: A blog post page could use a data loader for the initial post content,
            then use an API route when a user submits a comment.
          </Text>
        </View>

        <View style={styles.serverNoteBox}>
          <Text style={styles.serverNoteText}>
            ℹ️ This uses <Text style={styles.mono}>web.output: &quot;server&quot;</Text>.
            The loader runs on each request with access to headers, cookies, and the request object.
            With <Text style={styles.mono}>&quot;static&quot;</Text> export, the loader would run at
            build time and request would be undefined.
          </Text>
        </View>

        <View style={styles.tags}>
          {post.tags.map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading post from server...</Text>
        <Text style={styles.loadingSubtext}>
          Data loader is fetching the post data
        </Text>
      </View>
    }>
      <PostContent />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    marginBottom: 16,
  },
  backLinkText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
    lineHeight: 36,
  },
  metaRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  author: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
  },
  infoNote: {
    fontSize: 13,
    color: '#555',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  howItWorksBox: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#E65100',
  },
  howItWorksText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },
  howItWorksBold: {
    fontWeight: '700',
    color: '#111',
  },
  howItWorksList: {
    marginTop: 8,
    marginBottom: 12,
  },
  howItWorksStep: {
    fontSize: 14,
    lineHeight: 24,
    color: '#333',
    marginBottom: 6,
  },
  howItWorksNote: {
    fontSize: 13,
    color: '#E65100',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  comparisonBox: {
    backgroundColor: '#f3e5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: '#6A1B9A',
  },
  comparisonItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#CE93D8',
  },
  comparisonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6A1B9A',
    marginBottom: 8,
  },
  comparisonText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 6,
  },
  comparisonNote: {
    fontSize: 13,
    color: '#555',
    marginTop: 8,
    marginLeft: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  content: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
  },
  benefitsBox: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  benefitIcon: {
    fontSize: 20,
    width: 28,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  benefitBold: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  apiLoaderBox: {
    backgroundColor: '#f3e5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  apiLoaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4a148c',
  },
  apiLoaderText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 6,
  },
  serverNoteBox: {
    backgroundColor: '#e1f5fe',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  serverNoteText: {
    fontSize: 13,
    color: '#01579b',
    lineHeight: 18,
  },
  mono: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '500',
  },
});
