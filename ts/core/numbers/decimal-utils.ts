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
  // Handle scientific notation - return as-is
  if (str.includes('e') || str.includes('E')) {
    return str;
  }

  // No decimal point - return as-is
  if (!str.includes('.')) {
    return str;
  }

  const parts = str.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return str;

  const integerPart = parts[0];
  let decimalPart = parts[1];

  // For very long decimal parts (>15 chars), be very aggressive
  if (decimalPart.length > 15) {
    // Look for the first significant digit
    const firstSignificantDigit = decimalPart.search(/[1-9]/);

    // If no significant digits at all, or they're very far out, treat as integer
    if (firstSignificantDigit === -1 || firstSignificantDigit > 10) {
      return integerPart;
    }

    // Keep only up to 2 significant digits beyond the first
    const keepDigits = Math.min(2, decimalPart.length - firstSignificantDigit);
    decimalPart = decimalPart.substring(0, firstSignificantDigit + keepDigits);
  }
  // For moderately long decimals (6-15 chars), check for precision artifacts
  else if (decimalPart.length > 6) {
    // Look for patterns of repeating digits or long zeros
    const firstNonZero = decimalPart.search(/[1-9]/);

    // If mostly zeros or insignificant digits, be more aggressive
    if (firstNonZero === -1 || firstNonZero > 3) {
      return integerPart;
    }

    // Keep only significant digits, limited to 2
    decimalPart = decimalPart.substring(0, Math.min(2, firstNonZero + 2));
  }
  // Standard case: limit to 2 digits
  else if (decimalPart.length > 2) {
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

    // For Decimal objects, use toString() directly instead of toNumber()
    const rawString = value.toString();

    // Check if it's a small number that can be formatted nicely
    const num = parseFloat(rawString);
    if (isFinite(num) && Math.abs(num) < 1000000) {
      return num.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    }
    if (rawString.includes('.') && !rawString.includes('e') && !rawString.includes('E')) {
      const parts = rawString.split('.');
      if (parts.length === 2 && parts[1].length > 2) {
        // Apply our improved cleanup for any number with >2 decimal places
        return cleanExtremeDecimals(rawString);
      }
    }

    return rawString;
  } catch (error) {
    console.warn('formatDecimal: Error processing value:', error);
    return String(value || 0);
  }
};
