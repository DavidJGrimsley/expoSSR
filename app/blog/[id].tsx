import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, Text, View } from 'react-native';
import { posts } from '../../data/dummy';

export default function PostPage() {
  const { id } = useLocalSearchParams();
  const postId = Array.isArray(id) ? id[0] : id ?? '1';
  const post = posts.find((p) => p.id === postId);
  const title = id ? `Post ${postId}` : 'Post';
  const instructions = "Right click this page and click 'view page source', not 'inspect'. The raw HTML contains the meta tags for this comic.";

  if (!post) {
    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content="This blog post does not exist." />
        </Head>
        <View style={styles.container}>
          <Text style={styles.title}>Post Not Found</Text>
          <Text style={styles.body}>This blog doesn&apos;t exist</Text>
          <Text style={styles.body}>{instructions}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <View style={styles.container}>
        <Text style={styles.title}>The purpose of this page is to demonstrate server-side rendering with dynamic routes.</Text>
        <Text style={styles.body}>{instructions}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.body}>{post.description}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  body: { color: '#333' },
});
