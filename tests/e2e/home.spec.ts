import { test, expect } from '@playwright/test';

test('home page renders hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'BigFive experience' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Design system' })).toBeVisible();
});
