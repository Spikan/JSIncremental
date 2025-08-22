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
    
    console.log('✅ Dependencies ready, initializing main game logic...');
    
    // Continue with game initialization
    initGame();
})();

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
            
            const config = window.GAME_CONFIG?.PERFORMANCE || {};
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

window.sips = new Decimal(0);
let straws = new Decimal(0);
let cups = new Decimal(0);

// Make these accessible to the save system
window.straws = straws;
window.cups = cups;
let suctions = new Decimal(0);
// Make suctions accessible globally
window.suctions = suctions;
let sps = new Decimal(0);
// Expose sps for UI modules
Object.defineProperty(window, 'sps', {
	get: function() { return sps; },
	set: function(v) { sps = new Decimal(v); }
});
let strawSPD = new Decimal(0);
let cupSPD = new Decimal(0);
let suctionClickBonus = new Decimal(0);
let widerStraws = new Decimal(0);
// Make widerStraws accessible globally
window.widerStraws = widerStraws;
let betterCups = new Decimal(0);
// Make betterCups accessible globally
window.betterCups = betterCups;

let level = new Decimal(1);

// Drink system variables
    const DEFAULT_DRINK_RATE = window.GAME_CONFIG.TIMING.DEFAULT_DRINK_RATE;
let drinkRate = DEFAULT_DRINK_RATE;
// Expose drinkRate for UI modules
Object.defineProperty(window, 'drinkRate', {
	get: function() { return drinkRate; },
	set: function(v) { drinkRate = Number(v) || drinkRate; }
});
let drinkProgress = 0;
let lastDrinkTime = Date.now();

// Faster Drinks upgrade variables
let fasterDrinks = new Decimal(0);
// Make fasterDrinks accessible globally
window.fasterDrinks = fasterDrinks;
let fasterDrinksUpCounter = new Decimal(1);
// Make fasterDrinksUpCounter accessible globally
window.fasterDrinksUpCounter = fasterDrinksUpCounter;

// Critical Click system variables - IMPROVED BALANCE
    let criticalClickChance = new Decimal(window.GAME_CONFIG.BALANCE.CRITICAL_CLICK_BASE_CHANCE); // 0.1% base chance (10x higher)
    // Make criticalClickChance accessible globally
    window.criticalClickChance = criticalClickChance;
    let criticalClickMultiplier = new Decimal(window.GAME_CONFIG.BALANCE.CRITICAL_CLICK_BASE_MULTIPLIER); // 5x multiplier (more balanced)
    // Make criticalClickMultiplier accessible globally
    window.criticalClickMultiplier = criticalClickMultiplier;
let criticalClicks = new Decimal(0); // Total critical clicks achieved
let criticalClickUpCounter = new Decimal(1); // Upgrade counter for critical chance

// Suction upgrade system variables
let suctionUpCounter = new Decimal(1); // Upgrade counter for suction upgrades

// Sound system variables (now handled by simple audio system below)

// Auto-save and options variables
let autosaveEnabled = true;
    let autosaveInterval = window.GAME_CONFIG.TIMING.AUTOSAVE_INTERVAL; // seconds
let autosaveCounter = 0;
let gameStartTime = Date.now();
let lastSaveTime = null;

// Save optimization - batch save operations
let saveQueue = [];
let saveTimeout = null;
let lastSaveOperation = 0;
    const MIN_SAVE_INTERVAL = window.GAME_CONFIG.TIMING.MIN_SAVE_INTERVAL; // Minimum 1 second between saves

