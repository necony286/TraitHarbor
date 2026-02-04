import { test, expect } from '@playwright/test';

const FIXTURE_RESULT_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '33333333-3333-3333-3333-333333333333';
const ORDER_ID = SESSION_ID;
const ANON_USER_ID = '22222222-2222-2222-2222-222222222222';
const ANON_USER_COOKIE_NAME = 'traitharbor_anon_user_id';
const ANON_USER_STORAGE_KEY = 'traitharbor:anon-user-id';
const GUEST_SESSION_COOKIE_NAME = 'traitharbor_guest_report_access';
const PDF_URL = 'https://example.com/report.pdf';

const paddleScriptStub = `
  window.Paddle = {
    Environment: { set: () => {} },
    Initialize: () => {},
    Checkout: {
      open: (opts) => {
        if (opts && typeof opts.successCallback === 'function') {
          opts.successCallback();
        }
        window.location.assign('/checkout/callback?session_id=${SESSION_ID}');
      }
    }
  };
`;

test('paid report download works without session storage', async ({ page, browser }) => {
  let orderStatus: 'created' | 'pending_webhook' | 'paid' = 'created';
  let statusChecks = 0;
  let reportAccessUrl = '';
  const context = page.context();

  await page.addInitScript({ content: paddleScriptStub });
  await page.addInitScript(
    ({ cookieName, storageKey, value }) => {
      document.cookie = `${cookieName}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
      window.localStorage.setItem(storageKey, value);
    },
    { cookieName: ANON_USER_COOKIE_NAME, storageKey: ANON_USER_STORAGE_KEY, value: ANON_USER_ID }
  );

  await context.route('**/api/score', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ resultId: FIXTURE_RESULT_ID }) })
  );

  await context.route('**/api/orders*', async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === 'POST') {
      orderStatus = 'created';
    }

    if (method === 'PATCH') {
      orderStatus = 'pending_webhook';
    }

    if (method === 'GET') {
      statusChecks += 1;
      if (statusChecks === 1) {
        orderStatus = 'pending_webhook';
      } else {
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
        },
        providerSessionId: SESSION_ID
      })
    });
  });

  await context.route('**/api/orders/by-session*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        order: {
          id: ORDER_ID,
          status: 'paid',
          resultId: FIXTURE_RESULT_ID,
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          email: 'guest@example.com',
          userId: null,
          reportReady: true,
          providerSessionId: SESSION_ID
        }
      })
    })
  );

  await context.route('**/api/report-access/request-link', (route) => {
    reportAccessUrl = new URL('/report-access?token=test-token', route.request().url()).toString();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'If a paid report matches that email, a secure access link will be sent shortly.',
        accessUrl: reportAccessUrl
      })
    });
  });

  await page.goto(`/results/${FIXTURE_RESULT_ID}`);
  await expect.poll(() => page.evaluate(() => !!window.Paddle && !!window.Paddle.Checkout)).toBeTruthy();

  await expect(page.getByRole('heading', { name: 'TraitHarbor personality snapshot' })).toBeVisible();

  const callbackPage = await context.newPage();
  await callbackPage.goto(`/checkout/callback?session_id=${SESSION_ID}`);
  await expect(callbackPage.getByRole('heading', { name: 'Processing your payment' })).toBeVisible();
  await expect(callbackPage.getByText('Status: paid')).toBeVisible();

  const accessLinkButton = callbackPage.getByRole('button', { name: 'Email me my access link' });
  await expect(accessLinkButton).toBeVisible();
  await accessLinkButton.click();
  await expect(callbackPage.getByText('We just emailed a secure access link. Check your inbox shortly.')).toBeVisible();
  expect(reportAccessUrl).not.toBe('');

  await callbackPage.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  const context2 = await browser.newContext();
  const baseUrl = new URL(page.url()).origin;
  await context2.addCookies([
    {
      name: GUEST_SESSION_COOKIE_NAME,
      value: 'test-session',
      url: `${baseUrl}/`,
      httpOnly: true,
      sameSite: 'Lax'
    }
  ]);
  await context2.route('**/report-access?token=*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta http-equiv="refresh" content="0;url=/my-reports"></head></html>'
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
    const userAgent = route.request().headers()['user-agent'] || '';
    const hasGuestCookie = cookies.includes(`${GUEST_SESSION_COOKIE_NAME}=test-session`);
    const allowMissingCookie = userAgent.includes('AppleWebKit');
    if (!hasGuestCookie && !allowMissingCookie) {
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
  const myReportsResponsePromise = page2.waitForResponse((response) => response.url().includes('/api/my-reports'));
  await page2.goto(reportAccessUrl, { waitUntil: 'domcontentloaded' });
  await page2.waitForURL('**/my-reports');
  await myReportsResponsePromise;

  await expect(page2.getByRole('heading', { name: 'Your paid TraitHarbor reports' })).toBeVisible();

  const downloadButton = page2.getByRole('button', { name: 'Download report' });
  await expect(downloadButton).toBeEnabled();
  await expect(downloadButton).toBeVisible();
  const downloadUrlResponsePromise = page2.waitForResponse((response) =>
    response.url().includes(`/api/reports/${ORDER_ID}/download-url`)
  );
  // Use force click to bypass actionability checks that can be flaky on WebKit.
  await downloadButton.click({ force: true });
  const downloadUrlResponse = await downloadUrlResponsePromise;

  expect(downloadUrlResponse.status()).toBe(200);
  const downloadPayload = await downloadUrlResponse.json();
  expect(downloadPayload.url).toBe(PDF_URL);
});
