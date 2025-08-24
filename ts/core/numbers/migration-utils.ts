// Migration utilities for gradual transition to LargeNumber
// Provides helper functions to convert between different number types

import { LargeNumber } from './large-number';
import { NumericOperations } from '../../../types/global';

export type NumericValue = number | string | LargeNumber | NumericOperations | any;

/**
 * Safely converts any value to LargeNumber
 */
export function toLargeNumber(value: NumericValue): LargeNumber {
  if (value instanceof LargeNumber) {
    return value;
  }

  // Handle NumericOperations objects (including Decimal.js or break_infinity objects)
  if (value && typeof (value as NumericOperations).add === 'function') {
    try {
      // If it's already a LargeNumber, return as-is
      if (value instanceof LargeNumber) {
        return value;
      }
      // Otherwise, convert through string to preserve precision
      return new LargeNumber(value.toString());
    } catch (error) {
      console.warn('Failed to convert NumericOperations to LargeNumber:', error);
    }
  }

  // Handle string representations
  if (typeof value === 'string') {
    try {
      return new LargeNumber(value);
    } catch (error) {
      console.warn('Failed to convert string to LargeNumber:', error);
      return new LargeNumber(0);
    }
  }

  // Handle numbers
  if (typeof value === 'number') {
    return new LargeNumber(value);
  }

  // Fallback
  return new LargeNumber(0);
}

/**
 * Converts LargeNumber back to number for backward compatibility
 */
export function toNumber(value: NumericValue): number {
  if (value instanceof LargeNumber) {
    return value.toNumber();
  }

  // Handle Decimal.js-like objects safely
  if (value && (typeof (value as any).toString === 'function' || typeof (value as any).toNumber === 'function')) {
    try {
      const str = (value as any).toString?.();
      // If string looks like scientific notation or non-finite when parsed, avoid Number()
      if (typeof str === 'string') {
        const n = Number(str);
        if (Number.isFinite(n)) return n;
        // Non-finite: return 0 to avoid Infinity leaks into UI
        return 0;
      }
      const n = (value as any).toNumber?.();
      return Number.isFinite(n) ? n : 0;
    } catch (error) {
      console.warn('Failed to convert Decimal-like to number:', error);
    }
  }

  // Handle strings
  if (typeof value === 'string') {
    return Number(value) || 0;
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value;
  }

  return 0;
}

/**
 * Converts to string representation suitable for display
 */
export function toString(value: NumericValue): string {
  if (value instanceof LargeNumber) {
    return value.toString();
  }

  // Handle Decimal.js objects
  if (value && typeof value.toString === 'function') {
    try {
      return value.toString();
    } catch (error) {
      console.warn('Failed to convert Decimal to string:', error);
    }
  }

  return String(value || 0);
}

/**
 * Safely performs addition with mixed number types
 */
export function add(a: NumericValue, b: NumericValue): LargeNumber {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.add(bLarge);
}

/**
 * Safely performs subtraction with mixed number types
 */
export function subtract(a: NumericValue, b: NumericValue): LargeNumber {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.subtract(bLarge);
}

/**
 * Safely performs multiplication with mixed number types
 */
export function multiply(a: NumericValue, b: NumericValue): LargeNumber {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.multiply(bLarge);
}

/**
 * Safely performs division with mixed number types
 */
export function divide(a: NumericValue, b: NumericValue): LargeNumber {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.divide(bLarge);
}

/**
 * Safely performs exponentiation
 */
export function pow(base: NumericValue, exponent: number): LargeNumber {
  const baseLarge = toLargeNumber(base);
  return baseLarge.pow(exponent);
}

/**
 * Safely compares two values
 */
export function gte(a: NumericValue, b: NumericValue): boolean {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.gte(bLarge);
}

export function gt(a: NumericValue, b: NumericValue): boolean {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.gt(bLarge);
}

export function lte(a: NumericValue, b: NumericValue): boolean {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.lte(bLarge);
}

export function lt(a: NumericValue, b: NumericValue): boolean {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.lt(bLarge);
}

export function eq(a: NumericValue, b: NumericValue): boolean {
  const aLarge = toLargeNumber(a);
  const bLarge = toLargeNumber(b);
  return aLarge.eq(bLarge);
}

/**
 * Checks if a value is already a LargeNumber
 */
export function isLargeNumber(value: any): value is LargeNumber {
  return value instanceof LargeNumber;
}

/**
 * Checks if a value supports Decimal.js-like operations
 */
export function isDecimalLike(value: any): boolean {
  return value &&
         typeof value.toNumber === 'function' &&
         typeof value.toString === 'function' &&
         typeof value.plus === 'function';
}

/**
 * Migrates a game state object to use LargeNumber
 */
export function migrateStateToLargeNumber(state: any): any {
  const migrated: any = {};

  for (const [key, value] of Object.entries(state)) {
    if (typeof value === 'number') {
      migrated[key] = toLargeNumber(value);
    } else if (isDecimalLike(value)) {
      migrated[key] = toLargeNumber(value);
    } else {
      migrated[key] = value;
    }
  }

  return migrated;
}

/**
 * Migrates a game state object back to numbers for serialization
 */
export function migrateStateToNumbers(state: any): any {
  const migrated: any = {};

  for (const [key, value] of Object.entries(state)) {
    if (isLargeNumber(value)) {
      migrated[key] = toNumber(value);
    } else if (isDecimalLike(value)) {
      migrated[key] = toNumber(value);
    } else {
      migrated[key] = value;
    }
  }

  return migrated;
}

/**
 * Batch converts an array of values to LargeNumber
 */
export function batchToLargeNumber(values: NumericValue[]): LargeNumber[] {
  return values.map(value => toLargeNumber(value));
}

/**
 * Batch converts an array of LargeNumbers to numbers
 */
export function batchToNumber(values: NumericValue[]): number[] {
  return values.map(value => toNumber(value));
}

/**
 * Safely formats a number for display, handling very large numbers
 */
export function formatLargeNumber(value: NumericValue): string {
  if (isLargeNumber(value)) {
    // For LargeNumber, check if it's very large by comparing with LargeNumber values
    const oneMillion = new LargeNumber('1000000');
    const negativeOneMillion = new LargeNumber('-1000000');

    // Use scientific notation for very large numbers
    if (value.gte(oneMillion) || value.lte(negativeOneMillion)) {
      return value.toString(); // Let break_infinity handle formatting
    }

    // For smaller LargeNumbers, try to get the number value safely
    try {
      const numValue = value.toNumber();
      if (Number.isFinite(numValue)) {
        return numValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
      } else {
        // If toNumber() returns Infinity, use toString()
        return value.toString();
      }
    } catch (error) {
      // Fallback to toString if toNumber fails
      return value.toString();
    }
  }

  // Handle Decimal.js objects
  if (isDecimalLike(value)) {
    const numValue = toNumber(value);
    if (numValue >= 1e6 || numValue <= -1e6) {
      return value.toString();
    }
    return numValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  // Handle regular numbers
  if (typeof value === 'number') {
    if (value >= 1e6 || value <= -1e6) {
      return value.toExponential(2);
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  return String(value || 0);
}

// Export for global use
if (typeof window !== 'undefined') {
  (window as any).NumberMigration = {
    toLargeNumber,
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
    isLargeNumber,
    isDecimalLike,
    migrateStateToLargeNumber,
    migrateStateToNumbers,
    batchToLargeNumber,
    batchToNumber,
    formatLargeNumber,
  };
}
