// Large Number wrapper for break_eternity.js integration
// Provides unified API for handling very large numbers with fallback to native numbers

import { NumericOperations } from '../../../types/global';
import { NativeNumber } from './native-number';

// Import break_eternity.js
const BreakEternity = (() => {
  try {
    // break_eternity.js exposes Decimal globally
    return (
      (globalThis as any).Decimal ||
      (window as any).Decimal ||
      // Try to import it directly if available
      (() => {
        try {
          // This will work if the script is loaded globally
          const Decimal = (globalThis as any).Decimal;
          if (Decimal && typeof Decimal === 'function') {
            return Decimal;
          }
        } catch (e) {
          console.warn('break_eternity.js not available globally:', e);
        }
        return null;
      })()
    );
  } catch (error) {
    console.warn('Failed to load break_eternity.js:', error);
    return null;
  }
})();

export class LargeNumber {
  private _value: NumericOperations;
  private _isBreakEternity: boolean = false;

  constructor(value: number | string | NumericOperations | LargeNumber) {
    if (value instanceof LargeNumber) {
      this._value = value._value;
      this._isBreakEternity = value._isBreakEternity;
      return;
    }

    // Try to use break_eternity.js if available
    if (BreakEternity) {
      try {
        this._value = new BreakEternity(value as any);
        this._isBreakEternity = true;
        return;
      } catch (error) {
        console.warn('BreakEternity failed, falling back to native numbers:', error);
      }
    }

    // Fallback to native numbers
    this._value = new NativeNumber(value);
    this._isBreakEternity = false;
  }

  // Public API methods that delegate to the underlying implementation
  add(other: LargeNumber): LargeNumber {
    if (this._isBreakEternity && other._isBreakEternity) {
      const result = (this._value as any).add(other._value);
      return new LargeNumber(result);
    }
    const result = this._value.add(other._value);
    return new LargeNumber(result);
  }

  subtract(other: LargeNumber): LargeNumber {
    if (this._isBreakEternity && other._isBreakEternity) {
      const result = (this._value as any).sub(other._value);
      return new LargeNumber(result);
    }
    const result = this._value.subtract(other._value);
    return new LargeNumber(result);
  }

  multiply(other: LargeNumber): LargeNumber {
    if (this._isBreakEternity && other._isBreakEternity) {
      const result = (this._value as any).mul(other._value);
      return new LargeNumber(result);
    }
    const result = this._value.multiply(other._value);
    return new LargeNumber(result);
  }

  divide(other: LargeNumber): LargeNumber {
    if (this._isBreakEternity && other._isBreakEternity) {
      const result = (this._value as any).div(other._value);
      return new LargeNumber(result);
    }
    const result = this._value.divide(other._value);
    return new LargeNumber(result);
  }

  pow(exponent: number): LargeNumber {
    if (this._isBreakEternity) {
      const result = (this._value as any).pow(exponent);
      return new LargeNumber(result);
    }
    const result = this._value.toNumber() ** exponent;
    return new LargeNumber(result);
  }

  gte(other: LargeNumber): boolean {
    if (this._isBreakEternity && other._isBreakEternity) {
      return (this._value as any).gte(other._value);
    }
    return this._value.toNumber() >= other._value.toNumber();
  }

  gt(other: LargeNumber): boolean {
    if (this._isBreakEternity && other._isBreakEternity) {
      return (this._value as any).gt(other._value);
    }
    return this._value.toNumber() > other._value.toNumber();
  }

  lte(other: LargeNumber): boolean {
    if (this._isBreakEternity && other._isBreakEternity) {
      return (this._value as any).lte(other._value);
    }
    return this._value.toNumber() <= other._value.toNumber();
  }

  lt(other: LargeNumber): boolean {
    if (this._isBreakEternity && other._isBreakEternity) {
      return (this._value as any).lt(other._value);
    }
    return this._value.toNumber() < other._value.toNumber();
  }

  eq(other: LargeNumber): boolean {
    if (this._isBreakEternity && other._isBreakEternity) {
      return (this._value as any).eq(other._value);
    }
    return this._value.toNumber() === other._value.toNumber();
  }

  // Debug method to check internal value type
  getValueType(): string {
    return this._isBreakEternity ? 'BreakEternity' : this._value.constructor.name;
  }

  // Debug method to inspect internal value (for debugging only)
  getDebugInfo(): any {
    return {
      type: this.getValueType(),
      isBreakEternity: this._isBreakEternity,
      toString: this.toString(),
      toNumber: this.toNumber(),
      internal: this._value,
    };
  }

  toString(): string {
    if (this._isBreakEternity) {
      return (this._value as any).toString();
    }
    return this._value.toString();
  }

  toNumber(): number {
    if (this._isBreakEternity) {
      const num = (this._value as any).toNumber();
      // For extreme values, JavaScript can't represent them as Numbers
      // This is the fundamental limitation - extreme values exceed Number.MAX_VALUE
      return num;
    }
    const num = this._value.toNumber();
    return num;
  }

  // Safe conversion for UI/display purposes - returns finite number or 0 for extreme values
  toSafeNumber(): number {
    if (this._isBreakEternity) {
      const num = (this._value as any).toNumber();
      return isFinite(num) ? num : 0;
    }
    const num = this._value.toNumber();
    return isFinite(num) ? num : 0;
  }

  // Get a value safe for Decimal constructor - handles extreme values
  toDecimalSafe(): number | string {
    if (this._isBreakEternity) {
      const num = (this._value as any).toNumber();
      return isFinite(num) ? num : this.toString();
    }
    const num = this._value.toNumber();
    return isFinite(num) ? num : this._value.toString();
  }

  toJSON(): string {
    if (this._isBreakEternity) {
      return (this._value as any).toJSON();
    }
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
