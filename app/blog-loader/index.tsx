import { Link, useLoaderData } from 'expo-router';
import Head from 'expo-router/head';
import { Suspense } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BLOG_POSTS, type BlogPostSummary } from '../../data/API';

interface LoaderData {
  posts: BlogPostSummary[];
  total: number;
  loadedAt: string;
  method: 'data-loader';
}

interface BlogListResponse {
  success: boolean;
  kind: 'list';
  data: BlogPostSummary[];
  total?: number;
  error?: string;
}

function getRequestOrigin(request?: Request) {
  if (!request?.url) return null;
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

// Server-side data loader - replaces client-side fetch
export async function loader(request?: Request) {
  // Simulate API delay to showcase Suspense
  await new Promise(resolve => setTimeout(resolve, 400));

  const origin = getRequestOrigin(request);

  if (origin) {
    const response = await fetch(`${origin}/api/blog?limit=10&offset=0`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BlogListResponse = await response.json();

    if (!result.success || result.kind !== 'list') {
      throw new Error(result.error || 'Failed to fetch posts');
    }

    return {
      posts: result.data,
      total: result.total ?? result.data.length,
      loadedAt: new Date().toISOString(),
      method: 'data-loader',
    };
  }

  // Static export fallback (no request object)
  const posts: BlogPostSummary[] = BLOG_POSTS.map(({ content, ...post }) => post);

  return {
    posts,
    total: posts.length,
    loadedAt: new Date().toISOString(),
    method: 'data-loader',
  };
}

function BlogContent() {
  const data = useLoaderData<typeof loader>();

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Head>
        <title>Blog (Data Loaders)</title>
        <meta name="description" content="Blog posts fetched with data loaders for instant SSR." />
      </Head>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Blog (with Data Loaders)</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📦 Data Loader Execution Details</Text>
          <Text style={styles.infoText}>
            • Data fetched: Server-side (before render)
          </Text>
          <Text style={styles.infoText}>
            • Loaded at: {new Date(data.loadedAt).toLocaleTimeString()}
          </Text>
          <Text style={styles.infoText}>
            • Total posts: {data.total}
          </Text>
          <Text style={styles.infoText}>
            • Method: {data.method}
          </Text>
          <Text style={styles.infoNote}>
            💡 The loader() function ran on the server and called the internal API route
            before rendering this page. Secrets stay on the server, and no client-side fetch
            is needed for the initial render.
          </Text>
        </View>


        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>✅ Data Loader Benefits</Text>
          <Text style={styles.benefitText}>
            • No loading states needed (data ready at render time)
          </Text>
          <Text style={styles.benefitText}>
            • Perfect SEO (data in HTML response)
          </Text>
          <Text style={styles.benefitText}>
            • Secrets safe (API keys never reach client)
          </Text>
          <Text style={styles.benefitText}>
            • Faster perceived performance (no fetch waterfall)
          </Text>
        </View>

        <View style={styles.serverNoteBox}>
          <Text style={styles.serverNoteText}>
            ℹ️ This uses <Text style={styles.mono}>web.output: "server"</Text>.
            The loader runs on each request. With <Text style={styles.mono}>"static"</Text>,
            it would run at build time and data would be baked into HTML files.
          </Text>
        </View>

        <Text style={styles.subtitle}>
          All posts below were loaded server-side. The names are purely comical and pay homage to helpful developers.
        </Text>

        {data.posts.length === 0 && (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No posts found.</Text>
          </View>
        )}

        {data.posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <Link href={`/blog-loader/${post.id}`}>
              <Link.Trigger>
                <Text style={styles.postTitle}>{post.title}</Text>
              </Link.Trigger>
              <Link.Preview />
            </Link>
            <Text style={styles.postExcerpt}>{post.excerpt}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.postMetaText}>
                {post.author} • {formatDate(post.date)} • {post.readTime} min read
              </Text>
              <View style={styles.tags}>
                {post.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Compare this experience to <Text style={styles.mono}>/blog</Text> which uses
            client-side fetch to an API route.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

export default function BlogLoaderIndex() {
  return (
    <Suspense fallback={
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading blog posts from server...</Text>
        <Text style={styles.loadingSubtext}>
          This Suspense boundary shows while the data loader runs
        </Text>
      </View>
    }>
      <BlogContent />
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
  centerContent: {
    padding: 32,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
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
    fontSize: 17,
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
    marginTop: 10,
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
    backgroundColor: '#fff3e0',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111',
  },
  methodRow: {
    marginBottom: 10,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  methodDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginLeft: 8,
  },
  benefitsBox: {
    backgroundColor: '#e8f5e9',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111',
  },
  benefitText: {
    fontSize: 13,
    color: '#2e7d32',
    marginBottom: 4,
    lineHeight: 18,
  },
  serverNoteBox: {
    backgroundColor: '#f3e5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  serverNoteText: {
    fontSize: 13,
    color: '#4a148c',
    lineHeight: 18,
  },
  mono: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  postCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'column',
    gap: 8,
  },
  postMetaText: {
    fontSize: 13,
    color: '#777',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#0066cc',
    fontWeight: '500',
  },
  footerNote: {
    marginTop: 24,
    marginBottom: 32,
    padding: 14,
    backgroundColor: '#fce4ec',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#880e4f',
    lineHeight: 18,
  },
});
