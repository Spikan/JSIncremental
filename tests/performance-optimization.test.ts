// Tests for LargeNumber performance optimizations

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LargeNumber } from '../ts/core/numbers/large-number';
import {
  memoizedPow,
  cachedExponentialGrowth,
  memoizedFormat,
  batchCalculateStrawSPD,
  optimizedSynergyCalculation,
  PerformanceMonitor,
  performanceMonitor,
  clearAllCaches,
  getCacheStats,
} from '../ts/core/numbers/performance-utils';

describe('Performance Optimization', () => {
  beforeEach(() => {
    // Clear caches before each test
    clearAllCaches();
    performanceMonitor.clearMetrics();
  });

  afterEach(() => {
    // Clean up after each test
    clearAllCaches();
  });

  describe('Memoized Power Calculations', () => {
    it('should cache power calculations', () => {
      const base = new LargeNumber('1.1');
      const exponent = 100;

      // First call should calculate
      const result1 = memoizedPow(base, exponent);

      // Second call should use cache
      const result2 = memoizedPow(base, exponent);

      expect(result1).toBeInstanceOf(LargeNumber);
      expect(result2).toBeInstanceOf(LargeNumber);
      expect(result1.toNumber()).toBe(result2.toNumber());
    });

    it('should handle different bases and exponents', () => {
      const result1 = memoizedPow('2', 10);
      const result2 = memoizedPow('3', 5);
      const result3 = memoizedPow('1.5', 20);

      expect(result1.toNumber()).toBe(1024);
      expect(result2.toNumber()).toBe(243);
      expect(result3.toNumber()).toBeGreaterThan(3000);
    });

    it('should work with LargeNumber inputs', () => {
      const base = new LargeNumber('1.05');
      const result = memoizedPow(base, 100);

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(100);
    });
  });

  describe('Cached Exponential Growth', () => {
    it('should cache exponential growth calculations', () => {
      const baseValue = new LargeNumber('100');
      const growthRate = new LargeNumber('1.1');
      const time = 50;

      const result1 = cachedExponentialGrowth(baseValue, growthRate, time);
      const result2 = cachedExponentialGrowth(baseValue, growthRate, time);

      expect(result1).toBeInstanceOf(LargeNumber);
      expect(result2).toBeInstanceOf(LargeNumber);
      expect(result1.toNumber()).toBe(result2.toNumber());
    });

    it('should handle large exponents efficiently', () => {
      const baseValue = new LargeNumber('1');
      const growthRate = new LargeNumber('1.001');
      const time = 10000;

      const startTime = performance.now();
      const result = cachedExponentialGrowth(baseValue, growthRate, time);
      const endTime = performance.now();

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast even for large exponents
    });

    it('should work with different growth rates', () => {
      const slowGrowth = cachedExponentialGrowth('100', '1.01', 100);
      const fastGrowth = cachedExponentialGrowth('100', '1.1', 100);

      expect(fastGrowth.toNumber()).toBeGreaterThan(slowGrowth.toNumber());
    });
  });

  describe('Memoized Formatting', () => {
    it('should cache number formatting', () => {
      const value = new LargeNumber('1234567.89');

      const result1 = memoizedFormat(value);
      const result2 = memoizedFormat(value);

      expect(typeof result1).toBe('string');
      expect(result1).toBe(result2);
    });

    it('should handle very large numbers', () => {
      const largeValue = new LargeNumber('1e100');
      const result = memoizedFormat(largeValue);

      expect(typeof result).toBe('string');
      expect(result).toContain('e+100');
    });

    it('should handle small numbers', () => {
      const smallValue = new LargeNumber('1234.56');
      const result = memoizedFormat(smallValue);

      expect(typeof result).toBe('string');
      expect(result).toContain('1,234.56');
    });
  });

  describe('Batch Calculations', () => {
    it('should perform batch straw SPD calculations', () => {
      const strawsArray = ['100', '200', '300'];
      const baseSPDArray = ['1', '1.5', '2'];
      const widerStrawsArray = [5, 10, 15];
      const widerMultiplierArray = [0.1, 0.15, 0.2];

      const results = batchCalculateStrawSPD(
        strawsArray,
        baseSPDArray,
        widerStrawsArray,
        widerMultiplierArray
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeInstanceOf(LargeNumber);
        expect(result.toNumber()).toBeGreaterThan(0);
      });

      // Results should be different based on inputs
      expect(results[0].toNumber()).toBeLessThan(results[1].toNumber());
      expect(results[1].toNumber()).toBeLessThan(results[2].toNumber());
    });

    it('should cache batch calculation results', () => {
      const strawsArray = ['100', '200'];
      const baseSPDArray = ['1', '1.5'];
      const widerStrawsArray = [5, 10];
      const widerMultiplierArray = [0.1, 0.15];

      // First batch
      const results1 = batchCalculateStrawSPD(
        strawsArray,
        baseSPDArray,
        widerStrawsArray,
        widerMultiplierArray
      );

      // Second batch with same inputs should use cache
      const results2 = batchCalculateStrawSPD(
        strawsArray,
        baseSPDArray,
        widerStrawsArray,
        widerMultiplierArray
      );

      expect(results1[0].toNumber()).toBe(results2[0].toNumber());
      expect(results1[1].toNumber()).toBe(results2[1].toNumber());
    });
  });

  describe('Optimized Synergy Calculations', () => {
    it('should calculate synergy efficiently', () => {
      const result = optimizedSynergyCalculation(
        '1000', // straws
        '500', // cups
        '2', // straw SPD
        '3' // cup SPD
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(2000); // Should show synergy bonus
    });

    it('should cache synergy calculation results', () => {
      const result1 = optimizedSynergyCalculation('1000', '500', '2', '3');
      const result2 = optimizedSynergyCalculation('1000', '500', '2', '3');

      expect(result1.toNumber()).toBe(result2.toNumber());
    });

    it('should handle large numbers in synergy calculations', () => {
      const result = optimizedSynergyCalculation('1e50', '1e40', '1e20', '1e25');

      expect(result).toBeInstanceOf(LargeNumber);
      expect(isFinite(result.toNumber())).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track operation metrics', () => {
      const monitor = PerformanceMonitor.getInstance();

      const result = monitor.measureTime('test-operation', () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      const metrics = monitor.getMetrics('test-operation');

      expect(metrics).toBeDefined();
      expect(metrics!.count).toBe(1);
      expect(metrics!.totalTime).toBeGreaterThan(0);
      expect(metrics!.maxTime).toBeGreaterThan(0);
      expect(metrics!.minTime).toBeGreaterThan(0);
      expect(result).toBe(499500); // Sum formula: n*(n-1)/2
    });

    it('should track multiple operations', () => {
      const monitor = PerformanceMonitor.getInstance();

      monitor.measureTime('operation1', () => {
        for (let i = 0; i < 100; i++) {
          Math.sqrt(i);
        }
      });

      monitor.measureTime('operation2', () => {
        for (let i = 0; i < 50; i++) {
          Math.pow(i, 2);
        }
      });

      const metrics1 = monitor.getMetrics('operation1');
      const metrics2 = monitor.getMetrics('operation2');

      expect(metrics1).toBeDefined();
      expect(metrics2).toBeDefined();
      expect(metrics1!.count).toBe(1);
      expect(metrics2!.count).toBe(1);
    });
  });

  describe('Cache Management', () => {
    it('should provide cache statistics', () => {
      // Perform some operations to fill caches
      memoizedPow('2', 10);
      memoizedFormat(new LargeNumber('1234567'));
      cachedExponentialGrowth('100', '1.1', 50);

      const stats = getCacheStats();

      expect(stats).toHaveProperty('powCache');
      expect(stats).toHaveProperty('economyCache');
      expect(stats).toHaveProperty('formatCache');
      expect(typeof stats.powCache).toBe('number');
      expect(typeof stats.economyCache).toBe('number');
      expect(typeof stats.formatCache).toBe('number');
    });

    it('should clear all caches', () => {
      // Fill caches
      memoizedPow('2', 10);
      memoizedFormat(new LargeNumber('1234567'));

      let stats = getCacheStats();
      const initialTotal = stats.powCache + stats.economyCache + stats.formatCache;

      // Clear caches
      clearAllCaches();

      stats = getCacheStats();
      const finalTotal = stats.powCache + stats.economyCache + stats.formatCache;

      expect(finalTotal).toBe(0);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should perform calculations within time limits', () => {
      const startTime = performance.now();

      // Perform various calculations
      for (let i = 0; i < 100; i++) {
        memoizedPow('1.01', i);
        memoizedFormat(new LargeNumber(i * 1000));
        cachedExponentialGrowth('100', '1.001', i);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(200); // 200ms for 300 operations
    });

    it('should handle concurrent operations efficiently', () => {
      const operations = [];

      // Create multiple async operations
      for (let i = 0; i < 50; i++) {
        operations.push(
          Promise.resolve().then(() => {
            memoizedPow('1.1', i + 10);
            cachedExponentialGrowth('100', '1.01', i + 5);
            return memoizedFormat(new LargeNumber(i * 10000));
          })
        );
      }

      const startTime = performance.now();

      // Wait for all operations to complete
      return Promise.all(operations).then(results => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(results).toHaveLength(50);
        results.forEach(result => {
          expect(typeof result).toBe('string');
        });

        // Should complete in reasonable time even with concurrency
        expect(duration).toBeLessThan(500); // 500ms for concurrent operations
      });
    });
  });
});
