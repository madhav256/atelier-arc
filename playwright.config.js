import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // tests share one seeded database
  retries: 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...(process.env.PW_CHROME && { launchOptions: { executablePath: process.env.PW_CHROME, args: ['--no-sandbox'] } }),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /a11y|smoke/ },
  ],
  webServer: {
    command: 'node e2e/serve.mjs',
    url: 'http://localhost:5173/api/v1/artists',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
