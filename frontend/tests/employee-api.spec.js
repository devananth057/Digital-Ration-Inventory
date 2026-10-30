
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api/employees';

function createEmployee() {
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  return {
    employeeId: `AUTO-EMP-${uniqueId}`,
    fullName: `Automation Employee ${uniqueId}`,
    phone: '9876543210',
    email: `employee-${uniqueId}@example.com`,
    role: 'Staff',
  };
}

test.describe('RationFlow Employee API Tests', () => {
  test('GET / - Retrieve all employees', async ({ request }) => {
    const response = await request.get(API_URL);

    expect(response.status()).toBe(200);

    const employees = await response.json();
    expect(Array.isArray(employees)).toBe(true);
  });

  test('POST / - Reject missing required fields', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Create an employee successfully', async ({ request }) => {
    const employeeData = createEmployee();

    const response = await request.post(API_URL, {
      data: employeeData,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.message).toBe('Employee added successfully');
    expect(body.employee._id).toBeTruthy();
    expect(body.employee.employeeId).toBe(employeeData.employeeId);
    expect(body.employee.fullName).toBe(employeeData.fullName);
    expect(body.employee.email).toBe(employeeData.email.toLowerCase());
    expect(body.employee.role).toBe('Staff');
    expect(body.employee.status).toBe('Active');
  });

  test('POST / - Reject an unsupported employee role', async ({
    request,
  }) => {
    const response = await request.post(API_URL, {
      data: {
        ...createEmployee(),
        role: 'Supervisor',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('POST / - Reject duplicate employee IDs', async ({ request }) => {
    const employeeData = createEmployee();

    const firstResponse = await request.post(API_URL, {
      data: employeeData,
    });

    expect(firstResponse.status()).toBe(201);

    const duplicateResponse = await request.post(API_URL, {
      data: employeeData,
    });

    expect(duplicateResponse.status()).toBe(409);

    const body = await duplicateResponse.json();

    expect(body.message).toBe('Employee ID already exists');
  });

  test('PUT /:id - Update an existing employee', async ({ request }) => {
    const employeeData = createEmployee();

    const createResponse = await request.post(API_URL, {
      data: employeeData,
    });

    expect(createResponse.status()).toBe(201);

    const createdBody = await createResponse.json();
    const employeeId = createdBody.employee._id;

    const updateResponse = await request.put(
      `${API_URL}/${employeeId}`,
      {
        data: {
          fullName: 'Updated Automation Employee',
          status: 'Inactive',
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updatedBody = await updateResponse.json();

    expect(updatedBody.message).toBe('Employee updated successfully');
    expect(updatedBody.employee.fullName).toBe(
      'Updated Automation Employee'
    );
    expect(updatedBody.employee.status).toBe('Inactive');
  });

  test('PUT /:id - Reject an unsupported role', async ({ request }) => {
    const employeeData = createEmployee();

    const createResponse = await request.post(API_URL, {
      data: employeeData,
    });

    expect(createResponse.status()).toBe(201);

    const createdBody = await createResponse.json();

    const updateResponse = await request.put(
      `${API_URL}/${createdBody.employee._id}`,
      {
        data: {
          role: 'Supervisor',
        },
      }
    );

    expect(updateResponse.status()).toBe(400);
  });

  test('PUT /:id - Return 404 for a nonexistent employee', async ({
    request,
  }) => {
    const response = await request.put(
      `${API_URL}/507f1f77bcf86cd799439011`,
      {
        data: {
          fullName: 'Nonexistent Employee',
        },
      }
    );

    expect(response.status()).toBe(404);
  });
});
