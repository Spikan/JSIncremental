// Main Game Logic - Legacy game logic being refactored into modular architecture
// This file contains the core game loop and legacy functions that are being gradually moved to modules

// Safety checks - ensure dependencies are available
(function() {
    // Check if Decimal is available
    if (typeof Decimal === 'undefined') {
        console.error('❌ Decimal library not available! Game cannot start.');
        return;
    }
    
    // Check if App object is available
    if (!window.App || !window.App.ui) {
        console.error('❌ App object not available! Game cannot start.');
        return;
    }
    
    console.log('✅ Dependencies ready, main.js loaded successfully');
    
    // Don't call initGame here - it will be called after the DOM is ready
    // and all functions are properly defined
})();

// Cache top-level config groups for non-init helpers
const GC = (typeof window !== 'undefined' && window.GAME_CONFIG) || {};
const BAL = GC.BALANCE || {};
const TIMING = GC.TIMING || {};
const LIMITS = GC.LIMITS || {};

// Soda Clicker Pro - Main Game Logic
// 
// ARCHITECTURE OVERVIEW:
// This file contains core game logic and legacy functions that haven't been fully modularized yet.
// 
// MODULAR STRUCTURE (Post-Refactoring):
// - UI Functions: Moved to js/ui/* modules, accessed via App.ui.*
// - Core Systems: Moved to js/core/systems/* modules, accessed via App.systems.*
// - Storage: Moved to js/services/storage.js, accessed via App.storage.*
// - Validation: Located in js/core/validation/schemas.js
// 
// DUPLICATE FUNCTION ELIMINATION:
// All duplicate functions have been removed from this file and consolidated into
// the appropriate modular systems. Function calls now use the App namespace:
// - App.ui.checkUpgradeAffordability() instead of checkUpgradeAffordability()
// - App.systems.save.performSaveSnapshot() instead of save()
// - App.systems.options.saveOptions() instead of saveOptions()
// 
// REMAINING IN THIS FILE:
// - Game initialization logic (initGame, startGameLoop)
// - Core game mechanics (processDrink, trackClick)
// - Mobile touch handling
// - Legacy global variables and DOM cache
// - Tab switching and UI event handlers
// 

// Progressive enhancement - detect advanced features
const FEATURE_DETECTION = {
    webGL: !!window.WebGLRenderingContext,
    webAudio: !!window.AudioContext,
    serviceWorker: 'serviceWorker' in navigator,
    webP: false,
    localStorage: !!window.localStorage,
    requestAnimationFrame: !!window.requestAnimationFrame,
    performance: !!window.performance && !!window.performance.now,
    
    // Test WebP support
    init: function() {
        const webPTest = new Image();
        webPTest.onload = () => { this.webP = true; };
        webPTest.onerror = () => { this.webP = false; };
        webPTest.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAADsAD+JaQAA3AAAAAA';
        
        
    },
    
    // Enable features based on capability
    enableAdvancedFeatures: function() {
        if (this.webGL) {
            this.enableWebGLEffects();
        }
        
        if (this.performance) {
            this.enablePerformanceMonitoring();
        }
        
        if (this.serviceWorker) {
            this.enableServiceWorker();
        }
    },
    
    enableWebGLEffects: function() {
        
        // Future: Add WebGL particle effects for clicks
    },
    
    enablePerformanceMonitoring: function() {
        
        // Monitor frame rates and performance
        let frameCount = 0;
        let lastTime = performance.now();
        
        function measureFPS() {
            frameCount++;
            const currentTime = performance.now();
            
            const config = GC?.PERFORMANCE || {};
                    const frameCountInterval = config.FRAME_COUNT_INTERVAL;
        const lowFpsThreshold = config.LOW_FPS_WARNING_THRESHOLD;
            
            if (currentTime - lastTime >= frameCountInterval) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                if (fps < lowFpsThreshold) {
                    console.warn('Low FPS detected:', fps);
                }
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        }
        
        requestAnimationFrame(measureFPS);
    },
    
    enableServiceWorker: function() {
        
        // Future: Enable offline functionality
    }
};

// Feature Unlock System - Now imported from js/feature-unlocks.js
// The FEATURE_UNLOCKS object is defined in the separate module file

// Main module loaded

// DOM Element Cache - Imported from dom-cache.js
// Ensures DOM_CACHE is available before proceeding
if (typeof DOM_CACHE === 'undefined') {
    console.error('DOM_CACHE not loaded. Please ensure dom-cache.js is loaded before main.js');
} else {
    
    if (!DOM_CACHE.isReady()) {
        console.warn('DOM_CACHE not ready, initializing...');
        DOM_CACHE.init();
    }
}

// Debug checks removed for production

// ============================================================================
// DUPLICATE CODE REMOVED - CONSOLIDATED INTO initGame() FUNCTION
// ============================================================================
// The following duplicate variable declarations and property definitions have been removed
// to prevent "can't redefine non-configurable property" errors.
// All game state variables are now properly managed within the initGame() function.

// Splash init handled by App.systems.gameInit; keep a passthrough for legacy calls
function initSplashScreen() { try { window.App?.systems?.gameInit?.initSplashScreen?.(); } catch {} }

// Tab switching functionality
function switchTab(tabName, event) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    const clickedButton = event.target;
    clickedButton.classList.add('active');

    // Refresh stats when switching to the stats tab
    if (tabName === 'stats') {
        window.App?.ui?.updateAllStats?.();
    }
    
    // Update unlocks when switching to the unlocks tab
    if (tabName === 'unlocks') {
        if (typeof FEATURE_UNLOCKS !== 'undefined' && FEATURE_UNLOCKS.updateUnlocksTab) {
            FEATURE_UNLOCKS.updateUnlocksTab();
        } else {
            console.warn('⚠️ FEATURE_UNLOCKS.updateUnlocksTab not available');
        }
    }
}

// Make switchTab globally available for HTML onclick attributes
window.switchTab = switchTab;

// Note: Button system has been moved to js/ui/buttons.js as part of the UI system

// ============================================================================
// DUPLICATE FUNCTIONS REMOVED - NOW USING MODULAR ARCHITECTURE
// ============================================================================
// The following functions were duplicated between main.js and modular systems.
// They have been removed from main.js and consolidated into the appropriate modules.
// All calls now use the App namespace for better organization and maintainability.

// Check if upgrades are affordable and update UI accordingly
// MOVED TO: js/ui/affordability.js - use App.ui.checkUpgradeAffordability()

// Update button state based on affordability  
// MOVED TO: js/ui/utils.js - use App.ui.updateButtonState()

// Update cost display with affordability indicators
// MOVED TO: js/ui/utils.js - use App.ui.updateCostDisplay()

