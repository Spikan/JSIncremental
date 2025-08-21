// Entry module providing a small public API surface and environment checks
import { appStore, createStore } from './core/state/index.js';
import { loadGame, saveGame, deleteSave, getStorageMeta, setJSON, getJSON, setBoolean, getBoolean, remove } from './services/storage.js';

// Detect module loading
console.info('[bootstrap] Module index.js loaded');

// Expose minimal API on window for legacy code and UI handlers
window.App = {
    store: appStore,
    createStore,
    storage: {
        loadGame,
        saveGame,
        deleteSave,
        getStorageMeta,
        setJSON,
        getJSON,
        setBoolean,
        getBoolean,
        remove,
    },
};

// Optionally, attach a simple dev helper to log state changes
appStore.subscribe((state) => {
    if (window.GAME_CONFIG?.PERFORMANCE?.LOG_STATE_CHANGES) {
        console.debug('[state]', state);
    }
});


