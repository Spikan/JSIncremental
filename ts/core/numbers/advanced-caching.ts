// Advanced caching strategies for break_eternity.js operations
// Provides intelligent caching with predictive loading and adaptive sizing

import { DecimalType } from './decimal-utils';
import { MemoryAwareCache } from './memory-optimization';

/**
 * Predictive cache that anticipates future operations
 */
export class PredictiveCache {
  private static instance: PredictiveCache;
  private cache = new MemoryAwareCache<string, DecimalType>();
  private accessPatterns = new Map<string, string[]>(); // key -> sequence of next keys
  private patternThreshold = 3; // minimum pattern length to consider

  static getInstance(): PredictiveCache {
    if (!PredictiveCache.instance) {
      PredictiveCache.instance = new PredictiveCache();
    }
    return PredictiveCache.instance;
  }

  /**
   * Get value and update access patterns
   */
  get(key: string): DecimalType | undefined {
    const value = this.cache.get(key);

    if (value) {
      // Record this access for pattern analysis
      this.recordAccess(key);
    }

    return value;
  }

  /**
   * Set value and potentially preload related values
   */
  set(key: string, value: DecimalType): void {
    this.cache.set(key, value);
    this.recordAccess(key);

    // Predict and preload related values
    this.predictAndPreload(key);
  }

  /**
   * Record access pattern for predictive caching
   */
  private recordAccess(key: string): void {
    // Get the last few accessed keys to build patterns
    const recentKeys = Array.from(this.accessPatterns.keys()).slice(-10);

    for (const recentKey of recentKeys) {
      const pattern = this.accessPatterns.get(recentKey) || [];
      if (!pattern.includes(key)) {
        pattern.push(key);
        this.accessPatterns.set(recentKey, pattern);
      }
    }

    // Also record the current key as a pattern starter
    if (!this.accessPatterns.has(key)) {
      this.accessPatterns.set(key, []);
    }
  }

  /**
   * Predict and preload values based on access patterns
   */
  private predictAndPreload(currentKey: string): void {
    const pattern = this.accessPatterns.get(currentKey);
    if (!pattern || pattern.length < this.patternThreshold) return;

    // Find the most common next key in the pattern
    const nextKeyCounts = new Map<string, number>();
    for (const nextKey of pattern) {
      nextKeyCounts.set(nextKey, (nextKeyCounts.get(nextKey) || 0) + 1);
    }

    // Preload the most likely next key
    const mostLikelyNext = Array.from(nextKeyCounts.entries()).sort(([, a], [, b]) => b - a)[0];

    if (mostLikelyNext && mostLikelyNext[1] >= this.patternThreshold) {
      this.preloadValue(mostLikelyNext[0]);
    }
  }

  /**
   * Preload a value based on prediction
   */
  private preloadValue(key: string): void {
    // This would typically involve computing the value in the background
    // For now, we'll just log the prediction
    console.log(`🔮 Predictive cache: preloading ${key}`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    return {
      ...cacheStats,
      patterns: this.accessPatterns.size,
      patternThreshold: this.patternThreshold,
    };
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
    this.accessPatterns.clear();
  }
}

/**
 * Adaptive cache that adjusts size based on performance
 */
export class AdaptiveCache<K, V> {
  private cache = new Map<K, V>();
  private accessTimes = new Map<K, number>();
  private hitCount = 0;
  private missCount = 0;
  private maxSize = 100;
  private targetHitRate = 0.8; // 80% hit rate target

  get(key: K): V | undefined {
    const value = this.cache.get(key);

    if (value) {
      this.hitCount++;
      this.accessTimes.set(key, Date.now());
    } else {
      this.missCount++;
    }

    // Periodically adjust cache size based on hit rate
    this.adjustCacheSize();

    return value;
  }

  set(key: K, value: V): void {
    // Check if we need to evict before adding
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, value);
    this.accessTimes.set(key, Date.now());
  }

  private evictLeastRecentlyUsed(): void {
    let oldestTime = Infinity;
    let oldestKey: K | null = null;

    for (const [key, accessTime] of this.accessTimes.entries()) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
    }
  }

  private adjustCacheSize(): void {
    const totalRequests = this.hitCount + this.missCount;
    if (totalRequests < 100) return; // Need enough data to make decisions

    const currentHitRate = this.hitCount / totalRequests;

    if (currentHitRate < this.targetHitRate && this.maxSize < 1000) {
      // Increase cache size if hit rate is too low
      this.maxSize = Math.min(1000, this.maxSize * 1.5);
      console.log(
        `📈 Increasing cache size to ${this.maxSize} (hit rate: ${(currentHitRate * 100).toFixed(1)}%)`
      );
    } else if (currentHitRate > this.targetHitRate + 0.1 && this.maxSize > 50) {
      // Decrease cache size if hit rate is very high
      this.maxSize = Math.max(50, this.maxSize * 0.8);
      console.log(
        `📉 Decreasing cache size to ${this.maxSize} (hit rate: ${(currentHitRate * 100).toFixed(1)}%)`
      );
    }
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: (hitRate * 100).toFixed(1) + '%',
      targetHitRate: (this.targetHitRate * 100).toFixed(1) + '%',
    };
  }

  clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

