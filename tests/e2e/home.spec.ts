import { test, expect } from '@playwright/test';

test('home page renders hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Meet the TraitHarbor personality quiz' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start the quiz' })).toBeVisible();
});
