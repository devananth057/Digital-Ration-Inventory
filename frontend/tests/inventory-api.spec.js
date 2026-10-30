
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api/inventory';

function createInventoryItem() {
  return {
    itemName: `Automation Rice ${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    category: 'Grains',
    quantity: 100,
    unit: 'kg',
    pricePerUnit: 25,
    lowStockThreshold: 20,
  };
}

test.describe('RationFlow Inventory API Tests', () => {
  test('GET / - Retrieve all inventory items', async ({ request }) => {
    const response = await request.get(API_URL);

    expect(response.status()).toBe(200);

    const items = await response.json();
    expect(Array.isArray(items)).toBe(true);
  });

  test('POST / - Reject an item with missing required fields', async ({
    request,
  }) => {
    const response = await request.post(API_URL, {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Reject an unsupported unit', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        ...createInventoryItem(),
        unit: 'tonne',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Reject a negative quantity', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        ...createInventoryItem(),
        quantity: -5,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Create an inventory item', async ({ request }) => {
    const itemData = createInventoryItem();

    const response = await request.post(API_URL, {
      data: itemData,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.message).toBe('Inventory item added successfully');
    expect(body.item.itemName).toBe(itemData.itemName);
    expect(body.item.category).toBe(itemData.category);
    expect(body.item.quantity).toBe(100);
    expect(body.item.unit).toBe('kg');
    expect(body.item.pricePerUnit).toBe(25);
    expect(body.item._id).toBeTruthy();
  });

  test('GET /low-stock - Return items at or below their threshold', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/low-stock`);

    expect(response.status()).toBe(200);

    const items = await response.json();
    expect(Array.isArray(items)).toBe(true);

    for (const item of items) {
      expect(item.quantity).toBeLessThanOrEqual(item.lowStockThreshold);
    }
  });

  test('PUT /:id - Reject an invalid item ID', async ({ request }) => {
    const response = await request.put(`${API_URL}/invalid-id`, {
      data: { quantity: 50 },
    });

    expect(response.status()).toBe(400);
  });

  test('DELETE /:id - Return 404 for a nonexistent item', async ({
    request,
  }) => {
    const response = await request.delete(
      `${API_URL}/507f1f77bcf86cd799439011`
    );

    expect(response.status()).toBe(404);
  });
});
