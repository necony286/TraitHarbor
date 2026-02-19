import { test, expect } from '@playwright/test';

test('home page renders hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Choose your Big Five path and get clear personality insights.'
  );
  await expect(page.getByRole('link', { name: 'Take the Quick quiz', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go deeper (Pro)', exact: true })).toBeVisible();
});