function initGame() {
    try {
        console.log('🚀 initGame called - starting game initialization...');
        console.log('🔧 GAME_CONFIG available:', !!GC && Object.keys(GC).length > 0);
        console.log('🔧 DOM_CACHE available:', !!window.DOM_CACHE);
        console.log('🔧 FEATURE_UNLOCKS available:', !!window.FEATURE_UNLOCKS);
        // ============================================================================
        // DEPENDENCY VALIDATION - Ensure all required objects are available
        // ============================================================================
        
        // Check if FEATURE_UNLOCKS is available
        if (typeof FEATURE_UNLOCKS === 'undefined') {
            console.error('❌ FEATURE_UNLOCKS not available! Game cannot initialize properly.');
            console.log('⏳ Waiting for FEATURE_UNLOCKS to load...');
            // Retry after a short delay
            setTimeout(initGame, 100);
            return;
        }
        
        // Check if DOM_CACHE is available
        if (typeof DOM_CACHE === 'undefined') {
            console.error('❌ DOM_CACHE not available! Game cannot initialize properly.');
            console.log('⏳ Waiting for DOM_CACHE to load...');
            // Retry after a short delay
            setTimeout(initGame, 100);
            return;
        }
        
        // Check if GAME_CONFIG is available
        if (!GC || (typeof GC === 'object' && Object.keys(GC).length === 0)) {
            console.error('❌ GAME_CONFIG not available! Game cannot initialize properly.');
            console.log('⏳ Waiting for GAME_CONFIG to load...');
            // Retry after a short delay
            setTimeout(initGame, 100);
            return;
        }
        
        console.log('✅ All dependencies validated, proceeding with game initialization...');
        // Cache config groups locally to avoid repeated global reads
        const CONF = GC || {};
        const BAL = CONF.BALANCE || {};
        const TIMING = CONF.TIMING || {};
        const LIMITS = CONF.LIMITS || {};
        
        // Soda Clicker Pro - Main Game Logic
        // 
        // ARCHITECTURE OVERVIEW:
        // This file contains legacy game logic that is being gradually refactored into modules.
        // Functions marked with "// Function moved to..." comments have been moved to the modular system.
        // 
        // CURRENT STATUS:
        // - Core game loop and state management remain here
        // - UI functions moved to js/ui/ modules
        // - Business logic moved to js/core/rules/ modules
        // - System functions moved to js/core/systems/ modules
        // 
        // USAGE:
        // - UI updates: Use App.ui.functionName() instead of direct calls
        // - Core systems: Use App.systems.systemName.functionName()
        // - Storage: Use App.storage.functionName()
        // 
        // MIGRATION PATH:
        // 1. ✅ UI functions moved to js/ui/ modules
        // 2. ✅ Business logic moved to js/core/rules/ modules  
        // 3. ✅ System functions moved to js/core/systems/ modules
        // 4. 🔄 Core game loop refactoring (in progress)
        // 5. ⏳ State management consolidation (planned)
        
        // Game state variables
        // Core resources
        console.log('🔧 Initializing game state variables...');
        window.sips = new Decimal(0);
        let straws = new Decimal(0);
        let cups = new Decimal(0);

        // Make these accessible to the save system
        window.straws = straws;
        window.cups = cups;
        let suctions = new Decimal(0);
        // Make suctions accessible globally
        window.suctions = suctions;

        console.log('🔧 Game state initialized:', {
            sips: window.sips.toNumber(),
            straws: window.straws.toNumber(),
            cups: window.cups.toNumber(),
            suctions: window.suctions.toNumber(),
            suctionsType: typeof window.suctions,
            totalClicks: window.totalClicks,
            lastClickTime: window.lastClickTime,
            currentClickStreak: window.currentClickStreak,
            bestClickStreak: window.bestClickStreak
        });
        let sps = new Decimal(0);
        // Expose sps for UI modules - only define if not already defined
        if (!Object.getOwnPropertyDescriptor(window, 'sps')) {
            Object.defineProperty(window, 'sps', {
                get: function() { return sps; },
                set: function(v) {
                    sps = new Decimal(v);
                    try { window.App?.stateBridge?.syncSps(sps); } catch {}
                    
                }
            });
        }
        let strawSPD = new Decimal(0);
        let cupSPD = new Decimal(0);
        if (!Object.getOwnPropertyDescriptor(window, 'strawSPD')) {
            Object.defineProperty(window, 'strawSPD', {
                get: function() { return strawSPD; },
                set: function(v) {
                    strawSPD = new Decimal(v);
                    try { window.App?.stateBridge?.syncStrawSPD?.(strawSPD); } catch {}
                }
            });
        }
        if (!Object.getOwnPropertyDescriptor(window, 'cupSPD')) {
            Object.defineProperty(window, 'cupSPD', {
                get: function() { return cupSPD; },
                set: function(v) {
                    cupSPD = new Decimal(v);
                    try { window.App?.stateBridge?.syncCupSPD?.(cupSPD); } catch {}
                }
            });
        }
        let suctionClickBonus = new Decimal(0);
        let widerStraws = new Decimal(0);
        // Make widerStraws accessible globally
        window.widerStraws = widerStraws;
        let betterCups = new Decimal(0);
        // Make betterCups accessible globally
        window.betterCups = betterCups;

        let level = new Decimal(1);
        // Make level accessible globally
        window.level = level;
        
        // Calculate and store sips per drink
        // sps value is maintained in App.state (and mirrored where necessary)

        // Drink system variables
            const DEFAULT_DRINK_RATE = TIMING.DEFAULT_DRINK_RATE;
        let drinkRate = DEFAULT_DRINK_RATE;
        // Expose drinkRate for UI modules - only define if not already defined
        if (!Object.getOwnPropertyDescriptor(window, 'drinkRate')) {
            Object.defineProperty(window, 'drinkRate', {
                get: function() { return drinkRate; },
                set: function(v) {
                    drinkRate = Number(v) || drinkRate;
                    try { window.App?.stateBridge?.setDrinkRate(drinkRate); } catch {}
                }
            });
        }
        let drinkProgress = 0;
        if (!Object.getOwnPropertyDescriptor(window, 'drinkProgress')) {
            Object.defineProperty(window, 'drinkProgress', {
                get: function() { return drinkProgress; },
                set: function(v) {
                    drinkProgress = Number(v) || 0;
                    try { window.App?.stateBridge?.setDrinkProgress(drinkProgress); } catch {}
                }
            });
        }
        
        // Bridge click sound preference to App.state.options and storage
        if (!Object.getOwnPropertyDescriptor(window, 'clickSoundsEnabled')) {
            let _clickSounds = true;
            Object.defineProperty(window, 'clickSoundsEnabled', {
                get: function() {
                    try { return !!(window.App?.state?.getState?.()?.options?.clickSoundsEnabled); } catch {}
                    return _clickSounds;
                },
                set: function(v) {
                    const next = !!v;
                    _clickSounds = next;
                    try {
                        const prev = window.App?.state?.getState?.()?.options || {};
                        window.App?.state?.setState?.({ options: { ...prev, clickSoundsEnabled: next } });
                    } catch {}
                    try {
                        if (window.App?.storage?.setBoolean) window.App.storage.setBoolean('clickSoundsEnabled', next);
                        else localStorage.setItem('clickSoundsEnabled', String(next));
                    } catch {}
                    try {
                        if (window.App?.ui?.updateClickSoundsToggleText) window.App.ui.updateClickSoundsToggleText(next);
                        else {
                            const toggleButton = document.getElementById('clickSoundsToggle');
                            if (toggleButton) {
                                toggleButton.textContent = next ? '🔊 Click Sounds ON' : '🔇 Click Sounds OFF';
                                toggleButton.classList.toggle('sounds-off', !next);
                            }
                        }
                    } catch {}
                }
            });
        }
        let lastDrinkTime = Date.now() - DEFAULT_DRINK_RATE; // Start with progress at 0
        try { window.App?.state?.setState?.({ lastDrinkTime, drinkRate }); } catch {}
        if (!Object.getOwnPropertyDescriptor(window, 'lastDrinkTime')) {
            Object.defineProperty(window, 'lastDrinkTime', {
                get: function() { return lastDrinkTime; },
                set: function(v) {
                    lastDrinkTime = Number(v) || 0;
                    try { window.App?.stateBridge?.setLastDrinkTime(lastDrinkTime); } catch {}
                }
            });
        }

        // Faster Drinks upgrade variables
        let fasterDrinks = new Decimal(0);
        // Make fasterDrinks accessible globally
        window.fasterDrinks = fasterDrinks;
        let fasterDrinksUpCounter = new Decimal(1);
        // Make fasterDrinksUpCounter accessible globally
        window.fasterDrinksUpCounter = fasterDrinksUpCounter;

        // Critical Click system variables - IMPROVED BALANCE
            let criticalClickChance = new Decimal(BAL.CRITICAL_CLICK_BASE_CHANCE); // 0.1% base chance (10x higher)
            // Make criticalClickChance accessible globally
            window.criticalClickChance = criticalClickChance;
            let criticalClickMultiplier = new Decimal(BAL.CRITICAL_CLICK_BASE_MULTIPLIER); // 5x multiplier (more balanced)
            // Make criticalClickMultiplier accessible globally
            window.criticalClickMultiplier = criticalClickMultiplier;
        let criticalClicks = new Decimal(0); // Total critical clicks achieved
        let criticalClickUpCounter = new Decimal(1); // Upgrade counter for critical chance

        // Suction upgrade system variables
        let suctionUpCounter = new Decimal(1); // Upgrade counter for suction upgrades

        // Sound system variables (now handled by simple audio system below)

        // Auto-save and options variables
        let autosaveEnabled = true;
            let autosaveInterval = TIMING.AUTOSAVE_INTERVAL; // seconds
        let autosaveCounter = 0;
        // Load options via system and seed App.state + locals
        try {
            const defaults = (window.App?.state?.getState?.()?.options) || { autosaveEnabled: true, autosaveInterval: 30, clickSoundsEnabled: true, musicEnabled: true };
            const loaded = (window.App?.systems?.options?.loadOptions && window.App.systems.options.loadOptions(defaults)) || defaults;
            try { window.App?.state?.setState?.({ options: loaded }); } catch {}
            autosaveEnabled = !!loaded.autosaveEnabled;
            autosaveInterval = Number(loaded.autosaveInterval || autosaveInterval);
            try { window.clickSoundsEnabled = !!loaded.clickSoundsEnabled; } catch {}
        } catch {}

        // Bridge autosave options to App.state and storage
        if (!Object.getOwnPropertyDescriptor(window, 'autosaveEnabled')) {
            Object.defineProperty(window, 'autosaveEnabled', {
                get: function() {
                    try { return !!(window.App?.state?.getState?.()?.options?.autosaveEnabled); } catch {}
                    return !!autosaveEnabled;
                },
                set: function(v) {
                    const next = !!v;
                    autosaveEnabled = next;
                    try {
                        const prev = window.App?.state?.getState?.()?.options || {};
                        window.App?.state?.setState?.({ options: { ...prev, autosaveEnabled: next } });
                    } catch {}
                    try {
                        if (window.App?.systems?.options?.saveOptions) window.App.systems.options.saveOptions({ autosaveEnabled: next, autosaveInterval });
                    } catch {}
                    try { window.App?.ui?.updateAutosaveStatus?.(); } catch {}
                }
            });
        }
        if (!Object.getOwnPropertyDescriptor(window, 'autosaveInterval')) {
            Object.defineProperty(window, 'autosaveInterval', {
                get: function() {
                    try { return Number(window.App?.state?.getState?.()?.options?.autosaveInterval ?? autosaveInterval); } catch {}
                    return Number(autosaveInterval);
                },
                set: function(v) {
                    const next = parseInt(String(v), 10) || autosaveInterval;
                    autosaveInterval = next;
                    autosaveCounter = 0;
                    try {
                        const prev = window.App?.state?.getState?.()?.options || {};
                        window.App?.state?.setState?.({ options: { ...prev, autosaveInterval: next } });
                    } catch {}
                    try {
                        if (window.App?.systems?.options?.saveOptions) window.App.systems.options.saveOptions({ autosaveEnabled, autosaveInterval: next });
                    } catch {}
                    try { window.App?.ui?.updateAutosaveStatus?.(); } catch {}
                }
            });
        }
        let gameStartTime = Date.now();
        let lastSaveTime = null;
        if (!Object.getOwnPropertyDescriptor(window, 'lastSaveTime')) {
            Object.defineProperty(window, 'lastSaveTime', {
                get: function() {
                    try { return Number(window.App?.state?.getState?.()?.lastSaveTime ?? lastSaveTime ?? 0); } catch {}
                    return Number(lastSaveTime || 0);
                },
                set: function(v) {
                    lastSaveTime = Number(v) || 0;
                    try { window.App?.state?.setState?.({ lastSaveTime }); } catch {}
                }
            });
        }
        try { window.App?.state?.setState?.({ sessionStartTime: gameStartTime, totalPlayTime: 0 }); } catch {}

        // Save optimization - batch save operations
        let saveQueue = [];
        let saveTimeout = null;
        let lastSaveOperation = 0;
            const MIN_SAVE_INTERVAL = TIMING.MIN_SAVE_INTERVAL; // Minimum 1 second between saves

        // Statistics tracking variables
        if (!Object.getOwnPropertyDescriptor(window, 'totalClicks')) {
            let _totalClicks = 0;
            Object.defineProperty(window, 'totalClicks', {
                get: function() { return _totalClicks; },
                set: function(v) {
                    _totalClicks = Number(v) || 0;
                    try { window.App?.state?.setState?.({ totalClicks: _totalClicks }); } catch {}
                }
            });
        }
        if (!Object.getOwnPropertyDescriptor(window, 'currentClickStreak')) {
            let _currentClickStreak = 0;
            Object.defineProperty(window, 'currentClickStreak', {
                get: function() { return _currentClickStreak; },
                set: function(v) {
                    _currentClickStreak = Number(v) || 0;
                    try { window.App?.state?.setState?.({ currentClickStreak: _currentClickStreak }); } catch {}
                }
            });
        }
        if (!Object.getOwnPropertyDescriptor(window, 'bestClickStreak')) {
            let _bestClickStreak = 0;
            Object.defineProperty(window, 'bestClickStreak', {
                get: function() { return _bestClickStreak; },
                set: function(v) {
                    _bestClickStreak = Number(v) || 0;
                    try { window.App?.state?.setState?.({ bestClickStreak: _bestClickStreak }); } catch {}
                }
            });
        }
        let totalSipsEarned = new Decimal(0);
        if (!Object.getOwnPropertyDescriptor(window, 'totalSipsEarned')) {
            Object.defineProperty(window, 'totalSipsEarned', {
                get: function() { return totalSipsEarned; },
                set: function(v) {
                    totalSipsEarned = new Decimal(v);
                    try {
                        const prev = Number(window.App?.state?.getState?.()?.totalSipsEarned || 0);
                        const next = (typeof totalSipsEarned?.toNumber === 'function') ? totalSipsEarned.toNumber() : Number(totalSipsEarned) || prev;
                        window.App?.state?.setState?.({ totalSipsEarned: next });
                    } catch {}
                }
            });
        }
        let highestSipsPerSecond = new Decimal(0);
        if (!Object.getOwnPropertyDescriptor(window, 'highestSipsPerSecond')) {
            Object.defineProperty(window, 'highestSipsPerSecond', {
                get: function() { return highestSipsPerSecond; },
                set: function(v) {
                    highestSipsPerSecond = new Decimal(v);
                    try {
                        const numeric = (typeof highestSipsPerSecond?.toNumber === 'function') ? highestSipsPerSecond.toNumber() : Number(highestSipsPerSecond) || 0;
                        window.App?.state?.setState?.({ highestSipsPerSecond: numeric });
                    } catch {}
                }
            });
        }
        let gameStartDate = Date.now();
        if (!Object.getOwnPropertyDescriptor(window, 'gameStartDate')) {
            Object.defineProperty(window, 'gameStartDate', {
                get: function() { return gameStartDate; },
                set: function(v) {
                    gameStartDate = Number(v) || Date.now();
                    try { window.App?.state?.setState?.({ sessionStartTime: Number(gameStartDate) }); } catch {}
                }
            });
        }
        if (!Object.getOwnPropertyDescriptor(window, 'lastClickTime')) {
            let _lastClickTime = 0;
            Object.defineProperty(window, 'lastClickTime', {
                get: function() { return _lastClickTime; },
                set: function(v) {
                    _lastClickTime = Number(v) || 0;
                    try { window.App?.state?.setState?.({ lastClickTime: _lastClickTime }); } catch {}
                }
            });
        } else {
            window.lastClickTime = 0;
        }
        window.clickTimes = []; // For calculating clicks per second

        // Initialize DOM cache first
        DOM_CACHE.init();
        
        // Initialize feature detection and enable advanced features
        FEATURE_DETECTION.init();
        FEATURE_DETECTION.enableAdvancedFeatures();
        
        // Load saved game data
        let savegame = null;
        try {
            if (window.App && window.App.storage && typeof window.App.storage.loadGame === 'function') {
                // Prefer new storage service
                const payload = window.App.storage.loadGame();
                // Maintain compatibility with legacy shape stored under "save"
                if (payload && payload.sips !== undefined) {
                    savegame = payload;
                } else {
                    // Fallback to legacy key if service returns nothing
                    savegame = JSON.parse(localStorage.getItem("save"));
                }
            } else {
                // Legacy fallback
                savegame = JSON.parse(localStorage.getItem("save"));
            }
        } catch (e) {
            console.warn('Failed to load save, starting fresh.', e);
            savegame = null;
        }
        
        if (savegame && typeof savegame.sips !== "undefined" && savegame.sips !== null) {
            window.sips = new Decimal(savegame.sips);
            // Handle both string and numeric saved values
            straws = new Decimal(typeof savegame.straws === 'number' ? savegame.straws : (savegame.straws || 0));
            cups = new Decimal(typeof savegame.cups === 'number' ? savegame.cups : (savegame.cups || 0));
            window.straws = straws;
            window.cups = cups;
            suctions = new Decimal(savegame.suctions || 0);
            window.suctions = suctions;
            fasterDrinks = new Decimal(savegame.fasterDrinks || 0);
            window.fasterDrinks = fasterDrinks;
            // Load sps from save, but we'll recalculate it to include base sips per drink
            const savedSps = new Decimal(savegame.sps || 0);
            widerStraws = new Decimal(savegame.widerStraws || 0);
            window.widerStraws = widerStraws;
            betterCups = new Decimal(savegame.betterCups || 0);
            window.betterCups = betterCups;
            criticalClickChance = new Decimal(savegame.criticalClickChance || 0.001);
            window.criticalClickChance = criticalClickChance;
            criticalClickMultiplier = new Decimal(savegame.criticalClickMultiplier || 5);
            window.criticalClickMultiplier = criticalClickMultiplier;
            criticalClicks = new Decimal(savegame.criticalClicks || 0);
            window.criticalClicks = criticalClicks;
            criticalClickUpCounter = new Decimal(savegame.criticalClickUpCounter || 1);
            suctionClickBonus = new Decimal(savegame.suctionClickBonus || 0);
            level = new Decimal(typeof savegame.level === 'number' ? savegame.level : (savegame.level || 1));
            window.level = level;
            try { window.App?.stateBridge?.setLevel(level); } catch {}
            totalSipsEarned = new Decimal(savegame.totalSipsEarned || 0);
            window.totalClicks = Number(savegame.totalClicks || 0);
            gameStartDate = savegame.gameStartDate || Date.now();
            window.lastClickTime = savegame.lastClickTime || 0;
            window.clickTimes = savegame.clickTimes || [];
            // Seed totalPlayTime from save
            try { window.App?.state?.setState?.({ totalPlayTime: Number(savegame.totalPlayTime || 0) }); } catch {}
        }

        try {
            window.App?.events?.emit?.(window.App?.EVENT_NAMES?.GAME?.LOADED, { save: !!savegame });
        } catch {}

        // Calculate offline progress if we have a save time
        let offlineEarnings = new Decimal(0);
        let offlineTimeSeconds = 0;

        if (savegame && savegame.lastSaveTime) {
            const now = Date.now();
            const lastSave = parseInt(savegame.lastSaveTime);
            offlineTimeSeconds = Math.floor((now - lastSave) / 1000);

            // Only calculate offline earnings if at least configured minimum time offline
            const minOfflineTime = TIMING.OFFLINE_MIN_TIME;
            if (offlineTimeSeconds >= minOfflineTime) {
                // Load temporary SPS values to calculate earnings
                let tempStrawSPD;
                let tempCupSPD;
                // Using BAL from cached config
                if (window.App?.rules?.economy?.computeStrawSPD) {
                    tempStrawSPD = new Decimal(window.App.rules.economy.computeStrawSPD(
                        straws.toNumber(), BAL.STRAW_BASE_SPD, widerStraws.toNumber(), BAL.WIDER_STRAWS_MULTIPLIER));
                    tempCupSPD = new Decimal(window.App.rules.economy.computeCupSPD(
                        cups.toNumber(), BAL.CUP_BASE_SPD, betterCups.toNumber(), BAL.BETTER_CUPS_MULTIPLIER));
                } else {
                    tempStrawSPD = new Decimal(BAL.STRAW_BASE_SPD);
                    tempCupSPD = new Decimal(BAL.CUP_BASE_SPD);
                    if (widerStraws.gt(0)) {
                        const upgradeMultiplier = new Decimal(1 + (widerStraws.toNumber() * BAL.WIDER_STRAWS_MULTIPLIER));
                        tempStrawSPD = tempStrawSPD.times(upgradeMultiplier);
                    }
                    if (betterCups.gt(0)) {
                        const upgradeMultiplier = new Decimal(1 + (betterCups.toNumber() * BAL.BETTER_CUPS_MULTIPLIER));
                        tempCupSPD = tempCupSPD.times(upgradeMultiplier);
                    }
                }

                const tempTotalSPD = tempStrawSPD.times(straws).plus(tempCupSPD.times(cups));
                
                // Add base sips per drink to offline earnings
                const baseSipsPerDrink = new Decimal(BAL.BASE_SIPS_PER_DRINK);
                const totalSipsPerDrink = baseSipsPerDrink.plus(tempTotalSPD);
                
                // Calculate offline earnings including base sips
                const drinksPerSecond = 1000 / DEFAULT_DRINK_RATE;
                const baseSipsPerSecond = baseSipsPerDrink.times(drinksPerSecond);
                const passiveSipsPerSecond = tempTotalSPD.times(drinksPerSecond);
                const totalSipsPerSecond = baseSipsPerSecond.plus(passiveSipsPerSecond);

                // Cap offline earnings to prevent abuse (max configured time worth)
                const maxOfflineTime = TIMING.OFFLINE_MAX_TIME;
                const cappedOfflineSeconds = Math.min(offlineTimeSeconds, maxOfflineTime);
                offlineEarnings = totalSipsPerSecond.times(cappedOfflineSeconds);

                // Show offline progress modal
                showOfflineProgress(offlineTimeSeconds, offlineEarnings);

                // Add offline earnings to total sips
                window.sips = window.sips.plus(offlineEarnings);
                totalSipsEarned = totalSipsEarned.plus(offlineEarnings);
                // Sync App.state snapshot for UI
                try {
                    const toNum = (v) => (v && typeof v.toNumber === 'function') ? v.toNumber() : Number(v || 0);
                    const prevTotal = Number(window.App?.state?.getState?.()?.totalSipsEarned || 0);
                    window.App?.state?.setState?.({
                        sips: toNum(window.sips),
                        totalSipsEarned: prevTotal + toNum(offlineEarnings)
                    });
                } catch {}
            }
        }

        // Initialize base values for new games
        if (!savegame) {
            const config = BAL || {};
            window.sips = new Decimal(0);
            straws = new Decimal(0);
            cups = new Decimal(0);
            window.straws = straws;
            window.cups = cups;
            suctions = new Decimal(0);
            window.suctions = suctions;
            fasterDrinks = new Decimal(0);
            window.fasterDrinks = fasterDrinks;
            criticalClickChance = new Decimal(config.CRITICAL_CLICK_BASE_CHANCE);
            window.criticalClickChance = criticalClickChance;
            criticalClickMultiplier = new Decimal(config.CRITICAL_CLICK_BASE_MULTIPLIER);
            window.criticalClickMultiplier = criticalClickMultiplier;
            criticalClickUpCounter = new Decimal(1);
            suctionClickBonus = new Decimal(0);
            level = new Decimal(1);
            window.level = level;
            try { window.App?.stateBridge?.setLevel(level); } catch {}
            totalSipsEarned = new Decimal(0);
            gameStartDate = Date.now();
            window.lastClickTime = 0;
            window.clickTimes = [];
        }



        const config = BAL || {};
        // Use centralized resources system for production values when available
        if (window.App?.systems?.resources?.recalcProduction) {
            const up = window.App?.data?.upgrades || {};
            const result = window.App.systems.resources.recalcProduction({
                straws: straws.toNumber(),
                cups: cups.toNumber(),
                widerStraws: widerStraws.toNumber(),
                betterCups: betterCups.toNumber(),
                base: {
                    strawBaseSPD: up?.straws?.baseSPD ?? config.STRAW_BASE_SPD,
                    cupBaseSPD: up?.cups?.baseSPD ?? config.CUP_BASE_SPD,
                    baseSipsPerDrink: config.BASE_SIPS_PER_DRINK,
                },
                multipliers: {
                    widerStrawsPerLevel: up?.widerStraws?.multiplierPerLevel ?? config.WIDER_STRAWS_MULTIPLIER,
                    betterCupsPerLevel: up?.betterCups?.multiplierPerLevel ?? config.BETTER_CUPS_MULTIPLIER,
                },
            });
            strawSPD = new Decimal(result.strawSPD);
            cupSPD = new Decimal(result.cupSPD);
            sps = new Decimal(result.sipsPerDrink);
        } else {
            strawSPD = new Decimal(config.STRAW_BASE_SPD);
            cupSPD = new Decimal(config.CUP_BASE_SPD);
            if (widerStraws.gt(0)) {
                const upgradeMultiplier = new Decimal(1 + (widerStraws.toNumber() * config.WIDER_STRAWS_MULTIPLIER));
                strawSPD = strawSPD.times(upgradeMultiplier);
            }
            if (betterCups.gt(0)) {
                const upgradeMultiplier = new Decimal(1 + (betterCups.toNumber() * config.BETTER_CUPS_MULTIPLIER));
                cupSPD = cupSPD.times(upgradeMultiplier);
            }
            const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
            const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
            sps = baseSipsPerDrink.plus(passiveSipsPerDrink);
            
        }
        // Suction click bonus stays multiplicative on suctions
        suctionClickBonus = new Decimal(config.SUCTION_CLICK_BONUS).times(suctions);

        // Initialize drink rate based on upgrades
        // updateDrinkRate(); // This function has been moved to js/ui/displays.js

        // Restore in-progress drink timing if present in save
        try {
            if (savegame) {
                if (typeof savegame.lastDrinkTime === 'number' && savegame.lastDrinkTime > 0) {
                    lastDrinkTime = savegame.lastDrinkTime;
                } else if (typeof savegame.drinkProgress === 'number' && savegame.drinkProgress >= 0) {
                    // Approximate lastDrinkTime from saved progress percentage
                    const progressMs = (savegame.drinkProgress / 100) * drinkRate;
                    lastDrinkTime = Date.now() - progressMs;
                }
            }
        } catch {}
        
        // sps already computed above (prefer resources.recalcProduction when available)
        
        // Seed App.state with authoritative numeric snapshot
        try {
            const toNum = (v) => (v && typeof v.toNumber === 'function') ? v.toNumber() : Number(v || 0);
            window.App?.state?.setState?.({
                sips: toNum(window.sips),
                straws: toNum(straws),
                cups: toNum(cups),
                suctions: toNum(window.suctions),
                widerStraws: toNum(widerStraws),
                betterCups: toNum(betterCups),
                fasterDrinks: toNum(window.fasterDrinks),
                criticalClicks: toNum(criticalClicks),
                level: toNum(level),
                sps: toNum(sps),
                strawSPD: toNum(strawSPD),
                cupSPD: toNum(cupSPD),
                drinkRate: Number(drinkRate || 0),
                drinkProgress: Number(drinkProgress || 0),
                lastDrinkTime: Number(lastDrinkTime || 0),
                criticalClickChance: toNum(criticalClickChance),
                criticalClickMultiplier: toNum(criticalClickMultiplier),
                suctionClickBonus: toNum(suctionClickBonus),
                fasterDrinksUpCounter: toNum(fasterDrinksUpCounter),
                criticalClickUpCounter: toNum(criticalClickUpCounter)
            });
        } catch {}

        // Update the top sips per drink display
        window.App?.ui?.updateTopSipsPerDrink?.();
        window.App?.ui?.updateTopSipsPerSecond?.();

        // Initialize progressive feature unlock system after game variables are set up
        
        if (typeof FEATURE_UNLOCKS !== 'undefined' && FEATURE_UNLOCKS.init) {
            FEATURE_UNLOCKS.init();
        } else {
            console.warn('⚠️ FEATURE_UNLOCKS.init not available, skipping feature unlock initialization');
        }

        
        // Game loop is now started from game-init.ts via App.systems.loop.start
        
        // Setup mobile touch handling for reliable click feedback
        setupMobileTouchHandling();
        
        // Update critical click display with initial value
        // updateCriticalClickDisplay() // This function has been moved to js/ui/displays.js
        
        // Initialize button audio system (delegated to module)
        try {
            window.App?.systems?.audio?.button?.initButtonAudioSystem?.();
            // Resume context on first user interaction (mobile/autoplay policies) without playing a sound
            const resume = () => { try { window.App?.systems?.audio?.button?.initButtonAudioSystem?.(); } catch {};
                try { document.removeEventListener('touchstart', resume, true); document.removeEventListener('pointerdown', resume, true); document.removeEventListener('keydown', resume, true);} catch {}
            };
            document.addEventListener('touchstart', resume, true);
            document.addEventListener('pointerdown', resume, true);
            document.addEventListener('keydown', resume, true);
        } catch {}
        
        // Update button sounds toggle button (delegated to module)
        try { window.App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.(); } catch {}
        
    } catch (error) {
        console.error('Error in initGame:', error);
        // Fallback: just show the game content even if initialization fails
        const splashScreen = document.getElementById('splashScreen');
        const gameContent = document.getElementById('gameContent');
        if (splashScreen && gameContent) {
            splashScreen.style.display = 'none';
            gameContent.style.display = 'block';
        }
    }
} // End of initGame function

