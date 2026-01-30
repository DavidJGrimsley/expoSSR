// API route for individual blog post by ID
// Demonstrates a dynamic API route using route segments

import { getBlogPostById } from '../../../data/API';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Post ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const post = getBlogPostById(id);

    if (!post) {
      return new Response(
        JSON.stringify({ success: false, error: 'Post not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return Response.json({
      success: true,
      kind: 'detail',
      data: post,
    });
  } catch (error) {
    console.error('Error in blog detail API route:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch blog post',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
