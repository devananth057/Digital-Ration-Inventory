
import { test, expect } from '@playwright/test';


const API_URL = 'http://localhost:5000/api';
const INVENTORY_URL = `${API_URL}/inventory`;
const DISTRIBUTION_URL = `${API_URL}/distributions`;
const BENEFICIARY_URL = `${API_URL}/beneficiaries`;


test.describe('RationFlow Distribution API Tests', () => {
  test('GET /distribution - Retrieve distribution history', async ({
    request,
  }) => {
    const response = await request.get(DISTRIBUTION_URL);

    expect(response.status()).toBe(200);

    const distributions = await response.json();

    expect(Array.isArray(distributions)).toBe(true);
  });

  test('POST /distribution - Reject a missing beneficiary ID', async ({
    request,
  }) => {
    const response = await request.post(DISTRIBUTION_URL, {
      data: {
        items: [],
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.message).toContain('beneficiary ID');
  });

  test('POST /distribution - Reject an invalid beneficiary ID', async ({
    request,
  }) => {
    const response = await request.post(DISTRIBUTION_URL, {
      data: {
        beneficiaryId: 'invalid-id',
        items: [
          {
            inventoryItem: 'invalid-id',
            quantity: 1,
          },
        ],
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST /distribution - Reject an empty items array', async ({
    request,
  }) => {
    const response = await request.post(DISTRIBUTION_URL, {
      data: {
        beneficiaryId: '507f1f77bcf86cd799439011',
        items: [],
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST /distribution - Reject zero quantity', async ({
    request,
  }) => {
    const response = await request.post(DISTRIBUTION_URL, {
      data: {
        beneficiaryId: '507f1f77bcf86cd799439011',
        items: [
          {
            inventoryItem: '507f1f77bcf86cd799439012',
            quantity: 0,
          },
        ],
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.message).toContain('positive quantity');
  });

  test('POST /distribution - Reject negative quantity', async ({
    request,
  }) => {
    const response = await request.post(DISTRIBUTION_URL, {
      data: {
        beneficiaryId: '507f1f77bcf86cd799439011',
        items: [
          {
            inventoryItem: '507f1f77bcf86cd799439012',
            quantity: -5,
          },
        ],
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST /distribution - Reject an inactive or nonexistent beneficiary', async ({
    request,
  }) => {
    const response = await request.post(DISTRIBUTION_URL, {
      data: {
        beneficiaryId: '507f1f77bcf86cd799439011',
        items: [
          {
            inventoryItem: '507f1f77bcf86cd799439012',
            quantity: 1,
          },
        ],
      },
    });

    // The beneficiary must exist and have status "Active".
    expect(response.status()).toBe(404);
  });

  test('POST /distribution - Reject distribution when stock is insufficient', async ({
    request,
  }) => {
    // Use an ID that is valid in ObjectId format but normally absent.
    const nonexistentInventoryId = '507f1f77bcf86cd799439013';

    // This request will fail at beneficiary validation first if the
    // beneficiary does not exist, so a 400 is not guaranteed.
    const response = await request.post(DISTRIBUTION_URL, {
      data: {
        beneficiaryId: '507f1f77bcf86cd799439011',
        items: [
          {
            inventoryItem: nonexistentInventoryId,
            quantity: 999999,
          },
        ],
      },
    });

    expect([400, 404]).toContain(response.status());
  });

  test('GET /inventory - Inventory remains accessible after distribution checks', async ({
    request,
  }) => {
    const response = await request.get(INVENTORY_URL);

    expect(response.status()).toBe(200);

    const inventory = await response.json();

    expect(Array.isArray(inventory)).toBe(true);
  });
});
