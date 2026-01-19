# TraitHarbor QA Flows

Each flow lists prerequisites, steps, expected results, and edge cases. Use these as repeatable checklists for E2E and integration testing.

## Flow 1: Landing → Start quiz
**Preconditions**
- App running locally.

**Steps**
1. Visit `/`.
2. Click primary CTA to start the quiz.

**Expected**
- Quiz page loads at `/quiz` with the first questions visible.

**Edge cases**
- Refresh the page during navigation.
- Try with blocked JS (expect CTA not to work).

---

## Flow 2: Quiz progression + local storage resume
**Preconditions**
- App running with quiz data available (fixture mode optional).

**Steps**
1. Answer several questions.
2. Reload the page.
3. Continue to next page(s) and complete the quiz.

**Expected**
- Progress is preserved after reload.
- All questions must be answered before submission succeeds.

**Edge cases**
- Clear localStorage and reload mid-quiz.
- Open quiz in a second tab/device (check for divergence).

---

## Flow 3: Quiz submit → Free results
**Preconditions**
- `/api/score` available and returns a `resultId`.

**Steps**
1. Complete all questions.
2. Click **Submit**.

**Expected**
- Redirect to `/results/[resultId]`.
- Results page renders free summary.

**Edge cases**
- API error from `/api/score`.
- Network failure mid-submit (verify error state).

---

## Flow 4: Results → Checkout → Callback → Paid report download
**Preconditions**
- Paddle sandbox creds (client token + price id).
- Webhook available or bypass enabled (`ALLOW_WEBHOOK_TEST_BYPASS=1`).
- Report storage bucket configured.

**Steps**
1. From `/results/[resultId]`, enter email and start checkout.
2. Complete Paddle checkout.
3. Observe redirect to `/checkout/callback` with `session_id`.
4. Wait for status to transition to `paid`.
5. Click **Download report PDF**.

**Expected**
- Order status moves from `pending_webhook` → `paid`.
- PDF download link available.
- File download returns a PDF (size > 0).

**Edge cases**
- Payment failed/canceled.
- Webhook delayed or delivered out of order.
- Refresh `/checkout/callback` at each status.
- Download URL expired (expect refresh behavior).

---

## Flow 5: Retrieve report access link (magic link)
**Preconditions**
- Guest has a paid order in Supabase.
- Email delivery configured (Resend) or mocked.

**Steps**
1. Visit `/retrieve-report`.
2. Enter buyer email and submit.
3. Open the magic link in a new browser/device.

**Expected**
- Success banner on request.
- Magic link hits `/report-access?token=...` and redirects to `/my-reports`.
- Guest session cookie set.

**Edge cases**
- Request with unknown email (should not leak data).
- Expired/used magic link (redirects to `/retrieve-report`).
- Multiple requests (latest link invalidates old).

---

## Flow 6: My reports list + download
**Preconditions**
- Valid guest session cookie.
- Paid order with report ready.

**Steps**
1. Visit `/my-reports`.
2. Confirm paid report appears.
3. Click **Download report**.

**Expected**
- List shows order metadata and status.
- Download URL generated and navigated.

**Edge cases**
- Missing session cookie (shows auth hint).
- Report not ready (download disabled).
- Download URL generation fails (error banner).

---

## Flow 7: Direct report redirect `/r/[orderId]?token=...`
**Preconditions**
- Paid order with report access token hash.
- Token passed in URL.

**Steps**
1. Visit `/r/[orderId]?token=...`.

**Expected**
- Redirects to signed report URL.

**Edge cases**
- Invalid token or unpaid order (redirects to `/retrieve-report`).
- Report generation busy (429).

---

## Flow 8: Legal/policy content
**Preconditions**
- App running.

**Steps**
1. Visit `/privacy`, `/terms`, `/cookies`, `/disclaimer`.

**Expected**
- Content renders without errors.

**Edge cases**
- Mobile viewport/responsive typography.
