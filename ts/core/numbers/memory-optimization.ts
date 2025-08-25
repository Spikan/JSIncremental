// Memory optimization utilities for break_eternity.js extreme value operations
// Provides intelligent memory management and performance optimization

import { isDecimal, DecimalType } from './decimal-utils';
import { isExtremeValue } from './safe-conversion';
import { ExtremeValueMonitor } from './error-recovery';

/**
 * Memory pool for frequently used Decimal objects
 * Reduces garbage collection pressure for extreme value operations
 */
class DecimalMemoryPool {
  private static instance: DecimalMemoryPool;
  private pool: Map<string, DecimalType[]> = new Map();
  private maxPoolSize = 100;
  private poolHits = 0;
  private poolMisses = 0;

  static getInstance(): DecimalMemoryPool {
    if (!DecimalMemoryPool.instance) {
      DecimalMemoryPool.instance = new DecimalMemoryPool();
    }
    return DecimalMemoryPool.instance;
  }

  /**
   * Get a Decimal from the pool or create a new one
   */
  get(value: string | number): DecimalType {
    const key = String(value);
    const pool = this.pool.get(key);

    if (pool && pool.length > 0) {
      this.poolHits++;
      return pool.pop()!;
    }

    this.poolMisses++;
    return new (globalThis as any).Decimal(value);
  }

  /**
   * Return a Decimal to the pool for reuse
   */
  return(decimal: DecimalType): void {
    if (!isDecimal(decimal)) return;

    const key = decimal.toString();
    if (!this.pool.has(key)) {
      this.pool.set(key, []);
    }

    const pool = this.pool.get(key)!;
    if (pool.length < this.maxPoolSize) {
      pool.push(decimal);
    }
  }

  /**
   * Clear the pool to free memory
   */
  clear(): void {
    this.pool.clear();
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const totalPooled = Array.from(this.pool.values()).reduce((sum, pool) => sum + pool.length, 0);
    const hitRate =
      this.poolHits + this.poolMisses > 0 ? this.poolHits / (this.poolHits + this.poolMisses) : 0;

    return {
      totalPooled,
      poolHits: this.poolHits,
      poolMisses: this.poolMisses,
      hitRate: hitRate.toFixed(3),
      poolKeys: this.pool.size,
    };
  }
}

/**
 * Intelligent garbage collection hints for extreme value operations
 */
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private extremeValueCount = 0;
  private lastGC = Date.now();
  private gcThreshold = 1000; // Trigger GC hint after 1000 extreme operations

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  /**
   * Track extreme value operation and suggest GC if needed
   */
  trackOperation(decimal: DecimalType): void {
    if (isExtremeValue(decimal)) {
      this.extremeValueCount++;

      // Suggest garbage collection if we've done many extreme operations
      if (this.extremeValueCount >= this.gcThreshold) {
        this.suggestGarbageCollection();
        this.extremeValueCount = 0;
      }
    }
  }

  /**
   * Suggest garbage collection to the browser
   */
  private suggestGarbageCollection(): void {
    const now = Date.now();
    const timeSinceLastGC = now - this.lastGC;

    // Only suggest GC if it's been at least 30 seconds since last suggestion
    if (timeSinceLastGC > 30000) {
      if (typeof window !== 'undefined' && 'gc' in window) {
        try {
          (window as any).gc();
          console.log('🧹 Garbage collection triggered for extreme value optimization');
        } catch (error) {
          console.warn('Failed to trigger garbage collection:', error);
        }
      }
      this.lastGC = now;
    }
  }

  /**
   * Optimize memory usage for batch operations
   */
  optimizeForBatch(operations: (() => DecimalType)[]): DecimalType[] {
    const results: DecimalType[] = [];
    const pool = DecimalMemoryPool.getInstance();

    try {
      for (const operation of operations) {
        const result = operation();
        results.push(result);

        // Track for memory optimization
        this.trackOperation(result);
      }
    } finally {
      // Clear pool after batch operations to prevent memory buildup
      pool.clear();
    }

    return results;
  }

  /**
   * Get memory optimization statistics
   */
  getStats() {
    const poolStats = DecimalMemoryPool.getInstance().getStats();
    const monitorStats = ExtremeValueMonitor.getInstance().getStats();

    return {
      pool: poolStats,
      extremeValueCount: this.extremeValueCount,
      lastGC: this.lastGC,
      monitor: monitorStats,
    };
  }
}

/**
 * Advanced caching with memory-aware eviction
 */
