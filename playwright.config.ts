import { defineConfig, devices } from '@playwright/test';

const base = process.env.VITE_BASE ?? '/';

// Normaal start Playwright zelf een previewserver op dist. Staat E2E_BASE_URL
// gezet, dan draaien dezelfde tests tegen een echte, al gedeployde site.
const liveUrl = process.env.E2E_BASE_URL;
const url = liveUrl ?? `http://127.0.0.1:4173${base}`;

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
  ...(liveUrl ? {} : { webServer: {
    // --host vastzetten op 127.0.0.1. Zonder dat bindt vite zich aan
    // "localhost", wat op een CI runner eerst IPv6 is, en dan wacht Playwright
    // zich suf op een server die wel draait maar niet op dat adres luistert.
    command: 'npm run preview -- --port 4173 --strictPort --host 127.0.0.1',
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Zo staat de uitvoer van de server in de log als hij ooit weer faalt.
    stdout: 'pipe',
    stderr: 'pipe'
  } })
});
