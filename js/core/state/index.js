// Minimal app state store (no behavior changes). Public API: createStore, appStore

/**
 * Creates a tiny observable store.
 * - getState(): returns current state object
 * - setState(partial): shallow-merge update and notify subscribers
 * - subscribe(listener): returns unsubscribe
 */
export function createStore(initialState = {}) {
    let state = { ...initialState };
    const listeners = new Set();

    function getState() {
        return state;
    }

    function setState(partial) {
        if (partial == null || typeof partial !== 'object') return;
        state = { ...state, ...partial };
        for (const listener of listeners) listener(state);
    }

    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    return { getState, setState, subscribe };
}

// Default app store instance; can be used by legacy code gradually
export const appStore = createStore({
    version: 1,
    // Place top-level state you want to expose/observe incrementally
    // We avoid moving existing globals yet to prevent behavior changes.
});


