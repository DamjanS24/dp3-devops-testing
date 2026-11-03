import { defineConfig } from 'vitest/config';

// GitHub Pages serves the site from /<repository-name>/, dus de basis komt uit
// de pipeline. Lokaal is hij gewoon /.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  build: { outDir: 'dist', sourcemap: true },
  // Vitest draait alleen de unit tests. De E2E-tests zijn van Playwright.
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'json-summary'],
      // Alleen de pure logica telt mee. De renderlaag en de quotes zelf
      // worden door de browsertests gedekt, die meet je hier niet.
      include: ['src/quote.ts'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 }
    }
  }
});
