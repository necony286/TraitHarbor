import { expect, test } from '@playwright/test';

const ACCESS_LINK_MESSAGE = 'Check your email for a secure link to access your paid report.';
const ERROR_MESSAGE = 'We could not send the email right now. Please try again shortly.';
const REPORT_EMAIL = 'buyer@example.com';
const REPORT_FILENAME = 'report.pdf';
const PDF_URL = `https://example.com/${REPORT_FILENAME}`;

const paidOrder = {
  id: '11111111-1111-1111-1111-111111111111',
  status: 'paid',
  createdAt: new Date('2024-02-01T10:00:00.000Z').toISOString(),
  paidAt: new Date('2024-02-01T10:10:00.000Z').toISOString(),
  reportReady: true
};

test('retrieve report sends an access link request', async ({ page }) => {
  await page.route('**/api/report-access/request-link', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'ok' })
    })
  );

  await page.goto('/retrieve-report');

  await page.getByLabel('Email address').fill(REPORT_EMAIL);
  await page.getByRole('button', { name: 'Send access link' }).click();

  await expect(page.getByText(ACCESS_LINK_MESSAGE)).toBeVisible();
});

test('retrieve report surfaces errors from the API', async ({ page }) => {
  await page.route('**/api/report-access/request-link', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unable to send email' })
    })
  );

  await page.goto('/retrieve-report');

  await page.getByLabel('Email address').fill(REPORT_EMAIL);
  await page.getByRole('button', { name: 'Send access link' }).click();

  await expect(page.getByText(ERROR_MESSAGE)).toBeVisible();
});

test('my reports shows an auth hint when missing a session', async ({ page }) => {
  await page.route('**/api/my-reports', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Missing session' })
    })
  );

  await page.goto('/my-reports');

  await expect(page.getByText('Please verify your email to view your paid reports.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Request a link' })).toBeVisible();
});

test('my reports lists orders and triggers downloads', async ({ page }) => {
  await page.route('**/api/my-reports', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ orders: [paidOrder] })
    })
  );

  await page.route('**/api/reports/**/download-url', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: PDF_URL })
    })
  );

  await page.route(PDF_URL, (route) =>
    route.fulfill({
      status: 200,
      headers: { 'Content-Disposition': `attachment; filename="${REPORT_FILENAME}"` },
      contentType: 'application/pdf',
      body: Buffer.from('%PDF-1.4\n%EOF')
    })
  );

  const downloadPromise = page.waitForEvent('download');

  await page.goto('/my-reports');
  await expect(page.getByText(`Order #${paidOrder.id.slice(0, 8)}`)).toBeVisible();

  await page.getByRole('button', { name: 'Download report' }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(REPORT_FILENAME);
});
