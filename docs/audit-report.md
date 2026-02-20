# TraitHarbor Deep Audit Report

> **Audit date:** 2026-02-20
> **Auditor:** Claude (Anthropic)
> **Scope:** Architecture, security (OWASP), PDF/report UX, payments & webhooks, storage, performance, quality
> **Branch:** `claude/audit-traitharbor-repo-irhTw`

---

## A) Executive Summary

1. **Authorization is partially spoofable.** The anonymous user identity (`x-user-id` header) is a client-generated, unsigned UUID stored in an unprotected cookie and localStorage. An attacker who learns or guesses a victim's UUID can bypass the `isAuthorizedForOrder` check on two report download endpoints.

2. **`NEXT_PUBLIC_QUIZ_FIXTURE_MODE=1` is a production security bypass.** If accidentally deployed with this env var, `GET /api/orders/by-session` returns a fake "paid" order for *any* session ID, circumventing the entire payment gate.

3. **`GET /api/orders` and `PATCH /api/orders` have no ownership check (BOLA).** Any caller can read order metadata or transition any order to `pending_webhook` status by knowing its UUID.

4. **No Content-Security-Policy (CSP) header.** XSS impact is maximised. Headers present are only `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

5. **Paddle webhook `v1` signature fallback has no replay protection.** The timestamp-free HMAC scheme would allow indefinite replay of any captured payload that produces a valid HMAC.

6. **PDF generation concurrency guard is in-process only.** `MAX_CONCURRENT_PDF = 2` is a module-level counter; in a multi-instance serverless deployment (Vercel with concurrent lambdas), each instance enforces its own limit independently, not globally.

7. **PDF is missing key reader UX.** No bookmarks/outline, no tagged PDF (accessibility), no page total in header, Inter font not loaded in CSS (silently falls back to Helvetica Neue), no `widows`/`orphans` control.

8. **Webhook lacks DB-level idempotency for event deduplication.** Only status-regression logic (`shouldUpdateOrder`) prevents double-processing; two racing identical events could both pass and trigger duplicate emails.

9. **`updateOrderFromWebhook` does not guard on current status in the SQL** — unlike `updateOrderStatus`. A concurrent pair of webhooks passing the in-memory `shouldUpdateOrder` check could both commit writes.

10. **All 184 unit tests pass, lint is clean.** Build fails only due to network-blocked Google Fonts fetch (sandbox constraint, not a code defect).

---

## B) Repo Map

```
TraitHarbor/
├── src/app/                       # Next.js App Router pages & routes
│   ├── page.tsx                   # Home / landing
│   ├── quiz/page.tsx              # Quiz UI (ipip120 / ipip60)
│   ├── my-reports/page.tsx        # Report listing (guest + user)
│   ├── retrieve-report/page.tsx   # Email-lookup landing for guest access
│   ├── report-access/route.ts     # Magic-link consumer → sets guest cookie
│   ├── r/[orderId]/route.ts       # Token-gated redirect → signed PDF URL
│   └── api/
│       ├── checkout/route.ts      # GET: Paddle checkout config
│       ├── score/route.ts         # POST: score quiz, persist to DB
│       ├── orders/route.ts        # POST/GET/PATCH: order lifecycle
│       ├── orders/by-session/route.ts  # GET: order by Paddle session ID
│       ├── report/route.ts        # POST: generate/return report URL
│       ├── reports/[orderId]/download-url/route.ts  # POST: signed URL
│       ├── paddle/webhook/route.ts # POST: Paddle webhook handler
│       ├── my-reports/route.ts    # GET: list paid orders
│       └── report-access/request-link/route.ts  # POST: magic-link request
│
├── lib/                           # Server-side business logic
│   ├── pdf.ts                     # HTML→PDF pipeline (Puppeteer/Browserless)
│   ├── report-content.ts          # Trait copy / guidance text
│   ├── report-download.ts         # Orchestrates: fetch scores → generate → upload → sign URL
│   ├── report-authorization.ts    # isAuthorizedForOrder() (user header + guest cookie)
│   ├── report-access.ts           # Token generation / HMAC verification
│   ├── guest-session.ts           # Signed guest session cookie
│   ├── signature.ts               # Paddle signature verification (h1 + v1)
│   ├── paddle-webhook.ts          # Webhook parsing / event extraction
│   ├── payments.ts                # Checkout config from env
│   ├── db.ts                      # All Supabase DB operations (service role)
│   ├── storage.ts                 # Supabase Storage: upload / signed URL
│   ├── supabase.ts                # Singleton admin client (service role key)
│   ├── rate-limit.ts              # Upstash Redis rate limiter + dev fallback
│   ├── email.ts                   # Resend email (report + magic link)
│   ├── scoring.ts                 # IPIP scoring algorithm
│   ├── ipip.ts                    # Quiz item loading
│   └── anonymous-user.ts          # Client-side UUID persistence
│
├── templates/
│   ├── report.html                # Mustache-style template with {{placeholders}}
│   └── report.css                 # Print-aware styles
│
├── supabase/migrations/           # 15 ordered SQL migrations
├── __tests__/                     # 34 Vitest unit test files (184 tests)
├── tests/e2e/                     # Playwright e2e tests
└── fixtures/reports/              # 3 fixture HTML+PDF+payload sets
```

### Critical User Journeys

| Step | Entry | Key modules |
|------|-------|-------------|
| Quiz | `quiz/page.tsx` | `lib/ipip.ts`, localStorage |
| Score | `POST /api/score` | `lib/scoring.ts`, `lib/db.ts` |
| Checkout | `POST /api/orders` → Paddle Overlay | `lib/payments.ts`, `lib/db.ts` |
| Post-payment poll | `GET /api/orders/by-session` | `lib/db.ts` |
| Webhook | `POST /api/paddle/webhook` | `lib/signature.ts`, `lib/db.ts`, `lib/report-download.ts`, `lib/email.ts` |
| Email link | `/r/[orderId]?token=` | `lib/report-access.ts`, `lib/report-download.ts`, `lib/storage.ts` |
| Magic-link | `POST /api/report-access/request-link` → `/report-access?token=` | `lib/report-access.ts`, `lib/guest-session.ts` |
| My reports | `GET /api/my-reports` + `POST /api/reports/[id]/download-url` | `lib/report-authorization.ts`, `lib/report-download.ts` |

**Source of truth:** `orders` table in Supabase. `report_file_key` column caches the storage path. `report_access_links` table handles one-time magic links. Signed PDF URLs are ephemeral (5 min for download; 1 h for email attachment).

---

## C) Findings Table

### Critical

| # | Sev | Area | What's wrong / risk | Where (file:line) | Evidence | Recommendation |
|---|-----|------|--------------------|--------------------|----------|----------------|
| C1 | **Critical** | Auth | `NEXT_PUBLIC_QUIZ_FIXTURE_MODE=1` completely bypasses payment check: any `session_id` returns a fake paid order | `src/app/api/orders/by-session/route.ts:52-71` | `useFixture = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE === '1'`; returns hardcoded `status: 'paid'` | Remove the fixture branch from this production route. Put fixture logic behind a dedicated middleware or test-only handler, guarded by `NODE_ENV === 'test'`. |

### High

| # | Sev | Area | What's wrong / risk | Where (file:line) | Evidence | Recommendation |
|---|-----|------|--------------------|--------------------|----------|----------------|
| H1 | **High** | Auth / Access | Anonymous user ID is a client-generated UUID in an **unsigned** cookie (`SameSite=Lax`, no `HttpOnly`, no `Secure`). The `x-user-id` header is trusted server-side to authorize report access. An attacker who obtains another user's UUID can access their reports. | `lib/anonymous-user.ts:14-16`, `lib/report-authorization.ts:11-13`, `lib/constants.ts:1` | `document.cookie = \`${ANONYMOUS_USER_COOKIE}=...\`; SameSite=Lax` (no HttpOnly); `headerUserId = request.headers.get(ANONYMOUS_USER_ID_HEADER)` then `order.user_id === headerUserId` | Sign the anonymous user ID server-side (issue a short-lived JWT or opaque session token via a cookie). Replace the unprotected header check with a server-verified session. |
| H2 | **High** | Auth / BOLA | `GET /api/orders?orderId=` returns order metadata (status, amount, resultId, paddleOrderId) to **any caller** without ownership verification. `PATCH /api/orders` allows any caller to transition **any** order in `created` state to `pending_webhook`. | `src/app/api/orders/route.ts:116-156` (GET), `src/app/api/orders/route.ts:158-214` (PATCH) | No `isAuthorizedForOrder` call in GET or PATCH handlers | Add the same `isAuthorizedForOrder` check used in `/api/report` and `/api/reports/[orderId]/download-url` before returning or updating order data. |
| H3 | **High** | Payments / Webhooks | Paddle `v1` signature scheme is timestamp-free — valid payloads can be replayed indefinitely. | `lib/signature.ts:101-106` | `createHmac(body, secret)` without timestamp validation in `v1` branch | Per Paddle's current docs, only `h1` is sent. Reject requests with `v1` scheme headers outright. |
| H4 | **High** | Payments / Webhooks | No database-level event ID deduplication. Two concurrent identical webhook events can both pass the in-memory `shouldUpdateOrder` guard and both trigger order update + email. | `src/app/api/paddle/webhook/route.ts:133-139`, `lib/db.ts:450-541` | `shouldUpdateOrder` is checked in-memory; `updateOrderFromWebhook` has no SQL status guard | Store `event_id` in a `processed_webhook_events` table with unique index, or add `WHERE status = current_status` to the UPDATE. |
| H5 | **High** | Security Headers | No `Content-Security-Policy` header. XSS attack surface is maximised. | `next.config.js:2-7` | `securityHeaders` array has 4 entries; no CSP | Add a strict CSP: `default-src 'self'; script-src 'self' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.supabase.co` |
| H6 | **High** | Payments / Webhooks | PDF generation runs **synchronously inside the webhook request**. `requestPdfGeneration()` is a no-op stub. If Browserless is slow, the webhook handler exceeds Paddle's timeout, causing retries and potentially duplicate email delivery. | `src/app/api/paddle/webhook/route.ts:164` (stub), `src/app/api/paddle/webhook/route.ts:211-237` (inline generation) | `const requestPdfGeneration = (orderId) => { logInfo(...) }` — never queues; PDF generated inline | Implement async queuing (Vercel Queue, Inngest, etc.). Return `200` immediately after DB update, generate PDF asynchronously. |

