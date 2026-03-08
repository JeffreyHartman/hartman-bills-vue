import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  use: {
    baseURL: 'http://localhost:8090',
    headless: true,
  },
  webServer: {
    command: 'npx vite --port 8090',
    port: 8090,
    reuseExistingServer: false,
    timeout: 60000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
