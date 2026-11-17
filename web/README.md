# Ludora Web

React + TypeScript + Vite frontend. Calls the shared backend API (same endpoints as
the Android app), so web and app see the same data.

## Run locally

```bash
cd web
cp .env.example .env.local        # VITE_API_URL points at the backend
npm install
npm run dev                       # http://localhost:5173
```

`VITE_API_URL` defaults to the live backend `https://ludo-king-match.onrender.com`.

## Deploy to Vercel

1. Vercel → **Add New → Project**, import this repo.
2. **Root Directory:** `web`. Framework preset: Vite (auto-detected).
3. **Environment Variable:** `VITE_API_URL = https://ludo-king-match.onrender.com`
4. Deploy. `vercel.json` rewrites all routes to `index.html` for client-side routing.
5. Add the deployed domain to the backend's `CORS_ORIGINS` env var on Render.

## Deploy to Cloudflare Pages

- Root directory `web`, build command `npm run build`, output `dist`.
- Set `VITE_API_URL`. `public/_redirects` handles SPA routing.

## Pages

Auth (login/signup), Home, Play (lobby + create match), Wallet, Deposit, Withdraw,
Profile. Light/dark theme and English/Hindi, remembered per browser.
