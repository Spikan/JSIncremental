// Tests for state mutations with Decimal support
// Updated to use our mock Decimal constructor for consistent testing

import { describe, it, expect } from 'vitest';
import { Decimal } from './test-utils';
import {
  addSips,
  subtractSips,
  incrementCount,
  multiplyValue,
  isGreaterOrEqual,
  isGreater,
  isLessOrEqual,
  isLess,
  areEqual,
  max,
  min,
} from '../ts/core/state/mutations';

// Use our mock Decimal constructor for consistent testing
const LargeNumber = Decimal; // Alias for backward compatibility

describe('State Mutations with LargeNumber', () => {
  describe('Basic Arithmetic Operations', () => {
    it('should add sips with LargeNumber inputs', () => {
      const result = addSips(new LargeNumber(100), new LargeNumber(50));
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(150);
    });

    it('should add sips with mixed inputs', () => {
      const result = addSips(100, new LargeNumber(75));
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(175);
    });

    it('should subtract sips with LargeNumber inputs', () => {
      const result = subtractSips(new LargeNumber(100), new LargeNumber(30));
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(70);
    });

    it('should increment count with LargeNumber', () => {
      const result = incrementCount(new LargeNumber(10), 5);
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(15);
    });

    it('should multiply values with LargeNumber', () => {
      const result = multiplyValue(new LargeNumber(10), new LargeNumber(3));
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(30);
    });
  });

  describe('Comparison Operations', () => {
    it('should compare values with isGreaterOrEqual', () => {
      expect(isGreaterOrEqual(new LargeNumber(10), new LargeNumber(5))).toBe(true);
      expect(isGreaterOrEqual(new LargeNumber(5), new LargeNumber(10))).toBe(false);
      expect(isGreaterOrEqual(new LargeNumber(10), new LargeNumber(10))).toBe(true);
    });

    it('should compare values with isGreater', () => {
      expect(isGreater(new LargeNumber(10), new LargeNumber(5))).toBe(true);
      expect(isGreater(new LargeNumber(5), new LargeNumber(10))).toBe(false);
      expect(isGreater(new LargeNumber(10), new LargeNumber(10))).toBe(false);
    });

    it('should compare values with isLessOrEqual', () => {
      expect(isLessOrEqual(new LargeNumber(5), new LargeNumber(10))).toBe(true);
      expect(isLessOrEqual(new LargeNumber(10), new LargeNumber(5))).toBe(false);
      expect(isLessOrEqual(new LargeNumber(10), new LargeNumber(10))).toBe(true);
    });

    it('should compare values with isLess', () => {
      expect(isLess(new LargeNumber(5), new LargeNumber(10))).toBe(true);
      expect(isLess(new LargeNumber(10), new LargeNumber(5))).toBe(false);
      expect(isLess(new LargeNumber(10), new LargeNumber(10))).toBe(false);
    });

    it('should check equality with areEqual', () => {
      expect(areEqual(new LargeNumber(10), new LargeNumber(10))).toBe(true);
      expect(areEqual(new LargeNumber(10), new LargeNumber(5))).toBe(false);
    });
  });

  describe('Min/Max Operations', () => {
    it('should find maximum of two values', () => {
      const result = max(new LargeNumber(10), new LargeNumber(20));
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(20);
    });

    it('should find minimum of two values', () => {
      const result = min(new LargeNumber(10), new LargeNumber(20));
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(10);
    });

    it('should handle equal values in min/max', () => {
      const maxResult = max(new LargeNumber(15), new LargeNumber(15));
      const minResult = min(new LargeNumber(15), new LargeNumber(15));

      expect(maxResult.toNumber()).toBe(15);
      expect(minResult.toNumber()).toBe(15);
    });
  });

  describe('Very Large Numbers', () => {
    it('should handle very large numbers in arithmetic', () => {
      const large1 = new LargeNumber('1e100');
      const large2 = new LargeNumber('5e99');

      const sum = addSips(large1, large2);
      expect(sum).toBeInstanceOf(LargeNumber);
      expect(sum.toNumber()).toBeGreaterThan(1e100);
    });

    it('should handle very large numbers in comparisons', () => {
      const huge = new LargeNumber('1e1000');
      const big = new LargeNumber('1e100');

      expect(isGreater(huge, big)).toBe(true);
      expect(isLess(big, huge)).toBe(true);
    });

    it('should handle very large numbers in min/max', () => {
      const huge = new LargeNumber('1e50');
      const enormous = new LargeNumber('1e100');

      const maxResult = max(huge, enormous);
      const minResult = min(huge, enormous);

      expect(maxResult.toNumber()).toBeGreaterThan(1e50);
      expect(minResult.toNumber()).toBe(1e50);
    });
  });

  describe('Mixed Type Support', () => {
    it('should work with number inputs', () => {
      const result = addSips(100, 50);
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(150);
    });

    it('should work with string inputs', () => {
      const result = multiplyValue('10', '5');
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(50);
    });

    it('should work with mixed LargeNumber and primitive inputs', () => {
      const result1 = addSips(new LargeNumber(100), 50);
      const result2 = multiplyValue('10', new LargeNumber(5));

      expect(result1.toNumber()).toBe(150);
      expect(result2.toNumber()).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const result1 = addSips(new LargeNumber(0), new LargeNumber(0));
      const result2 = multiplyValue(new LargeNumber(0), new LargeNumber(100));

      expect(result1.toNumber()).toBe(0);
      expect(result2.toNumber()).toBe(0);
    });

    it('should handle negative values', () => {
      const result = subtractSips(new LargeNumber(10), new LargeNumber(20));
      expect(result.toNumber()).toBe(-10);
    });

    it('should handle very small numbers', () => {
      const small = new LargeNumber('1e-100');
      const result = addSips(small, small);

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBe(2e-100);
    });
  });

  describe('Performance with Large Numbers', () => {
    it('should perform operations efficiently', () => {
      const startTime = performance.now();

      // Perform multiple operations with large numbers
      for (let i = 0; i < 1000; i++) {
        const large1 = new LargeNumber(`1e${i % 100}`);
        const large2 = new LargeNumber(`5e${i % 50}`);

        addSips(large1, large2);
        isGreaterOrEqual(large1, large2);
        max(large1, large2);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second for 3000 operations)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle repeated operations without errors', () => {
      let result = new LargeNumber(1);

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        result = addSips(result, new LargeNumber('1e10'));
      }

      // Should still be a valid LargeNumber with reasonable magnitude
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1e11);
      expect(result.toNumber()).toBeLessThan(1e13);
    });
  });
});
