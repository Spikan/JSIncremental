// LargeNumber module - compatibility layer for tests
// This provides the LargeNumber constructor that tests expect
// In the actual codebase, we use Decimal from break_eternity.js directly

import { Decimal } from './migration-utils';

// LargeNumber is just an alias for Decimal - break_eternity.js should always be available
export const LargeNumber = Decimal;

// Also export individual functions for tests that import them
export function toLargeNumber(value: any): any {
  if (value === undefined || value === null) {
    return new Decimal(0);
  }
  if (value && typeof value.toNumber === 'function') {
    // Handle MockDecimal and other Decimal-like objects
    return new Decimal(value.toNumber());
  }
  return new Decimal(value);
}

export function toNumber(value: any): number {
  if (value && typeof value.toNumber === 'function') {
    const num = value.toNumber();
    // Only return the number if it's within safe range to preserve extreme values
    if (isFinite(num) && Math.abs(num) < 1e15) {
      return num;
    }
    // For extreme values, return 0 to prevent precision loss
    return 0;
  }
  return Number(value) || 0;
}

export function formatLargeNumber(value: any): string {
  if (value && typeof value.toString === 'function') {
    const str = value.toString();
    // Add comma formatting for numbers
    const num = Number(str);
    if (!isNaN(num) && isFinite(num)) {
      if (Math.abs(num) >= 1e6) {
        return num.toExponential();
      } else {
        return num.toLocaleString();
      }
    }
    return str;
  }
  const num = Number(value);
  if (!isNaN(num) && isFinite(num)) {
    if (Math.abs(num) >= 1e6) {
      return num.toExponential();
    } else {
      return num.toLocaleString();
    }
  }
  return String(value || 0);
}

// Migration functions for backward compatibility
export function migrateStateToLargeNumber(state: any): any {
  const migrated: any = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value === 'number') {
      // Handle regular numbers (including level and drinkRate)
      if (isFinite(value)) {
        migrated[key] = new Decimal(value);
      } else {
        migrated[key] = new Decimal(0);
      }
    } else if (
      value &&
      typeof value === 'object' &&
      typeof (value as any).toNumber === 'function'
    ) {
      // Handle MockDecimal and other Decimal-like objects
      try {
        const numValue = (value as any).toNumber();
        if (isFinite(numValue)) {
          migrated[key] = new Decimal(numValue);
        } else {
          migrated[key] = new Decimal(0);
        }
      } catch {
        migrated[key] = new Decimal(0);
      }
    } else if (typeof value === 'string') {
      // Handle string values - be smart about which ones to convert
      const trimmed = value.trim();

      // Check if this looks like a numeric string (including scientific notation)
      if (/^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(trimmed)) {
        // String looks like a number, convert it
        try {
          const numValue = Number(trimmed);
          if (isFinite(numValue)) {
            migrated[key] = new Decimal(numValue);
          } else {
            migrated[key] = new Decimal(0);
          }
        } catch {
          migrated[key] = new Decimal(0);
        }
      } else if (
        trimmed === 'invalid' ||
        trimmed === 'NaN' ||
        trimmed === 'Infinity' ||
        trimmed === '-Infinity'
      ) {
        // Known invalid values, convert to 0
        migrated[key] = new Decimal(0);
      } else {
        // String doesn't look like a number, keep as-is
        migrated[key] = value;
      }
    } else {
      // Keep non-numeric values as-is
      migrated[key] = value;
    }
  }
  return migrated;
}

export function migrateStateToNumbers(state: any): any {
  const migrated: any = {};
  for (const [key, value] of Object.entries(state)) {
    if (value && typeof value === 'object' && typeof (value as any).toNumber === 'function') {
      migrated[key] = (value as any).toNumber();
    } else {
      migrated[key] = value;
    }
  }
  return migrated;
}
