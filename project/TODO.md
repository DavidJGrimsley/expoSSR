# Project TODO

Generated from project/info.md.

## App Snapshot
- App type: web SSR (Expo Router) with API routes and data loaders demonstration

## Milestones
- [x] M1 — Foundations: minimal SSR routes + config
- [x] M2 — SSR verification + minimal repro polish
- [ ] M3 — Deployment-ready server + hosting notes
- [x] M4 — Data loaders implementation with three-way comparison

## File Routing & Structure
- [x] Minimal routes: / (home), /examples/*
- [x] Root HTML configured in app/+html.tsx
- [x] Blog routes with client fetch: /blog, /blog/[id]
- [x] Blog routes with data loaders: /blog-loader, /blog-loader/[id]
- [x] API routes: /api, /api/blog, /api/blog/[id], /api/blockchain, /api/task, /api/garden
- [x] Examples: /examples/static, /examples/ssr, /examples/api, /examples/data-loaders
- [x] Advanced examples: /examples/blockchain, /examples/tasks, /examples/garden

## Feature Backlog
- [x] Started from create-expo-app
- [x] Upgraded to SDK 55 preview
- [x] Web output set to server rendering
- [x] SSR enabled in Expo Router
- [x] Data loaders enabled (`unstable_enableDataLoader: true`)
- [x] Static page route for baseline rendering
- [x] SSR route for Head/meta validation
- [x] Blog routes with client-side fetch (for comparison)
- [x] Blog routes with data loaders
- [x] Comprehensive data loaders example page
- [x] API routes for server endpoints
- [x] Three-way data fetching comparison (client/API/loaders)
- [x] Suspense boundaries for loading states
- [x] ErrorBoundary for loader error handling
- [x] Dynamic route params in loaders
- [x] Request object access in loaders
- [x] runTask/deferTask demonstrations
- [x] Blockchain demo with Node.js crypto
- [x] Verify SSR HTML output via curl/Invoke-WebRequest
- [x] Export web build and serve via Express
- [x] Document VPS deployment steps (Plesk/Node)

## Data Loaders Features (M4)
- [x] Enable `unstable_enableDataLoader` in app.json
- [x] Create /blog-loader routes with server-side loaders
- [x] Implement Suspense fallbacks
- [x] Export ErrorBoundary for graceful error handling
- [x] Demonstrate dynamic params in loader()
- [x] Show server-only environment variable access
- [x] Create comprehensive /examples/data-loaders showcase
- [x] Document static vs server rendering differences
- [x] Three-way comparison: client fetch vs API routes vs loaders
- [x] TypeScript type safety with typeof loader
- [x] Document when to use each method
- [x] Demonstrate hybrid patterns (loaders + API routes)

## API Routes Features
- [x] Blog API endpoints (GET list, GET detail)
- [x] Server info endpoint with environment vars
- [x] Blockchain simulation endpoint (GET/POST/DELETE)
- [x] Task queue endpoint with runTask/deferTask
- [x] Pixel garden endpoint with async growth
- [x] Proper error handling and status codes
- [x] TypeScript types for all responses

## Testing Checklist
- [ ] Verify client-side fetch shows loading states
- [ ] Verify API routes return proper JSON
- [ ] Verify data loaders embed data in HTML
- [ ] Test Suspense boundaries show correctly
- [ ] Trigger ErrorBoundary with invalid route params
- [ ] Verify environment variables don't leak to client bundle
- [ ] Compare load performance: /blog vs /blog-loader
- [ ] Test runTask vs deferTask behavior
- [ ] Test blockchain POST/DELETE operations
- [ ] Test with `web.output: "static"` (build-time execution)
- [ ] Test with `web.output: "server"` (request-time execution)

## Deployment (Express)
- [x] Add Express server entry (server.js)
- [x] Add npm scripts for export + serve with server.js
- [x] Verify server.js against dist output
- [x] Document Plesk setup (Node version, start command)
- [x] Test VPS deployment (not local but running on a temp domain)
- [ ] Document API routes behavior in production
- [ ] Document data loader behavior in production
- [ ] Test all three data fetching methods under load
- [ ] Document performance characteristics of each method
