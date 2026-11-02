import { defineConfig, devices } from '@playwright/test';

const base = process.env.VITE_BASE ?? '/';
const url = `http://127.0.0.1:4173${base}`;

// De E2E-tests draaien tegen de gebouwde site uit dist, dus precies tegen de
// bestanden die ook gedeployed worden, niet tegen de dev server.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html'], ['list']] : 'list',
  use: {
    baseURL: url,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
});
