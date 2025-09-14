// Timer Management Service
// Centralized timer cleanup to prevent memory leaks

export interface TimerEntry {
  id: string;
  type: 'timeout' | 'interval';
  timerId: number;
  callback: () => void;
  createdAt: number;
  description: string | undefined;
}

class TimerManager {
  private timers = new Map<string, TimerEntry>();
  private nextId = 1;
  private isDestroyed = false;

  /**
   * Create a timeout with automatic cleanup tracking
   */
  setTimeout(callback: () => void, delay: number, description?: string): string {
    if (this.isDestroyed) {
      console.warn('TimerManager: Cannot create timeout - manager is destroyed');
      return '';
    }

    const id = `timeout_${this.nextId++}`;
    const timerId = window.setTimeout(() => {
      this.timers.delete(id);
      callback();
    }, delay);

    this.timers.set(id, {
      id,
      type: 'timeout',
      timerId,
      callback,
      createdAt: Date.now(),
      description,
    });

    return id;
  }

  /**
   * Create an interval with automatic cleanup tracking
   */
  setInterval(callback: () => void, interval: number, description?: string): string {
    if (this.isDestroyed) {
      console.warn('TimerManager: Cannot create interval - manager is destroyed');
      return '';
    }

    const id = `interval_${this.nextId++}`;
    const timerId = window.setInterval(callback, interval);

    this.timers.set(id, {
      id,
      type: 'interval',
      timerId,
      callback,
      createdAt: Date.now(),
      description,
    });

    return id;
  }

  /**
   * Clear a specific timer
   */
  clearTimer(id: string): boolean {
    const entry = this.timers.get(id);
    if (!entry) {
      return false;
    }

    if (entry.type === 'timeout') {
      clearTimeout(entry.timerId);
    } else {
      clearInterval(entry.timerId);
    }

    this.timers.delete(id);
    return true;
  }

  /**
   * Clear all timers of a specific type
   */
  clearTimersByType(type: 'timeout' | 'interval'): number {
    let cleared = 0;
    const toDelete: string[] = [];

    for (const [timerId, entry] of this.timers) {
      if (entry.type === type) {
        if (type === 'timeout') {
          clearTimeout(entry.timerId);
        } else {
          clearInterval(entry.timerId);
        }
        toDelete.push(timerId);
        cleared++;
      }
    }

    toDelete.forEach(id => this.timers.delete(id));
    return cleared;
  }

  /**
   * Clear all timers
   */
  clearAllTimers(): number {
    let cleared = 0;

    for (const [, entry] of this.timers) {
      if (entry.type === 'timeout') {
        clearTimeout(entry.timerId);
      } else {
        clearInterval(entry.timerId);
      }
      cleared++;
    }

    this.timers.clear();
    return cleared;
  }

  /**
   * Get all active timers
   */
  getActiveTimers(): TimerEntry[] {
    return Array.from(this.timers.values());
  }

  /**
   * Get timer count by type
   */
  getTimerCounts(): { timeouts: number; intervals: number; total: number } {
    let timeouts = 0;
    let intervals = 0;

    for (const entry of this.timers.values()) {
      if (entry.type === 'timeout') {
        timeouts++;
      } else {
        intervals++;
      }
    }

    return {
      timeouts,
      intervals,
      total: timeouts + intervals,
    };
  }

  /**
   * Check if a timer exists
   */
  hasTimer(id: string): boolean {
    return this.timers.has(id);
  }

  /**
   * Get timer information
   */
  getTimer(id: string): TimerEntry | undefined {
    return this.timers.get(id);
  }

  /**
   * Clean up old timers (older than specified age)
   */
  cleanupOldTimers(maxAge: number = 300000): number {
    // 5 minutes default
    const now = Date.now();
    const toDelete: string[] = [];
    let cleaned = 0;

    for (const [id, entry] of this.timers) {
      if (now - entry.createdAt > maxAge) {
        if (entry.type === 'timeout') {
          clearTimeout(entry.timerId);
        } else {
          clearInterval(entry.timerId);
        }
        toDelete.push(id);
        cleaned++;
      }
    }

    toDelete.forEach(id => this.timers.delete(id));
    return cleaned;
  }

  /**
   * Destroy the timer manager and clear all timers
   */
  destroy(): void {
    const cleared = this.clearAllTimers();
    this.isDestroyed = true;
    console.log(`TimerManager: Destroyed and cleared ${cleared} timers`);
  }

  /**
   * Debug: Log all active timers
   */
  debug(): void {
    console.log('TimerManager Debug:');
    console.log(`Active timers: ${this.timers.size}`);

    for (const entry of this.timers.values()) {
      const age = Date.now() - entry.createdAt;
      console.log(
        `  ${entry.id} (${entry.type}): ${age}ms old${entry.description ? ` - ${entry.description}` : ''}`
      );
    }
  }
}

// Create singleton instance
export const timerManager = new TimerManager();

// Export convenience functions
export const createTimeout = timerManager.setTimeout.bind(timerManager);
export const createInterval = timerManager.setInterval.bind(timerManager);
export const clearTimer = timerManager.clearTimer.bind(timerManager);
export const clearAllTimers = timerManager.clearAllTimers.bind(timerManager);

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).timerManager = timerManager;
  (window as any).createTimeout = createTimeout;
  (window as any).createInterval = createInterval;
  (window as any).clearTimer = clearTimer;
  (window as any).clearAllTimers = clearAllTimers;
}

// Cleanup on page unload
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    timerManager.destroy();
  });
}

export default timerManager;