// Statistics tracking variables
window.totalClicks = 0;
let currentClickStreak = 0;
let bestClickStreak = 0;
let totalSipsEarned = new Decimal(0);
let highestSipsPerSecond = new Decimal(0);
let gameStartDate = Date.now();
let lastClickTime = 0;
let clickTimes = []; // For calculating clicks per second

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
        FEATURE_UNLOCKS.updateUnlocksTab();
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
        window.sips = new Decimal(0);
        let straws = new Decimal(0);
        let cups = new Decimal(0);

        // Make these accessible to the save system
        window.straws = straws;
        window.cups = cups;
        let suctions = new Decimal(0);
        // Make suctions accessible globally
        window.suctions = suctions;
        let sps = new Decimal(0);
        // Expose sps for UI modules
        Object.defineProperty(window, 'sps', {
            get: function() { return sps; },
            set: function(v) { sps = new Decimal(v); }
        });
        let strawSPD = new Decimal(0);
        let cupSPD = new Decimal(0);
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
        let sipsPerDrink = new Decimal(0);
        // Make sipsPerDrink accessible globally
        window.sipsPerDrink = sipsPerDrink;

        // Drink system variables
            const DEFAULT_DRINK_RATE = window.GAME_CONFIG.TIMING.DEFAULT_DRINK_RATE;
        let drinkRate = DEFAULT_DRINK_RATE;
        // Expose drinkRate for UI modules
        Object.defineProperty(window, 'drinkRate', {
            get: function() { return drinkRate; },
            set: function(v) { drinkRate = Number(v) || drinkRate; }
        });
        let drinkProgress = 0;
        let lastDrinkTime = Date.now();

        // Faster Drinks upgrade variables
        let fasterDrinks = new Decimal(0);
        // Make fasterDrinks accessible globally
        window.fasterDrinks = fasterDrinks;
        let fasterDrinksUpCounter = new Decimal(1);
        // Make fasterDrinksUpCounter accessible globally
        window.fasterDrinksUpCounter = fasterDrinksUpCounter;

        // Critical Click system variables - IMPROVED BALANCE
            let criticalClickChance = new Decimal(window.GAME_CONFIG.BALANCE.CRITICAL_CLICK_BASE_CHANCE); // 0.1% base chance (10x higher)
            // Make criticalClickChance accessible globally
            window.criticalClickChance = criticalClickChance;
            let criticalClickMultiplier = new Decimal(window.GAME_CONFIG.BALANCE.CRITICAL_CLICK_BASE_MULTIPLIER); // 5x multiplier (more balanced)
            // Make criticalClickMultiplier accessible globally
            window.criticalClickMultiplier = criticalClickMultiplier;
        let criticalClicks = new Decimal(0); // Total critical clicks achieved
        let criticalClickUpCounter = new Decimal(1); // Upgrade counter for critical chance

        // Suction upgrade system variables
        let suctionUpCounter = new Decimal(1); // Upgrade counter for suction upgrades

        // Sound system variables (now handled by simple audio system below)

        // Auto-save and options variables
        let autosaveEnabled = true;
            let autosaveInterval = window.GAME_CONFIG.TIMING.AUTOSAVE_INTERVAL; // seconds
        let autosaveCounter = 0;
        let gameStartTime = Date.now();
        let lastSaveTime = null;

        // Save optimization - batch save operations
        let saveQueue = [];
        let saveTimeout = null;
        let lastSaveOperation = 0;
            const MIN_SAVE_INTERVAL = window.GAME_CONFIG.TIMING.MIN_SAVE_INTERVAL; // Minimum 1 second between saves

        // Statistics tracking variables
        window.totalClicks = 0;
        let currentClickStreak = 0;
        let bestClickStreak = 0;
        let totalSipsEarned = new Decimal(0);
        let highestSipsPerSecond = new Decimal(0);
        let gameStartDate = Date.now();
        let lastClickTime = 0;
        let clickTimes = []; // For calculating clicks per second

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
            fasterDrinks = new Decimal(savegame.fasterDrinks || 0);
            // Load sps from save, but we'll recalculate it to include base sips per drink
            const savedSps = new Decimal(savegame.sps || 0);
            widerStraws = new Decimal(savegame.widerStraws || 0);
            betterCups = new Decimal(savegame.betterCups || 0);
            criticalClickChance = new Decimal(savegame.criticalClickChance || 0.001);
            criticalClickMultiplier = new Decimal(savegame.criticalClickMultiplier || 5);
            criticalClicks = new Decimal(savegame.criticalClicks || 0);
            criticalClickUpCounter = new Decimal(savegame.criticalClickUpCounter || 1);
            suctionClickBonus = new Decimal(savegame.suctionClickBonus || 0);
            level = new Decimal(typeof savegame.level === 'number' ? savegame.level : (savegame.level || 1));
            try { window.App?.stateBridge?.setLevel(level); } catch {}
            totalSipsEarned = new Decimal(savegame.totalSipsEarned || 0);
            window.totalClicks = Number(savegame.totalClicks || 0);
            gameStartDate = savegame.gameStartDate || Date.now();
            lastClickTime = savegame.lastClickTime || 0;
            clickTimes = savegame.clickTimes || [];
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
            const minOfflineTime = window.GAME_CONFIG.TIMING.OFFLINE_MIN_TIME;
            if (offlineTimeSeconds >= minOfflineTime) {
                // Load temporary SPS values to calculate earnings
                let tempStrawSPD;
                let tempCupSPD;
                const BAL = window.GAME_CONFIG.BALANCE;
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
                const maxOfflineTime = window.GAME_CONFIG.TIMING.OFFLINE_MAX_TIME;
                const cappedOfflineSeconds = Math.min(offlineTimeSeconds, maxOfflineTime);
                offlineEarnings = totalSipsPerSecond.times(cappedOfflineSeconds);

                // Show offline progress modal
                showOfflineProgress(offlineTimeSeconds, offlineEarnings);

                // Add offline earnings to total sips
                window.sips = window.sips.plus(offlineEarnings);
                totalSipsEarned = totalSipsEarned.plus(offlineEarnings);
            }
        }

        // Initialize base values for new games
        if (!savegame) {
            const config = window.GAME_CONFIG?.BALANCE || {};
            window.sips = new Decimal(0);
            straws = new Decimal(0);
            cups = new Decimal(0);
            window.straws = straws;
            window.cups = cups;
            suctions = new Decimal(0);
            fasterDrinks = new Decimal(0);
            widerStraws = new Decimal(0);
            betterCups = new Decimal(0);
            criticalClickChance = new Decimal(config.CRITICAL_CLICK_BASE_CHANCE);
            criticalClickMultiplier = new Decimal(config.CRITICAL_CLICK_BASE_MULTIPLIER);
            criticalClicks = new Decimal(0);
            criticalClickUpCounter = new Decimal(1);
            suctionClickBonus = new Decimal(0);
            level = new Decimal(1);
            try { window.App?.stateBridge?.setLevel(level); } catch {}
            totalSipsEarned = new Decimal(0);
            gameStartDate = Date.now();
            lastClickTime = 0;
            clickTimes = [];
        }



        const config = window.GAME_CONFIG?.BALANCE || {};
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
        
        // Ensure sps is properly calculated after loading save data
        // This is critical to prevent passive production from being 0 after refresh
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        sps = baseSipsPerDrink.plus(passiveSipsPerDrink);
        
        // Update the top sips per drink display
        window.App?.ui?.updateTopSipsPerDrink?.();
        window.App?.ui?.updateTopSipsPerSecond?.();

        // Initialize progressive feature unlock system after game variables are set up
        
        FEATURE_UNLOCKS.init();

        
        // Start the game loop
        startGameLoop();
        
        // Setup mobile touch handling for reliable click feedback
        setupMobileTouchHandling();
        
        // Update critical click display with initial value
        // updateCriticalClickDisplay() // This function has been moved to js/ui/displays.js
        
        // Initialize button audio system (delegated to module)
        try { window.App?.systems?.audio?.button?.initButtonAudioSystem?.(); } catch {}
        
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

