// 🚀 DECIMAL UTILITIES - Direct break_eternity.js integration
// Essential utilities for working with break_eternity.js Decimal objects

// Type for break_eternity.js Decimal instances
export type DecimalType = any;

// Type guard for break_eternity.js Decimal objects
export const isDecimal = (value: any): value is DecimalType => {
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
};

// Minimal formatting utility for UI display
export const formatDecimal = (value: any): string => {
  if (!isDecimal(value)) {
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
      return num.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    }

    // For large numbers, try to format with limited decimals if possible
    const str = value.toString();
    if (str.includes('.') && !str.includes('e') && !str.includes('E')) {
      // Has decimal part, limit to 2 places
      const parts = str.split('.');
      if (parts.length === 2 && parts[1].length > 2) {
        return parts[0] + '.' + parts[1].substring(0, 2);
      }
    }

    return str;
  } catch (error) {
    console.warn('formatDecimal: Error processing value:', error);
    return String(value || 0);
  }
};
