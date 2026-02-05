import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Comic {
  id: number;
  title: string;
  issueNumber: string;
  description: string;
}

export default function ComicPage() {
  const { id } = useLocalSearchParams();
  const [comic, setComic] = useState<Comic | null>(null);
  const [loading, setLoading] = useState(true);
  const instructions = "Export to dist. Serve locally. Right click this page and click 'view page source', not 'inspect'. The raw HTML contains the meta tags for this comic.";

  useEffect(() => {
    const fetchComic = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://marvel.emreparker.com/v1/issues/${id}`, {
          headers: {
            accept: 'application/json'
          }
        });
        const data = await response.json();
        console.log('API response:', data);
        
        // Validate that the response has the expected comic structure
        if (data && data.id && data.title) {
          console.log('Comic found for id:', id);
          setComic(data);
        } else {
          console.log('Comic not found for id:', id);
          setComic(null);
        }
      } catch (error) {
        console.error('Failed to fetch comic:', error);
        setComic(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComic();
    }
  }, [id]);

  const title = id ? `Comic ${id}` : 'Comic';

  if (loading) {
    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content="Loading comic..." />
        </Head>
        <View style={styles.container}>
          <Text style={styles.title}>Loading...</Text>
        </View>
      </>
    );
  }

  if (!comic) {
    console.log('Comic not found for metadata for:', id);
    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content="This comic does not exist." />
        </Head>
        <View style={styles.container}>
          <Text style={styles.title}>Comic Not Found</Text>
          <Text style={styles.body}>This comic doesn&apos;t exist</Text>
          <Text style={styles.body}>{instructions}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={comic.description} />
        <meta property="og:title" content={comic.title} />
        <meta property="og:description" content={comic.description} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <View style={styles.container}>
        <Text style={styles.title}>The purpose of this page is to demonstrate server-side rendering with dynamic routes.</Text>
        <Text style={styles.body}>{instructions}</Text>
        <Text style={styles.title}>{comic.title}</Text>
        <Text style={styles.body}>{comic.description}</Text>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  body: { color: '#333' },
});
