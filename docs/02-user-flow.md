# 02 · User Flow (Landing → Quiz → Free → Paywall → PDF)

```mermaid
flowchart LR
  A[Landing] -->|CTA Start| B[Quiz 1/120]
  B --> C[Quiz 120/120]
  C --> D[Compute Scores]
  D --> E[Free Results Page]
  E -->|Unlock full report| F[Checkout (Paddle modal - pending enablement)]
  F -->|Paid| G[Webhook confirms]
  G --> H[Generate PDF]
  H --> I[Thank-you + Download Link + Email]
```

## Edge-cases
- Reload mid-quiz → restore progress from local storage.
- Payment failure → retry, support link.
- PDF link expired → signed URL refresh endpoint.

## States
- Anonymous → Buyer (email captured at checkout).
