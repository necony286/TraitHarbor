import { test, expect } from '@playwright/test';

test('home page renders hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meet the TraitHarbor personality quiz');
  await expect(page.getByRole('link', { name: 'Start the quiz' })).toHaveText('Start the quiz');
});
