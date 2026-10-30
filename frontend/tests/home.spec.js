import { test, expect } from '@playwright/test';

test('RationFlow homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
});