// Legacy startGameLoop removed; loop is owned by App.systems.loop

// Mobile touch event handling for reliable click feedback
function setupMobileTouchHandling() {
    const sodaButton = DOM_CACHE.sodaButton;
    if (!sodaButton) {
        console.warn('Soda button not found for mobile touch setup, retrying...');
        // Retry after a short delay in case DOM cache isn't ready yet
        setTimeout(setupMobileTouchHandling, 100);
        return;
    }

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0);

    if (isMobile) {
        // Let native scrolling work; unified button system handles taps.
        // Keep only non-intrusive styling hints.
        try {
            sodaButton.style.touchAction = 'pan-y';
            sodaButton.style.webkitTouchCallout = 'none';
            sodaButton.style.webkitUserSelect = 'none';
            sodaButton.style.userSelect = 'none';
        } catch {}
        // Optional: keep context menu disabled on long press without affecting scroll
        try {
            sodaButton.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        } catch {}
    }
}

// Function moved to js/ui/displays.js - use App.ui.updateDrinkProgress()

function processDrink() {
    const currentTime = Date.now();
    // Read from App.state with safe fallbacks
    const st = (typeof window !== 'undefined' && window.App?.state?.getState?.()) || {};
    const last = Number(st.lastDrinkTime ?? (typeof lastDrinkTime !== 'undefined' ? lastDrinkTime : 0));
    const rate = Number(st.drinkRate ?? (typeof drinkRate !== 'undefined' ? drinkRate : 1000));
    if (currentTime - last >= rate) {
        // Add full sips-per-drink (base + production)
        const config = BAL || {};
        const sipsPerDrinkDec = (sps && typeof sps.toNumber === 'function')
            ? sps
            : new Decimal(Number(window.App?.state?.getState?.()?.sps || config.BASE_SIPS_PER_DRINK));
        window.sips = window.sips.plus(sipsPerDrinkDec);
        totalSipsEarned = totalSipsEarned.plus(sipsPerDrinkDec);

        try { console.log('🥤 Drink processed! Added', (typeof sipsPerDrinkDec.toNumber === 'function') ? sipsPerDrinkDec.toNumber() : Number(sipsPerDrinkDec), 'sips'); } catch {}
        
        const nextLast = currentTime;
        lastDrinkTime = nextLast;
        drinkProgress = 0;
        try {
            window.App?.stateBridge?.setLastDrinkTime(nextLast);
            window.App?.stateBridge?.setDrinkProgress(drinkProgress);
            // Also write sips to state directly
            const toNum = (v) => (v && typeof v.toNumber === 'function') ? v.toNumber() : Number(v || 0);
            const sipsNum = toNum(window.sips);
            const drinkRateSec = rate ? (1000 / rate) : 0;
            const spsNum = toNum(sps);
            const currentSipsPerSecond = spsNum * drinkRateSec;
            const prevHigh = Number(window.App?.state?.getState?.()?.highestSipsPerSecond || 0);
            const highest = Math.max(prevHigh, currentSipsPerSecond);
            const prevTotal = Number(window.App?.state?.getState?.()?.totalSipsEarned || 0);
            window.App?.state?.setState?.({ sips: sipsNum, highestSipsPerSecond: highest, totalSipsEarned: prevTotal + toNum(sipsPerDrinkDec), lastDrinkTime: nextLast, drinkProgress });
            // Trigger key UI updates
            try { window.App?.ui?.updateTopSipsPerDrink?.(); } catch {}
            try { window.App?.ui?.updateTopSipsPerSecond?.(); } catch {}
            try { window.App?.ui?.updateTopSipCounter?.(); } catch {}
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
        } catch {}
        
        // Check for feature unlocks after processing a drink
        if (typeof FEATURE_UNLOCKS !== 'undefined' && FEATURE_UNLOCKS.checkAllUnlocks) {
            FEATURE_UNLOCKS.checkAllUnlocks();
        }
        
        // Update auto-save counter based on configurable interval via system helper (scope-safe reads)
        try {
            const st2 = window.App?.state?.getState?.() || {};
            const opts = st2.options || {};
            let enabled = typeof autosaveEnabled !== 'undefined' ? autosaveEnabled : !!opts.autosaveEnabled;
            let intervalSec = typeof autosaveInterval !== 'undefined' ? autosaveInterval : Number(opts.autosaveInterval || 10);
            if (window.App?.systems?.autosave?.computeAutosaveCounter) {
                const result = window.App.systems.autosave.computeAutosaveCounter({
                    enabled,
                    counter: (typeof autosaveCounter !== 'undefined' ? autosaveCounter : 0),
                    intervalSec,
                    drinkRateMs: rate,
                });
                if (typeof autosaveCounter !== 'undefined') autosaveCounter = result.nextCounter;
                if (result.shouldSave) try { window.App?.systems?.save?.performSaveSnapshot?.(); } catch {}
            }
        } catch {}
    }
}