function startGameLoop() {
    // MODULAR ARCHITECTURE: Use centralized loop system if available
    if (window.App?.systems?.loop?.start) {
        window.App.systems.loop.start({
            // UI functions now called through App.ui namespace (was: updateDrinkProgress())
            updateDrinkProgress: () => window.App?.ui?.updateDrinkProgress?.(),
            processDrink,
            // Stats functions consolidated into App.ui namespace (was: updatePlayTime(), updateLastSaveTime(), etc.)
            updateStats: () => { window.App?.ui?.updatePlayTime?.(); window.App?.ui?.updateLastSaveTime?.(); window.App?.ui?.updateAllStats?.(); window.App?.ui?.checkUpgradeAffordability?.(); FEATURE_UNLOCKS.checkAllUnlocks(); },
            updatePlayTime: () => window.App?.ui?.updatePlayTime?.(),
            updateLastSaveTime: () => window.App?.ui?.updateLastSaveTime?.(),
            performBatchUIUpdate: window.App?.ui?.performBatchUIUpdate,
        });
        return;
    }
    let lastUpdate = 0;
    let lastStatsUpdate = 0;
    const targetFPS = window.GAME_CONFIG.LIMITS.TARGET_FPS;
    const frameInterval = 1000 / targetFPS;
    const statsInterval = window.GAME_CONFIG.LIMITS.STATS_UPDATE_INTERVAL;
    function gameLoop(currentTime) {
        if (currentTime - lastUpdate >= frameInterval) {
            try { window.App?.ui?.updateDrinkProgress?.(); } catch {}
            processDrink();
            const affordabilityInterval = window.GAME_CONFIG.LIMITS.AFFORDABILITY_CHECK_INTERVAL;
            if (currentTime - lastUpdate >= affordabilityInterval) {
                window.App?.ui?.checkUpgradeAffordability?.();
            }
            lastUpdate = currentTime;
        }
        if (currentTime - lastStatsUpdate >= statsInterval) {
            window.App?.ui?.updatePlayTime?.();
            window.App?.ui?.updateLastSaveTime?.();
            window.App?.ui?.updateAllStats?.();
            window.App?.ui?.checkUpgradeAffordability?.();
            FEATURE_UNLOCKS.checkAllUnlocks();
            lastStatsUpdate = currentTime;
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

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
        
        
        // Prevent default touch behaviors that could interfere
        let touchStartTime = 0;
        window.isTouchClick = false;
        window.touchProcessed = false;
        
        sodaButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touchStartTime = Date.now();
            window.isTouchClick = true;
            window.touchProcessed = false;
            // Add visual feedback immediately
            sodaButton.classList.add('soda-clicked');
        }, { passive: false });

        sodaButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            const touchDuration = Date.now() - touchStartTime;
            
            // Only process if it was a short touch and hasn't been processed yet
            if (touchDuration < 300 && window.isTouchClick && !window.touchProcessed) {
                window.touchProcessed = true;
                // Get touch coordinates for feedback positioning
                const touch = e.changedTouches[0];
                const clickX = touch.clientX;
                const clickY = touch.clientY;
                // Directly trigger click logic for mobile since default click is prevented
                // Note: sodaClick function has been moved to UI system
            }
            
            // Remove visual feedback after a short delay
            setTimeout(() => {
                sodaButton.classList.remove('soda-clicked');
            }, 150);
            
            window.isTouchClick = false;
        }, { passive: false });

        // Prevent context menu on long press
        sodaButton.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        // Add touch-action CSS property for better mobile handling
        sodaButton.style.touchAction = 'manipulation';
        sodaButton.style.webkitTouchCallout = 'none';
        sodaButton.style.webkitUserSelect = 'none';
        sodaButton.style.userSelect = 'none';
        
        
    }
}

