# 13 · Deployment & Environment

This document defines the environments, branching, and required environment variables. Current deployment targets Vercel + Supabase + Upstash; Paddle is pending enablement.

## Environments
- **Preview**: per-PR deployments on Vercel.
- **Production**: `main` branch deployments.

## Required environment variables (production)

**Supabase (server-side)**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_REPORTS_BUCKET` (defaults to `reports`)

**Report access security**
- `GUEST_SESSION_SECRET` (signs guest access cookies)
- `REPORT_ACCESS_TOKEN_PEPPER` (hashes report access tokens)

**Upstash (rate limiting)**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Email delivery (Resend)**
- `RESEND_API_KEY`
- `EMAIL_FROM` (e.g., `Trait Harbor <support@traitharbor.com>`)
- `RESEND_OVERRIDE_TO` (optional; sends all emails to this address for testing until a domain is verified)

**PDF rendering (Browserless)**
- `BROWSERLESS_WS_ENDPOINT` (required on Vercel for PDF generation; full `wss://.../?token=...` URL)
- Alternatively, set `BROWSERLESS_TOKEN` and optional `BROWSERLESS_HOST` (defaults to `production-sfo.browserless.io`) to build the wss URL.

> **Note:** Resend only delivers to verified domains in production. Verify a domain in Resend and set `EMAIL_FROM` to that domain, or set `RESEND_OVERRIDE_TO` for testing only.

## Optional environment variables

**App behavior / analytics**
- `NEXT_PUBLIC_QUIZ_FIXTURE_MODE` (set to `1` for fixture quiz data)
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- `NEXT_PUBLIC_SITE_URL` (absolute URL for emails; falls back to `VERCEL_URL` or localhost)

**Rate limiting overrides**
- `RATE_LIMIT_ALLOW_FAIL_OPEN=true` (allow fail-open in preview-only environments)

**Supabase (reserved for future client usage)**
- `SUPABASE_ANON_KEY`

## Payments (Paddle — pending enablement)
Set these only when enabling checkout in a given environment:
- `PADDLE_ENV` (`production` or `sandbox`)
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_PRICE_ID`
- `PADDLE_WEBHOOK_SECRET`

## Local webhook simulation (development only)
- `ALLOW_WEBHOOK_TEST_BYPASS=1`
- `WEBHOOK_URL`, `ORDER_ID`, `EVENT_TYPE`, `PADDLE_TRANSACTION_ID`

## Rollback
- Vercel one-click to prior deployment.

## Alerts
- Usage (bandwidth/functions), errors, and webhook failures.