// Function to adjust drink rate (for future upgrades)
function setDrinkRate(newDrinkRate) {
    drinkRate = newDrinkRate;
    // Reset progress when changing drink rate
    drinkProgress = 0;
    lastDrinkTime = Date.now();
    try {
        window.App?.stateBridge?.setDrinkRate(drinkRate);
        window.App?.stateBridge?.setDrinkProgress(drinkProgress);
        window.App?.stateBridge?.setLastDrinkTime(lastDrinkTime);
        // Mirror into App.state for UI-only reads
        window.App?.state?.setState?.({ drinkRate, drinkProgress, lastDrinkTime });
    } catch {}
}

// Function to calculate and update drink rate based on upgrades
// Function moved to js/ui/displays.js - use App.ui.updateDrinkRate()

// Function to get current drink rate in seconds
function getDrinkRateSeconds() {
    return drinkRate / 1000;
}

// Function to update the top sips per drink display
// Function moved to js/ui/displays.js - use App.ui.updateTopSipsPerDrink()

// Function to update the top total sips per second display (passive production only)
// Function moved to js/ui/displays.js - use App.ui.updateTopSipsPerSecond()

// Function to update the compact drink speed displays
// Function moved to js/ui/displays.js - use App.ui.updateCompactDrinkSpeedDisplays()

