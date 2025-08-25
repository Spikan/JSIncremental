// Direct break_eternity.js numbers module
// Maximum performance with direct Decimal operations

export { DecimalOps, Decimal, isDecimal } from './large-number';
export * from './migration-utils';

// Import required functions
import {
  toDecimal,
  toNumber,
  formatDecimal,
  gte,
  gt,
  lte,
  lt,
  eq,
  add,
  subtract,
  multiply,
  divide,
  pow,
  toLargeNumber,
  isLargeNumber,
} from './migration-utils';

// Import DecimalOps and isDecimal for the Numbers object
import { DecimalOps, isDecimal } from './large-number';

// Create a unified interface for global use
export const Numbers = {
  // Direct Decimal operations
  DecimalOps,
  Decimal,
  isDecimal,

  // Migration utilities (with legacy aliases)
  toDecimal,
  toNumber,
  formatDecimal,

  // Comparison utilities
  gte,
  gt,
  lte,
  lt,
  eq,

  // Arithmetic utilities
  add,
  subtract,
  multiply,
  divide,
  pow,

  // Legacy aliases
  toLargeNumber,
  isLargeNumber,
};

// Make available globally for backward compatibility
if (typeof window !== 'undefined') {
  (window as any).Numbers = Numbers;
}
