# SSR on SDK 55 (Minimal Repro) (Using canary for latest updates)

Minimal, SSR-only Expo Router project for SDK 55. This repo is intentionally small to make SSR behavior and configuration easy to inspect and report.

**🔀 Want to see the contrast?** Check the [`contrast-ssg` branch](https://github.com/DavidJGrimsley/expoSSR/tree/contrast-ssg) for a static export (SSG) version that shows the difference between pre-generated HTML and runtime server rendering.

## Important Changes
- Requires Expo SDK 55+.
- Set web output to `"server"` in `app.json`:

```json
{
	"expo": {
		"web": { "output": "server" }
	}
}
```
- Enable server rendering for Expo Router in `app.json` plugins:

```json
"plugins": [
	["expo-router", { "unstable_useServerRendering": true }]
]
```
- Avoid `generateStaticParams()` for SSR dynamic routes — `generateStaticParams` is for SSG (pre-rendering), not runtime SSR.

## What SSR does (and does not do)

### ✅ What it does
- Renders HTML on each request for web output when `web.output` is set to `server`.
- Injects `<Head>` tags from route components into the server response.
- Supports dynamic routes without `generateStaticParams`.

### ❌ What it does not do
- It does not pre-generate HTML files (that’s static rendering).
- It does not require data loaders; SSR works with without them.
- It does not need API routes 

## Production (Express) Testing

SSR requires a runtime server in production. EAS Hosting can run the Expo server runtime for you after `expo export`, but it does not generate(or need) a custom server file. For third-party hosting (for example, a Plesk VPS), export the web build, then run the Express server:

```bash
npm run export-web
npm run serve-express-server
```

The server entry lives in server.js and serves `dist/client` while delegating SSR requests to `dist/server`.

## Production (Express) 3rd Party Deployment

On Plesk
- Upload the server.js, package.json, and entire dist folder to the project root directory. 
- Click NPM install
- Click restart app (this automatically starts the Express server.js which serves the app)

Note: Server-side rendering (SSR) only affects web. Native mobile apps run the React Native bundle on-device and do not consume server-rendered HTML. You only need a server for API routes or if your mobile app must call a backend origin.
