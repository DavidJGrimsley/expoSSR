import { Link, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Comic {
  id: number;
  title: string;
  issueNumber: string;
  description: string;
}

export default function MarvelComicsIndex() {
  const router = useRouter();
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [comicId, setComicId] = useState('');

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://marvel.emreparker.com/v1/issues?year=2015&series_id=16452&limit=10', {
        headers: {
          accept: 'application/json'
        }
      });
      const data = await response.json();
      console.log(data);
      setComics(data.items || []);
    } catch (error) {
      console.error('Failed to fetch comics:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToComic = () => {
    const trimmed = comicId.trim();
    if (!trimmed) return;
    router.push(`/marvel-comics/${trimmed}`);
  };

  return (
    <>
      <Head>
        <title>Marvel Comics | SSR Test</title>
        <meta name="description" content="Marvel Comics listing page to test server-side rendering." />
        <meta property="og:title" content="Marvel Comics | SSR Test" />
        <meta property="og:description" content="Marvel Comics listing page to test server-side rendering." />
      </Head>
      <View style={styles.container}>
      <Text style={styles.title}>Marvel Comics</Text>
      <Text style={styles.body}>
        Dynamic SSR proof: request a new URL like /marvel-comics/123 and confirm the raw HTML
        contains <Text style={styles.mono}>&lt;title&gt;Comic 123&lt;/title&gt;</Text> and matching meta tags.
        Seeing “Comic 1” in the tab is expected, but the raw HTML response is the proof.
      </Text>
      <Text style={styles.caption}>Notice the delay of the list loading in because this page fetches data on the client side. Contrast this with no delay on the data-loaders page because the data is baked into the HTML.</Text>

      <Text style={styles.sectionTitle}>Go to a comic</Text>
      <Text style={styles.body}>
        Enter a comic ID and navigate. This mirrors how a real app would deep-link to
        a user’s comic in a UGC feed. This API is just a random example I used. There are thousands of issues but not all 5 digit numbers will work. I have found that numbers starting with 483 seem to be valid.
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          value={comicId}
          onChangeText={setComicId}
          placeholder="e.g., 48321"
          keyboardType="number-pad"
          style={styles.input}
          returnKeyType="go"
          onSubmitEditing={goToComic}
        />
        <Pressable style={styles.button} onPress={goToComic}>
          <Text style={styles.buttonText}>Go</Text>
        </Pressable>
      </View>

      {comics.map((comic) => (
        <View key={comic.id} style={styles.comic}>
          <Link href={`/marvel-comics/${comic.id}`}>
            <Link.Trigger>
              <Text style={styles.comicTitle}>{comic.title}</Text>
            </Link.Trigger>
            <Link.Preview />
          </Link>
          <Text style={styles.comicDesc}>{comic.description}</Text>
        </View>
      ))}
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, color: '#444', marginBottom: 12 },
  caption: { fontSize: 12, color: '#666', marginBottom: 12 },
  mono: { fontFamily: 'monospace' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  comic: { marginBottom: 12 },
  comicTitle: { fontSize: 18, color: '#0066cc' },
  comicDesc: { color: '#444' },
});
