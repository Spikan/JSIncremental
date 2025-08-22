// State Selectors
// Pure functions that derive computed values from state

import { computeStrawSPD, computeCupSPD, computeTotalSPD, computeTotalSipsPerDrink } from '../rules/economy.js';

/**
 * Basic resource selectors
 */
export const resourceSelectors = {
    sips: (state) => state.sips || 0,
    straws: (state) => state.straws || 0,
    cups: (state) => state.cups || 0,
    suctions: (state) => state.suctions || 0,
    widerStraws: (state) => state.widerStraws || 0,
    betterCups: (state) => state.betterCups || 0,
    fasterDrinks: (state) => state.fasterDrinks || 0,
    criticalClicks: (state) => state.criticalClicks || 0,
    level: (state) => state.level || 1,
};

/**
 * Production and economy selectors
 */
export const productionSelectors = {
    // Individual production rates
    strawSPD: (state) => {
        const straws = resourceSelectors.straws(state);
        const widerStraws = resourceSelectors.widerStraws(state);
        return computeStrawSPD(straws, 0.6, widerStraws, 0.2); // Default values, should come from config
    },

    cupSPD: (state) => {
        const cups = resourceSelectors.cups(state);
        const betterCups = resourceSelectors.betterCups(state);
        return computeCupSPD(cups, 1.2, betterCups, 0.4); // Default values, should come from config
    },

    totalSPD: (state) => {
        const straws = resourceSelectors.straws(state);
        const strawSPD = productionSelectors.strawSPD(state);
        const cups = resourceSelectors.cups(state);
        const cupSPD = productionSelectors.cupSPD(state);
        return computeTotalSPD(straws, strawSPD, cups, cupSPD);
    },

    sipsPerDrink: (state) => {
        const totalSPD = productionSelectors.totalSPD(state);
        return computeTotalSipsPerDrink(1, totalSPD); // Base sips per drink = 1
    },

    sipsPerSecond: (state) => {
        const sipsPerDrink = productionSelectors.sipsPerDrink(state);
        const drinkRate = drinkSelectors.drinkRate(state);
        if (drinkRate <= 0) return 0;
        return sipsPerDrink / (drinkRate / 1000); // Convert ms to seconds
    }
};

/**
 * Drink system selectors
 */
export const drinkSelectors = {
    drinkRate: (state) => state.drinkRate || 0,
    drinkProgress: (state) => state.drinkProgress || 0,
    lastDrinkTime: (state) => state.lastDrinkTime || 0,
    isDrinking: (state) => drinkSelectors.drinkProgress(state) > 0,

    drinkRateSeconds: (state) => {
        const drinkRate = drinkSelectors.drinkRate(state);
        return drinkRate > 0 ? drinkRate / 1000 : 0;
    },

    timeUntilNextDrink: (state) => {
        const drinkRate = drinkSelectors.drinkRate(state);
        const lastDrinkTime = drinkSelectors.lastDrinkTime(state);
        const now = Date.now();
        const timeSinceLastDrink = now - lastDrinkTime;
        return Math.max(0, drinkRate - timeSinceLastDrink);
    }
};

/**
 * Options and settings selectors
 */
export const optionsSelectors = {
    options: (state) => state.options || {},
    autosaveEnabled: (state) => optionsSelectors.options(state).autosaveEnabled ?? true,
    autosaveInterval: (state) => optionsSelectors.options(state).autosaveInterval ?? 30,
    clickSoundsEnabled: (state) => optionsSelectors.options(state).clickSoundsEnabled ?? true,
    musicEnabled: (state) => optionsSelectors.options(state).musicEnabled ?? true,
    musicStreamPreferences: (state) => optionsSelectors.options(state).musicStreamPreferences || { preferred: 'local', fallbacks: [] }
};

/**
 * Game progress and statistics selectors
 */
