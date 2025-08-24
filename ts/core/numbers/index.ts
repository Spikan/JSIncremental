// Numbers module - unified interface for large number handling
// Exports all number-related utilities and classes

export { LargeNumber } from './large-number';
export * from './migration-utils';
export { NativeNumber } from './native-number';

// Re-export for convenience
export type { LargeNumberLike, NumericOperations } from '../../../types/global';

// Import migration utilities for the Numbers object
import {
  toLargeNumber,
  toNumber,
  formatLargeNumber,
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
} from './migration-utils';

// Create a default instance for global use
export const Numbers = {
  // LargeNumber,
  // Migration utilities
  toLargeNumber,
  toNumber,
  formatLargeNumber,
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
};

// Make available globally for backward compatibility
if (typeof window !== 'undefined') {
  (window as any).Numbers = Numbers;
}
