# 13 · Deployment & Environment

## Environments
- Preview (per PR), Staging, Production.

## Env Vars
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_REPORTS_BUCKET
- PADDLE_ENV, PADDLE_CLIENT_TOKEN, PADDLE_PRICE_ID, PADDLE_WEBHOOK_SECRET
- NEXT_PUBLIC_PLAUSIBLE_DOMAIN
- NEXT_PUBLIC_QUIZ_FIXTURE_MODE
- ALLOW_WEBHOOK_TEST_BYPASS (development only)
- WEBHOOK_URL, ORDER_ID, EVENT_TYPE, PADDLE_TRANSACTION_ID (local webhook simulation only)

## Branching
- `main` → prod; `develop` → staging; feature branches → previews.

## Rollback
- Vercel one-click to prior deployment.

## Alerts
- Usage (bandwidth/functions), errors, webhook failures.
