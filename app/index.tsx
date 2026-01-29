
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>SSR is enabled for all routes (no data loaders).</Text>
      <Text style={styles.body}>
        To confirm SSR, fetch the raw HTML (View Source or curl/Invoke-WebRequest) and
        look for a route-specific <Text style={styles.mono}>&lt;title&gt;</Text> and
        <Text style={styles.mono}> &lt;meta name="description"&gt;</Text> in the response.
        The DOM inspector alone is not proof of SSR because it reflects the hydrated page.
      </Text>

      <Link href="/blog">
        <Link.Trigger>
          <Text style={styles.link}>Open Blog for dynamic routes</Text>
        </Link.Trigger>
        <Link.Preview />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  body: { fontSize: 14, color: '#444', textAlign: 'center', marginBottom: 12 },
  mono: { fontFamily: 'monospace' },
  link: { color: '#0066cc', fontSize: 16 },
});
