# 12 · PDF Report Spec

## Runtime and entry points
- API entry points:
  - `POST /api/report`
  - `POST /api/reports/[orderId]/download-url`
  - `GET /r/[orderId]?token=...` (redirect flow)
- Node.js runtime is required for PDF generation routes.

## Pipeline
1. Resolve order and authorization.
2. Attempt existing report path(s) in storage.
3. If missing, load score + facet data.
4. Build payload and render HTML via templates.
5. Render PDF with `puppeteer-core`.
6. Upload PDF to Supabase Storage.
7. Return short-lived signed URL.

## Implementation files
- Orchestration/cache/signing: `lib/report-download.ts`
- HTML + PDF rendering: `lib/pdf.ts`
- Report text/content helpers: `lib/report-content.ts`
- Templates:
  - `templates/report.html`
  - `templates/report.css`

## Rendering configuration
- Browserless websocket is supported via `BROWSERLESS_WS_ENDPOINT` (or token/host env).
- Local fallback is supported with:
  - `REPORT_LOCAL_FALLBACK=1`
  - `CHROME_EXECUTABLE_PATH`
- Concurrency guard is enforced in renderer (`MAX_CONCURRENT_PDF`).

## Payload fields
- Required: date, OCEAN trait values, trait percentages/rank/highest/lowest.
- Optional: facet scores and quiz variant (`ipip120` / `ipip60`).

## URL behavior
- Download endpoints return short-lived signed URLs (currently 300s in route handlers).
- Report generation path supports cache reuse to avoid redundant renders.

## Fixture scripts
- Generate fixtures (HTML + JSON + PDF): `pnpm gen:fixtures`
  - `scripts/generate-report-fixtures.ts`
  - `scripts/generate-report-fixtures.impl.ts`
- Validate fixture template rendering: `pnpm pdf:fixture-check`
  - `scripts/pdf-fixture-check.ts`
- Regenerate fixture HTML from payloads:
  - `scripts/regenerate-fixture-html.ts`
