# 02 · Detailed User Flow (Start → Finish)

## 1) Landing / Home
- **User arrives on Landing**: hero, proof, and quiz options are visible.
- **Primary actions**:
  - Start Pro quiz → `/quiz` (IPIP-120).
  - Start Quick quiz → `/quiz/quick` (IPIP-60).

## 2) Quiz (IPIP-120 / IPIP-60)
- **Quiz UI**: question panel, Likert 1–5 scale, progress feedback, next/back controls, autosave.
- **Progression**: user answers all required questions for the selected variant.
- **Edge case**: reload mid-quiz restores progress from local storage for that variant.

## 3) Score computation
- After the final answer, client submits `POST /api/score` with `answers`, `userId`, and optional `quizVariant`.
- Server validates that answer IDs exactly match the selected quiz variant item set.

## 4) Free Results page
- **Free results** show trait bars and concise descriptions.
- **CTA** invites the user to unlock the full report.

## 5) Paywall / Checkout
- Selecting “Unlock full report” opens checkout (Paddle modal; pending enablement).
- Checkout includes summary and purchase flow.

## 6) Payment confirmation (Webhook)
- Successful payment triggers webhook confirmation.
- **Edge case**: failure shows retry option and support link.

## 7) PDF generation
- After confirmation, premium PDF report is generated or reused from storage.

## 8) My reports + download access
- User gets access via `/my-reports` and signed report download links.
- **Edge case**: expired signed URL is refreshed via `POST /api/reports/[orderId]/download-url`.

## User state transitions
- Anonymous → Buyer (email captured at checkout).
