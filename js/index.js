// Entry module providing a small public API surface and environment checks
// Note: Converted from ES6 modules to regular script loading

// Create placeholder objects since we're not using imports
const createStore = window.createStore || ((state) => ({ getState: () => state, setState: () => {} }));
const defaultState = window.defaultState || {};
const storage = window.storage || { loadGame: () => null, saveGame: () => {} };
const eventBus = window.eventBus || { emit: () => {}, on: () => {} };
// Pull event names from module export if available; fallback to global
let EVENT_NAMES = window.EVENT_NAMES || {};
try {
    // If constants module defined a global export, prefer it
    if (window && window.EVENT_NAMES) {
        EVENT_NAMES = window.EVENT_NAMES;
    }
} catch {}

// Bootstrap the App global object
console.log('🔧 index.js starting App initialization...');
window.App = {
    state: createStore(defaultState),
    storage,
    events: eventBus,
    EVENT_NAMES,
    rules: {
        clicks: {},
        purchases: {},
        economy: {}
    },
    systems: {
        resources: {},
        purchases: {},
        clicks: {},
        autosave: {},
        save: {},
        options: {},
        loop: {},
        audio: { button: {} },
        gameInit: {},
        drink: {}
    },
    ui: {},
    data: {}
};

// Mirror EVENT_NAMES onto window from App (single write location)
try { window.EVENT_NAMES = window.App.EVENT_NAMES; } catch {}

// Initialize state bridge (mirror selected legacy globals)
try {
    const bridge = window.createStateBridge || ((app) => ({
        init: () => {},
        setDrinkRate: () => {},
        setDrinkProgress: () => {},
        setLastDrinkTime: () => {},
        setLevel: () => {},
        autoSync: () => {}
    }));
    const bridgeInstance = bridge(window.App);
    bridgeInstance.init();
    window.App.stateBridge = bridgeInstance;
    console.log('✅ State bridge initialized');
} catch (error) {
    console.warn('⚠️ State bridge initialization failed:', error);
}

// Attach UI module into App and initialize
try {
    const uiModule = await import('./ui/index.js');
    Object.assign(window.App.ui, uiModule);
    if (typeof window.App.ui.initializeUI === 'function') {
        window.App.ui.initializeUI();
    }
} catch (e) {
    console.warn('⚠️ UI module load failed (ok during early bootstrap):', e);
}

// Attach core systems (TypeScript modules) into App.systems with safe fallbacks
try {
    const res = await import('./core/systems/resources.ts');
    Object.assign(window.App.systems.resources, res);
} catch (e) { console.warn('⚠️ resources system load failed:', e); }

try {
    const pur = await import('./core/systems/purchases-system.ts');
    Object.assign(window.App.systems.purchases, pur);
} catch (e) { console.warn('⚠️ purchases system load failed:', e); }

try {
    const loop = await import('./core/systems/loop-system.ts');
    Object.assign(window.App.systems.loop, loop);
} catch (e) { console.warn('⚠️ loop system load failed:', e); }

try {
    const save = await import('./core/systems/save-system.ts');
    Object.assign(window.App.systems.save, save);
} catch (e) { console.warn('⚠️ save system load failed:', e); }

try {
    const drink = await import('./core/systems/drink-system.ts');
    const factory = drink.processDrinkFactory?.();
    if (factory) {
        window.App.systems.drink.processDrink = factory;
    }
} catch (e) { console.warn('⚠️ drink system load failed:', e); }

try {
    const clicks = await import('./core/systems/clicks-system.ts');
    Object.assign(window.App.systems.clicks, clicks);
} catch (e) { console.warn('⚠️ clicks system load failed:', e); }
try {
    const audio = await import('./core/systems/button-audio.ts');
    Object.assign(window.App.systems.audio.button, audio);
} catch (e) { console.warn('⚠️ button-audio system load failed:', e); }

try {
    const gameInit = await import('./core/systems/game-init.ts');
    Object.assign(window.App.systems.gameInit, gameInit);
    // Expose DOM-ready initializer for index bootstrap
    window.initOnDomReady = gameInit.initOnDomReady;
    // Back-compat alias so legacy main.js can call App.systems.gameInit.startGame
    try {
        if (!window.App.systems.gameInit.startGame && window.App.systems.gameInit.startGameCore) {
            window.App.systems.gameInit.startGame = window.App.systems.gameInit.startGameCore;
        }
    } catch {}
} catch (e) { console.warn('⚠️ game-init system load failed:', e); }

// Signal that App is ready
console.log('✅ App object created and ready');

console.log('🔧 index.js finished loading, App object created:', !!window.App);

// Set up DOM-ready splash/init
try {
    if (window.initOnDomReady) {
        window.initOnDomReady();
    }
} catch (error) {
    console.warn('⚠️ DOM-ready initialization failed:', error);
}


