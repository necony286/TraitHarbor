# Local setup guide (Windows)

This guide focuses on running the TraitHarbor app locally on Windows, including Supabase via Docker, Paddle Sandbox, and optional Upstash Redis.

## 1) Prerequisites

- **Node.js** (see `.nvmrc` for version)
  - If you use `nvm-windows`, run `nvm install` and `nvm use` from the repository root to automatically use the version specified in `.nvmrc`.
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

```bash
copy .env.example .env
```

Fill in the variables you need:

- **Supabase (local)**: set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Paddle (Sandbox)**: set `PADDLE_ENV=sandbox`, plus `PADDLE_CLIENT_TOKEN`, `PADDLE_PRICE_ID`, `PADDLE_WEBHOOK_SECRET`.
- **Upstash Redis (optional)**: set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- **Analytics (optional)**: set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

If you want to run without Redis locally, leave the Upstash values blank unless a route requires them.

## 4) Start Supabase locally (Docker)

From the repo root, start the Supabase stack:

```bash
supabase start
```

Use the output to populate the Supabase environment variables in `.env`.

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
