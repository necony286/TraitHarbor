# 13 · Deployment & Environment

## Environments
- Preview (per PR), Staging, Production.

## Env Vars
- PADDLE_VENDOR_ID, PADDLE_VENDOR_AUTH_CODE, NEXT_PUBLIC_PADDLE_CLIENT_KEY
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXTAUTH_SECRET (if using NextAuth)

## Branching
- `main` → prod; `develop` → staging; feature branches → previews.

## Rollback
- Vercel one-click to prior deployment.

## Alerts
- Usage (bandwidth/functions), errors, webhook failures.
