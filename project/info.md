## Goal
Build a minimal, reproducible SSR example for Expo SDK 55 (web only) with data loaders to demonstrate server-side data fetching patterns. Prior project behavior was inconsistent (env not loading, odd SSR behavior), so this repo stays intentionally small while showcasing data loaders.

## App Name
SSRonSDK55

## Overview
Minimal Expo Router SSR (web-only) reference that demonstrates data loaders alongside traditional SSR patterns. Stays intentionally small while remaining production-ready for a VPS deployment.

## User Types
none

## Scope
- SSR with data loaders (no API routes)
- Web output only
- Minimal routes: static page + SSR page + data loader routes for comparison
- Side-by-side demonstration of with/without data loaders

## Features
- Web-only SSR via Expo Router
- Data loaders for server-side data fetching
- Dynamic routes with loader params
- Suspense and ErrorBoundary demonstrations
- Head/meta tag validation with pre-loaded data

## Data Loaders Implementation
### Routes with Data Loaders:
- `/blog-loader` - Blog index with server-side data loading
- `/blog-loader/[id]` - Individual post with dynamic params
- `/examples/data-loaders` - Comprehensive data loader showcase

### Routes without Data Loaders (for comparison):
- `/blog` - Traditional SSR without loaders
- `/blog/[id]` - Dynamic route using useLocalSearchParams

### Key Demonstrations:
1. **Suspense Integration** - Loading states while loader runs
2. **ErrorBoundary** - Graceful error handling for loader failures
3. **Dynamic Route Params** - Loaders receiving URL parameters
4. **Server vs Static** - Notes about `web.output: "server"` vs `"static"`
5. **Environment Variables** - Server-only secrets never exposed to client
6. **Type Safety** - TypeScript inference with `typeof loader`

## What to validate
1. SSR output includes Head/meta tags for all routes
2. Data loaders run on server and embed data in HTML
3. No environment variables leak to client bundle
4. Suspense boundaries show loading states appropriately
5. ErrorBoundary catches loader errors gracefully
6. Compare performance: client fetch vs data loaders

## Deployment
- Target: VPS deployment using Express behind Plesk
- Output: Web build with SSR + data loaders enabled
- Focus: Simple, stable deployment pipeline suitable for production
- Note: Data loaders run on each request in server mode

## References
- Expo SSR docs: https://docs.expo.dev/router/web/server-rendering/
- Data Loaders docs: https://docs.expo.dev/router/data-loaders/
- SDK 55 beta notes: https://expo.dev/changelog/sdk-55-beta
- Minimal repro guidance: https://stackoverflow.com/help/minimal-reproducible-example
- Expo contributing guide: https://github.com/expo/expo/blob/main/CONTRIBUTING.md