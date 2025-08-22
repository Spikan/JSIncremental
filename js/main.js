// Soda Clicker Pro - Main Game Logic
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
let betterCups = new Decimal(0);

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
let fasterDrinksUpCounter = new Decimal(1);

// Critical Click system variables - IMPROVED BALANCE
    let criticalClickChance = new Decimal(window.GAME_CONFIG.BALANCE.CRITICAL_CLICK_BASE_CHANCE); // 0.1% base chance (10x higher)
    let criticalClickMultiplier = new Decimal(window.GAME_CONFIG.BALANCE.CRITICAL_CLICK_BASE_MULTIPLIER); // 5x multiplier (more balanced)
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
        updateAllStats();
    }
    
    // Update unlocks when switching to the unlocks tab
    if (tabName === 'unlocks') {
        FEATURE_UNLOCKS.updateUnlocksTab();
    }
}

// Make switchTab globally available for HTML onclick attributes
window.switchTab = switchTab;

// Check if upgrades are affordable and update UI accordingly
function checkUpgradeAffordability() {
    // IMPROVED BALANCE: Updated costs to match new progression system
    const config = window.GAME_CONFIG?.BALANCE || {};
            const strawCost = Math.floor(config.STRAW_BASE_COST * Math.pow(config.STRAW_SCALING, straws.toNumber()));
        const cupCost = Math.floor(config.CUP_BASE_COST * Math.pow(config.CUP_SCALING, cups.toNumber()));
        const suctionCost = Math.floor(config.SUCTION_BASE_COST * Math.pow(config.SUCTION_SCALING, suctions.toNumber()));
        const fasterDrinksCost = Math.floor(config.FASTER_DRINKS_BASE_COST * Math.pow(config.FASTER_DRINKS_SCALING, fasterDrinks.toNumber()));
        const criticalClickCost = Math.floor(config.CRITICAL_CLICK_BASE_COST * Math.pow(config.CRITICAL_CLICK_SCALING, criticalClicks.toNumber()));
        const widerStrawsCost = Math.floor(config.WIDER_STRAWS_BASE_COST * Math.pow(config.WIDER_STRAWS_SCALING, widerStraws.toNumber()));
        const betterCupsCost = Math.floor(config.BETTER_CUPS_BASE_COST * Math.pow(config.BETTER_CUPS_SCALING, betterCups.toNumber()));
        const fasterDrinksUpCost = config.FASTER_DRINKS_UPGRADE_BASE_COST * fasterDrinksUpCounter.toNumber();
        const criticalClickUpCost = config.CRITICAL_CLICK_UPGRADE_BASE_COST * criticalClickUpCounter.toNumber();
        const levelUpCost = config.LEVEL_UP_BASE_COST * Math.pow(config.LEVEL_UP_SCALING, level.toNumber());
    

    

    
    // Update button states based on affordability
            updateButtonState('buyStraw', window.sips.gte(strawCost), strawCost);
        updateButtonState('buyCup', window.sips.gte(cupCost), cupCost);
        updateButtonState('buySuction', window.sips.gte(suctionCost), suctionCost);
        updateButtonState('buyFasterDrinks', window.sips.gte(fasterDrinksCost), fasterDrinksCost);
        updateButtonState('buyCriticalClick', window.sips.gte(criticalClickCost), criticalClickCost);
        updateButtonState('buyWiderStraws', window.sips.gte(widerStrawsCost), widerStrawsCost);
        updateButtonState('buyBetterCups', window.sips.gte(betterCupsCost), betterCupsCost);
        updateButtonState('upgradeFasterDrinks', window.sips.gte(fasterDrinksUpCost), fasterDrinksUpCost);
        updateButtonState('upgradeCriticalClick', window.sips.gte(criticalClickUpCost), criticalClickUpCost);
        updateButtonState('levelUp', window.sips.gte(levelUpCost), levelUpCost);
    
    // Update cost displays with affordability indicators
            updateCostDisplay('strawCost', strawCost, window.sips.gte(strawCost));
        updateCostDisplay('cupCost', cupCost, window.sips.gte(cupCost));
        updateCostDisplay('suctionCost', suctionCost, window.sips.gte(suctionCost));
        updateCostDisplay('fasterDrinksCost', fasterDrinksCost, window.sips.gte(fasterDrinksCost));
        updateCostDisplay('criticalClickCost', criticalClickCost, window.sips.gte(criticalClickCost));
        updateCostDisplay('widerStrawsCost', widerStrawsCost, window.sips.gte(widerStrawsCost));
        updateCostDisplay('betterCupsCost', betterCupsCost, window.sips.gte(betterCupsCost));
        updateCostDisplay('fasterDrinksUpCost', fasterDrinksUpCost, window.sips.gte(fasterDrinksUpCost));
        updateCostDisplay('criticalClickUpCost', criticalClickUpCost, window.sips.gte(criticalClickUpCost));
        updateCostDisplay('levelCost', levelUpCost, window.sips.gte(levelUpCost));
    
    // Update compact clicking upgrade displays
    updateCostDisplay('suctionCostCompact', suctionCost, window.sips.gte(suctionCost));
    updateCostDisplay('criticalClickCostCompact', criticalClickCost, window.sips.gte(criticalClickCost));
    // Update compact drink speed upgrade displays
    updateCostDisplay('fasterDrinksCostCompact', fasterDrinksCost, window.sips.gte(fasterDrinksCost));
    updateCostDisplay('fasterDrinksUpCostCompact', fasterDrinksUpCost, window.sips.gte(fasterDrinksUpCost));
}

// Update button state based on affordability
function updateButtonState(buttonId, isAffordable, cost) {
    // Try multiple selectors to find the button
    let button = null;
    
    // First try to find by onclick attribute
    button = document.querySelector(`button[onclick*="${buttonId}"]`);
    
    // If not found, try to find by button text content or other attributes
    if (!button) {
        // For shop buttons, try to find by the cost span ID pattern
        if (buttonId.startsWith('buy')) {
            const costElementId = buttonId.replace('buy', '') + 'Cost';
            const costElement = document.getElementById(costElementId);
            if (costElement) {
                button = costElement.closest('button');
            }
        } else if (buttonId.startsWith('upgrade')) {
            const costElementId = buttonId.replace('upgrade', '') + 'UpCost';
            const costElement = document.getElementById(costElementId);
            if (costElement) {
                button = costElement.closest('button');
            }
        }
    }
    
    if (button) {
        if (isAffordable) {
            button.classList.remove('disabled');
            button.classList.add('affordable');
            button.title = `Click to purchase for ${prettify(cost)} Sips`;
        } else {
            button.classList.remove('affordable');
            button.classList.add('disabled');
            button.title = `Costs ${prettify(cost)} Sips (You have ${prettify(window.sips)})`;
        }
    }
    
    // Also update compact clicking upgrade buttons if they exist
    if (buttonId === 'buySuction') {
        const compactButton = document.querySelector('.clicking-upgrade-btn[onclick*="buySuction"]');
        if (compactButton) {
            if (isAffordable) {
                compactButton.classList.remove('disabled');
                compactButton.classList.add('affordable');
            } else {
                compactButton.classList.remove('affordable');
                compactButton.classList.add('disabled');
            }
        }
    }
    
    if (buttonId === 'buyCriticalClick') {
        const compactButton = document.querySelector('.clicking-upgrade-btn[onclick*="buyCriticalClick"]');
        if (compactButton) {
            if (isAffordable) {
                compactButton.classList.remove('disabled');
                compactButton.classList.add('affordable');
            } else {
                compactButton.classList.remove('affordable');
                compactButton.classList.add('disabled');
            }
        }
    }
    
    // Also update compact drink speed upgrade button if it exists
    if (buttonId === 'buyFasterDrinks') {
        const compactButton = document.querySelector('.drink-speed-upgrade-btn[onclick*="buyFasterDrinks"]');
        if (compactButton) {
            if (isAffordable) {
                compactButton.classList.remove('disabled');
                compactButton.classList.add('affordable');
            } else {
                compactButton.classList.remove('affordable');
                compactButton.classList.add('disabled');
            }
        }
    }
    
    // Also update compact drink speed upgrade button if it exists
    if (buttonId === 'upgradeFasterDrinks') {
        const compactButton = document.querySelector('.drink-speed-upgrade-btn[onclick*="upgradeFasterDrinks"]');
        if (compactButton) {
            if (isAffordable) {
                compactButton.classList.remove('disabled');
                compactButton.classList.add('affordable');
            } else {
                compactButton.classList.remove('affordable');
                compactButton.classList.add('disabled');
            }
        }
    }
}

// Update cost display with affordability indicators
function updateCostDisplay(elementId, cost, isAffordable) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isAffordable) {
            element.classList.remove('cost-too-high');
            element.classList.add('cost-affordable');
        } else {
            element.classList.remove('cost-affordable');
            element.classList.add('cost-too-high');
        }
    }
}

