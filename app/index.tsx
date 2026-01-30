
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>SSR + Data Loaders Demo</Text>
      <Text style={styles.body}>
        To confirm SSR, fetch the raw HTML (View Source or curl/Invoke-WebRequest) and
        look for a route-specific <Text style={styles.mono}>&lt;title&gt;</Text> and
        <Text style={styles.mono}> &lt;meta name="description"&gt;</Text> in the response.
        The DOM inspector alone is not proof of SSR because it reflects the hydrated page.
      </Text>

      <View style={styles.linkSection}>
        <Text style={styles.sectionTitle}>Without Data Loaders:</Text>
        <Link href="/blog">
          <Link.Trigger>
            <Text style={styles.link}>📄 Blog (No Loaders)</Text>
          </Link.Trigger>
          <Link.Preview />
        </Link>
      </View>

      <View style={styles.linkSection}>
        <Text style={styles.sectionTitle}>With Data Loaders:</Text>
        <Link href="/blog-loader">
          <Link.Trigger>
            <Text style={styles.link}>📦 Blog (With Loaders)</Text>
          </Link.Trigger>
          <Link.Preview />
        </Link>


        <Link href="/examples/data-loaders" style={styles.linkSpacing}>
          <Link.Trigger>
            <Text style={styles.link}>✨ Data Loaders Demo</Text>
          </Link.Trigger>
          <Link.Preview />
        </Link>
        
        <Link href="/examples/suspense" style={styles.linkSpacing}>
          <Link.Trigger>
            <Text style={styles.link}>⏱️ Suspense Demo</Text>
          </Link.Trigger>
          <Link.Preview />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#0066cc' },
  body: { fontSize: 14, color: '#444', textAlign: 'center', marginBottom: 24 },
  mono: { fontFamily: 'monospace' },
  linkSection: {
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  link: { color: '#0066cc', fontSize: 16, marginBottom: 6 },
  linkSpacing: { marginTop: 8 },
});