/**
 * Specialized cache for expensive Decimal operations
 */
export class DecimalOperationCache {
  private static instance: DecimalOperationCache;
  private powCache = new AdaptiveCache<string, DecimalType>();
  private expCache = new AdaptiveCache<string, DecimalType>();
  private logCache = new AdaptiveCache<string, DecimalType>();
  private sqrtCache = new AdaptiveCache<string, DecimalType>();

  static getInstance(): DecimalOperationCache {
    if (!DecimalOperationCache.instance) {
      DecimalOperationCache.instance = new DecimalOperationCache();
    }
    return DecimalOperationCache.instance;
  }

  /**
   * Cached power operation
   */
  pow(base: DecimalType, exponent: number): DecimalType {
    const key = `${base.toString()}:${exponent}`;
    let result = this.powCache.get(key);

    if (!result) {
      result = base.pow(exponent);
      this.powCache.set(key, result);
    }

    return result;
  }

  /**
   * Cached exponential operation
   */
  exp(value: DecimalType): DecimalType {
    const key = value.toString();
    let result = this.expCache.get(key);

    if (!result) {
      result = value.exp();
      this.expCache.set(key, result);
    }

    return result;
  }

  /**
   * Cached logarithm operation
   */
  log(value: DecimalType): DecimalType {
    const key = value.toString();
    let result = this.logCache.get(key);

    if (!result) {
      result = value.log();
      this.logCache.set(key, result);
    }

    return result;
  }

  /**
   * Cached square root operation
   */
  sqrt(value: DecimalType): DecimalType {
    const key = value.toString();
    let result = this.sqrtCache.get(key);

    if (!result) {
      result = value.sqrt();
      this.sqrtCache.set(key, result);
    }

    return result;
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats() {
    return {
      pow: this.powCache.getStats(),
      exp: this.expCache.getStats(),
      log: this.logCache.getStats(),
      sqrt: this.sqrtCache.getStats(),
    };
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.powCache.clear();
    this.expCache.clear();
    this.logCache.clear();
    this.sqrtCache.clear();
  }
}

/**
 * Batch operation optimizer
 */
export class BatchOptimizer {
  private static instance: BatchOptimizer;
  private operationCache = new AdaptiveCache<string, DecimalType[]>();

  static getInstance(): BatchOptimizer {
    if (!BatchOptimizer.instance) {
      BatchOptimizer.instance = new BatchOptimizer();
    }
    return BatchOptimizer.instance;
  }

  /**
   * Optimize a batch of similar operations
   */
  optimizeBatch<T>(
    operations: T[],
    operationFn: (item: T) => DecimalType,
    batchKey?: string
  ): DecimalType[] {
    const key = batchKey || this.generateBatchKey(operations);

    // Check if we have cached results
    let results = this.operationCache.get(key);

    if (!results) {
      // Compute results and cache them
      results = operations.map(operationFn);
      this.operationCache.set(key, results);
    }

    return results;
  }

  /**
   * Generate a key for a batch of operations
   */
  private generateBatchKey<T>(operations: T[]): string {
    // Create a hash of the operations
    const hash = operations
      .map(op => JSON.stringify(op))
      .join('|')
      .slice(0, 100); // Limit length

    return `batch:${hash}`;
  }

  /**
   * Get batch optimization statistics
   */
  getStats() {
    return this.operationCache.getStats();
  }

  /**
   * Clear batch cache
   */
  clear(): void {
    this.operationCache.clear();
  }
}

/**
 * Global cache management
 */
export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, any> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Register a cache with the manager
   */
  registerCache(name: string, cache: any): void {
    this.caches.set(name, cache);
  }

  /**
   * Get a registered cache
   */
  getCache<T>(name: string): T | undefined {
    return this.caches.get(name);
  }

  /**
   * Get statistics for all caches
   */
  getAllStats() {
    const stats: Record<string, any> = {};

    for (const [name, cache] of this.caches.entries()) {
      if (cache.getStats) {
        stats[name] = cache.getStats();
      }
    }

    return stats;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      if (cache.clear) {
        cache.clear();
      }
    }
  }

  /**
   * Optimize all caches based on memory usage
   */
  optimize(): void {
    const stats = this.getAllStats();
    const totalMemory = Object.values(stats).reduce((sum: number, cacheStats: any) => {
      return sum + (cacheStats.memoryUsage || 0);
    }, 0);

    // If total memory usage is high, clear least used caches
    if (totalMemory > 100 * 1024 * 1024) {
      // 100MB
      console.log('🧹 High memory usage detected, clearing least used caches');
      this.clearAll();
    }
  }
}

// Export singleton instances
export const predictiveCache = PredictiveCache.getInstance();
export const decimalOperationCache = DecimalOperationCache.getInstance();
export const batchOptimizer = BatchOptimizer.getInstance();
export const cacheManager = CacheManager.getInstance();