### Medium

| # | Sev | Area | What's wrong / risk | Where (file:line) | Evidence | Recommendation |
|---|-----|------|--------------------|--------------------|----------|----------------|
| M1 | **Med** | Payments / Webhooks | `updateOrderFromWebhook` has no SQL-level status guard, unlike `updateOrderStatus` which adds `.eq('status', 'created')`. Two racing webhooks can both commit writes. | `lib/db.ts:479-497` | `supabase.from('orders').update({...}).eq('id', orderId)` — no status guard | Add `.in('status', ['created', 'pending_webhook'])` to the UPDATE WHERE clause. |
| M2 | **Med** | Storage | Default signed URL TTL is 24 hours (`REPORT_TTL_SECONDS = 86400`). A leaked URL is valid for the full duration. | `lib/storage.ts:13-14` | `const REPORT_TTL_SECONDS = 60 * 60 * 24` — default used when no TTL passed | Reduce default to 300–600 s for on-demand access. Use longer TTL only for the email attachment path. |
| M3 | **Med** | PDF / UX | `Inter` font referenced in `report.css` but never loaded. Browserless falls back silently to Helvetica Neue / Arial. The 5-second `document.fonts.ready` wait is wasted. | `templates/report.css:2` | `font-family: 'Inter', 'Helvetica Neue', Arial` — no `@font-face` or `@import` | Embed Inter subset as base64 `@font-face` in `report.css`, or load via `@import` with Browserless network access configured. |
| M4 | **Med** | PDF / UX | `page.pdf()` missing `outline: true` (no bookmarks) and `tagged: true` (no WCAG PDF/UA accessibility). | `lib/pdf.ts:875-887` | `page.pdf({ format: 'A4', printBackground: true, ... })` — no `outline` or `tagged` | Add `outline: true` and `tagged: true` to PDF options. |
| M5 | **Med** | PDF / UX | Header shows page number but not total pages. Footer is empty. | `lib/pdf.ts:879-886` | `Page <span class='pageNumber'></span>` — no `totalPages` span; empty footer | Add `of <span class='totalPages'></span>` to header. Add brand attribution to footer. |
| M6 | **Med** | PDF / UX | No `widows`/`orphans` CSS. List items and paragraphs can strand at page breaks. | `templates/report.css` | No `widows` or `orphans` rules | Add `p { widows: 2; orphans: 2; } li { break-inside: avoid; }` |
| M7 | **Med** | Rate Limiting | Report download and score endpoints use `fail-open` rate limiting. When Upstash is unavailable, expensive PDF generation and DB writes are unprotected. | `src/app/api/reports/[orderId]/download-url/route.ts:26-35`, `src/app/api/score/route.ts:38-47` | `mode: 'fail-open'` | Switch PDF-generation-triggering endpoints to `fail-closed`. |
| M8 | **Med** | PDF / UX | `.page-break-before` element is hidden with `display: none` in print media. The actual page break before traits comes from `.report__trait { break-before: page }`. The element is a confusing dead no-op. | `templates/report.css:323-326`, `templates/report.html:40` | `@media print { .page-break-before { display: none; } }` | Remove the element and its CSS rule, or replace with `break-before: page; height: 0; margin: 0;` if a controlled break is needed. |
| M9 | **Med** | Logging | `email` and `orderId` (PII) appear in `warn`/`error` log contexts. Vercel function logs may be team-accessible. | `lib/logger.ts:3`, `lib/db.ts:510,531`, `lib/email.ts:75` | `logWarn('Webhook email mismatch', { existingEmail, webhookEmail })` | Add `email` to `REDACT_KEYS` in `lib/logger.ts`. Hash or truncate emails before logging. |

