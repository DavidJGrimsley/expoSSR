export interface Post {
  id: string;
  title: string;
  description: string;
}

export const posts: Post[] = [
  { id: '1', title: 'First Post', description: 'An intro post to test SSR and meta tags.' },
  { id: '2', title: 'Second Post', description: 'Another post to verify dynamic routing.' },
  { id: '3', title: 'Third Post', description: 'Testing server-side rendering with dynamic routes.' },
];
