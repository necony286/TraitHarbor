# Flow Test Report

## Summary
- **Unit/integration tests:** `pnpm test` ✅ (Vitest passed).
- **E2E tests:** `pnpm test:e2e` ❌ (Playwright browser launch failed due to missing system dependencies).

## Flow status table
| Flow | Status | Evidence | Repro Steps | Root Cause | Fix | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| Landing → Start quiz | **BLOCKED** | `pnpm test:e2e` failed to launch Chromium/Firefox/WebKit due to missing libs. | Run `pnpm test:e2e` | Host missing GTK/ATK/X11 dependencies. | Run `pnpm exec playwright install-deps` (or install listed apt packages). | P1 |
| Quiz progression + resume | **BLOCKED** | E2E suite blocked; unit tests cover quiz state but no browser run. | Run `pnpm test:e2e` | Same as above. | Install Playwright deps. | P1 |
| Quiz submit → results | **BLOCKED** | E2E blocked; unit tests verify `/api/score` + results page rendering. | Run `pnpm test:e2e` | Same as above. | Install Playwright deps. | P1 |
| Results → Checkout → Callback → Paid report download | **BLOCKED** | E2E blocked; unit tests cover checkout config + webhook/order logic. | Run `pnpm test:e2e` | Same as above. | Install Playwright deps. | P1 |
| Retrieve report access link | **BLOCKED** | E2E blocked; unit tests cover `/api/report-access/request-link`. | Run `pnpm test:e2e` | Same as above. | Install Playwright deps. | P1 |
| My reports list + download | **BLOCKED** | E2E blocked; unit tests cover `/api/reports/:orderId/download-url`. | Run `pnpm test:e2e` | Same as above. | Install Playwright deps. | P1 |
| Direct report redirect `/r/[orderId]?token=...` | **BLOCKED** | Not exercised due to Playwright dependency issue; Supabase required. | Run E2E with a paid order + token. | Missing browser deps + Supabase data. | Install deps + seed Supabase order. | P2 |
| Legal/policy content pages | **BLOCKED** | E2E blocked. | Run `pnpm test:e2e` or manual. | Same as above. | Install Playwright deps. | P2 |

## Known blockers & requirements
- **Playwright OS deps** missing in this container (`libatk-1.0.so.0`, GTK, X11, etc.).
- **Supabase data** needed for report access, paid orders, and PDF download flows.
- **Paddle sandbox creds** required for checkout flows.
