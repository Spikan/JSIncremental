// 🚀 DECIMAL UTILITIES - Direct break_eternity.js integration
// Essential utilities for working with break_eternity.js Decimal objects

// Type for break_eternity.js Decimal instances
export type DecimalType = any;

// Type guard for break_eternity.js Decimal objects
export function checkIsDecimal(value: any): value is DecimalType {
  if (!value) return false;
  try {
    return (
      typeof value.toString === 'function' &&
      typeof value.toNumber === 'function' &&
      typeof value.add === 'function' &&
      typeof value.mul === 'function' &&
      typeof value.isFinite === 'function'
    );
  } catch {
    return false;
  }
}

// Minimal formatting utility for UI display
export const formatDecimal = (value: any): string => {
  if (!checkIsDecimal(value)) {
    if (typeof value === 'number') {
      return !isFinite(value)
        ? String(value)
        : Math.abs(value) < 1000000
          ? (value as number).toLocaleString(undefined, { maximumFractionDigits: 2 })
          : String(value);
    }
    return String(value || 0);
  }

  try {
    if (!value.isFinite()) {
      return value.isNaN() ? 'NaN' : value.isNegative() ? '-∞' : '∞';
    }

    const num = value.toNumber();
    if (isFinite(num) && Math.abs(num) < 1000000) {
      return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    return value.toString();
  } catch (error) {
    console.warn('formatDecimal: Error processing value:', error);
    return String(value || 0);
  }
};
