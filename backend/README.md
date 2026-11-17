# Ludora Backend

Node + TypeScript + Express + Socket.IO API. It **owns the Supabase Postgres database**
and is the only thing that writes money (wallet, escrow, settlement). The web app and the
Android app are both clients of this API, so they always see the same data.

## Run locally

```bash
cd backend
cp .env.example .env          # then fill in DATABASE_URL and JWT_SECRET
npm install
npm run migrate               # creates the tables (use the DIRECT db URL for this)
npm run dev                   # starts on http://localhost:4000
```

- `DATABASE_URL` — the Supabase **pooler** string for the running app
  (`postgresql://postgres.<ref>:[PASSWORD]@aws-...pooler.supabase.com:5432/postgres`).
  For `npm run migrate`, use the **direct** string (`db.<ref>.supabase.co:5432`).
- `JWT_SECRET` — generate with `openssl rand -hex 32`.
- Never commit `.env`. It is gitignored.

## Deploy to Render

1. Push this repo to GitHub (already done).
2. Render → **New → Blueprint**, select the repo. It reads `backend/render.yaml`.
3. In the service's **Environment**, set `DATABASE_URL` and `JWT_SECRET` as secrets,
   and `CORS_ORIGINS` to your Vercel URL.
4. Deploy. Health check: `GET /api/health`.

## Deploy to Fly.io (alternative to Render)

```bash
cd backend
fly launch --no-deploy        # creates the app from fly.toml; decline its DB offer (use Supabase)
fly secrets set DATABASE_URL="<supabase pooler string>" \
                JWT_SECRET="<random>" \
                CORS_ORIGINS="https://your-site.vercel.app"
fly deploy
```

Uses `Dockerfile` + `fly.toml` (listens on port 8080). `min_machines_running = 1`
keeps a machine alive so the join timers and sockets keep running. Health check: `/api/health`.

## Endpoints

Auth: `POST /api/auth/signup|login|logout`, `GET /api/me`
Wallet: `GET /api/wallet`, `GET /api/wallet/transactions`, `POST /api/wallet/deposit|withdraw`
Payout: `GET /api/payout-methods`, `POST /api/payout-methods/verify`, `POST /api/payout-methods/:id/default`
Matches: `GET /api/matches/live|open|recent|history`, `POST /api/matches`, `POST /api/matches/:id/join|result`
Referral: `GET /api/referral`

## Money rules (enforced server-side)

- Winner gets **95%** of the pot; platform fee **5%**.
- Created match holds a **10-minute** join window; unfilled stakes are auto-refunded
  by a background sweep (`expireMatches`).
- Referral: **3% of a referred friend's winnings, only when they win**, credited on settlement.
- Withdraw covers **deposit + winnings**, min deposit $5, min withdraw $10, to a
  **verified UPI** only.
- Deposits should be credited from the **payment provider's webhook** after a real charge,
  and UPI verification should call the aggregator's **verify-VPA** API (marked `TODO` in code).

## Still to wire for production

- Real payment gateway (deposit webhook + payout API) and UPI verify-VPA.
- Phone OTP on signup/login.
- Screenshot proof upload to Supabase Storage + automated screenshot checks.
- Rate limiting and Row Level Security policies in Supabase.
