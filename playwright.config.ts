import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * Defines browser settings, timeout, headless mode, and cross-browser testing
 */
export default defineConfig({
  // Timeout for each test
  timeout: 30 * 1000,

  // Timeout for expect() assertions
  expect: {
    timeout: 5 * 1000,
  },

  // Global timeout for all tests
  globalTimeout: 60 * 60 * 1000,

  // Folders and files to ignore
  testIgnore: '**/node_modules/**',

  // Test retry configuration
  retries: process.env.CI ? 2 : 0,

  // Number of workers for parallel execution
  workers: process.env.CI ? 1 : 4,

  // Reporter configurations
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: './reports/junit.xml' }],
    ['json', { outputFile: './reports/test-results.json' }],
  ],

  // Shared settings for all browsers
  use: {
    // Base URL for relative URLs in tests
    baseURL: process.env.BASE_URL || 'https://saucedemo.com',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Headless mode
    headless: process.env.HEADLESS !== 'false',

    // Slow down actions by specified milliseconds
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
  },

  // Webserver for local development (optional)
  webServer: {
    command: 'npm run serve',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browser configurations
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Fail on console errors
  webServer: undefined,
});
