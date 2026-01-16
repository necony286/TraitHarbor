# Vercel deployment guide

This guide covers deploying TraitHarbor to Vercel using hosted Supabase and Upstash Redis. Paddle is implemented but pending production enablement.

## 1) Prerequisites

- Vercel account + project linked to this repo.
- Hosted Supabase project (URL, service role key, and reports bucket).
- Upstash Redis database (REST URL + REST token).
- Paddle account **only if** you are enabling payments in this environment.

## 2) Configure Vercel Environment Variables

Set the following in **Vercel → Project → Settings → Environment Variables**:

**Supabase (required)**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_REPORTS_BUCKET` (default: `reports`)
- `SUPABASE_ANON_KEY` (optional; reserved for future client usage)

**Report access security (required)**
- `GUEST_SESSION_SECRET`
- `REPORT_ACCESS_TOKEN_PEPPER`

**Upstash Redis (required for rate limiting)**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Analytics (optional)**
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- `NEXT_PUBLIC_SITE_URL` (used for absolute URLs in emails)

**App behavior (optional)**
- `NEXT_PUBLIC_QUIZ_FIXTURE_MODE`

**Payments (Paddle — pending enablement)**
- `PADDLE_ENV` (`production` or `sandbox`)
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_PRICE_ID`
- `PADDLE_WEBHOOK_SECRET`

## 3) Runtime notes (Node.js)

PDF generation requires the Node.js runtime. Ensure API routes remain on Node.js (not Edge). If you add or modify API routes that generate PDFs, keep `export const runtime = 'nodejs';` in those route handlers.

## 4) Deploy

1. Push your changes to the repo branch connected to Vercel.
2. Trigger a deployment from Vercel (or let Vercel auto-deploy on push).

## 5) Post-deploy checks

- Verify the homepage loads.
- Run a full quiz flow.
- Generate a PDF report to confirm Node.js runtime functionality.
- If payments are enabled, test Paddle checkout + webhook flow in the target environment.