// Click tracking function
function trackClick() {
    console.log('🔧 trackClick called');
    try { window.App?.systems?.clicks?.trackClick?.(); } catch {}
    // Play button click sound effect handled in clicks system as well; keep fallback
    try { window.App?.systems?.audio?.button?.playButtonClickSound?.(); } catch {}
    
    // Update stats display if stats tab is active
    if (DOM_CACHE.statsTab && DOM_CACHE.statsTab.classList.contains('active')) {
        try { window.App?.ui?.updateClickStats?.(); } catch {}
    }
    // State updates handled by clicks system
}

// ============================================================================
// DEV FUNCTIONS FOR DEVELOPMENT AND TESTING
// These functions provide development tools and testing capabilities
// ============================================================================

// Dev unlock functions
function devUnlockAll() {
    try {
        if (window.App?.systems?.dev?.unlockAll) return !!window.App.systems.dev.unlockAll();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devUnlockAll:', error);
    }
}

function devUnlockShop() {
    try {
        if (window.App?.systems?.dev?.unlockShop) return !!window.App.systems.dev.unlockShop();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devUnlockShop:', error);
    }
}

function devUnlockUpgrades() {
    try {
        if (window.App?.systems?.dev?.unlockUpgrades) return !!window.App.systems.dev.unlockUpgrades();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devUnlockUpgrades:', error);
    }
}

