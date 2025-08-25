// Direct break_eternity.js utilities
// No wrapper - direct Decimal operations for maximum performance

import { DecimalOps, Decimal, isDecimal } from './large-number';

export type NumericValue = number | string | Decimal | any;

/**
 * Safely converts any value to Decimal (direct break_eternity.js)
 */
export function toDecimal(value: NumericValue): Decimal {
  if (isDecimal(value)) {
    return value;
  }

  // Handle string representations
  if (typeof value === 'string') {
    try {
      return DecimalOps.create(value);
    } catch (error) {
      console.warn('Failed to convert string to Decimal:', error);
      return DecimalOps.create(0);
    }
  }

  // Handle numbers
  if (typeof value === 'number') {
    return DecimalOps.create(value);
  }

  // Fallback
  return DecimalOps.create(0);
}

/**
 * Converts Decimal back to number for UI/display purposes
 */
export function toNumber(value: NumericValue): number {
  if (isDecimal(value)) {
    return DecimalOps.toSafeNumber(value);
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value;
  }

  // Handle strings
  if (typeof value === 'string') {
    return Number(value) || 0;
  }

  return 0;
}

/**
 * Converts to string representation suitable for display
 */
export function toString(value: NumericValue): string {
  if (isDecimal(value)) {
    return DecimalOps.toString(value);
  }

  return String(value || 0);
}

/**
 * Safely performs addition with mixed number types
 */
export function add(a: NumericValue, b: NumericValue): Decimal {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.add(aDec, bDec);
}

/**
 * Safely performs subtraction with mixed number types
 */
export function subtract(a: NumericValue, b: NumericValue): Decimal {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.subtract(aDec, bDec);
}

/**
 * Safely performs multiplication with mixed number types
 */
export function multiply(a: NumericValue, b: NumericValue): Decimal {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.multiply(aDec, bDec);
}

/**
 * Safely performs division with mixed number types
 */
export function divide(a: NumericValue, b: NumericValue): Decimal {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.divide(aDec, bDec);
}

/**
 * Safely performs exponentiation
 */
export function pow(base: NumericValue, exponent: number): Decimal {
  const baseDec = toDecimal(base);
  return DecimalOps.power(baseDec, exponent);
}

/**
 * Safely compares two values
 */
export function gte(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.greaterThanOrEqual(aDec, bDec);
}

export function gt(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.greaterThan(aDec, bDec);
}

export function lte(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.lessThanOrEqual(aDec, bDec);
}

export function lt(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.lessThan(aDec, bDec);
}

export function eq(a: NumericValue, b: NumericValue): boolean {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return DecimalOps.equal(aDec, bDec);
}

/**
 * Formats a number for display, handling very large numbers
 */
export function formatDecimal(value: NumericValue): string {
  if (isDecimal(value)) {
    return DecimalOps.format(value);
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
    toNumber,
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
