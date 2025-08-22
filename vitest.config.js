import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment setup
    environment: 'jsdom',
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.config.ts',
        'dist/',
        'coverage/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Test setup files
    setupFiles: ['./tests/setup.js'],
    
    // Test patterns
    include: ['tests/**/*.test.js', 'tests/**/*.spec.js'],
    
    // Test timeout
    testTimeout: 10000,
    
    // Mock DOM APIs
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously'
      }
    }
  },
  
  // Resolve paths
  resolve: {
    alias: {
      '@': '/workspace/js',
      '@tests': '/workspace/tests'
    }
  }
});