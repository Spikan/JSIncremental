// Enhanced Observable State Store with Middleware Support

import { createValidationMiddleware, createDebugMiddleware, createPerformanceMiddleware, createPersistenceMiddleware } from './middleware.js';

/**
 * Creates an enhanced observable store with middleware support.
 * - getState(): returns current state object
 * - setState(partial): shallow-merge update with middleware processing
 * - subscribe(listener): returns unsubscribe function
 * - use(middleware): add middleware to the store
 */
export function createStore(initialState = {}) {
    let state = { ...initialState };
    const listeners = new Set();
    const middlewares = [];

    function getState() {
        return state;
    }

    function setState(partial) {
        if (partial == null || typeof partial !== 'object') return;

        // Create new state object
        const newState = { ...state, ...partial };

        // Run through middlewares
        let processedState = newState;
        for (const middleware of middlewares) {
            try {
                processedState = middleware(processedState, state) || processedState;
            } catch (error) {
                console.warn('State middleware error:', error);
            }
        }

        // Update state and notify listeners
        state = processedState;
        for (const listener of listeners) {
            try {
                listener(state, { previous: state, current: newState });
            } catch (error) {
                console.warn('State listener error:', error);
            }
        }
    }

    function subscribe(listener) {
        listeners.add(listener);
        // Return unsubscribe function
        return () => listeners.delete(listener);
    }

    function use(middleware) {
        if (typeof middleware === 'function') {
            middlewares.push(middleware);
        }
        return this; // Chainable
    }

    function replaceState(newState) {
        if (newState && typeof newState === 'object') {
            state = { ...newState };
            for (const listener of listeners) {
                try {
                    listener(state, { replaced: true });
                } catch (error) {
                    console.warn('State listener error:', error);
                }
            }
        }
    }

    return {
        getState,
        setState,
        subscribe,
        use,
        replaceState,
        // Utility methods
        get middlewareCount() { return middlewares.length; },
        get listenerCount() { return listeners.size; }
    };
}

// Convenience function to create a store with common middleware
export function createEnhancedStore(initialState = {}) {
    const store = createStore(initialState);

    // Add essential middleware
    store.use(createValidationMiddleware());

    // Add development middleware in development
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        store.use(createDebugMiddleware(true));
        store.use(createPerformanceMiddleware());
    }

    // Add persistence if storage is available
    if (typeof localStorage !== 'undefined') {
        store.use(createPersistenceMiddleware());
    }

    return store;
}

// Default app store instance; can be used by legacy code gradually
export const appStore = createStore({
    version: 1,
    // Composed during bootstrap from default shape (see shape.js)
});

// Selectors (lightweight helpers we can expand as we migrate state)
export const selectors = {
    sips: (s) => s.sips,
    level: (s) => s.level,
    drinkProgress: (s) => s.drinkProgress,
    drinkRate: (s) => s.drinkRate,
    options: (s) => s.options || {},
};





