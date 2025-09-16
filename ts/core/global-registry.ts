// Global Registry - Centralized access to game objects
// This prevents circular dependencies and timing issues in production builds

export interface GlobalRegistry {
  App?: any;
  GAME_CONFIG?: any;
  sips?: any;
  sipsPerDrink?: any;
  drinkRate?: number;
  lastDrinkTime?: number;
  spd?: any;
  totalSipsEarned?: any;
  highestSipsPerSecond?: any;
  __lastAutosaveClockMs?: number;
}

class GlobalRegistryManager {
  private registry: GlobalRegistry = {};

  // Register global objects
  register(key: keyof GlobalRegistry, value: any) {
    this.registry[key] = value;
  }

  // Get global object
  get<T = any>(key: keyof GlobalRegistry): T | undefined {
    return this.registry[key] as T;
  }

  // Get with fallback
  getWithFallback<T = any>(key: keyof GlobalRegistry, fallback: T): T {
    return (this.registry[key] as T) ?? fallback;
  }

  // Check if registry is ready
  isReady(): boolean {
    return !!(this.registry.App && this.registry.GAME_CONFIG);
  }

  // Get all registry data
  getAll(): GlobalRegistry {
    return { ...this.registry };
  }
}

// Create singleton instance
export const globalRegistry = new GlobalRegistryManager();

// Convenience functions
export const getApp = () => globalRegistry.get('App');
export const getGameConfig = () => globalRegistry.get('GAME_CONFIG');
export const getSips = () => globalRegistry.get('sips');
export const getSipsPerDrink = () => globalRegistry.get('sipsPerDrink');
export const getDrinkRate = () => globalRegistry.getWithFallback('drinkRate', 1000);
export const getLastDrinkTime = () => globalRegistry.getWithFallback('lastDrinkTime', 0);
export const getSpd = () => globalRegistry.get('spd');
export const getTotalSipsEarned = () => globalRegistry.get('totalSipsEarned');
export const getHighestSipsPerSecond = () => globalRegistry.get('highestSipsPerSecond');
export const getLastAutosaveClockMs = () => globalRegistry.get('__lastAutosaveClockMs');

// Setter functions
export const setSips = (value: any) => globalRegistry.register('sips', value);
export const setLastAutosaveClockMs = (value: number) =>
  globalRegistry.register('__lastAutosaveClockMs', value);
