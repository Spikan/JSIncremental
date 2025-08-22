// Minimal app state store (no behavior changes). Public API: createStore, appStore

/**
 * Creates a tiny observable store.
 * - getState(): returns current state object
 * - setState(partial): shallow-merge update and notify subscribers
 * - subscribe(listener): returns unsubscribe
 */
function createStore(initialState = {}) {
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
const appStore = createStore({
    version: 1,
    // Composed during bootstrap from default shape (see shape.js)
});

// Selectors (lightweight helpers we can expand as we migrate state)
const selectors = {
    sips: (s) => s.sips,
    level: (s) => s.level,
    drinkProgress: (s) => s.drinkProgress,
    drinkRate: (s) => s.drinkRate,
    options: (s) => s.options || {},
};

// Make available globally
window.createStore = createStore;
window.appStore = appStore;
window.selectors = selectors;



