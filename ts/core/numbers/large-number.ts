// Direct break_eternity.js integration
// This file provides direct access to break_eternity.js Decimal objects without wrapper

// Type for break_eternity.js Decimal
export type Decimal = any;

// Get break_eternity.js Decimal constructor
const getDecimalConstructor = (): any => {
  const Decimal = (globalThis as any).Decimal || (window as any).Decimal;
  if (!Decimal) {
    throw new Error(
      'break_eternity.js not loaded. Ensure break_eternity.min.js is included in index.html'
    );
  }
  return Decimal;
};

// Direct Decimal operations - no wrapper, maximum performance
export const DecimalOps = {
  // Create a new Decimal
  create: (value: number | string | Decimal): Decimal => {
    const Decimal = getDecimalConstructor();
    return new Decimal(value);
  },

  // Arithmetic operations
  add: (a: Decimal, b: Decimal): Decimal => a.add(b),
  subtract: (a: Decimal, b: Decimal): Decimal => a.sub(b),
  multiply: (a: Decimal, b: Decimal): Decimal => a.mul(b),
  divide: (a: Decimal, b: Decimal): Decimal => a.div(b),
  power: (base: Decimal, exponent: number): Decimal => base.pow(exponent),

  // Comparison operations
  greaterThanOrEqual: (a: Decimal, b: Decimal): boolean => a.gte(b),
  greaterThan: (a: Decimal, b: Decimal): boolean => a.gt(b),
  lessThanOrEqual: (a: Decimal, b: Decimal): boolean => a.lte(b),
  lessThan: (a: Decimal, b: Decimal): boolean => a.lt(b),
  equal: (a: Decimal, b: Decimal): boolean => a.eq(b),

  // Utility functions
  isFinite: (value: Decimal): boolean => value.isFinite(),
  isNaN: (value: Decimal): boolean => value.isNaN(),
  isNegative: (value: Decimal): boolean => value.isNegative(),
  isPositive: (value: Decimal): boolean => value.isPositive(),
  isZero: (value: Decimal): boolean => value.isZero(),

  // Conversion functions
  toString: (value: Decimal): string => value.toString(),
  toNumber: (value: Decimal): number => value.toNumber(),
  toExponential: (value: Decimal, precision?: number): string => value.toExponential(precision),

  // Safe number conversion for UI (handles extreme values)
  toSafeNumber: (value: Decimal): number => {
    if (!value.isFinite()) return 0;
    const num = value.toNumber();
    return isFinite(num) ? num : 0;
  },

  // Formatting for display
  format: (value: Decimal, options?: { precision?: number; scientific?: boolean }): string => {
    if (!value.isFinite()) {
      return value.isNaN() ? 'NaN' : value.isNegative() ? '-∞' : '∞';
    }

    const num = value.toNumber();
    if (isFinite(num)) {
      // For small numbers, use regular formatting
      if (Math.abs(num) < 1000000) {
        return num.toLocaleString(undefined, {
          maximumFractionDigits: options?.precision ?? 2,
        });
      }
    }

    // For large numbers, use scientific notation
    if (options?.scientific) {
      return value.toExponential(options.precision ?? 2);
    }

    // Let break_eternity handle the formatting for extreme values
    return value.toString();
  },

  // Constants
  get ZERO(): Decimal {
    return getDecimalConstructor().ZERO;
  },
  get ONE(): Decimal {
    return getDecimalConstructor().ONE;
  },
  get INFINITY(): Decimal {
    return getDecimalConstructor().INFINITY;
  },
  get NEGATIVE_INFINITY(): Decimal {
    return getDecimalConstructor().NEGATIVE_INFINITY;
  },

  // Check if value is a Decimal
  isDecimal: (value: any): value is Decimal => {
    return value && typeof value.add === 'function' && typeof value.toString === 'function';
  },
};

// Export the Decimal constructor for direct use
export const Decimal = getDecimalConstructor();

