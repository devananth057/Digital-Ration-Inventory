
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        testops: {
          api: {
            token: process.env.QASE_TESTOPS_API_TOKEN,
          },
          project: 'RFS',
          uploadAttachments: true,
          run: {
            complete: true,
          },
        },
      },
    ],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