export class MemoryAwareCache<K, V> {
  private cache = new Map<K, V>();
  private accessCount = new Map<K, number>();
  private memoryUsage = 0;
  private maxMemoryUsage = 50 * 1024 * 1024; // 50MB limit
  private maxSize = 1000;

  set(key: K, value: V): void {
    // Estimate memory usage (rough approximation)
    const estimatedSize = this.estimateMemoryUsage(value);

    // Check if adding this would exceed memory limit
    if (this.memoryUsage + estimatedSize > this.maxMemoryUsage) {
      this.evictLeastUsed();
    }

    this.cache.set(key, value);
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.memoryUsage += estimatedSize;

    // Enforce size limit
    if (this.cache.size > this.maxSize) {
      this.evictLeastUsed();
    }
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    }
    return value;
  }

  private evictLeastUsed(): void {
    let minAccess = Infinity;
    let keyToEvict: K | null = null;

    for (const [key, accessCount] of this.accessCount.entries()) {
      if (accessCount < minAccess) {
        minAccess = accessCount;
        keyToEvict = key;
      }
    }

    if (keyToEvict) {
      const evictedValue = this.cache.get(keyToEvict);
      if (evictedValue) {
        this.memoryUsage -= this.estimateMemoryUsage(evictedValue);
      }

      this.cache.delete(keyToEvict);
      this.accessCount.delete(keyToEvict);
    }
  }

  private estimateMemoryUsage(value: V): number {
    if (isDecimal(value)) {
      // Estimate based on string representation length
      return (value as any).toString().length * 2; // Rough estimate
    }

    if (typeof value === 'string') {
      return (value as string).length * 2;
    }

    if (typeof value === 'number') {
      return 8; // 64-bit number
    }

    // Default estimate
    return 100;
  }

  clear(): void {
    this.cache.clear();
    this.accessCount.clear();
    this.memoryUsage = 0;
  }

  getStats() {
    return {
      size: this.cache.size,
      memoryUsage: this.memoryUsage,
      maxMemoryUsage: this.maxMemoryUsage,
      maxSize: this.maxSize,
    };
  }
}

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private operationTimings = new Map<string, number[]>();
  private slowOperationThreshold = 100; // 100ms

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Time an operation and track performance
   */
  timeOperation<T>(operationName: string, operation: () => T): T {
    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;

    if (!this.operationTimings.has(operationName)) {
      this.operationTimings.set(operationName, []);
    }

    this.operationTimings.get(operationName)!.push(duration);

    // Warn about slow operations
    if (duration > this.slowOperationThreshold) {
      console.warn(`🐌 Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const stats: Record<string, any> = {};

    for (const [operation, timings] of this.operationTimings.entries()) {
      const avg = timings.reduce((sum, time) => sum + time, 0) / timings.length;
      const max = Math.max(...timings);
      const min = Math.min(...timings);

      stats[operation] = {
        count: timings.length,
        average: avg.toFixed(2),
        max: max.toFixed(2),
        min: min.toFixed(2),
        slowOperations: timings.filter(t => t > this.slowOperationThreshold).length,
      };
    }

    return stats;
  }

  /**
   * Clear performance tracking
   */
  clear(): void {
    this.operationTimings.clear();
  }
}

/**
 * Global memory optimization setup
 */
export function setupMemoryOptimization(): void {
  if (typeof window === 'undefined') return;

  // Set up periodic memory optimization
  setInterval(
    () => {
      const optimizer = MemoryOptimizer.getInstance();
      const stats = optimizer.getStats();

      // Log memory stats every 5 minutes
      if (stats.pool.totalPooled > 50) {
        console.log('🧠 Memory optimization stats:', stats);
      }
    },
    5 * 60 * 1000
  );

  // Set up performance monitoring
  setInterval(
    () => {
      const perfOptimizer = PerformanceOptimizer.getInstance();
      const stats = perfOptimizer.getStats();

      // Log performance stats if there are slow operations
      const hasSlowOperations = Object.values(stats).some((op: any) => op.slowOperations > 0);
      if (hasSlowOperations) {
        console.log('⚡ Performance optimization stats:', stats);
      }
    },
    10 * 60 * 1000
  );
}

// Export singleton instances
export const memoryOptimizer = MemoryOptimizer.getInstance();
export const performanceOptimizer = PerformanceOptimizer.getInstance();
export const decimalMemoryPool = DecimalMemoryPool.getInstance();
