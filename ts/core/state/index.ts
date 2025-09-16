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

// createStore function removed - use useGameStore directly
