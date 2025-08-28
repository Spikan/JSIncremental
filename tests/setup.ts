// Global test setup - runs before all tests
// This ensures the Decimal constructor is available in the test environment

import { setupTestEnvironment } from './test-utils';

// Setup the test environment globally
const testEnv = setupTestEnvironment();

// Cleanup after all tests complete
afterAll(() => {
  testEnv.cleanup();
});

// Ensure Decimal is available globally for all tests
declare global {
  var Decimal: any;
  var window: any;
  var document: any;
}

// Make Decimal available in the global scope
global.Decimal = (globalThis as any).Decimal;

console.log('🧪 Test environment setup complete - Decimal constructor available');