// Function moved to js/ui/displays.js - use App.ui.updateDrinkProgress()

function processDrink() {
    const currentTime = Date.now();
    if (currentTime - lastDrinkTime >= drinkRate) {
        // Add base sips per drink (configured value, regardless of straws/cups)
        const config = window.GAME_CONFIG?.BALANCE || {};
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        window.sips = window.sips.plus(baseSipsPerDrink);
        totalSipsEarned = totalSipsEarned.plus(baseSipsPerDrink);
        
        lastDrinkTime = currentTime;
        drinkProgress = 0;
        try {
            window.App?.stateBridge?.setLastDrinkTime(lastDrinkTime);
            window.App?.stateBridge?.setDrinkProgress(drinkProgress);
        } catch {}
        
        // Check for feature unlocks after processing a drink
        FEATURE_UNLOCKS.checkAllUnlocks();
        
        // Update auto-save counter based on configurable interval via system helper
        if (window.App?.systems?.autosave?.computeAutosaveCounter) {
            const { nextCounter, shouldSave } = window.App.systems.autosave.computeAutosaveCounter({
                enabled: autosaveEnabled,
                counter: autosaveCounter,
                intervalSec: autosaveInterval,
                drinkRateMs: drinkRate,
            });
            autosaveCounter = nextCounter;
            if (shouldSave) try { window.App?.systems?.save?.performSaveSnapshot?.(); } catch {}
        } else if (autosaveEnabled) {
            autosaveCounter += 1;
            const drinksPerSecond = 1000 / drinkRate;
            const drinksForAutosave = Math.ceil(autosaveInterval * drinksPerSecond);
            if (autosaveCounter >= drinksForAutosave) {
                try { window.App?.systems?.save?.performSaveSnapshot?.(); } catch {}
                autosaveCounter = 1;
            }
        }
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
    window.totalClicks++;
    const now = Date.now();
    
    // Track click streak
    const config = window.GAME_CONFIG?.TIMING || {};
    const clickStreakWindow = config.CLICK_STREAK_WINDOW;
    if (now - lastClickTime < clickStreakWindow) { // Within configured time window
        currentClickStreak++;
        if (currentClickStreak > bestClickStreak) {
            bestClickStreak = currentClickStreak;
        }
    } else {
        currentClickStreak = 1;
    }
    
    lastClickTime = now;
    clickTimes.push(now);
    
    // Keep only last configured number of clicks for performance
    const maxClickTimes = window.GAME_CONFIG.LIMITS.MAX_CLICK_TIMES;
    if (clickTimes.length > maxClickTimes) {
        clickTimes.shift();
    }
    
    // Play button click sound effect
    try { window.App?.systems?.audio?.button?.playButtonClickSound?.(); } catch {}
    
    // Update stats display if stats tab is active
    if (DOM_CACHE.statsTab && DOM_CACHE.statsTab.classList.contains('active')) {
        try { window.App?.ui?.updateClickStats?.(); } catch {}
    }
}

// ============================================================================
// GLOBAL WRAPPER FUNCTIONS FOR HTML ONCLICK HANDLERS
// These functions bridge the HTML onclick handlers with the modular architecture
// ============================================================================

// Purchase wrapper functions
function buyStraw() {
    try {
        if (!window.App?.systems?.purchases?.purchaseStraw) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.purchaseStraw({
            sips: window.sips,
            straws: window.straws
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent);
            window.straws = result.straws;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, { item: 'straw', cost: result.spent }); } catch {}
        }
    } catch (error) {
        console.error('Error in buyStraw:', error);
    }
}

