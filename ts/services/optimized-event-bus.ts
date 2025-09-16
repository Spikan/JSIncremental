// Optimized Event System with Better Typing and Performance
// Replaces the basic event bus with a more efficient implementation

import { logger } from './logger';

// Define event types with proper payloads
export interface GameEvents {
  'game:loaded': { timestamp: number };
  'game:saved': { timestamp: number; saveData?: any };
  'game:deleted': { timestamp: number };
  'game:tick': { deltaTime: number; timestamp: number };
}

export interface ClickEvents {
  'click:soda': {
    gained: any; // Decimal or number
    critical: boolean;
    clickX: number;
    clickY: number;
    timestamp: number;
  };
  'click:critical': {
    gained: any;
    clickX: number;
    clickY: number;
    timestamp: number;
  };
}

export interface EconomyEvents {
  'economy:sips_gained': {
    amount: any; // Decimal or number
    source: string;
    timestamp: number;
  };
  'economy:purchase': {
    item: string;
    cost: any; // Decimal or number
    quantity: number;
    timestamp: number;
  };
  'economy:upgrade_purchased': {
    upgrade: string;
    level: number;
    cost: any;
    timestamp: number;
  };
}

export interface FeatureEvents {
  'feature:unlocked': {
    feature: string;
    timestamp: number;
  };
}

export interface UIEvents {
  'ui:tab_switched': {
    tab: string;
    timestamp: number;
  };
  'ui:display_updated': {
    component: string;
    timestamp: number;
  };
}

// Combined event map
export type AppEventMap = GameEvents & ClickEvents & EconomyEvents & FeatureEvents & UIEvents;

// Event handler type
export type EventHandler<T = any> = (payload: T) => void;

// Event listener entry
interface EventListener<T = any> {
  handler: EventHandler<T>;
  once: boolean;
  priority: number;
  id: string;
}

// Optimized Event Bus
export class OptimizedEventBus {
  private listeners = new Map<keyof AppEventMap, EventListener[]>();
  private nextId = 1;
  private isDestroyed = false;
  private emitQueue: Array<{ event: keyof AppEventMap; payload: any }> = [];
  private isProcessing = false;

  /**
   * Subscribe to an event
   */
  on<K extends keyof AppEventMap>(
    event: K,
    handler: EventHandler<AppEventMap[K]>,
    options: { once?: boolean; priority?: number } = {}
  ): string {
    if (this.isDestroyed) {
      logger.warn('EventBus: Cannot subscribe - bus is destroyed');
      return '';
    }

    const id = `listener_${this.nextId++}`;
    const listener: EventListener<AppEventMap[K]> = {
      handler: handler as EventHandler,
      once: options.once || false,
      priority: options.priority || 0,
      id,
    };

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.push(listener);

    // Sort by priority (higher priority first)
    eventListeners.sort((a, b) => b.priority - a.priority);

    logger.debug(`EventBus: Subscribed to ${String(event)} with ID ${id}`);
    return id;
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof AppEventMap>(
    event: K,
    handler: EventHandler<AppEventMap[K]>,
    priority = 0
  ): string {
    return this.on(event, handler, { once: true, priority });
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof AppEventMap>(event: K, id: string): boolean {
    if (this.isDestroyed) return false;

    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return false;

    const index = eventListeners.findIndex(listener => listener.id === id);
    if (index === -1) return false;

    eventListeners.splice(index, 1);
    logger.debug(`EventBus: Unsubscribed from ${String(event)} with ID ${id}`);
    return true;
  }

  /**
   * Emit an event (with batching for performance)
   */
  emit<K extends keyof AppEventMap>(event: K, payload: AppEventMap[K]): void {
    if (this.isDestroyed) return;

    // Add to queue for batching
    this.emitQueue.push({ event, payload });

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processEmitQueue();
    }
  }

  /**
   * Process the emit queue (batched for performance)
   */
  private processEmitQueue(): void {
    if (this.isProcessing || this.emitQueue.length === 0) return;

    this.isProcessing = true;

    // Process all queued events
    while (this.emitQueue.length > 0) {
      const { event, payload } = this.emitQueue.shift()!;
      this.processEvent(event, payload);
    }

    this.isProcessing = false;
  }

  /**
   * Process a single event
   */
  private processEvent<K extends keyof AppEventMap>(event: K, payload: AppEventMap[K]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.length === 0) return;

    // Create a copy to avoid issues with listeners modifying the array
    const listeners = [...eventListeners];
    const toRemove: string[] = [];

    for (const listener of listeners) {
      try {
        listener.handler(payload);

        // Remove if it's a once listener
        if (listener.once) {
          toRemove.push(listener.id);
        }
      } catch (error) {
        logger.error(`EventBus: Error in handler for ${String(event)}:`, error);
      }
    }

    // Remove once listeners
    for (const id of toRemove) {
      this.off(event, id);
    }
  }

  /**
   * Get listener count for an event
   */
  getListenerCount<K extends keyof AppEventMap>(event: K): number {
    return this.listeners.get(event)?.length || 0;
  }

  /**
   * Get all event names with listeners
   */
  getActiveEvents(): (keyof AppEventMap)[] {
    return Array.from(this.listeners.keys()).filter(event => this.listeners.get(event)!.length > 0);
  }

  /**
   * Clear all listeners for an event
   */
  clearEvent<K extends keyof AppEventMap>(event: K): number {
    const count = this.getListenerCount(event);
    this.listeners.set(event, []);
    logger.debug(`EventBus: Cleared ${count} listeners for ${String(event)}`);
    return count;
  }

  /**
   * Clear all listeners
   */
  clearAll(): number {
    let totalCount = 0;
    for (const event of this.listeners.keys()) {
      totalCount += this.clearEvent(event);
    }
    logger.debug(`EventBus: Cleared ${totalCount} total listeners`);
    return totalCount;
  }

  /**
   * Destroy the event bus
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.clearAll();
    this.emitQueue = [];
    logger.debug('EventBus: Destroyed');
  }
}

// Create and export the optimized event bus
export const optimizedEventBus = new OptimizedEventBus();

// Legacy compatibility - expose on window for existing code
if (typeof window !== 'undefined') {
  try {
    // Modernized - App object initialization handled elsewhere
    // Modernized - App object handled by store
    // Modernized - App object handled by store
    (window as any).App = (window as any).App || {};
    (window as any).App.events = optimizedEventBus;
  } catch (error) {
    logger.warn('Failed to expose optimized event bus globally:', error);
  }
}
