import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  // Run tests sequentially — tests share a single SQLite database
  fullyParallel: false,
  workers: 1,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    // Base URL for all page.goto() calls
    baseURL: 'http://localhost:5173',

    // Collect trace on first retry for debugging
    trace: 'on-first-retry',

    // Screenshot only on test failure
    screenshot: 'only-on-failure',

    // Record video on first retry
    video: 'on-first-retry',

    // Default navigation timeout
    navigationTimeout: 15000,

    // Default action timeout
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
