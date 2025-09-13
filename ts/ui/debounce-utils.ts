// Debouncing utilities for UI performance optimization (TypeScript)

type DebounceCallback = (...args: any[]) => void;

interface DebounceEntry {
  callback: DebounceCallback;
  timeout: NodeJS.Timeout | number | null;
  lastCall: number;
  callCount: number;
}

class DebounceManager {
  private debounceMap = new Map<string, DebounceEntry>();
  private isDestroyed = false;

  /**
   * Create a debounced function with automatic cleanup
   */
  debounce(
    key: string,
    callback: DebounceCallback,
    delay: number,
    options: {
      leading?: boolean; // Call on leading edge
      trailing?: boolean; // Call on trailing edge (default: true)
      maxWait?: number; // Maximum time to wait before forcing execution
    } = {}
  ): DebounceCallback {
    if (this.isDestroyed) {
      console.warn(
        `DebounceManager: Cannot create debounced function '${key}' - manager is destroyed`
      );
      return callback;
    }

    const { leading = false, trailing = true, maxWait } = options;

    // Clean up existing entry if any
    this.cancel(key);

    let entry: DebounceEntry = {
      callback,
      timeout: null,
      lastCall: 0,
      callCount: 0,
    };

    this.debounceMap.set(key, entry);

    return (...args: any[]) => {
      const now = Date.now();
      const timeSinceLastCall = now - entry.lastCall;
      entry.callCount++;

      // Clear existing timeout
      if (entry.timeout) {
        clearTimeout(entry.timeout as any);
        entry.timeout = null;
      }

      // Leading edge execution
      if (leading && entry.lastCall === 0) {
        entry.lastCall = now;
        callback(...args);
        return;
      }

      // Force execution if maxWait exceeded
      if (maxWait && entry.lastCall > 0 && timeSinceLastCall >= maxWait) {
        entry.lastCall = now;
        callback(...args);
        return;
      }

      // Schedule trailing execution
      if (trailing) {
        entry.timeout = setTimeout(() => {
          entry.lastCall = now;
          entry.timeout = null;
          callback(...args);
        }, delay);
      }
    };
  }

  /**
   * Create a throttled function (executes at most once per interval)
   */
  throttle(
    key: string,
    callback: DebounceCallback,
    interval: number,
    options: {
      leading?: boolean; // Call on leading edge (default: true)
      trailing?: boolean; // Call on trailing edge
    } = {}
  ): DebounceCallback {
    if (this.isDestroyed) {
      console.warn(
        `DebounceManager: Cannot create throttled function '${key}' - manager is destroyed`
      );
      return callback;
    }

    const { leading = true, trailing = false } = options;

    // Clean up existing entry if any
    this.cancel(key);

    let entry: DebounceEntry = {
      callback,
      timeout: null,
      lastCall: 0,
      callCount: 0,
    };

    this.debounceMap.set(key, entry);

    return (...args: any[]) => {
      const now = Date.now();
      const timeSinceLastCall = now - entry.lastCall;
      entry.callCount++;

      // Leading edge execution
      if (leading && timeSinceLastCall >= interval) {
        entry.lastCall = now;
        callback(...args);
        return;
      }

      // Trailing edge execution
      if (trailing && !entry.timeout) {
        const remainingTime = interval - timeSinceLastCall;
        if (remainingTime <= 0) {
          entry.lastCall = now;
          callback(...args);
        } else {
          entry.timeout = setTimeout(() => {
            entry.lastCall = Date.now();
            entry.timeout = null;
            callback(...args);
          }, remainingTime);
        }
      }
    };
  }

  /**
   * Cancel a debounced/throttled function
   */
  cancel(key: string): boolean {
    const entry = this.debounceMap.get(key);
    if (entry) {
      if (entry.timeout) {
        clearTimeout(entry.timeout as any);
      }
      this.debounceMap.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Check if a function is registered
   */
  has(key: string): boolean {
    return this.debounceMap.has(key);
  }

  /**
   * Get statistics about a debounced function
   */
  getStats(key: string): { callCount: number; lastCall: number; isPending: boolean } | null {
    const entry = this.debounceMap.get(key);
    if (entry) {
      return {
        callCount: entry.callCount,
        lastCall: entry.lastCall,
        isPending: entry.timeout !== null,
      };
    }
    return null;
  }

  /**
   * Get all registered function keys
   */
  getKeys(): string[] {
    return Array.from(this.debounceMap.keys());
  }

  /**
   * Clean up all debounced functions
   */
  destroyAll(): void {
    const keys = Array.from(this.debounceMap.keys());
    let canceledCount = 0;

    for (const key of keys) {
      if (this.cancel(key)) {
        canceledCount++;
      }
    }

    this.isDestroyed = true;
    console.log(`DebounceManager: Canceled ${canceledCount} debounced functions`);
  }

  /**
   * Debug: Log all active debounced functions
   */
  debug(): void {
    console.log('DebounceManager Debug:');
    console.log('Active functions:', this.debounceMap.size);

    for (const [key, entry] of this.debounceMap) {
      const timeSinceLastCall = Date.now() - entry.lastCall;
      console.log(
        `  ${key}: ${entry.callCount} calls, last ${timeSinceLastCall}ms ago, pending: ${entry.timeout !== null}`
      );
    }
  }
}

// Create global debounce manager
const debounceManager = new DebounceManager();

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).debounceManager = debounceManager;
}

// Cleanup on page unload
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    debounceManager.destroyAll();
  });
}

export default debounceManager;
export type { DebounceCallback };

// Convenience functions for common use cases
export const debounce = (key: string, callback: DebounceCallback, delay: number) =>
  debounceManager.debounce(key, callback, delay);

export const throttle = (key: string, callback: DebounceCallback, interval: number) =>
  debounceManager.throttle(key, callback, interval);

export const cancelDebounce = (key: string) => debounceManager.cancel(key);
