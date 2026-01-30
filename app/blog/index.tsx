import { Link } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: number;
}

interface BlogResponse {
  success: boolean;
  kind: 'list';
  data: BlogPost[];
  total: number;
  limit: number;
  offset: number;
  error?: string;
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch blog posts from the API route
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/blog?limit=10&offset=0');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: BlogResponse = await response.json();
        
        if (result.success && result.kind === 'list') {
          setPosts(result.data);
        } else {
          setError(result.error || 'Failed to fetch posts');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error fetching posts: ${message}`);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    // Parse as local date to avoid timezone offset issues
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
        <title>Blog</title>
        <meta name="description" content="Blog posts about Expo Router and web development." />
      </Head>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Blog</Text>
        <Text style={styles.subtitle}>
          Articles about Expo Router, SSR, API routes, and more. The data below is fetched from an API route. All of the posts are fake and the names are purely to be comical and to pay homage to helpful developers.
        </Text>

        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {!loading && !error && posts.length === 0 && (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No posts found.</Text>
          </View>
        )}

        {!loading && !error && posts.length > 0 && (
          <View style={styles.postsList}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                asChild
              >
                <View style={styles.postCard}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postExcerpt}>{post.excerpt}</Text>
                  <View style={styles.postMeta}>
                    <Text style={styles.metaText}>
                      {post.author} • {formatDate(post.date)} • {post.readTime} min read
                    </Text>
                  </View>
                </View>
              </Link>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Link href="/">
            <Link.Trigger>
              <Text style={styles.backLink}>← Back to Home</Text>
            </Link.Trigger>
          </Link>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#cc0000',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  postsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  postMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 12,
  },
  backLink: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
});
