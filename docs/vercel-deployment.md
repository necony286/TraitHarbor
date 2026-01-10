# Vercel deployment guide

This guide covers deploying BigFive to Vercel using hosted Supabase, Upstash Redis, and Paddle (Production or Sandbox).

## 1) Prerequisites

- Vercel account + project linked to this repo.
- Hosted Supabase project (URL, anon key, service role key, and reports bucket).
- Upstash Redis database (REST URL + REST token).
- Paddle account (Production or Sandbox).

## 2) Configure Vercel Environment Variables

Set the following in **Vercel → Project → Settings → Environment Variables**:

**Supabase**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_REPORTS_BUCKET` (default: `reports`)

**Paddle**
- `PADDLE_ENV` (`production` or `sandbox`)
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_PRICE_ID`
- `PADDLE_WEBHOOK_SECRET`

**Upstash Redis**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Analytics (optional)**
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

**App behavior (optional)**
- `NEXT_PUBLIC_QUIZ_FIXTURE_MODE`
- `ALLOW_WEBHOOK_TEST_BYPASS`

## 3) Runtime notes (Node.js)

PDF generation requires the Node.js runtime. Ensure API routes remain on Node.js (not Edge). If you add or modify API routes that generate PDFs, keep `export const runtime = 'nodejs';` in those route handlers.

## 4) Deploy

1. Push your changes to the repo branch connected to Vercel.
2. Trigger a deployment from Vercel (or let Vercel auto-deploy on push).

## 5) Post-deploy checks

- Verify the homepage loads.
- Run a full quiz flow.
- Test Paddle payment + webhook flow in the environment you selected.
- Generate a PDF report to confirm Node.js runtime functionality.
