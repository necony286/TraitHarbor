# 10 · API Reference

This doc describes the current API routes and payloads in `src/app/api`. All endpoints return JSON and use rate limiting (Upstash when configured, in-memory fallback for local development). Payments routes are present but only used when Paddle is enabled.

## Core routes

### `POST /api/score`
Scores answers and stores results.

**Input**
```json
{
  "answers": { "Q1": 3, "Q2": 5 },
  "userId": "uuid"
}
```

**Output**
```json
{ "resultId": "uuid" }
```

**Errors**
- `400` invalid payload or missing answers
- `500` storage errors

### `GET /api/checkout`
Returns the checkout configuration used by the Paddle modal.

**Output**
```json
{ "priceId": "...", "currency": "EUR", "amount": 900, "description": "Starter PDF", "environment": "sandbox", "clientToken": "..." }
```

### `POST /api/orders`
Creates a provisional order before checkout.

**Input**
```json
{ "resultId": "uuid", "userId": "uuid", "email": "user@example.com" }
```

**Output**
```json
{ "order": { "id": "uuid", "status": "pending_webhook" }, "checkout": { "...": "..." }, "providerSessionId": "uuid" }
```

### `GET /api/orders?orderId=...`
Fetches a single order by ID.

### `PATCH /api/orders`
Updates an order status (currently only supports `pending_webhook`).

### `GET /api/orders/by-session?session_id=...`
Looks up an order by provider session ID (used by the checkout callback). Returns fixture data when fixture mode is enabled and Supabase is not configured.

### `POST /api/paddle/webhook`
Processes Paddle webhook events. Requires signature verification unless `ALLOW_WEBHOOK_TEST_BYPASS=1` in development.

### `POST /api/report`
Generates (or reuses) a premium report PDF and returns a signed download URL.

**Input**
```json
{ "orderId": "uuid", "name": "Optional Name" }
```

**Output**
```json
{ "url": "https://...", "cached": true }
```

### `POST /api/reports/:orderId/download-url`
Returns a short-lived signed URL for an already-paid order.

**Output**
```json
{ "url": "https://...", "expiresInSeconds": 300 }
```

### `POST /api/report-access/request-link`
Issues a magic link for guest report access (response is always generic to avoid email enumeration).

### `GET /api/my-reports`
Lists paid orders for the signed-in user or verified guest.

## Rate limiting
- Upstash is used when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present.
- In development without Upstash, a local in-memory limiter is used.
- In preview/production without Upstash, the limiter returns 503 unless `RATE_LIMIT_ALLOW_FAIL_OPEN=true` and the route allows fail-open.