### Low

| # | Sev | Area | What's wrong / risk | Where (file:line) | Evidence | Recommendation |
|---|-----|------|--------------------|--------------------|----------|----------------|
| L1 | **Low** | Auth | `REPORT_ACCESS_TOKEN_PEPPER` has no versioning. Rotation invalidates all existing hashes. | `lib/report-access.ts:5-10` | Single env var; no version prefix stored | Store a version tag alongside each hash (e.g., `v1:<hash>`). Support multiple pepper versions during rotation. |
| L2 | **Low** | PDF / UX | No hyphenation. Long words can overflow narrow print columns. | `templates/report.css` | No `hyphens` or `overflow-wrap` | Add `p, li { hyphens: auto; overflow-wrap: break-word; }` |
| L3 | **Low** | PDF / UX | Hardcoded 50ms sleep after font wait adds latency with no reliable guarantee. | `lib/pdf.ts:871` | `await new Promise(resolve => setTimeout(resolve, 50))` | Remove or replace with `page.evaluate(() => new Promise(r => requestAnimationFrame(r)))`. |
| L4 | **Low** | PDF / UX | `format: 'A4'` is hardcoded; `preferCSSPageSize` not used. | `lib/pdf.ts:875` | `format: 'A4'` | Consider `preferCSSPageSize: true` with `@page { size: A4; margin: ... }` in CSS. |
| L5 | **Low** | Storage | No explicit bucket policy documented. Assumed private but not verified in migrations or code. | `lib/storage.ts:18-19` | No `CREATE POLICY` or public access config in migrations | Confirm bucket is private in Supabase dashboard. Document the bucket access model. |
| L6 | **Low** | Quality | Two near-identical report download endpoints: `/api/report` (POST) and `/api/reports/[orderId]/download-url` (POST). Creates maintenance burden. | `src/app/api/report/route.ts`, `src/app/api/reports/[orderId]/download-url/route.ts` | Equivalent `isAuthorizedForOrder` + `getOrCreateReportDownloadUrl` flow | Consolidate to one endpoint or clearly document the intended distinction. |
| L7 | **Low** | Quality | `buildListItemsFromPreEscaped` bypasses HTML escaping for trait guidance items inserted into `<li>`. Safe today (static content) but fragile. | `lib/pdf.ts:224-227`, `lib/pdf.ts:471-487` | `items.map((item) => \`<li>${item}</li>\`)` without `escapeHtml` | Consistently apply `escapeHtml()` to all HTML insertion even for "trusted" strings. |
| L8 | **Low** | CI | `next build` fetches Inter from Google Fonts at build time; fails without network access. Causes flaky CI in air-gapped or offline environments. | `src/app/layout.tsx:8`, `.github/workflows/ci.yml:32` | `const inter = Inter({ subsets: ['latin'] })` — build-time network fetch | Use `next/font/local` with vendored Inter woff2 files. |