function initGame() {
    
    
    try {
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
        updateDrinkRate();

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
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();

        // Initialize progressive feature unlock system after game variables are set up
        
        FEATURE_UNLOCKS.init();

        
        // Call reload to initialize the game
        reload();
        
        // Start the game loop
        startGameLoop();
        
        // Setup mobile touch handling for reliable click feedback
        setupMobileTouchHandling();
        
        // Update critical click display with initial value
        updateCriticalClickDisplay()
        
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
}

function startGameLoop() {
    if (window.App?.systems?.loop?.start) {
        window.App.systems.loop.start({
            updateDrinkProgress,
            processDrink,
            updateStats: () => { updatePlayTime(); updateLastSaveTime(); updateAllStats(); checkUpgradeAffordability(); FEATURE_UNLOCKS.checkAllUnlocks(); },
            updatePlayTime,
            updateLastSaveTime,
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
            updateDrinkProgress();
            processDrink();
            const affordabilityInterval = window.GAME_CONFIG.LIMITS.AFFORDABILITY_CHECK_INTERVAL;
            if (currentTime - lastUpdate >= affordabilityInterval) {
                checkUpgradeAffordability();
            }
            lastUpdate = currentTime;
        }
        if (currentTime - lastStatsUpdate >= statsInterval) {
            updatePlayTime();
            updateLastSaveTime();
            updateAllStats();
            checkUpgradeAffordability();
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
                // Directly trigger click logic for mobile since default click is prevented
                try { sodaClick(1); } catch {}
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

function updateDrinkProgress() {
    const currentTime = Date.now();
    const timeSinceLastDrink = currentTime - lastDrinkTime;
    drinkProgress = (timeSinceLastDrink / drinkRate) * 100;
    try { window.App?.stateBridge?.setDrinkProgress(drinkProgress); } catch {}
    
    // Cache DOM elements to reduce queries
    const progressFill = DOM_CACHE.drinkProgressFill;
    const countdown = DOM_CACHE.drinkCountdown;
    
    if (progressFill && countdown) {
        // Use requestAnimationFrame for smoother progress bar updates
        requestAnimationFrame(() => {
            progressFill.style.width = Math.min(drinkProgress, 100) + '%';
            
            // Update countdown text
            const remainingTime = Math.max(0, (drinkRate - timeSinceLastDrink) / 1000);
            if (window.App?.ui?.updateCountdownText) {
                try { window.App.ui.updateCountdownText(remainingTime); } catch {}
            } else {
                countdown.textContent = remainingTime.toFixed(1) + 's';
            }
            
            // Update progress bar colors based on completion
            const config = window.GAME_CONFIG?.LIMITS || {};
                    const nearlyCompleteThreshold = config.PROGRESS_BAR_NEARLY_COMPLETE;
        const completeThreshold = config.PROGRESS_BAR_COMPLETE;
            
            progressFill.classList.remove('nearly-complete', 'complete');
            if (drinkProgress >= completeThreshold) {
                progressFill.classList.add('complete');
            } else if (drinkProgress >= nearlyCompleteThreshold) {
                progressFill.classList.add('nearly-complete');
            }
        });
    } else {
        console.log('Drink progress elements not found:', {
            progressFill: !!progressFill,
            countdown: !!countdown,
            drinkProgress: drinkProgress,
            drinkRate: drinkRate
        });
    }
}

function processDrink() {
    const currentTime = Date.now();
    if (currentTime - lastDrinkTime >= drinkRate) {
        // Process the drink
        spsClick(sps);
        
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
            if (shouldSave) save();
        } else if (autosaveEnabled) {
            autosaveCounter += 1;
            const drinksPerSecond = 1000 / drinkRate;
            const drinksForAutosave = Math.ceil(autosaveInterval * drinksPerSecond);
            if (autosaveCounter >= drinksForAutosave) {
                save();
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
function updateDrinkRate() {
    const config = window.GAME_CONFIG?.BALANCE || {};
    // Each faster drink reduces time by configured percentage
    // Each upgrade increases the effectiveness
            let totalReduction = fasterDrinks.times(fasterDrinksUpCounter).times(config.FASTER_DRINKS_REDUCTION_PER_LEVEL);
        let newDrinkRate = DEFAULT_DRINK_RATE * (1 - totalReduction.toNumber());
        
        // Ensure drink rate doesn't go below configured minimum
        const minDrinkRate = config.MIN_DRINK_RATE;
    newDrinkRate = Math.max(minDrinkRate, newDrinkRate);
    
    setDrinkRate(newDrinkRate);
    
    // Update the top sips per drink display
    updateTopSipsPerDrink();
    updateTopSipsPerSecond();
}

// Function to get current drink rate in seconds
function getDrinkRateSeconds() {
    return drinkRate / 1000;
}

// Function to update the top sips per drink display
function updateTopSipsPerDrink() {
    if (window.App?.ui?.updateTopSipsPerDrink) { try { return window.App.ui.updateTopSipsPerDrink(); } catch {}
    }
    const topSipsPerDrinkElement = DOM_CACHE.topSipsPerDrink;
    if (topSipsPerDrinkElement) {
        // Show total sips per drink (base configured value + passive production from straws and cups)
        // Base sips per drink is configured value, regardless of upgrades
        const config = window.GAME_CONFIG?.BALANCE || {};
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        
        // Passive production per drink (from straws and cups)
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        
        // Total sips per drink = base + passive
        const totalSipsPerDrink = baseSipsPerDrink.plus(passiveSipsPerDrink);
        
        
        topSipsPerDrinkElement.textContent = prettify(totalSipsPerDrink);
    }
}

// Function to update the top total sips per second display (passive production only)
function updateTopSipsPerSecond() {
    if (window.App?.ui?.updateTopSipsPerSecond) { try { return window.App.ui.updateTopSipsPerSecond(); } catch {}
    }
    const topSipsPerSecondElement = DOM_CACHE.topSipsPerSecond;
    if (topSipsPerSecondElement) {
        // Calculate total sips per second from all sources
        // Base sips per drink is configured value, regardless of upgrades
        const config = window.GAME_CONFIG?.BALANCE || {};
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        
        // Passive production per drink (strawSPD and cupSPD are per drink, not per second)
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        
        // Total sips per drink = base + passive
        const totalSipsPerDrink = baseSipsPerDrink.plus(passiveSipsPerDrink);
        
        // Convert to actual sips per second by dividing by drink rate in seconds
        const drinkRateSeconds = drinkRate / 1000;
        const totalSipsPerSecond = totalSipsPerDrink.div(drinkRateSeconds);

        

        topSipsPerSecondElement.textContent = prettify(totalSipsPerSecond);
    }
}

// Function to update the critical click chance display
function updateCriticalClickDisplay() {
    if (window.App?.ui?.updateCriticalClickDisplay) { try { return window.App.ui.updateCriticalClickDisplay(); } catch {}
    }
    const criticalClickChanceCompact = document.getElementById('criticalClickChanceCompact');
    if (criticalClickChanceCompact) {
        // Display current critical click chance as percentage
        const chancePercent = criticalClickChance.times(100).toFixed(3);
        criticalClickChanceCompact.textContent = chancePercent;
    }
}

// Auto-save management functions
function toggleAutosave() {
    const checkbox = document.getElementById('autosaveToggle');
    autosaveEnabled = !!(checkbox && checkbox.checked);
    try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.OPTIONS?.AUTOSAVE_TOGGLED, { enabled: autosaveEnabled }); } catch {}
    saveOptions();
    updateAutosaveStatus();
}

function changeAutosaveInterval() {
    const select = document.getElementById('autosaveInterval');
    autosaveInterval = parseInt(select?.value || autosaveInterval, 10);
    autosaveCounter = 0; // Reset counter when changing interval
    try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.OPTIONS?.AUTOSAVE_INTERVAL_CHANGED, { seconds: autosaveInterval }); } catch {}
    saveOptions();
    updateAutosaveStatus();
}

function updateAutosaveStatus() {
    if (window.App?.ui?.updateAutosaveStatus) { try { return window.App.ui.updateAutosaveStatus(); } catch {} }
}

function saveOptions() {
    const options = { autosaveEnabled, autosaveInterval };
    try { if (window.App?.systems?.options?.saveOptions) { window.App.systems.options.saveOptions(options); return; } } catch {}
    try { localStorage.setItem('gameOptions', JSON.stringify(options)); } catch {}
}

function loadOptions() {
    const defaults = { autosaveEnabled: true, autosaveInterval: window.GAME_CONFIG.TIMING.AUTOSAVE_INTERVAL };
    let options = null;
    try { if (window.App?.systems?.options?.loadOptions) { options = window.App.systems.options.loadOptions(defaults); } } catch {}
    if (!options) { try { const saved = localStorage.getItem('gameOptions'); options = saved ? { ...defaults, ...JSON.parse(saved) } : defaults; } catch { options = defaults; } }
    autosaveEnabled = options.autosaveEnabled !== undefined ? options.autosaveEnabled : true;
    autosaveInterval = options.autosaveInterval || window.GAME_CONFIG.TIMING.AUTOSAVE_INTERVAL;
    const checkbox = document.getElementById('autosaveToggle');
    const select = document.getElementById('autosaveInterval');
    if (checkbox) checkbox.checked = autosaveEnabled;
    if (select) select.value = String(autosaveInterval);
    updateAutosaveStatus();
}

// Play time tracking
function updatePlayTime() { if (window.App?.ui?.updatePlayTime) { try { return window.App.ui.updatePlayTime(); } catch {} } }

function updateLastSaveTime() { if (window.App?.ui?.updateLastSaveTime) { try { return window.App.ui.updateLastSaveTime(); } catch {} } }

// Statistics update functions
function updateAllStats() { if (window.App?.ui?.updateAllStats) { try { return window.App.ui.updateAllStats(); } catch {} } }

function updateTimeStats() { if (window.App?.ui?.updateTimeStats) { try { return window.App.ui.updateTimeStats(); } catch {} } }

function updateClickStats() { if (window.App?.ui?.updateClickStats) { try { return window.App.ui.updateClickStats(); } catch {} } }

function updateEconomyStats() { if (window.App?.ui?.updateEconomyStats) { try { return window.App.ui.updateEconomyStats(); } catch {} } }

function updateShopStats() { if (window.App?.ui?.updateShopStats) { try { return window.App.ui.updateShopStats(); } catch {} } }

function updateAchievementStats() { if (window.App?.ui?.updateAchievementStats) { try { return window.App.ui.updateAchievementStats(); } catch {} } }

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
        updateClickStats();
    }
}



// Generate a deep purchase sound for shop upgrades (OLD COMPLEX VERSION - DISABLED)

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
function updateDrinkSpeedDisplay() {
    if (window.App?.ui?.updateDrinkSpeedDisplay) { try { return window.App.ui.updateDrinkSpeedDisplay(); } catch {} }
}

// Function to update crit chance stat


let regSoda = new Image();
regSoda.src = "images/regSoda.png";
let moSoda = new Image();
moSoda.src = "images/moSoda.png";
let clickSoda = new Image();
clickSoda.src = "images/clickSoda.png";


function sodaClick(number) {
    // Track the click
    trackClick();
    
    // Check for critical click
    let isCritical = false;
    let criticalMultiplier = new Decimal(1);
    
    if (Math.random() < criticalClickChance.toNumber()) {
        isCritical = true;
        criticalMultiplier = criticalClickMultiplier;
        criticalClicks = criticalClicks.plus(1);
        try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.CLICK?.CRITICAL, { multiplier: criticalMultiplier.toString() }); } catch {}
        
        // Play critical button click sound
        try { window.App?.systems?.audio?.button?.playButtonCriticalClickSound?.(); } catch {}
        
        
    }
    
    // Calculate total sips gained from this click (use systems if available)
    let totalSipsGained;
    if (window.App?.systems?.clicks?.performClick) {
        const result = window.App.systems.clicks.performClick({
            baseClick: number,
            suctionBonus: suctionClickBonus,
            criticalChance: criticalClickChance.toNumber(),
            criticalMultiplier: criticalMultiplier,
        });
        totalSipsGained = new Decimal(result.gained);
        isCritical = result.critical;
    } else {
        const baseSips = new Decimal(number);
        totalSipsGained = baseSips.plus(suctionClickBonus).times(criticalMultiplier);
    }
    try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.CLICK?.SODA, { gained: totalSipsGained, critical: isCritical }); } catch {}
    
    // Add to total sips earned
    totalSipsEarned = totalSipsEarned.plus(totalSipsGained);

    // Update sips using mutations if available
    if (window.App?.mutations?.addSips) {
        window.sips = new Decimal(window.App.mutations.addSips(window.sips, totalSipsGained));
    } else {
        window.sips = window.sips.plus(totalSipsGained);
    }
    
    // Batch DOM updates to reduce layout thrashing
    requestAnimationFrame(() => {

        
        // Update top sip counter
        try { window.App?.ui?.updateTopSipCounter?.(); } catch {}
        {
            const topSipElement = DOM_CACHE.topSipValue;
            if (topSipElement) {
                const val = (typeof window.prettify === 'function') ? window.prettify(window.sips) : (window.sips?.toString?.() ?? String(window.sips));
                topSipElement.textContent = val;
            }
        }
        
        // Click feedback is emitted via CLICK.SODA event and handled by UI
        
        // Visual feedback with smoother image transition
        const sodaButton = DOM_CACHE.sodaButton;
        if (sodaButton) {
            // Add a CSS class for the click effect instead of changing src
            sodaButton.classList.add('soda-clicked');
            
                    // Remove the class after animation completes
        const config = window.GAME_CONFIG?.TIMING || {};
        const animationDuration = config.SODA_CLICK_ANIMATION_DURATION;
        setTimeout(() => {
            sodaButton.classList.remove('soda-clicked');
        }, animationDuration);
        }
    });
    
    // Update upgrade affordability (includes level up button state)
    if (window.App?.ui?.checkUpgradeAffordability) {
        window.App.ui.checkUpgradeAffordability();
    } else {
        checkUpgradeAffordability();
    }
    
    // Check for feature unlocks after clicking
    FEATURE_UNLOCKS.checkAllUnlocks();
}

