/* eslint-disable no-console */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  MemoryOptimizer,
  MemoryAwareCache,
  PerformanceOptimizer,
  memoryOptimizer,
  performanceOptimizer,
  decimalMemoryPool,
} from '../ts/core/numbers/memory-optimization';

import {
  PredictiveCache,
  AdaptiveCache,
  DecimalOperationCache,
  BatchOptimizer,
  CacheManager,
  predictiveCache,
  decimalOperationCache,
  batchOptimizer,
  cacheManager,
} from '../ts/core/numbers/advanced-caching';

import {
  PerformanceTuner,
  OptimizedOperations,
  PerformanceDashboard,
  setupPerformanceOptimization,
  performanceTuner,
  optimizedOperations,
  performanceDashboard,
} from '../ts/core/numbers/performance-tuning';

// Mock Decimal for testing
class MockDecimal {
  private value: string;

  constructor(value: string | number) {
    this.value = String(value);
  }

  // Add a property to identify this as a Decimal
  get isDecimal() {
    return true;
  }

  toString() {
    return this.value;
  }

  toNumber() {
    const num = parseFloat(this.value);
    return isFinite(num) ? num : Infinity;
  }

  add(other: any) {
    const otherValue = other instanceof MockDecimal ? other.value : String(other);
    return new MockDecimal(parseFloat(this.value) + parseFloat(otherValue));
  }

  mul(other: any) {
    const otherValue = other instanceof MockDecimal ? other.value : String(other);
    return new MockDecimal(parseFloat(this.value) * parseFloat(otherValue));
  }

  div(other: any) {
    const otherValue = other instanceof MockDecimal ? other.value : String(other);
    return new MockDecimal(parseFloat(this.value) / parseFloat(otherValue));
  }

  pow(exponent: number) {
    return new MockDecimal(Math.pow(parseFloat(this.value), exponent));
  }

  exp() {
    return new MockDecimal(Math.exp(parseFloat(this.value)));
  }

  log() {
    return new MockDecimal(Math.log(parseFloat(this.value)));
  }

  sqrt() {
    return new MockDecimal(Math.sqrt(parseFloat(this.value)));
  }

  gte(other: any) {
    const otherValue = other instanceof MockDecimal ? other.value : String(other);
    return parseFloat(this.value) >= parseFloat(otherValue);
  }

  eq(other: any) {
    const otherValue = other instanceof MockDecimal ? other.value : String(other);
    return parseFloat(this.value) === parseFloat(otherValue);
  }
}

// Mock global Decimal
(globalThis as any).Decimal = MockDecimal;

