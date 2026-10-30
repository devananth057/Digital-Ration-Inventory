import { test, expect } from '@playwright/test';

test('Application homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();

  await expect(page.locator('body')).not.toBeEmpty();
});

test('Application has a page title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/.+/);
});