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
    // Try break_infinity first, then Decimal.js as fallback
    return (
      (globalThis as any).BreakInfinity ||
      (window as any).BreakInfinity ||
      (globalThis as any).Decimal ||
      (window as any).Decimal
    );
  }

  // Public API methods that delegate to the underlying implementation
  add(other: LargeNumber): LargeNumber {
    return new LargeNumber(this._value.add(other._value));
  }

  subtract(other: LargeNumber): LargeNumber {
    return new LargeNumber(this._value.subtract(other._value));
  }

  multiply(other: LargeNumber): LargeNumber {
    return new LargeNumber(this._value.multiply(other._value));
  }

  divide(other: LargeNumber): LargeNumber {
    return new LargeNumber(this._value.divide(other._value));
  }

  pow(exponent: number): LargeNumber {
    return new LargeNumber(this._value.pow(exponent));
  }

  gte(other: LargeNumber): boolean {
    return this._value.gte(other._value);
  }

  gt(other: LargeNumber): boolean {
    return this._value.gt(other._value);
  }

  lte(other: LargeNumber): boolean {
    return this._value.lte(other._value);
  }

  lt(other: LargeNumber): boolean {
    return this._value.lt(other._value);
  }

  eq(other: LargeNumber): boolean {
    return this._value.eq(other._value);
  }

  toString(): string {
    return this._value.toString();
  }

  toNumber(): number {
    return this._value.toNumber();
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