export const progressSelectors = {
    // Total resources (sum of all resource types)
    totalResources: (state) => {
        return resourceSelectors.straws(state) +
               resourceSelectors.cups(state) +
               resourceSelectors.suctions(state) +
               resourceSelectors.widerStraws(state) +
               resourceSelectors.betterCups(state) +
               resourceSelectors.fasterDrinks(state) +
               resourceSelectors.criticalClicks(state);
    },

    // Average production per resource
    averageProduction: (state) => {
        const totalResources = progressSelectors.totalResources(state);
        const sipsPerSecond = productionSelectors.sipsPerSecond(state);
        return totalResources > 0 ? sipsPerSecond / totalResources : 0;
    },

    // Game completion percentage (based on level)
    gameProgress: (state) => {
        const level = resourceSelectors.level(state);
        // Assuming max level is 100 for now, this should be configurable
        return Math.min(100, (level / 100) * 100);
    },

    // Production efficiency (sips per second per resource)
    productionEfficiency: (state) => {
        const totalResources = progressSelectors.totalResources(state);
        const sipsPerSecond = productionSelectors.sipsPerSecond(state);
        return totalResources > 0 ? sipsPerSecond / totalResources : 0;
    }
};

/**
 * Upgrade availability selectors
 */
export const upgradeSelectors = {
    // Check if player can afford specific upgrades
    canAffordStraw: (state) => {
        const sips = resourceSelectors.sips(state);
        // This should calculate actual cost, for now using placeholder
        return sips >= 5; // Base straw cost
    },

    canAffordCup: (state) => {
        const sips = resourceSelectors.sips(state);
        return sips >= 15; // Base cup cost
    },

    canAffordSuction: (state) => {
        const sips = resourceSelectors.sips(state);
        return sips >= 40; // Base suction cost
    },

    canAffordLevelUp: (state) => {
        const sips = resourceSelectors.sips(state);
        const level = resourceSelectors.level(state);
        const cost = 3000 * Math.pow(1.15, level); // Level up cost formula
        return sips >= cost;
    },

    // Get next upgrade costs
    nextStrawCost: (state) => {
        const straws = resourceSelectors.straws(state);
        return Math.floor(5 * Math.pow(1.08, straws)); // Base cost and scaling
    },

    nextCupCost: (state) => {
        const cups = resourceSelectors.cups(state);
        return Math.floor(15 * Math.pow(1.15, cups)); // Base cost and scaling
    }
};

/**
 * Utility selectors for common operations
 */
export const utilitySelectors = {
    // Check if game state is valid
    isValidState: (state) => {
        return state &&
               typeof state === 'object' &&
               typeof state.sips !== 'undefined' &&
               typeof state.level !== 'undefined';
    },

    // Get state summary for debugging
    stateSummary: (state) => ({
        resources: {
            sips: resourceSelectors.sips(state),
            straws: resourceSelectors.straws(state),
            cups: resourceSelectors.cups(state),
            level: resourceSelectors.level(state)
        },
        production: {
            sipsPerSecond: productionSelectors.sipsPerSecond(state),
            sipsPerDrink: productionSelectors.sipsPerDrink(state)
        },
        drinkSystem: {
            drinkRate: drinkSelectors.drinkRateSeconds(state),
            isDrinking: drinkSelectors.isDrinking(state)
        }
    }),

    // Check if state has changed significantly
    hasSignificantChange: (newState, oldState) => {
        const significantFields = ['sips', 'level', 'drinkRate'];
        return significantFields.some(field =>
            Math.abs((newState[field] || 0) - (oldState[field] || 0)) > 0.1
        );
    }
};

// Create a selector factory for easy access
export function createSelector(selectorFn) {
    return selectorFn;
}

// Memoized selector factory (for performance optimization)
export function createMemoizedSelector(selectorFn) {
    let lastState = null;
    let lastResult = null;

    return (state) => {
        if (state === lastState) {
            return lastResult;
        }

        lastState = state;
        lastResult = selectorFn(state);
        return lastResult;
    };
}

// Export all selectors as a convenient object
export const selectors = {
    ...resourceSelectors,
    ...productionSelectors,
    ...drinkSelectors,
    ...optionsSelectors,
    ...progressSelectors,
    ...upgradeSelectors,
    ...utilitySelectors
};
