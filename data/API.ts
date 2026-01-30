export const API_DATA =
  'This text and the data below is fetched from the API. It is fetched from a hardcoded data file but could make other API calls that contain secrets such as calls to your database or openAI API calls, etc. API routes are server-only endpoints that run in the Expo server runtime. They are ideal for secure tasks like reading environment variables, talking to databases, or aggregating external APIs. Without SSR, API data is invisible to search engines. Note: You can structure API routes as blog+api.ts or as blog/index+api.ts + blog/[id]+api.ts—the latter is recommended for RESTful structure.';


export type BlogPost = {
	id: string;
	title: string;
	excerpt: string;
	content: string;
	author: string;
	date: string;
	readTime: number;
	tags: string[];
};

export type BlogPostSummary = Omit<BlogPost, 'content'>;

export const BLOG_POSTS: BlogPost[] = [
	{
		id: '1',
		title: 'Understanding Data Sources',
		excerpt: 'Learn why blog posts are hardcoded in this demo and how they would be fetched in production.',
		content:
			'These blog posts are hardcoded arrays in this demo and are not fetched via API or external database. In a production application, the `loader()` function would make real database queries (e.g., `Postgres`, `MongoDB`) or external API calls (e.g., `fetch("https://cms.example.com/posts")`). The data-fetching pattern remains the same - only the source changes.',
		author: 'David Grimsley',
		date: '2026-01-15',
		readTime: 2,
		tags: ['data-sources', 'education'],
	},
	{
		id: '2',
		title: 'Why You See a Loading Spinner',
		excerpt: 'Understanding artificial delays and real-world network latency in data loaders.',
		content:
			'The `loader()` function includes an artificial delay using `await new Promise(resolve => setTimeout(resolve, 500))` to demonstrate Suspense boundaries. This simulates network latency you\'d experience with real API calls. In production, the delay would be actual network/database time, plus any server-side computations like data transformations, authorization checks, or aggregating data from multiple sources. Complex queries or slow external APIs naturally create this wait time.',
		author: 'Evan Bacon',
		date: '2026-01-20',
		readTime: 3,
		tags: ['suspense', 'performance'],
	},
	{
		id: '3',
		title: 'How SSR + Data Loaders Work Together',
		excerpt: 'Learn how Server-Side Rendering and Data Loaders complement each other for optimal performance.',
		content:
			'Server-Side Rendering (SSR) means React components render to HTML on the server, not in the browser. However, SSR alone doesn\'t fetch data - it just renders whatever props you give it. Data Loaders solve this by running BEFORE SSR, fetching the data that components need. The `loader()` runs on the server, retrieves data from databases/APIs, and passes it to the component. Then SSR renders complete HTML with actual content (not empty shells). The browser receives fully-populated HTML instantly - no loading states, perfect SEO, and secrets stay server-side.',
		author: 'Simon Grimm',
		date: '2026-01-25',
		readTime: 4,
		tags: ['ssr', 'data-loaders', 'architecture'],
	},
	{
		id: '4',
		title: 'Deploying Expo SSR + API Routes',
		excerpt: 'Export the server bundle and host it with a compatible runtime or provider.',
		content:
			'With web.output set to "server", Expo exports a server bundle for SSR and API routes. You can run it with the Expo server runtime on EAS Hosting or attach it to your own Express server for VPS hosting.',
		author: 'Beto Moedano',
		date: '2026-01-28',
		readTime: 8,
		tags: ['deployment', 'hosting'],
	},
	{
		id: '5',
		title: 'API Routes without Expo SSR',
		excerpt: 'API routes can be used independently of Expo SSR for server-side logic but should they be?',
		content:
			'API routes can be used without enabling Expo SSR. This allows you to keep server-side logic while serving static web content. However, the SEO of that page will not reflect the dynamic data fetched from the API route.',
		author: 'Vadim Savin',
		date: '2026-01-12',
		readTime: 8,
		tags: ['deployment', 'hosting'],
	},
];

export const getBlogPostSummaries = (): BlogPostSummary[] =>
	BLOG_POSTS.map(({ content, ...summary }) => summary);

export const getBlogPostById = (id: string): BlogPost | undefined =>
	BLOG_POSTS.find((post) => post.id === id);
