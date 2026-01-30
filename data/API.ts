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
		title: 'Getting Started with Expo Router',
		excerpt: 'Learn the basics of file-based routing and how to structure routes in Expo Router.',
		content:
			'Expo Router uses file-based routing to map screens to routes automatically. This makes navigation intuitive and scalable. Pair it with shared layouts and typed routes to keep structure predictable as your app grows.',
		author: 'David Grimsley',
		date: '2026-01-15',
		readTime: 5,
		tags: ['routing', 'expo-router'],
	},
	{
		id: '2',
		title: 'SSR in Expo: What It Actually Does',
		excerpt: 'SSR renders HTML on the server, but it does not fetch data unless you do it yourself.',
		content:
			'Server-side rendering in Expo Router renders HTML for web requests and injects <Head> metadata. It does not magically fetch data. If you want server-fetched data, use data loaders or call an API from the server runtime.',
		author: 'Evan Bacon',
		date: '2026-01-20',
		readTime: 7,
		tags: ['ssr', 'web'],
	},
	{
		id: '3',
		title: 'API Routes in Expo Router',
		excerpt: 'Create server endpoints inside your Expo app to keep secrets safe and centralize logic.',
		content:
			'API routes are server-only endpoints that run in the Expo server runtime. They are ideal for secure tasks like reading environment variables, talking to databases, or aggregating external APIs. Client code can fetch them using relative URLs.',
		author: 'Simon Grimm',
		date: '2026-01-25',
		readTime: 6,
		tags: ['api', 'server'],
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
