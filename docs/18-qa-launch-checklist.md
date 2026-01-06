# 18 · QA & Launch Checklist

## Functional
- Quiz works, progress saves, edge cases handled.
- Webhook receives and verifies signature.
- PDF generated and downloadable, email sent.

## Performance
- Lighthouse ≥ 90, bundle size reasonable, no blocking assets.

## SEO
- Meta + OG present, social share renders correctly.

## Payments
- Sandbox: success/fail/refund tested; Live: €1 test.

## Go/No-Go
- All critical checks pass → deploy production.
