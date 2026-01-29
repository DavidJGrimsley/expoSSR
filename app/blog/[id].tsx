import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, Text, View } from 'react-native';

export default function PostPage() {
  const { id } = useLocalSearchParams();
  const postId = Array.isArray(id) ? id[0] : id ?? '1';
  const title = `Post ${postId}`;
  const description = `SSR dynamic route with params: ${postId}`;

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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>This route renders dynamically without data loaders.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  body: { color: '#333' },
});
