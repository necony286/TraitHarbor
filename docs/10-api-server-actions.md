# 10 · API Reference

This document reflects the current App Router API handlers in `src/app/api/**/route.ts`.

## Core routes

### `POST /api/score`
Scores answers and stores responses/scores.

**Input**
```json
{
  "answers": { "Q1": 3, "Q2": 5 },
  "userId": "uuid",
  "quizVariant": "ipip120"
}
```

- `quizVariant` is optional (`ipip120 | ipip60`), defaults to `ipip120`.
- `answers` keys must exactly match the item IDs for the selected variant.

**Success output**
```json
{ "resultId": "uuid", "quizVariant": "ipip120" }
```

**Error examples**
- `400` invalid JSON
- `400` invalid request body
- `400` answer ID mismatch:
```json
{
  "error": "Answer IDs must exactly match quiz items for this quiz variant.",
  "quizVariant": "ipip60",
  "missing": ["Q14"],
  "extra": ["Q121"]
}
```
- `500` persistence failure

### `GET /api/checkout`
Returns checkout configuration used by the Paddle modal.

**Success output**
```json
{
  "checkout": {
    "priceId": "...",
    "environment": "sandbox",
    "clientToken": "..."
  }
}
```

If unavailable, response includes `reason` and `missing` fields.

### `POST /api/orders`
Creates a provisional order.

**Input**
```json
{ "resultId": "uuid", "userId": "uuid", "email": "user@example.com" }
```

**Success output**
```json
{
  "order": { "id": "uuid", "status": "pending_webhook" },
  "checkout": null,
  "providerSessionId": "uuid"
}
```

### `GET /api/orders?orderId=...`
Fetches one order by id.

### `PATCH /api/orders`
Updates an order status (currently supports `pending_webhook`).

### `GET /api/orders/by-session?session_id=...`
Looks up an order by provider session id.

### `POST /api/paddle/webhook`
Processes Paddle webhook events.

### `POST /api/report`
Generates or reuses a premium report and returns a signed URL.

**Input**
```json
{ "orderId": "uuid" }
```

**Success output**
```json
{ "url": "https://...", "cached": true }
```

### `POST /api/reports/[orderId]/download-url`
Returns a short-lived signed URL for an authorized paid order.

**Success output**
```json
{ "url": "https://...", "expiresInSeconds": 300 }
```

### `POST /api/report-access/request-link`
Requests a magic link for report access.

**Input**
```json
{ "email": "user@example.com" }
```

**Output**
```json
{ "message": "If a paid report matches that email, a secure access link will be sent shortly." }
```

### `GET /api/my-reports`
Lists paid orders for authenticated user (`x-user-id`) or verified guest cookie.

## Rate limiting
- Upstash is used when configured.
- In development without Upstash, in-memory fallback is used.
- Some routes are fail-open, some fail-closed (see each handler).