function buyCup() {
    try {
        if (!window.App?.systems?.purchases?.purchaseCup) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.purchaseCup({
            sips: window.sips,
            cups: window.cups
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent);
            window.cups = result.cups;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, { item: 'cup', cost: result.spent }); } catch {}
        }
    } catch (error) {
        console.error('Error in buyCup:', error);
    }
}

function buySuction() {
    try {
        if (!window.App?.systems?.purchases?.purchaseSuction) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.purchaseSuction({
            sips: window.sips,
            suctions: window.suctions
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent);
            window.suctions = result.suctions;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, { item: 'suction', cost: result.spent }); } catch {}
        }
    } catch (error) {
        console.error('Error in buySuction:', error);
    }
}

function buyCriticalClick() {
    try {
        if (!window.App?.systems?.purchases?.purchaseCriticalClick) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.purchaseCriticalClick({
            sips: window.sips,
            criticalClicks: window.criticalClicks,
            criticalClickChance: window.criticalClickChance
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent);
            window.criticalClicks = result.criticalClicks;
            window.criticalClickChance = result.criticalClickChance;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, { item: 'criticalClick', cost: result.spent }); } catch {}
        }
    } catch (error) {
        console.error('Error in buyCriticalClick:', error);
    }
}

function buyFasterDrinks() {
    try {
        if (!window.App?.systems?.purchases?.purchaseFasterDrinks) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.purchaseFasterDrinks({
            sips: window.sips,
            fasterDrinks: window.fasterDrinks
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent);
            window.fasterDrinks = result.fasterDrinks;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, { item: 'fasterDrinks', cost: result.spent }); } catch {}
        }
    } catch (error) {
        console.error('Error in buyFasterDrinks:', error);
    }
}