---

## D) PDF Reader Experience

### Quick Wins (small CSS / PDF options changes)

| Win | Change |
|-----|--------|
| **Bookmarks/outline** | Add `outline: true` to `page.pdf()` in `lib/pdf.ts:875`. Puppeteer generates bookmarks from `<h1>`–`<h6>` headings. |
| **Page total in header** | Change `Page <span class='pageNumber'></span>` to `Page <span class='pageNumber'></span> of <span class='totalPages'></span>` |
| **Meaningful footer** | Fill footer: `© TraitHarbor — for personal use only` |
| **Hyphenation** | Add `p, li { hyphens: auto; overflow-wrap: break-word; }` to `report.css` |
| **Orphans/widows** | Add `p { widows: 2; orphans: 2; }` to `report.css` |
| **Remove 50ms sleep** | Replace with `page.evaluate(() => new Promise(r => requestAnimationFrame(r)))` |
| **Consistent escaping** | Replace `buildListItemsFromPreEscaped` with `escapeHtml`-wrapped equivalents |

### Medium Scope (1–3 days)

| Improvement | Detail |
|-------------|--------|
| **Load Inter font** | Embed Inter subset as base64 `@font-face` in `report.css` or pre-download woff2 to `templates/`. The 5-second `document.fonts.ready` wait is currently wasted since no fonts are fetched. |
| **In-document TOC** | Insert a Table of Contents section after the cover page. Generate as an HTML table from the trait section order before rendering. |
| **`@page` rules** | Move margin/size into CSS with `@page { size: A4; margin: 48px 24px 40px; }` and set `preferCSSPageSize: true`. |
| **Cover page** | Add `break-after: page` to `.report__cover` so cover is always a standalone page 1. Increase cover padding from `8px 0 4px` for visual weight. |

