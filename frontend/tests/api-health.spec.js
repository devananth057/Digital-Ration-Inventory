import { test, expect } from '@playwright/test';

test('Frontend is accessible', async ({ page }) => {
  const response = await page.goto('/');

  expect(response).not.toBeNull();
  expect(response.status()).toBeLessThan(400);
});

test('Backend is accessible', async ({ request }) => {
  const response = await request.get('http://localhost:5000/');

  expect(response.status()).toBeLessThan(500);
});