function buyWiderStraws() {
    try {
        if (!window.App?.systems?.purchases?.purchaseWiderStraws) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.purchaseWiderStraws({
            sips: window.sips,
            widerStraws: window.widerStraws
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent);
            window.widerStraws = result.widerStraws;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, { item: 'widerStraws', cost: result.spent }); } catch {}
        }
    } catch (error) {
        console.error('Error in buyWiderStraws:', error);
    }
}

function buyBetterCups() {
    try {
        if (!window.App?.systems?.purchases?.purchaseBetterCups) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.purchaseBetterCups({
            sips: window.sips,
            betterCups: window.betterCups
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent);
            window.betterCups = result.betterCups;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, { item: 'betterCups', cost: result.spent }); } catch {}
        }
    } catch (error) {
        console.error('Error in buyBetterCups:', error);
    }
}

// Upgrade wrapper functions
function upgradeFasterDrinks() {
    try {
        if (!window.App?.systems?.purchases?.upgradeFasterDrinks) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.upgradeFasterDrinks({
            sips: window.sips,
            fasterDrinksUpCounter: window.fasterDrinksUpCounter
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent);
            window.fasterDrinksUpCounter = result.fasterDrinksUpCounter;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.UPGRADE_PURCHASED, { item: 'fasterDrinksUp', cost: result.spent }); } catch {}
        }
    } catch (error) {
        console.error('Error in upgradeFasterDrinks:', error);
    }
}

// Other game functions
function sodaClick(multiplier = 1) {
    try {
        // Track the click
        trackClick();
        
        // Calculate base click value
        const baseClickValue = new Decimal(1);
        const suctionBonus = new Decimal(window.suctions || 0) * 0.3;
        const totalClickValue = baseClickValue.plus(suctionBonus).times(multiplier);
        
        // Add to sips
        window.sips = window.sips.plus(totalClickValue);
        
        // Check for critical click
        const criticalChance = window.criticalClickChance || 0;
        if (Math.random() < criticalChance) {
            const criticalMultiplier = window.criticalClickMultiplier || 5;
            const criticalBonus = totalClickValue.times(criticalMultiplier - 1);
            window.sips = window.sips.plus(criticalBonus);
            
            // Emit critical click event
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.CLICK?.CRITICAL, { bonus: criticalBonus }); } catch {}
        }
        
        // Emit click event
        try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.CLICK?.SODA, { value: totalClickValue }); } catch {}
        
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
        if (!window.App?.systems?.purchases?.levelUp) {
            console.warn('Purchase system not available');
            return;
        }
        
        const result = window.App.systems.purchases.levelUp({
            sips: window.sips,
            level: window.level,
            sipsPerDrink: window.sipsPerDrink
        });
        
        if (result) {
            // Update global state
            window.sips = window.sips.minus(result.spent).plus(result.sipsGained);
            window.level = result.level;
            
            // Trigger UI updates
            try { window.App?.ui?.checkUpgradeAffordability?.(); } catch {}
            try { window.App?.ui?.updateAllStats?.(); } catch {}
            
            // Emit events
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, { item: 'levelUp', cost: result.spent, gained: result.sipsGained }); } catch {}
        }
    } catch (error) {
        console.error('Error in levelUp:', error);
    }
}

