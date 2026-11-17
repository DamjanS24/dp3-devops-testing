import { defineConfig, devices } from '@playwright/test';

// Normally Playwright starts its own preview server on dist, so the tests run
// against the built files rather than against the dev server. With E2E_BASE_URL
// set, the very same tests run against a real deployed site instead, which is
// how staging is verified in block 5.
const liveUrl = process.env.E2E_BASE_URL;
const url = liveUrl ?? 'http://127.0.0.1:4173/';

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
  ...(liveUrl ? {} : { webServer: {
    // --host pinned to 127.0.0.1. Without it vite binds to "localhost", which
    // on a CI runner resolves to IPv6 first, and then Playwright waits forever
    // on a server that is running but not listening on the address under test.
    command: 'npm run preview -- --port 4173 --strictPort --host 127.0.0.1',
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // So the server's own output ends up in the log if this ever breaks again.
    stdout: 'pipe',
    stderr: 'pipe'
  } })
});