// Function to show click feedback numbers
function showClickFeedback(sipsGained, isCritical = false) {
    if (window.App?.ui?.showClickFeedback) { try { return window.App.ui.showClickFeedback(sipsGained, isCritical); } catch {}
    }
}

// Helper function for legacy feedback
function showLegacyFeedbackWithContainer(sipsGained, isCritical, sodaContainer) {

    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = isCritical ? 'click-feedback critical-feedback' : 'click-feedback';
    feedback.textContent = (isCritical ? '💥 CRITICAL! +' : '+') + prettify(sipsGained);

    // Accessibility improvements
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-label', isCritical ?
        `Critical hit! Gained ${prettify(sipsGained)} sips` :
        `Gained ${prettify(sipsGained)} sips`
    );

    // Use fixed positioning for consistent viewport positioning
    const containerRect = sodaContainer.getBoundingClientRect();
    const config = window.GAME_CONFIG?.LIMITS || {};
    const rangeX = config.CLICK_FEEDBACK_RANGE_X || 100;
    const rangeY = config.CLICK_FEEDBACK_RANGE_Y || 80;
    const randomX = (Math.random() - 0.5) * rangeX; // -rangeX/2px to +rangeX/2px
    const randomY = (Math.random() - 0.5) * rangeY;  // -rangeY/2px to +rangeY/2px

    feedback.style.cssText = `
        position: fixed;
        left: ${containerRect.left + containerRect.width/2 + randomX}px;
        top: ${containerRect.top + containerRect.height/2 + randomY}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 1000;
        font-weight: bold;
        font-size: ${isCritical ? '1.5em' : '1.2em'};
        color: ${isCritical ? '#ff6b35' : '#4CAF50'};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        animation: clickFeedback 2s ease-out forwards;
    `;

    // Add to body for proper positioning
    document.body.appendChild(feedback);

    // Remove after animation
    const config2 = window.GAME_CONFIG?.TIMING || {};
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, isCritical ?
        (config2.CRITICAL_FEEDBACK_DURATION || 2500) :
        (config2.CLICK_FEEDBACK_DURATION || 2000)
    );
}

function spsClick(amount) {
            window.sips = window.sips.plus(amount);
    
    // Track passive income in total sips earned
    totalSipsEarned = totalSipsEarned.plus(amount);
    
    // Update highest SPS if current is higher
    // Include base configured sips per drink in the calculation
    const config = window.GAME_CONFIG?.BALANCE || {};
    const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
    const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
    const totalSipsPerDrink = baseSipsPerDrink.plus(passiveSipsPerDrink);
    
    const drinkRateSeconds = drinkRate / 1000;
    const currentSPS = totalSipsPerDrink.div(drinkRateSeconds);
    if (currentSPS.gt(highestSipsPerSecond)) {
        highestSipsPerSecond = currentSPS;
    }
    
    // Update top sip counter
    if (window.App?.ui?.updateTopSipCounter) { try { window.App.ui.updateTopSipCounter(); } catch {}
    } else {
        const topSipElement = DOM_CACHE.topSipValue;
        if (topSipElement) {
            topSipElement.innerHTML = prettify(window.sips);
        }
    }
    
    // Update critical click display
    updateCriticalClickDisplay();
}

function buyStraw() {
    const sys = window.App?.systems?.purchases;
    if (!sys?.purchaseStraw) return;
    const res = sys.purchaseStraw({
                sips: window.sips.toNumber(),
                straws: straws.toNumber(),
                cups: cups.toNumber(),
                widerStraws: widerStraws.toNumber(),
                betterCups: betterCups.toNumber(),
            });
    if (!res) return;
    window.sips = window.sips.minus(res.spent);
    straws = new Decimal(res.straws);
    window.straws = straws;
                strawSPD = new Decimal(res.strawSPD);
    cupSPD = new Decimal(res.cupSPD);
                sps = new Decimal(res.sipsPerDrink);
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
    showPurchaseFeedback('Extra Straw', res.spent);
        reload();
        checkUpgradeAffordability();
}



function buyCup() {
    const sys = window.App?.systems?.purchases;
    if (!sys?.purchaseCup) return;
    const res = sys.purchaseCup({
                sips: window.sips.toNumber(),
                straws: straws.toNumber(),
                cups: cups.toNumber(),
                widerStraws: widerStraws.toNumber(),
                betterCups: betterCups.toNumber(),
            });
    if (!res) return;
    window.sips = window.sips.minus(res.spent);
    cups = new Decimal(res.cups);
    window.cups = cups;
    strawSPD = new Decimal(res.strawSPD);
                cupSPD = new Decimal(res.cupSPD);
                sps = new Decimal(res.sipsPerDrink);
    updateTopSipsPerDrink();
    updateTopSipsPerSecond();
    try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
    showPurchaseFeedback('Bigger Cup', res.spent);
    reload();
    checkUpgradeAffordability();
}

function buyWiderStraws() {
    // Prefer centralized purchases system when available
    if (window.App?.systems?.purchases?.purchaseWiderStraws) {
        const res = window.App.systems.purchases.purchaseWiderStraws({
            sips: window.sips.toNumber(),
                straws: straws.toNumber(),
                cups: cups.toNumber(),
                widerStraws: widerStraws.toNumber(),
                betterCups: betterCups.toNumber(),
            });
        if (res) {
            if (window.App?.mutations?.subtractSips) {
                window.sips = new Decimal(window.App.mutations.subtractSips(window.sips, res.spent));
        } else {
                window.sips = window.sips.minus(res.spent);
            }
            widerStraws = new Decimal(res.widerStraws);
            strawSPD = new Decimal(res.strawSPD);
            cupSPD = new Decimal(res.cupSPD);
            sps = new Decimal(res.sipsPerDrink);
        updateTopSipsPerDrink();
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
            showPurchaseFeedback('Wider Straws Upgrade', res.spent);
        reload();
        checkUpgradeAffordability();
            return;
        }
    }
    
}

function buyBetterCups() {
    if (window.App?.systems?.purchases?.purchaseBetterCups) {
        const res = window.App.systems.purchases.purchaseBetterCups({
            sips: window.sips.toNumber(),
            straws: straws.toNumber(),
            cups: cups.toNumber(),
            widerStraws: widerStraws.toNumber(),
            betterCups: betterCups.toNumber(),
        });
        if (res) {
            if (window.App?.mutations?.subtractSips) {
                window.sips = new Decimal(window.App.mutations.subtractSips(window.sips, res.spent));
            } else {
                window.sips = window.sips.minus(res.spent);
            }
            betterCups = new Decimal(res.betterCups);
            strawSPD = new Decimal(res.strawSPD);
            cupSPD = new Decimal(res.cupSPD);
            sps = new Decimal(res.sipsPerDrink);
        updateTopSipsPerDrink();
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
            showPurchaseFeedback('Better Cups Upgrade', res.spent);
        reload();
        checkUpgradeAffordability();
            return;
        }
    }
    
}



function buySuction() {
    // Prefer centralized purchases system when available
    if (window.App?.systems?.purchases?.purchaseSuction) {
        const res = window.App.systems.purchases.purchaseSuction({
            sips: window.sips.toNumber(),
            suctions: suctions.toNumber(),
        });
        if (res) {
            if (window.App?.mutations?.subtractSips) {
                window.sips = new Decimal(window.App.mutations.subtractSips(window.sips, res.spent));
            } else {
                window.sips = window.sips.minus(res.spent);
            }
            suctions = new Decimal(res.suctions);
            suctionClickBonus = new Decimal(res.suctionClickBonus);
        updateTopSipsPerSecond();
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
            showPurchaseFeedback('Improved Suction', res.spent);
        reload();
        checkUpgradeAffordability();
            return;
        }
    }
    
}

function upgradeSuction() {
    // Prefer centralized purchases system when available
    if (window.App?.systems?.purchases?.upgradeSuction) {
        const res = window.App.systems.purchases.upgradeSuction({
            sips: window.sips.toNumber(),
            suctionUpCounter: suctionUpCounter.toNumber(),
        });
        if (res) {
            if (window.App?.mutations?.subtractSips) {
                window.sips = new Decimal(window.App.mutations.subtractSips(window.sips, res.spent));
            } else {
                window.sips = window.sips.minus(res.spent);
            }
            suctionUpCounter = new Decimal(res.suctionUpCounter);
            suctionClickBonus = new Decimal(res.suctionClickBonus);
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
        reload();
        checkUpgradeAffordability();
            return;
    }
    }
    
}

function buyFasterDrinks() {
    // Prefer centralized purchases system when available
    if (window.App?.systems?.purchases?.purchaseFasterDrinks) {
        const res = window.App.systems.purchases.purchaseFasterDrinks({
            sips: window.sips.toNumber(),
            fasterDrinks: fasterDrinks.toNumber(),
        });
        if (res) {
            if (window.App?.mutations?.subtractSips) {
                window.sips = new Decimal(window.App.mutations.subtractSips(window.sips, res.spent));
            } else {
                window.sips = window.sips.minus(res.spent);
            }
            fasterDrinks = new Decimal(res.fasterDrinks);
        updateDrinkRate();
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
            showPurchaseFeedback('Faster Drinks', res.spent);
        reload();
        checkUpgradeAffordability();
            return;
    }
    }
    
}

function upgradeFasterDrinks() {
    // Prefer centralized purchases system when available
    if (window.App?.systems?.purchases?.upgradeFasterDrinks) {
        const res = window.App.systems.purchases.upgradeFasterDrinks({
            sips: window.sips.toNumber(),
            fasterDrinksUpCounter: fasterDrinksUpCounter.toNumber(),
        });
        if (res) {
            if (window.App?.mutations?.subtractSips) {
                window.sips = new Decimal(window.App.mutations.subtractSips(window.sips, res.spent));
            } else {
                window.sips = window.sips.minus(res.spent);
            }
            fasterDrinksUpCounter = new Decimal(res.fasterDrinksUpCounter);
        updateDrinkRate();
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
        reload();
        checkUpgradeAffordability();
            return;
        }
    }
    
}

function buyCriticalClick() {
    // Prefer centralized purchases system when available
    if (window.App?.systems?.purchases?.purchaseCriticalClick) {
        const res = window.App.systems.purchases.purchaseCriticalClick({
            sips: window.sips.toNumber(),
            criticalClicks: criticalClicks.toNumber(),
            criticalClickChance: criticalClickChance.toNumber(),
        });
        if (res) {
            if (window.App?.mutations?.subtractSips) {
                window.sips = new Decimal(window.App.mutations.subtractSips(window.sips, res.spent));
            } else {
                window.sips = window.sips.minus(res.spent);
            }
            criticalClicks = new Decimal(res.criticalClicks);
            criticalClickChance = new Decimal(res.criticalClickChance);
        updateCriticalClickDisplay();
        updateTopSipsPerSecond();
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
            showPurchaseFeedback('Critical Click', res.spent);
        reload();
        checkUpgradeAffordability();
            return;
        }
    }
    
}

