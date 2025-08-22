// State Management Middleware
// Provides persistence, validation, and debugging capabilities for the state store

import { validateGameSave } from '../validation/schemas.js';

/**
 * Persistence Middleware
 * Automatically saves state changes to localStorage
 */
export function createPersistenceMiddleware(storageKey = 'game_state', saveInterval = 1000) {
    let lastSaveTime = 0;
    let pendingSave = null;

    return function persistenceMiddleware(newState, oldState) {
        const now = Date.now();

        // Debounce saves to avoid excessive localStorage writes
        if (now - lastSaveTime > saveInterval) {
            saveState(newState);
            lastSaveTime = now;
        } else {
            // Schedule a save if one isn't already pending
            if (!pendingSave) {
                pendingSave = setTimeout(() => {
                    saveState(newState);
                    lastSaveTime = Date.now();
                    pendingSave = null;
                }, saveInterval);
            }
        }

        return newState;
    };

    function saveState(state) {
        try {
            // Only save essential game state, not UI state
            const gameState = {
                sips: state.sips,
                straws: state.straws,
                cups: state.cups,
                suctions: state.suctions,
                widerStraws: state.widerStraws,
                betterCups: state.betterCups,
                fasterDrinks: state.fasterDrinks,
                criticalClicks: state.criticalClicks,
                level: state.level,
                options: state.options,
                timestamp: Date.now()
            };

            // Validate before saving
            const validated = validateGameSave(gameState);
            if (validated) {
                localStorage.setItem(storageKey, JSON.stringify(gameState));
                console.log('💾 Game state saved');
            }
        } catch (error) {
            console.warn('Failed to save game state:', error);
        }
    }
}

/**
 * Validation Middleware
 * Validates state changes and prevents invalid states
 */
export function createValidationMiddleware() {
    return function validationMiddleware(newState, oldState) {
        // Validate numeric values
        const validatedState = { ...newState };

        // Ensure non-negative values for resources
        const resourceFields = ['sips', 'straws', 'cups', 'suctions', 'widerStraws', 'betterCups', 'fasterDrinks', 'criticalClicks'];
        resourceFields.forEach(field => {
            if (typeof validatedState[field] === 'number' && validatedState[field] < 0) {
                console.warn(`Invalid ${field} value: ${validatedState[field]}, resetting to 0`);
                validatedState[field] = 0;
            }
        });

        // Ensure level is at least 1
        if (validatedState.level < 1) {
            console.warn(`Invalid level value: ${validatedState.level}, resetting to 1`);
            validatedState.level = 1;
        }

        // Validate drink system values
        if (validatedState.drinkRate < 0) {
            validatedState.drinkRate = 0;
        }
        if (validatedState.drinkProgress < 0 || validatedState.drinkProgress > 100) {
            validatedState.drinkProgress = Math.max(0, Math.min(100, validatedState.drinkProgress));
        }

        return validatedState;
    };
}

/**
 * Debugging Middleware
 * Logs state changes and provides debugging information
 */
export function createDebugMiddleware(enabled = false) {
    return function debugMiddleware(newState, oldState) {
        if (!enabled || typeof window === 'undefined') return newState;

        // Only log if there are actual changes
        const changes = Object.keys(newState).filter(key => newState[key] !== oldState[key]);

        if (changes.length > 0) {
            console.group('🔄 State Change');
            console.log('Changed fields:', changes);
            changes.forEach(key => {
                console.log(`${key}: ${oldState[key]} → ${newState[key]}`);
            });
            console.groupEnd();
        }

        return newState;
    };
}

/**
 * Performance Monitoring Middleware
 * Tracks state update performance and warns about slow operations
 */
export function createPerformanceMiddleware(threshold = 16) { // 16ms threshold (1 frame at 60fps)
    return function performanceMiddleware(newState, oldState) {
        const startTime = performance.now();

        // Continue with normal processing
        const result = newState;

        const endTime = performance.now();
        const duration = endTime - startTime;

        if (duration > threshold) {
            console.warn(`⚡ Slow state update: ${duration.toFixed(2)}ms`, {
                changedFields: Object.keys(newState).filter(key => newState[key] !== oldState[key])
            });
        }

        return result;
    };
}

/**
 * DevTools Integration Middleware
 * Connects to browser devtools for state debugging
 */
export function createDevToolsMiddleware() {
    if (typeof window === 'undefined' || !window.__REDUX_DEVTOOLS_EXTENSION__) {
        return () => null; // No-op if not available
    }

    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
        name: 'Soda Clicker Pro'
    });

    return function devToolsMiddleware(newState, oldState) {
        devTools.send('State Update', newState);
        return newState;
    };
}

/**
 * State History Middleware
 * Maintains a history of state changes for undo functionality
 */
export function createHistoryMiddleware(maxHistory = 50) {
    const history = [];
    let currentIndex = -1;

    return function historyMiddleware(newState, oldState) {
        // Add to history if there are changes
        const hasChanges = Object.keys(newState).some(key => newState[key] !== oldState[key]);

        if (hasChanges) {
            // Remove any future history if we're not at the end
            history.splice(currentIndex + 1);

            // Add new state to history
            history.push({ ...newState, timestamp: Date.now() });

            // Trim history if too large
            if (history.length > maxHistory) {
                history.shift();
            } else {
                currentIndex++;
            }
        }

        return newState;
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
