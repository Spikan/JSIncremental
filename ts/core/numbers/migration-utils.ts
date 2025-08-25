// Direct break_eternity.js utilities
// No wrapper - direct Decimal operations for maximum performance

// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { isDecimal, DecimalType } from './decimal-utils';

// Export Decimal for use by other modules
export { Decimal };
export type { DecimalType };

export type NumericValue = number | string | DecimalType | any;

/**
 * Safely converts any value to Decimal (direct break_eternity.js)
 */
export function toDecimal(value: NumericValue): DecimalType {
  if (isDecimal(value)) {
    return value;
  }

  // Handle string representations
  if (typeof value === 'string') {
    try {
      return new Decimal(value);
    } catch (error) {
      console.warn('Failed to convert string to Decimal:', error);
      return new Decimal(0);
    }
  }

  // Handle numbers
  if (typeof value === 'number') {
    return new Decimal(value);
  }

  // Fallback
  return new Decimal(0);
}

/**
 * Converts to string representation suitable for display
 */
export function toString(value: NumericValue): string {
  if (isDecimal(value)) {
    return value.toString();
  }

  return String(value || 0);
}

/**
 * Safely performs addition with mixed number types
 */
export function add(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.add(bDec);
}

/**
 * Safely performs subtraction with mixed number types
 */
export function subtract(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.sub(bDec);
}

/**
 * Safely performs multiplication with mixed number types
 */
export function multiply(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.mul(bDec);
}

/**
 * Safely performs division with mixed number types
 */
export function divide(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.div(bDec);
}

/**
 * Safely performs exponentiation
 */
export function pow(base: NumericValue, exponent: number): DecimalType {
  const baseDec = toDecimal(base);
  return baseDec.pow(exponent);
}

/**
 * Safely compares two values
 */
export function gte(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.gte(bDec);
}

export function gt(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.gt(bDec);
}

export function lte(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.lte(bDec);
}

export function lt(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.lt(bDec);
}

export function eq(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.eq(bDec);
}

/**
 * Formats a number for display, handling very large numbers
 */
export function formatDecimal(value: NumericValue): string {
  if (isDecimal(value)) {
    return value.toString();
  }

  // Handle regular numbers with proper type checking
  if (typeof value === 'number') {
    if (value >= 1e6 || value <= -1e6) {
      return (value as number).toExponential(2);
    }
    return (value as number).toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  }

  return String(value || 0);
}

// Legacy function names for backward compatibility during migration
export const toLargeNumber = toDecimal;
export const isLargeNumber = isDecimal;

// Export for global use
if (typeof window !== 'undefined') {
  (window as any).DecimalUtils = {
    toDecimal,
    toString,
    add,
    subtract,
    multiply,
    divide,
    pow,
    gte,
    gt,
    lte,
    lt,
    eq,
    isDecimal,
    formatDecimal,
    // Legacy aliases
    toLargeNumber,
    isLargeNumber,
  };
}