### Big Bets (roadmap)

| Bet | Detail |
|-----|--------|
| **Tagged / accessible PDF** | Add `tagged: true` to `page.pdf()` and audit HTML for semantic correctness. Required for WCAG PDF/UA — important for enterprise/HR buyers. |
| **Percentile comparison** | `traitPercentiles` field exists in `ReportPayload` but population data is not yet integrated. Build or license a Big Five normative dataset. |
| **PDF analytics** | Track signed URL access (Supabase edge function or Plausible custom events). Currently no visibility into whether users download their reports. |
| **Localisation** | Hardcoded `en-US` date formatting and English-only copy. Add i18n hooks. |
| **ipip60 "Quick" layout** | Generate a shorter report for the quick variant rather than the same full-length template. |

---

## E) Verification

### Commands Run + Outputs

```
$ pnpm install --frozen-lockfile
  Done in 25.9s  ✓

$ pnpm lint
  ✔ No ESLint warnings or errors  ✓

$ pnpm test:unit
  Test Files  34 passed (34)
  Tests       184 passed (184)
  Duration    28.82s  ✓

$ pnpm build
  FAILED — network error fetching Inter from fonts.googleapis.com
  Root cause: no outbound internet in audit sandbox (not a code defect)
  Code issue flagged separately as L8 (use next/font/local)
```

