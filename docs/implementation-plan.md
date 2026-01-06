# Implementation Plan — Big Five SaaS (Next.js 15)

This plan converts the MVP flow (Landing → Quiz → Free result → Paywall → Paid → PDF) into sequential GitHub issues and small PRs. It respects the product brief, user flow, roadmap, scoring, payments, PDF, and analytics specs in `/docs`.

## Issue & PR Sequence

### 1) Baseline Next.js 15 skeleton
- **Scope:** Initialize repo with Next.js 15 app (using `src/app` convention for routes, `src/data` for quiz JSON), pnpm, Vitest (unit) + Playwright (e2e) harness, design system scaffold; keep shared code in top-level `components/*` and `lib/*`.
- **Files:**
  - Create `package.json`, `pnpm-lock.yaml`, `next.config.js`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.
  - Add `tsconfig.json`, `.eslintrc.*`, `.prettierrc`, `.nvmrc`, `vitest.config.ts`, `playwright.config.ts`, `README.md` update with setup instructions.
  - Package scripts (simple and real): `pnpm lint`, `pnpm build`, `pnpm test` → `vitest`, `pnpm test:unit` → `vitest`, `pnpm test:e2e` → `playwright test` (no `--grep`; for filtering use `pnpm test:unit -- -t "pattern"` or `pnpm test:unit -- <test-file-path>`).
  - CI workflow includes `pnpm install`, `pnpm exec playwright install --with-deps`, and runs `pnpm lint`, `pnpm build`, `pnpm test`, and `pnpm test:e2e` on every PR and on `main` (Playwright enabled by default).
- **Acceptance Criteria:**
  - `pnpm lint`, `pnpm build`, `pnpm test` (unit via Vitest only), and `pnpm test:e2e` (Playwright) succeed locally and in CI with browsers installed.
  - Base layout renders “BigFive” shell with design tokens placeholder from `05-design-system.md`.
- **Quick Tests:**
  - `pnpm install`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test`
  - `pnpm test:e2e`

### 2) Quiz UI (IPIP-120 ingestion + navigation)
- **Scope:** Build quiz page with Likert UI and local progress persistence per `06-wireframes-ui.md`, using paged navigation (10–20 questions per page) with answered-count-based milestones.
- **Files:**
  - Add `src/app/quiz/page.tsx`; store IPIP-120 items in `src/data/ipip120.json` and import directly (no API route, no `/public` fetch; locked choice A1) per `08-scoring-spec.md`.
  - Components: `components/quiz/Progress.tsx`, `components/quiz/Likert.tsx`, `components/quiz/QuestionCard.tsx`, pagination controls.
  - Utilities: `lib/ipip.ts` (load items), `lib/storage.ts` (local storage helpers), `lib/analytics.ts` (event hooks referencing `15-analytics-taxonomy.md`).
- **Acceptance Criteria:**
  - Quiz shows 120 questions with progress bar, paged navigation (10–20 per page), autosave on change, keyboard accessible (per `06-wireframes-ui.md`).
  - Fixture mode: when `NEXT_PUBLIC_QUIZ_FIXTURE_MODE=1`, load `src/data/ipip120.fixture.json` (≈10 items) for fast dev/e2e; default loads full `src/data/ipip120.json`.
  - Submit button disabled until all answered; Likert values mapped exactly 1–5 as specified.
  - Events fired: `quiz_view`, `quiz_start`, `quiz_25/50/75`, `quiz_complete` based on answered count (not page index).
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit -- -t "quiz"`
  - Manual: start quiz, refresh mid-way, confirm restore and paged flow; toggle fixture mode for 10-item run.

### 3) Scoring engine
- **Scope:** Implement scoring per `08-scoring-spec.md` with server-side validation and result storage.
- **Files:**
  - `lib/scoring.ts` (Likert mapping 1–5, reverse-key handling, normalization 0–100, fixtures).
  - `__tests__/scoring.test.ts` with provided sample answer sets (Vitest).
  - `src/app/api/score/route.ts` for POST answers → validate with Zod → score → persist result in Supabase (full answers + computed OCEAN scores) → return `{ resultId }` (no querystring payloads).
  - Minimal Supabase migrations added now (e.g., `supabase/migrations/0001_results.sql`) to create required tables for results + answers so end-to-end scoring works in PR #3 (no in-memory fallback).
