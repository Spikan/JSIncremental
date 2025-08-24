// Global type definitions for large number libraries

// BreakInfinity.js interface (from break_infinity.js library)
interface BreakInfinityStatic {
  new (value: number | string | BreakInfinity): BreakInfinity;
  (value: number | string | BreakInfinity): BreakInfinity;
}

interface BreakInfinity {
  // Arithmetic operations
  add(other: number | string | BreakInfinity): BreakInfinity;
  sub(other: number | string | BreakInfinity): BreakInfinity;
  mul(other: number | string | BreakInfinity): BreakInfinity;
  div(other: number | string | BreakInfinity): BreakInfinity;
  pow(exponent: number): BreakInfinity;

  // Comparison operations
  cmp(other: number | string | BreakInfinity): -1 | 0 | 1;
  eq(other: number | string | BreakInfinity): boolean;
  gt(other: number | string | BreakInfinity): boolean;
  gte(other: number | string | BreakInfinity): boolean;
  lt(other: number | string | BreakInfinity): boolean;
  lte(other: number | string | BreakInfinity): boolean;

  // Conversion operations
  toNumber(): number;
  toString(): string;
  toJSON(): string;

  // Properties
  readonly sign: number;
  readonly layer: number;
  readonly mag: number;

  // Static methods
  max(...values: (number | string | BreakInfinity)[]): BreakInfinity;
  min(...values: (number | string | BreakInfinity)[]): BreakInfinity;
}

// Decimal.js interface (for fallback compatibility)
interface DecimalStatic {
  new (value: number | string | Decimal): Decimal;
  (value: number | string | Decimal): Decimal;
}

interface Decimal {
  // Arithmetic operations
  plus(other: number | string | Decimal): Decimal;
  minus(other: number | string | Decimal): Decimal;
  times(other: number | string | Decimal): Decimal;
  dividedBy(other: number | string | Decimal): Decimal;
  toPower(exponent: number): Decimal;

  // Comparison operations
  comparedTo(other: number | string | Decimal): -1 | 0 | 1;
  equals(other: number | string | Decimal): boolean;
  greaterThan(other: number | string | Decimal): boolean;
  greaterThanOrEqualTo(other: number | string | Decimal): boolean;
  lessThan(other: number | string | Decimal): boolean;
  lessThanOrEqualTo(other: number | string | Decimal): boolean;

  // Conversion operations
  toNumber(): number;
  toString(): string;
  toJSON(): string;

  // Properties
  readonly s: number; // sign
  readonly e: number; // exponent
  readonly d: number[]; // digits array

  // Static methods
  max(...values: (number | string | Decimal)[]): Decimal;
  min(...values: (number | string | Decimal)[]): Decimal;
}

// Unified interface for our LargeNumber operations
export interface NumericOperations {
  add(other: NumericOperations): NumericOperations;
  subtract(other: NumericOperations): NumericOperations;
  multiply(other: NumericOperations): NumericOperations;
  divide(other: NumericOperations): NumericOperations;
  pow(exponent: number): NumericOperations;
  cmp(other: NumericOperations): -1 | 0 | 1;
  eq(other: NumericOperations): boolean;
  gt(other: NumericOperations): boolean;
  gte(other: NumericOperations): boolean;
  lt(other: NumericOperations): boolean;
  lte(other: NumericOperations): boolean;
  toNumber(): number;
  toString(): string;
  toJSON(): string;
}

// Extend Window interface to include our libraries
declare global {
  var BreakInfinity: BreakInfinityStatic;
  var Decimal: DecimalStatic;

  // Make them available on window too
  interface Window {
    BreakInfinity: BreakInfinityStatic;
    Decimal: DecimalStatic;
  }
}