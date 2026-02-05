# Project TODO

Generated from project/info.md.

## App Snapshot
- App type: web SSR (Expo Router) with optional native parity

## Milestones
- [x] M1 — Foundations: minimal SSR routes + config
- [x] M2 — SSR verification + minimal repro polish
- [x] M3 — Deployment-ready server + hosting notes

## File Routing & Structure
- [x] Minimal routes: / (home), /examples (index), /examples/static, /examples/ssr
- [x] Root HTML configured in app/+html.tsx
- [x] Optional dynamic route /blog/[id] without loaders

## Feature Backlog
- [x] Started from create-expo-app
- [x] Upgraded to SDK 55 preview
- [x] Web output set to server rendering
- [x] SSR enabled in Expo Router
- [x] SSR only (no API routes)
- [x] No data loaders
- [x] Static page route for baseline rendering
- [x] SSR route for Head/meta validation
- [x] Optional dynamic route for head/tag checks (no loader)
- [x] Verify SSR HTML output via curl/Invoke-WebRequest
- [x] Export web build and serve via Express
- [x] Document VPS deployment steps (Plesk/Node)


## Deployment (Express)
- [x] Add Express server entry (server.js)
- [x] Add npm scripts for export + serve with server.js
- [x] Verify server.js against dist output
- [x] Document Plesk setup (Node version, start command)
- [x] Test VPS deployment (not local but running on a temp domain)