- **Acceptance Criteria:**
  - All fixtures match expected OCEAN outputs and totals normalized to 0–100.
  - Client blocks submit until all answers present; API rejects missing answers with list of missing IDs.
  - Response returns `resultId` only; scores stored server-side in Supabase minimal tables (created via migrations in this step; no in-memory stubs) even before full DB build-out.
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit -- __tests__/scoring.test.ts`

### 4) Free results page
- **Scope:** Present computed scores with chart and CTA to unlock premium, per `02-user-flow.md` and `06-wireframes-ui.md`.
- **Files:**
  - `src/app/results/[resultId]/page.tsx` with server-side fetch of stored scores by `resultId`.
  - Components: `components/results/TraitChart.tsx`, `components/results/TraitSummary.tsx`.
  - Content: copy pulled from `07-content-spec.md` (trait blurbs) and `01-product-brief.md` tone.
- **Acceptance Criteria:**
  - Displays five bars with percentages and short text, shows CTA “Unlock full report (PDF)”.
  - Missing/invalid `resultId` redirects back to quiz; no scores in URL query.
  - Analytics events: `paywall_view` triggered on CTA view.
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit -- -t "results"`
  - Manual: navigate from quiz to results, verify chart rendering and accessibility labels.

### 5) Paywall integration (Paddle modal trigger)
- **Scope:** Wire CTA to open Paddle checkout modal using pricing from `03-pricing-packages.md` and fraud rules in `11-payments-playbook.md`.
- **Files:**
  - `components/paywall/CheckoutButton.tsx` (price + currency locked server-side).
  - `lib/payments.ts` (Paddle config, price ID constants, strict product/price allowlist; assume Paddle Billing, confirm how to pass `custom_data`/metadata and expected webhook event names; webhook handler must reconcile by Paddle transaction/order ID even if metadata is missing).
  - `src/app/api/checkout/route.ts` to create client tokens if needed and embed server-trusted price metadata.
- **Acceptance Criteria:**
  - CTA opens Paddle sandbox modal with correct product/price, email capture required.
  - Price cannot be modified client-side; server validates currency/amount against allowlist.
  - Analytics event `checkout_open` fires.
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit -- -t "payments"`
  - Manual sandbox checkout open, cancel path works.

### 6) Checkout → order recording
- **Scope:** Create provisional order before opening Paddle checkout and surface optimistic thank-you state.
- **Files:**
  - `src/app/api/orders/route.ts` to create provisional order (Supabase) before checkout; embed `order_id` in Paddle metadata when available (fallback to mapping by Paddle transaction/order ID if metadata is unavailable per Paddle Billing docs).
  - `src/app/checkout/callback/page.tsx` (client confirmation with loading state).
  - `lib/orders.ts` (order model mapping to `09-data-model-erd.md`).
- **Acceptance Criteria:**
  - Order is created before checkout opens; metadata carries internal `order_id` for reconciliation.
  - After modal success callback, order status `pending_webhook` displayed with “Processing payment” message and retry/resend link.
  - Webhook reconciliation can map by Paddle transaction/order ID if metadata is absent.
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit -- -t "orders"`
  - Manual: trigger modal, confirm order created pre-checkout, verify callback state.

### 7) Webhook processing (Paddle)
- **Scope:** Handle Paddle webhook events with signature verification per `11-payments-playbook.md` (exact event names to match Paddle Billing/Classic when keys are available).
- **Files:**
  - `src/app/api/paddle/route.ts` (or `src/app/api/paddle/webhook/route.ts`) for signature verify, idempotency guard, status update, enqueue async/on-demand PDF generation trigger.
  - `lib/signature.ts` for verification, `lib/logger.ts` for audit trail.
  - Tests: `__tests__/webhook.test.ts` with sample payloads (success, duplicate, failure) and a local-only webhook simulation helper script (e.g., `scripts/simulate-webhook.ts`) that POSTs sample payloads to the dev server (E2), respecting signature requirements via correct signing when possible or a dev-only bypass that is only reachable when `NODE_ENV=development` **and** `ALLOW_WEBHOOK_TEST_BYPASS=1`; no “mark paid” endpoints.
