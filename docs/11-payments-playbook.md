# 11 · Payments Playbook (Paddle)

> Status: Paddle integration is implemented in code but **not yet enabled in production**. Use this playbook when turning payments on.

## Setup
- Paddle account (Sandbox first; Production later).
- Client token + price ID + webhook secret configured in Vercel.
- Checkout config is returned from `GET /api/checkout`.

## Flow
1. User opens checkout modal and pays.
2. Paddle sends a webhook to `/api/paddle/webhook`.
3. Signature is verified (unless `ALLOW_WEBHOOK_TEST_BYPASS=1` in local development).
4. Order status is updated, and PDF generation is queued.

## Test cases
- Success, cancel, failed card, duplicate webhook, refund.
- Confirm the order status transitions (`pending_webhook` → `paid` → `refunded`).

## Fraud controls
- Price ID is server-validated against an allowlist.
- Currency and amount are enforced server-side.
- Webhooks reconcile by `orderId` or Paddle order/transaction IDs.

## Go-live
- Rotate keys, enable alerting, run a real €1 test, and verify PDF generation.
