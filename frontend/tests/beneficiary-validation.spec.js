import { test, expect } from '@playwright/test';

test('Beneficiary registration validates required fields', async ({ page }) => {
  await page.goto('/beneficiaries');

  const saveButton = page.getByRole('button', {
    name: /save beneficiary/i
  });

  if (!(await saveButton.isVisible().catch(() => false))) {
    await page.getByRole('button', {
      name: /add beneficiary/i
    }).click();
  }

  // Attempt to submit the form without entering any details.
  await saveButton.click();

  // Verify that the form does not create a beneficiary.
  await expect(
    page.getByPlaceholder('Enter full name')
  ).toBeVisible();

  await expect(
    page.getByPlaceholder('Enter full name')
  ).toHaveValue('');

  await expect(
    page.getByPlaceholder(/e\.g\.\s*TN-42-008156/i)
  ).toHaveValue('');
});
