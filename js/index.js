// Entry module providing a small public API surface and environment checks
import { createStore } from './core/state/index.js';
import { storage } from './services/storage.js';
import { bus as eventBus } from './services/event-bus.js';
import { EVENT_NAMES } from './core/constants.js';
import * as clicks from './core/rules/clicks.js';
import * as purchases from './core/rules/purchases.js';
import * as economy from './core/rules/economy.js';
import * as resources from './core/systems/resources.js';
import * as purchasesSys from './core/systems/purchases-system.js';
import * as clicksSys from './core/systems/clicks-system.js';
import * as autosaveSys from './core/systems/autosave.js';
import * as saveSys from './core/systems/save-system.js';
import * as loopSys from './core/systems/loop-system.js';
import * as optionsSys from './core/systems/options-system.js';
import { validateUnlocks, validateUpgrades } from './core/validation/schemas.js';

// Bootstrap the App global object
window.App = {
    state: createStore(),
    storage,
    events: eventBus,
    EVENT_NAMES,
    rules: {
        clicks,
        purchases,
        economy
    },
    systems: {
        resources,
        purchases: purchasesSys,
        clicks: clicksSys,
        autosave: autosaveSys,
        save: saveSys,
        options: optionsSys,
        loop: loopSys
    },
    data: {}
};

// Load and validate data files
async function loadDataFiles() {
    try {
        // Load unlocks data
        const unlocksResponse = await fetch('./data/unlocks.json');
        if (unlocksResponse.ok) {
            const unlocksData = await unlocksResponse.json();
            const validatedUnlocks = validateUnlocks(unlocksData);
            if (validatedUnlocks) {
                App.data.unlocks = validatedUnlocks;
                console.log('✅ Unlocks data loaded and validated');
            } else {
                console.warn('⚠️ Unlocks data validation failed, using fallback');
                App.data.unlocks = unlocksData; // Use unvalidated data as fallback
            }
        } else {
            console.warn('⚠️ Could not load unlocks.json, using GAME_CONFIG fallback');
        }

        // Load upgrades data
        const upgradesResponse = await fetch('./data/upgrades.json');
        if (upgradesResponse.ok) {
            const upgradesData = await upgradesResponse.json();
            const validatedUpgrades = validateUpgrades(upgradesData);
            if (validatedUpgrades) {
                App.data.upgrades = validatedUpgrades;
                console.log('✅ Upgrades data loaded and validated');
            } else {
                console.warn('⚠️ Upgrades data validation failed, using fallback');
                App.data.upgrades = upgradesData; // Use unvalidated data as fallback
            }
        } else {
            console.warn('⚠️ Could not load upgrades.json, using GAME_CONFIG fallback');
        }
    } catch (error) {
        console.error('❌ Error loading data files:', error);
        // Ensure App.data has fallback structure
        if (!App.data.unlocks) App.data.unlocks = {};
        if (!App.data.upgrades) App.data.upgrades = {};
    }
}

// Initialize data files
loadDataFiles();


