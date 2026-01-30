import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
};

type BlogDetailResponse = {
  success: boolean;
  kind: 'detail';
  data: BlogPost;
  error?: string;
};

export default function PostPage() {
  const { id } = useLocalSearchParams();
  const postId = Array.isArray(id) ? id[0] : id;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackTitle = useMemo(() => `Post ${postId ?? ''}`.trim(), [postId]);

  useEffect(() => {
    if (!postId) {
      setError('Missing post id');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/blog/${encodeURIComponent(postId)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: BlogDetailResponse = await response.json();

        if (result.success && result.kind === 'detail') {
          setPost(result.data);
        } else {
          setError(result.error || 'Failed to fetch post');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error fetching post: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const title = post?.title ?? fallbackTitle;
  const description = post ? `${post.title} by ${post.author}` : 'Blog post detail page';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <View style={styles.container}>
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Loading post...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && post && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>🔄 Client-Side Fetch + API Route</Text>
              <Text style={styles.infoText}>
                This page uses <Text style={styles.bold}>client-side fetching</Text> to call an{' '}
                <Text style={styles.bold}>API route</Text> (/api/blog/{postId}). The flow:
              </Text>
              <Text style={styles.infoStep}>
                1. Component mounts with loading state
              </Text>
              <Text style={styles.infoStep}>
                2. useEffect triggers fetch to server API route
              </Text>
              <Text style={styles.infoStep}>
                3. API route processes request on server
              </Text>
              <Text style={styles.infoStep}>
                4. Response returns to client
              </Text>
              <Text style={styles.infoStep}>
                5. setState updates and re-renders with content
              </Text>
              <Text style={styles.infoNote}>
                💡 Compare this to /blog-loader/{postId} which uses data loaders for instant rendering!
              </Text>
            </View>

            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.metaText}>
              {post.author} • {post.date} • {post.readTime} min read
            </Text>
            <View style={styles.tagRow}>
              {post.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
            <Text style={styles.body}>{post.content}</Text>
          </>
        )}

        <View style={styles.footer}>
          <Link href="/blog">
            <Link.Trigger>
              <Text style={styles.backLink}>← Back to Blog</Text>
            </Link.Trigger>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  centerContent: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { marginTop: 8, color: '#666' },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffe6e6',
    borderLeftWidth: 4,
    borderLeftColor: '#cc0000',
    marginBottom: 16,
  },
  errorText: { color: '#cc0000' },
  infoBox: {
    backgroundColor: '#fff3e0',
    padding: 16,
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
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#E65100',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 10,
  },
  infoStep: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 4,
    marginLeft: 8,
  },
  infoNote: {
    fontSize: 13,
    color: '#E65100',
    marginTop: 10,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#111',
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  metaText: { color: '#666', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: {
    backgroundColor: '#eef5ff',
    color: '#2a5bd7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  body: { fontSize: 15, lineHeight: 22, color: '#333' },
  footer: { marginTop: 24 },
  backLink: { color: '#0066cc', fontWeight: '600' },
});
