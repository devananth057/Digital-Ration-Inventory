
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api/settings';

test.describe('RationFlow Settings API Tests', () => {

  test('GET / - Retrieve shop settings', async ({ request }) => {
    const response = await request.get(API_URL);

    expect(response.status()).toBe(200);

    const settings = await response.json();

    expect(settings).toHaveProperty('shopName');
    expect(settings).toHaveProperty('shopId');
    expect(settings).toHaveProperty('currency');
    expect(settings).toHaveProperty('dateFormat');
    expect(settings).toHaveProperty('lowStockNotifications');
    expect(settings).toHaveProperty('distributionNotifications');
    expect(settings).toHaveProperty('emailNotifications');
  });

  test('GET / - Verify default settings', async ({ request }) => {
    const response = await request.get(API_URL);

    expect(response.status()).toBe(200);

    const settings = await response.json();

    expect(settings.shopName).toBeTruthy();
    expect(settings.shopId).toBeTruthy();
    expect(settings.currency).toBe('INR');
    expect(settings.dateFormat).toBe('DD MMMM YYYY');
    expect(typeof settings.lowStockNotifications).toBe('boolean');
    expect(typeof settings.distributionNotifications).toBe('boolean');
    expect(typeof settings.emailNotifications).toBe('boolean');
  });

  test('PUT / - Update shop settings successfully', async ({ request }) => {
    const response = await request.put(API_URL, {
      data: {
        shopName: 'Automation Test Shop',
        address: 'Coimbatore',
        phone: '9876543210',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY'
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.message).toBe('Settings saved successfully');
    expect(body.settings.shopName).toBe('Automation Test Shop');
    expect(body.settings.address).toBe('Coimbatore');
    expect(body.settings.currency).toBe('INR');
    expect(body.settings.dateFormat).toBe('DD/MM/YYYY');
  });

  test('PUT / - Reject an empty shop name', async ({ request }) => {
    const response = await request.put(API_URL, {
      data: {
        shopName: '   '
      }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.message).toBe('Shop name cannot be empty');
  });

  test('PUT / - Reject an unsupported currency', async ({ request }) => {
    const response = await request.put(API_URL, {
      data: {
        currency: 'XYZ'
      }
    });

    expect(response.status()).toBe(400);
  });

  test('PUT / - Reject an unsupported date format', async ({ request }) => {
    const response = await request.put(API_URL, {
      data: {
        dateFormat: 'MM-DD-YYYY'
      }
    });

    expect(response.status()).toBe(400);
  });

  test('PUT / - Reject an invalid administrator email', async ({ request }) => {
    const response = await request.put(API_URL, {
      data: {
        adminEmail: 'invalid-email'
      }
    });

    // The route should reject invalid email addresses.
    expect(response.status()).toBe(400);
  });

  test('POST /reset - Restore default settings', async ({ request }) => {
    const response = await request.post(`${API_URL}/reset`);

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.message).toBe('Settings restored to defaults');
    expect(body.settings.shopName).toBe('Coimbatore Shop');
    expect(body.settings.adminName).toBe('Devananth P K');
    expect(body.settings.currency).toBe('INR');
    expect(body.settings.dateFormat).toBe('DD MMMM YYYY');
    expect(body.settings.lowStockNotifications).toBe(true);
    expect(body.settings.distributionNotifications).toBe(true);
    expect(body.settings.emailNotifications).toBe(false);
  });

});
