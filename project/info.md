## Goal
Demonstrate Expo Router API Routes with SSR on SDK 55. Show practical patterns for server-side data fetching (API routes) and client-side integration, with a focus on production-ready patterns.

## App Name
SSRonSDK55

## Overview
Minimal Expo Router reference combining SSR with API routes. Includes a blog API endpoint and client-side fetching pattern, plus examples that compare static data, SSR output, and API data.

## User Types
Developers learning Expo Router API routes and server-side patterns.

## Scope
- SSR + API routes (server output)
- Web output only
- Routes: home, blog API endpoint, blog index (fetches from API), dynamic blog post (SSR)
- Examples page showing static data, SSR output, and API data
- Demonstrates client-side data fetching via API routes
- Dynamic routes powered by API responses

## Features
- Server-side API endpoint for blog posts
- Client-side data fetching using fetch() to call API routes
- SSR with dynamic routes
- Error handling and edge cases

## What to validate
1. API route `/api/blog+api.ts` returns JSON list of posts
2. Client page `/blog/index.tsx` fetches and displays post list
3. Dynamic route `/blog/[id].tsx` accepts post ID from API
4. SSR works for dynamic routes with API data

## Deployment
- Target: VPS deployment using Express behind Plesk
- Output: Web build with server output, includes API routes
- Focus: Production-ready API + SSR pattern with proper error handling

## References
- Expo SSR docs: https://docs.expo.dev/router/web/server-rendering/
- SDK 55 beta notes: https://expo.dev/changelog/sdk-55-beta
- Minimal repro guidance: https://stackoverflow.com/help/minimal-reproducible-example
- Expo contributing guide: https://github.com/expo/expo/blob/main/CONTRIBUTING.md