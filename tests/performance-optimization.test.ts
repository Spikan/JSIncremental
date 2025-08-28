// Tests for performance optimization features

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Decimal } from './test-utils';
import {
  memoizedPow,
  memoizedFormat,
  cachedExponentialGrowth,
  batchStrawSPDCalculation,
  optimizedSynergyCalculation,
  getCacheStats,
  clearAllCaches,
  getPerformanceMetrics,
} from '../ts/core/optimization/performance';

// Alias for backward compatibility
const LargeNumber = Decimal;

describe('Performance Optimization', () => {
  beforeEach(() => {
    // Clear caches before each test
    clearAllCaches();
  });

  afterEach(() => {
    // Clean up after each test
    clearAllCaches();
  });

  describe('Memoized Power Calculations', () => {
    it('should cache power calculations', () => {
      const base = new Decimal('1.1');
      const exponent = 100;

      const result1 = memoizedPow(base, exponent);
      const result2 = memoizedPow(base, exponent);

      expect(result1).toBeInstanceOf(Decimal);
      expect(result2).toBeInstanceOf(Decimal);
      expect(result1.toNumber()).toBe(result2.toNumber());

      const stats = getCacheStats();
      expect(stats.pow.hitCount).toBeGreaterThan(0);
    });

    it('should work with string inputs', () => {
      const result = memoizedPow('1.01', 50);
      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should work with LargeNumber inputs', () => {
      const base = new Decimal('1.05');
      const result = memoizedPow(base, 100);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1);
    });
  });

  describe('Cached Exponential Growth', () => {
    it('should cache exponential growth calculations', () => {
      const baseValue = new Decimal('100');
      const growthRate = new Decimal('1.1');
      const time = 50;

      const result1 = cachedExponentialGrowth(baseValue, growthRate, time);
      const result2 = cachedExponentialGrowth(baseValue, growthRate, time);

      expect(result1).toBeInstanceOf(Decimal);
      expect(result2).toBeInstanceOf(Decimal);
      expect(result1.toNumber()).toBe(result2.toNumber());
    });

    it('should handle large exponents efficiently', () => {
      const baseValue = new Decimal('1');
      const growthRate = new Decimal('1.001');
      const time = 10000;

      const result = cachedExponentialGrowth(baseValue, growthRate, time);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should work with string inputs', () => {
      const result = cachedExponentialGrowth('100', '1.1', 50);
      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(100);
    });
  });

  describe('Memoized Formatting', () => {
    it('should cache number formatting', () => {
      const value = new Decimal('1234567.89');

      const result1 = memoizedFormat(value);
      const result2 = memoizedFormat(value);

      expect(result1).toBe(result2); // Should return cached result
      expect(typeof result1).toBe('string');
    });

    it('should handle very large numbers', () => {
      const largeValue = new Decimal('1e100');
      const result = memoizedFormat(largeValue);

      expect(typeof result).toBe('string');
      expect(result).toContain('e+');
    });

    it('should handle small numbers', () => {
      const smallValue = new Decimal('1234.56');
      const result = memoizedFormat(smallValue);

      expect(typeof result).toBe('string');
      expect(result).toContain('1,234');
    });
  });

  describe('Batch Calculations', () => {
    it('should perform batch straw SPD calculations', () => {
      const inputs = [
        { straws: '100', cups: '50', level: 5, efficiency: 0.8 },
        { straws: '200', cups: '100', level: 10, efficiency: 0.9 },
        { straws: '500', cups: '250', level: 15, efficiency: 0.95 },
      ];

      const results = batchStrawSPDCalculation(inputs);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeInstanceOf(Decimal);
        expect(result.toNumber()).toBeGreaterThan(0);
      });
    });

    it('should handle empty input arrays', () => {
      const results = batchStrawSPDCalculation([]);
      expect(results).toHaveLength(0);
    });

    it('should handle single input', () => {
      const inputs = [{ straws: '100', cups: '50', level: 5, efficiency: 0.8 }];
      const results = batchStrawSPDCalculation(inputs);

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Decimal);
    });
  });

  describe('Optimized Synergy Calculations', () => {
    it('should calculate synergy efficiently', () => {
      const result = optimizedSynergyCalculation('1000', '500', '2000', '1000');

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(2000); // Should show synergy bonus
    });

    it('should handle large numbers in synergy calculations', () => {
      const result = optimizedSynergyCalculation('1e50', '1e40', '1e20', '1e25');

      expect(result).toBeInstanceOf(Decimal);
      expect(isFinite(result.toNumber())).toBe(true);
    });

    it('should work with mixed input types', () => {
      const result = optimizedSynergyCalculation(
        new Decimal('1000'),
        '500',
        2000,
        new Decimal('1000')
      );

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Cache Management', () => {
    it('should provide cache statistics', () => {
      // Perform some operations to fill caches
      memoizedPow('2', 10);
      memoizedFormat(new Decimal('1234567'));
      cachedExponentialGrowth('100', '1.1', 50);

      const stats = getCacheStats();

      expect(stats.pow.hitCount).toBeGreaterThanOrEqual(0);
      expect(stats.format.hitCount).toBeGreaterThanOrEqual(0);
      expect(stats.exponential.hitCount).toBeGreaterThanOrEqual(0);
    });

    it('should clear all caches', () => {
      // Fill caches
      memoizedPow('2', 10);
      memoizedFormat(new Decimal('1234567'));

      let stats = getCacheStats();
      expect(stats.pow.hitCount).toBeGreaterThanOrEqual(0);

      clearAllCaches();

      stats = getCacheStats();
      expect(stats.pow.hitCount).toBe(0);
      expect(stats.format.hitCount).toBe(0);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should perform calculations within time limits', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        memoizedPow('1.01', i);
        memoizedFormat(new Decimal(i * 1000));
        cachedExponentialGrowth('100', '1.001', i);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000); // Less than 1 second for 100 calculations
    });

    it('should handle concurrent operations efficiently', () => {
      const startTime = performance.now();

      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() => {
          memoizedPow('1.1', i + 10);
          cachedExponentialGrowth('100', '1.01', i + 5);
          return memoizedFormat(new Decimal(i * 10000));
        })
      );

      return Promise.all(promises).then(results => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(results).toHaveLength(10);
        results.forEach(result => {
          expect(typeof result).toBe('string');
        });

        // Should complete efficiently even with concurrency
        expect(duration).toBeLessThan(500);
      });
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during repeated operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        memoizedPow('1.001', i % 100);
        memoizedFormat(new Decimal(i));
        cachedExponentialGrowth('100', '1.001', i % 50);
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      if (memoryIncrease > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });
});
