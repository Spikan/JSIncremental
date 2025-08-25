// Direct break_eternity.js utilities
// No wrapper - direct Decimal operations for maximum performance

// Import checkIsDecimal first to avoid temporal dead zone
import { checkIsDecimal, DecimalType } from './decimal-utils';
import { isValidDecimalString } from './safe-conversion';

// Direct break_eternity.js access - function-based to avoid initialization issues
function getDecimal() {
  try {
    return (
      (globalThis as any).Decimal ||
      (typeof window !== 'undefined' ? (window as any).Decimal : undefined)
    );
  } catch (error) {
    console.warn('Decimal library not available:', error);
    return undefined;
  }
}

// Export type for use by other modules
export type { DecimalType };

export type NumericValue = number | string | DecimalType | any;

/**
 * Safely converts any value to Decimal (direct break_eternity.js)
 */
export function toDecimal(value: NumericValue): DecimalType {
  // Check if Decimal is available
  const Decimal = getDecimal();
  if (!Decimal) {
    console.warn('Decimal library not available, returning fallback value');
    return value as any;
  }

  if (checkIsDecimal(value)) {
    return value;
  }

  // Enhanced string validation
  if (typeof value === 'string') {
    // Validate string format before conversion
    if (!isValidDecimalString(value)) {
      console.warn('Invalid decimal string format:', value);
      return new (getDecimal())(0);
    }

    try {
      const result = new (getDecimal())(value);

      // Check for extreme values that might cause performance issues
      if (result.toNumber() >= 1e100) {
        console.warn('Extreme value detected, may impact performance:', value);
      }

      return result;
    } catch (error) {
      console.error('Failed to convert string to Decimal:', error, 'Value:', value);
      return new (getDecimal())(0);
    }
  }

  // Handle numbers with validation
  if (typeof value === 'number') {
    if (!isFinite(value)) {
      console.warn('Non-finite number provided:', value);
      return new (getDecimal())(0);
    }
    return new (getDecimal())(value);
  }

  console.warn('Invalid value type for Decimal conversion:', typeof value, value);
  return new (getDecimal())(0);
}

/**
 * Converts to string representation suitable for display
 */
export function toString(value: NumericValue): string {
  if (checkIsDecimal(value)) {
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
  if (checkIsDecimal(value)) {
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
export const isLargeNumber = checkIsDecimal;

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
    isDecimal: checkIsDecimal,
    formatDecimal,
    // Legacy aliases
    toLargeNumber,
    isLargeNumber,
  };
}
