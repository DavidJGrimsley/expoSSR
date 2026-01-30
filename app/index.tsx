import { Link, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SSR_DATA } from '../data/SSR';
import { STATIC_DATA } from '../data/static';

type ApiInfoResponse = {
  success: boolean;
  message: string;
  serverOnlyData?: any;
  note: string;
  error?: string;
};

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
};

type BlogListResponse = {
  success: boolean;
  kind: 'list';
  data: BlogPost[];
  error?: string;
};

export default function Index() {
  const taskHref = '/examples/tasks' as Href;
  const gardenHref = '/examples/garden' as Href;

  const [apiInfo, setApiInfo] = useState<ApiInfoResponse | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [blogPreview, setBlogPreview] = useState<BlogPost | null>(null);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiInfo = async () => {
      try {
        setApiLoading(true);
        setApiError(null);

        const response = await fetch('/api');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiInfoResponse = await response.json();

        if (result.success) {
          setApiInfo(result);
        } else {
          setApiError(result.error || 'Failed to fetch API info');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setApiError(`Error fetching API info: ${message}`);
      } finally {
        setApiLoading(false);
      }
    };

    const fetchBlogPreview = async () => {
      try {
        setBlogLoading(true);
        setBlogError(null);

        const response = await fetch('/api/blog?limit=1&offset=0');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: BlogListResponse = await response.json();

        if (result.success && result.kind === 'list') {
          setBlogPreview(result.data[0] ?? null);
        } else {
          setBlogError(result.error || 'Failed to fetch blog preview');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setBlogError(`Error fetching blog: ${message}`);
      } finally {
        setBlogLoading(false);
      }
    };

    fetchApiInfo();
    fetchBlogPreview();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SSR + API Routes Demo</Text>
        <Text style={styles.subtitle}>Expo Router SDK 55 with Server Output</Text>
        <Text style={styles.body}>
          This project demonstrates Server-Side Rendering (SSR) and API Routes. 
          SSR renders HTML on each request and injects <Text style={styles.mono}>&lt;Head&gt;</Text> tags for SEO. 
          API routes provide server-only endpoints for secure data fetching.
        </Text>
        <Text style={styles.note}>
          💡 To verify SSR: View page source (not DOM inspector) and look for the{' '}
          <Text style={styles.mono}>&lt;title&gt;</Text> and{' '}
          <Text style={styles.mono}>&lt;meta&gt;</Text> tags in the raw HTML response.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interactive Examples</Text>
        <Text style={styles.sectionSubtitle}>
          Explore different data fetching patterns and server capabilities
        </Text>

        <Link href="/examples/static" asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.card, pressed && styles.cardPressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>📄 Static Data</Text>
                  <Text style={styles.badge}>Build-time</Text>
                </View>
                <Text style={styles.cardPreview} numberOfLines={1}>
                  {STATIC_DATA}
                </Text>
              </View>
            )}
          </Pressable>
        </Link>

        <Link href="/examples/ssr" asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.card, pressed && styles.cardPressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>⚡ SSR Reality Check</Text>
                  <Text style={styles.badge}>Server-rendered</Text>
                </View>
                <Text style={styles.cardPreview} numberOfLines={1}>
                  {SSR_DATA}
                </Text>
              </View>
            )}
          </Pressable>
        </Link>

        <Link href="/examples/api" asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.card, pressed && styles.cardPressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>🔒 API Routes</Text>
                  <Text style={styles.badge}>Server-only</Text>
                </View>
                {apiLoading && (
                  <View style={styles.inlineRow}>
                    <ActivityIndicator size="small" color="#0066cc" />
                    <Text style={styles.cardPreview}>Fetching from server…</Text>
                  </View>
                )}
                {!apiLoading && apiError && <Text style={styles.errorText}>{apiError}</Text>}
                {!apiLoading && !apiError && apiInfo && (
                  <Text style={styles.cardPreview} numberOfLines={1}>
                    {apiInfo.message}
                  </Text>
                )}
              </View>
            )}
          </Pressable>
        </Link>

        
        <Link href="/blog" asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.card, pressed && styles.cardPressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>📝 Blog Posts</Text>
                  <Text style={styles.badge}>API-powered</Text>
                </View>
                {blogLoading && (
                  <View style={styles.inlineRow}>
                    <ActivityIndicator size="small" color="#0066cc" />
                    <Text style={styles.cardPreview}>Loading blog preview…</Text>
                  </View>
                )}
                {!blogLoading && blogError && <Text style={styles.errorText}>{blogError}</Text>}
                {!blogLoading && !blogError && blogPreview && (
                  <Text style={styles.cardPreview} numberOfLines={1}>
                    {blogPreview.title} — {blogPreview.excerpt}
                  </Text>
                )}
              </View>
            )}
          </Pressable>
        </Link>

        <Link href={taskHref} asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.card, pressed && styles.cardPressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>✅ Simple Tasks</Text>
                  <Text style={styles.badge}>runTask + deferTask</Text>
                </View>
                <Text style={styles.cardPreview} numberOfLines={1}>
                  Start a task and watch runTask vs. deferTask behavior.
                </Text>
              </View>
            )}
          </Pressable>
        </Link>

        <Link href={gardenHref} asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.card, pressed && styles.cardPressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>🌱 Pixel Garden</Text>
                  <Text style={styles.badge}>Async growth</Text>
                </View>
                <Text style={styles.cardPreview} numberOfLines={1}>
                  Plant seeds now, blooms arrive after the response.
                </Text>
              </View>
            )}
          </Pressable>
        </Link>
        
        <Link href="/examples/blockchain" asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.card, pressed && styles.cardPressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>🔗 Blockchain Demo</Text>
                  <Text style={styles.badge}>Hashing</Text>
                </View>
                <Text style={styles.cardPreview} numberOfLines={1}>
                  Add blocks and view a simple linked chain (local simulation).
                </Text>
              </View>
            )}
          </Pressable>
        </Link>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 3,
    borderBottomColor: '#0066cc',
  },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 6, color: '#111' },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#0066cc' },
  body: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 12 },
  note: { fontSize: 14, color: '#666', lineHeight: 20, fontStyle: 'italic' },
  mono: { fontFamily: 'monospace', backgroundColor: '#e9ecef', paddingHorizontal: 4 },
  section: {
    padding: 20,
    gap: 10,
  },
  sectionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 6, color: '#111' },
  sectionSubtitle: { fontSize: 15, color: '#666', marginBottom: 20 },
  card: {
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#333',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPressed: {
    backgroundColor: '#f0f7ff',
    borderColor: '#0066cc',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '600',
    color: '#111',
    flex: 1,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardPreview: { 
    fontSize: 15, 
    color: '#666',
    lineHeight: 22,
  },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { fontSize: 14, color: '#cc0000' },
});
