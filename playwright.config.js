// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const os = require('os');

// Ortoni Report Configuration
const reportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "test-results/ortoni-report",
  filename: "index.html", 
  title: "Employee Manager E2E Test Report",
  projectName: "Employee Manager Application",
  testType: "End-to-End Functional Tests",
  authorName: "ronaldoacha@gmail.com",
  base64Image: false,
  stdIO: false,
  meta: {
    "Test Cycle": "April 2026",
    version: "1.0.0",
    description: "Comprehensive E2E test suite for Employee Manager",
    release: "1.0",
    platform: os.type(),
    application: "Employee Manager",
    environment: "Development",
    browsers: "Chrome, Mobile"
  },
};

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries - run tests once only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['ortoni-report', reportConfig],
    ['json', { 
      outputFile: 'test-results/results.json'
    }],
    ['junit', { 
      outputFile: 'test-results/results.xml'
    }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    
    /* Collect trace on failure since no retries */
    trace: 'retain-on-failure',
    
    /* Take screenshot on failures */
    screenshot: 'only-on-failure',
    
    /* Record video on failures */
    video: 'retain-on-failure',
    
    /* Configure browser context */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    /* Set timeout for actions */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      },
    },
    
    
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd backend && npm start',
      port: 4000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd frontend && npm run dev', 
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],

  /* Global test timeout */
  timeout: 30 * 1000,
  
  /* Expect timeout */
  expect: {
    timeout: 5000,
  },
  
  /* Output directory for test results */
  outputDir: 'test-results/',
  
  /* Test match patterns */
  testMatch: [
    '**/tests/**/*.spec.js',
    '**/e2e/**/*.test.js'
  ],
});