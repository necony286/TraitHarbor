import { test, expect } from '@playwright/test';

const FIXTURE_RESULT_ID = '11111111-1111-1111-1111-111111111111';
const ORDER_ID = '22222222-2222-2222-2222-222222222222';
const AGREE_LABEL = 'Agree';

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

test('quiz to paid flow with report download', async ({ page }) => {
  let orderStatus: 'created' | 'pending_webhook' | 'paid' = 'created';
  let statusChecks = 0;

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
          createdAt: new Date().toISOString()
        },
        checkout: {
          priceId: 'price_test',
          currency: 'EUR',
          amount: 900,
          description: 'Starter PDF',
          environment: 'sandbox',
          clientToken: 'test_token'
        },
        reportAccessToken: '33333333-3333-3333-3333-333333333333'
      })
    });
  });

  await page.route('**/api/report', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'https://example.com/report.pdf' }) })
  );

  await page.route('https://example.com/report.pdf', (route) =>
    route.fulfill({ status: 200, contentType: 'application/pdf', body: '%PDF-1.4\n%EOF' })
  );

  await page.goto('/quiz');

  const MAX_PAGES = 20;
  let pagesProcessed = 0;
  const submitButton = page.getByRole('button', { name: 'Submit', exact: true });
  const nextButton = page.getByRole('button', { name: 'Next', exact: true });

  while (true) {
    if (pagesProcessed >= MAX_PAGES) {
      throw new Error('Exceeded max pages, possible infinite loop in quiz pagination.');
    }
    pagesProcessed++;

    const questionGroups = page.getByRole('radiogroup');

    for (const group of await questionGroups.all()) {
      await group.getByRole('radio', { name: AGREE_LABEL, exact: true }).check();
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

  await expect(page).toHaveURL(new RegExp(`/checkout/callback\\?orderId=${ORDER_ID}$`));
  await expect(page.getByRole('heading', { name: 'Processing your payment' })).toBeVisible();

  await expect(page.getByText('Status: paid')).toBeVisible();

  await page.getByRole('button', { name: 'Generate report PDF' }).click();
  await expect(page.getByRole('link', { name: 'Download report PDF' })).toHaveAttribute('href', 'https://example.com/report.pdf');
});
