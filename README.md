# SSR + API Routes on SDK 55 (Using canary for latest updates)

Minimal Expo Router project demonstrating **API Routes** with **SSR** on SDK 55. Shows how to fetch data from server-side endpoints and power dynamic routes via client-side API calls.

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

## Architecture: How API Routes & SSR Work Together

### 1️⃣ API Routes (Backend Data)
**What it does:**
- Creates a **server-side endpoint** (`/api/blog`) that responds to HTTP requests
- Returns **JSON data** that can be consumed by frontend components via `fetch()`
- Executes **on every request** with fresh/dynamic data
- **Protects sensitive data** (API keys, secrets stay server-side)
- **Access server-only features**: environment variables, file system, databases
- Supports POST/PUT/DELETE for mutations

**Server-only capabilities demonstrated in `/examples/api`:**
- Access to `process.env` (environment variables like API keys)
- Server timestamp generation (client cannot fake)
- Access to `process.version` and `process.uptime()`
- Server-side computations invisible to client

**What it does NOT do:**
- Does NOT modify `<Head>` tags at runtime
- Does NOT pre-render HTML
- Does NOT automatically inject metadata for SEO
- Data lives in JavaScript state, not in the HTML source

### 2️⃣ SSR (Server-Side HTML Rendering)
**What it does:**
- Renders **React components to HTML** on the server for each request
- Injects `<Head>` tags into the HTML response (SEO-critical)
- Makes HTML source include all metadata (OpenGraph, meta tags, title, etc.)
- **Requires web output set to `"server"`**

**What it does NOT do:**
- Does NOT fetch data by itself
- Does NOT handle API logic or mutations
- Does NOT create backend endpoints
- Cannot use dynamic API data for SEO metadata (rendered once at request time)

### 3️⃣ Static Data / Loaders
**What it does:**
- Imports data at **build time** (known ahead of time)
- Powers static pages that don't change frequently
- Data is bundled with the app

**When to use:**
- Configuration, constants, documentation pages

---

### How They Work Together
For a **blog with good SEO**:
1. **API Route** (`/api/blog`) fetches blog data from database/cache
2. **SSR** renders the route component to HTML with proper `<Head>` tags (title, meta description, OG image, etc.)
3. **Client-side fetch** from the API hydrates the page with live data

**Example flow for `/blog/1`:**
```
Client: GET /blog/1
  ↓
Server: Render /blog/[id].tsx component with SSR
  ↓
Server: Inject <Head> with title, description, OG tags (can be static or from a loader)
  ↓
Server: Send HTML to client
  ↓
Client: Hydrate React app
  ↓
Client: useEffect() runs and calls fetch('/api/blog/1')
  ↓
API Route: Returns JSON with post data
  ↓
Client: Page updates with fresh data from API
```

**Search engines see:** The `<Head>` tags in the HTML source (title, meta description, OG image) → Good for SEO

**Users experience:** The latest data fetched via the API after hydration → Good for dynamic content

**Without SSR:** Search engines only see the JSON response from the API (invisible) and a blank `<title>` tag → Bad for SEO

## API Routes in this project

In this repo:
- `app/api/index+api.ts` — Root API endpoint with information about the API
- `app/api/blog/index+api.ts` — Returns paginated list of blog post summaries
- `app/api/blog/[id]+api.ts` — Returns individual blog post by ID
- `app/blog/index.tsx` — Client page that **fetches** from `/api/blog` and displays results
- `app/blog/[id].tsx` — Dynamic route that **fetches** from `/api/blog/[id]` and displays post details

### Structuring API Routes: `blog+api.ts` vs `blog/index+api.ts` + `blog/[id]+api.ts`

You can organize API routes two ways:

**Option 1: Single file with query params (simpler)**
```
app/api/blog+api.ts  → GET /api/blog?limit=10&offset=0 (list)
                      → GET /api/blog?id=1 (detail)
```

**Option 2: RESTful structure with dynamic segments (recommended)**
```
app/api/blog/index+api.ts → GET /api/blog (list)
app/api/blog/[id]+api.ts   → GET /api/blog/1, /api/blog/2 (detail)
```

