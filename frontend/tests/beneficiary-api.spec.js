
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api/beneficiaries';

function createBeneficiary() {
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  return {
    rationCardNumber: `AUTO-${uniqueId}`,
    fullName: `Automation Beneficiary ${uniqueId}`,
    phone: '9876543210',
    address: 'Coimbatore, Tamil Nadu',
    familyMembers: 4,
    cardType: 'PHH',
    status: 'Active',
  };
}

test.describe('RationFlow Beneficiary API Tests', () => {
  test('GET / - Retrieve all beneficiaries', async ({ request }) => {
    const response = await request.get(API_URL);

    expect(response.status()).toBe(200);

    const beneficiaries = await response.json();

    expect(Array.isArray(beneficiaries)).toBe(true);
  });

  test('POST / - Register a beneficiary successfully', async ({
    request,
  }) => {
    const beneficiaryData = createBeneficiary();

    const response = await request.post(API_URL, {
      data: beneficiaryData,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.message).toBe('Beneficiary registered successfully');
    expect(body.beneficiary._id).toBeTruthy();
    expect(body.beneficiary.rationCardNumber).toBe(
      beneficiaryData.rationCardNumber
    );
    expect(body.beneficiary.fullName).toBe(beneficiaryData.fullName);
    expect(body.beneficiary.status).toBe('Active');
  });

  test('POST / - Reject missing required fields', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Reject an unsupported card type', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        ...createBeneficiary(),
        cardType: 'INVALID',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Reject zero family members', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        ...createBeneficiary(),
        familyMembers: 0,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Reject negative family members', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        ...createBeneficiary(),
        familyMembers: -2,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Reject duplicate ration card numbers', async ({
    request,
  }) => {
    const beneficiaryData = createBeneficiary();

    const firstResponse = await request.post(API_URL, {
      data: beneficiaryData,
    });

    expect(firstResponse.status()).toBe(201);

    const duplicateResponse = await request.post(API_URL, {
      data: beneficiaryData,
    });

    expect(duplicateResponse.status()).toBe(409);

    const body = await duplicateResponse.json();

    expect(body.message).toBe(
      'This ration card number already exists'
    );
  });

  test('POST / - Reject an invalid beneficiary status', async ({
    request,
  }) => {
    const response = await request.post(API_URL, {
      data: {
        ...createBeneficiary(),
        status: 'Pending',
      },
    });

    expect(response.status()).toBe(400);
  });
});
