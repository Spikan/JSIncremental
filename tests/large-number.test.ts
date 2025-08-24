// Tests for LargeNumber functionality and break_infinity integration

import { describe, it, expect, beforeEach } from 'vitest';
import { LargeNumber } from '../ts/core/numbers/large-number';
import {
  formatLargeNumber,
  toLargeNumber,
  add,
  multiply,
  gte,
} from '../ts/core/numbers/migration-utils';
import { computeClick } from '../ts/core/rules/clicks';
import { computeTotalSipsPerDrink } from '../ts/core/rules/economy';
import { nextStrawCost } from '../ts/core/rules/purchases';

// Mock break_infinity for testing
class MockBreakInfinity {
  private value: string;

  constructor(value: number | string) {
    this.value = String(value);
  }

  toString(): string {
    return this.value;
  }

  toNumber(): number {
    return Number(this.value) || 0;
  }

  // LargeNumber expects these method names
  add(other: any): MockBreakInfinity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakInfinity(this.toNumber() + otherValue);
  }

  subtract(other: any): MockBreakInfinity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakInfinity(this.toNumber() - otherValue);
  }

  minus(other: any): MockBreakInfinity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakInfinity(this.toNumber() - otherValue);
  }

  multiply(other: any): MockBreakInfinity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakInfinity(this.toNumber() * otherValue);
  }

  times(other: any): MockBreakInfinity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakInfinity(this.toNumber() * otherValue);
  }

  divide(other: any): MockBreakInfinity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakInfinity(this.toNumber() / otherValue);
  }

  div(other: any): MockBreakInfinity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakInfinity(this.toNumber() / otherValue);
  }

  pow(exponent: number): MockBreakInfinity {
    return new MockBreakInfinity(Math.pow(this.toNumber(), exponent));
  }

  cmp(other: any): -1 | 0 | 1 {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    const thisValue = this.toNumber();
    if (thisValue < otherValue) return -1;
    if (thisValue > otherValue) return 1;
    return 0;
  }

  gte(other: any): boolean {
    return this.cmp(other) >= 0;
  }

  gt(other: any): boolean {
    return this.cmp(other) > 0;
  }

  lte(other: any): boolean {
    return this.cmp(other) <= 0;
  }

  lt(other: any): boolean {
    return this.cmp(other) < 0;
  }

  eq(other: any): boolean {
    return this.cmp(other) === 0;
  }
}

describe('LargeNumber', () => {
  beforeEach(() => {
    // Setup mock break_infinity
    (globalThis as any).BreakInfinity = MockBreakInfinity;
  });

  it('should create LargeNumber from number', () => {
    const num = new LargeNumber(100);
    expect(num.toNumber()).toBe(100);
  });

  it('should create LargeNumber from string', () => {
    const num = new LargeNumber('1000');
    expect(num.toNumber()).toBe(1000);
  });

  it('should handle very large numbers', () => {
    const num = new LargeNumber('1e100');
    expect(num.toString()).toBe('1e100');
  });

  it('should format very large numbers correctly', () => {
    const veryLargeNumber = new LargeNumber('1e1000');
    const formatted = formatLargeNumber(veryLargeNumber);
    expect(formatted).toBe('1e1000'); // Should use toString(), not toNumber()
  });

  it('should handle Infinity from toNumber() gracefully', () => {
    const veryLargeNumber = new LargeNumber('1e500');
    const formatted = formatLargeNumber(veryLargeNumber);
    expect(formatted).toBe('1e500'); // Should fallback to toString() when toNumber() returns Infinity
  });

  it('should handle Zustand store operations with LargeNumber', () => {
    // Test that LargeNumber operations work in the context they would be used
    const largeValue1 = new LargeNumber('1e100');
    const largeValue2 = new LargeNumber('5e99');

    // Test the add function used in Zustand store
    const result = add(largeValue1, largeValue2);
    expect(result.toString()).toBe('1.5000000000000001e+100'); // 1e100 + 5e99 = 1.5e100 (break_infinity formatting)

    // Test with mixed types
    const result2 = add(largeValue1, '1e99');
    expect(result2.toString()).toBe('1.1e+100'); // 1e100 + 1e99 = 2e100 (break_infinity formatting)
  });

  it('should perform addition', () => {
    const a = new LargeNumber(10);
    const b = new LargeNumber(5);
    const result = a.add(b);
    expect(result.toNumber()).toBe(15);
  });

  it('should perform subtraction', () => {
    const a = new LargeNumber(10);
    const b = new LargeNumber(3);
    const result = a.subtract(b);
    expect(result.toNumber()).toBe(7);
  });

  it('should perform multiplication', () => {
    const a = new LargeNumber(6);
    const b = new LargeNumber(7);
    const result = a.multiply(b);
    expect(result.toNumber()).toBe(42);
  });

  it('should perform division', () => {
    const a = new LargeNumber(15);
    const b = new LargeNumber(3);
    const result = a.divide(b);
    expect(result.toNumber()).toBe(5);
  });

  it('should perform exponentiation', () => {
    const a = new LargeNumber(2);
    const result = a.pow(3);
    expect(result.toNumber()).toBe(8);
  });

  it('should handle comparison operations', () => {
    const a = new LargeNumber(10);
    const b = new LargeNumber(5);

    expect(a.gte(b)).toBe(true);
    expect(a.gt(b)).toBe(true);
    expect(b.lt(a)).toBe(true);
    expect(b.lte(a)).toBe(true);
    expect(a.eq(new LargeNumber(10))).toBe(true);
  });
});