function devResetUnlocks() {
    try {
        if (window.App?.systems?.dev?.resetUnlocks) return !!window.App.systems.dev.resetUnlocks();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devResetUnlocks:', error);
    }
}

// Time travel functions
function devAddTime(milliseconds) {
    try {
        if (window.App?.systems?.dev?.addTime) return !!window.App.systems.dev.addTime(Number(milliseconds));
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devAddTime:', error);
    }
}

// Resource management functions
function devAddSips(amount) {
    try {
        if (window.App?.systems?.dev?.addSips) return !!window.App.systems.dev.addSips(Number(amount));
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devAddSips:', error);
    }
}

// Dev mode functions
function devToggleDevMode() {
    try {
        if (window.App?.systems?.dev?.toggleDevMode) return !!window.App.systems.dev.toggleDevMode();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devToggleDevMode:', error);
    }
}

function devToggleGodMode() {
    try {
        if (window.App?.systems?.dev?.toggleGodMode) return !!window.App.systems.dev.toggleGodMode();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devToggleGodMode:', error);
    }
}

function devShowDebugInfo() {
    try {
        if (window.App?.systems?.dev?.showDebugInfo) return !!window.App.systems.dev.showDebugInfo();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devShowDebugInfo:', error);
    }
}

function devExportSave() {
    try {
        if (window.App?.systems?.dev?.exportSave) return !!window.App.systems.dev.exportSave();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devExportSave:', error);
    }
}

