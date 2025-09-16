// Simplified Number System - Direct break_eternity.js Usage
// Removes abstraction layers while maintaining functionality

// Modern ES6 import - proper module resolution
import Decimal from 'break_eternity.js';

// Export Decimal for direct use
export { Decimal };
export type DecimalType = any; // break_eternity.js Decimal type

// Type for any numeric value that can be converted to Decimal
export type NumericValue = number | string | DecimalType | any;

/**
 * Check if a value is a Decimal object
 */
export function isDecimal(value: any): value is DecimalType {
  return value && typeof value === 'object' && value.constructor === Decimal;
}

/**
 * Convert any value to Decimal - simplified version
 */
export function toDecimal(value: NumericValue): DecimalType {
  if (isDecimal(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return new Decimal(value);
    } catch (error) {
      console.warn('Invalid decimal string:', value);
      return new Decimal(0);
    }
  }

  if (typeof value === 'number') {
    if (!isFinite(value)) {
      console.warn('Non-finite number:', value);
      return new Decimal(0);
    }
    return new Decimal(value);
  }

  console.warn('Invalid value type for Decimal conversion:', typeof value, value);
  return new Decimal(0);
}

/**
 * Convert to string - simplified
 */
export function toString(value: NumericValue): string {
  if (isDecimal(value)) {
    return value.toString();
  }
  return String(value || 0);
}

/**
 * Format number for display - simplified
 */
export function formatNumber(value: NumericValue): string {
  if (isDecimal(value)) {
    const num = value.toNumber();
    if (num >= 1e12) {
      return value.toExponential(2);
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toFixed(1);
  }

  const num = Number(value) || 0;
  if (num >= 1e12) {
    return num.toExponential(2);
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toFixed(1);
}

/**
 * Safe conversion to number for UI display
 */
export function safeToNumber(value: NumericValue): number {
  if (isDecimal(value)) {
    const num = value.toNumber();
    return isFinite(num) ? num : 0;
  }

  const num = Number(value);
  return isFinite(num) ? num : 0;
}

/**
 * Safe conversion to number or Decimal
 */
export function safeToNumberOrDecimal(value: NumericValue): number | DecimalType {
  if (isDecimal(value)) {
    return value;
  }

  const num = Number(value);
  if (isFinite(num)) {
    return num;
  }

  return new Decimal(0);
}

// Comparison functions - simplified
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

// Arithmetic functions - simplified (these are just convenience wrappers)
export function add(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.add(bDec);
}

export function subtract(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.sub(bDec);
}

export function multiply(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.mul(bDec);
}

export function divide(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.div(bDec);
}

export function pow(a: NumericValue, b: NumericValue): DecimalType {
  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  return aDec.pow(bDec);
}

// Simplified Numbers object - only essential functions
export const Numbers = {
  Decimal,
  isDecimal,
  toDecimal,
  toString,
  formatNumber,
  safeToNumber,
  safeToNumberOrDecimal,
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
};

// Global assignments removed - use proper imports
