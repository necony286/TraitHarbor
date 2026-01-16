# Report Access (Phase 4)

## Phase 4 plan

- Introduce email-based ownership for paid reports.
- Issue hashed, time-bound magic links for report retrieval.
- Support guest purchases without requiring account creation before the quiz.
- Maintain compatibility with existing account-based orders and payment flows.
- Establish guest access via signed, httpOnly cookies (no localStorage).

## Tables

### orders (additions)

- `email` (nullable; required when `user_id` is null for guest ownership)
- `provider`, `provider_session_id`
- `results_snapshot_id` or `report_id`
- `report_file_key`
- `paid_at`, `updated_at`
- `report_access_token_hash` (hashed token; raw tokens are never stored)

### report_access_links

- `id`
- `email`
- `order_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

Indexes: `token_hash`, `email`, `expires_at`, `order_id`.

## Magic link flow

1. Guest requests a link from `/retrieve-report`, hitting `POST /api/report-access/request-link`.
2. Endpoint responds with a generic success payload to avoid email enumeration.
3. If a paid order exists for the email, we create a hashed token in `report_access_links` with a short TTL (15–60 minutes).
4. We email a CTA link to `/report-access?token=RAW_TOKEN` and include a fallback link to request again.
5. `/report-access` validates the hash, expiration, and unused status, then marks the link as used.
6. Server sets an httpOnly signed cookie with the verified email (1–7 day TTL) and redirects to `/my-reports`.
7. `/api/my-reports` returns paid orders for the logged-in user or verified guest email.

## Security notes

- Raw tokens are never stored; only hashed tokens are persisted.
- Magic links are short-lived and single-use (rotated via `used_at`).
- Guest access is stored in a signed, httpOnly cookie to avoid localStorage/sessionStorage.
- Request-link endpoint always returns success to avoid email enumeration.
- Rate limiting is enforced per IP + email to slow abuse.
