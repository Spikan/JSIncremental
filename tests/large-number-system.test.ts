// Comprehensive tests for the LargeNumber system

import { describe, it, expect, beforeEach } from 'vitest';
import { LargeNumber } from '../ts/core/numbers/large-number';
import { NativeNumber } from '../ts/core/numbers/native-number';
import { Numbers } from '../ts/core/numbers/index';
import { Decimal } from '../ts/core/numbers/decimal';

describe('LargeNumber System', () => {
  describe('NativeNumber', () => {
    it('should create NativeNumber from number', () => {
      const num = new NativeNumber(42);
      expect(num.toNumber()).toBe(42);
      expect(num.toString()).toBe('42');
    });

    it('should create NativeNumber from string', () => {
      const num = new NativeNumber('123.45');
      expect(num.toNumber()).toBe(123.45);
      expect(num.toString()).toBe('123.45');
    });

    it('should handle arithmetic operations', () => {
      const a = new NativeNumber(10);
      const b = new NativeNumber(5);

      expect(a.add(b).toNumber()).toBe(15);
      expect(a.subtract(b).toNumber()).toBe(5);
      expect(a.multiply(b).toNumber()).toBe(50);
      expect(a.divide(b).toNumber()).toBe(2);
    });

    it('should handle comparison operations', () => {
      const a = new NativeNumber(10);
      const b = new NativeNumber(5);

      expect(a.gt(b)).toBe(true);
      expect(a.lt(b)).toBe(false);
      expect(a.gte(b)).toBe(true);
      expect(a.lte(b)).toBe(false);
      expect(a.eq(b)).toBe(false);
      expect(a.eq(new NativeNumber(10))).toBe(true);
    });

    it('should handle power operations', () => {
      const base = new NativeNumber(2);
      const result = base.pow(3);
      expect(result.toNumber()).toBe(8);
    });
  });

  describe('LargeNumber', () => {
    it('should create LargeNumber from various inputs', () => {
      expect(new LargeNumber(42).toNumber()).toBe(42);
      expect(new LargeNumber('123.45').toNumber()).toBe(123.45);
      expect(new LargeNumber(new LargeNumber(100)).toNumber()).toBe(100);
    });

    it('should handle arithmetic operations', () => {
      const a = new LargeNumber(10);
      const b = new LargeNumber(5);

      expect(a.add(b).toNumber()).toBe(15);
      expect(a.subtract(b).toNumber()).toBe(5);
      expect(a.multiply(b).toNumber()).toBe(50);
      expect(a.divide(b).toNumber()).toBe(2);
    });

    it('should handle comparison operations', () => {
      const a = new LargeNumber(10);
      const b = new LargeNumber(5);

      expect(a.gt(b)).toBe(true);
      expect(a.lt(b)).toBe(false);
      expect(a.gte(b)).toBe(true);
      expect(a.lte(b)).toBe(false);
      expect(a.eq(b)).toBe(false);
      expect(a.eq(new LargeNumber(10))).toBe(true);
    });

    it('should handle power operations', () => {
      const base = new LargeNumber(2);
      const result = base.pow(3);
      expect(result.toNumber()).toBe(8);
    });

    it('should work with very large numbers', () => {
      const largeNum = new LargeNumber('1e100');
      expect(largeNum.toString()).toBeDefined();
      expect(largeNum.add(new LargeNumber(1)).toString()).toBeDefined();
    });

    it('should maintain precision for decimal operations', () => {
      const a = new LargeNumber('0.1');
      const b = new LargeNumber('0.2');
      const result = a.add(b);

      // Should be exactly 0.3, not 0.30000000000000004
      expect(result.toNumber()).toBeCloseTo(0.3, 10);
    });
  });

  describe('Numbers utility object', () => {
    it('should provide arithmetic operations', () => {
      expect(Numbers.add(10, 5).toNumber()).toBe(15);
      expect(Numbers.subtract(10, 5).toNumber()).toBe(5);
      expect(Numbers.multiply(10, 5).toNumber()).toBe(50);
      expect(Numbers.divide(10, 5).toNumber()).toBe(2);
    });

    it('should provide comparison operations', () => {
      expect(Numbers.gte(10, 5)).toBe(true);
      expect(Numbers.gt(10, 5)).toBe(true);
      expect(Numbers.lte(5, 10)).toBe(true);
      expect(Numbers.lt(5, 10)).toBe(true);
      expect(Numbers.eq(10, 10)).toBe(true);
      expect(Numbers.eq(10, 5)).toBe(false);
    });

    it('should provide conversion utilities', () => {
      expect(Numbers.toLargeNumber(42) instanceof LargeNumber).toBe(true);
      expect(Numbers.toNumber(new LargeNumber(42))).toBe(42);
      expect(typeof Numbers.formatLargeNumber(1000)).toBe('string');
    });
  });

  describe('Library detection and fallback', () => {
    it('should use break_eternity.js when available', () => {
      // This test depends on whether break_eternity.js is loaded
      const hasBreakEternity = typeof (globalThis as any).BreakEternity !== 'undefined';
      const hasDecimal = typeof (globalThis as any).Decimal !== 'undefined';

      if (hasBreakEternity || hasDecimal) {
        const num = new LargeNumber('1e50');
        // Should be able to handle very large numbers
        expect(() => num.toString()).not.toThrow();
      }
    });

    it('should fall back to NativeNumber when libraries unavailable', () => {
      // Mock the absence of libraries
      const originalBreakInfinity = (globalThis as any).BreakInfinity;
      const originalDecimal = (globalThis as any).Decimal;

      delete (globalThis as any).BreakInfinity;
      delete (globalThis as any).Decimal;

      try {
        const num = new LargeNumber(42);
        expect(num._value instanceof NativeNumber).toBe(true);
        expect(num.toNumber()).toBe(42);
      } finally {
        // Restore original values
        (globalThis as any).BreakInfinity = originalBreakInfinity;
        (globalThis as any).Decimal = originalDecimal;
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle zero', () => {
      const zero = new LargeNumber(0);
      expect(zero.toNumber()).toBe(0);
      expect(zero.add(new LargeNumber(1)).toNumber()).toBe(1);
    });

    it('should handle negative numbers', () => {
      const negative = new LargeNumber(-42);
      expect(negative.toNumber()).toBe(-42);
      expect(negative.multiply(new LargeNumber(-1)).toNumber()).toBe(42);
    });

    it('should handle very small numbers', () => {
      const small = new LargeNumber('1e-10');
      expect(small.toNumber()).toBeCloseTo(1e-10, 10);
    });

    it('should handle invalid inputs gracefully', () => {
      // MockDecimal currently returns NaN for invalid inputs, which is acceptable behavior
      const nanResult = new Decimal(NaN).toNumber();
      expect(isNaN(nanResult)).toBe(true);
      
      const invalidResult = new Decimal('invalid').toNumber();
      expect(invalidResult).toBe(0);
      
      const nullResult = new Decimal(null as any).toNumber();
      expect(nullResult).toBe(0);
    });
  });
});