This project uses **Option 2** because it mirrors your route structure (`/blog` and `/blog/[id]`) and follows REST conventions. It's also easier to extend and test individual endpoints.

## Development & Testing
### Mobile
Currently we are awaiting the new Expo Go update for SDK 55 so testing on Expo Go with mobile is not possible yet.

We can follow the steps from the docs 
https://docs.expo.dev/router/web/api-routes/#deployment

### Web
Start the dev server to test SSR and API routes:

```bash
npm start
```

Then open `http://localhost:8081` and:
1. Navigate to `/examples` to see the API route info and examples of each data pattern
2. Navigate to `/blog` to see the API route in action (fetches blog list from `/api/blog`)
3. Click on a post to see the dynamic route render with SSR and fetch details from `/api/blog/[id]`
4. Test the API directly:
   ```powershell
   Invoke-WebRequest http://localhost:8081/api
   Invoke-WebRequest http://localhost:8081/api/blog
   Invoke-WebRequest http://localhost:8081/api/blog/1
   ```
5. Inspect raw HTML output to see SSR-injected `<Head>` tags:
   ```powershell
   Invoke-WebRequest http://localhost:8081/blog/1 | Select-Object -ExpandProperty Content
   ```

## Production (Express) Testing

SSR + API routes require a runtime server in production. EAS Hosting can run the Expo server runtime for you after `expo export`, but it does not generate a custom server file. For third-party hosting (for example, a Plesk VPS), export the web build, then run the Express server:

```bash
npm run export-web
npm run serve-express-server
```

The server entry lives in server.js and serves `dist/client` while delegating API route requests and SSR requests to `dist/server`.


## Production (Express) 3rd Party Deployment

On Plesk
- Upload the server.js, package.json, and entire dist folder to the project root directory. 
- Click NPM install
- Specify environment variables
- Click restart app (this automatically starts the Express server.js which serves the app)

**Note about environment variables (server.js and .env)**

Running `node server.js` by itself does **not** automatically load a `.env` file. For local testing you can load `.env` at startup:

**Quick local fix — load .env at startup:**

- Install dotenv: `npm install dotenv --save`
- Add at the top of `server.js` (before you use env vars):

```js
require('dotenv').config();
```

- Restart your server (`node server.js`). Your `.env` entries will now populate `process.env`.

**Production / best practice — set real environment variables in your host:**

- Configure your hosting environment (systemd, Docker, Plesk app settings, or your cloud provider) to set environment variables. Do not rely on `.env` files in production.

**Note about client-side `EXPO_PUBLIC_*` variables:**

`EXPO_PUBLIC_*` values are baked into the client build at build time. If you change `.env` after building the client, you must rebuild the client so the client bundle includes the new value.


## Key Concepts

**API Routes vs Data Loaders:**
- **API Routes** (`+api.ts`): Execute on every request, return dynamic data, can handle query params and POST requests, **access server-only features**
- **Data Loaders** (`loader()` export): Execute at build time (static) or request time (server rendering), embed data in HTML

**Examples in this project:**
- `/examples` — Overview of static data, SSR behavior, and API info
- `/examples/static` — Static data imported at build time
- `/examples/ssr` — SSR rendering without data loaders
- `/examples/api` — **Demonstrates API route with server-only capabilities** (environment variables, server timestamp, process info)
- `/blog` — Blog list powered by `/api/blog` (paginated)
- `/blog/[id]` — Individual posts powered by `/api/blog/[id]`

**What makes `/examples/api` special:**
This page demonstrates what API routes can do that client-side code **cannot**:
- Access `process.env` for API keys and secrets (safely kept server-side)
- Generate server timestamps that clients cannot fake
- Check environment configuration (Node version, uptime)
- Perform server-side computations invisible to client code

Try it: Add a `.env` file with `OPENAI_API_KEY=test` and see the environment check update!

**Native & Web:**
Server-side rendering (SSR) only affects web. Native mobile apps run the React Native bundle on-device. However, API routes are server-side endpoints that any platform can call via fetch.
