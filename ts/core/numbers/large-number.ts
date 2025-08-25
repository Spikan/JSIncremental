// Large Number wrapper for break_infinity integration
// Provides unified API for handling very large numbers with fallback to native numbers

import { NumericOperations } from '../../../types/global';
import { NativeNumber } from './native-number';

export class LargeNumber {
  private _value: NumericOperations;

  constructor(value: number | string | NumericOperations | LargeNumber) {
    if (value instanceof LargeNumber) {
      this._value = value._value;
      return;
    }

    // Try to use break_infinity if available
    const BreakInfinityLib = this.getBreakInfinityLibrary();
    if (BreakInfinityLib) {
      try {
        this._value = new BreakInfinityLib(value as any);
        return;
      } catch (error) {
        console.warn('BreakInfinity failed, falling back to native numbers:', error);
      }
    }

    // Fallback to native numbers
    this._value = new NativeNumber(value);
  }

  private getBreakInfinityLibrary(): any {
    // break_infinity.js exposes Decimal globally, not BreakInfinity
    // Check for Decimal first (break_infinity.js), then Decimal.js as fallback
    return (
      (globalThis as any).Decimal ||
      (window as any).Decimal ||
      (globalThis as any).BreakInfinity ||
      (window as any).BreakInfinity
    );
  }

  // Public API methods that delegate to the underlying implementation
  add(other: LargeNumber): LargeNumber {
    const result = this._value.add(other._value);
    return new LargeNumber(result);
  }

  subtract(other: LargeNumber): LargeNumber {
    const result = this._value.subtract(other._value);
    return new LargeNumber(result);
  }

  multiply(other: LargeNumber): LargeNumber {
    const result = this._value.multiply(other._value);
    return new LargeNumber(result);
  }

  divide(other: LargeNumber): LargeNumber {
    const result = this._value.divide(other._value);
    return new LargeNumber(result);
  }

  pow(exponent: number): LargeNumber {
    const result = this._value.toNumber() ** exponent;
    return new LargeNumber(result);
  }

  gte(other: LargeNumber): boolean {
    return this._value.toNumber() >= other._value.toNumber();
  }

  gt(other: LargeNumber): boolean {
    return this._value.toNumber() > other._value.toNumber();
  }

  lte(other: LargeNumber): boolean {
    return this._value.toNumber() <= other._value.toNumber();
  }

  lt(other: LargeNumber): boolean {
    return this._value.toNumber() < other._value.toNumber();
  }

  eq(other: LargeNumber): boolean {
    return this._value.toNumber() === other._value.toNumber();
  }

  // Debug method to check internal value type
  getValueType(): string {
    return this._value.constructor.name;
  }

  // Debug method to inspect internal value (for debugging only)
  getDebugInfo(): any {
    return {
      type: this._value.constructor.name,
      toString: this._value.toString(),
      toNumber: this._value.toNumber(),
      internal: this._value,
    };
  }

  toString(): string {
    return this._value.toString();
  }

  toNumber(): number {
    const num = this._value.toNumber();
    // For extreme values that exceed JavaScript's Number.MAX_VALUE,
    // return the mantissa to provide a reasonable approximation
    if (!isFinite(num) && this._value.toString().includes('e+')) {
      // Extract mantissa from scientific notation (e.g., "1.23e+400" -> 1.23)
      const str = this._value.toString();
      const mantissa = parseFloat(str.split('e')[0]);
      return isFinite(mantissa) ? mantissa : 1; // fallback to 1 if parsing fails
    }
    return num;
  }

  toJSON(): string {
    return this._value.toJSON();
  }

  // Static factory methods
  static from(value: number | string | LargeNumber): LargeNumber {
    return new LargeNumber(value);
  }

  static add(a: LargeNumber, b: LargeNumber): LargeNumber {
    return a.add(b);
  }

  static subtract(a: LargeNumber, b: LargeNumber): LargeNumber {
    return a.subtract(b);
  }

  static multiply(a: LargeNumber, b: LargeNumber): LargeNumber {
    return a.multiply(b);
  }

  static divide(a: LargeNumber, b: LargeNumber): LargeNumber {
    return a.divide(b);
  }

  static pow(base: LargeNumber, exponent: number): LargeNumber {
    return base.pow(exponent);
  }

  // Utility methods for migration
  static isLargeNumber(value: any): value is LargeNumber {
    return value instanceof LargeNumber;
  }

  static toLargeNumber(value: any): LargeNumber {
    if (this.isLargeNumber(value)) {
      return value;
    }
    return new LargeNumber(value);
  }
}

// Export for global use
if (typeof window !== 'undefined') {
  (window as any).LargeNumber = LargeNumber;
}
