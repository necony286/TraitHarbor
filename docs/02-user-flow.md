# 02 · User Flow (Landing → Quiz → Free → Paywall → PDF)

```mermaid
flowchart LR
  A[Landing] -->|Start Pro| B[/quiz · IPIP-120]
  A -->|Start Quick| C[/quiz/quick · IPIP-60]
  B --> D[Answer all required items]
  C --> D
  D --> E[POST /api/score]
  E --> F[Free Results Page]
  F -->|Unlock full report| G[Checkout (Paddle modal - pending enablement)]
  G -->|Paid| H[Webhook confirms]
  H --> I[Generate PDF]
  I --> J[My Reports + Download URL]
```

## Edge-cases
- Reload mid-quiz → restore progress from local storage (variant-scoped state).
- Score submit rejects missing/extra answer IDs for the selected variant.
- Payment failure → retry, support link.
- PDF link expired → signed URL refresh endpoint.

## States
- Anonymous → Buyer (email captured at checkout).
