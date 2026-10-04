import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, retries: 0,
  timeout: 60000, expect: { timeout: 10000 }, reporter: 'list',
  use: { browserName: 'chromium', channel: 'chrome', trace: 'retain-on-failure' },
});
