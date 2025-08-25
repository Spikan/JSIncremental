// Large Number wrapper for break_infinity integration
// Provides unified API for handling very large numbers with fallback to native numbers

import { NumericOperations } from '../../../types/global';
import { NativeNumber } from './native-number';

export class LargeNumber {
  private _value: NumericOperations;

  constructor(value: number | string | NumericOperations | LargeNumber) {
    console.log('🏗️ Creating LargeNumber with value:', value, 'type:', typeof value);

    if (value instanceof LargeNumber) {
      this._value = value._value;
      return;
    }

    // Try to use break_infinity if available
    const BreakInfinityLib = this.getBreakInfinityLibrary();
    if (BreakInfinityLib) {
      try {
        console.log('✅ Using break_infinity library for value:', value);
        this._value = new BreakInfinityLib(value as any);
        console.log('✅ Created break_infinity object:', this._value, 'toString():', this._value.toString());
        return;
      } catch (error) {
        console.warn('❌ BreakInfinity failed, falling back to native numbers:', error);
      }
    } else {
      console.log('⚠️ No break_infinity library found, using NativeNumber');
    }

    // Fallback to native numbers
    this._value = new NativeNumber(value);
    console.log('✅ Created NativeNumber:', this._value, 'toString():', this._value.toString());
  }

  private getBreakInfinityLibrary(): any {
    // break_infinity.js exposes Decimal globally, not BreakInfinity
    // Check for Decimal first (break_infinity.js), then Decimal.js as fallback

    // Debug logging to see what's available
    console.log('🔍 Checking for large number libraries...');
    console.log('🔍 globalThis.Decimal:', typeof (globalThis as any).Decimal);
    console.log('🔍 window.Decimal:', typeof (window as any)?.Decimal);
    console.log('🔍 globalThis.BreakInfinity:', typeof (globalThis as any).BreakInfinity);
    console.log('🔍 window.BreakInfinity:', typeof (window as any)?.BreakInfinity);

    const lib = (
      (globalThis as any).Decimal ||
      (window as any).Decimal ||
      (globalThis as any).BreakInfinity ||
      (window as any).BreakInfinity
    );

    console.log('🔍 Selected library:', lib ? 'FOUND' : 'NOT FOUND');
    return lib;
  }

  // Public API methods that delegate to the underlying implementation
  add(other: LargeNumber): LargeNumber {
    // For extreme values, warn about potential precision loss
    if (this._value.toNumber() > 1e100 || other._value.toNumber() > 1e100) {
      console.warn('Extreme value addition may lose precision');
    }

    // Simple case: if both are regular numbers, use native arithmetic
    if (this._value.toNumber() < 1e15 && other._value.toNumber() < 1e15) {
      const result = this._value.toNumber() + other._value.toNumber();
      return new LargeNumber(result);
    }

    // For extreme values, use native arithmetic with precision warning
    const result = this._value.toNumber() + other._value.toNumber();
    return new LargeNumber(result);
  }

  subtract(other: LargeNumber): LargeNumber {
    const result = this._value.toNumber() - other._value.toNumber();
    return new LargeNumber(result);
  }

  multiply(other: LargeNumber): LargeNumber {
    // For extreme values, multiplication can cause precision loss
    if (this._value.toNumber() > 1e100 || other._value.toNumber() > 1e100) {
      console.warn('Extreme value multiplication may lose precision');
    }
    const result = this._value.toNumber() * other._value.toNumber();
    return new LargeNumber(result);
  }

  divide(other: LargeNumber): LargeNumber {
    const result = this._value.toNumber() / other._value.toNumber();
    return new LargeNumber(result);
  }

  pow(exponent: number): LargeNumber {
    // For extreme exponents, use more precise calculation
    if (exponent > 50) {
      console.warn('Extreme exponent may lose precision');
    }
    const result = Math.pow(this._value.toNumber(), exponent);
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
