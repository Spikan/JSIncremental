// State store exports - now using Zustand with legacy compatibility
// The old createStore implementation has been replaced with Zustand for better performance

// Export the new Zustand store and related utilities
export {
  useGameStore,
  gameStore,
  useSips,
  useStraws,
  useCups,
  useLevel,
  useHighestSipsPerSecond,
  useOptions,
  useActions,
} from './zustand-store';

// Legacy compatibility layer removed - use Zustand store directly

// Legacy type exports for backward compatibility
export type Unsubscribe = () => void;
export type Listener<T> = (_state: T) => void;
export interface Store<T extends object> {
  getState: () => T;
  setState: (_partial: Partial<T>) => void;
  subscribe: (_listener: Listener<T>) => Unsubscribe;
}

// Legacy createStore function now creates a Zustand-compatible wrapper
export function createStore<T extends object>(initialState: T): Store<T> {
  console.warn('⚠️ createStore is deprecated. Use useGameStore or gameStore directly.');

  // For now, return a basic store implementation
  // The real Zustand store is available via useGameStore
  let state: T = { ...(initialState as any) };
  const listeners = new Set<(_state: T) => void>();

  function getState(): T {
    return state;
  }

  function setState(partial: Partial<T>): void {
    if (partial == null || typeof partial !== 'object') return;
    state = { ...state, ...partial } as T;
    for (const listener of listeners) listener(state);
  }

  function subscribe(listener: (state: T) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, setState, subscribe };
}