function devImportSave() {
    try {
        if (window.App?.systems?.dev?.openImportDialog) return !!window.App.systems.dev.openImportDialog();
        console.warn('Dev system not available');
    } catch (error) {
        console.error('Error in devImportSave:', error);
    }
}

// Quick unlock function
function quickUnlock() {
    try {
        devUnlockAll();
        devAddSips(10000);
        console.log('⚡ Quick unlock completed via dev function');
    } catch (error) {
        console.error('Error in quickUnlock:', error);
    }
}

// ============================================================================
// GLOBAL WRAPPER FUNCTIONS FOR HTML ONCLICK HANDLERS
// These functions bridge the HTML onclick handlers with the modular architecture
// ============================================================================

// Purchase wrapper functions removed; UI dispatches directly via data-action

// Other game functions
function sodaClick(multiplier = 1) {
    try {
        try { window.App?.systems?.clicks?.handleSodaClick?.(multiplier); } catch {}
        // Update UI
        try { window.App?.ui?.updateTopSipsPerDrink?.(); } catch {}
        try { window.App?.ui?.updateTopSipsPerSecond?.(); } catch {}
        try { window.App?.ui?.updateTopSipCounter?.(); } catch {}
        try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
        
    } catch (error) {
        console.error('Error in sodaClick:', error);
    }
}

function levelUp() {
    try {
        if (window.App?.systems?.purchases?.execute?.levelUp) {
            return !!window.App.systems.purchases.execute.levelUp();
        }
        console.warn('Purchase system not available');
    } catch (error) {
        console.error('Error in levelUp:', error);
    }
}

function save() {
    try {
        if (window.App?.systems?.save?.performSaveSnapshot) {
            window.App.systems.save.performSaveSnapshot();
            return true;
        }
        if (window.App?.storage?.saveGame) {
            // Fallback minimal payload from App.state
            const st = window.App?.state?.getState?.() || {};
            const payload = {
                sips: String(window.sips || 0),
                totalSipsEarned: String(window.totalSipsEarned || 0),
                drinkRate: Number(window.drinkRate || 0),
                lastDrinkTime: Number(window.lastDrinkTime || 0),
                drinkProgress: Number(window.drinkProgress || 0),
                lastSaveTime: Date.now(),
                totalPlayTime: Number(st.totalPlayTime || 0),
                totalClicks: Number(window.totalClicks || 0),
                level: Number(window.level?.toNumber?.() || window.level || 1)
            };
            window.App.storage.saveGame(payload);
            try { window.App?.state?.setState?.({ lastSaveTime: payload.lastSaveTime }); } catch {}
            return true;
        }
        console.warn('Save system not available');
        return false;
    } catch (error) {
        console.error('Error in save:', error);
        return false;
    }
}

