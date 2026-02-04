import { Link, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { posts } from '../../data/dummy';

export default function BlogIndex() {
  const router = useRouter();
  const [postId, setPostId] = useState('');

  const goToPost = () => {
    const trimmed = postId.trim();
    if (!trimmed) return;
    router.push(`/blog/${trimmed}`);
  };

  return (
    <>
      <Head>
        <title>Blog | SSR Test</title>
        <meta name="description" content="Blog listing page to test static site generation." />
        <meta property="og:title" content="Blog | SSR Test" />
        <meta property="og:description" content="Blog listing page to test static site generation." />
      </Head>
      <View style={styles.container}>
        <Text style={styles.title}>Blog</Text>
      <Text style={styles.body}>
        Dynamic SSR proof: request a new URL like /blog/123 and confirm the raw HTML
        contains <Text style={styles.mono}>&lt;title&gt;Post 123&lt;/title&gt;</Text> and matching meta tags.
        Seeing “Post 1” in the tab is expected, but the raw HTML response is the proof.
      </Text>

      <Text style={styles.sectionTitle}>Go to a post</Text>
      <Text style={styles.body}>
        Enter a post ID and navigate. This mirrors how a real app would deep-link to
        a user’s post in a UGC feed.
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          value={postId}
          onChangeText={setPostId}
          placeholder="e.g. 123"
          keyboardType="number-pad"
          style={styles.input}
          returnKeyType="go"
          onSubmitEditing={goToPost}
        />
        <Pressable style={styles.button} onPress={goToPost}>
          <Text style={styles.buttonText}>Go</Text>
        </Pressable>
      </View>

      {posts.map((p) => (
        <View key={p.id} style={styles.post}>
          <Link href={`/blog/${p.id}`}>
            <Link.Trigger>
              <Text style={styles.postTitle}>{p.title}</Text>
            </Link.Trigger>
            <Link.Preview />
          </Link>
          <Text style={styles.postDesc}>{p.description}</Text>
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
  post: { marginBottom: 12 },
  postTitle: { fontSize: 18, color: '#0066cc' },
  postDesc: { color: '#444' },
});
