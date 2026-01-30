## Goal
Demonstrate Expo Router API Routes + Data Loaders with SSR on SDK 55. Show practical patterns for server-side data fetching using three methods: client-side fetch, API routes, and data loaders. Focus on production-ready patterns and when to use each approach.

## App Name
SSRonSDK55

## Overview
Comprehensive Expo Router reference combining SSR, API routes, and data loaders. Demonstrates the complete spectrum of data fetching patterns in a modern Expo application, with side-by-side comparisons.

## User Types
Developers learning Expo Router patterns for SSR, API routes, and data loaders.

## Scope
- SSR + API routes + data loaders (server output)
- Web output only
- Three-way comparison of data fetching methods:
  1. Client-side fetch (useEffect + fetch to API)
  2. API routes (server endpoints)
  3. Data loaders (server-side data embedding)
- Multiple examples showcasing different patterns
- Production-ready error handling and type safety

## Features
- Server-side API endpoints for various demonstrations
- Client-side data fetching using fetch() to call API routes
- Data loaders for instant server-rendered data
- SSR with dynamic routes
- Suspense and ErrorBoundary patterns
- Environment variable security demonstration
- runTask/deferTask async patterns
- Blockchain demo with Node.js crypto

## Three Data Fetching Methods

### 1. Client-Side Fetch (Traditional)
**Routes:** `/blog`, `/blog/[id]`
**Pattern:** Component mounts → useEffect → fetch('/api/...') → setState → re-render
**Pros:** Interactive updates, polling, real-time data
**Cons:** Loading states, no SEO, waterfall delays
**Use When:** Data updates based on user interaction, infinite scroll, public APIs

### 2. API Routes (Server Endpoints)
**Routes:** `/api/*`, `/examples/api`, `/examples/blockchain`, `/examples/tasks`
**Pattern:** Server endpoint (+api.ts) → client fetches → displays data
**Pros:** Server-side logic, secrets safe, reusable endpoints, works with any client
**Cons:** Still requires client fetch, loading states needed
**Use When:** Client needs to trigger actions (POST, DELETE), form submissions, third-party integrations

### 3. Data Loaders (Server-Side Pre-loading)
**Routes:** `/blog-loader`, `/blog-loader/[id]`, `/examples/data-loaders`
**Pattern:** Server loader() → data embedded in HTML → instant render
**Pros:** No loading states, perfect SEO, fastest perceived performance, secrets safe
**Cons:** Not for real-time updates or user-triggered actions
**Use When:** Data needed at page load (blog posts, products), SEO critical, static-like content

## Data Loaders Implementation
### Routes with Data Loaders:
- `/blog-loader` - Blog index with server-side data loading
- `/blog-loader/[id]` - Individual post with dynamic params and ErrorBoundary
- `/examples/data-loaders` - Comprehensive showcase with all features

### Routes with API Routes:
- `/api` - Server info endpoint
- `/api/blog` - Blog list endpoint (paginated)
- `/api/blog/[id]` - Individual blog post endpoint
- `/api/blockchain` - Blockchain simulation with crypto
- `/api/task` - Task queue with runTask/deferTask
- `/api/garden` - Pixel garden with async growth

### Key Demonstrations:
1. **Three-Way Comparison** - Same data, three different fetching methods
2. **Suspense Integration** - Loading states while loader runs
3. **ErrorBoundary** - Graceful error handling for loader failures
4. **Dynamic Route Params** - Loaders receiving URL parameters
5. **Request Access** - Headers, cookies in server mode
6. **Environment Variables** - Server-only secrets demonstration
7. **Type Safety** - Full TypeScript inference
8. **Hybrid Patterns** - Using loaders + API routes together

## What to validate
1. All three data fetching methods work correctly
2. Data loaders embed data in HTML (view source)
3. API routes return proper JSON responses
4. Client-side fetch displays loading states
5. Data loaders have no loading states (instant)
6. Environment variables never leak to client
7. ErrorBoundary catches loader errors
8. Suspense boundaries work correctly
9. Compare performance across all three methods

## Deployment
- Target: VPS deployment using Express behind Plesk
- Output: Web build with server output + API routes + data loaders
- Focus: Production-ready patterns for all data fetching methods
- Note: Data loaders run on each request in server mode

## References
- Expo SSR docs: https://docs.expo.dev/router/web/server-rendering/
- Data Loaders docs: https://docs.expo.dev/router/data-loaders/
- API Routes docs: https://docs.expo.dev/router/web/api-routes/
- SDK 55 beta notes: https://expo.dev/changelog/sdk-55-beta
- Minimal repro guidance: https://stackoverflow.com/help/minimal-reproducible-example
- Expo contributing guide: https://github.com/expo/expo/blob/main/CONTRIBUTING.md