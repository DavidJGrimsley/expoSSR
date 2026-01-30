import Head from 'expo-router/head';
import { StyleSheet, Text, View } from 'react-native';
import { SSR_DATA } from '../../data/SSR';

export default function SSRExample() {
  return (
    <>
      <Head>
        <title>SSR Example</title>
        <meta name="description" content="SSR example page without data loaders or API routes." />
        <meta property="og:title" content="SSR Example" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <View style={styles.container}>
        <Text style={styles.title}>SSR Example (No Loaders)</Text>
        <Text style={styles.body}>This page is server-rendered and does not use data loaders.</Text>
        <Text style={styles.note}>{SSR_DATA}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, color: '#333', marginBottom: 8 },
  note: { fontSize: 13, color: '#666' },
});
