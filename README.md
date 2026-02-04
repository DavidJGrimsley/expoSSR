# Static Export (SSG) on SDK 55 - Contrast to SSR

This is the **`contrast-ssg`** branch of expoSSR, demonstrating **static site generation** as a contrast to server-side rendering. This repo shows what happens when you export to static files instead of using a runtime server.

## Important Configuration Differences from SSR
- Set web output to `"static"` in `app.json` (NOT `"server"`):

```json
{
	"expo": {
		"web": { "output": "static" }
	}
}
```
- **NO** server rendering plugin needed
- **USE** `generateStaticParams()` for dynamic routes to pre-render specific IDs at build time

## What Static Export (SSG) does (vs SSR)

### ✅ What it does
- Pre-generates HTML files at **build time** when `web.output` is set to `"static"`.
- Creates individual HTML files for each route specified in `generateStaticParams()`.
- Injects `<Head>` tags into the **pre-built HTML files**.
- Serves static files from disk (no server runtime needed).

### ❌ What it does NOT do (unlike SSR)
- Does NOT render HTML on each request.
- Does NOT support truly dynamic routes (only pre-generated ones).
- Does NOT inject real data for dynamic params unless explicitly generated with `generateStaticParams()`.

### 🔍 The Key Difference
**Static Export:** `<title>First Post</title>` is **in the HTML file** on disk
**SSR (see main branch):** `<title>First Post</title>` is **generated per request** by the server

## Reproduction Steps - Proving Static Export Behavior

**⚠️ DO NOT use `npx expo start`** - Expo Go injects HTML at dev runtime, which masks the difference. You must export and serve the dist folder to see production behavior.

### Step 1: Export to Static Files
```bash
npx expo export -p web --clear
```

This generates `dist/` with pre-rendered HTML files.

### Step 2: Serve the Static Files
```bash
npx expo serve dist
```

### Step 3: Inspect the Raw HTML

**For Pre-Generated Routes (with generateStaticParams):**
1. Navigate to `http://localhost:8081/blog/1`
2. Right-click → **View Page Source** (NOT DevTools)
3. ✅ You'll see `<title>First Post</title>` in the raw HTML file
4. Check `dist/blog/1.html` - the title is physically in the file!

**For Non-Generated Routes (without generateStaticParams):**
1. Navigate to `http://localhost:8081/blog/999`
2. Right-click → **View Page Source**
3. ❌ You'll see `<title>Post Not Found</title>` or generic placeholder
4. JavaScript client-side updates it after load (but crawlers don't see it)

### Step 4: Compare with SSR (main expoSSR branch)

See the [expoSSR main branch](https://github.com/DavidJGrimsley/expoSSR) for server-side rendering where:
- ANY blog ID generates proper HTML on-the-fly
- No `generateStaticParams` needed
- Server runs at request time

## Deployment

Static exports can be deployed to:
- **Any static host:** Vercel, Netlify, GitHub Pages, AWS S3, etc.
- **Plesk:** Just upload `dist/` contents to `/httpdocs`
- **No server needed** - just file hosting!
