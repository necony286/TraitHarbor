# Local setup guide

This guide covers running TraitHarbor locally with Supabase (Docker) and optional Upstash Redis. Paddle is present in code but pending enablement.

## 1) Prerequisites

- **Node.js** (see `.nvmrc` for version)
  - If you use `nvm-windows`, run `nvm install` and `nvm use` from the repository root.
- **pnpm 9.12.3** (matches `package.json`).
- **Docker Desktop** (required for Supabase CLI local stack).
- **Supabase CLI** (`supabase` command available).
- **Playwright browsers** (installed via pnpm command below).

## 2) Install dependencies

```bash
pnpm install
pnpm exec playwright install --with-deps
```

## 3) Configure environment variables

Copy the example environment file:

- Windows (PowerShell):
  ```bash
  copy .env.example .env.local
  ```
- macOS/Linux:
  ```bash
  cp .env.example .env.local
  ```

Fill in the variables you need:

**Supabase (required for API routes)**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_REPORTS_BUCKET` (optional; defaults to `reports`)
- `SUPABASE_ANON_KEY` (optional; reserved for future client usage)

**Report access security (required for report access flows)**
- `GUEST_SESSION_SECRET`
- `REPORT_ACCESS_TOKEN_PEPPER`

**Upstash Redis (optional locally)**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Analytics (optional)**
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- `NEXT_PUBLIC_SITE_URL`

**App behavior (optional)**
- `NEXT_PUBLIC_QUIZ_FIXTURE_MODE=1`
- `REPORT_LOCAL_FALLBACK=1` (required for local report fixtures)
- `CHROME_EXECUTABLE_PATH` (required for local report fixtures; set to your Chrome/Chromium binary path, e.g. `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on macOS, `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe` on Windows, or `/usr/bin/google-chrome` on Linux)

**Payments (Paddle — pending enablement)**
- `PADDLE_ENV=sandbox`
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_PRICE_ID`
- `PADDLE_WEBHOOK_SECRET`

**Local webhook simulation (development only)**
- `ALLOW_WEBHOOK_TEST_BYPASS=1`

If you want to run without Redis locally, leave the Upstash values blank; the app falls back to an in-memory limiter in development.

## 4) Start Supabase locally (Docker)

From the repo root, start the Supabase stack:

```bash
supabase start
```

Use the output to populate the Supabase environment variables in `.env.local`.

## 5) Run the dev server

```bash
pnpm dev
```

Open http://localhost:3000 to view the app.

## 6) Run tests

Unit tests:

```bash
pnpm test
```

Lint:

```bash
pnpm lint
```

End-to-end tests (Playwright):

```bash
pnpm test:e2e
```

The Playwright config will start the dev server automatically for E2E runs.

## 7) Generate report fixtures (optional)

Report fixtures include HTML, JSON payloads, and PDFs. Ensure these environment variables are set in `.env.local`:

- `REPORT_LOCAL_FALLBACK=1`
- `CHROME_EXECUTABLE_PATH` (path to your local Chrome/Chromium binary; adjust for macOS/Windows/Linux as needed)

Then run:

```bash
pnpm gen:fixtures
```
