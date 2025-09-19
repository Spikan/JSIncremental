// Subscription Manager for UI Components (TypeScript)
// Centralized subscription management to prevent memory leaks

import { errorHandler } from '../core/error-handling/error-handler';

type SubscriptionCleanup = () => void;

interface SubscriptionEntry {
  cleanup: SubscriptionCleanup;
  name: string;
  created: number;
}

class SubscriptionManager {
  private subscriptions = new Map<string, SubscriptionEntry>();
  private isDestroyed = false;

  /**
   * Register a subscription with automatic cleanup
   */
  register(key: string, cleanup: SubscriptionCleanup, name?: string): void {
    if (this.isDestroyed) {
      console.warn(
        `SubscriptionManager: Cannot register subscription '${key}' - manager is destroyed`
      );
      return;
    }

    // Clean up existing subscription if any
    this.unregister(key);

    this.subscriptions.set(key, {
      cleanup,
      name: name || key,
      created: Date.now(),
    });
  }

  /**
   * Unregister and cleanup a specific subscription
   */
  unregister(key: string): boolean {
    const entry = this.subscriptions.get(key);
    if (entry) {
      try {
        entry.cleanup();
      } catch (error) {
        errorHandler.handleError(error, 'cleanupSubscription', {
          key,
          subscriptionName: entry.name,
        });
      }
      this.subscriptions.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Check if a subscription is registered
   */
  has(key: string): boolean {
    return this.subscriptions.has(key);
  }

  /**
   * Get information about a subscription
   */
  getInfo(key: string): { name: string; age: number } | null {
    const entry = this.subscriptions.get(key);
    if (entry) {
      return {
        name: entry.name,
        age: Date.now() - entry.created,
      };
    }
    return null;
  }

  /**
   * Get all registered subscription keys
   */
  getKeys(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Clean up all subscriptions
   */
  destroyAll(): void {
    const keys = Array.from(this.subscriptions.keys());
    let cleanedCount = 0;

    for (const key of keys) {
      if (this.unregister(key)) {
        cleanedCount++;
      }
    }

    this.isDestroyed = true;
    console.log(`SubscriptionManager: Cleaned up ${cleanedCount} subscriptions`);
  }

  /**
   * Get statistics about active subscriptions
   */
  getStats(): { count: number; oldestAge: number; averageAge: number } {
    const entries = Array.from(this.subscriptions.values());
    const now = Date.now();

    if (entries.length === 0) {
      return { count: 0, oldestAge: 0, averageAge: 0 };
    }

    const ages = entries.map(entry => now - entry.created);
    const oldestAge = Math.max(...ages);
    const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;

    return {
      count: entries.length,
      oldestAge,
      averageAge,
    };
  }

  /**
   * Debug: Log all active subscriptions
   */
  debug(): void {
    console.log('SubscriptionManager Debug:');
    console.log('Active subscriptions:', this.subscriptions.size);

    for (const [key, entry] of this.subscriptions) {
      const age = Date.now() - entry.created;
      console.log(`  ${key} (${entry.name}): ${age}ms old`);
    }
  }
}

// Create global subscription manager
const subscriptionManager = new SubscriptionManager();

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).subscriptionManager = subscriptionManager;
}

// Cleanup on page unload
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    subscriptionManager.destroyAll();
  });
}

export default subscriptionManager;
export type { SubscriptionCleanup };
