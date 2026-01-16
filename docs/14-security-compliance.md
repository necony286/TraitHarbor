# 14 · Security & Compliance (GDPR)

## Data
- Collect: email (buyers), quiz answers (anonymous), order metadata.
- Store: EU region, encrypted at rest, TLS in transit.

## GDPR
- Legal basis: consent (quiz), contract (purchase).
- DSR: export/delete endpoint; 30-day retention after delete request.
- DPA with processors (Vercel, Supabase, Upstash; Paddle when enabled).

## Controls
- Rate-limit, input validation (Zod), webhook signature verify.
- Signed URLs for PDF with short expiry, no open buckets.

## Logging
- PII-minimized logs, redact secrets.
