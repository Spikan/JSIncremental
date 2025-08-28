import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,ts}', 'tests/**/*.spec.{js,ts}', 'tests/**/*.bench.{js,ts}'],
    coverage: {
      include: ['ts/**/*.{ts,tsx}'],
      exclude: ['ts/**/*.d.ts', 'ts/**/index.ts', 'tests/**'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    setupFiles: ['tests/setup.ts'],
    globals: true,
    testTimeout: 10000,
    // Add performance tracking
    benchmark: {
      include: ['**/*.bench.{js,ts}'],
    },
    // Ensure proper environment setup
    environmentOptions: {
      jsdom: {
        // Mock global objects that tests expect
        globals: {
          Decimal: true,
          window: true,
          document: true,
        },
      },
    },
  },
});
