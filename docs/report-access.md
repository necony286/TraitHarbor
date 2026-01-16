# Report Access (Phase 4)

## Phase 4 plan

- Introduce email-based ownership for paid reports.
- Issue hashed, time-bound magic links for report retrieval.
- Support guest purchases without requiring account creation before the quiz.
- Maintain compatibility with existing account-based orders and payment flows.
- Establish guest access via signed, httpOnly cookies (no localStorage).

## Dependencies
- `GUEST_SESSION_SECRET` for signing guest cookies.
- `REPORT_ACCESS_TOKEN_PEPPER` for hashing access tokens.

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

## Download access flow

1. Paywall requires a guest email before checkout; the email is stored on the order.
2. Checkout completion redirects to `/checkout/callback?session_id=...`.
3. Callback page calls `GET /api/orders/by-session?session_id=...` and polls with exponential backoff until paid or timeout.
4. Once paid, the UI calls `POST /api/reports/:orderId/download-url` to mint a short-lived signed URL (60–300 seconds).
5. Endpoint enforces server-side authorization:
   - Logged in: `order.user_id` matches `x-user-id`.
   - Guest: verified email cookie matches `order.email`.
6. If the report file exists, we sign it; otherwise we generate once, store it, and return a short-lived signed URL.

## Key endpoints

- `POST /api/orders`
  - Creates a provisional order and stores the guest email + provider session id.
- `GET /api/orders/by-session?session_id=...`
  - Looks up orders by provider session id for the callback page.
- `POST /api/reports/:orderId/download-url`
  - Returns `{ url, expiresInSeconds }` for a paid order.

## Security notes

- Raw tokens are never stored; only hashed tokens are persisted.
- Magic links are short-lived and single-use (rotated via `used_at`).
- Guest access is stored in a signed, httpOnly cookie to avoid localStorage/sessionStorage.
- Request-link endpoint always returns success to avoid email enumeration.
- Rate limiting is enforced per IP + email to slow abuse.
- Signed report URLs are short-lived (≤ 5 minutes) and minted server-side per request.
