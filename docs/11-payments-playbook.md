# 11 · Payments Playbook (Paddle)

## Setup
- Vendor ID, Auth code, Public Key, Webhook secret.
- Sandbox first; switch to Live after test checklist.

## Flow
1) User opens checkout modal and pays.
2) Paddle sends webhook `payment_succeeded` → verify signature.
3) Update order → generate PDF → email link.

## Test Cases
- success, cancel, failed card, duplicate webhook, refund.

## Fraud Controls
- Hard-code price server-side, verify currency, compare order_id.

## Go-live
- Rotate keys, enable alerts, run real €1 test.
