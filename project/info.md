## Goal
Build a minimal, reproducible SSR example for Expo SDK 55 (web only) to isolate SSR configuration issues. Prior project behavior was inconsistent (env not loading, odd SSR behavior), so this repo stays intentionally small.

## App Name
SSRonSDK55

## Overview
Minimal Expo Router SSR (web-only) reference that stays intentionally small while remaining production-ready for a VPS deployment.

## User Types
none

## Scope
- SSR only (no API routes)
- Web output only
- Minimal routes: static page + SSR page (no data loaders) + optional dynamic route for Head/meta validation

## Features
- Web-only SSR via Expo Router
- Dynamic route for head/tag checks

## What to validate
1. SSR output includes Head/meta tags for the SSR route.
2. No reliance on data loaders, API routes, or `generateStaticParams`.

## Deployment
- Target: VPS deployment using Express behind Plesk
- Output: Web build with SSR enabled (no API routes)
- Focus: Simple, stable deployment pipeline suitable for production

## References
- Expo SSR docs: https://docs.expo.dev/router/web/server-rendering/
- SDK 55 beta notes: https://expo.dev/changelog/sdk-55-beta
- Minimal repro guidance: https://stackoverflow.com/help/minimal-reproducible-example
- Expo contributing guide: https://github.com/expo/expo/blob/main/CONTRIBUTING.md