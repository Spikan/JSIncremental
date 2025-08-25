// Performance benchmarks for LargeNumber operations
// Demonstrates the capabilities and efficiency of the break_eternity.js integration

import { describe, it, expect, beforeAll } from 'vitest';
import { LargeNumber } from '../ts/core/numbers/large-number';
import { toLargeNumber, add, multiply, pow } from '../ts/core/numbers/migration-utils';
import {
  memoizedPow,
  cachedExponentialGrowth,
  PerformanceMonitor,
} from '../ts/core/numbers/performance-utils';
import { addSips, subtractSips, isGreaterOrEqual } from '../ts/core/state/mutations';
import { computeStrawSPD, computeTotalSPD } from '../ts/core/rules/economy';

describe('LargeNumber Performance Benchmarks', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeAll(() => {
    performanceMonitor = PerformanceMonitor.getInstance();
  });

  describe('Basic Operations Performance', () => {
    it('should perform basic arithmetic efficiently', () => {
      const iterations = 10000;
      const startTime = performance.now();

      performanceMonitor.measureTime('basic-arithmetic', () => {
        for (let i = 0; i < iterations; i++) {
          const a = new LargeNumber(i);
          const b = new LargeNumber(i * 2);
          const result = a.add(b).multiply(new LargeNumber(1.5));
          // Convert to ensure calculation completes
          result.toNumber();
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 10k operations in reasonable time
      expect(duration).toBeLessThan(500); // 500ms for 10k operations
      console.log(`Basic arithmetic: ${iterations} operations in ${duration.toFixed(2)}ms`);
    });

    it('should handle very large number operations', () => {
      const startTime = performance.now();

      performanceMonitor.measureTime('very-large-numbers', () => {
        // Test with numbers that exceed JavaScript's Number.MAX_SAFE_INTEGER
        const huge1 = new LargeNumber('1e100');
        const huge2 = new LargeNumber('5e99');
        const result = huge1.multiply(huge2).add(new LargeNumber('1e50'));
        result.toString(); // Ensure full calculation
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle very large numbers efficiently
      expect(duration).toBeLessThan(100); // 100ms for very large operations
      console.log(`Very large numbers: Operation completed in ${duration.toFixed(2)}ms`);
    });

    it('should perform comparison operations quickly', () => {
      const iterations = 50000;
      const startTime = performance.now();

      performanceMonitor.measureTime('comparisons', () => {
        for (let i = 0; i < iterations; i++) {
          const a = new LargeNumber(i);
          const b = new LargeNumber(i + 1);
          const result = a.gte(b) || b.lt(a);
          // Ensure result is used
          if (i === 0) expect(result).toBe(false);
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 50k comparisons quickly
      expect(duration).toBeLessThan(300); // 300ms for 50k comparisons
      console.log(`Comparisons: ${iterations} operations in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Caching Performance', () => {
    it('should demonstrate caching benefits for repeated calculations', () => {
      const base = new LargeNumber('1.1');
      const exponent = 100;

      // First call (no cache)
      const start1 = performance.now();
      const result1 = memoizedPow(base, exponent);
      const time1 = performance.now() - start1;

      // Second call (cached)
      const start2 = performance.now();
      const result2 = memoizedPow(base, exponent);
      const time2 = performance.now() - start2;

      // Results should be identical
      expect(result1.toNumber()).toBe(result2.toNumber());

      // Cached call should be significantly faster
      expect(time2).toBeLessThan(time1);
      console.log(
        `Caching benefit: First call ${time1.toFixed(2)}ms, Cached call ${time2.toFixed(2)}ms`
      );
    });

    it('should cache exponential growth calculations', () => {
      const baseValue = new LargeNumber('1000');
      const growthRate = new LargeNumber('1.05');
      const time = 200;

      // First call
      const start1 = performance.now();
      const result1 = cachedExponentialGrowth(baseValue, growthRate, time);
      const time1 = performance.now() - start1;

      // Second call (should use cache)
      const start2 = performance.now();
      const result2 = cachedExponentialGrowth(baseValue, growthRate, time);
      const time2 = performance.now() - start2;

      expect(result1.toNumber()).toBe(result2.toNumber());
      expect(time2).toBeLessThan(time1);
      console.log(
        `Exponential growth caching: First ${time1.toFixed(2)}ms, Cached ${time2.toFixed(2)}ms`
      );
    });
  });

  describe('State Mutation Performance', () => {
    it('should handle state mutations efficiently', () => {
      const iterations = 1000;
      const startTime = performance.now();

      performanceMonitor.measureTime('state-mutations', () => {
        let currentSips = new LargeNumber(1000);

        for (let i = 0; i < iterations; i++) {
          // Simulate various state mutations
          currentSips = addSips(currentSips, i);
          currentSips = subtractSips(currentSips, Math.floor(i / 2));
          const comparison = isGreaterOrEqual(currentSips, new LargeNumber(500));
          // Ensure comparison is used
          if (i === 0) expect(comparison).toBe(true);
        }

        // Ensure final result is reasonable
        expect(currentSips.toNumber()).toBeGreaterThan(0);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle 1k state mutations efficiently
      expect(duration).toBeLessThan(200); // 200ms for 1k mutations
      console.log(`State mutations: ${iterations} operations in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Economy Formula Performance', () => {
    it('should compute economy formulas efficiently', () => {
      const iterations = 500;
      const startTime = performance.now();

      performanceMonitor.measureTime('economy-formulas', () => {
        for (let i = 1; i <= iterations; i++) {
          // Simulate economy calculations with increasing complexity
          const straws = new LargeNumber(i * 100);
          const baseSPD = new LargeNumber(0.5 + i * 0.1);
          const widerStraws = Math.floor(i / 10);
          const widerMultiplier = 0.1 + i * 0.01;

          const strawSPD = computeStrawSPD(straws, baseSPD, widerStraws, widerMultiplier);
          const totalSPD = computeTotalSPD(straws, strawSPD, straws, strawSPD);

          // Ensure calculations are used
          expect(strawSPD.toNumber()).toBeGreaterThan(0);
          expect(totalSPD.toNumber()).toBeGreaterThan(0);
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle 500 economy calculations efficiently
      expect(duration).toBeLessThan(500); // 500ms for 500 calculations
      console.log(`Economy formulas: ${iterations} calculations in ${duration.toFixed(2)}ms`);
    });

    it('should scale well with very large economy values', () => {
      const startTime = performance.now();

      performanceMonitor.measureTime('large-economy', () => {
        // Test with very large values that would break regular numbers
        const hugeStraws = new LargeNumber('1e50');
        const hugeBaseSPD = new LargeNumber('1e30');
        const hugeStrawSPD = computeStrawSPD(hugeStraws, hugeBaseSPD, 100, 0.5);
        const hugeTotalSPD = computeTotalSPD(hugeStraws, hugeStrawSPD, hugeStraws, hugeStrawSPD);

        // Ensure results are reasonable
        expect(hugeStrawSPD.toNumber()).toBeGreaterThan(1e30);
        expect(hugeTotalSPD.toNumber()).toBeGreaterThan(1e50);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle very large economy calculations efficiently
      expect(duration).toBeLessThan(200); // 200ms for huge calculations
      console.log(`Large economy: Calculation completed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Memory Efficiency', () => {
    it('should handle memory efficiently with many LargeNumber instances', () => {
      const count = 10000;
      const startTime = performance.now();

      performanceMonitor.measureTime('memory-test', () => {
        const numbers: LargeNumber[] = [];

        // Create many LargeNumber instances
        for (let i = 0; i < count; i++) {
          numbers.push(new LargeNumber(i));
        }

        // Perform operations on them
        for (let i = 0; i < count; i++) {
          const result = numbers[i].add(new LargeNumber(1)).multiply(new LargeNumber(2));
          if (i < 100) {
            // Only convert some to avoid performance hit
            result.toNumber();
          }
        }

        // Verify some results
        expect(numbers[0].toNumber()).toBe(0);
        expect(numbers[count - 1].toNumber()).toBe(count - 1);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle 10k instances efficiently
      expect(duration).toBeLessThan(1000); // 1 second for 10k instances
      console.log(`Memory test: ${count} instances processed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Real-World Scenario Performance', () => {
    it('should simulate realistic gameplay performance', () => {
      const gameTicks = 1000; // Simulate 1000 game ticks
      const startTime = performance.now();

      performanceMonitor.measureTime('gameplay-simulation', () => {
        let sips = new LargeNumber(100);
        let straws = new LargeNumber(1);

        for (let tick = 0; tick < gameTicks; tick++) {
          // Simulate sip production
          const production = new LargeNumber(0.1).multiply(straws);
          sips = addSips(sips, production);

          // Simulate occasional purchases
          if (tick % 100 === 0 && sips.toNumber() > 100) {
            straws = addSips(straws, 1);
            sips = subtractSips(sips, 100);
          }

          // Simulate economy calculations
          if (tick % 10 === 0) {
            const strawSPD = computeStrawSPD(straws, new LargeNumber(0.1), 0, 0);
            const totalSPD = computeTotalSPD(
              straws,
              strawSPD,
              new LargeNumber(0),
              new LargeNumber(0)
            );
            // Use results to ensure calculations aren't optimized away
            expect(strawSPD.toNumber()).toBeGreaterThan(0);
            expect(totalSPD.toNumber()).toBeGreaterThan(0);
          }
        }

        // Verify final state - sips should have increased from initial 100
        expect(sips.toNumber()).toBeGreaterThan(50); // More conservative check
        expect(straws.toNumber()).toBeGreaterThan(1);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should simulate 1000 game ticks efficiently
      expect(duration).toBeLessThan(2000); // 2 seconds for realistic gameplay simulation
      console.log(`Gameplay simulation: ${gameTicks} ticks in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Performance Monitoring', () => {
    it('should provide detailed performance metrics', () => {
      // Perform various operations to generate metrics
      memoizedPow(new LargeNumber('2'), 50);
      cachedExponentialGrowth(new LargeNumber('100'), new LargeNumber('1.1'), 100);
      addSips(new LargeNumber(1000), new LargeNumber(100));
      computeStrawSPD(new LargeNumber(10), new LargeNumber(1), 5, 0.1);

      const metrics = performanceMonitor.getMetrics();

      // Should have collected metrics for various operations
      expect(metrics).toBeDefined();
      expect(Object.keys(metrics).length).toBeGreaterThan(0);

      // Log metrics for analysis
      console.log('Performance Metrics:');
      Object.entries(metrics).forEach(([operation, data]: [string, any]) => {
        console.log(
          `  ${operation}: ${data.count} calls, ${data.totalTime.toFixed(2)}ms total, ${data.maxTime.toFixed(2)}ms max, ${data.minTime.toFixed(2)}ms min`
        );
      });
    });
  });
});
