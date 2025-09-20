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

// Polyfill/compatibility layer: align method names used across codebase
try {
  const proto: any = (Decimal as any).prototype as any;
  // Common aliases (decimal.js style)
  if (typeof proto.plus !== 'function') proto.plus = proto.add;
  if (typeof proto.minus !== 'function') proto.minus = proto.sub;
  if (typeof proto.times !== 'function') proto.times = proto.mul;
  if (typeof proto.dividedBy !== 'function') proto.dividedBy = proto.div;
  if (typeof proto.toPower !== 'function') proto.toPower = proto.pow;
  // Additional aliases used in UI/rules
  if (typeof proto.multiply !== 'function') proto.multiply = proto.mul;
  if (typeof proto.subtract !== 'function') proto.subtract = proto.sub;
  if (typeof proto.divide !== 'function') proto.divide = proto.div;
  // Utility alias to support checks like cost.isFinite()
  if (typeof proto.isFinite !== 'function') {
    proto.isFinite = function (): boolean {
      const n = Number(this.toString());
      return Number.isFinite(n);
    };
  }
} catch {}

// Rate-limited warning helper to avoid console spam
let lastWarnTime = 0;
let warnCount = 0;
function warnLimited(...args: any[]): void {
  const now = Date.now();
  if (now - lastWarnTime > 1000) {
    lastWarnTime = now;
    warnCount = 0;
  }
  if (warnCount < 5) {
    // eslint-disable-next-line no-console
    console.warn.apply(console, args as any);
    warnCount++;
  }
}

/**
 * Convert any value to Decimal - simplified version
 */
export function toDecimal(value: NumericValue): DecimalType {
  // Handle null/undefined
  if (value == null) {
    return new Decimal(0);
  }

  // Check if it's already a valid Decimal
  if (isDecimal(value)) {
    // Validate the Decimal object isn't corrupted
    try {
      const test = value.toString();
      if (test === 'NaN' || test === 'Infinity' || test === '-Infinity') {
        warnLimited('Corrupted Decimal object detected, replacing with 0:', value);
        return new Decimal(0);
      }
      return value;
    } catch (error) {
      warnLimited('Corrupted Decimal object detected, replacing with 0:', value);
      return new Decimal(0);
    }
  }

  if (typeof value === 'string') {
    try {
      const result = new Decimal(value);
      // Validate the result
      const test = result.toString();
      if (test === 'NaN' || test === 'Infinity' || test === '-Infinity') {
        warnLimited('Invalid decimal string result:', value, '->', test);
        return new Decimal(0);
      }
      return result;
    } catch (error) {
      warnLimited('Invalid decimal string:', value);
      return new Decimal(0);
    }
  }

  if (typeof value === 'number') {
    if (!isFinite(value)) {
      warnLimited('Non-finite number:', value);
      return new Decimal(0);
    }
    return new Decimal(value);
  }

  // Handle objects that might be corrupted Decimal objects
  if (typeof value === 'object' && value !== null) {
    // Check if it looks like a corrupted Decimal object
    if ('sign' in value && 'mag' in value && 'layer' in value) {
      const signVal = (value as any).sign;
      const magVal = (value as any).mag;
      const layerVal = (value as any).layer;
      const looksFinite =
        Number.isFinite(signVal) && Number.isFinite(magVal) && Number.isFinite(layerVal);
      // Try to salvage via toString if available
      try {
        if (typeof (value as any).toString === 'function') {
          const s = (value as any).toString();
          const candidate = new Decimal(s);
          const test = candidate.toString();
          if (test !== 'NaN' && test !== 'Infinity' && test !== '-Infinity') {
            return candidate;
          }
        }
      } catch {}
      if (!looksFinite) {
        warnLimited('Corrupted Decimal-like object detected, replacing with 0:', value);
        return new Decimal(0);
      }
      // If fields look finite, attempt reconstruction from numeric approximation
      try {
        const approx = Number((value as any).toString?.() ?? 0);
        if (Number.isFinite(approx)) return new Decimal(approx);
      } catch {}
      warnLimited('Corrupted Decimal-like object (unsalvageable), replacing with 0:', value);
      return new Decimal(0);
    }
  }

  warnLimited('Invalid value type for Decimal conversion:', typeof value, value);
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

// Helper: truncate a number to a fixed number of decimals (no rounding)
function truncateToDecimals(value: number, decimals: number): number {
  if (!isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  // Math.trunc keeps sign and truncates toward zero
  return Math.trunc(value * factor) / factor;
}

/**
 * Format number for display - simplified
 */
export function formatNumber(value: NumericValue): string {
  // Gracefully handle objects with only toString (test doubles)
  if (!isDecimal(value) && value && typeof (value as any).toString === 'function') {
    const s = String((value as any).toString());
    const n = Number(s);
    if (Number.isFinite(n)) return formatNumber(n);
    return s;
  }
  if (isDecimal(value)) {
    const num = value.toNumber();
    // Check if toNumber() returned NaN (extreme values)
    if (!isFinite(num)) {
      const str = value.toString();
      return str;
    }
    if (Math.abs(num) >= 1e12) {
      return value.toExponential(2);
    }
    if (Math.abs(num) >= 1e6) {
      const scaled = truncateToDecimals(num / 1e6, 2);
      return scaled.toFixed(2) + 'M';
    }
    if (Math.abs(num) >= 1e3) {
      const scaled = truncateToDecimals(num / 1e3, 2);
      return scaled.toFixed(2) + 'K';
    }
    // Prefer integer string for exact integers
    if (Number.isInteger(num)) return num.toString();
    // Keep one decimal for small non-integers
    return num.toFixed(1);
  }

  const num = Number(value) || 0;
  // Check for NaN values
  if (!isFinite(num)) {
    return 'NaN';
  }
  if (Math.abs(num) >= 1e12) {
    return num.toExponential(2);
  }
  if (Math.abs(num) >= 1e6) {
    const scaled = truncateToDecimals(num / 1e6, 2);
    return scaled.toFixed(2) + 'M';
  }
  if (Math.abs(num) >= 1e3) {
    const scaled = truncateToDecimals(num / 1e3, 2);
    return scaled.toFixed(2) + 'K';
  }
  // Prefer integer string for exact integers
  if (Number.isInteger(num)) return num.toString();
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
