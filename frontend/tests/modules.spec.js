import { test, expect } from '@playwright/test';

const modules = [
  { name: 'Dashboard', path: '/' },
  { name: 'Ration Cards', path: '/ration-cards' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Distribution', path: '/distribution' },
  { name: 'Transactions', path: '/transactions' },
  { name: 'Reports', path: '/reports' },
  { name: 'Employees', path: '/employees' },
  { name: 'Notifications', path: '/notifications' },
  { name: 'Settings', path: '/settings' }
];

for (const module of modules) {
  test(`${module.name} page loads successfully`, async ({ page }) => {
    const response = await page.goto(module.path);

    expect(response, `${module.name} page returned no response`).not.toBeNull();

    expect(
      response.status(),
      `${module.name} page returned HTTP ${response.status()}`
    ).toBeLessThan(400);

    await expect(page.locator('body')).toBeVisible();

    await expect(page.locator('body')).not.toBeEmpty();

    console.log(`Verified page: ${module.name}`);
  });
}