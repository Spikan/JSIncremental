// Native JavaScript number implementation for LargeNumber fallback
// This provides a consistent interface when break_eternity.js is not available

import { NumericOperations } from '../../../types/global';

export class NativeNumber implements NumericOperations {
  private _value: number;

  constructor(value: number | string | NumericOperations) {
    if (value !== null && typeof value === 'object' && 'toNumber' in value) {
      this._value = value.toNumber();
    } else {
      this._value = Number(value) || 0;
    }
  }

  add(other: NumericOperations): NativeNumber {
    return new NativeNumber(this._value + other.toNumber());
  }

  subtract(other: NumericOperations): NativeNumber {
    return new NativeNumber(this._value - other.toNumber());
  }

  multiply(other: NumericOperations): NativeNumber {
    return new NativeNumber(this._value * other.toNumber());
  }

  divide(other: NumericOperations): NativeNumber {
    return new NativeNumber(this._value / other.toNumber());
  }

  pow(exponent: number): NativeNumber {
    return new NativeNumber(Math.pow(this._value, exponent));
  }

  cmp(other: NumericOperations): -1 | 0 | 1 {
    const diff = this._value - other.toNumber();
    if (diff < 0) return -1;
    if (diff > 0) return 1;
    return 0;
  }

  eq(other: NumericOperations): boolean {
    return this._value === other.toNumber();
  }

  gt(other: NumericOperations): boolean {
    return this._value > other.toNumber();
  }

  gte(other: NumericOperations): boolean {
    return this._value >= other.toNumber();
  }

  lt(other: NumericOperations): boolean {
    return this._value < other.toNumber();
  }

  lte(other: NumericOperations): boolean {
    return this._value <= other.toNumber();
  }

  toNumber(): number {
    return this._value;
  }

  toString(): string {
    return String(this._value);
  }

  toJSON(): string {
    return this.toString();
  }
}
