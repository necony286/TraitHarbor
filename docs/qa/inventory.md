# TraitHarbor QA Inventory

## Tech stack
- **Framework:** Next.js 15 App Router with TypeScript. 
- **Runtime:** Node.js (for API routes and PDF generation). 
- **Styling:** Tailwind CSS + design tokens (global CSS). 
- **Package manager:** pnpm. 

## Scripts & tooling
- `pnpm dev` — Next.js dev server.
- `pnpm build` — production build.
- `pnpm lint` — Next.js ESLint.
- `pnpm test` — Vitest unit/integration tests.
- `pnpm test:e2e` — Playwright E2E tests.

## Test frameworks
- **Unit/integration:** Vitest + Testing Library.
- **E2E:** Playwright (Chromium/Firefox/WebKit).

## Data & storage
- **Database:** Supabase (Postgres) for orders, report access links, quiz results.
- **Storage:** Supabase Storage bucket for PDF reports.

## Auth/session model
- Anonymous guest session stored in a signed cookie (`GUEST_SESSION_SECRET`).
- Magic-link access flow for report access links.

## Payments
- Paddle checkout (sandbox + production tokens).
- Webhook ingestion for payment confirmation.

## Email
- Resend API for email delivery.

## PDF generation
- Server-side PDF generation via the `/api/report` route (Node runtime).

## External services & required environment variables
- **Supabase:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_REPORTS_BUCKET`, `SUPABASE_ANON_KEY`.
- **Guest session security:** `GUEST_SESSION_SECRET`, `REPORT_ACCESS_TOKEN_PEPPER`.
- **Rate limiting:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_ALLOW_FAIL_OPEN`.
- **Payments:** `PADDLE_ENV`, `PADDLE_CLIENT_TOKEN`, `PADDLE_PRICE_ID`, `PADDLE_SANDBOX_PRICE_ID`, `PADDLE_WEBHOOK_SECRET`.
- **Email:** `RESEND_API_KEY`, `EMAIL_FROM`.
- **Analytics/site config:** `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_SITE_URL`.
- **Behavior flags:** `NEXT_PUBLIC_QUIZ_FIXTURE_MODE`, `ALLOW_WEBHOOK_TEST_BYPASS`.

## Routes/pages (user-facing)
- `/` — Landing/home.
- `/quiz` — IPIP-120 quiz flow.
- `/quiz/quick` — IPIP-60 Quick quiz flow.
- `/results/[resultId]` — Free results + paywall CTA.
- `/checkout/callback` — Payment callback/status.
- `/my-reports` — Authenticated report list + download.
- `/retrieve-report` — Request report access link.
- `/report-access?token=...` — Magic link → sets guest cookie → redirects to `/my-reports`.
- `/r/[orderId]?token=...` — Signed report redirect for download.
- `/privacy`, `/terms`, `/cookies`, `/disclaimer` — Legal content.

## API routes
- `POST /api/score` — Score quiz answers.
- `POST /api/report` — Generate PDF report.
- `GET /api/checkout` — Return checkout configuration.
- `GET|POST|PATCH /api/orders` — Create and manage orders.
- `GET /api/orders/by-session` — Poll order status by session id.
- `POST /api/reports/[orderId]/download-url` — Signed report download URL.
- `GET /api/my-reports` — List reports for guest session.
- `POST /api/report-access/request-link` — Magic link request.
- `POST /api/paddle/webhook` — Payment webhook.
