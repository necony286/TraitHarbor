# TraitHarbor QA Test Harness

This doc provides a repeatable local QA/test setup.

## 1) Install dependencies
```bash
pnpm install
```

## 2) Install Playwright browsers + OS deps (Linux)
```bash
pnpm exec playwright install --with-deps
pnpm exec playwright install-deps
```

> The `install-deps` step is required on minimal containers to provide GTK/ATK/X11 libs.

## 3) Environment setup
```bash
cp .env.example .env.local
```
Fill in required values:
- Supabase URL + service role key
- Guest session secrets
- Resend API + from address
- Paddle sandbox credentials (for checkout tests)
- Upstash Redis (optional; dev fallback allowed)

## 4) Start Supabase locally (optional but required for API flows)
```bash
supabase start
```
Use the printed credentials in `.env.local`.

## 5) Run the app
```bash
pnpm dev
```

## 6) Run tests
```bash
pnpm test
pnpm test:e2e
```

## 7) Suggested environment for CI
- Use `NEXT_PUBLIC_QUIZ_FIXTURE_MODE=1` for deterministic quiz data.
- Run Playwright headless with `pnpm test:e2e`.
