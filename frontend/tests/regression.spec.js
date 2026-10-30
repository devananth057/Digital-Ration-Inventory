
import { test, expect } from '@playwright/test';

test.describe('RationFlow Regression Tests', () => {

  test('Homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    expect(response.status()).toBeLessThan(400);

    await expect(page.locator('body')).toBeVisible();
  });

  test('Application does not display a blank page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();

    const bodyText = await page.locator('body').innerText();

    expect(bodyText.trim().length).toBeGreaterThan(0);
  });

  test('No uncaught JavaScript errors occur on the homepage', async ({
    page
  }) => {
    const errors = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('/');

    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test('Homepage remains accessible after reload', async ({ page }) => {
    await page.goto('/');

    await page.reload();

    await expect(page.locator('body')).toBeVisible();

    const response = await page.goto('/');

    expect(response).not.toBeNull();
    expect(response.status()).toBeLessThan(400);
  });

  test('Main application document has a title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/.+/);
  });

});
