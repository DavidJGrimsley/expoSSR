# Project TODO

Generated from project/info.md.

## App Snapshot
- App type: web SSR (Expo Router) with data loaders demonstration

## Milestones
- [x] M1 — Foundations: minimal SSR routes + config
- [x] M2 — SSR verification + minimal repro polish
- [ ] M3 — Deployment-ready server + hosting notes
- [x] M4 — Data loaders implementation and comparison

## File Routing & Structure
- [x] Minimal routes: / (home), /blog, /blog/[id]
- [x] Root HTML configured in app/+html.tsx
- [x] Data loader routes: /blog-loader, /blog-loader/[id]
- [x] Examples route: /examples/data-loaders

## Feature Backlog
- [x] Started from create-expo-app
- [x] Upgraded to SDK 55 preview
- [x] Web output set to server rendering
- [x] SSR enabled in Expo Router
- [x] Data loaders enabled (`unstable_enableDataLoader: true`)
- [x] Static page route for baseline rendering
- [x] SSR route for Head/meta validation
- [x] Blog routes without loaders (for comparison)
- [x] Blog routes with data loaders
- [x] Comprehensive data loaders example page
- [x] Suspense boundaries for loading states
- [x] ErrorBoundary for loader error handling
- [x] Dynamic route params in loaders
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
- [x] Side-by-side comparison with non-loader routes
- [x] TypeScript type safety with typeof loader

## Testing Checklist
- [ ] Verify data loaders run on server (check server logs)
- [ ] Confirm data embedded in HTML response (view source)
- [ ] Test Suspense boundaries show correctly
- [ ] Trigger ErrorBoundary with invalid route params
- [ ] Verify environment variables don't leak to client bundle
- [ ] Compare load performance: /blog vs /blog-loader
- [ ] Test with `web.output: "static"` (build-time execution)
- [ ] Test with `web.output: "server"` (request-time execution)

## Deployment (Express)
- [x] Add Express server entry (server.js)
- [x] Add npm scripts for export + serve with server.js
- [x] Verify server.js against dist output
- [x] Document Plesk setup (Node version, start command)
- [x] Test VPS deployment (not local but running on a temp domain)
- [ ] Document data loader behavior in production
- [ ] Test loader performance under load
