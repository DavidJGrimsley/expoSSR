// API route for blog posts (list endpoint)
// Returns paginated list of blog post summaries
// For individual posts, use /api/blog/[id]

import { getBlogPostSummaries } from '../../../data/API';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const limitParam = parseInt(searchParams.get('limit') || '10', 10);
    const offsetParam = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isNaN(limitParam) ? 10 : limitParam;
    const offset = Number.isNaN(offsetParam) ? 0 : offsetParam;

    const posts = getBlogPostSummaries();
    const paginatedPosts = posts.slice(offset, offset + limit);

    return Response.json({
      success: true,
      kind: 'list',
      data: paginatedPosts,
      total: posts.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in blog API route:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch blog posts',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
