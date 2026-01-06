# BigFive

## Overview
BigFive is a personality-test SaaS built around the IPIP-120 questionnaire, offering a free interactive quiz and an optional premium PDF report. The product targets primarily women 18–34 who are self-help and career curious, with a global EU-first audience, delivering credible, shareable insights with a privacy-first approach.【F:docs/01-product-brief.md†L6-L21】

## How to use this document pack
The `/docs` folder is organized to take the team from product discovery through launch. Start with strategy (01–04), then design/content (05–07), technical specs (08–14), analytics/marketing (15–17), operations/QA (18–20), and legal skeletons (21–24).【F:docs/00-README.md†L3-L15】

## Product & Experience
- **User journey:** Landing → 120-question quiz → score computation → free results → Paddle paywall → webhook-confirmed purchase → PDF generation → thank-you/download email, with local progress restore and support for payment/PDF edge cases.【F:docs/02-user-flow.md†L1-L21】
- **Wireframes:** Core screens include Home, Quiz with Likert 1–5 inputs and progress, Free results with trait bars plus CTA, Checkout modal, and Thank-you page with download/share/resend email controls; accessibility covers keyboard navigation, aria labels, and AA contrast.【F:docs/06-wireframes-ui.md†L3-L14】
- **Design system:** Tokens specify brand color #5B7CFA on white, Inter typography (16px base, 32px semibold headings), rounded radii (8–16px), 1440px/12-column grid, and shadcn/ui primitives (Button, Progress, Radio Group, Dialog, Card, Input, Toast) with Lucide icons and OG-image templates.【F:docs/05-design-system.md†L3-L16】
- **Pricing:** Premium PDF A/B tests €5 vs €9 with an optional €3 Career Deep-Dive upsell; value includes detailed OCEAN pages, personalized tips, charts, and share assets. Draft refund window is 7 days if the file isn’t downloaded; experiments cover price splits, bundles, and limited coupons.【F:docs/03-pricing-packages.md†L3-L17】

## Technical blueprint
- **Implementation plan:** Ten sequenced issues/PRs cover bootstrapping Next.js 15 with pnpm, Vitest, and Playwright; building the quiz UI with fixture mode; implementing scoring with Supabase persistence; free results; Paddle paywall; provisional orders; webhook verification; PDF generation; expanded storage; and analytics/QA polish. Each step lists scoped files, acceptance criteria, and quick tests to keep PRs small and verifiable.【F:docs/implementation-plan.md†L1-L160】
- **Scoring spec:** Questions are JSON items keyed by trait with reverse-key flags; Likert 1–5 maps to a symmetric scale, summed per trait and normalized to 0–100 percentiles, with validation guarding against missing answers and fixture datasets for tests.【F:docs/08-scoring-spec.md†L3-L21】
- **Data model:** Supabase ERD defines `users`, `results`, and `orders` tables with foreign keys, unique email constraint, and row-level security limiting reads to owners.【F:docs/09-data-model-erd.md†L3-L34】
- **Deployment & env:** Environments span preview/staging/production with Paddle and Supabase keys plus NextAuth secret. The branching strategy is `main`→prod, `develop`→staging, and feature branches→previews. Vercel rollbacks are one-click. Alerts cover usage, errors, and webhook failures.【F:docs/13-deployment-env.md†L3-L18】

## Analytics, QA, and launch
- **Analytics:** Plausible events track quiz progression milestones, paywall view, checkout open, and purchase success, with UTM properties (source/medium/campaign/ab_variant/device) powering funnels from view→start→complete→paywall→paid and dashboards for conversions, ARPU, LTV, and CAC.【F:docs/15-analytics-taxonomy.md†L1-L14】
- **QA checklist:** Launch readiness requires functional coverage (quiz autosave, webhook signature verification, PDF generation/email), performance (Lighthouse ≥90 with lean bundles), SEO/OG tags, payments exercised across sandbox success/fail/refund and live €1 test, and a go/no-go gate once critical checks pass.【F:docs/18-qa-launch-checklist.md†L1-L18】

## Legal note
Legal templates (Terms, Privacy, Cookies, Disclaimer) are provided as drafts only; ensure review by licensed counsel before production use.【F:docs/00-README.md†L7-L15】【F:docs/21-terms-of-service.md†L1-L12】