function delete_save() {
    try {
        let ok = false;
        if (window.App?.systems?.save?.deleteSave) {
            ok = !!window.App.systems.save.deleteSave();
        } else if (window.App?.storage?.deleteSave) {
            ok = !!window.App.storage.deleteSave();
        }
        if (!ok) console.warn('Delete save not available');
        // Reload the page after deletion (if any)
        if (ok) window.location.reload();
    } catch (error) {
        console.error('Error in delete_save:', error);
    }
}

function sendMessage() {
    try {
        // Placeholder for chat functionality
        console.log('Send message functionality not implemented yet');
    } catch (error) {
        console.error('Error in sendMessage:', error);
    }
}

function startGame() {
    try {
        if (window.App?.systems?.gameInit?.startGame) {
            window.App.systems.gameInit.startGame();
        } else {
            console.warn('Game init system not available');
        }
    } catch (error) {
        console.error('Error in startGame:', error);
    }
}

// Function to toggle click sounds on/off
function toggleClickSounds() {
    try { window.clickSoundsEnabled = !window.clickSoundsEnabled; } catch {}
}

// Load click sounds preference from storage
function loadClickSoundsPreference() {
    try {
        let next = true;
        if (window.App?.storage?.getBoolean) {
            next = window.App.storage.getBoolean('clickSoundsEnabled', true);
        } else {
            const saved = localStorage.getItem('clickSoundsEnabled');
            if (saved !== null) next = saved === 'true';
        }
        window.clickSoundsEnabled = next;
    } catch (e) {
        console.warn('loadClickSoundsPreference failed:', e);
    }
}

// Function to update drink speed display
// Function moved to js/ui/displays.js - use App.ui.updateDrinkSpeedDisplay()

// Function to update crit chance stat
// Function moved to js/ui/displays.js - use App.ui.updateCriticalClickDisplay()

// Auto-save management functions
function toggleAutosave() {
    const checkbox = document.getElementById('autosaveToggle');
    autosaveEnabled = !!(checkbox && checkbox.checked);
    try {
        window.App?.events?.emit?.(window.App?.EVENT_NAMES?.OPTIONS?.AUTOSAVE_TOGGLED, { enabled: autosaveEnabled });
        // Update state options
        const prev = window.App?.state?.getState?.()?.options || {};
        window.App?.state?.setState?.({ options: { ...prev, autosaveEnabled } });
        window.App?.systems?.options?.saveOptions?.({ autosaveEnabled, autosaveInterval });
    } catch {}
    try { window.App?.ui?.updateAutosaveStatus?.(); } catch {}
}

function changeAutosaveInterval() {
    const select = document.getElementById('autosaveInterval');
    autosaveInterval = parseInt(select?.value || autosaveInterval, 10);
    autosaveCounter = 0; // Reset counter when changing interval
    try {
        window.App?.events?.emit?.(window.App?.EVENT_NAMES?.OPTIONS?.AUTOSAVE_INTERVAL_CHANGED, { seconds: autosaveInterval });
        const prev = window.App?.state?.getState?.()?.options || {};
        window.App?.state?.setState?.({ options: { ...prev, autosaveInterval } });
        window.App?.systems?.options?.saveOptions?.({ autosaveEnabled, autosaveInterval });
    } catch {}
    try { window.App?.ui?.updateAutosaveStatus?.(); } catch {}
}

// Function moved to js/ui/displays.js - use App.ui.updateAutosaveStatus()

// Options management functions
// Function moved to js/core/systems/options-system.js - use App.systems.options.saveOptions

// Function moved to js/core/systems/options-system.js - use App.systems.options.loadOptions

// Play time tracking
// Function moved to js/ui/stats.js - use App.ui.updatePlayTime()

// Function moved to js/ui/stats.js - use App.ui.updateLastSaveTime()

// Statistics update functions
// Function moved to js/ui/stats.js - use App.ui.updateAllStats()

// Function moved to js/ui/stats.js - use App.ui.updateTimeStats()

// Function moved to js/ui/stats.js - use App.ui.updateClickStats()

// Function moved to js/ui/stats.js - use App.ui.updateEconomyStats()

// Function moved to js/ui/stats.js - use App.ui.updateShopStats()

// Function moved to js/ui/stats.js - use App.ui.updateAchievementStats()

// Click tracking function

// ============================================================================
// GLOBAL FUNCTION ASSIGNMENTS FOR HTML COMPATIBILITY
// These assignments make the wrapper functions available to HTML onclick handlers
// ============================================================================

// Purchase/upgrade globals no longer exposed; handled by UI dispatcher

// Game functions
window.sodaClick = sodaClick;
console.log('🔧 main.js loaded, sodaClick function available:', typeof window.sodaClick);
window.levelUp = levelUp;
window.save = save;
window.delete_save = delete_save;
window.initGame = initGame;
window.toggleButtonSounds = toggleClickSounds;
if (typeof window.sendMessage !== 'function') {
    window.sendMessage = sendMessage;
}
window.startGame = startGame;

// Dev functions
window.devUnlockAll = devUnlockAll;
window.devUnlockShop = devUnlockShop;
window.devUnlockUpgrades = devUnlockUpgrades;
window.devResetUnlocks = devResetUnlocks;
window.devAddTime = devAddTime;
window.devAddSips = devAddSips;
window.devToggleDevMode = devToggleDevMode;
window.devToggleGodMode = devToggleGodMode;
window.devShowDebugInfo = devShowDebugInfo;
window.devExportSave = devExportSave;
window.devImportSave = devImportSave;
window.quickUnlock = quickUnlock;

console.log('✅ Global wrapper functions and dev functions assigned to window object');

// ============================================================================
// INITIALIZATION - Call initGame when DOM is ready and dependencies are available
// ============================================================================

// Check if all dependencies are available
function areDependenciesReady() {
    const dependencies = {
        FEATURE_UNLOCKS: typeof FEATURE_UNLOCKS !== 'undefined',
        DOM_CACHE: typeof DOM_CACHE !== 'undefined',
        GAME_CONFIG: !!GC && Object.keys(GC).length > 0,
        Decimal: typeof Decimal !== 'undefined',
        App: typeof window.App !== 'undefined'
    };
    
    const missingDeps = Object.entries(dependencies)
        .filter(([name, available]) => !available)
        .map(([name]) => name);
    
    if (missingDeps.length > 0) {
        console.log('⏳ Waiting for dependencies:', missingDeps.join(', '));
        return false;
    }
    
    console.log('✅ All dependencies are ready');
    return true;
}

// Initialize the game when the DOM is ready and dependencies are available
function initializeGameWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('✅ DOM ready, checking dependencies...');
            waitForDependencies();
        });
    } else {
        // DOM is already ready
        console.log('✅ DOM already ready, checking dependencies...');
        waitForDependencies();
    }
}

// Wait for all dependencies to be available
function waitForDependencies() {
    if (areDependenciesReady()) {
        console.log('🚀 All dependencies ready, initializing game...');
        initGame();
    } else {
        console.log('⏳ Dependencies not ready, retrying in 100ms...');
        setTimeout(waitForDependencies, 100);
    }
}

// Start initialization
initializeGameWhenReady();