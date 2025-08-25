// 🚀 DIRECT BREAK_ETERNITY.JS ACCESS - MAXIMUM PERFORMANCE, ZERO WRAPPER
//
// PROJECT-WIDE MEMORY: SPD, SPS, AND ALL PURCHASE COSTS MUST USE BREAK_ETERNITY
// PROJECT-WIDE MEMORY: EXTREMELY LARGE VALUES ARE THE INTENDED RESULT OF GAMEPLAY
// MEMORY: NEVER CONVERT CORE GAME VALUES TO JAVASCRIPT NUMBERS
// MEMORY: PRESERVE FULL DECIMAL PRECISION THROUGHOUT ENTIRE PIPELINE
//
// DIRECT BREAK_ETERNITY USAGE:
// 1. new Decimal(value) - Create Decimal objects
// 2. decimal.add(other) - Direct arithmetic operations
// 3. decimal.toString() - Convert to string to preserve extreme values
// 4. isDecimal(value) - Type checking

// Direct break_eternity.js access - Decimal imported from migration-utils.ts
export { formatDecimal } from './decimal-utils';
export * from './migration-utils';

// Explicitly export Decimal for files that need it directly
export { Decimal } from './migration-utils';

// Import isDecimal separately since it's used in the Numbers object
import { isDecimal } from './decimal-utils';

// Import required functions
import {
  toDecimal,
  formatDecimal as migrationFormatDecimal,
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

// Decimal is available from migration-utils.ts export

// Create a unified interface for global use
export const Numbers = {
  // Direct Decimal operations - Decimal available from migration-utils.ts
  Decimal,
  isDecimal,

  // Migration utilities (with legacy aliases)
  toDecimal,
  formatDecimal: migrationFormatDecimal,

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
