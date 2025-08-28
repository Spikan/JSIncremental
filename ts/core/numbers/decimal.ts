// Decimal module - provides Decimal type and utilities
// This is a compatibility layer for tests that expect this import

import { DecimalType, isDecimal } from './decimal-utils';

// Export the Decimal constructor and type
export const Decimal = (globalThis as any).Decimal;
export type { DecimalType };

// Re-export utility functions
export { isDecimal };

// Compatibility functions for tests
export function createDecimal(value: any): DecimalType {
  return new Decimal(value);
}

export function isDecimalInstance(value: any): value is DecimalType {
  return isDecimal(value);
}

// Legacy compatibility - some tests might expect these
export const DecimalUtils = {
  create: createDecimal,
  isInstance: isDecimalInstance,
  isValid: isDecimal,
};
