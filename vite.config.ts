import { defineConfig } from 'vitest/config';

// GitHub Pages serves the site from /<repository-name>/, dus de basis komt uit
// de pipeline. Lokaal is hij gewoon /.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  build: { outDir: 'dist', sourcemap: true },
  // Vitest draait alleen de unit tests. De E2E-tests zijn van Playwright.
  test: { include: ['tests/**/*.test.ts'] }
});
