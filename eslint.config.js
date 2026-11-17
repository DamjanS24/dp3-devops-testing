import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'playwright-report', 'test-results', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'warn'
    }
  },
  {
    // The pipeline's own gate scripts. These run under Node, not in a browser,
    // and printing is what they are for, so the console rule would only be
    // noise here.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly'
      }
    },
    rules: { 'no-console': 'off' }
  }
);
