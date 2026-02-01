import { useLoaderData, type ErrorBoundaryProps } from 'expo-router';
import Head from 'expo-router/head';
import { Suspense } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type LoaderRequest = {
  url?: string;
};

// Data loader that intentionally throws different types of errors
export async function loader(
  request: LoaderRequest | undefined,
  params: Record<string, string | string[]>
) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Randomly throw different types of errors to showcase error boundary
  const errorType = Math.floor(Math.random() * 5);

  switch (errorType) {
    case 0:
      throw new Error('Network timeout: Failed to connect to the database after 30 seconds');
    case 1:
      throw new Error('Authentication failed: Invalid API key or expired session');
    case 2:
      throw new Error('Resource not found: The requested data does not exist');
    case 3:
      throw new Error('Server overload: Too many concurrent requests, please try again later');
    case 4:
      throw new Error('Data validation failed: Received malformed response from external API');
    default:
      throw new Error('Unknown error occurred during data loading');
  }
}

// Error boundary catches loader errors and provides recovery UI
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const errorMessage = error.message || 'An unknown error occurred';
  
  // Extract error type from message
  const errorType = errorMessage.split(':')[0] || 'Error';
  const errorDetails = errorMessage.split(':').slice(1).join(':').trim() || errorMessage;

  return (
    <ScrollView contentContainerStyle={styles.errorContainer}>
      <Head>
        <title>Error Loading Data | Creatisphere</title>
        <meta name="robots" content="noindex" />
      </Head>

      <Text style={styles.errorEmoji}>⚠️</Text>
      <Text style={styles.errorTitle}>Oops! Something Went Wrong</Text>
      
      <View style={styles.errorCard}>
        <Text style={styles.errorType}>{errorType}</Text>
        <Text style={styles.errorDetails}>{errorDetails}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🛡️ Error Boundary Protection</Text>
        <Text style={styles.infoText}>
          This page intentionally throws errors in the data loader to demonstrate Error Boundaries in action.
        </Text>
        <Text style={styles.infoText}>
          • The error was caught before it crashed the entire app
        </Text>
        <Text style={styles.infoText}>
          • You can retry loading the data
        </Text>
        <Text style={styles.infoText}>
          • The rest of the app remains functional
        </Text>
        <Text style={styles.infoText}>
          • Users see a friendly error message instead of a blank screen
        </Text>
      </View>

      <Pressable style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryButtonText}>🔄 Try Again (Get Random Error)</Text>
      </Pressable>

      <View style={styles.technicalBox}>
        <Text style={styles.technicalTitle}>🔍 Technical Details</Text>
        <Text style={styles.technicalText}>
          <Text style={styles.bold}>Error Source:</Text> Data loader function
        </Text>
        <Text style={styles.technicalText}>
          <Text style={styles.bold}>Error Type:</Text> Thrown Error (not returned)
        </Text>
        <Text style={styles.technicalText}>
          <Text style={styles.bold}>Caught By:</Text> ErrorBoundary component
        </Text>
        <Text style={styles.technicalText}>
          <Text style={styles.bold}>Stack Trace:</Text>
        </Text>
        <View style={styles.stackTrace}>
          <Text style={styles.stackText}>{error.stack || 'No stack trace available'}</Text>
        </View>
      </View>

    </ScrollView>
  );
}

function ErrorContent() {
  // This will never render because loader always throws
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Head>
        <title>This Should Never Show</title>
      </Head>
      <View style={styles.container}>
        <Text style={styles.title}>Success!</Text>
        <Text style={styles.body}>
          If you&apos;re seeing this, the loader didn&apos;t throw an error (which shouldn&apos;t happen in this example).
        </Text>
      </View>
    </>
  );
}

export default function ErrorExample() {
  return (
    <Suspense
      fallback={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#cc0000" />
          <Text style={styles.loadingText}>Loading data...</Text>
          <Text style={styles.loadingSubtext}>(This will fail intentionally)</Text>
        </View>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#d32f2f',
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  errorType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 15,
    color: '#b71c1c',
    lineHeight: 22,
  },
  infoBox: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
    minWidth: 200,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  technicalBox: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  technicalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  technicalText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#333',
  },
  stackTrace: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  stackText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666',
    lineHeight: 16,
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