// Type guards and utilities
export const isDecimal = DecimalOps.isDecimal;

// Migration utilities for systematic replacement
export const MigrationUtils = {
  // Find all LargeNumber references in a string
  findLargeNumberReferences: (code: string): string[] => {
    const patterns = [
      /LargeNumber/g,
      /toLargeNumber/g,
      /new LargeNumber/g,
      /\.add\(new LargeNumber/g,
      /\.subtract\(new LargeNumber/g,
      /\.multiply\(new LargeNumber/g,
      /\.divide\(new LargeNumber/g,
      /LargeNumber\./g,
    ];

    const matches: string[] = [];
    patterns.forEach(pattern => {
      const found = code.match(pattern);
      if (found) matches.push(...found);
    });

    return [...new Set(matches)]; // Remove duplicates
  },

  // Replace common LargeNumber patterns
  migrateCode: (code: string): string => {
    return (
      code
        // Import changes
        .replace(
          /import \{ LargeNumber \} from ['"].*large-number['"]/g,
          "import { DecimalOps, Decimal } from './large-number'"
        )
        .replace(
          /import \{.*toLargeNumber.*\} from ['"].*migration-utils['"]/g,
          "import { toDecimal } from './migration-utils'"
        )

        // Type annotations
        .replace(/number \| LargeNumber/g, 'number | Decimal')
        .replace(/LargeNumber \| number/g, 'Decimal | number')
        .replace(/LargeNumber/g, 'Decimal')

        // Constructor calls
        .replace(/new LargeNumber\(([^)]+)\)/g, 'DecimalOps.create($1)')

        // Arithmetic operations
        .replace(
          /\.add\(new LargeNumber\(([^)]+)\)\)/g,
          (_match, arg) => `.add(DecimalOps.create(${arg}))`
        )
        .replace(
          /\.subtract\(new LargeNumber\(([^)]+)\)\)/g,
          (_match, arg) => `.subtract(DecimalOps.create(${arg}))`
        )
        .replace(
          /\.multiply\(new LargeNumber\(([^)]+)\)\)/g,
          (_match, arg) => `.multiply(DecimalOps.create(${arg}))`
        )
        .replace(
          /\.divide\(new LargeNumber\(([^)]+)\)\)/g,
          (_match, arg) => `.divide(DecimalOps.create(${arg}))`
        )

        // Comparison methods
        .replace(/\.gte\(/g, (_match, after) => `.gte(DecimalOps.create(${after.split(')')[0]}))`)
        .replace(/\.lte\(/g, (_match, after) => `.lte(DecimalOps.create(${after.split(')')[0]}))`)
        .replace(/\.gt\(/g, (_match, after) => `.gt(DecimalOps.create(${after.split(')')[0]}))`)
        .replace(/\.lt\(/g, (_match, after) => `.lt(DecimalOps.create(${after.split(')')[0]}))`)
        .replace(/\.eq\(/g, (_match, after) => `.eq(DecimalOps.create(${after.split(')')[0]}))`)

        // Conversion functions
        .replace(/toLargeNumber\(/g, 'toDecimal(')
        .replace(/\.toNumber\(\)/g, _match => 'DecimalOps.toSafeNumber(')

        // Static methods
        .replace(/LargeNumber\.from\(/g, 'DecimalOps.create(')
        .replace(/LargeNumber\.add\(/g, 'DecimalOps.add(')
        .replace(/LargeNumber\.subtract\(/g, 'DecimalOps.subtract(')
        .replace(/LargeNumber\.multiply\(/g, 'DecimalOps.multiply(')
        .replace(/LargeNumber\.divide\(/g, 'DecimalOps.divide(')
    );
  },
};

// Export for global use (backward compatibility during migration)
if (typeof window !== 'undefined') {
  (window as any).DecimalOps = DecimalOps;
  (window as any).Decimal = Decimal;
  (window as any).MigrationUtils = MigrationUtils;
}
