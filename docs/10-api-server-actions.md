# 10 · API & Server Actions

## Server Actions
- `createOrder(payload)` → returns checkout params
- `createPdf(traits)` → returns signed URL

## API Routes
- `POST /api/paddle` (webhook): verify signature, update order, trigger PDF.

## Contracts (JSON)
### createOrder (input)
```json
{ "email": "user@example.com", "amountCents": 900, "currency": "EUR" }
```
### createOrder (output)
```json
{ "checkout": { "id": "..." } }
```

## Errors
- 400 invalid payload, 401 signature fail, 409 duplicate webhook, 500 internal.

## Rate-limit
- 20 req/min per IP (Upstash Redis suggested).
