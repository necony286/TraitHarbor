# TraitHarbor

## Overview
TraitHarbor is a personality-test SaaS built around the IPIP-120 questionnaire, offering a free interactive quiz and an optional premium PDF report. The product targets primarily women 18–34 who are self-help and career curious, with a global EU-first audience, delivering credible, shareable insights with a privacy-first approach.

## Start here
1. Read the docs index: [`docs/00-README.md`](./docs/00-README.md).
2. Review the product brief and user flow: [`docs/01-product-brief.md`](./docs/01-product-brief.md), [`docs/02-user-flow.md`](./docs/02-user-flow.md).
3. Follow the implementation plan: [`docs/implementation-plan.md`](./docs/implementation-plan.md).
4. Set up locally: [`docs/local-setup.md`](./docs/local-setup.md).
5. Deploy: [`docs/13-deployment-env.md`](./docs/13-deployment-env.md) → [`docs/vercel-deployment.md`](./docs/vercel-deployment.md).

## Implementation plan source of truth
Follow [`docs/implementation-plan.md`](./docs/implementation-plan.md) for the step-by-step issue and PR sequence. Create one GitHub issue per step (1–10) before coding; each PR should map to the matching issue and acceptance criteria.

## Tech stack
- Next.js 15 app router (`src/app`)
- TypeScript with strict settings
- Styling via global CSS tokens aligned to the design system
- Testing: Vitest + Testing Library for unit tests, Playwright for end-to-end
- Package manager: pnpm

## Project layout
- `src/app` — App Router pages, layouts, and API routes
- `components` — Shared UI building blocks
- `lib` — Shared utilities and helpers
- `docs` — Product, implementation, and deployment documentation
- `tests` / `__tests__` — E2E and unit tests

## Getting started
1. Install dependencies:
   ```bash
   pnpm install
   pnpm exec playwright install --with-deps
   ```
2. Run the dev server:
   ```bash
   pnpm dev
   ```
   The site renders a TraitHarbor shell with design token previews.

For detailed environment setup, see:
- [Local setup guide](./docs/local-setup.md)
- [Vercel deployment guide](./docs/vercel-deployment.md)

## Environment variables
Create a `.env.local` file for local development (start from `.env.example`). Current variables used in code:

**Core (required for API/data flows)**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_REPORTS_BUCKET` (defaults to `reports`)
- `SUPABASE_ANON_KEY` (optional; reserved for future client usage)

**Security for report access**
- `GUEST_SESSION_SECRET`
- `REPORT_ACCESS_TOKEN_PEPPER`

**Rate limiting (Upstash)**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_ALLOW_FAIL_OPEN` (optional, set to `true` in preview-only environments to avoid 503s)

**App behavior / analytics**
- `NEXT_PUBLIC_QUIZ_FIXTURE_MODE=1` (optional, use fixture data)
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional)
- `NEXT_PUBLIC_SITE_URL` (optional; falls back to `VERCEL_URL` or `http://localhost:3000`)
- `ALLOW_WEBHOOK_TEST_BYPASS=1` (optional, development-only Paddle webhook bypass)
- `REPORT_TEMPLATE_VERSION` (optional; defaults to `v1`)
- `REPORT_LOCAL_FALLBACK=1` (optional; required for local fixture PDF rendering)
- `CHROME_EXECUTABLE_PATH` (optional; required for local fixture PDF rendering, set to your local Chrome/Chromium binary path, e.g. `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on macOS, `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe` on Windows, or `/usr/bin/google-chrome` on Linux)

**Payments (Paddle — pending enablement)**
- `PADDLE_ENV`
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_PRICE_ID`
- `PADDLE_WEBHOOK_SECRET`

## Scripts
- `pnpm lint` — Next.js ESLint rules
- `pnpm build` — Next.js production build
- `pnpm test` — Vitest test suite
- `pnpm test:unit` — Vitest (alias)
- `pnpm test:e2e` — Playwright tests
- `pnpm gen:fixtures` — Generate local report fixtures (automatically loads `.env`/`.env.local` before running)
  - Windows example:
    - `REPORT_LOCAL_FALLBACK=1`
    - `CHROME_EXECUTABLE_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`

For Vitest filtering, use `pnpm test:unit -- -t "pattern"` or `pnpm test:unit -- <test-file-path>`.
For Playwright UI mode, use `pnpm test:e2e -- --ui`.

## CI
GitHub Actions (`.github/workflows/ci.yml`) runs on `main` and pull requests:
1. `pnpm install`
2. `pnpm exec playwright install --with-deps`
3. `pnpm lint`
4. `pnpm build`
5. `pnpm test`
6. `pnpm test:e2e`

## Project conventions
- Routes live in `src/app/**` and API routes in `src/app/api/**/route.ts`.
- Quiz data will be stored in `src/data/ipip120.json` and loaded directly (no `/public` fetch).
- Shared UI/utilities belong in top-level `components/**` and `lib/**`.
- Fixture mode for the quiz will use `src/data/ipip120.fixture.json` when `NEXT_PUBLIC_QUIZ_FIXTURE_MODE=1`.
- PDF generation uses the Node.js runtime (Playwright is not supported in Edge); see `src/app/api/report/route.ts` for the runtime declaration.
