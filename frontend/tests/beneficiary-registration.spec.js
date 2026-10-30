import { test, expect } from '@playwright/test';

test('Register a beneficiary with valid details', async ({ page }) => {
  await page.goto('/beneficiaries');

  // Open the registration form if necessary.
  const saveButton = page.getByRole('button', {
    name: /save beneficiary/i
  });

  if (!(await saveButton.isVisible().catch(() => false))) {
    await page.getByRole('button', {
      name: /add beneficiary/i
    }).click();
  }

  // Generate unique details for this test.
  const testCardId = `AUTO-RC-${Date.now()}`;
  const testName = `Automation Beneficiary ${Date.now()}`;

  // Fill in beneficiary details.
  await page.getByPlaceholder('Enter full name')
    .fill(testName);

  await page.getByPlaceholder(/TN-42-008156/i)
    .fill(testCardId);

  await page.getByPlaceholder('10-digit mobile number')
    .fill('9000012345');

  await page.getByPlaceholder('Enter residential address')
    .fill('Automation Test Address, Coimbatore');

  // Set family members.
  await page.locator('input').nth(3).fill('2');

  // Submit the form.
  await saveButton.click();

  // Verify registration success.
  await expect(
    page.getByText(/beneficiary registered successfully/i)
  ).toBeVisible({ timeout: 10000 });

  // Verify the newly registered beneficiary appears.
  await expect(
    page.getByRole('row', {
      name: new RegExp(testCardId)
    })
  ).toBeVisible({ timeout: 10000 });

  // Save a screenshot for evidence.
  await page.screenshot({
    path: 'test-results/beneficiary-registration.png',
    fullPage: true
  });

  console.log('Registration test completed for:', testName);
  console.log('Test ration card ID:', testCardId);
});