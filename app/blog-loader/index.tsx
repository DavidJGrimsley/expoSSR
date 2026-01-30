import { Link, useLoaderData } from 'expo-router';

import { StyleSheet, Text, View } from 'react-native';
import { BLOG_POSTS } from '../../data/load';

// Server-side data loader
// This function runs on the SERVER before the page renders
export async function loader() {
  // ⚠️ This artificial delay simulates a real API call (like fetch() or database query)
  // In production, replace this with: await fetch('https://api.example.com/posts')
  // The delay lets you see the Suspense fallback (loading spinner)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, you'd fetch from a database or API here:
  // const response = await fetch('https://api.example.com/posts');
  // const posts = await response.json();
  
  return {
    posts: BLOG_POSTS,
    loadedAt: new Date().toISOString(),
    environment: 'server' // This proves it ran on the server
  };
}

function BlogContent() {
  const data = useLoaderData<typeof loader>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blog (with Data Loaders)</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📦 Data Loader Info</Text>
        <Text style={styles.infoText}>
          • Data loaded at: {new Date(data.loadedAt).toLocaleTimeString()}
        </Text>
        <Text style={styles.infoText}>
          • Environment: {data.environment}
        </Text>
        <Text style={styles.infoText}>
          • Posts loaded: {data.posts.length}
        </Text>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>🔍 How SSR + Data Loaders Work Together</Text>
        <Text style={styles.noteText}>
          1. <Text style={styles.bold}>Request arrives</Text>: Browser requests /blog-loader
        </Text>
        <Text style={styles.noteText}>
          2. <Text style={styles.bold}>Loader runs</Text>: Server calls loader() to fetch data (database/API)
        </Text>
        <Text style={styles.noteText}>
          3. <Text style={styles.bold}>SSR renders</Text>: Server renders React component with the loaded data
        </Text>
        <Text style={styles.noteText}>
          4. <Text style={styles.bold}>HTML sent</Text>: Complete HTML with data is sent to browser
        </Text>
        <Text style={styles.noteText}>
          5. <Text style={styles.bold}>Instant display</Text>: Page shows immediately, no loading states!
        </Text>
        <Text style={styles.noteText} style={{ marginTop: 8 }}>
          💡 <Text style={styles.bold}>Why you see a spinner?</Text> The loader has an artificial 
          500ms delay to simulate a real API call. This lets you see the Suspense boundary in action.
          In production, this would be actual network time.
        </Text>
      </View>

      <View style={styles.serverNoteBox}>
        <Text style={styles.serverNoteText}>
          ⚙️ Note: This uses <Text style={styles.mono}>web.output: "server"</Text>.
          With <Text style={styles.mono}>"static"</Text> export, the loader would run at
          build time and the data would be baked into static HTML files.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Blog Posts</Text>
      
      {data.posts.map((post) => (
        <View key={post.id} style={styles.post}>
          <Link href={`/blog-loader/${post.id}`}>
            <Link.Trigger>
              <Text style={styles.postTitle}>{post.title}</Text>
            </Link.Trigger>
            <Link.Preview />
          </Link>
          <Text style={styles.postDesc}>{post.description}</Text>
        </View>
      ))}
    </View>
  );
}

export default function BlogLoaderIndex() {
  return (
      <BlogContent />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  noteBox: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
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
  bold: {
    fontWeight: '600',
    color: '#111',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  post: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postTitle: {
    fontSize: 18,
    color: '#0066cc',
    fontWeight: '500',
  },
  postDesc: {
    color: '#555',
    marginTop: 4,
  },
});
