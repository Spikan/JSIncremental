// Modern DOM Query Service
// Replaces manual DOM caching with efficient query patterns

export interface DOMQueryOptions {
  cache?: boolean;
  timeout?: number;
  retries?: number;
}

class DOMQueryService {
  private cache = new Map<string, HTMLElement | null>();
  private queryTimeouts = new Map<string, number>();
  private isDestroyed = false;

  /**
   * Query DOM element with optional caching and retry logic
   */
  query<T extends HTMLElement = HTMLElement>(
    selector: string,
    options: DOMQueryOptions = {}
  ): T | null {
    if (this.isDestroyed) {
      console.warn('DOMQueryService: Cannot query - service is destroyed');
      return null;
    }

    const { cache = true, timeout = 1000, retries = 3 } = options;

    // Check cache first
    if (cache && this.cache.has(selector)) {
      return this.cache.get(selector) as T | null;
    }

    // Query element
    const element = document.querySelector(selector) as T | null;

    // Cache result if caching is enabled
    if (cache) {
      this.cache.set(selector, element);
    }

    // If element not found and retries > 0, retry after timeout
    if (!element && retries > 0) {
      const retryId = window.setTimeout(() => {
        this.query(selector, { ...options, retries: retries - 1 });
        this.queryTimeouts.delete(selector);
      }, timeout);

      this.queryTimeouts.set(selector, retryId);
    }

    return element;
  }

  /**
   * Query multiple elements
   */
  queryAll<T extends HTMLElement = HTMLElement>(
    selector: string,
    _options: DOMQueryOptions = {}
  ): NodeListOf<T> {
    if (this.isDestroyed) {
      console.warn('DOMQueryService: Cannot query all - service is destroyed');
      return document.querySelectorAll('') as NodeListOf<T>;
    }

    return document.querySelectorAll(selector) as NodeListOf<T>;
  }

  /**
   * Get element by ID with caching
   */
  getById<T extends HTMLElement = HTMLElement>(
    id: string,
    options: DOMQueryOptions = {}
  ): T | null {
    return this.query<T>(`#${id}`, options);
  }

  /**
   * Get element by class with caching
   */
  getByClass<T extends HTMLElement = HTMLElement>(
    className: string,
    options: DOMQueryOptions = {}
  ): T | null {
    return this.query<T>(`.${className}`, options);
  }

  /**
   * Get element by data attribute
   */
  getByDataAttribute<T extends HTMLElement = HTMLElement>(
    attribute: string,
    value: string,
    options: DOMQueryOptions = {}
  ): T | null {
    return this.query<T>(`[data-${attribute}="${value}"]`, options);
  }

  /**
   * Wait for element to appear in DOM
   */
  waitForElement<T extends HTMLElement = HTMLElement>(
    selector: string,
    timeout: number = 5000
  ): Promise<T | null> {
    return new Promise(resolve => {
      const element = this.query<T>(selector, { cache: false });
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = this.query<T>(selector, { cache: false });
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Clear cache for specific selector
   */
  clearCache(selector?: string): void {
    if (selector) {
      this.cache.delete(selector);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clear all timeouts
   */
  clearTimeouts(): void {
    for (const timeoutId of this.queryTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.queryTimeouts.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Check if element exists in DOM
   */
  exists(selector: string): boolean {
    return this.query(selector, { cache: false }) !== null;
  }

  /**
   * Get all cached elements
   */
  getCachedElements(): Map<string, HTMLElement | null> {
    return new Map(this.cache);
  }

  /**
   * Destroy the service and clean up
   */
  destroy(): void {
    this.clearTimeouts();
    this.cache.clear();
    this.isDestroyed = true;
  }
}

// Create singleton instance
export const domQuery = new DOMQueryService();

// Export convenience functions
export const query = domQuery.query.bind(domQuery);
export const queryAll = domQuery.queryAll.bind(domQuery);
export const getById = domQuery.getById.bind(domQuery);
export const getByClass = domQuery.getByClass.bind(domQuery);
export const getByDataAttribute = domQuery.getByDataAttribute.bind(domQuery);
export const waitForElement = domQuery.waitForElement.bind(domQuery);

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).domQuery = domQuery;
  (window as any).query = query;
  (window as any).getById = getById;
  (window as any).getByClass = getByClass;
}

// Cleanup on page unload
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    domQuery.destroy();
  });
}

export default domQuery;
