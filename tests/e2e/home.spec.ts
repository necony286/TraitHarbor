import { test, expect } from '@playwright/test';

test('home page renders hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('See your Big Five profile in ~10 minutes.');
  await expect(page.getByRole('button', { name: 'Start the test', exact: true })).toBeVisible();
});
