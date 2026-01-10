# 02 · Detailed User Flow (Start → Finish)

## 1) Landing / Home
- **User arrives on Landing**: hero, proof, and CTA are visible to prompt quiz start.
- **Primary action**: select “Start” CTA to begin the test.

## 2) Quiz (IPIP-120)
- **Quiz UI**: question panel, Likert 1–5 scale, progress feedback, next/back controls, autosave.
- **Progression**: user answers questions from 1/120 through 120/120.
- **Edge case**: reload mid-quiz restores progress from local storage.

## 3) Score computation
- After the final answer, scores are computed before results are displayed.

## 4) Free Results page
- **Free results** show a bar chart and short descriptions.
- **CTA** invites the user to unlock the full report.

## 5) Paywall / Checkout
- Selecting “Unlock full report” opens checkout (Paddle modal).
- Checkout includes a summary and purchase flow.

## 6) Payment confirmation (Webhook)
- Successful payment triggers webhook confirmation.
- **Edge case**: failure shows retry option and support link.

## 7) PDF generation
- After confirmation, the premium PDF report is generated.

## 8) Thank-you + Download + Email
- Thank-you page provides download link, share, and email resend.
- **Edge case**: expired PDF link is refreshed via signed URL.

## User state transitions
- Anonymous → Buyer (email captured at checkout).
