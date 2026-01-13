import { test, expect } from '@playwright/test';

test('home page renders hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meet the TraitHarbor personality quiz');
  await expect(page.locator('a[href="/quiz"]')).toHaveText('Start the quiz');
});
