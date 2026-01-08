# QA Checklist (Launch Readiness)

## Functional
- Quiz loads all questions and progress saves locally across refreshes.
- Quiz submission blocks until all answers are provided.
- Webhook endpoint validates signatures and ignores duplicates.
- Paid order shows a downloadable PDF report link.

## Performance
- Lighthouse ≥ 90 on key pages (Landing, Quiz, Results).
- No blocking third-party assets; analytics loads deferred.

## SEO
- Title, description, canonical, and OG tags present on Landing, Quiz, Results.
- Social share previews render correctly.

## Payments
- Paddle sandbox flow tested for success, cancel, and failure.
- Live checkout smoke test with €1 completed before launch.

## Go / No-Go
- All critical checks pass → approve production deploy.
