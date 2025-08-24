// Bridge between old createStore and new Zustand store
// This provides backward compatibility during migration

import { useGameStore } from './zustand-store';

// Legacy store interface compatibility
export interface LegacyStore<T extends object> {
  getState: () => T;
  setState: (partial: Partial<T>) => void;
  subscribe: (listener: (state: T) => void) => () => void;
}

// Create a legacy-compatible wrapper around Zustand store
export function createLegacyStore<T extends object>(initialState: T): LegacyStore<T> {
  // Initialize Zustand store with the provided state
  const store = useGameStore.getState();
  if (store.actions && store.actions.loadState) {
    store.actions.loadState(initialState as any);
  }

  return {
    getState: () => useGameStore.getState() as T,
    setState: (partial: Partial<T>) => {
      const currentStore = useGameStore.getState();
      if (currentStore.actions && currentStore.actions.setState) {
        currentStore.actions.setState(partial as any);
      }
    },
    subscribe: (listener: (state: T) => void) => {
      // Subscribe to Zustand store changes
      const unsubscribe = useGameStore.subscribe(state => {
        listener(state as T);
      });

      // Return unsubscribe function
      return unsubscribe;
    },
  };
}

// Legacy app store instance for backward compatibility
export const appStore = createLegacyStore<any>({ version: 1 });

// Legacy selectors for backward compatibility
export const selectors = {
  sips: (s: any) => s.sips,
  level: (s: any) => s.level,
  drinkProgress: (s: any) => s.drinkProgress,
  drinkRate: (s: any) => s.drinkRate,
  options: (s: any) => s.options || {},
};

// Migration helper functions
export function migrateToZustand(oldState: any): void {
  console.log('🔄 Migrating to Zustand store...');

  // Load old state into Zustand store
  try {
    const store = useGameStore.getState();
    if (store.actions && store.actions.loadState) {
      store.actions.loadState(oldState);
    }
    console.log('✅ Migration complete!');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}

export function getZustandStore() {
  return useGameStore;
}

export function getZustandActions() {
  try {
    const store = useGameStore.getState();
    return store.actions;
  } catch (e) {
    console.error('Failed to get Zustand actions:', e);
    return {};
  }
}

// Export for legacy window access
try {
  (window as any).createLegacyStore = createLegacyStore;
  (window as any).appStore = appStore;
  (window as any).selectors = selectors;
  (window as any).migrateToZustand = migrateToZustand;
  (window as any).getZustandStore = getZustandStore;
  (window as any).getZustandActions = getZustandActions;
} catch {}
