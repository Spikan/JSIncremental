// Entry module providing a small public API surface and environment checks
// Note: Converted from ES6 modules to regular script loading

// Create placeholder objects since we're not using imports
const createStore = window.createStore || ((state) => ({ getState: () => state, setState: () => {} }));
const defaultState = window.defaultState || {};
const storage = window.storage || { loadGame: () => null, saveGame: () => {} };
const eventBus = window.eventBus || { emit: () => {}, on: () => {} };
const EVENT_NAMES = window.EVENT_NAMES || {};

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
        gameInit: {}
    },
    ui: {},
    data: {}
};

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


