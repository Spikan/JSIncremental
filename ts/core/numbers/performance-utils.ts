// Performance optimization utilities for LargeNumber operations
// Provides caching, memoization, and efficient calculation patterns

import { DecimalOps, Decimal } from './large-number';
import { pow, multiply } from './migration-utils';

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
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
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
const powCache = new LRUCache<string, Decimal>(200);
const economyCalculationCache = new LRUCache<string, Decimal>(500);
const formatCache = new LRUCache<string, string>(300);

/**
 * Memoized power calculation with caching
 */
export function memoizedPow(base: any, exponent: number): Decimal {
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
): Decimal {
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
function binaryExponentiation(base: any, growthRate: any, exponent: number): Decimal {
  if (exponent === 0) {
    return DecimalOps.create(1);
  }

  let result = DecimalOps.create(1);
  let currentBase = DecimalOps.create(base);
  let currentGrowth = DecimalOps.create(growthRate);

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

  if (result !== undefined) {
    formatCache.set(key, result);
    return result;
  }
  return key;
}

/**
 * Batch calculation for multiple similar operations
 */
export function batchCalculateStrawSPD(
  strawsArray: any[],
  baseSPDArray: any[],
  widerStrawsArray: any[],
  widerMultiplierArray: any[]
): Decimal[] {
  return strawsArray.map((straws, index) => {
    const key = `strawSPD:${straws}:${baseSPDArray[index]}:${widerStrawsArray[index]}:${widerMultiplierArray[index]}`;

    let result = economyCalculationCache.get(key);
    if (result) {
      return result;
    }

    // Calculate straw SPD (simplified version for batch processing)
    // const strawCount = new LargeNumber(straws);
    const baseValue = DecimalOps.create(baseSPDArray[index]);
    const upgradeMultiplier = DecimalOps.create(1).add(
      DecimalOps.create(widerStrawsArray[index]).multiply(
        DecimalOps.create(widerMultiplierArray[index])
      )
    );

    result = baseValue.multiply(upgradeMultiplier);

    // Apply basic scaling for very large numbers
    if (result.gte(DecimalOps.create('1e100'))) {
      const excess = result.subtract(DecimalOps.create('1e100'));
      const scaledExcess = memoizedPow(DecimalOps.create('1.001'), excess.toNumber());
      result = DecimalOps.create('1e100').add(
        excess.multiply(DecimalOps.create('0.95')).multiply(scaledExcess)
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
): Decimal {
  const key = `synergy:${strawCount}:${cupCount}:${strawSPD}:${cupSPD}`;

  let result = economyCalculationCache.get(key);
  if (result) {
    return result;
  }

  const straws = DecimalOps.create(strawCount);
  const cups = DecimalOps.create(cupCount);
  const sSPD = DecimalOps.create(strawSPD);
  const cSPD = DecimalOps.create(cupSPD);

  // Calculate individual contributions
  const strawContribution = sSPD.multiply(straws);
  const cupContribution = cSPD.multiply(cups);

  // Optimized synergy calculation
  let synergyMultiplier = DecimalOps.create(1);
  if (straws.gte(DecimalOps.create('100')) && cups.gte(DecimalOps.create('100'))) {
    const strawRatio = straws.divide(DecimalOps.create('100'));
    const cupRatio = cups.divide(DecimalOps.create('100'));
    const synergyRatio = strawRatio.multiply(cupRatio);

    // Use more efficient calculation for synergy
    synergyMultiplier = synergyMultiplier.add(
      DecimalOps.create('1.1').multiply(
        memoizedPow(DecimalOps.create('0.999'), synergyRatio.toNumber())
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
  private metrics = new Map<
    string,
    { count: number; totalTime: number; maxTime: number; minTime: number }
  >();

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
        minTime: duration,
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
    formatCache: formatCache.size(),
  };
}

// Export performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();