- **Acceptance Criteria:**
  - Valid webhook marks order as `paid` and triggers on-demand PDF generation (with async option later); duplicates ignored.
  - Invalid signatures return 400 and do not change state; handler responds quickly; handler can reconcile by Paddle transaction/order ID even if metadata is absent; aligns with Paddle Billing event names once confirmed.
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit -- -t "webhook"`

### 8) PDF generation & delivery
- **Scope:** Generate premium PDF per `12-pdf-report-spec.md` and provide download/email hooks with caching; default MVP approach is on-demand generation when user clicks “Download report,” with caching to avoid repeat renders (background worker later if needed).
- **Files:**
  - `src/app/api/report/route.ts` (POST order_id → validate paid → HTML → PDF buffer via Playwright) designed for on-demand use, with optional async trigger hook; reuse the Playwright dependency (locked choice C1).
  - Templates: `templates/report.html`, `templates/report.css`.
  - `lib/pdf.ts` (render & size check, skip regeneration if PDF already stored), `lib/email.ts` (stub for send link), `lib/storage.ts` (signed URLs).
- **Acceptance Criteria:**
  - PDF < 700 kB, includes scores and personalized fields, returns signed URL valid 24h.
  - API rejects unpaid orders; audit log entry created; regeneration avoided when cached by `order_id`; on-demand render is the default flow.
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit -- -t "pdf"`
  - Manual: call API locally, open PDF, verify sections and file size.

### 9) Storage (Supabase) for results + PDFs
- **Scope:** Expand Supabase persistence for quiz answers, scores, orders, and PDF assets per `09-data-model-erd.md`; step 3 already created minimal results tables, so this phase broadens schema and queries.
- **Files:**
  - `supabase/migrations/*.sql` for expanded tables (responses, scores, orders, assets) building on the initial results migration from step 3.
  - `lib/db.ts` (Supabase client + helper queries), update `lib/orders.ts`, `src/app/api/score/route.ts`, and `src/app/api/orders/route.ts` to use the broader schema.
  - Env docs in `13-deployment-env.md` applied to `.env.example`.
- **Acceptance Criteria:**
  - Migrations apply cleanly; CRUD operations in APIs use Supabase; price/order checks remain server-trusted.
  - Sensitive keys only server-side; client uses anon key where appropriate.
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit -- -t "db"` (integration with Supabase emulator or mocked)
  - Manual: run migration, hit score/order APIs to verify persistence.

### 10) Analytics + QA polish (+ Playwright e2e)
- **Scope:** Wire Plausible events per `15-analytics-taxonomy.md`, add QA checklist items from `18-qa-launch-checklist.md`, and codify end-to-end coverage with Playwright.
- **Files:**
  - `lib/analytics.ts` updates for all events, `src/app/layout.tsx` to inject Plausible script.
  - QA checklist doc `docs/qa-checklist.md` derived from `18-qa-launch-checklist.md`.
  - Playwright e2e specs covering quiz → paywall → paid (local webhook simulation helper per E2) → PDF download path.
  - Minor UI polish: meta tags per `17-seo-og-plan.md`, legal links to `21–24` stubs.
- **Acceptance Criteria:**
  - All key events fire with UTMs; Plausible script deferred.
  - SEO/OG tags present on Landing, Quiz, Results.
  - Playwright flow passes: complete quiz (short fixture mode), reach paywall, simulate paid status via local webhook helper, download PDF exists.
  - QA checklist committed.
- **Quick Tests:**
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test`
  - `pnpm test:e2e`
  - Manual: verify network beacons for events; inspect page head tags.

## Notes
- Keep PRs small and sequential; each PR references the matching issue.
- Follow fraud controls and security guidance from `11-payments-playbook.md` and `14-security-compliance.md` when implementing APIs.
- Deployment targets Vercel + Supabase (per `13-deployment-env.md`), with Paddle sandbox for payment tests.
