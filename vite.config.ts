import { defineConfig } from 'vitest/config';

// A relative base. The same build therefore works at any URL path, which is
// what lets one artifact be deployed to staging, verified there, and then
// promoted to production unchanged. Nothing in the pipeline has to hand a base
// path in any more, so staging and production cannot drift apart over a setting.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', sourcemap: true },
  // Vitest runs the unit tests only. The browser tests belong to Playwright.
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'json-summary'],
      // Only the pure logic counts. The render layer and the quotes themselves
      // are covered by the browser tests, which this does not measure.
      include: ['src/quote.ts']
      // No thresholds here on purpose. Block 3 runs the tests and writes the
      // report, block 4 is the gate that judges it. See scripts/coverage-gate.mjs.
    }
  }
});
