// Service Locator Pattern - Modern Dependency Management
// This provides a clean way to manage dependencies without global pollution

type ServiceKey = string;
type ServiceValue = any;

class ServiceLocator {
  private static services = new Map<ServiceKey, ServiceValue>();
  private static factories = new Map<ServiceKey, () => ServiceValue>();

  /**
   * Register a service instance
   */
  static register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  /**
   * Register a service factory (lazy initialization)
   */
  static registerFactory<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  /**
   * Get a service by key
   */
  static get<T>(key: string): T {
    // First check if we have a direct instance
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    // Then check if we have a factory
    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const service = factory();
      this.services.set(key, service); // Cache the instance
      return service as T;
    }

    throw new Error(`Service '${key}' not found. Make sure it's registered.`);
  }

  /**
   * Check if a service is registered
   */
  static has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  /**
   * Clear all services (useful for testing)
   */
  static clear(): void {
    this.services.clear();
    this.factories.clear();
  }

  /**
   * Get all registered service keys
   */
  static getRegisteredKeys(): string[] {
    return [...Array.from(this.services.keys()), ...Array.from(this.factories.keys())];
  }
}

export { ServiceLocator };

// Convenience functions for common services
export const getApp = () => ServiceLocator.get('App');
export const getGameConfig = () => ServiceLocator.get('GameConfig');
export const getDecimal = () => ServiceLocator.get('Decimal');

// Service keys as constants
export const SERVICE_KEYS = {
  APP: 'App',
  GAME_CONFIG: 'GameConfig',
  DECIMAL: 'Decimal',
  STORE: 'Store',
  LOGGER: 'Logger',
} as const;