describe('Phase 3: Advanced Performance Optimization', () => {
  beforeEach(() => {
    // Clear all caches and reset state
    memoryOptimizer.getStats().extremeValueCount = 0;
    performanceOptimizer.clear();
    decimalMemoryPool.clear();
    predictiveCache.clear();
    decimalOperationCache.clear();
    batchOptimizer.clear();
    cacheManager.clearAll();
    performanceTuner.setTuningEnabled(false);

    // Reset memory pool stats
    const poolStats = decimalMemoryPool.getStats();
    poolStats.poolHits = 0;
    poolStats.poolMisses = 0;
  });

  afterEach(() => {
    // Clean up
    performanceTuner.setTuningEnabled(false);
    performanceDashboard.stop();
  });

  describe('Memory Optimization', () => {
    it('should track extreme value operations', () => {
      // Create a value that will be detected as extreme by toNumber()
      const extremeValue = new MockDecimal('1e500');
      // Mock the toNumber method to return Infinity for extreme values
      extremeValue.toNumber = () => Infinity;

      memoryOptimizer.trackOperation(extremeValue);

      const stats = memoryOptimizer.getStats();
      expect(stats.extremeValueCount).toBe(1);
    });

    it('should manage memory pool efficiently', () => {
      const value1 = new MockDecimal('100');
      const value2 = new MockDecimal('200');

      // Add values to pool
      decimalMemoryPool.return(value1);
      decimalMemoryPool.return(value2);

      const stats = decimalMemoryPool.getStats();
      expect(stats.totalPooled).toBe(2);
      expect(stats.poolKeys).toBe(2);
    });

    it('should optimize batch operations', () => {
      const operations = [
        () => new MockDecimal('100'),
        () => new MockDecimal('200'),
        () => new MockDecimal('300'),
      ];

      const results = memoryOptimizer.optimizeForBatch(operations);

      expect(results).toHaveLength(3);
      expect(results[0].toString()).toBe('100');
      expect(results[1].toString()).toBe('200');
      expect(results[2].toString()).toBe('300');
    });

    it('should provide memory-aware caching', () => {
      const cache = new MemoryAwareCache<string, MockDecimal>();

      cache.set('key1', new MockDecimal('100'));
      cache.set('key2', new MockDecimal('200'));

      const value1 = cache.get('key1');
      const value2 = cache.get('key2');

      expect(value1?.toString()).toBe('100');
      expect(value2?.toString()).toBe('200');

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
    });
  });

  describe('Advanced Caching', () => {
    it('should provide predictive caching', () => {
      // Simulate access patterns
      predictiveCache.set('step1', new MockDecimal('100'));
      predictiveCache.set('step2', new MockDecimal('200'));
      predictiveCache.set('step3', new MockDecimal('300'));

      // Access in pattern
      predictiveCache.get('step1');
      predictiveCache.get('step2');
      predictiveCache.get('step3');

      const stats = predictiveCache.getStats();
      expect(stats.patterns).toBeGreaterThan(0);
    });

    it('should provide adaptive cache sizing', () => {
      const cache = new AdaptiveCache<string, MockDecimal>();

      // Add many items to trigger size adjustment
      for (let i = 0; i < 200; i++) {
        cache.set(`key${i}`, new MockDecimal(i.toString()));
      }

      const stats = cache.getStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });

    it('should cache expensive Decimal operations', () => {
      const base = new MockDecimal('2');

      // First call should compute
      const result1 = decimalOperationCache.pow(base, 10);
      expect(result1.toString()).toBe('1024');

      // Second call should use cache
      const result2 = decimalOperationCache.pow(base, 10);
      expect(result2.toString()).toBe('1024');

      const stats = decimalOperationCache.getStats();
      expect(stats.pow.hitCount).toBeGreaterThan(0);
    });

    it('should optimize batch operations', () => {
      const bases = [new MockDecimal('2'), new MockDecimal('3'), new MockDecimal('4')];

      const results = batchOptimizer.optimizeBatch(bases, base => base.pow(2));

      expect(results).toHaveLength(3);
      expect(results[0].toString()).toBe('4');
      expect(results[1].toString()).toBe('9');
      expect(results[2].toString()).toBe('16');
    });

    it('should manage multiple caches', () => {
      cacheManager.registerCache('test1', new AdaptiveCache<string, MockDecimal>());
      cacheManager.registerCache('test2', new AdaptiveCache<string, MockDecimal>());

      const cache1 = cacheManager.getCache<AdaptiveCache<string, MockDecimal>>('test1');
      const cache2 = cacheManager.getCache<AdaptiveCache<string, MockDecimal>>('test2');

      expect(cache1).toBeDefined();
      expect(cache2).toBeDefined();

      cache1?.set('key1', new MockDecimal('100'));
      cache2?.set('key2', new MockDecimal('200'));

      const stats = cacheManager.getAllStats();
      expect(Object.keys(stats)).toContain('test1');
      expect(Object.keys(stats)).toContain('test2');
    });
  });

  describe('Performance Tuning', () => {
    it('should initialize performance tuning', () => {
      performanceTuner.initialize();

      const status = performanceTuner.getStatus();
      expect(status.enabled).toBe(false); // We disabled it in beforeEach
    });

    it('should provide optimized operations', () => {
      const base = new MockDecimal('2');

      const result = optimizedOperations.pow(base, 5);
      expect(result.toString()).toBe('32');

      const expResult = optimizedOperations.exp(new MockDecimal('1'));
      expect(expResult.toString()).toBe('2.718281828459045');
    });

    it('should optimize batch operations', () => {
      const bases = [new MockDecimal('2'), new MockDecimal('3'), new MockDecimal('4')];

      const results = optimizedOperations.batchPow(bases, 2);

      expect(results).toHaveLength(3);
      expect(results[0].toString()).toBe('4');
      expect(results[1].toString()).toBe('9');
      expect(results[2].toString()).toBe('16');
    });

    it('should track operation performance', () => {
      const base = new MockDecimal('2');

      // Perform some operations
      optimizedOperations.pow(base, 10);
      optimizedOperations.exp(new MockDecimal('1'));
      optimizedOperations.log(new MockDecimal('10'));

      const stats = performanceOptimizer.getStats();
      expect(Object.keys(stats)).toContain('optimized_pow');
      expect(Object.keys(stats)).toContain('optimized_exp');
      expect(Object.keys(stats)).toContain('optimized_log');
    });
  });

  describe('Performance Dashboard', () => {
    it('should collect comprehensive statistics', () => {
      const stats = performanceDashboard['collectAllStats']();

      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('performance');
      expect(stats).toHaveProperty('extremeValues');
      expect(stats).toHaveProperty('caches');
      expect(stats).toHaveProperty('tuning');
    });

    it('should calculate average hit rate correctly', () => {
      const cacheStats = {
        cache1: { hitRate: '75.5%' },
        cache2: { hitRate: '85.1%' },
      };

      const avgHitRate = performanceDashboard['getAverageHitRate'](cacheStats);
      expect(avgHitRate).toBe('80.4');
    });

    it('should count slow operations correctly', () => {
      const performanceStats = {
        op1: { slowOperations: 5 },
        op2: { slowOperations: 3 },
        op3: { slowOperations: 0 },
      };

      const slowCount = performanceDashboard['getSlowOperationCount'](performanceStats);
      expect(slowCount).toBe(8);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complex scenarios', () => {
      // Simulate a complex game scenario with many operations
      const values = Array.from({ length: 100 }, (_, i) => new MockDecimal(i.toString()));

      // Use optimized batch operations
      const results = optimizedOperations.batchPow(values, 2);

      expect(results).toHaveLength(100);
      expect(results[0].toString()).toBe('0');
      expect(results[1].toString()).toBe('1');
      expect(results[2].toString()).toBe('4');

      // Check that memory optimization is working
      const memoryStats = memoryOptimizer.getStats();
      expect(memoryStats.extremeValueCount).toBe(0); // No extreme values in this test

      // Check that caching is working
      const cacheStats = decimalOperationCache.getStats();
      expect(cacheStats.pow.hitCount).toBeGreaterThan(0);
    });

    it('should handle extreme values efficiently', () => {
      const extremeValue = new MockDecimal('1e500');
      // Mock the toNumber method to return Infinity for extreme values
      extremeValue.toNumber = () => Infinity;

      // Track the operation
      memoryOptimizer.trackOperation(extremeValue);

      // Use optimized operations
      const result = optimizedOperations.pow(extremeValue, 2);

      // Check that extreme value monitoring is working
      const extremeStats = memoryOptimizer.getStats();
      expect(extremeStats.extremeValueCount).toBe(1);
    });

    it('should provide comprehensive monitoring', () => {
      // Perform various operations
      const base = new MockDecimal('2');
      optimizedOperations.pow(base, 10);
      optimizedOperations.exp(new MockDecimal('1'));

      // Get all statistics
      const memoryStats = memoryOptimizer.getStats();
      const performanceStats = performanceOptimizer.getStats();
      const cacheStats = cacheManager.getAllStats();

      expect(memoryStats).toBeDefined();
      expect(performanceStats).toBeDefined();
      expect(cacheStats).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      const cache = new MemoryAwareCache<string, MockDecimal>();

      // Should not throw on invalid inputs
      expect(() => {
        cache.set('key', null as any);
        cache.get('nonexistent');
      }).not.toThrow();
    });

    it('should handle cache eviction gracefully', () => {
      const cache = new AdaptiveCache<string, MockDecimal>();

      // Add many items to trigger eviction
      for (let i = 0; i < 200; i++) {
        cache.set(`key${i}`, new MockDecimal(i.toString()));
      }

      // Should not throw during eviction
      expect(() => {
        cache.get('key0'); // This might be evicted
      }).not.toThrow();
    });

    it('should handle performance monitoring errors', () => {
      // Should not throw when monitoring fails
      expect(() => {
        performanceOptimizer.timeOperation('test', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      // But the monitoring system should still work
      const stats = performanceOptimizer.getStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Setup Functions', () => {
    it('should initialize memory optimization', () => {
      expect(() => {
        // Test that memory optimizer can be initialized
        memoryOptimizer.getStats();
      }).not.toThrow();
    });

    it('should initialize performance optimization', () => {
      expect(() => {
        setupPerformanceOptimization();
      }).not.toThrow();
    });
  });
});
