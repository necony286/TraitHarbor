# TraitHarbor

## Overview
TraitHarbor is a personality-test SaaS built around the IPIP-120 questionnaire, offering a free interactive quiz and an optional premium PDF report. The product targets primarily women 18–34 who are self-help and career curious, with a global EU-first audience, delivering credible, shareable insights with a privacy-first approach.

## Implementation plan source of truth
Follow [`docs/implementation-plan.md`](./docs/implementation-plan.md) for the step-by-step issue and PR sequence. Create one GitHub issue per step (1–10) before coding; each PR should map to the matching issue and acceptance criteria.

## Tech stack
- Next.js 15 app router (`src/app`)
- TypeScript with strict settings
- Styling via global CSS tokens aligned to the design system
- Testing: Vitest + Testing Library for unit tests, Playwright for end-to-end
- Package manager: pnpm

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
- [Local setup guide (Windows)](./docs/local-setup.md)
- [Vercel deployment guide](./docs/vercel-deployment.md)

## Scripts
- `pnpm lint` — Next.js ESLint rules
- `pnpm build` — Next.js production build
- `pnpm test` — Vitest test suite
- `pnpm test:unit` — Vitest (alias)
- `pnpm test:e2e` — Playwright tests

For Vitest filtering, use `pnpm test:unit -- -t "pattern"` or `pnpm test:unit -- <test-file-path>`.

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
- Fixture mode for the quiz will use `src/data/ipip120.fixture.json` when `NEXT_PUBLIC_QUIZ_FIXTURE_MODE=1` (implemented in later steps).
- PDF generation uses the Node.js runtime (Playwright is not supported in Edge); see `src/app/api/report/route.ts` for the runtime declaration.