function save() {
    try {
        if (window.App?.systems?.save?.performSaveSnapshot) {
            window.App.systems.save.performSaveSnapshot();
        } else {
            console.warn('Save system not available');
        }
    } catch (error) {
        console.error('Error in save:', error);
    }
}

function delete_save() {
    try {
        if (window.App?.storage?.deleteGame) {
            window.App.storage.deleteGame();
            // Reload the page after deletion
            window.location.reload();
        } else {
            console.warn('Storage system not available');
        }
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
    clickSoundsEnabled = !clickSoundsEnabled;
    
    // Save preference to localStorage
    try {
        if (window.App?.storage?.setBoolean) {
            window.App.storage.setBoolean('clickSoundsEnabled', clickSoundsEnabled);
        } else {
            localStorage.setItem('clickSoundsEnabled', clickSoundsEnabled.toString());
        }
    } catch (e) {
        console.warn('persist clickSoundsEnabled failed:', e);
    }
    
    // Update UI if there's a toggle button
    if (window.App?.ui?.updateClickSoundsToggleText) {
        try { window.App.ui.updateClickSoundsToggleText(!!clickSoundsEnabled); } catch {}
    } else {
        const toggleButton = document.getElementById('clickSoundsToggle');
        if (toggleButton) {
            toggleButton.textContent = clickSoundsEnabled ? '🔊 Click Sounds ON' : '🔇 Click Sounds OFF';
            toggleButton.classList.toggle('sounds-off', !clickSoundsEnabled);
        }
    }
}

// Load click sounds preference from storage
function loadClickSoundsPreference() {
    try {
        if (window.App?.storage?.getBoolean) {
            clickSoundsEnabled = window.App.storage.getBoolean('clickSoundsEnabled', true);
        } else {
            const saved = localStorage.getItem('clickSoundsEnabled');
            if (saved !== null) {
                clickSoundsEnabled = saved === 'true';
            }
        }
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
    try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.OPTIONS?.AUTOSAVE_TOGGLED, { enabled: autosaveEnabled }); } catch {}
    try { window.App?.systems?.options?.saveOptions?.({ autosaveEnabled, autosaveInterval }); } catch {}
    try { window.App?.ui?.updateAutosaveStatus?.(); } catch {}
}

function changeAutosaveInterval() {
    const select = document.getElementById('autosaveInterval');
    autosaveInterval = parseInt(select?.value || autosaveInterval, 10);
    autosaveCounter = 0; // Reset counter when changing interval
    try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.OPTIONS?.AUTOSAVE_INTERVAL_CHANGED, { seconds: autosaveInterval }); } catch {}
    try { window.App?.systems?.options?.saveOptions?.({ autosaveEnabled, autosaveInterval }); } catch {}
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

// Purchase functions
window.buyStraw = buyStraw;
window.buyCup = buyCup;
window.buySuction = buySuction;
window.buyCriticalClick = buyCriticalClick;
window.buyFasterDrinks = buyFasterDrinks;
window.buyWiderStraws = buyWiderStraws;
window.buyBetterCups = buyBetterCups;

// Upgrade functions
window.upgradeFasterDrinks = upgradeFasterDrinks;

// Game functions
window.sodaClick = sodaClick;
window.levelUp = levelUp;
window.save = save;
window.delete_save = delete_save;
window.toggleButtonSounds = toggleClickSounds;
window.sendMessage = sendMessage;
window.startGame = startGame;

console.log('✅ Global wrapper functions assigned to window object');