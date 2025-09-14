// 🚀 SIMPLIFIED NUMBER SYSTEM - DIRECT BREAK_ETERNITY.JS USAGE
//
// PROJECT-WIDE MEMORY: SPD, SPS, AND ALL PURCHASE COSTS MUST USE BREAK_ETERNITY
// PROJECT-WIDE MEMORY: EXTREMELY LARGE VALUES ARE THE INTENDED RESULT OF GAMEPLAY
// MEMORY: NEVER CONVERT CORE GAME VALUES TO JAVASCRIPT NUMBERS
// MEMORY: PRESERVE FULL DECIMAL PRECISION THROUGHOUT ENTIRE PIPELINE
//
// SIMPLIFIED USAGE:
// 1. new Decimal(value) - Create Decimal objects directly
// 2. decimal.add(other) - Direct arithmetic operations
// 3. decimal.toString() - Convert to string to preserve extreme values
// 4. isDecimal(value) - Type checking

// Export simplified number system
export * from './simplified';

// Re-export for backward compatibility
export {
  Decimal,
  isDecimal,
  toDecimal,
  formatNumber,
  safeToNumber,
  safeToNumberOrDecimal,
} from './simplified';
export type { DecimalType, NumericValue } from './simplified';

// Import simplified Numbers object
import { Numbers } from './simplified';

// Make available globally for backward compatibility
if (typeof window !== 'undefined') {
  (window as any).Numbers = Numbers;
  (window as any).Decimal = Decimal;
}
