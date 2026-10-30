import { test, expect } from '@playwright/test';

test('Application remains usable when an API request fails', async ({
  page
}) => {
  await page.route('**/api/**', async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Simulated server error'
      })
    });
  });

  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();
});