// Performance optimization module for extreme number calculations
// Provides caching, memoization, and performance monitoring

import { Decimal } from '../numbers/migration-utils';

// Cache for expensive operations
const operationCache = new Map<string, any>();
const powCache = new Map<string, any>();
const formatCache = new Map<string, string>();

// Performance metrics
let operationCount = 0;
let cacheHits = 0;
let slowOperations = 0;

/**
 * Memoized power calculation with caching
 */
export function memoizedPow(base: any, exponent: number): any {
  operationCount++;

  // Create cache key
  const baseStr = typeof base === 'string' ? base : base.toString();
  const cacheKey = `pow_${baseStr}_${exponent}`;

  // Check cache first
  if (powCache.has(cacheKey)) {
    cacheHits++;
    return powCache.get(cacheKey);
  }

  // Perform calculation
  const startTime = performance.now();
  const result = new Decimal(base).pow(exponent);
  const duration = performance.now() - startTime;

  // Track slow operations
  if (duration > 10) {
    slowOperations++;
  }

  // Cache result
  powCache.set(cacheKey, result);

  return result;
}

/**
 * Memoized number formatting with caching
 */
export function memoizedFormat(value: any): string {
  operationCount++;

  const valueStr = value.toString();

  // Check cache first
  if (formatCache.has(valueStr)) {
    cacheHits++;
    const cached = formatCache.get(valueStr);
    if (cached !== undefined) {
      return cached;
    }
  }

  // Format the value
  let formatted: string;
  if (value instanceof Decimal) {
    const numValue = value.toNumber();
    // For very large numbers, preserve scientific notation
    if (typeof numValue === 'number' && isFinite(numValue) && Math.abs(numValue) < 1e15) {
      if (Math.abs(numValue) >= 1e6) {
        // Use scientific notation for large numbers
        formatted = numValue.toExponential();
      } else {
        // Use comma formatting for smaller numbers
        formatted = numValue.toLocaleString();
      }
    } else {
      formatted = value.toString();
    }
  } else {
    const numValue = Number(value);
    if (typeof numValue === 'number' && isFinite(numValue)) {
      if (Math.abs(numValue) >= 1e6) {
        // Use scientific notation for large numbers
        formatted = numValue.toExponential();
      } else {
        // Use comma formatting for smaller numbers
        formatted = numValue.toLocaleString();
      }
    } else {
      formatted = String(value);
    }
  }

  // Cache result
  formatCache.set(valueStr, formatted);

  return formatted;
}

/**
 * Cached exponential growth calculation
 */
export function cachedExponentialGrowth(baseValue: any, growthRate: any, time: number): any {
  operationCount++;

  const cacheKey = `exp_${baseValue}_${growthRate}_${time}`;

  // Check cache first
  if (operationCache.has(cacheKey)) {
    cacheHits++;
    return operationCache.get(cacheKey);
  }

  // Perform calculation
  const base = new Decimal(baseValue);
  const rate = new Decimal(growthRate);
  const result = base.mul(rate.pow(time));

  // Cache result
  operationCache.set(cacheKey, result);

  return result;
}

/**
 * Batch straw SPD calculation with optimization
 */
export function batchStrawSPDCalculation(inputs: any[] | any): any[] {
  operationCount++;

  // Handle array input
  if (Array.isArray(inputs)) {
    if (inputs.length === 0) {
      return [];
    }

    return inputs.map(input => {
      const straws = input.straws || input;
      const baseSPD = 0.6; // Default straw SPD
      const efficiency = input.efficiency || 1.0;

      const cacheKey = `straw_spd_${straws}_${baseSPD}_${efficiency}`;

      // Check cache first
      if (operationCache.has(cacheKey)) {
        cacheHits++;
        return operationCache.get(cacheKey);
      }

      // Perform calculation
      const strawsDec = new Decimal(straws);
      const baseSPDDec = new Decimal(baseSPD);
      const efficiencyDec = new Decimal(efficiency);

      // Calculate result with efficiency
      const result = strawsDec.mul(baseSPDDec).mul(efficiencyDec);

      // Cache result
      operationCache.set(cacheKey, result);

      return result;
    });
  }

  // Handle single value input
  const straws = inputs.straws || inputs;
  const baseSPD = 0.6; // Default straw SPD
  const efficiency = inputs.efficiency || 1.0;

  const cacheKey = `straw_spd_${straws}_${baseSPD}_${efficiency}`;

  // Check cache first
  if (operationCache.has(cacheKey)) {
    cacheHits++;
    return [operationCache.get(cacheKey)];
  }

  // Perform calculation
  const strawsDec = new Decimal(straws);
  const baseSPDDec = new Decimal(baseSPD);
  const efficiencyDec = new Decimal(efficiency);

  // Calculate result with efficiency
  const result = strawsDec.mul(baseSPDDec).mul(efficiencyDec);

  // Cache result
  operationCache.set(cacheKey, result);

  return [result];
}

/**
 * Optimized synergy calculation
 */
export function optimizedSynergyCalculation(
  straws: any,
  cups: any,
  strawSPD: any,
  cupSPD: any
): any {
  operationCount++;

  const cacheKey = `synergy_${straws}_${cups}_${strawSPD}_${cupSPD}`;

  // Check cache first
  if (operationCache.has(cacheKey)) {
    cacheHits++;
    return operationCache.get(cacheKey);
  }

  // Perform calculation
  const strawsDec = new Decimal(straws);
  const cupsDec = new Decimal(cups);
  const strawSPDDec = new Decimal(strawSPD);
  const cupSPDDec = new Decimal(cupSPD);

  // Calculate synergy bonus (straws and cups work together)
  const synergyBonus = strawsDec.mul(cupsDec).div(1000);
  // Use Math.min since our MockDecimal doesn't have min method
  const cappedBonus = Math.min(
    Math.abs(synergyBonus.toNumber()) < 1e15 ? synergyBonus.toNumber() : 0, 
    0.5
  );
  const synergyMultiplier = new Decimal(1).add(cappedBonus);

  const totalSPD = strawsDec.mul(strawSPDDec).add(cupsDec.mul(cupSPDDec));
  const result = totalSPD.mul(synergyMultiplier);

  // Cache result
  operationCache.set(cacheKey, result);

  return result;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): any {
  const totalCacheSize = operationCache.size + powCache.size + formatCache.size;
  const hitRate = operationCount > 0 ? (cacheHits / operationCount) * 100 : 0;

  return {
    operation: {
      total: operationCount,
      hitCount: cacheHits,
      missCount: operationCount - cacheHits,
      hitRate: hitRate.toFixed(1),
    },
    pow: {
      total: powCache.size,
      hitCount: cacheHits,
      missCount: operationCount - cacheHits,
    },
    format: {
      total: formatCache.size,
      hitCount: cacheHits,
      missCount: operationCount - cacheHits,
    },
    exponential: {
      total: operationCache.size,
      hitCount: cacheHits,
      missCount: operationCount - cacheHits,
    },
    overall: {
      totalCacheSize,
      hitRate: hitRate.toFixed(1),
      slowOperations,
    },
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  operationCache.clear();
  powCache.clear();
  formatCache.clear();
  operationCount = 0;
  cacheHits = 0;
  slowOperations = 0;
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(): any {
  return {
    operationCount,
    cacheHits,
    cacheMisses: operationCount - cacheHits,
    hitRate: operationCount > 0 ? (cacheHits / operationCount) * 100 : 0,
    slowOperations,
    cacheSizes: {
      operations: operationCache.size,
      pow: powCache.size,
      format: formatCache.size,
    },
  };
}
