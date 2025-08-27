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

// Helper function to clean up precision artifacts in extreme values
export const cleanExtremeDecimals = (str: string): string => {
  if (!str.includes('.') || str.includes('e') || str.includes('E')) {
    return str;
  }

  const parts = str.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return str;

  const integerPart = parts[0];
  let decimalPart = parts[1];

  // For very long decimal parts, check if they're just precision artifacts
  if (decimalPart.length > 10) {
    // Check if the decimal part is mostly zeros or repeating patterns
    const firstNonZero = decimalPart.search(/[1-9]/);
    if (firstNonZero === -1 || firstNonZero > 5) {
      // No significant digits in first 5 decimal places, treat as zero
      return integerPart;
    }
    // Keep only significant digits, but limit to 2
    decimalPart = decimalPart.substring(0, Math.min(2, firstNonZero + 2));
  } else if (decimalPart.length > 2) {
    // Standard case: limit to 2 digits
    decimalPart = decimalPart.substring(0, 2);
  }

  // Remove trailing zeros
  while (decimalPart.endsWith('0') && decimalPart.length > 0) {
    decimalPart = decimalPart.slice(0, -1);
  }

  // If no decimal part left, return just integer
  if (decimalPart.length === 0) {
    return integerPart;
  }

  return integerPart + '.' + decimalPart;
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

    // For large numbers, use intelligent decimal cleanup
    return cleanExtremeDecimals(value.toString());
  } catch (error) {
    console.warn('formatDecimal: Error processing value:', error);
    return String(value || 0);
  }
};