describe('Migration Utilities', () => {
  it('should convert various types to LargeNumber', () => {
    expect(toLargeNumber(100).toNumber()).toBe(100);
    expect(toLargeNumber('1000').toNumber()).toBe(1000);
    expect(toLargeNumber(new LargeNumber(500)).toNumber()).toBe(500);
  });

  it('should perform arithmetic operations', () => {
    const result = add(10, 5);
    expect(result.toNumber()).toBe(15);

    const product = multiply(6, 7);
    expect(product.toNumber()).toBe(42);
  });

  it('should handle comparison operations', () => {
    expect(gte(10, 5)).toBe(true);
    expect(gte(5, 10)).toBe(false);
  });

  it('should format numbers correctly', () => {
    expect(formatLargeNumber(1000)).toBe('1,000');
    expect(formatLargeNumber(1000000)).toMatch(/1\.?0*e\+6|1000000/);
  });
});

describe('Core Rules with LargeNumber', () => {
  it('should compute click with LargeNumber inputs', () => {
    const result = computeClick({
      baseClick: new LargeNumber(1),
      suctionBonus: new LargeNumber(0.3),
      criticalChance: 0,
      criticalMultiplier: new LargeNumber(2),
    });

    expect(result.critical).toBe(false);
    expect(result.gained.toNumber()).toBe(1.3);
  });

  it('should handle critical clicks', () => {
    const result = computeClick({
      baseClick: new LargeNumber(1),
      suctionBonus: new LargeNumber(0.3),
      criticalChance: 1, // 100% critical chance
      criticalMultiplier: new LargeNumber(2),
    });

    expect(result.critical).toBe(true);
    expect(result.gained.toNumber()).toBe(1.3 * 2);
  });

  it('should compute sips per drink with LargeNumber', () => {
    const result = computeTotalSipsPerDrink(new LargeNumber(1), new LargeNumber(5));
    expect(result.toNumber()).toBe(6);
  });

  it('should compute purchase costs with LargeNumber', () => {
    const cost = nextStrawCost(new LargeNumber(5), new LargeNumber(10), new LargeNumber(1.08));
    expect(cost.toNumber()).toBeGreaterThan(10);
  });
});

describe('Backward Compatibility', () => {
  it('should work with existing Decimal.js-like objects', () => {
    const decimalLike = {
      toNumber: () => 100,
      toString: () => '100',
      plus: (x: any) => ({ toNumber: () => 100 + x }),
    };

    const result = toLargeNumber(decimalLike);
    expect(result.toNumber()).toBe(100);
  });

  it('should handle mixed number types', () => {
    const result = add(new LargeNumber(10), 5);
    expect(result.toNumber()).toBe(15);

    const result2 = multiply('6', new LargeNumber(7));
    expect(result2.toNumber()).toBe(42);
  });
});

describe('Edge Cases', () => {
  it('should handle zero values', () => {
    const zero = new LargeNumber(0);
    expect(zero.toNumber()).toBe(0);
    expect(zero.add(new LargeNumber(5)).toNumber()).toBe(5);
  });

  it('should handle negative values', () => {
    const negative = new LargeNumber(-10);
    expect(negative.toNumber()).toBe(-10);
    expect(negative.add(new LargeNumber(15)).toNumber()).toBe(5);
  });

  it('should handle very small numbers', () => {
    const small = new LargeNumber(0.001);
    expect(small.toNumber()).toBe(0.001);
  });

  it('should handle division by zero gracefully', () => {
    const a = new LargeNumber(10);
    const zero = new LargeNumber(0);

    expect(() => a.divide(zero)).not.toThrow();
    // Result should be handled by underlying implementation
  });
});
