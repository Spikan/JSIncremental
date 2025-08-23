// Typed minimal app state store

export type Unsubscribe = () => void;
export type Listener<T> = (state: T) => void;

export interface Store<T extends object> {
  getState: () => T;
  setState: (partial: Partial<T>) => void;
  subscribe: (listener: Listener<T>) => Unsubscribe;
}

export function createStore<T extends object>(initialState: T): Store<T> {
  let state: T = { ...(initialState as any) };
  const listeners = new Set<Listener<T>>();

  function getState(): T {
    return state;
  }

  function setState(partial: Partial<T>): void {
    if (partial == null || typeof partial !== 'object') return;
    state = { ...state, ...partial } as T;
    for (const listener of listeners) listener(state);
  }

  function subscribe(listener: Listener<T>): Unsubscribe {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, setState, subscribe };
}

// Default app store instance for legacy access
const appStore = createStore<any>({ version: 1 });

// Lightweight selectors (untyped in legacy scenarios)
const selectors = {
  sips: (s: any) => s.sips,
  level: (s: any) => s.level,
  drinkProgress: (s: any) => s.drinkProgress,
  drinkRate: (s: any) => s.drinkRate,
  options: (s: any) => s.options || {},
};

// Attach to window for legacy bootstrap usage
try { (window as any).createStore = createStore; } catch {}
try { (window as any).appStore = appStore; } catch {}
try { (window as any).selectors = selectors; } catch {}

export { appStore, selectors };


