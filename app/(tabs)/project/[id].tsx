import { Link, useLoaderData, type ErrorBoundaryProps } from 'expo-router';
import { Text, View } from 'react-native';
import rawProjects from '../../../data/dummy/projects.json';

type Project = {
  id: string;
  title: string;
  summary?: string | null;
  status?: string | null;
  visibility?: string | null;
};

const dummyProjects = (Array.isArray(rawProjects) ? rawProjects : [rawProjects]) as Project[];

export async function loader(
  _request: unknown,
  params: Record<string, string | string[]>
) {
  const idParam = params.id;
  const projectId = Array.isArray(idParam) ? idParam[0] : idParam;

  const project = dummyProjects.find((p) => p.id === projectId);

  if (!project) {
    throw new Error(`Project with ID "${projectId ?? ''}" not found`);
  }

  return {
    project,
    loadedAt: new Date().toISOString(),
  };
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Error</Text>
      <Text style={{ marginBottom: 10 }}>{error.message}</Text>
      <Text onPress={retry} style={{ color: 'blue' }}>Retry</Text>
    </View>
  );
}

export default function ProjectPage() {
  const data = useLoaderData<typeof loader>();
  const { project, loadedAt } = data;

  return (
    <View style={{ padding: 20 }}>
      <Link href="/" style={{ color: 'blue', marginBottom: 20 }}>← Back</Link>
      
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        {project.title}
      </Text>
      
      <Text style={{ marginBottom: 5 }}>ID: {project.id}</Text>
      <Text style={{ marginBottom: 5 }}>Summary: {project.summary ?? '—'}</Text>
      <Text style={{ marginBottom: 5 }}>Status: {project.status ?? '—'}</Text>
      <Text style={{ marginBottom: 5 }}>Visibility: {project.visibility ?? '—'}</Text>
      <Text style={{ marginTop: 15, fontSize: 12, color: '#666' }}>
        Loaded at: {new Date(loadedAt).toLocaleTimeString()}
      </Text>
    </View>
  );
}
