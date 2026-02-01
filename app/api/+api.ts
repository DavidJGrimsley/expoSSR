// Root API endpoint
// Demonstrates server-only capabilities that client code cannot access

import { API_DATA } from '../../data/API';

export async function GET() {
  try {
    // Server-only operations that client code CANNOT do:
    
    // 1. Access environment variables (secrets stay server-side)
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const openAIKey = hasOpenAIKey ? process.env.OPENAI_API_KEY : undefined; // This line is just to illustrate access; do not send this to client
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrl = hasDbUrl ? process.env.DATABASE_URL : undefined; // This line is just to illustrate access; do not send this to client
    const expoPublicApiUrl = process.env.EXPO_PUBLIC_API_URL; // EXPO_PUBLIC vars are accessible on both server and client
    
    // 2. Get true server timestamp (client can't fake this)
    const serverTimestamp = new Date().toISOString();
    
    // 3. Perform server-side computations or validations
    const requestCount = Math.floor(Math.random() * 1000); // In real app, this would be from a database
    
    return Response.json({
      success: true,
      message: API_DATA,
      serverOnlyData: {
        serverTime: serverTimestamp,
        environmentCheck: {
          hasOpenAIKey,
          openAIKey, // Do not send this to client in real app
          hasDbUrl,
          dbUrl, // Do not send this to client in real app
          expoPublicApiUrl, // EXPO_PUBLIC vars are safe to expose
          nodeVersion: process.version,
        },
        stats: {
          requestCount,
          uptime: process.uptime(),
        },
      },
      note: 'This data was generated on the server. The client cannot access process.env or server internals. This is just to prove that the API route runs server-side. See the contrast on the static page.',
    });
  } catch (error) {
    console.error('Error in root API route:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch API info',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