function upgradeCriticalClick() {
    // Prefer centralized purchases system when available
    if (window.App?.systems?.purchases?.upgradeCriticalClick) {
        const res = window.App.systems.purchases.upgradeCriticalClick({
            sips: window.sips.toNumber(),
            criticalClickUpCounter: criticalClickUpCounter.toNumber(),
            criticalClickMultiplier: criticalClickMultiplier.toNumber(),
        });
        if (res) {
            if (window.App?.mutations?.subtractSips) {
                window.sips = new Decimal(window.App.mutations.subtractSips(window.sips, res.spent));
            } else {
                window.sips = window.sips.minus(res.spent);
            }
            criticalClickUpCounter = new Decimal(res.criticalClickUpCounter);
            criticalClickMultiplier = new Decimal(res.criticalClickMultiplier);
        updateTopSipsPerSecond();
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
        reload();
        checkUpgradeAffordability();
            return;
        }
    }
    
}

function levelUp() {
    // Prefer centralized purchases system when available
    if (window.App?.systems?.purchases?.levelUp) {
        const res = window.App.systems.purchases.levelUp({
            sips: window.sips.toNumber(),
            level: level.toNumber(),
            sipsPerDrink: sps.toNumber?.() ?? Number(sps),
        });
        if (res) {
            if (res.sipsDelta) {
                window.sips = window.sips.plus(res.sipsDelta);
            }
            level = new Decimal(res.level);
            try { window.App?.stateBridge?.setLevel(level); } catch {}
            try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
            if (window.App?.ui?.updateLevelNumber) { try { window.App.ui.updateLevelNumber(); } catch {} }
            else { DOM_CACHE.levelNumber.innerHTML = level.toNumber(); }
            if (window.App?.ui?.updateTopSipCounter) { try { window.App.ui.updateTopSipCounter(); } catch {} }
            else { const topSipElement = DOM_CACHE.topSipValue; if (topSipElement) { topSipElement.innerHTML = prettify(window.sips); } }
            showLevelUpFeedback(new Decimal(res.sipsGained || 0));
        checkUpgradeAffordability();
            return;
    }
    }
    
}

// Function to show level up feedback
function showLevelUpFeedback(sipsGained) {
    if (window.App?.ui?.showLevelUpFeedback) {
        try { return window.App.ui.showLevelUpFeedback(sipsGained); } catch {}
    }
}

// Function to check if level up is possible
function checkLevelUp() {
    // This function checks if the player can afford to level up
    // It's called after each click to update the level up button state
    const config = window.GAME_CONFIG?.BALANCE || {};
    const levelUpCost = config.LEVEL_UP_BASE_COST * Math.pow(config.LEVEL_UP_SCALING, level.toNumber());
    
    const levelUpButton = document.querySelector('button[onclick*="levelUp"]');
    
    if (levelUpButton) {
        if (window.sips.gte(levelUpCost)) {
            levelUpButton.classList.remove('disabled');
            levelUpButton.classList.add('affordable');
            levelUpButton.title = `Click to level up for ${prettify(levelUpCost)} Sips`;
        } else {
            levelUpButton.classList.remove('affordable');
            levelUpButton.classList.add('disabled');
            levelUpButton.title = `Costs ${prettify(levelUpCost)} Sips (You have ${prettify(window.sips)})`;
        }
        
        // Update the cost display
        const levelCostElement = document.getElementById('levelCost');
        if (levelCostElement) {
            levelCostElement.innerHTML = prettify(levelUpCost);
            if (window.sips.gte(levelUpCost)) {
                levelCostElement.classList.remove('cost-too-high');
                levelCostElement.classList.add('cost-affordable');
            } else {
                levelCostElement.classList.remove('cost-affordable');
                levelCostElement.classList.add('cost-too-high');
            }
        }
    }
}

function changeLevel(i) {

    let body = document.querySelector("body");

    if (i === 2) {
        if (window.App?.ui?.updateLevelText) { try { window.App.ui.updateLevelText("On a Red Background"); } catch {}
        } else {
            DOM_CACHE.levelText.innerHTML = "On a Red Background";
        }
        body.style.backgroundColor = "#AE323B";
    }
}

function save() {
    const currentTime = Date.now();
    
    // Prevent too frequent saves
    if (window.App?.systems?.save?.queueSave) {
        const result = window.App.systems.save.queueSave({
            now: currentTime,
            lastOp: lastSaveOperation,
            minIntervalMs: MIN_SAVE_INTERVAL,
            schedule: (delay) => {
                if (!saveTimeout) {
                    saveTimeout = setTimeout(() => {
                        performSave();
                        saveTimeout = null;
                    }, delay);
                }
            },
            perform: () => performSave(),
        });
        if (result.queued) return;
    } else if (currentTime - lastSaveOperation < MIN_SAVE_INTERVAL) {
        // Queue this save operation
        if (!saveTimeout) {
            saveTimeout = setTimeout(() => {
                performSave();
                saveTimeout = null;
            }, MIN_SAVE_INTERVAL - (currentTime - lastSaveOperation));
        }
        return;
    }
    
    performSave();
}

function performSave() {
    if (window.App?.systems?.save?.performSaveSnapshot) {
        const payload = window.App.systems.save.performSaveSnapshot();
        if (payload) {
            lastSaveTime = payload.lastSaveTime;
            lastSaveOperation = payload.lastSaveTime;
            updateLastSaveTime();
            return;
        }
    }
    // Legacy fallback
    let save = {
        sips: window.sips.toString(),
        straws: straws.toString(),
        cups: cups.toString(),
        suctions: suctions.toString(),
        fasterDrinks: fasterDrinks.toString(),
        sps: sps.toString(),
        strawSPD: strawSPD.toString(),
        cupSPD: cupSPD.toString(),
        suctionClickBonus: suctionClickBonus.toString(),
        widerStraws: widerStraws.toString(),
        betterCups: betterCups.toString(),
        fasterDrinksUpCounter: fasterDrinksUpCounter.toString(),
        criticalClickChance: criticalClickChance.toString(),
        criticalClickMultiplier: criticalClickMultiplier.toString(),
        criticalClicks: criticalClicks.toString(),
        criticalClickUpCounter: criticalClickUpCounter.toString(),
        level: level.toString(),
        totalSipsEarned: totalSipsEarned.toString(),
        gameStartDate: gameStartDate,
        lastClickTime: lastClickTime,
        clickTimes: clickTimes,
        lastSaveTime: Date.now()
    };
    try {
        localStorage.setItem("save", JSON.stringify(save));
        lastSaveTime = save.lastSaveTime;
        lastSaveOperation = save.lastSaveTime;
        updateLastSaveTime();
    } catch (e) {
        console.error('Save failed:', e);
    }
}

function delete_save() {
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete your save? This will completely reset your game progress and cannot be undone.")) {
        // Remove save using storage service if available, else legacy key
        try {
            if (window.App && window.App.storage && typeof window.App.storage.deleteSave === 'function') {
                window.App.storage.deleteSave();
            } else {
                localStorage.removeItem("save");
            }
        } catch (e) {
            console.warn('Delete save failed, attempting legacy removal', e);
            try { localStorage.removeItem("save"); } catch {}
        }
        try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.GAME?.DELETED, {}); } catch {}
        
        // Reset all game variables to their initial values
        window.sips = new Decimal(0);
        straws = new Decimal(0);
        cups = new Decimal(0);
        window.straws = straws;
        window.cups = cups;
        suctions = new Decimal(0);
        // Set sps to base configured sips per drink (since no straws/cups yet)
        const config = window.GAME_CONFIG?.BALANCE || {};
        sps = new Decimal(config.BASE_SIPS_PER_DRINK);
        strawSPD = new Decimal(config.STRAW_BASE_SPD);
        cupSPD = new Decimal(config.CUP_BASE_SPD);
        suctionClickBonus = new Decimal(0);
        widerStraws = new Decimal(0);
        betterCups = new Decimal(0);

        level = new Decimal(1);
        
        // Reset drink system variables
        drinkRate = DEFAULT_DRINK_RATE;
        try { window.App?.stateBridge?.setDrinkRate(drinkRate); } catch {}
    
        // Update the top sips per drink display
    updateTopSipsPerDrink();
    
    // Update critical click display
    updateCriticalClickDisplay();
    
    drinkProgress = 0;
        lastDrinkTime = Date.now();
        try {
            window.App?.stateBridge?.setDrinkProgress(drinkProgress);
            window.App?.stateBridge?.setLastDrinkTime(lastDrinkTime);
        } catch {}
        
        // Reset faster drinks upgrade variables
        fasterDrinks = new Decimal(0);
        fasterDrinksUpCounter = new Decimal(1);
        
        // Reset critical click system variables
        criticalClickChance = new Decimal(config.CRITICAL_CLICK_BASE_CHANCE);
        criticalClickMultiplier = new Decimal(config.CRITICAL_CLICK_BASE_MULTIPLIER);
        criticalClicks = new Decimal(0);
        criticalClickUpCounter = new Decimal(1);
        
        // Reset sound system variables
        clickSoundsEnabled = true;
        
        // Reset auto-save and options variables
        autosaveEnabled = true;
        autosaveInterval = 10;
        autosaveCounter = 0;
        gameStartTime = Date.now();
        lastSaveTime = null;
        
        // Reset statistics tracking variables
        window.totalClicks = 0;
        currentClickStreak = 0;
        bestClickStreak = 0;
        totalSipsEarned = new Decimal(0);
        highestSipsPerSecond = new Decimal(0);
        gameStartDate = Date.now();
        lastClickTime = 0;
        clickTimes = [];
        
        // Reset unlocked features to soda and options (options should always be available)
        FEATURE_UNLOCKS.unlockedFeatures = new Set(['soda', 'options']);
        try {
            if (window.App?.storage?.remove) {
                window.App.storage.remove('unlockedFeatures');
            } else {
                localStorage.removeItem('unlockedFeatures');
            }
        } catch {}
        
        // Update the UI to reflect the reset
        reload();
        updateCriticalClickDisplay();
        updateAllStats();
        checkUpgradeAffordability();
        
        // Update feature visibility to hide all unlocked features
        FEATURE_UNLOCKS.updateFeatureVisibility();
        
        // Show success message
        alert("Save deleted successfully! Your game has been reset to the beginning.");
        
        
    }
}


