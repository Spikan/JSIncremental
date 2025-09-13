// 🚀 DIRECT BREAK_ETERNITY.JS ACCESS - MAXIMUM PERFORMANCE, ZERO WRAPPER
//
// PROJECT-WIDE MEMORY: SPD, SPS, AND ALL PURCHASE COSTS MUST USE BREAK_ETERNITY
// PROJECT-WIDE MEMORY: EXTREMELY LARGE VALUES ARE THE INTENDED RESULT OF GAMEPLAY
// MEMORY: NEVER CONVERT CORE GAME VALUES TO JAVASCRIPT NUMBERS
// MEMORY: PRESERVE FULL DECIMAL PRECISION THROUGHOUT ENTIRE PIPELINE
//
// DIRECT BREAK_ETERNITY USAGE:
// 1. new Decimal(value) - Create Decimal objects
// 2. decimal.add(other) - Direct arithmetic operations
// 3. decimal.toString() - Convert to string to preserve extreme values
// 4. isDecimal(value) - Type checking

// Direct break_eternity.js access - Decimal imported from migration-utils.ts
export { formatDecimal } from './decimal-utils';
export * from './migration-utils';

// Export safe conversion utilities
export * from './safe-conversion';

// Export error recovery utilities
export * from './error-recovery';

// Export memory optimization utilities
export * from './memory-optimization';

// Export advanced caching utilities
export * from './advanced-caching';

// Export performance tuning utilities
export * from './performance-tuning';

// Explicitly export Decimal for files that need it directly
export { Decimal } from './migration-utils';

// Import isDecimal separately since it's used in the Numbers object
import { isDecimal } from './decimal-utils';

// Import required functions
import {
  toDecimal,
  formatDecimal as migrationFormatDecimal,
  gte,
  gt,
  lte,
  lt,
  eq,
  add,
  subtract,
  multiply,
  divide,
  pow,
  toLargeNumber,
  isLargeNumber,
} from './migration-utils';

// Import additional functions from large-number.ts
import { toNumber, formatLargeNumber } from './large-number';

// Import safe conversion utilities
import {
  safeToNumber,
  safeToString,
  isExtremeValue,
  safeFormat,
  safeGte,
  safeAdd,
  safeMultiply,
  safeDivide,
  isValidDecimalString,
  getMagnitudeDescription,
} from './safe-conversion';

// Import error recovery utilities
import {
  DecimalErrorRecovery,
  ExtremeValueMonitor,
  setupGlobalErrorHandling,
} from './error-recovery';

// Import memory optimization utilities
import {
  MemoryOptimizer,
  MemoryAwareCache,
  PerformanceOptimizer,
  setupMemoryOptimization,
  memoryOptimizer,
  performanceOptimizer,
  decimalMemoryPool,
} from './memory-optimization';

// Import advanced caching utilities
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
} from './advanced-caching';

// Import performance tuning utilities
import {
  PerformanceTuner,
  OptimizedOperations,
  PerformanceDashboard,
  setupPerformanceOptimization,
  performanceTuner,
  optimizedOperations,
  performanceDashboard,
} from './performance-tuning';

// Decimal is available from migration-utils.ts export

// Create a unified interface for global use
export const Numbers = {
  // Direct Decimal operations - Decimal available from migration-utils.ts
  Decimal,
  isDecimal,

  // Migration utilities (with legacy aliases)
  toDecimal,
  formatDecimal: migrationFormatDecimal,

  // Comparison utilities
  gte,
  gt,
  lte,
  lt,
  eq,

  // Arithmetic utilities
  add,
  subtract,
  multiply,
  divide,
  pow,

  // Safe conversion utilities
  safeToNumber,
  safeToString,
  isExtremeValue,
  safeFormat,
  safeGte,
  safeAdd,
  safeMultiply,
  safeDivide,
  isValidDecimalString,
  getMagnitudeDescription,

  // Error recovery utilities
  DecimalErrorRecovery,
  ExtremeValueMonitor,
  setupGlobalErrorHandling,

  // Memory optimization utilities
  MemoryOptimizer,
  MemoryAwareCache,
  PerformanceOptimizer,
  setupMemoryOptimization,
  memoryOptimizer,
  performanceOptimizer,
  decimalMemoryPool,

  // Advanced caching utilities
  PredictiveCache,
  AdaptiveCache,
  DecimalOperationCache,
  BatchOptimizer,
  CacheManager,
  predictiveCache,
  decimalOperationCache,
  batchOptimizer,
  cacheManager,

  // Performance tuning utilities
  PerformanceTuner,
  OptimizedOperations,
  PerformanceDashboard,
  setupPerformanceOptimization,
  performanceTuner,
  optimizedOperations,
  performanceDashboard,

  // Legacy aliases
  toLargeNumber,
  isLargeNumber,

  // Additional utility functions
  toNumber,
  formatLargeNumber,
};

// Make available globally for backward compatibility
if (typeof window !== 'undefined') {
  (window as any).Numbers = Numbers;

  // Also export safe conversion utilities globally for easy access
  (window as any).SafeDecimal = {
    safeToNumber,
    safeToString,
    isExtremeValue,
    safeFormat,
    safeGte,
    safeAdd,
    safeMultiply,
    safeDivide,
    isValidDecimalString,
    getMagnitudeDescription,
  };

  // Export optimization utilities globally
  (window as any).DecimalOptimizer = {
    // Memory optimization
    memoryOptimizer,
    performanceOptimizer,
    decimalMemoryPool,

    // Advanced caching
    predictiveCache,
    decimalOperationCache,
    batchOptimizer,
    cacheManager,

    // Performance tuning
    performanceTuner,
    optimizedOperations,
    performanceDashboard,

    // Setup functions
    setupMemoryOptimization,
    setupPerformanceOptimization,
    setupGlobalErrorHandling,
  };
}
