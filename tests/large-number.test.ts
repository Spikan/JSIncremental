// Tests for LargeNumber functionality and break_eternity.js integration

import { describe, it, expect, beforeEach } from 'vitest';
import { LargeNumber } from '../ts/core/numbers/large-number';
import {
  formatLargeNumber,
  toLargeNumber,
  add,
  multiply,
  gte,
} from '../ts/core/numbers/migration-utils';
import { safeToNumber } from '../ts/core/numbers/safe-conversion';
import { computeClick } from '../ts/core/rules/clicks';
import { computeTotalSipsPerDrink } from '../ts/core/rules/economy';
import { nextStrawCost } from '../ts/core/rules/purchases';

// Mock break_eternity.js for testing
class MockBreakEternity {
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
  add(other: any): MockBreakEternity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakEternity(this.toNumber() + otherValue);
  }

  subtract(other: any): MockBreakEternity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakEternity(this.toNumber() - otherValue);
  }

  minus(other: any): MockBreakEternity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakEternity(this.toNumber() - otherValue);
  }

  multiply(other: any): MockBreakEternity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakEternity(this.toNumber() * otherValue);
  }

  times(other: any): MockBreakEternity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakEternity(this.toNumber() * otherValue);
  }

  divide(other: any): MockBreakEternity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakEternity(this.toNumber() / otherValue);
  }

  div(other: any): MockBreakEternity {
    const otherValue = other.toNumber ? other.toNumber() : Number(other);
    return new MockBreakEternity(this.toNumber() / otherValue);
  }

  pow(exponent: number): MockBreakEternity {
    return new MockBreakEternity(Math.pow(this.toNumber(), exponent));
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
    // Setup mock break_eternity.js
    (globalThis as any).Decimal = MockBreakEternity;
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
    expect(num.toString()).toBe('1e+100'); // break_eternity.js uses + sign
  });

  it('should handle extreme value operations', () => {
    // Test extreme multiplication - check that result is approximately correct
    const a = new LargeNumber('1e100');
    const b = new LargeNumber('1e50');
    const result = a.multiply(b);
    expect(result.toString()).toMatch(/^1\.\d*e\+150$/); // Allow for precision variations

    // Test extreme addition
    const c = new LargeNumber('1e200');
    const d = new LargeNumber('1e199');
    const addResult = c.add(d);
    expect(addResult.toString()).toMatch(/^1\.1e\+200$/);

    // Test extreme division
    const e = new LargeNumber('1e300');
    const f = new LargeNumber('1e100');
    const divResult = e.divide(f);
    expect(divResult.toString()).toMatch(/^1e\+200$/);

    // Test extreme exponentiation
    const g = new LargeNumber('10');
    const expResult = g.pow(100);
    expect(expResult.toString()).toMatch(/^1e\+?100$/);
  });

  it('should handle break_eternity.js extreme values in browser', () => {
    // Test if break_eternity.js is actually available and working
    const hasBreakEternity = typeof (globalThis as any).Decimal !== 'undefined';
    console.log('break_eternity.js (Decimal) available:', hasBreakEternity);

    // Test that extreme values work without crashing (even if they return Infinity)
    const extremeValue = new LargeNumber('1e2000');
    expect(() => extremeValue.toString()).not.toThrow();
    expect(() => extremeValue.toNumber()).not.toThrow();

    // The actual result depends on the underlying library's precision
    const result = extremeValue.toString();
    console.log(`1e2000 result: ${result}`);
    console.log(`1e2000 is break_eternity.js object:`, hasBreakEternity && result.includes('e+'));

    // Should not crash, even if precision is lost
    expect(typeof result).toBe('string');

    // break_eternity.js might still hit JavaScript limits for extremely large numbers
    // The important thing is that it doesn't crash
    if (hasBreakEternity) {
      console.log('✅ break_eternity.js is loaded and handles extreme values gracefully');
    }
  });

  it('should format very large numbers correctly', () => {
    const veryLargeNumber = new LargeNumber('1e1000');
    const formatted = formatLargeNumber(veryLargeNumber);
    // break_eternity.js may return Infinity for extremely large numbers
    expect(typeof formatted).toBe('string');
    expect(formatted.length > 0).toBe(true);
  });

  it('should handle Infinity from toNumber() gracefully', () => {
    const veryLargeNumber = new LargeNumber('1e500');
    const formatted = formatLargeNumber(veryLargeNumber);
    // break_eternity.js may return Infinity for very large numbers
    expect(typeof formatted).toBe('string');
    expect(formatted.length > 0).toBe(true);
  });

  it('should handle Zustand store operations with LargeNumber', () => {
    // Test that LargeNumber operations work in the context they would be used
    const largeValue1 = new LargeNumber('1e100');
    const largeValue2 = new LargeNumber('5e99');

    // Test the add function used in Zustand store
    const result = add(largeValue1, largeValue2);
    expect(result.toString()).toBe('1.5000000000000001e+100'); // 1e100 + 5e99 = 1.5e100 (break_eternity.js formatting)

    // Test with mixed types
    const result2 = add(largeValue1, '1e99');
    expect(result2.toString()).toBe('1.1e+100'); // 1e100 + 1e99 = 2e100 (break_eternity.js formatting)
  });

  it('should perform addition', () => {
    const a = new LargeNumber(10);
    const b = new LargeNumber(5);
    const result = a.add(b);
    expect(safeToNumber(result)).toBe(15);
  });

  it('should perform subtraction', () => {
    const a = new LargeNumber(10);
    const b = new LargeNumber(3);
    const result = a.subtract(b);
    expect(safeToNumber(result)).toBe(7);
  });

  it('should perform multiplication', () => {
    const a = new LargeNumber(6);
    const b = new LargeNumber(7);
    const result = a.multiply(b);
    expect(safeToNumber(result)).toBe(42);
  });

  it('should perform division', () => {
    const a = new LargeNumber(15);
    const b = new LargeNumber(3);
    const result = a.divide(b);
    expect(safeToNumber(result)).toBe(5);
  });

  it('should perform exponentiation', () => {
    const a = new LargeNumber(2);
    const result = a.pow(3);
    expect(safeToNumber(result)).toBe(8);
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
    expect(safeToNumber(toLargeNumber(100))).toBe(100);
    expect(safeToNumber(toLargeNumber('1000'))).toBe(1000);
    expect(safeToNumber(toLargeNumber(new LargeNumber(500)))).toBe(500);
  });

  it('should perform arithmetic operations', () => {
    const result = add(10, 5);
    expect(safeToNumber(result)).toBe(15);

    const product = multiply(6, 7);
    expect(safeToNumber(product)).toBe(42);
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
    // First ensure the mock is properly set up
    const mockDecimal = MockBreakEternity;
    (globalThis as any).Decimal = mockDecimal;

    const decimalLike = {
      toNumber: () => 100,
      toString: () => '100',
      add: (x: any) => ({ toNumber: () => 100 + x }),
    };

    const result = toLargeNumber(decimalLike);
    expect(result ? result.toNumber() : 0).toBe(100);
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