// Make prettify available globally for other modules
window.prettify = function prettify(input) {
    if (input instanceof Decimal) {
        const config = window.GAME_CONFIG?.FORMATTING || {};
        const smallThreshold = config.SMALL_NUMBER_THRESHOLD;
        const mediumThreshold = config.MEDIUM_NUMBER_THRESHOLD;
        const largeThreshold = config.LARGE_NUMBER_THRESHOLD;
        const hugeThreshold = config.HUGE_NUMBER_THRESHOLD;
        const massiveThreshold = config.MASSIVE_NUMBER_THRESHOLD;
        const enormousThreshold = config.ENORMOUS_NUMBER_THRESHOLD;
        const giganticThreshold = config.GIGANTIC_NUMBER_THRESHOLD;
        const titanicThreshold = config.TITANIC_NUMBER_THRESHOLD;
        const cosmicThreshold = config.COSMIC_NUMBER_THRESHOLD;
        const infiniteThreshold = config.INFINITE_NUMBER_THRESHOLD;
        
        const smallDecimalPlaces = config.DECIMAL_PLACES_SMALL;
        const mediumDecimalPlaces = config.DECIMAL_PLACES_MEDIUM;
        const largeDecimalPlaces = config.DECIMAL_PLACES_LARGE;
        
        if (input.lt(smallThreshold)) {
            return input.toFixed(smallDecimalPlaces);
        } else if (input.lt(mediumThreshold)) {
            return input.toFixed(mediumDecimalPlaces);
        } else if (input.lt(largeThreshold)) {
            return (input.toNumber() / 1e6).toFixed(largeDecimalPlaces) + "M";
        } else if (input.lt(hugeThreshold)) {
            return (input.toNumber() / 1e9).toFixed(largeDecimalPlaces) + "B";
        } else if (input.lt(massiveThreshold)) {
            return (input.toNumber() / 1e12).toFixed(largeDecimalPlaces) + "T";
        } else if (input.lt(enormousThreshold)) {
            return (input.toNumber() / 1e15).toFixed(largeDecimalPlaces) + "Qa";
        } else if (input.lt(giganticThreshold)) {
            return (input.toNumber() / 1e18).toFixed(largeDecimalPlaces) + "Qi";
        } else if (input.lt(titanicThreshold)) {
            return (input.toNumber() / 1e21).toFixed(largeDecimalPlaces) + "Sx";
        } else if (input.lt(cosmicThreshold)) {
            return (input.toNumber() / 1e24).toFixed(largeDecimalPlaces) + "Sp";
        } else if (input.lt(infiniteThreshold)) {
            return (input.toNumber() / 1e27).toFixed(largeDecimalPlaces) + "Oc";
        } else {
            return input.toExponential(largeDecimalPlaces);
        }
    }
    return input.toFixed(2);
}


function reload() {
    try {
        // IMPROVED BALANCE: Updated cost calculations to match new balance
        const config = window.GAME_CONFIG?.BALANCE || {};
        let strawCost = Math.floor(config.STRAW_BASE_COST * Math.pow(config.STRAW_SCALING, straws.toNumber()));
        let cupCost = Math.floor(config.CUP_BASE_COST * Math.pow(config.CUP_SCALING, cups.toNumber()));
        let suctionCost = Math.floor(config.SUCTION_BASE_COST * Math.pow(config.SUCTION_SCALING, suctions.toNumber()));
        let fasterDrinksCost = Math.floor(config.FASTER_DRINKS_BASE_COST * Math.pow(config.FASTER_DRINKS_SCALING, fasterDrinks.toNumber()));
        let criticalClickCost = Math.floor(config.CRITICAL_CLICK_BASE_COST * Math.pow(config.CRITICAL_CLICK_SCALING, criticalClicks.toNumber()));
        let widerStrawsCost = Math.floor(config.WIDER_STRAWS_BASE_COST * Math.pow(config.WIDER_STRAWS_SCALING, widerStraws.toNumber()));
        let betterCupsCost = Math.floor(config.BETTER_CUPS_BASE_COST * Math.pow(config.BETTER_CUPS_SCALING, betterCups.toNumber()));

        // Safely update DOM elements only if they exist
        const elements = {
            'straws': straws.toNumber(),
            'strawCost': strawCost.toString(),
            'cups': cups.toNumber(),
            'cupCost': cupCost.toString(),
            'suctions': suctions.toNumber(),
            'suctionCost': suctionCost.toString(),
            'fasterDrinks': fasterDrinks.toNumber(),
            'fasterDrinksCost': fasterDrinksCost.toString(),
            'criticalClicks': criticalClicks.toNumber(),
            'criticalClickCost': criticalClickCost.toString(),
            'criticalClickChance': (criticalClickChance.times(100)).toFixed(4) + '%',
            'criticalClickMultiplier': criticalClickMultiplier.toNumber() + 'x',
            'sips': prettify(window.sips),
            'topSipValue': prettify(window.sips),
            'sps': prettify(sps),
            'strawSPD': prettify(strawSPD),
            'cupSPD': prettify(cupSPD),
            'suctionClickBonus': prettify(suctionClickBonus),
            'totalStrawSPD': prettify(strawSPD.times(straws)),
            'totalCupSPD': prettify(cupSPD.times(cups)),
            'totalSuctionBonus': prettify(suctionClickBonus),
            'widerStraws': widerStraws.toNumber(),
            'widerStrawsCost': widerStrawsCost.toString(),
            'widerStrawsSPD': prettify(strawSPD.div(new Decimal(0.6))) + 'x', // Shows upgrade multiplier
            'totalWiderStrawsSPD': prettify(strawSPD.times(straws)), // Total straw production
            'betterCups': betterCups.toNumber(),
            'betterCupsCost': betterCupsCost.toString(),
            'betterCupsSPD': prettify(cupSPD.div(new Decimal(1.2))) + 'x', // Shows upgrade multiplier
            'totalBetterCupsSPD': prettify(cupSPD.times(cups)), // Total cup production
            'fasterDrinksUpCost': (config.FASTER_DRINKS_UPGRADE_BASE_COST * fasterDrinksUpCounter.toNumber()).toString(),
            'levelNumber': level.toNumber(),
            // Compact clicking upgrade displays
            'suctionCostCompact': suctionCost.toString(),
            'suctionClickBonusCompact': prettify(suctionClickBonus),
            'criticalClickCostCompact': criticalClickCost.toString(),
            'criticalClickChanceCompact': (criticalClickChance.times(100)).toFixed(1),
            // Compact drink speed upgrade displays
            'fasterDrinksCostCompact': fasterDrinksCost.toString(),
            'currentDrinkSpeedCompact': (drinkRate / 1000).toFixed(2) + 's',
            'drinkSpeedBonusCompact': (fasterDrinks.toNumber() * 10) + '%',
            'fasterDrinksUpCostCompact': (config.FASTER_DRINKS_UPGRADE_BASE_COST * fasterDrinksUpCounter.toNumber()).toString()
        };

        // Update each element safely
        for (const [id, value] of Object.entries(elements)) {
            const element = DOM_CACHE.get(id);
            if (element) {
                element.innerHTML = value;
            }
        }
        
        // Update level up cost display
        const levelUpCost = config.LEVEL_UP_BASE_COST * Math.pow(config.LEVEL_UP_SCALING, level.toNumber());
        const levelCostElement = document.getElementById('levelCost');
        if (levelCostElement) {
            levelCostElement.innerHTML = prettify(levelUpCost);
            if (window.sips.gte(levelUpCost)) {
                levelCostElement.classList.remove('cost-too-high');
                levelCostElement.classList.add('cost-affordable');
            } else {
                levelCostElement.classList.remove('cost-affordable');
                levelCostElement.classList.add('cost-too-high');
            }
        }
        
        // Update drink speed display
        updateDrinkSpeedDisplay();
        
        // Update critical click display
        updateCriticalClickDisplay();
        
        // Update top display indicators
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();
        
        // Check affordability after reloading all values
        checkUpgradeAffordability();
        
        // Debug: Check level up button state
        const levelUpButton = document.querySelector('button[onclick*="levelUp"]');
        if (levelUpButton) {
            
        }
        
        
        
    } catch (error) {
        console.error('Error in reload function:', error);
    }
}

// Global error handling and resilience
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // Attempt to recover gracefully
    if (e.error && e.error.message.includes('audio')) {
        
        try {
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
            initAudioContext();
        } catch (recoveryError) {
            console.error('Audio recovery failed:', recoveryError);
        }
    }
    
    // Log error for debugging
    console.error('Error details:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault(); // Prevent the default browser behavior
});

// Initialize splash screen when page loads
// DOM ready init moved to App.systems.gameInit.initOnDomReady()



 

// Core game start function used by both music options
function startGameCore() { try { window.App?.systems?.gameInit?.startGameCore?.(); } catch {} }

// Keep the old function for compatibility (call global start if available)
window.startGameFromButton = function() {
    try {
        if (typeof window.startGame === 'function') {
            window.startGame();
        }
    } catch {}
};

// Function to show purchase feedback
function showPurchaseFeedback(itemName, cost) {
    if (window.App?.ui?.showPurchaseFeedback) { try { return window.App.ui.showPurchaseFeedback(itemName, cost); } catch {}
    }
}

        // Divine oracle functionality
function sendMessage() { try { return window.sendMessage?.(); } catch {} }



function addUserMessage(message) { try { return window.addUserMessage?.(message); } catch {} }
















// Event listener optimization - consolidate multiple handlers
document.addEventListener('DOMContentLoaded', function() {
    // Chat input keyboard support
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Global keyboard shortcuts for better UX
    document.addEventListener('keydown', function(e) {
        // Escape key to close modals or return to main view
        if (e.key === 'Escape') {
            // Close any open modals if they exist
            const modals = document.querySelectorAll('.modal, .popup');
            modals.forEach(modal => {
                if (modal.style.display !== 'none') {
                    modal.style.display = 'none';
                }
            });
            
            // Also close the geodude video modal
            const geodudeModal = document.getElementById('geodudeVideoModal');
            if (geodudeModal) {
                geodudeModal.remove();
            }
        }
        
        // Number keys for quick upgrades (1-5)
        if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.altKey) {
            const upgradeIndex = parseInt(e.key) - 1;
            const upgradeButtons = document.querySelectorAll('.upgrade-btn, button[onclick*="upgrade"]');
            if (upgradeButtons[upgradeIndex] && upgradeButtons[upgradeIndex].classList.contains('affordable')) {
                upgradeButtons[upgradeIndex].click();
            }
        }
        
        // Spacebar to click the soda button (only when on soda tab)
        if (e.key === ' ' && !e.ctrlKey && !e.altKey) {
            const sodaTab = document.getElementById('sodaTab');
            const activeTab = document.querySelector('.tab-content.active');


            // Only activate space hotkey when on the soda clicking tab
            if (!sodaTab || !sodaTab.classList.contains('active')) {
                
                return; // Allow normal spacebar behavior on other tabs
            }

            
            e.preventDefault();
            e.stopPropagation();
            const sodaButton = DOM_CACHE.sodaButton;
            if (sodaButton) {
                sodaButton.click();
            }
        }
    });
});

// Function to show offline progress modal
function showOfflineProgress(timeSeconds, earnings) {
    if (window.App?.ui?.showOfflineProgress) {
        try { return window.App.ui.showOfflineProgress(timeSeconds, earnings); } catch {}
    }
}

// Make all functions globally available for HTML onclick attributes
// This is crucial for module mode to work with HTML onclick handlers
window.sodaClick = sodaClick;
window.levelUp = levelUp;
window.checkLevelUp = checkLevelUp;
window.buyStraw = buyStraw;
window.buyCup = buyCup;
window.buyWiderStraws = buyWiderStraws;
window.buyBetterCups = buyBetterCups;
window.showOfflineProgress = showOfflineProgress;
window.buySuction = buySuction;
window.upgradeSuction = upgradeSuction;
window.buyFasterDrinks = buyFasterDrinks;
window.upgradeFasterDrinks = upgradeFasterDrinks;
window.buyCriticalClick = buyCriticalClick;
window.upgradeCriticalClick = upgradeCriticalClick;

    window.save = save;
    window.delete_save = delete_save;
    window.sendMessage = function(msg) { try { return window.sendMessage?.(msg); } catch {} };