### PDF Fixtures

Fixture HTML/PDF/payload triplets exist at `fixtures/reports/fixture-{1,2,3}.*`.
`pnpm pdf:fixture-check` and `pnpm gen:fixtures` require Browserless credentials — not run in this environment.

### E2E Tests

Require running dev server and Playwright browser install. Not run in audit environment. CI pipeline (`ci.yml`) runs them with full browser install.

---

## F) Action Plan

Complexity: **S** = <1 day, **M** = 1–3 days, **L** = 3+ days.

| Priority | Task | Complexity | Finding |
|----------|------|-----------|---------|
| 1 | Remove `NEXT_PUBLIC_QUIZ_FIXTURE_MODE` bypass from `/api/orders/by-session` production route | S | C1 |
| 2 | Add `isAuthorizedForOrder` check to `GET /api/orders` and `PATCH /api/orders` | S | H2 |
| 3 | Add `Content-Security-Policy` header to `next.config.js` | S | H5 |
| 4 | Reject `v1` scheme in `verifyPaddleSignature` (or add application-level deduplication) | S | H3 |
| 5 | Add `email` to logger `REDACT_KEYS`; audit all log contexts for PII | S | M9 |
| 6 | PDF quick wins: `outline: true`, page total header, `widows`/`orphans`, hyphenation, remove 50ms sleep | S | M4, M5, M6, L2, L3 |
| 7 | Add DB-level webhook event ID deduplication (`processed_webhook_events` table) | M | H4 |
| 8 | Add SQL status guard to `updateOrderFromWebhook` | S | M1 |
| 9 | Decouple PDF generation from webhook request (async queue) | L | H6 |
| 10 | Replace anonymous user identity with server-verified signed session | L | H1 |
| 11 | Load Inter font in `report.css` (embed base64 `@font-face`) | M | M3 |
| 12 | Switch report download rate limit to `fail-closed` | S | M7 |
| 13 | Add `tagged: true` to `page.pdf()` for PDF/UA | M | M4 |
| 14 | Confirm Supabase `reports` bucket is private; document bucket policy | S | L5 |
| 15 | Add pepper versioning to report access token hash | M | L1 |
| 16 | Use `next/font/local` for Inter to eliminate build-time network dependency | M | L8 |
| 17 | Consolidate duplicate `/api/report` and `/api/reports/[orderId]/download-url` endpoints | M | L6 |
| 18 | Apply `escapeHtml` consistently to all HTML insertion in `lib/pdf.ts` | S | L7 |
| 19 | Add in-document TOC to PDF | L | D-section |
| 20 | Full PDF accessibility audit (tagged PDF + semantic HTML review) | L | M4 |

---

## Assumptions

- Supabase service role key is server-only and never exposed to the client (confirmed by code review).
- The `reports` Supabase storage bucket is assumed **private** — must be confirmed in the Supabase dashboard.
- Browserless is the production PDF renderer; local Chrome fallback is for development only.
- No RLS policies are present in any of the 15 migrations. The server uses the service role key (bypasses RLS), which is consistent but means RLS provides no defence-in-depth.
- Paddle sends only `h1`-scheme signatures in production. The `v1` handler is likely legacy/dead code.
- `SUPABASE_ANON_KEY` in `.env.example` is present but not used in any server code (only `SUPABASE_SERVICE_ROLE_KEY` is used).
