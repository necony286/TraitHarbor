import { test, expect } from '@playwright/test';

const FIXTURE_RESULT_ID = '11111111-1111-1111-1111-111111111111';
const ORDER_ID = '22222222-2222-2222-2222-222222222222';
const AGREE_LABEL = 'Agree';
const GUEST_SESSION_COOKIE_NAME = 'traitharbor_guest_report_access';
const PDF_URL = 'https://example.com/report.pdf';

const paddleScriptStub = `
  window.Paddle = {
    Environment: { set() {} },
    Initialize() {},
    Checkout: {
      open({ successCallback }) {
        if (typeof successCallback === 'function') {
          successCallback();
        }
      }
    }
  };
`;

test('paid report download works without session storage', async ({ page, browser }) => {
  let orderStatus: 'created' | 'pending_webhook' | 'paid' = 'created';
  let statusChecks = 0;
  let reportAccessUrl = '';

  await page.route('https://cdn.paddle.com/paddle/v2/paddle.js', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: paddleScriptStub })
  );

  await page.route('**/api/score', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ resultId: FIXTURE_RESULT_ID }) })
  );

  await page.route('**/api/orders*', async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === 'POST') {
      orderStatus = 'created';
    }

    if (method === 'PATCH') {
      orderStatus = 'pending_webhook';
    }

    if (method === 'GET' && orderStatus === 'pending_webhook') {
      statusChecks += 1;
      if (statusChecks > 1) {
        orderStatus = 'paid';
      }
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        order: {
          id: ORDER_ID,
          status: orderStatus,
          amountCents: 900,
          resultId: FIXTURE_RESULT_ID,
          paddleOrderId: null,
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          email: 'guest@example.com'
        },
        checkout: {
          priceId: 'price_test',
          currency: 'EUR',
          amount: 900,
          description: 'Starter PDF',
          environment: 'sandbox',
          clientToken: 'test_token'
        }
      })
    });
  });

  await page.route('**/api/report-access/request-link', (route) => {
    reportAccessUrl = new URL('/report-access?token=test-token', page.url()).toString();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'If a paid report matches that email, a secure access link will be sent shortly.',
        accessUrl: reportAccessUrl
      })
    });
  });

  await page.goto('/quiz');

  const MAX_PAGES = 20;
  let pagesProcessed = 0;
  const submitButton = page.getByRole('button', { name: 'Submit', exact: true });
  const nextButton = page.getByRole('button', { name: 'Next', exact: true });

  while (true) {
    if (pagesProcessed >= MAX_PAGES) {
      throw new Error('Exceeded max pages, possible infinite loop in quiz pagination.');
    }
    pagesProcessed += 1;

    const questionGroups = page.getByRole('radiogroup');
    await expect(questionGroups.first()).toBeVisible();
    const groupCount = await questionGroups.count();

    for (let index = 0; index < groupCount; index += 1) {
      const group = questionGroups.nth(index);
      const agreeOption = group.getByRole('radio', { name: AGREE_LABEL, exact: true });
      await agreeOption.scrollIntoViewIfNeeded();
      await agreeOption.check();
    }

    if ((await submitButton.count()) > 0) {
      await submitButton.click();
      break;
    }

    await nextButton.click();
  }

  await expect(page).toHaveURL(new RegExp(`/results/${FIXTURE_RESULT_ID}$`));
  await expect(page.getByRole('heading', { name: 'TraitHarbor personality snapshot' })).toBeVisible();

  await page.getByRole('button', { name: 'Unlock full report (PDF)' }).click();

  await expect(page).toHaveURL(new RegExp(`/checkout/callback\?orderId=${ORDER_ID}$`));
  await expect(page.getByRole('heading', { name: 'Processing your payment' })).toBeVisible();
  await expect(page.getByText('Status: paid')).toBeVisible();

  await page.getByRole('button', { name: 'Email me my access link' }).click();
  await expect(page.getByText('We just emailed a secure access link. Check your inbox shortly.')).toBeVisible();
  expect(reportAccessUrl).not.toBe('');

  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  const context2 = await browser.newContext();
  await context2.route('**/report-access?token=*', (route) =>
    route.fulfill({
      status: 307,
      headers: {
        location: '/my-reports',
        'set-cookie': `${GUEST_SESSION_COOKIE_NAME}=test-session; Path=/; HttpOnly; SameSite=Lax`
      }
    })
  );

  await context2.route('**/api/my-reports', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orders: [
          {
            id: ORDER_ID,
            status: 'paid',
            createdAt: new Date().toISOString(),
            paidAt: new Date().toISOString(),
            reportReady: true
          }
        ]
      })
    })
  );

  await context2.route(`**/api/reports/${ORDER_ID}/download-url`, (route) => {
    const cookies = route.request().headers()['cookie'] || '';
    if (!cookies.includes(`${GUEST_SESSION_COOKIE_NAME}=test-session`)) {
      return route.fulfill({ status: 401, body: 'Unauthorized: Missing guest cookie' });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: PDF_URL })
    });
  });

  await context2.route(PDF_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'application/pdf', body: '%PDF-1.4\n%EOF' })
  );

  const page2 = await context2.newPage();
  await page2.goto(reportAccessUrl);

  await expect(page2.getByRole('heading', { name: 'Your paid TraitHarbor reports' })).toBeVisible();

  const pdfResponsePromise = page2.waitForResponse(PDF_URL);
  await page2.getByRole('button', { name: 'Download report' }).click();
  const pdfResponse = await pdfResponsePromise;

  expect(pdfResponse.status()).toBe(200);
});