// Button Audio System - Only handles button click sounds
let audioContext = null;
let buttonSoundsEnabled = true;

function initSplashMusic() {
    

    // Check user's music preference during initialization
    let musicEnabled = true;
    try {
        if (window.App?.storage?.getBoolean) {
            musicEnabled = window.App.storage.getBoolean('musicEnabled', true);
        } else {
            const stored = localStorage.getItem('musicEnabled');
            musicEnabled = stored !== null ? stored === 'true' : true;
        }
    } catch (error) {
        console.error('Error checking music preference during init:', error);
        musicEnabled = true; // Default to enabled
    }

    // Create audio element for splash screen title music
    splashAudio = new Audio();
    splashAudio.src = 'res/Soda Drinker Title Music.mp3';
    splashAudio.loop = false; // Don't loop - we want it to play once fully
    const config = window.GAME_CONFIG?.AUDIO || {};
    splashAudio.volume = config.SPLASH_MUSIC_VOLUME;

    // Apply music preference during initialization
    if (!musicEnabled) {
        splashAudio.muted = true;
        
    } else {
        
    }
    
    
    
    // Add comprehensive event listeners for debugging
    splashAudio.addEventListener('loadstart', () => {
    });
    
    splashAudio.addEventListener('loadedmetadata', () => {
    });
    
    splashAudio.addEventListener('loadeddata', () => {
    });
    
    splashAudio.addEventListener('canplay', () => {
        // Audio is ready to play
        
    });
    
    splashAudio.addEventListener('canplaythrough', () => {
    });
    
    splashAudio.addEventListener('ended', () => {
        
        // Start the main game music (legacy no-op)
        try { window.App?.systems?.audio?.music?.startMainGameMusic?.(); } catch {}
    });
    
    // Add error handling
    splashAudio.addEventListener('error', (e) => {
        console.error('Splash audio error event:', e);
        console.error('Error details:', {
            error: splashAudio.error,
            src: splashAudio.src,
            networkState: splashAudio.networkState,
            readyState: splashAudio.readyState
        });
        
        
    });
    
    // Force load attempt
    try {
        splashAudio.load();
        
    } catch (error) {
        console.error('Error calling load():', error);
    }
    
    // Don't auto-play - wait for user interaction
}

// Function to update splash audio mute state when preference changes
function updateSplashAudioMuteState() {
    if (!splashAudio) return;

    let musicEnabled = true;
    try {
        if (window.App?.storage?.getBoolean) {
            musicEnabled = window.App.storage.getBoolean('musicEnabled', true);
        } else {
            const stored = localStorage.getItem('musicEnabled');
            musicEnabled = stored !== null ? stored === 'true' : true;
        }
    } catch (error) {
        console.error('Error checking music preference for mute update:', error);
        musicEnabled = true;
    }

    splashAudio.muted = !musicEnabled;
    
}

// ===== BUTTON AUDIO SYSTEM (moved to App.systems.audio.button) =====
function playTitleMusic() {

    // Check user's music preference first
    let musicEnabled = true;
    try {
        if (window.App?.storage?.getBoolean) {
            musicEnabled = window.App.storage.getBoolean('musicEnabled', true);
        } else {
            const stored = localStorage.getItem('musicEnabled');
            musicEnabled = stored !== null ? stored === 'true' : true;
        }
    } catch (error) {
        console.error('Error checking music preference:', error);
        musicEnabled = true; // Default to enabled
    }

    if (!musicEnabled) {
        
        return;
    }

    if (!splashAudio) {
        console.error('splashAudio is null or undefined');
        
        return;
    }
    
    
    
    
    
    try {
        const playPromise = splashAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                
            }).catch(error => {
                console.error('Title music play failed:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    code: error.code
                });
                
            });
        } else {
            
                    // For older browsers that don't return a promise
        
        }
    } catch (error) {
        console.error('Exception when calling play():', error);
        
    }
}

function stopTitleMusic() {
    if (splashAudio) {
        
        splashAudio.pause();
        splashAudio.currentTime = 0;
        
        
    }
}

function startMainGameMusic() {
    

    // Check user's music preference first
    let musicEnabled = true;
    try {
        if (window.App?.storage?.getBoolean) {
            musicEnabled = window.App.storage.getBoolean('musicEnabled', true);
        } else {
            const stored = localStorage.getItem('musicEnabled');
            musicEnabled = stored !== null ? stored === 'true' : true;
        }
    } catch (error) {
        console.error('Error checking music preference:', error);
        musicEnabled = true; // Default to enabled
    }

    if (!musicEnabled) {
        
        return;
    }

    if (window.musicPlayerState && window.musicPlayerState.audio) {
        const mainAudio = window.musicPlayerState.audio;
        
        // Start playing the Between Level Music
        const playPromise = mainAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                
                window.musicPlayerState.isPlaying = true;
                updateMusicPlayerUI();
                updateStreamInfo(); // Ensure stream data displays correctly
            }).catch(error => {
                
            });
        }
    }
}

// Music Player Functions
function initMusicPlayer() {
    const musicPlayer = DOM_CACHE.musicPlayer;
    const musicToggleBtn = DOM_CACHE.musicToggleBtn;
    const musicMuteBtn = DOM_CACHE.musicMuteBtn;
    const musicStatus = DOM_CACHE.musicStatus;
    
    if (!musicPlayer || !musicToggleBtn || !musicMuteBtn || !musicStatus) {
        console.error('Music player elements not found');
        return;
    }
    
    // Check if user chose to disable music
    let musicEnabled = 'true';
    try {
        if (window.App?.storage?.getBoolean) {
            musicEnabled = window.App.storage.getBoolean('musicEnabled', true) ? 'true' : 'false';
        } else {
            musicEnabled = localStorage.getItem('musicEnabled');
        }
    } catch {}
    
    
    // Initialize music player state
    window.musicPlayerState = {
        isPlaying: false,
        isMuted: musicEnabled === 'false', // Auto-mute if user chose no music
        userWantsMusic: false, // Track if user explicitly wants music to play
        audio: null,
        currentStream: null,
        streamInfo: {},
        retryCount: 0,
        maxRetries: window.GAME_CONFIG.LIMITS.MAX_MUSIC_RETRIES,
        isRetrying: false,
        lastRetryTime: 0,
        retryDelay: window.GAME_CONFIG.TIMING.MUSIC_RETRY_DELAY // 2 second delay between retries
    };
    
    // Create audio element for music
    const audio = new Audio();
    // Use Between Level Music as default for main game
    audio.src = 'res/Between Level Music.mp3';
    audio.loop = true;
    const config = window.GAME_CONFIG?.AUDIO || {};
    audio.volume = config.MAIN_MUSIC_VOLUME;
    audio.muted = window.musicPlayerState.isMuted; // Apply mute setting immediately
    
    // Add error handling
    audio.addEventListener('error', (e) => {
        

        const state = window.musicPlayerState;
        if (!state) return;

        // Prevent rapid retries
        const now = Date.now();
        if (state.isRetrying && now - state.lastRetryTime < state.retryDelay) {
            
            return;
        }

        state.isRetrying = true;
        state.lastRetryTime = now;

        state.retryCount++;
        

        if (state.retryCount >= state.maxRetries) {
            
            if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Music unavailable - click to retry'); } catch {} } else { musicStatus.textContent = 'Music unavailable - click to retry'; }

            // Add click handler to reset retry count
            musicStatus.style.cursor = 'pointer';
            musicStatus.onclick = () => {
                
                state.retryCount = 0;
                state.isRetrying = false;
                if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Retrying...'); } catch {} } else { musicStatus.textContent = 'Retrying...'; }
                musicStatus.style.cursor = 'default';
                musicStatus.onclick = null;

                // Try the default music again
                state.audio.src = 'res/Between Level Music.mp3';
            };

            // Stop any further requests by clearing the audio source
            state.audio.src = '';
            state.audio.load(); // Cancel any pending requests
            return;
        }

        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText(`Stream unavailable - trying alternative (${state.retryCount}/${state.maxRetries})...`); } catch {} } else { musicStatus.textContent = `Stream unavailable - trying alternative (${state.retryCount}/${state.maxRetries})...`; }

        // Delay the fallback attempt to prevent rapid retries
        setTimeout(() => {
            loadFallbackMusic();
        }, 1000); // 1 second delay
    });
    
    audio.addEventListener('loadstart', () => {
        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Loading stream...'); } catch {} } else { musicStatus.textContent = 'Loading stream...'; }
    });
    
    audio.addEventListener('canplay', () => {
        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Click to start music'); } catch {} } else { musicStatus.textContent = 'Click to start music'; }
        // Only update stream info when stream actually changes
        updateStreamInfo();

        // Reset retry count on successful load
        const state = window.musicPlayerState;
        if (state && state.retryCount > 0) {
            
            state.retryCount = 0;
            state.isRetrying = false;
        }
    });
    
    audio.addEventListener('waiting', () => {
        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Buffering...'); } catch {} } else { musicStatus.textContent = 'Buffering...'; }
    });
    
    audio.addEventListener('load', () => {
        // Only update stream info when stream actually changes
        updateStreamInfo();
    });
    
    audio.addEventListener('loadeddata', () => {
        // Don't update stream info on every data load
    });
    
    audio.addEventListener('playing', () => {
        // Don't update stream info on every play event
    });
    
    audio.addEventListener('progress', () => {
        // Don't update stream info on every progress event
    });
    
    // Prevent auto-resume on mobile by catching play events
    audio.addEventListener('play', () => {
        const state = window.musicPlayerState;
        if (!state) return;
        
        // If this is an auto-play event on mobile and user didn't want it
        if (isMobileDevice() && !state.userWantsMusic && wasPlayingBeforeBlur === false) {
            
            audio.pause();
            state.isPlaying = false;
            updateMusicPlayerUI();
            return;
        }
        
        // Normal play event - update state
        state.isPlaying = true;
        updateMusicPlayerUI();
    });
    
    // Store audio reference
    window.musicPlayerState.audio = audio;
    
    // Add event listeners
    musicToggleBtn.addEventListener('click', toggleMusic);
    musicMuteBtn.addEventListener('click', toggleMute);
    
    // Add mobile-specific event listeners to pause music when window loses focus
    let wasPlayingBeforeBlur = false;
    
    // Function to detect if user is on a mobile device
    function isMobileDevice() {
        const config = window.GAME_CONFIG?.MOBILE || {};
        const maxWidth = config.MAX_WIDTH;
        const maxHeight = config.MAX_HEIGHT;
        const userAgentPatterns = config.USER_AGENT_PATTERNS;
        
        return userAgentPatterns.some(pattern => new RegExp(pattern, 'i').test(navigator.userAgent)) ||
               (window.innerWidth <= maxWidth && window.innerHeight <= maxHeight);
    }
    
    // Handle page visibility change (when user switches tabs or apps)
    document.addEventListener('visibilitychange', () => {
        const state = window.musicPlayerState;
        if (!state || !state.audio) return;
        
        // Only pause on mobile devices
        if (document.hidden && isMobileDevice()) {
            // Page became hidden on mobile - remember if music was playing and pause it
            wasPlayingBeforeBlur = state.isPlaying;
            if (state.isPlaying) {
                state.audio.pause();
                state.isPlaying = false;
                state.userWantsMusic = false; // Reset user intent when auto-paused
                updateMusicPlayerUI();
                
            }
        } else if (document.hidden) {
            // Page became hidden on desktop - let music continue playing
            
        } else {
            // Page became visible again - prevent auto-resume on mobile
            if (isMobileDevice()) {
                // On mobile, ensure music stays paused when page becomes visible
                if (state.audio.played.length > 0 && !state.isPlaying) {
                    // If audio was previously played and is now paused, keep it paused
                    state.audio.pause();
                    state.isPlaying = false;
                    updateMusicPlayerUI();
                    
                }
            } else {
                // On desktop, let music continue as it was
                
            }
        }
    });
    
    // Handle window blur/focus events (additional mobile support)
    window.addEventListener('blur', () => {
        const state = window.musicPlayerState;
        if (!state || !state.audio) return;
        
        // Only pause on mobile devices
        if (isMobileDevice()) {
            wasPlayingBeforeBlur = state.isPlaying;
            if (state.isPlaying) {
                state.audio.pause();
                state.isPlaying = false;
                state.userWantsMusic = false; // Reset user intent when auto-paused
                updateMusicPlayerUI();
                
            }
        } else {
            // Window lost focus on desktop - let music continue playing
            
        }
    });
    
    // Handle window focus events to prevent auto-resume on mobile
    window.addEventListener('focus', () => {
        const state = window.musicPlayerState;
        if (!state || !state.audio) return;
        
        // Only handle on mobile devices
        if (isMobileDevice()) {
            // If music was playing before blur, don't auto-resume
            // Only resume if user explicitly wants it
            if (wasPlayingBeforeBlur && !state.isPlaying) {
                // Music was playing before but is now paused - keep it paused
                state.audio.pause();
                state.isPlaying = false;
                state.userWantsMusic = false; // Ensure user intent is reset
                updateMusicPlayerUI();
                
            }
        }
    });
    
    // Update initial button states
    updateMusicPlayerUI();
    
    // Try to auto-play (may be blocked by browser)
    const musicConfig = window.GAME_CONFIG?.TIMING || {};
    const musicInitDelay = musicConfig.MUSIC_INIT_DELAY;
    setTimeout(() => {
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            // Don't auto-play, just show ready state
            if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Click to start music'); } catch {} } else { musicStatus.textContent = 'Click to start music'; }
            // Only update stream info once on initialization
            updateStreamInfo();
        }
    }, musicInitDelay);
    
    // Set initial stream info immediately for better UX
    updateStreamInfo();
    
    // Load saved stream preference
    loadSavedStreamPreference();
    
    
}

