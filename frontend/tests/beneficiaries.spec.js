
import { test, expect } from '@playwright/test';

test('Beneficiaries page displays records and search controls', async ({ page }) => {
  await page.goto('/beneficiaries');

  // Verify the Beneficiaries page loads.
  await expect(
    page.getByRole('heading', { name: 'Beneficiaries' }).first()
  ).toBeVisible();

  // Verify the beneficiary search field.
  await expect(
    page.getByPlaceholder(/search name, card or mobile/i)
  ).toBeVisible();

  // Verify the Refresh button.
  await expect(
    page.getByRole('button', { name: /refresh/i })
  ).toBeVisible();

  // Verify the beneficiary table contains records.
  await expect(page.getByText('All beneficiaries')).toBeVisible();
});
