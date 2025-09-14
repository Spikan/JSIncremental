// UI Batching Service
// Provides efficient UI updates using requestAnimationFrame batching

import { logger } from './logger';

export interface UIUpdate {
  id: string;
  fn: () => void;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

class UIBatcher {
  private pendingUpdates = new Map<string, UIUpdate>();
  private rafId: number | null = null;
  private isDestroyed = false;
  private lastUpdateTime = 0;
  private readonly maxUpdateInterval = 16; // ~60fps

  /**
   * Schedule a UI update to be batched
   */
  schedule(id: string, fn: () => void, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    if (this.isDestroyed) {
      logger.warn('UIBatcher: Cannot schedule update - service is destroyed');
      return;
    }

    // Store the update (overwrites any existing update with same ID)
    this.pendingUpdates.set(id, {
      id,
      fn,
      priority,
      timestamp: performance.now(),
    });

    // Schedule RAF if not already scheduled
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Cancel a scheduled update
   */
  cancel(id: string): boolean {
    return this.pendingUpdates.delete(id);
  }

  /**
   * Cancel all pending updates
   */
  cancelAll(): number {
    const count = this.pendingUpdates.size;
    this.pendingUpdates.clear();
    return count;
  }

  /**
   * Force immediate execution of all pending updates
   */
  flush(): void {
    if (this.isDestroyed || this.pendingUpdates.size === 0) {
      this.rafId = null;
      return;
    }

    const now = performance.now();

    // Throttle updates to maintain performance
    if (now - this.lastUpdateTime < this.maxUpdateInterval) {
      this.rafId = requestAnimationFrame(() => this.flush());
      return;
    }

    this.lastUpdateTime = now;

    // Sort updates by priority and timestamp
    const updates = Array.from(this.pendingUpdates.values()).sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Execute updates
    let executed = 0;
    for (const update of updates) {
      try {
        update.fn();
        executed++;
      } catch (error) {
        logger.error(`UIBatcher: Error executing update ${update.id}:`, error);
      }
    }

    // Clear executed updates
    this.pendingUpdates.clear();
    this.rafId = null;

    logger.debug(`UIBatcher: Executed ${executed} UI updates`);
  }

  /**
   * Get pending update count
   */
  getPendingCount(): number {
    return this.pendingUpdates.size;
  }

  /**
   * Check if a specific update is pending
   */
  isPending(id: string): boolean {
    return this.pendingUpdates.has(id);
  }

  /**
   * Get pending update IDs
   */
  getPendingIds(): string[] {
    return Array.from(this.pendingUpdates.keys());
  }

  /**
   * Destroy the batcher and cancel all pending updates
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.pendingUpdates.clear();
    logger.debug('UIBatcher: Destroyed');
  }
}

// Export singleton instance
export const uiBatcher = new UIBatcher();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    uiBatcher.destroy();
  });
}