// Function to update stream information and display
function updateStreamInfo() {
    const state = window.musicPlayerState;
    if (!state || !state.audio) return;
    
    const audio = state.audio;
    const currentSrc = audio.src;
    
    // Update current stream info
    state.currentStream = currentSrc;
    
    // Get stream details based on URL
    const streamDetails = getStreamDetails(currentSrc);
    state.streamInfo = streamDetails;
    
    // Always update music player title and subtitle for better UX
    updateMusicPlayerDisplay(streamDetails);
    
    // Update status with more detailed information
    if (state.isPlaying) {
        const statusText = `${streamDetails.name} - ${streamDetails.description}`;
        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText(statusText); } catch {} } else { musicStatus.textContent = statusText; }
    } else {
        // Show stream info even when paused
        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Click to start music'); } catch {} } else { musicStatus.textContent = 'Click to start music'; }
    }
    
    // Only log stream info updates when debugging is needed
    // console.log('Stream info updated:', streamDetails);
}

// Function to get detailed information about streams
function getStreamDetails(streamUrl) {
    const url = streamUrl.toLowerCase();
    
    // Local music files
    if (url.includes('between level music.mp3')) {
        return {
            name: 'Between Level Music',
            description: 'Main game soundtrack',
            genre: 'Game Music',
            quality: 'MP3',
            location: 'Local',
            type: 'Soundtrack'
        };
    }
    if (url.includes('soda drinker title music.mp3')) {
        return {
            name: 'Soda Drinker Title Music',
            description: 'Original title theme',
            genre: 'Game Music',
            quality: 'MP3',
            location: 'Local',
            type: 'Title Music'
        };
    }
    
    // SomaFM streams
    if (url.includes('somafm.com')) {
        if (url.includes('groovesalad')) {
            return {
                name: 'Groove Salad',
                description: 'Ambient beats and grooves',
                genre: 'Ambient/Chill',
                quality: '128k MP3',
                location: 'San Francisco',
                type: 'Lofi Radio'
            };
        } else if (url.includes('defcon')) {
            return {
                name: 'DEF CON',
                description: 'Dark ambient and industrial',
                genre: 'Dark Ambient',
                quality: '128k MP3',
                location: 'San Francisco',
                type: 'Lofi Radio'
            };
        } else if (url.includes('dronezone')) {
            return {
                name: 'Drone Zone',
                description: 'Atmospheric textures and beats',
                genre: 'Drone/Ambient',
                quality: '128k MP3',
                location: 'San Francisco',
                type: 'Lofi Radio'
            };
        } else if (url.includes('illstreet')) {
            return {
                name: 'Ill Street',
                description: 'Lofi hip hop and chill beats',
                genre: 'Lofi Hip Hop',
                quality: '128k MP3',
                location: 'San Francisco',
                type: 'Lofi Radio'
            };
        } else {
            return {
                name: 'SomaFM',
                description: 'Lofi internet radio',
                genre: 'Various',
                quality: '128k MP3',
                location: 'San Francisco',
                type: 'Lofi Radio'
            };
        }
    }
    

    
    // Generic fallback
    return {
        name: 'Unknown Stream',
        description: 'Audio stream',
        genre: 'Unknown',
        quality: 'Unknown',
        location: 'Unknown',
        type: 'Stream'
    };
}

// Function to update music player display with stream info
function updateMusicPlayerDisplay(streamInfo) {
    const musicPlayerTitle = DOM_CACHE.musicPlayer.querySelector('.music-player-title');
    const musicPlayerSubtitle = DOM_CACHE.musicPlayer.querySelector('.music-player-subtitle');
    
    if (musicPlayerTitle) {
        musicPlayerTitle.textContent = streamInfo.name;
    }
    
    if (musicPlayerSubtitle) {
        musicPlayerSubtitle.textContent = streamInfo.description;
    }
}

function toggleMusic() {
    const state = window.musicPlayerState;
    if (!state || !state.audio) return;

    if (state.isPlaying) {
        state.audio.pause();
        state.isPlaying = false;
        state.userWantsMusic = false; // User explicitly paused

        // Update stored preference when pausing (fallback function)
        try {
            if (window.App?.storage?.setBoolean) {
                window.App.storage.setBoolean('musicEnabled', false);
            } else {
                localStorage.setItem('musicEnabled', 'false');
            }
            updateSplashAudioMuteState(); // Update splash audio mute state
        } catch {}

        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Paused'); } catch {} } else { musicStatus.textContent = 'Paused'; }
        updateMusicPlayerUI();
    } else {
        // User explicitly wants to play music
        state.userWantsMusic = true;

        // Update stored preference when resuming (fallback function)
        try {
            if (window.App?.storage?.setBoolean) {
                window.App.storage.setBoolean('musicEnabled', true);
            } else {
                localStorage.setItem('musicEnabled', 'true');
            }
            updateSplashAudioMuteState(); // Update splash audio mute state
        } catch {}

        // Try to play the audio
        const playPromise = state.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                state.isPlaying = true;
                // Don't update stream info on every play - only when stream changes
                updateMusicPlayerUI();
            }).catch(error => {
                
                if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Click to start music'); } catch {} } else { musicStatus.textContent = 'Click to start music'; }
                // Fallback: try to load from a different source
                loadFallbackMusic();
            });
        }
    }
}

function toggleMute() {
    const state = window.musicPlayerState;
    if (!state || !state.audio) return;
    
    state.isMuted = !state.isMuted;
    state.audio.muted = state.isMuted;
    
    if (state.isMuted) {
        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Muted'); } catch {} } else { musicStatus.textContent = 'Muted'; }
    } else {
        if (state.isPlaying && state.streamInfo) {
            if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText(`${state.streamInfo.name} - ${state.streamInfo.description}`); } catch {} } else { musicStatus.textContent = `${state.streamInfo.name} - ${state.streamInfo.description}`; }
        } else {
            if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Paused'); } catch {} } else { musicStatus.textContent = 'Paused'; }
        }
    }
    
    updateMusicPlayerUI();
}

function updateMusicPlayerUI() {
    const state = window.musicPlayerState;
    const musicPlayer = DOM_CACHE.musicPlayer;
    const musicToggleBtn = DOM_CACHE.musicToggleBtn;
    const musicMuteBtn = DOM_CACHE.musicMuteBtn;
    
    if (!musicPlayer || !musicToggleBtn || !musicMuteBtn) return;
    
    // Update play/pause button
    const toggleIcon = musicToggleBtn.querySelector('.music-control-icon');
    if (state.isPlaying) {
        toggleIcon.textContent = '⏸️';
        musicPlayer.classList.add('playing');
        musicPlayer.classList.remove('muted');
    } else {
        toggleIcon.textContent = '▶️';
        musicPlayer.classList.remove('playing');
    }
    
    // Update mute button
    const muteIcon = musicMuteBtn.querySelector('.music-control-icon');
    if (state.isMuted) {
        muteIcon.textContent = '🔇';
        musicPlayer.classList.add('muted');
    } else {
        muteIcon.textContent = '🔊';
        musicPlayer.classList.remove('muted');
    }
}

// Available music streams
const MUSIC_STREAMS = {
    // Local Music (Default)
    betweenlevel: {
        url: 'res/Between Level Music.mp3',
        name: 'Between Level Music',
        description: 'Main game soundtrack'
    },
    sodadrinker: {
        url: 'res/Soda Drinker Title Music.mp3',
        name: 'Soda Drinker Title Music',
        description: 'Original title theme'
    },
    // SomaFM Stations
    groovesalad: {
        url: 'https://ice1.somafm.com/groovesalad-128-mp3',
        name: 'Groove Salad',
        description: 'Ambient beats and grooves'
    },
    defcon: {
        url: 'https://ice1.somafm.com/defcon-128-mp3',
        name: 'DEF CON',
        description: 'Dark ambient and industrial'
    },
    dronezone: {
        url: 'https://ice1.somafm.com/dronezone-128-mp3',
        name: 'Drone Zone',
        description: 'Atmospheric textures and beats'
    },
    illstreet: {
        url: 'https://ice1.somafm.com/illstreet-128-mp3',
        name: 'Ill Street',
        description: 'Lofi hip hop and chill beats'
    },
    
};

