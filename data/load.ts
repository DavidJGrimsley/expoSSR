// Shared blog post data for data loader examples
// In production, this would be fetched from a database or API

export type BlogPost = {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
};

export const BLOG_POSTS: BlogPost[] = [
  { 
    id: '1', 
    title: 'Understanding Data Sources',
    description: 'Learn why blog posts are hardcoded in this demo and how they would be fetched in production.',
    content: 'These blog posts are hardcoded arrays in this demo and are not fetched via API or external database. In a production application, the `loader()` function would make real database queries (e.g., `Postgres`, `MongoDB`) or external API calls (e.g., `fetch("https://cms.example.com/posts")`). The data-fetching pattern remains the same - only the source changes.',
    author: 'John Doe',
    publishedAt: '2026-01-15T10:00:00Z'
  },
  { 
    id: '2', 
    title: 'Why You See a Loading Spinner',
    description: 'Understanding artificial delays and real-world network latency in data loaders.',
    content: 'The `loader()` function includes an artificial delay using `await new Promise(resolve => setTimeout(resolve, 500))` to demonstrate Suspense boundaries. This simulates network latency you\'d experience with real API calls. In production, the delay would be actual network/database time, plus any server-side computations like data transformations, authorization checks, or aggregating data from multiple sources. Complex queries or slow external APIs naturally create this wait time.',
    author: 'Jane Smith',
    publishedAt: '2026-01-20T14:30:00Z'
  },
  { 
    id: '3', 
    title: 'How SSR + Data Loaders Work Together',
    description: 'Learn how Server-Side Rendering and Data Loaders complement each other for optimal performance.',
    content: 'Server-Side Rendering (SSR) means React components render to HTML on the server, not in the browser. However, SSR alone doesn\'t fetch data - it just renders whatever props you give it. Data Loaders solve this by running BEFORE SSR, fetching the data that components need. The `loader()` runs on the server, retrieves data from databases/APIs, and passes it to the component. Then SSR renders complete HTML with actual content (not empty shells). The browser receives fully-populated HTML instantly - no loading states, perfect SEO, and secrets stay server-side.',
    author: 'Alex Johnson',
    publishedAt: '2026-01-25T09:15:00Z'
  },
];
