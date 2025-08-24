// Performance optimization utilities for LargeNumber operations
// Provides caching, memoization, and efficient calculation patterns

import { LargeNumber } from './large-number';
import { pow, multiply, add } from './migration-utils';

// Simple LRU cache implementation
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global caches for expensive operations
const powCache = new LRUCache<string, LargeNumber>(200);
const economyCalculationCache = new LRUCache<string, LargeNumber>(500);
const formatCache = new LRUCache<string, string>(300);

/**
 * Memoized power calculation with caching
 */
export function memoizedPow(base: any, exponent: number): LargeNumber {
  const key = `${base.toString()}:${exponent}`;

  let result = powCache.get(key);
  if (result) {
    return result;
  }

  result = pow(base, exponent);
  powCache.set(key, result);
  return result;
}

/**
 * Efficient calculation of exponential growth with caching
 */
export function cachedExponentialGrowth(
  baseValue: any,
  growthRate: any,
  time: number
): LargeNumber {
  const key = `${baseValue.toString()}:${growthRate.toString()}:${time}`;

  let result = economyCalculationCache.get(key);
  if (result) {
    return result;
  }

  // For large exponents, use more efficient calculation
  if (time > 1000) {
    // Use binary exponentiation for large exponents
    result = binaryExponentiation(baseValue, growthRate, time);
  } else {
    // Use regular power for smaller exponents
    const multiplier = memoizedPow(growthRate, time);
    result = multiply(baseValue, multiplier);
  }

  economyCalculationCache.set(key, result);
  return result;
}

/**
 * Binary exponentiation for efficient large exponent calculations
 */
function binaryExponentiation(base: any, growthRate: any, exponent: number): LargeNumber {
  if (exponent === 0) {
    return new LargeNumber(1);
  }

  let result = new LargeNumber(1);
  let currentBase = new LargeNumber(base);
  let currentGrowth = new LargeNumber(growthRate);

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = multiply(result, currentBase);
    }
    currentBase = multiply(currentBase, currentGrowth);
    exponent = Math.floor(exponent / 2);
  }

  return result;
}

/**
 * Memoized LargeNumber formatting
 */
export function memoizedFormat(value: any): string {
  const key = value.toString();

  let result = formatCache.get(key);
  if (result) {
    return result;
  }

  // Basic formatting logic
  const numValue = value.toNumber();
  if (numValue >= 1e6 || numValue <= -1e6) {
    result = value.toString();
  } else {
    result = numValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  formatCache.set(key, result);
  return result;
}

/**
 * Batch calculation for multiple similar operations
 */
export function batchCalculateStrawSPD(
  strawsArray: any[],
  baseSPDArray: any[],
  widerStrawsArray: any[],
  widerMultiplierArray: any[]
): LargeNumber[] {
  return strawsArray.map((straws, index) => {
    const key = `strawSPD:${straws}:${baseSPDArray[index]}:${widerStrawsArray[index]}:${widerMultiplierArray[index]}`;

    let result = economyCalculationCache.get(key);
    if (result) {
      return result;
    }

    // Calculate straw SPD (simplified version for batch processing)
    const strawCount = new LargeNumber(straws);
    const baseValue = new LargeNumber(baseSPDArray[index]);
    const upgradeMultiplier = new LargeNumber(1).add(
      new LargeNumber(widerStrawsArray[index]).multiply(
        new LargeNumber(widerMultiplierArray[index])
      )
    );

    result = baseValue.multiply(upgradeMultiplier);

    // Apply basic scaling for very large numbers
    if (result.gte(new LargeNumber('1e100'))) {
      const excess = result.subtract(new LargeNumber('1e100'));
      const scaledExcess = memoizedPow(new LargeNumber('1.001'), excess.toNumber());
      result = new LargeNumber('1e100').add(
        excess.multiply(new LargeNumber('0.95')).multiply(scaledExcess)
      );
    }

    economyCalculationCache.set(key, result);
    return result;
  });
}

/**
 * Optimized synergy calculation for multiple resource types
 */
export function optimizedSynergyCalculation(
  strawCount: any,
  cupCount: any,
  strawSPD: any,
  cupSPD: any
): LargeNumber {
  const key = `synergy:${strawCount}:${cupCount}:${strawSPD}:${cupSPD}`;

  let result = economyCalculationCache.get(key);
  if (result) {
    return result;
  }

  const straws = new LargeNumber(strawCount);
  const cups = new LargeNumber(cupCount);
  const sSPD = new LargeNumber(strawSPD);
  const cSPD = new LargeNumber(cupSPD);

  // Calculate individual contributions
  const strawContribution = sSPD.multiply(straws);
  const cupContribution = cSPD.multiply(cups);

  // Optimized synergy calculation
  let synergyMultiplier = new LargeNumber(1);
  if (straws.gte(new LargeNumber('100')) && cups.gte(new LargeNumber('100'))) {
    const strawRatio = straws.divide(new LargeNumber('100'));
    const cupRatio = cups.divide(new LargeNumber('100'));
    const synergyRatio = strawRatio.multiply(cupRatio);

    // Use more efficient calculation for synergy
    synergyMultiplier = synergyMultiplier.add(
      new LargeNumber('1.1').multiply(
        memoizedPow(new LargeNumber('0.999'), synergyRatio.toNumber())
      )
    );
  }

  result = strawContribution.add(cupContribution).multiply(synergyMultiplier);
  economyCalculationCache.set(key, result);
  return result;
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, { count: number; totalTime: number; maxTime: number; minTime: number }>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  measureTime<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    const existing = this.metrics.get(operation);
    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.minTime = Math.min(existing.minTime, duration);
    } else {
      this.metrics.set(operation, {
        count: 1,
        totalTime: duration,
        maxTime: duration,
        minTime: duration
      });
    }

    return result;
  }

  getMetrics(operation?: string) {
    if (operation) {
      return this.metrics.get(operation);
    }
    return Object.fromEntries(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

/**
 * Cache management utilities
 */
export function clearAllCaches(): void {
  powCache.clear();
  economyCalculationCache.clear();
  formatCache.clear();
}

export function getCacheStats() {
  return {
    powCache: powCache.size(),
    economyCache: economyCalculationCache.size(),
    formatCache: formatCache.size()
  };
}

// Export performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();