// Function to change music stream
function changeMusicStream() {
    const streamSelect = DOM_CACHE.musicStreamSelect;
    const currentStreamInfo = DOM_CACHE.currentStreamInfo;
    
    if (!streamSelect || !currentStreamInfo) {
        console.error('Music stream elements not found');
        return;
    }
    
    const selectedStream = streamSelect.value;
    const streamData = MUSIC_STREAMS[selectedStream];
    
    if (!streamData) {
        console.error('Invalid stream selection:', selectedStream);
        return;
    }
    
    const state = window.musicPlayerState;
    if (!state || !state.audio) {
        console.error('Music player not initialized');
        return;
    }

    // Prevent stream changes if we've hit the retry limit
    if (state.retryCount >= state.maxRetries) {
        
        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Music unavailable - too many failures'); } catch {} } else { musicStatus.textContent = 'Music unavailable - too many failures'; }
        return;
    }
    
    // Check if this is a YouTube stream
    if (streamData.type === 'youtube') {
        // For YouTube streams, show a message and don't try to play audio
        currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description} (YouTube - Click to open in new tab)`;
        currentStreamInfo.style.cursor = 'pointer';
        currentStreamInfo.onclick = () => window.open(streamData.url, '_blank');
        currentStreamInfo.classList.add('clickable');
        
        // Stop any currently playing audio
        if (state.isPlaying) {
            state.audio.pause();
            state.isPlaying = false;
            updateMusicPlayerUI();
        }
        
        // Show a notification about YouTube streams
        const musicStatus = DOM_CACHE.musicStatus;
        if (musicStatus) {
            if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('YouTube stream selected - Click stream info to open'); } catch {} } else { musicStatus.textContent = 'YouTube stream selected - Click stream info to open'; }
        }
        
        // Save the stream preference
        try {
            let streamPreferences = {};
            if (window.App?.storage?.getJSON) {
                streamPreferences = window.App.storage.getJSON('musicStreamPreferences', {});
            } else {
                streamPreferences = JSON.parse(localStorage.getItem('musicStreamPreferences') || '{}');
            }
            streamPreferences.selectedStream = selectedStream;
            if (window.App?.storage?.setJSON) {
                window.App.storage.setJSON('musicStreamPreferences', streamPreferences);
            } else {
                localStorage.setItem('musicStreamPreferences', JSON.stringify(streamPreferences));
            }
        } catch (e) {
            console.warn('Failed to persist stream preference', e);
        }
        
        
        return;
    }
    
    // Store current playing state for audio streams
    const wasPlaying = state.isPlaying;
    
    // Change the stream
    state.audio.src = streamData.url;
    state.currentStream = streamData.url;

    // Reset retry count when manually changing streams
    state.retryCount = 0;
    
    // Update the stream info display
    currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
    currentStreamInfo.style.cursor = 'default';
    currentStreamInfo.onclick = null;
    currentStreamInfo.classList.remove('clickable');
    
    // Update music player display with stream info
    updateStreamInfo();
    
    // Don't autostart - require user interaction to play
    // If it was playing, pause it and require user to click play
    if (wasPlaying) {
        state.audio.pause();
        state.isPlaying = false;
        const musicStatus = DOM_CACHE.musicStatus;
        if (musicStatus) {
            if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Click to start music'); } catch {} } else { musicStatus.textContent = 'Click to start music'; }
        }
        updateMusicPlayerUI();
    }
    
    // Save the stream preference
    try {
        let streamPreferences = {};
        if (window.App?.storage?.getJSON) {
            streamPreferences = window.App.storage.getJSON('musicStreamPreferences', {});
        } else {
            streamPreferences = JSON.parse(localStorage.getItem('musicStreamPreferences') || '{}');
        }
        streamPreferences.selectedStream = selectedStream;
        if (window.App?.storage?.setJSON) {
            window.App.storage.setJSON('musicStreamPreferences', streamPreferences);
        } else {
            localStorage.setItem('musicStreamPreferences', JSON.stringify(streamPreferences));
        }
    } catch (e) {
        console.warn('Failed to persist stream preference', e);
    }
    
    
}

// Function to load saved stream preference
function loadSavedStreamPreference() {
    const streamSelect = DOM_CACHE.musicStreamSelect;
    const currentStreamInfo = DOM_CACHE.currentStreamInfo;
    
    if (!streamSelect || !currentStreamInfo) {
        
        return;
    }
    
    try {
        let streamPreferences = {};
        if (window.App?.storage?.getJSON) {
            streamPreferences = window.App.storage.getJSON('musicStreamPreferences', {});
        } else {
            streamPreferences = JSON.parse(localStorage.getItem('musicStreamPreferences') || '{}');
        }
        const savedStream = streamPreferences.selectedStream;
        
        if (savedStream && MUSIC_STREAMS[savedStream]) {
            // Set the select dropdown to the saved value
            streamSelect.value = savedStream;
            
            // Update the current stream info display
            const streamData = MUSIC_STREAMS[savedStream];
            
            // Check if this is a YouTube stream
            if (streamData.type === 'youtube') {
                currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description} (YouTube - Click to open in new tab)`;
                currentStreamInfo.style.cursor = 'pointer';
                currentStreamInfo.onclick = () => window.open(streamData.url, '_blank');
                currentStreamInfo.classList.add('clickable');
                
                // Don't try to set audio source for YouTube streams
                
                return;
            }
            
            currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
            currentStreamInfo.style.cursor = 'default';
            currentStreamInfo.onclick = null;
            currentStreamInfo.classList.remove('clickable');
            
            // Update the music player to use the saved stream
            const state = window.musicPlayerState;
            if (state && state.audio) {
                state.audio.src = streamData.url;
                state.currentStream = streamData.url;
                
                // Update music player display with stream info
                updateStreamInfo();
            }
            
            
        } else {
            // Set default to betweenlevel if no valid preference
            streamSelect.value = 'betweenlevel';
            const streamData = MUSIC_STREAMS.betweenlevel;
            currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
            
        }
    } catch (error) {
        console.error('Error loading stream preference:', error);
        // Fallback to default
        streamSelect.value = 'betweenlevel';
        const streamData = MUSIC_STREAMS.betweenlevel;
        currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
    }
}

function loadFallbackMusic() {
    // Try alternative sources if the main one fails
    const fallbackSources = [
        'res/Between Level Music.mp3', // Main game soundtrack
        'https://ice1.somafm.com/groovesalad-128-mp3', // SomaFM Groove Salad
        'https://ice1.somafm.com/defcon-128-mp3', // SomaFM DEF CON
        'https://ice1.somafm.com/dronezone-128-mp3', // SomaFM Drone Zone
        'https://ice1.somafm.com/illstreet-128-mp3' // SomaFM Ill Street
    ];

    const state = window.musicPlayerState;
    if (!state || !state.audio) return;

    // Check if we're already retrying or exceeded max retries
    if (state.isRetrying && Date.now() - state.lastRetryTime < state.retryDelay) {
        
        return;
    }

    if (state.retryCount >= state.maxRetries) {
        
        if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Music unavailable - too many failures'); } catch {} } else { musicStatus.textContent = 'Music unavailable - too many failures'; }

        // Ensure no more requests are made
        state.audio.src = '';
        state.audio.load();
        state.isRetrying = false;
        return;
    }

    state.isRetrying = true;
    state.lastRetryTime = Date.now();

    const randomSource = fallbackSources[Math.floor(Math.random() * fallbackSources.length)];
    
    state.audio.src = randomSource;
    if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText(`Trying alternative source (${state.retryCount}/${state.maxRetries})...`); } catch {} } else { musicStatus.textContent = `Trying alternative source (${state.retryCount}/${state.maxRetries})...`; }

    // Don't autostart - just update the stream info and wait for user interaction
    updateStreamInfo();
    if (window.App?.ui?.setMusicStatusText) { try { window.App.ui.setMusicStatusText('Click to start music'); } catch {} } else { musicStatus.textContent = 'Click to start music'; }
}

// Memory management and cleanup functions
function cleanupAudioResources() {
    if (audioContext) {
        try {
            audioContext.close();
            audioContext = null;
            
        } catch (error) {
            console.error('Error closing audio context:', error);
        }
    }
    
    // Clean up music player
    if (window.musicPlayerState && window.musicPlayerState.audio) {
        try {
            window.musicPlayerState.audio.pause();
            window.musicPlayerState.audio.src = '';
            window.musicPlayerState.audio = null;
            
        } catch (error) {
            console.error('Error cleaning up music player:', error);
        }
    }
}

// Cleanup function for event listeners and timers
function cleanupGameResources() {
    // Clear any pending save timeouts
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
    }
    
    // Clear any pending autosave counters
    autosaveCounter = 0;
    
    
}

// Call cleanup when page unloads
window.addEventListener('beforeunload', () => {
    cleanupAudioResources();
    cleanupGameResources();
    
});

// Make all other functions globally available to prevent undefined errors
window.updateAllStats = updateAllStats;
window.updateDrinkRate = updateDrinkRate;
window.updateTopSipsPerDrink = updateTopSipsPerDrink;
window.updateTopSipsPerSecond = updateTopSipsPerSecond;
window.updateCriticalClickDisplay = updateCriticalClickDisplay;
window.updateDrinkSpeedDisplay = updateDrinkSpeedDisplay;
window.loadOptions = loadOptions;
window.updatePlayTime = updatePlayTime;
window.updateLastSaveTime = updateLastSaveTime;
window.trackClick = trackClick;
window.showClickFeedback = showClickFeedback;
window.showPurchaseFeedback = showPurchaseFeedback;
window.addUserMessage = function(msg) { try { return window.addUserMessage?.(msg); } catch {} };
window.toggleAutosave = toggleAutosave;
window.changeAutosaveInterval = changeAutosaveInterval;
window.initMusicPlayer = initMusicPlayer;
window.toggleMusic = function() { try { window.App?.systems?.audio?.music?.toggleMusic?.(); } catch {} try { toggleMusic(); } catch {} };
window.toggleMute = toggleMute;
window.updateStreamInfo = updateStreamInfo;
window.getStreamDetails = getStreamDetails;
window.playTitleMusic = playTitleMusic;
window.stopTitleMusic = stopTitleMusic;

// Expose button audio toggle for HTML handler
window.toggleButtonSounds = function() { try { window.App?.systems?.audio?.button?.toggleButtonSounds?.(); } catch {} };


window.toggleClickSounds = function() { try { window.App?.systems?.audio?.button?.toggleButtonSounds?.(); } catch {} };
window.testClickSounds = function() { try { window.App?.systems?.audio?.button?.testClickSounds?.(); } catch {} };
window.playCriticalClickSound = function() { try { window.App?.systems?.audio?.button?.playButtonCriticalClickSound?.(); } catch {} };
window.playPurchaseSound = function() { try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {} };
window.testPurchaseSound = function() { try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {} };
window.testCriticalClickSound = function() { try { window.App?.systems?.audio?.button?.playButtonCriticalClickSound?.(); } catch {} };
// Test function for button audio
window.testButtonAudio = function() {
    

    try { window.App?.systems?.audio?.button?.initButtonAudioSystem?.(); } catch {}

    // Ensure enabled state is on via toggle if needed
    try {
        if (window.App?.systems?.audio?.button?.getButtonSoundsEnabled && !window.App.systems.audio.button.getButtonSoundsEnabled()) {
            window.App.systems.audio.button.toggleButtonSounds();
        }
    } catch {}

    

    // Test each sound type
    try { window.App?.systems?.audio?.button?.playButtonClickSound?.(); } catch {}
    setTimeout(() => { try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {} }, 300);
    setTimeout(() => { try { window.App?.systems?.audio?.button?.playButtonCriticalClickSound?.(); } catch {} }, 600);

    
};


