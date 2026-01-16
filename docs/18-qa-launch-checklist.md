# 18 · QA & Launch Checklist

Use this checklist before promoting a build to production.

## Functional
- Quiz loads all questions and progress saves across refreshes.
- Quiz submission blocks until all answers are provided.
- Results page renders the OCEAN chart and CTA.
- Webhook endpoint validates signatures and ignores duplicates.
- Paid order shows a downloadable PDF report link.
- Report access link flow sends the magic link and verifies tokens.

## Performance
- Lighthouse ≥ 90 on Landing, Quiz, Results.
- No blocking third-party assets; analytics loads deferred.

## SEO
- Title, description, canonical, and OG tags present on Landing, Quiz, Results.
- Social share previews render correctly.

## Payments (when enabled)
- Paddle sandbox flow tested for success, cancel, and failure.
- Live checkout smoke test with €1 completed before launch.

## Go / No-Go
- All critical checks pass → approve production deploy.
