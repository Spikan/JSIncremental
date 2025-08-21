// Soda Clicker Pro - Main Game Logic
// 
// TEMPLEOS GOD FEATURE SETUP:
// Divine oracle feature - draws wisdom from sacred texts
// No external API keys needed for the divine guidance system
// (But if you know, you know... this runs on 64-bit spiritual processing power)




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
        
        console.log('Feature detection results:', {
            webGL: this.webGL,
            webAudio: this.webAudio,
            serviceWorker: this.serviceWorker,
            localStorage: this.localStorage,
            requestAnimationFrame: this.requestAnimationFrame,
            performance: this.performance
        });
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
        console.log('WebGL effects enabled');
        // Future: Add WebGL particle effects for clicks
    },
    
    enablePerformanceMonitoring: function() {
        console.log('Performance monitoring enabled');
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
        console.log('Service worker support detected');
        // Future: Enable offline functionality
    }
};

// Feature Unlock System - Now imported from js/feature-unlocks.js
// The FEATURE_UNLOCKS object is defined in the separate module file

console.log('=== MAIN.JS LOADING ===');
console.log('FEATURE_UNLOCKS available:', typeof window.FEATURE_UNLOCKS !== 'undefined' ? 'YES' : 'NO');
if (typeof window.FEATURE_UNLOCKS !== 'undefined') {
    console.log('FEATURE_UNLOCKS object:', window.FEATURE_UNLOCKS);
}

// DOM Element Cache - Imported from dom-cache.js
// Ensures DOM_CACHE is available before proceeding
if (typeof DOM_CACHE === 'undefined') {
    console.error('DOM_CACHE not loaded. Please ensure dom-cache.js is loaded before main.js');
} else {
    console.log('DOM_CACHE loaded successfully');
    if (!DOM_CACHE.isReady()) {
        console.warn('DOM_CACHE not ready, initializing...');
        DOM_CACHE.init();
    }
}

// Debug: Check if functions are available
console.log('buySuction function available:', typeof buySuction);
console.log('window.buySuction available:', typeof window.buySuction);

window.sips = new Decimal(0);
let straws = new Decimal(0);
let cups = new Decimal(0);
let suctions = new Decimal(0);
let sps = new Decimal(0);
let strawSPD = new Decimal(0);
let cupSPD = new Decimal(0);
let suctionClickBonus = new Decimal(0);
let widerStraws = new Decimal(0);
let betterCups = new Decimal(0);

let level = new Decimal(1);

// Drink system variables
    const DEFAULT_DRINK_RATE = window.GAME_CONFIG.TIMING.DEFAULT_DRINK_RATE;
let drinkRate = DEFAULT_DRINK_RATE;
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

// Sound system variables
let clickSoundsEnabled = true;

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

// Splash screen functionality
function initSplashScreen() {
    console.log('initSplashScreen called');
    
    // Eruda debugging for mobile
    if (typeof eruda !== 'undefined') {
        eruda.get('console').log('initSplashScreen called');
    }
    
    // Initialize splash screen music
    initSplashMusic();
    
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    
    console.log('Splash screen element:', splashScreen);
    console.log('Game content element:', gameContent);
    
    if (typeof eruda !== 'undefined') {
        eruda.get('console').log('Splash screen element:', splashScreen);
        eruda.get('console').log('Game content element:', gameContent);
    }
    
    if (!splashScreen || !gameContent) {
        console.error('Splash screen elements not found!');
        if (typeof eruda !== 'undefined') {
            eruda.get('console').error('Splash screen elements not found!');
        }
        return;
    }
    
    console.log('Setting up splash screen event listeners...');
    if (typeof eruda !== 'undefined') {
        eruda.get('console').log('Setting up splash screen event listeners...');
    }
    
    // Function to start the game
    function startGame() {
        console.log('startGame called');
        if (typeof eruda !== 'undefined') {
            eruda.get('console').log('startGame called');
        }
        
        // Stop title music when transitioning to game
        stopTitleMusic();
        
        // Super simple approach - just hide splash and show game
        const splashScreen = document.getElementById('splashScreen');
        const gameContent = document.getElementById('gameContent');
        
        if (splashScreen && gameContent) {
            console.log('Hiding splash, showing game...');
            if (typeof eruda !== 'undefined') {
                eruda.get('console').log('Hiding splash, showing game...');
            }
            splashScreen.style.display = 'none';
            gameContent.style.display = 'block';
            
            // Try to initialize game, but don't let it fail
            try {
                initGame();
            } catch (error) {
                console.error('Game init failed, but showing game anyway:', error);
                if (typeof eruda !== 'undefined') {
                    eruda.get('console').error('Game init failed, but showing game anyway:', error);
                }
            }
        } else {
            console.error('Could not find splash or game elements');
            if (typeof eruda !== 'undefined') {
                eruda.get('console').error('Could not find splash or game elements');
            }
        }
    }
    
    // Add click-through functionality for splash background
    splashScreen.addEventListener('click', function(e) {
        // Only start game if clicking on the splash screen background itself
        // Don't start if clicking on buttons or other elements
        if (e.target === splashScreen || e.target.classList.contains('splash-content') || 
            e.target.classList.contains('splash-title') || e.target.classList.contains('splash-subtitle-text') ||
            e.target.classList.contains('splash-instruction') || e.target.classList.contains('splash-version') ||
            e.target.tagName === 'H1' || e.target.tagName === 'H2' || e.target.tagName === 'P') {
            console.log('Splash background clicked, starting game with music...');
            if (typeof eruda !== 'undefined') {
                eruda.get('console').log('Splash background clicked, starting game with music...');
            }
            // Default to music version when clicking background
            startGameWithMusic();
        }
    }, true);
    
    // Also allow keyboard input to start (space or enter)
    document.addEventListener('keydown', function(event) {
        if (splashScreen.style.display !== 'none') {
            if (event.code === 'Space' || event.code === 'Enter') {
                console.log('Keyboard input detected, starting game with music...');
                if (typeof eruda !== 'undefined') {
                    eruda.get('console').log('Keyboard input detected, starting game with music...');
                }
                event.preventDefault();
                // Default to music version for keyboard shortcuts
                startGameWithMusic();
            }
        }
    });
    
    console.log('Splash screen event listeners set up successfully');
    if (typeof eruda !== 'undefined') {
        eruda.get('console').log('Splash screen event listeners set up successfully');
    }
}

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
    console.log('=== INITGAME CALLED ===');
    console.log('FEATURE_UNLOCKS available in initGame:', typeof window.FEATURE_UNLOCKS !== 'undefined' ? 'YES' : 'NO');
    console.log('initGame called');
    
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
            straws = new Decimal(savegame.straws || 0);
            cups = new Decimal(savegame.cups || 0);
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
            level = new Decimal(savegame.level || 1);
            totalSipsEarned = new Decimal(savegame.totalSipsEarned || 0);
            gameStartDate = savegame.gameStartDate || Date.now();
            lastClickTime = savegame.lastClickTime || 0;
            clickTimes = savegame.clickTimes || [];
        }

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
                let tempStrawSPD = new Decimal(window.GAME_CONFIG.BALANCE.STRAW_BASE_SPD);
                let tempCupSPD = new Decimal(window.GAME_CONFIG.BALANCE.CUP_BASE_SPD);

                // Apply upgrade multipliers to temporary SPD values
                if (widerStraws.gt(0)) {
                    const upgradeMultiplier = new Decimal(1 + (widerStraws.toNumber() * window.GAME_CONFIG.BALANCE.WIDER_STRAWS_MULTIPLIER));
                    tempStrawSPD = tempStrawSPD.times(upgradeMultiplier);
                }
                if (betterCups.gt(0)) {
                    const upgradeMultiplier = new Decimal(1 + (betterCups.toNumber() * window.GAME_CONFIG.BALANCE.BETTER_CUPS_MULTIPLIER));
                    tempCupSPD = tempCupSPD.times(upgradeMultiplier);
                }

                const tempTotalSPD = tempStrawSPD.times(straws).plus(tempCupSPD.times(cups));
                
                // Add base sips per drink to offline earnings
                const baseSipsPerDrink = new Decimal(window.GAME_CONFIG.BALANCE.BASE_SIPS_PER_DRINK);
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
            totalSipsEarned = new Decimal(0);
            gameStartDate = Date.now();
            lastClickTime = 0;
            clickTimes = [];
        }



        const config = window.GAME_CONFIG?.BALANCE || {};
                        strawSPD = new Decimal(config.STRAW_BASE_SPD);
                cupSPD = new Decimal(config.CUP_BASE_SPD);
                suctionClickBonus = new Decimal(config.SUCTION_CLICK_BONUS).times(suctions);

        // Apply upgrade multipliers to base SPD values
        if (widerStraws.gt(0)) {
            const upgradeMultiplier = new Decimal(1 + (widerStraws.toNumber() * config.WIDER_STRAWS_MULTIPLIER));
            strawSPD = strawSPD.times(upgradeMultiplier);
        }
        if (betterCups.gt(0)) {
            const upgradeMultiplier = new Decimal(1 + (betterCups.toNumber() * config.BETTER_CUPS_MULTIPLIER));
            cupSPD = cupSPD.times(upgradeMultiplier);
        }
        
        // Initialize sps with base configured sips per drink
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        sps = baseSipsPerDrink.plus(passiveSipsPerDrink);

        // Initialize drink rate based on upgrades
        updateDrinkRate();
        
        // Update the top sips per drink display
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();

        // Initialize progressive feature unlock system after game variables are set up
        console.log('About to call FEATURE_UNLOCKS.init()...');
        console.log('FEATURE_UNLOCKS object:', window.FEATURE_UNLOCKS);
        FEATURE_UNLOCKS.init();

        console.log('Game variables initialized, calling reload...');
        
        // Call reload to initialize the game
        reload();
        
        console.log('Starting game loop...');
        // Start the game loop
        startGameLoop();
        
        // Update critical click display with initial value
        updateCriticalClickDisplay();
        
        // Initialize music player
        initMusicPlayer();
        
        // Initialize audio context for click sounds
        initAudioContext();
        
        // Load click sounds preference
        loadClickSoundsPreference();
        
        // Update click sounds button text to match current state
        const clickSoundsToggle = document.getElementById('clickSoundsToggle');
        if (clickSoundsToggle) {
            clickSoundsToggle.textContent = clickSoundsEnabled ? '🔊 Click Sounds ON' : '🔇 Click Sounds OFF';
            clickSoundsToggle.classList.toggle('sounds-off', !clickSoundsEnabled);
        }
        
        console.log('Game initialization complete!');
        
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
    let lastUpdate = 0;
    let lastStatsUpdate = 0;
    const targetFPS = window.GAME_CONFIG.LIMITS.TARGET_FPS;
    const frameInterval = 1000 / targetFPS;
    const statsInterval = window.GAME_CONFIG.LIMITS.STATS_UPDATE_INTERVAL; // Update stats every second
    
    function gameLoop(currentTime) {
        // Update drink progress and game logic at target FPS
        if (currentTime - lastUpdate >= frameInterval) {
            updateDrinkProgress();
            processDrink();
            // Check affordability more frequently for better responsiveness
            const affordabilityInterval = window.GAME_CONFIG.LIMITS.AFFORDABILITY_CHECK_INTERVAL;
            if (currentTime - lastUpdate >= affordabilityInterval) { // Check every configured interval
                checkUpgradeAffordability();
            }
            lastUpdate = currentTime;
        }
        
        // Update stats and time tracking every second
        if (currentTime - lastStatsUpdate >= statsInterval) {
            updatePlayTime();
            updateLastSaveTime();
            updateAllStats();
            checkUpgradeAffordability(); // Check affordability every second
            FEATURE_UNLOCKS.checkAllUnlocks(); // Check for new feature unlocks
            lastStatsUpdate = currentTime;
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
}

function updateDrinkProgress() {
    const currentTime = Date.now();
    const timeSinceLastDrink = currentTime - lastDrinkTime;
    drinkProgress = (timeSinceLastDrink / drinkRate) * 100;
    
    // Cache DOM elements to reduce queries
    const progressFill = DOM_CACHE.drinkProgressFill;
    const countdown = DOM_CACHE.drinkCountdown;
    
    if (progressFill && countdown) {
        // Use requestAnimationFrame for smoother progress bar updates
        requestAnimationFrame(() => {
            progressFill.style.width = Math.min(drinkProgress, 100) + '%';
            
            // Update countdown text
            const remainingTime = Math.max(0, (drinkRate - timeSinceLastDrink) / 1000);
            countdown.textContent = remainingTime.toFixed(1) + 's';
            
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
        
        // Check for feature unlocks after processing a drink
        FEATURE_UNLOCKS.checkAllUnlocks();
        
        // Update auto-save counter based on configurable interval
        if (autosaveEnabled) {
            autosaveCounter += 1;
            // Convert drink rate to seconds and calculate how many drinks equal the auto-save interval
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
        
        console.log('Sips per drink Debug:', {
            baseSipsPerDrink: baseSipsPerDrink.toString(),
            passiveSipsPerDrink: passiveSipsPerDrink.toString(),
            totalSipsPerDrink: totalSipsPerDrink.toString(),
            strawSPD: strawSPD.toString(),
            straws: straws.toString(),
            cupSPD: cupSPD.toString(),
            cups: cups.toString()
        });
        topSipsPerDrinkElement.textContent = prettify(totalSipsPerDrink);
    }
}

// Function to update the top total sips per second display (passive production only)
function updateTopSipsPerSecond() {
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

        // Debug logging to check the calculation
        console.log('Total/s Debug:', {
            baseSipsPerDrink: baseSipsPerDrink.toString(),
            passiveSipsPerDrink: passiveSipsPerDrink.toString(),
            totalSipsPerDrink: totalSipsPerDrink.toString(),
            drinkRateSeconds: drinkRateSeconds,
            totalSipsPerSecond: totalSipsPerSecond.toString()
        });

        // Also log passive calculation separately
        console.log('Passive Calculation:', {
            strawSPD: strawSPD.toString(),
            straws: straws.toString(),
            strawContribution: strawSPD.times(straws).toString(),
            cupSPD: cupSPD.toString(),
            cups: cups.toString(),
            cupContribution: cupSPD.times(cups).toString(),
            drinkRate: drinkRate
        });

        topSipsPerSecondElement.textContent = prettify(totalSipsPerSecond);
    }
}

// Function to update the critical click chance display
function updateCriticalClickDisplay() {
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
    autosaveEnabled = checkbox.checked;
    updateAutosaveStatus();
    saveOptions();
}

function changeAutosaveInterval() {
    const select = document.getElementById('autosaveInterval');
    autosaveInterval = parseInt(select.value);
    autosaveCounter = 0; // Reset counter when changing interval
    updateAutosaveStatus();
    saveOptions();
}

function updateAutosaveStatus() {
    const status = document.getElementById('autosaveStatus');
    if (status) {
        if (autosaveEnabled) {
            status.textContent = `Auto-save enabled (${autosaveInterval}s)`;
        } else {
            status.textContent = 'Auto-save disabled';
        }
    }
}

function saveOptions() {
    const options = {
        autosaveEnabled: autosaveEnabled,
        autosaveInterval: autosaveInterval
    };
    try {
        if (window.App?.storage?.setJSON) {
            window.App.storage.setJSON('gameOptions', options);
        } else {
            localStorage.setItem('gameOptions', JSON.stringify(options));
        }
    } catch (e) {
        console.warn('saveOptions failed:', e);
    }
}

function loadOptions() {
    let options = null;
    try {
        if (window.App?.storage?.getJSON) {
            options = window.App.storage.getJSON('gameOptions', null);
        } else {
            const savedOptions = localStorage.getItem('gameOptions');
            if (savedOptions) options = JSON.parse(savedOptions);
        }
    } catch (e) {
        console.warn('loadOptions failed:', e);
    }
    if (options) {
        autosaveEnabled = options.autosaveEnabled !== undefined ? options.autosaveEnabled : true;
        autosaveInterval = options.autosaveInterval || window.GAME_CONFIG.TIMING.AUTOSAVE_INTERVAL;
    }
    
    // Update UI to match loaded options
    const checkbox = document.getElementById('autosaveToggle');
    const select = document.getElementById('autosaveInterval');
    
    if (checkbox) checkbox.checked = autosaveEnabled;
    if (select) select.value = autosaveInterval.toString();
    
    updateAutosaveStatus();
}

// Play time tracking
function updatePlayTime() {
    const playTimeElement = DOM_CACHE.playTime;
    if (playTimeElement) {
        const currentTime = Date.now();
        const playTimeMs = currentTime - gameStartTime;
        const playTimeSeconds = Math.floor(playTimeMs / 1000);
        const hours = Math.floor(playTimeSeconds / 3600);
        const minutes = Math.floor((playTimeSeconds % 3600) / 60);
        const seconds = playTimeSeconds % 60;
        playTimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function updateLastSaveTime() {
    const lastSaveElement = DOM_CACHE.lastSaveTime;
    if (lastSaveElement) {
        if (lastSaveTime) {
            const timeAgo = Math.floor((Date.now() - lastSaveTime) / 1000);
            if (timeAgo < 60) {
                lastSaveElement.textContent = `${timeAgo} seconds ago`;
            } else if (timeAgo < 3600) {
                lastSaveElement.textContent = `${Math.floor(timeAgo / 60)} minutes ago`;
            } else {
                lastSaveElement.textContent = `${Math.floor(timeAgo / 3600)} hours ago`;
            }
        } else {
            lastSaveElement.textContent = 'Never';
        }
    }
}

// Statistics update functions
function updateAllStats() {
    // Only update stats if the stats tab is active and elements exist
    const statsTab = DOM_CACHE.statsTab;
    if (statsTab && statsTab.classList.contains('active')) {
        updateTimeStats();
        updateClickStats();
        updateEconomyStats();
        updateShopStats();
        updateAchievementStats();
    }
}

function updateTimeStats() {
    // Total play time (including previous sessions)
    const totalPlayTimeElement = DOM_CACHE.totalPlayTime;
    if (totalPlayTimeElement) {
        const totalTime = Date.now() - gameStartDate;
        const totalSeconds = Math.floor(totalTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        totalPlayTimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Current session time
    const sessionTimeElement = DOM_CACHE.sessionTime;
    if (sessionTimeElement) {
        const sessionTime = Date.now() - gameStartTime;
        const sessionSeconds = Math.floor(sessionTime / 1000);
        const hours = Math.floor(sessionSeconds / 3600);
        const minutes = Math.floor((sessionSeconds % 3600) / 60);
        const seconds = sessionSeconds % 60;
        sessionTimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Days since start
    const daysSinceStartElement = DOM_CACHE.daysSinceStart;
    if (daysSinceStartElement) {
        const daysSinceStart = Math.floor((Date.now() - gameStartDate) / (1000 * 60 * 60 * 24));
        daysSinceStartElement.textContent = daysSinceStart.toString();
    }
}

function updateClickStats() {
    // Total clicks
            const totalClicksElement = DOM_CACHE.totalClicks;
        if (totalClicksElement) {
            totalClicksElement.textContent = prettify(window.totalClicks);
    }
    
    // Clicks per second (last 10 seconds)
    const clicksPerSecondElement = DOM_CACHE.clicksPerSecond;
    if (clicksPerSecondElement) {
        const now = Date.now();
        const tenSecondsAgo = now - 10000;
        const recentClicks = clickTimes.filter(time => time > tenSecondsAgo).length;
        clicksPerSecondElement.textContent = (recentClicks / 10).toFixed(2);
    }
    
    // Best click streak
    const bestClickStreakElement = DOM_CACHE.bestClickStreak;
    if (bestClickStreakElement) {
        bestClickStreakElement.textContent = bestClickStreak.toString();
    }
}

function updateEconomyStats() {
    // Total sips earned
    const totalSipsEarnedElement = DOM_CACHE.totalSipsEarned;
    if (totalSipsEarnedElement) {
        totalSipsEarnedElement.textContent = prettify(totalSipsEarned);
    }
    
    // Current sips per second
    const currentSipsPerSecondElement = DOM_CACHE.currentSipsPerSecond;
    if (currentSipsPerSecondElement) {
        // Include base configured sips per drink in the calculation
        const config = window.GAME_CONFIG?.BALANCE || {};
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        const totalSipsPerDrink = baseSipsPerDrink.plus(passiveSipsPerDrink);
        
        const drinkRateSeconds = drinkRate / 1000;
        const currentSPS = totalSipsPerDrink.div(drinkRateSeconds);
        currentSipsPerSecondElement.textContent = prettify(currentSPS);
    }
    
    // Highest sips per second achieved
    const highestSipsPerSecondElement = DOM_CACHE.highestSipsPerSecond;
    if (highestSipsPerSecondElement) {
        highestSipsPerSecondElement.textContent = prettify(highestSipsPerSecond);
    }
}

function updateShopStats() {
    // Straws purchased
    const strawsPurchasedElement = DOM_CACHE.strawsPurchased;
    if (strawsPurchasedElement) {
        strawsPurchasedElement.textContent = prettify(straws);
    }
    
    // Cups purchased
    const cupsPurchasedElement = DOM_CACHE.cupsPurchased;
    if (cupsPurchasedElement) {
        cupsPurchasedElement.textContent = prettify(cups);
    }
    
    // Wider straws purchased
    const widerStrawsPurchasedElement = DOM_CACHE.widerStrawsPurchased;
    if (widerStrawsPurchasedElement) {
        widerStrawsPurchasedElement.textContent = prettify(widerStraws);
    }
    
    // Better cups purchased
    const betterCupsPurchasedElement = DOM_CACHE.betterCupsPurchased;
    if (betterCupsPurchasedElement) {
        betterCupsPurchasedElement.textContent = prettify(betterCups);
    }
    
    // Suctions purchased
    const suctionsPurchasedElement = DOM_CACHE.suctionsPurchased;
    if (suctionsPurchasedElement) {
        suctionsPurchasedElement.textContent = prettify(suctions);
    }
    
    // Critical clicks purchased
    const criticalClicksPurchasedElement = DOM_CACHE.criticalClicksPurchased;
    if (criticalClicksPurchasedElement) {
        criticalClicksPurchasedElement.textContent = prettify(criticalClicks);
    }
}

function updateAchievementStats() {
    // Current level
    const currentLevelElement = DOM_CACHE.currentLevel;
    if (currentLevelElement) {
        currentLevelElement.textContent = level.toString();
    }
    
    // Total upgrades (sum of all upgrade counters)
    const totalUpgradesElement = DOM_CACHE.totalUpgrades;
    if (totalUpgradesElement) {
        const totalUpgrades = widerStraws.plus(betterCups).plus(suctionUpCounter).plus(fasterDrinksUpCounter).plus(criticalClickUpCounter);
        totalUpgradesElement.textContent = prettify(totalUpgrades);
    }
    
    // Faster drinks owned
    const fasterDrinksOwnedElement = DOM_CACHE.fasterDrinksOwned;
    if (fasterDrinksOwnedElement) {
        fasterDrinksOwnedElement.textContent = prettify(fasterDrinks);
    }
}

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
    
    // Play straw sip sound effect
    playStrawSipSound();
    
    // Update stats display if stats tab is active
    if (DOM_CACHE.statsTab && DOM_CACHE.statsTab.classList.contains('active')) {
        updateClickStats();
    }
}

// Straw sip sound effect system
let audioContext = null;

// Initialize audio context for sound effects
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized for sound effects');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            clickSoundsEnabled = false;
        }
    }
}

// Generate a straw sip sound with random modulation
function playStrawSipSound() {
    if (!clickSoundsEnabled || !audioContext) {
        return;
    }
    
    // Randomly choose between the three sound types for variety
    const soundChoice = Math.random();
    if (soundChoice < 0.5) {
        playBasicStrawSipSound();
    } else if (soundChoice < 0.8) {
        playAlternativeStrawSipSound();
    } else {
        playBubbleStrawSipSound();
    }
}

// Basic straw sip sound
function playBasicStrawSipSound() {
    try {
        // Create oscillator for the main sip sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Random modulation parameters for variety
            const config = window.GAME_CONFIG.AUDIO;
    const baseFreq = config.CLICK_SOUND_BASE_FREQ_MIN + Math.random() * (config.CLICK_SOUND_BASE_FREQ_MAX - config.CLICK_SOUND_BASE_FREQ_MIN);
    const duration = config.CLICK_SOUND_DURATION_MIN + Math.random() * (config.CLICK_SOUND_DURATION_MAX - config.CLICK_SOUND_DURATION_MIN);
    const volume = config.CLICK_SOUND_VOLUME_MIN + Math.random() * (config.CLICK_SOUND_VOLUME_MAX - config.CLICK_SOUND_VOLUME_MIN);
        
        // Set up oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
        
        // Add frequency modulation for realistic straw sound
        oscillator.frequency.exponentialRampToValueAtTime(
            baseFreq * (0.8 + Math.random() * 0.4), 
            audioContext.currentTime + duration
        );
        
        // Set up gain envelope for natural sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start and stop the sound
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        // Clean up
        setTimeout(() => {
            oscillator.disconnect();
            gainNode.disconnect();
        }, duration * 1000 + 100);
        
    } catch (error) {
        console.error('Error playing basic straw sip sound:', error);
    }
}

// Alternative straw sip sound with different characteristics
function playAlternativeStrawSipSound() {
    if (!clickSoundsEnabled || !audioContext) {
        return;
    }
    
    try {
        // Create multiple oscillators for a richer sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        
        // Random parameters
            const config = window.GAME_CONFIG.AUDIO;
    const baseFreq1 = config.CRITICAL_CLICK_FREQ1_MIN + Math.random() * (config.CRITICAL_CLICK_FREQ1_MAX - config.CRITICAL_CLICK_FREQ1_MIN);
    const baseFreq2 = config.CRITICAL_CLICK_FREQ2_MIN + Math.random() * (config.CRITICAL_CLICK_FREQ2_MAX - config.CRITICAL_CLICK_FREQ2_MIN);
    const duration = config.CRITICAL_CLICK_DURATION_MIN + Math.random() * (config.CRITICAL_CLICK_DURATION_MAX - config.CRITICAL_CLICK_DURATION_MIN);
    const volume = config.CRITICAL_CLICK_VOLUME_MIN + Math.random() * (config.CRITICAL_CLICK_VOLUME_MAX - config.CRITICAL_CLICK_VOLUME_MIN);
        
        // Set up oscillators
        oscillator1.type = 'triangle';
        oscillator2.type = 'sine';
        
        oscillator1.frequency.setValueAtTime(baseFreq1, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(baseFreq2, audioContext.currentTime);
        
        // Add subtle frequency changes
        oscillator1.frequency.exponentialRampToValueAtTime(
            baseFreq1 * (0.9 + Math.random() * 0.2), 
            audioContext.currentTime + duration
        );
        oscillator2.frequency.exponentialRampToValueAtTime(
            baseFreq2 * (0.85 + Math.random() * 0.3), 
            audioContext.currentTime + duration
        );
        
        // Set up filter for more realistic straw sound
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(800 + Math.random() * 400, audioContext.currentTime);
        filterNode.Q.setValueAtTime(2 + Math.random() * 3, audioContext.currentTime);
        
        // Set up gain envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        // Connect nodes
        oscillator1.connect(filterNode);
        oscillator2.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start and stop sounds
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + duration);
        oscillator2.stop(audioContext.currentTime + duration);
        
        // Clean up
        setTimeout(() => {
            oscillator1.disconnect();
            oscillator2.disconnect();
            filterNode.disconnect();
            gainNode.disconnect();
        }, duration * 1000 + 100);
        
    } catch (error) {
        console.error('Error playing alternative straw sip sound:', error);
    }
}

// Bubble straw sip sound with more complex modulation
function playBubbleStrawSipSound() {
    if (!clickSoundsEnabled || !audioContext) {
        return;
    }
    
    try {
        // Create multiple oscillators for a bubbly effect
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const oscillator3 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        const delayNode = audioContext.createDelay();
        
        // Random parameters for variety
            const config = window.GAME_CONFIG.AUDIO;
    const baseFreq1 = config.LEVEL_UP_FREQ1_MIN + Math.random() * (config.LEVEL_UP_FREQ1_MAX - config.LEVEL_UP_FREQ1_MIN);
    const baseFreq2 = config.LEVEL_UP_FREQ2_MIN + Math.random() * (config.LEVEL_UP_FREQ2_MAX - config.LEVEL_UP_FREQ2_MIN);
    const baseFreq3 = config.LEVEL_UP_FREQ3_MIN + Math.random() * (config.LEVEL_UP_FREQ3_MAX - config.LEVEL_UP_FREQ3_MIN);
    const duration = config.LEVEL_UP_DURATION_MIN + Math.random() * (config.LEVEL_UP_DURATION_MAX - config.LEVEL_UP_DURATION_MIN);
    const volume = config.LEVEL_UP_VOLUME_MIN + Math.random() * (config.LEVEL_UP_VOLUME_MAX - config.LEVEL_UP_VOLUME_MIN);
        
        // Set up oscillators with different waveforms
        oscillator1.type = 'sawtooth';
        oscillator2.type = 'square';
        oscillator3.type = 'sine';
        
        oscillator1.frequency.setValueAtTime(baseFreq1, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(baseFreq2, audioContext.currentTime);
        oscillator3.frequency.setValueAtTime(baseFreq3, audioContext.currentTime);
        
        // Add complex frequency modulation for bubbly effect
        oscillator1.frequency.exponentialRampToValueAtTime(
            baseFreq1 * (0.7 + Math.random() * 0.6), 
            audioContext.currentTime + duration
        );
        oscillator2.frequency.exponentialRampToValueAtTime(
            baseFreq2 * (0.6 + Math.random() * 0.8), 
            audioContext.currentTime + duration
        );
        oscillator3.frequency.exponentialRampToValueAtTime(
            baseFreq3 * (0.5 + Math.random() * 1.0), 
            audioContext.currentTime + duration
        );
        
        // Set up filter for bubbly character
        filterNode.type = 'bandpass';
        filterNode.frequency.setValueAtTime(600 + Math.random() * 300, audioContext.currentTime);
        filterNode.Q.setValueAtTime(4 + Math.random() * 4, audioContext.currentTime);
        
        // Add subtle delay for depth
        delayNode.delayTime.setValueAtTime(0.01 + Math.random() * 0.02, audioContext.currentTime);
        
        // Set up gain envelope with multiple stages
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.003);
        gainNode.gain.setValueAtTime(volume * 0.8, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        // Connect nodes with delay for depth
        oscillator1.connect(filterNode);
        oscillator2.connect(filterNode);
        oscillator3.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(delayNode);
        delayNode.connect(audioContext.destination);
        
        // Start and stop sounds
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator3.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + duration);
        oscillator2.stop(audioContext.currentTime + duration);
        oscillator3.stop(audioContext.currentTime + duration);
        
        // Clean up
        setTimeout(() => {
            oscillator1.disconnect();
            oscillator2.disconnect();
            oscillator3.disconnect();
            filterNode.disconnect();
            gainNode.disconnect();
            delayNode.disconnect();
        }, duration * 1000 + 100);
        
    } catch (error) {
        console.error('Error playing bubble straw sip sound:', error);
    }
}

// Generate a critical click sound with dramatic effect
function playCriticalClickSound() {
    if (!clickSoundsEnabled || !audioContext) {
        return;
    }
    
    try {
        // Create multiple oscillators for a dramatic critical sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const oscillator3 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        const delayNode = audioContext.createDelay();
        
        // Critical sound parameters - more dramatic than regular sounds
            const config = window.GAME_CONFIG.AUDIO;
    const baseFreq1 = config.PURCHASE_FREQ1_MIN + Math.random() * (config.PURCHASE_FREQ1_MAX - config.PURCHASE_FREQ1_MIN);
    const baseFreq2 = config.PURCHASE_FREQ2_MIN + Math.random() * (config.PURCHASE_FREQ2_MAX - config.PURCHASE_FREQ2_MIN);
    const baseFreq3 = config.PURCHASE_FREQ3_MIN + Math.random() * (config.PURCHASE_FREQ3_MAX - config.PURCHASE_FREQ3_MIN);
    const duration = config.PURCHASE_DURATION_MIN + Math.random() * (config.PURCHASE_DURATION_MAX - config.PURCHASE_DURATION_MIN);
    const volume = config.PURCHASE_VOLUME_MIN + Math.random() * (config.PURCHASE_VOLUME_MAX - config.PURCHASE_VOLUME_MIN);
        
        // Set up oscillators with different waveforms for dramatic effect
        oscillator1.type = 'sawtooth'; // Rich harmonics
        oscillator2.type = 'square'; // Strong presence
        oscillator3.type = 'triangle'; // Smooth high end
        
        oscillator1.frequency.setValueAtTime(baseFreq1, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(baseFreq2, audioContext.currentTime);
        oscillator3.frequency.setValueAtTime(baseFreq3, audioContext.currentTime);
        
        // Add dramatic frequency sweeps for critical effect
        oscillator1.frequency.exponentialRampToValueAtTime(
            baseFreq1 * (0.5 + Math.random() * 1.0), 
            audioContext.currentTime + duration
        );
        oscillator2.frequency.exponentialRampToValueAtTime(
            baseFreq2 * (0.3 + Math.random() * 1.4), 
            audioContext.currentTime + duration
        );
        oscillator3.frequency.exponentialRampToValueAtTime(
            baseFreq3 * (0.2 + Math.random() * 1.8), 
            audioContext.currentTime + duration
        );
        
        // Set up filter for dramatic character
        filterNode.type = 'highpass'; // Emphasize high frequencies
        filterNode.frequency.setValueAtTime(300 + Math.random() * 200, audioContext.currentTime);
        filterNode.Q.setValueAtTime(6 + Math.random() * 4, audioContext.currentTime);
        
        // Add delay for dramatic depth
        delayNode.delayTime.setValueAtTime(0.02 + Math.random() * 0.03, audioContext.currentTime);
        
        // Set up gain envelope with dramatic attack and release
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.001); // Fast attack
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(volume * 0.9, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        // Connect nodes with delay for dramatic depth
        oscillator1.connect(filterNode);
        oscillator2.connect(filterNode);
        oscillator3.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(delayNode);
        delayNode.connect(audioContext.destination);
        
        // Start and stop sounds
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator3.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + duration);
        oscillator2.stop(audioContext.currentTime + duration);
        oscillator3.stop(audioContext.currentTime + duration);
        
        // Clean up
        setTimeout(() => {
            oscillator1.disconnect();
            oscillator2.disconnect();
            oscillator3.disconnect();
            filterNode.disconnect();
            gainNode.disconnect();
            delayNode.disconnect();
        }, duration * 1000 + 100);
        
    } catch (error) {
        console.error('Error playing critical click sound:', error);
    }
}

// Generate a deep purchase sound for shop upgrades
function playPurchaseSound() {
    if (!clickSoundsEnabled || !audioContext) {
        return;
    }
    
    try {
        // Create oscillators for a deep, satisfying purchase sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        const delayNode = audioContext.createDelay();
        
        // Deep purchase sound parameters
            const config = window.GAME_CONFIG.AUDIO;
    const baseFreq1 = config.SODA_CLICK_FREQ1_MIN + Math.random() * (config.SODA_CLICK_FREQ1_MAX - config.SODA_CLICK_FREQ1_MIN);
    const baseFreq2 = config.SODA_CLICK_FREQ2_MIN + Math.random() * (config.SODA_CLICK_FREQ2_MAX - config.SODA_CLICK_FREQ2_MIN);
    const duration = config.SODA_CLICK_DURATION_MIN + Math.random() * (config.SODA_CLICK_DURATION_MAX - config.SODA_CLICK_DURATION_MIN);
    const volume = config.SODA_CLICK_VOLUME_MIN + Math.random() * (config.SODA_CLICK_VOLUME_MAX - config.SODA_CLICK_VOLUME_MIN);
        
        // Set up oscillators with deep waveforms
        oscillator1.type = 'sine'; // Pure, deep tone
        oscillator2.type = 'triangle'; // Rich harmonics
        
        oscillator1.frequency.setValueAtTime(baseFreq1, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(baseFreq2, audioContext.currentTime);
        
        // Add subtle frequency modulation for depth
        oscillator1.frequency.exponentialRampToValueAtTime(
            baseFreq1 * (0.9 + Math.random() * 0.2), 
            audioContext.currentTime + duration
        );
        oscillator2.frequency.exponentialRampToValueAtTime(
            baseFreq2 * (0.85 + Math.random() * 0.3), 
            audioContext.currentTime + duration
        );
        
        // Set up low-pass filter for deep, warm character
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(300 + Math.random() * 200, audioContext.currentTime);
        filterNode.Q.setValueAtTime(3 + Math.random() * 2, audioContext.currentTime);
        
        // Add subtle delay for depth
        delayNode.delayTime.setValueAtTime(0.03 + Math.random() * 0.02, audioContext.currentTime);
        
        // Set up gain envelope with smooth attack and release
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05); // Smooth attack
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(volume * 0.8, audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        // Connect nodes for deep sound
        oscillator1.connect(filterNode);
        oscillator2.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(delayNode);
        delayNode.connect(audioContext.destination);
        
        // Start and stop sounds
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + duration);
        oscillator2.stop(audioContext.currentTime + duration);
        
        // Clean up
        setTimeout(() => {
            oscillator1.disconnect();
            oscillator2.disconnect();
            filterNode.disconnect();
            gainNode.disconnect();
            delayNode.disconnect();
        }, duration * 1000 + 100);
        
    } catch (error) {
        console.error('Error playing purchase sound:', error);
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
    const toggleButton = document.getElementById('clickSoundsToggle');
    if (toggleButton) {
        toggleButton.textContent = clickSoundsEnabled ? '🔊 Click Sounds ON' : '🔇 Click Sounds OFF';
        toggleButton.classList.toggle('sounds-off', !clickSoundsEnabled);
    }
    
    console.log('Click sounds:', clickSoundsEnabled ? 'enabled' : 'disabled');
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
    // Update compact drink speed display elements
    const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
    const drinkSpeedBonusCompact = document.getElementById('drinkSpeedBonusCompact');
    
    if (currentDrinkSpeedCompact) {
        currentDrinkSpeedCompact.textContent = getDrinkRateSeconds().toFixed(2) + 's';
    }
    
    if (drinkSpeedBonusCompact) {
        const config = window.GAME_CONFIG?.BALANCE || {};
        let totalReduction = fasterDrinks.times(fasterDrinksUpCounter).times(config.FASTER_DRINKS_REDUCTION_PER_LEVEL);
        let speedBonusPercent = totalReduction.times(100);
        drinkSpeedBonusCompact.textContent = speedBonusPercent.toFixed(1) + '%';
    }
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
        
        // Play critical click sound
        if (clickSoundsEnabled) {
            playCriticalClickSound();
        }
        
        console.log('CRITICAL CLICK! Multiplier: ' + criticalMultiplier.toString());
    }
    
    // Calculate total sips gained from this click
    const baseSips = new Decimal(number);
    const totalSipsGained = baseSips.plus(suctionClickBonus).times(criticalMultiplier);
    
    // Add to total sips earned
    totalSipsEarned = totalSipsEarned.plus(totalSipsGained);
    
    // Update sips
            window.sips = window.sips.plus(totalSipsGained);
    
    // Batch DOM updates to reduce layout thrashing
    requestAnimationFrame(() => {

        
        // Update top sip counter
        const topSipElement = DOM_CACHE.topSipValue;
        if (topSipElement) {
            topSipElement.innerHTML = prettify(window.sips);
        }
        
        // Show click feedback
        showClickFeedback(totalSipsGained, isCritical);
        
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
    checkUpgradeAffordability();
    
    // Check for feature unlocks after clicking
    FEATURE_UNLOCKS.checkAllUnlocks();
}

// Function to show click feedback numbers
function showClickFeedback(sipsGained, isCritical = false) {
    const sodaContainer = DOM_CACHE.sodaButton.parentNode;
    if (!sodaContainer) return;
    
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
    
    // Use more efficient positioning to avoid layout recalculations
    const containerRect = sodaContainer.getBoundingClientRect();
    const config = window.GAME_CONFIG?.LIMITS || {};
    const rangeX = config.CLICK_FEEDBACK_RANGE_X;
    const rangeY = config.CLICK_FEEDBACK_RANGE_Y;
    const randomX = (Math.random() - 0.5) * rangeX; // -rangeX/2px to +rangeX/2px
    const randomY = (Math.random() - 0.5) * rangeY;  // -rangeY/2px to +rangeY/2px
    
    // Position relative to container center for more stable positioning
    feedback.style.position = 'absolute';
    feedback.style.left = '50%';
    feedback.style.top = '50%';
    feedback.style.transform = `translate(-50%, -50%) translate(${randomX}px, ${randomY}px)`;
    
    // Add to container
    sodaContainer.appendChild(feedback);
    
    // Use requestAnimationFrame for smoother removal
    requestAnimationFrame(() => {
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, isCritical ? 
            window.GAME_CONFIG.TIMING.CRITICAL_FEEDBACK_DURATION : 
            window.GAME_CONFIG.TIMING.CLICK_FEEDBACK_DURATION); // Critical feedback stays longer
    });
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
    const topSipElement = DOM_CACHE.topSipValue;
    if (topSipElement) {
        topSipElement.innerHTML = prettify(window.sips);
    }
    
    // Update critical click display
    updateCriticalClickDisplay();
}

function buyStraw() {
    // IMPROVED BALANCE: Better early game progression
    const config = window.GAME_CONFIG?.BALANCE || {};
    let strawCost = Math.floor(config.STRAW_BASE_COST * Math.pow(config.STRAW_SCALING, straws.toNumber()));
            if (window.sips.gte(strawCost)) {
        straws = straws.plus(1);
        window.sips = window.sips.minus(strawCost);

        // Recalculate strawSPD with current upgrade multipliers
        const baseStrawSPD = new Decimal(config.STRAW_BASE_SPD);
        const upgradeMultiplier = widerStraws.gt(0) ? new Decimal(1 + (widerStraws.toNumber() * config.WIDER_STRAWS_MULTIPLIER)) : new Decimal(1);
        strawSPD = baseStrawSPD.times(upgradeMultiplier);

        // Include base configured sips per drink in total SPS
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        sps = baseSipsPerDrink.plus(passiveSipsPerDrink);

        // Update the top sips/d indicator
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();

        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }

        // Show purchase feedback
        showPurchaseFeedback('Extra Straw', strawCost);

        reload();
        checkUpgradeAffordability();
    }
}



function buyCup() {
    // IMPROVED BALANCE: Better mid-game progression
    const config = window.GAME_CONFIG?.BALANCE || {};
    let cupCost = Math.floor(config.CUP_BASE_COST * Math.pow(config.CUP_SCALING, cups.toNumber()));
            if (window.sips.gte(cupCost)) {
        cups = cups.plus(1);
        window.sips = window.sips.minus(cupCost);

        // Recalculate cupSPD with current upgrade multipliers
        const baseCupSPD = new Decimal(config.CUP_BASE_SPD);
        const upgradeMultiplier = betterCups.gt(0) ? new Decimal(1 + (betterCups.toNumber() * config.BETTER_CUPS_MULTIPLIER)) : new Decimal(1);
        cupSPD = baseCupSPD.times(upgradeMultiplier);

        // Include base configured sips per drink in total SPS
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        sps = baseSipsPerDrink.plus(passiveSipsPerDrink);

        // Update the top sips/d indicator
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();

        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }

        // Show purchase feedback
        showPurchaseFeedback('Bigger Cup', cupCost);

        reload();
        checkUpgradeAffordability();
    }
}

function buyWiderStraws() {
    // Now an upgrade that improves base straw production
    const config = window.GAME_CONFIG?.BALANCE || {};
    let widerStrawsCost = Math.floor(config.WIDER_STRAWS_BASE_COST * Math.pow(config.WIDER_STRAWS_SCALING, widerStraws.toNumber()));
            if (window.sips.gte(widerStrawsCost)) {
        widerStraws = widerStraws.plus(1);
        window.sips = window.sips.minus(widerStrawsCost);

        // Calculate new straw SPD with upgrade multiplier
        const upgradeMultiplier = new Decimal(1 + (widerStraws.toNumber() * config.WIDER_STRAWS_MULTIPLIER)); // +50% per level
        strawSPD = new Decimal(config.STRAW_BASE_SPD).times(upgradeMultiplier);

        // Recalculate total SPS including base configured sips per drink
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        sps = baseSipsPerDrink.plus(passiveSipsPerDrink);

        // Update the top sips/d indicator
        updateTopSipsPerDrink();

        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }

        // Show purchase feedback
        showPurchaseFeedback('Wider Straws Upgrade', widerStrawsCost);

        reload();
        checkUpgradeAffordability();
    }
}

function buyBetterCups() {
    // Now an upgrade that improves base cup production
    const config = window.GAME_CONFIG?.BALANCE || {};
    let betterCupsCost = Math.floor(config.BETTER_CUPS_BASE_COST * Math.pow(config.BETTER_CUPS_SCALING, betterCups.toNumber()));
            if (window.sips.gte(betterCupsCost)) {
        betterCups = betterCups.plus(1);
        window.sips = window.sips.minus(betterCupsCost);

        // Calculate new cup SPD with upgrade multiplier
        const upgradeMultiplier = new Decimal(1 + (betterCups.toNumber() * config.BETTER_CUPS_MULTIPLIER)); // +40% per level
        cupSPD = new Decimal(config.CUP_BASE_SPD).times(upgradeMultiplier);

        // Recalculate total SPS including base configured sips per drink
        const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
        const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
        sps = baseSipsPerDrink.plus(passiveSipsPerDrink);

        // Update the top sips/d indicator
        updateTopSipsPerDrink();

        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }

        // Show purchase feedback
        showPurchaseFeedback('Better Cups Upgrade', betterCupsCost);

        reload();
        checkUpgradeAffordability();
    }
}



function buySuction() {
    // IMPROVED BALANCE: Better click bonus progression
    const config = window.GAME_CONFIG?.BALANCE || {};
    let suctionCost = Math.floor(config.SUCTION_BASE_COST * Math.pow(config.SUCTION_SCALING, suctions.toNumber()));
    
            if (window.sips.gte(suctionCost)) {
        suctions = suctions.plus(1);
        window.sips = window.sips.minus(suctionCost);
        suctionClickBonus = new Decimal(config.SUCTION_CLICK_BONUS).times(suctions);

        // Update the sips/s indicator since suction bonus changed
        updateTopSipsPerSecond();

        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        // Show purchase feedback
        showPurchaseFeedback('Improved Suction', suctionCost);
        
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeSuction() {
    // IMPROVED BALANCE: More affordable upgrades
    const config = window.GAME_CONFIG?.BALANCE || {};
    let suctionUpCost = config.SUCTION_UPGRADE_BASE_COST * suctionUpCounter.toNumber();
    
            if (window.sips.gte(suctionUpCost)) {
        window.sips = window.sips.minus(suctionUpCost);
        suctionUpCounter = suctionUpCounter.plus(1);
        suctionClickBonus = new Decimal(config.SUCTION_CLICK_BONUS).times(suctionUpCounter);
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        reload();
        checkUpgradeAffordability();
    }
}

function buyFasterDrinks() {
    // IMPROVED BALANCE: Better drink speed progression
    const config = window.GAME_CONFIG?.BALANCE || {};
    let fasterDrinksCost = Math.floor(config.FASTER_DRINKS_BASE_COST * Math.pow(config.FASTER_DRINKS_SCALING, fasterDrinks.toNumber()));
            if (window.sips.gte(fasterDrinksCost)) {
        fasterDrinks = fasterDrinks.plus(1);
        window.sips = window.sips.minus(fasterDrinksCost);
        updateDrinkRate();
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        // Show purchase feedback
        showPurchaseFeedback('Faster Drinks', fasterDrinksCost);
        
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeFasterDrinks() {
    // IMPROVED BALANCE: More affordable upgrades
    const config = window.GAME_CONFIG?.BALANCE || {};
    let fasterDrinksUpCost = config.FASTER_DRINKS_UPGRADE_BASE_COST * fasterDrinksUpCounter.toNumber();
            if (window.sips.gte(fasterDrinksUpCost)) {
        window.sips = window.sips.minus(fasterDrinksUpCost);
        fasterDrinksUpCounter = fasterDrinksUpCounter.plus(1);
        updateDrinkRate();
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        reload();
        checkUpgradeAffordability();
    }
}

function buyCriticalClick() {
    // IMPROVED BALANCE: Better critical click progression
    const config = window.GAME_CONFIG?.BALANCE || {};
    let criticalClickCost = Math.floor(config.CRITICAL_CLICK_BASE_COST * Math.pow(config.CRITICAL_CLICK_SCALING, criticalClicks.toNumber()));
            if (window.sips.gte(criticalClickCost)) {
        criticalClicks = criticalClicks.plus(1);
        window.sips = window.sips.minus(criticalClickCost);
        
        // Increase critical click chance by configured increment per purchase
        const chanceIncrement = config.CRITICAL_CLICK_CHANCE_INCREMENT;
        criticalClickChance = criticalClickChance.plus(chanceIncrement);

        // Update critical click display
        updateCriticalClickDisplay();

        // Update sips/s indicator since critical chance changed
        updateTopSipsPerSecond();
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        // Show purchase feedback
        showPurchaseFeedback('Critical Click', criticalClickCost);
        
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeCriticalClick() {
    // IMPROVED BALANCE: More affordable upgrades
    const config = window.GAME_CONFIG?.BALANCE || {};
    let criticalClickUpCost = config.CRITICAL_CLICK_UPGRADE_BASE_COST * criticalClickUpCounter.toNumber();
            if (window.sips.gte(criticalClickUpCost)) {
        window.sips = window.sips.minus(criticalClickUpCost);
        criticalClickUpCounter = criticalClickUpCounter.plus(1);
        
        // Increase critical click multiplier by configured increment per upgrade
        const multiplierIncrement = config.CRITICAL_CLICK_MULTIPLIER_INCREMENT;
        criticalClickMultiplier = criticalClickMultiplier.plus(multiplierIncrement);

        // Update sips/s indicator since critical multiplier changed
        updateTopSipsPerSecond();

        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        reload();
        checkUpgradeAffordability();
    }
}

function levelUp() {
    // IMPROVED BALANCE: Better level up rewards and scaling
    const config = window.GAME_CONFIG?.BALANCE || {};
    let levelUpCost = config.LEVEL_UP_BASE_COST * Math.pow(config.LEVEL_UP_SCALING, level.toNumber());
    
    if (window.sips.gte(levelUpCost)) {
        window.sips = window.sips.minus(levelUpCost);
        level = level.plus(1);
        
        // Calculate sips gained from level up (configured multiplier)
        const levelUpMultiplier = config.LEVEL_UP_SIPS_MULTIPLIER;
        const sipsGained = sps.times(levelUpMultiplier);
        
        // Add bonus sips for leveling up
        window.sips = window.sips.plus(sipsGained);
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        // Update displays
        DOM_CACHE.levelNumber.innerHTML = level.toNumber();
        
        // Update top sip counter
        const topSipElement = DOM_CACHE.topSipValue;
        if (topSipElement) {
            topSipElement.innerHTML = prettify(window.sips);
        }
        
        // Show level up feedback
        showLevelUpFeedback(sipsGained);
        
        // Check affordability after level up
        checkUpgradeAffordability();
    }
}

// Function to show level up feedback
function showLevelUpFeedback(sipsGained) {
    const levelUpDiv = DOM_CACHE.levelUpDiv;
    if (!levelUpDiv) return;
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'click-feedback level-up-feedback';
    feedback.textContent = 'LEVEL UP! +' + prettify(sipsGained) + '/d';
    
    // Position above the level up button
    const buttonRect = levelUpDiv.getBoundingClientRect();
    feedback.style.position = 'absolute';
    feedback.style.left = (buttonRect.width / 2) + 'px';
    feedback.style.top = '-20px';
    feedback.style.transform = 'translateX(-50%)';
    
    // Add to level up div
    levelUpDiv.style.position = 'relative';
    levelUpDiv.appendChild(feedback);
    
            // Remove after animation completes
        const config = window.GAME_CONFIG?.TIMING || {};
        const feedbackDuration = config.LEVEL_UP_FEEDBACK_DURATION;
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, feedbackDuration);
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
        DOM_CACHE.levelText.innerHTML = "On a Red Background";
        body.style.backgroundColor = "#AE323B";
    }
}

function save() {
    const currentTime = Date.now();
    
    // Prevent too frequent saves
    if (currentTime - lastSaveOperation < MIN_SAVE_INTERVAL) {
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
        // Offline progress tracking
        lastSaveTime: Date.now()
    };

    try {
        if (window.App && window.App.storage && typeof window.App.storage.saveGame === 'function') {
            window.App.storage.saveGame(save);
        } else {
            localStorage.setItem("save", JSON.stringify(save));
        }
        lastSaveTime = Date.now();
        lastSaveOperation = Date.now();
        updateLastSaveTime();
        console.log('Game saved successfully');
    } catch (error) {
        console.error('Failed to save game:', error);
        // Fallback: try to save with reduced data
        try {
            const minimalSave = { sips: window.sips.toString(), level: level.toString() };
            if (window.App && window.App.storage && typeof window.App.storage.saveGame === 'function') {
                window.App.storage.saveGame(minimalSave);
            } else {
                localStorage.setItem("save", JSON.stringify(minimalSave));
            }
            console.log('Minimal save completed');
        } catch (fallbackError) {
            console.error('Even minimal save failed:', fallbackError);
        }
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
        
        // Reset all game variables to their initial values
        window.sips = new Decimal(0);
        straws = new Decimal(0);
        cups = new Decimal(0);
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
    
        // Update the top sips per drink display
    updateTopSipsPerDrink();
    
    // Update critical click display
    updateCriticalClickDisplay();
    
    drinkProgress = 0;
        lastDrinkTime = Date.now();
        
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
        
        console.log('Game save deleted and all variables reset to initial values');
    }
}


function prettify(input) {
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
            'currentDrinkSpeedCompact': updateDrinkSpeedDisplay(),
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
            console.log('Level up button classes after reload:', levelUpButton.className);
            console.log('Level up button disabled state:', levelUpButton.disabled);
        }
        
        console.log('Reload completed successfully');
        
    } catch (error) {
        console.error('Error in reload function:', error);
    }
}

// Global error handling and resilience
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // Attempt to recover gracefully
    if (e.error && e.error.message.includes('audio')) {
        console.log('Audio error detected, attempting recovery...');
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing splash screen...');
    
    // Eruda debugging for mobile
    if (typeof eruda !== 'undefined') {
        eruda.get('console').log('DOM loaded, initializing splash screen...');
    }
    
    // Load the word bank for the god feature
    loadWordBank().catch(error => {
        console.error('Failed to load word bank:', error);
    });
    
            // Small delay to ensure everything is ready
        const config = window.GAME_CONFIG?.TIMING || {};
        const domReadyDelay = config.DOM_READY_DELAY;
        setTimeout(() => {
            try {
                initSplashScreen();
                loadOptions(); // Load options on page load
                updatePlayTime(); // Start play time tracking
                console.log('Splash screen initialization complete');
                
                if (typeof eruda !== 'undefined') {
                    eruda.get('console').log('Splash screen initialization complete');
                }
            } catch (error) {
                console.error('Error during splash screen initialization:', error);
                // Fallback: try to show game content directly
                const splashScreen = document.getElementById('splashScreen');
                const gameContent = document.getElementById('gameContent');
                if (splashScreen && gameContent) {
                    splashScreen.style.display = 'none';
                    gameContent.style.display = 'block';
                    try {
                        initGame();
                    } catch (gameError) {
                        console.error('Game initialization also failed:', gameError);
                    }
                }
            }
        }, domReadyDelay);
});



// Start game with music - plays title music and sets up main game music
window.startGameWithMusic = function() {
    console.log('startGameWithMusic called');
    
    // Start playing title music immediately
    if (splashAudio) {
        console.log('Starting title music for game start...');
        const playPromise = splashAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Title music started successfully on game start');
            }).catch(error => {
                console.log('Title music failed to start:', error);
            });
        }
    }
    
    // Set a flag to indicate music is enabled
    try {
        if (window.App?.storage?.setBoolean) {
            window.App.storage.setBoolean('musicEnabled', true);
        } else {
            localStorage.setItem('musicEnabled', 'true');
        }
    } catch {}
    
    // Start the game after a brief moment to let title music begin
    const config = window.GAME_CONFIG?.TIMING || {};
    const splashTransitionDelay = config.SPLASH_TRANSITION_DELAY;
    setTimeout(() => {
        startGameCore();
    }, splashTransitionDelay);
};

// Start game without music - mutes all audio
window.startGameWithoutMusic = function() {
    console.log('startGameWithoutMusic called');
    
    // Set flag to indicate music is disabled
    try {
        if (window.App?.storage?.setBoolean) {
            window.App.storage.setBoolean('musicEnabled', false);
        } else {
            localStorage.setItem('musicEnabled', 'false');
        }
    } catch {}
    
    // Start the game immediately
    startGameCore();
};

// Core game start function used by both music options
function startGameCore() {
    console.log('startGameCore called');
    
    // Eruda debugging for mobile
    if (typeof eruda !== 'undefined') {
        eruda.get('console').log('startGameCore called');
    }
    
    // Hide splash and show game
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    
    if (splashScreen && gameContent) {
        console.log('Hiding splash, showing game...');
        if (typeof eruda !== 'undefined') {
            eruda.get('console').log('Hiding splash, showing game...');
        }
        splashScreen.style.display = 'none';
        gameContent.style.display = 'block';
        
            // Music will handle its own transition when title music ends
        
        // Title music will handle its own transition when it ends
        // No need for a fixed timer - the 'ended' event will trigger the switch
        
        // Try to initialize game, but don't let it fail
        try {
            initGame();
        } catch (error) {
            console.error('Game init failed, but showing game anyway:', error);
            if (typeof eruda !== 'undefined') {
                eruda.get('console').error('Game init failed, but showing game anyway:', error);
            }
        }
    } else {
        console.error('Could not find splash or game elements');
        if (typeof eruda !== 'undefined') {
            eruda.get('console').error('Could not find splash or game elements');
        }
    }
}

// Keep the old function for compatibility (just redirect to music version)
window.startGameFromButton = window.startGameWithMusic;

// Function to show purchase feedback
function showPurchaseFeedback(itemName, cost) {
    const shopDiv = DOM_CACHE.shopDiv;
    if (!shopDiv) return;
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'click-feedback purchase-feedback';
    feedback.textContent = 'Bought ' + itemName + ' (-' + prettify(cost) + ')';
    
    // Position at the top of the shop area
    feedback.style.position = 'absolute';
    feedback.style.left = '50%';
    feedback.style.top = '20px';
    feedback.style.transform = 'translateX(-50%)';
    
    // Add to shop div
    shopDiv.style.position = 'relative';
    shopDiv.appendChild(feedback);
    
            // Remove after animation completes
        const config = window.GAME_CONFIG?.TIMING || {};
        const feedbackDuration = config.PURCHASE_FEEDBACK_DURATION;
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, feedbackDuration);
}

        // Divine oracle functionality
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    chatInput.value = '';
    
    // Get divine response immediately
    getGodResponse(message);
}



function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <div class="message-sender">You</div>
            <div class="message-text">${escapeHtml(message)}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}
















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

            // Debug logging
            console.log('Space pressed - Active tab:', activeTab ? activeTab.id : 'none');
            console.log('Soda tab active:', sodaTab && sodaTab.classList.contains('active'));
            console.log('Target element:', e.target.tagName, e.target.id);

            // Only activate space hotkey when on the soda clicking tab
            if (!sodaTab || !sodaTab.classList.contains('active')) {
                console.log('Allowing normal space behavior');
                return; // Allow normal spacebar behavior on other tabs
            }

            console.log('Triggering soda click');
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
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #001789, #0024b3);
        border: 3px solid #00B36B;
        border-radius: 20px;
        padding: 2rem;
        max-width: 400px;
        text-align: center;
        color: #00B36B;
        box-shadow: 0 8px 32px rgba(0, 179, 107, 0.3);
        animation: slideIn 0.4s ease;
    `;

    // Format time
    let timeDisplay = '';
    if (timeSeconds < 60) {
        timeDisplay = `${timeSeconds} seconds`;
    } else if (timeSeconds < 3600) {
        const minutes = Math.floor(timeSeconds / 60);
        const seconds = timeSeconds % 60;
        timeDisplay = `${minutes} minute${minutes > 1 ? 's' : ''}${seconds > 0 ? ` ${seconds} second${seconds > 1 ? 's' : ''}` : ''}`;
    } else {
        const hours = Math.floor(timeSeconds / 3600);
        const minutes = Math.floor((timeSeconds % 3600) / 60);
        timeDisplay = `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }

    // Format earnings
    const earningsDisplay = prettify(earnings);

    modalContent.innerHTML = `
        <h2 style="color: #FF3D02; margin-bottom: 1rem;">Welcome Back!</h2>
        <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">
            You were away for <strong style="color: #FF8E53;">${timeDisplay}</strong>
        </p>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">
            While you were gone, you earned:
            <br/>
            <strong style="color: #00B36B; font-size: 1.5rem;">${earningsDisplay} sips</strong>
        </p>
        <button onclick="this.parentElement.parentElement.remove()"
                style="
                    background: #00B36B;
                    border: 2px solid #008F5A;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                "
                onmouseover="this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'">
            Awesome!
        </button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-50px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
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
    window.sendMessage = sendMessage;

// Splash Screen Music Functions
let splashAudio = null;

function initSplashMusic() {
    console.log('Initializing splash screen music...');
    
    // Create audio element for splash screen title music
    splashAudio = new Audio();
    splashAudio.src = 'res/Soda Drinker Title Music.mp3';
    splashAudio.loop = false; // Don't loop - we want it to play once fully
    const config = window.GAME_CONFIG?.AUDIO || {};
    splashAudio.volume = config.SPLASH_MUSIC_VOLUME;
    
    console.log('Created splashAudio with src:', splashAudio.src);
    
    // Add comprehensive event listeners for debugging
    splashAudio.addEventListener('loadstart', () => {
        console.log('Title music: loadstart event');
    });
    
    splashAudio.addEventListener('loadedmetadata', () => {
        console.log('Title music: loadedmetadata event');
    });
    
    splashAudio.addEventListener('loadeddata', () => {
        console.log('Title music: loadeddata event');
    });
    
    splashAudio.addEventListener('canplay', () => {
        console.log('Title music: canplay event - ready to play');
        // Audio is ready to play
        console.log('Title music ready to play');
    });
    
    splashAudio.addEventListener('canplaythrough', () => {
        console.log('Title music: canplaythrough event');
    });
    
    splashAudio.addEventListener('ended', () => {
        console.log('Title music ended, switching to Between Level Music...');
        // Start the main game music
        startMainGameMusic();
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
        
        console.log('Title music failed to load');
    });
    
    // Force load attempt
    try {
        splashAudio.load();
        console.log('Called splashAudio.load()');
    } catch (error) {
        console.error('Error calling load():', error);
    }
    
    // Don't auto-play - wait for user interaction
}

function playTitleMusic() {
    console.log('playTitleMusic function called');
    
    if (!splashAudio) {
        console.error('splashAudio is null or undefined');
        console.log('Audio not loaded');
        return;
    }
    
    console.log('splashAudio details:', {
        src: splashAudio.src,
        readyState: splashAudio.readyState,
        networkState: splashAudio.networkState,
        paused: splashAudio.paused,
        volume: splashAudio.volume,
        loop: splashAudio.loop
    });
    
    console.log('Attempting to play title music...');
    
    try {
        const playPromise = splashAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Title music started playing successfully');
                console.log('Title music started playing successfully');
            }).catch(error => {
                console.error('Title music play failed:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    code: error.code
                });
                console.log('Title music play failed');
            });
        } else {
            console.log('play() returned undefined (older browser)');
                    // For older browsers that don't return a promise
        console.log('Title music started (older browser)');
        }
    } catch (error) {
        console.error('Exception when calling play():', error);
        console.log('Exception when calling play()');
    }
}

function stopTitleMusic() {
    if (splashAudio) {
        console.log('Stopping title music...');
        splashAudio.pause();
        splashAudio.currentTime = 0;
        
        console.log('Title music stopped');
    }
}

function startMainGameMusic() {
    console.log('Starting main game music...');
    let musicEnabled = 'true';
    try {
        if (window.App?.storage?.getBoolean) {
            musicEnabled = window.App.storage.getBoolean('musicEnabled', true) ? 'true' : 'false';
        } else {
            musicEnabled = localStorage.getItem('musicEnabled');
        }
    } catch {}
    
    if (musicEnabled === 'true' && window.musicPlayerState && window.musicPlayerState.audio) {
        const mainAudio = window.musicPlayerState.audio;
        
        // Start playing the Between Level Music
        const playPromise = mainAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Between Level Music started successfully');
                window.musicPlayerState.isPlaying = true;
                updateMusicPlayerUI();
                updateStreamInfo(); // Ensure stream data displays correctly
            }).catch(error => {
                console.log('Between Level Music failed to start:', error);
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
    console.log('Music enabled setting:', musicEnabled);
    
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
        console.log('Audio error:', e);
        console.log('Failed stream URL:', audio.src);

        const state = window.musicPlayerState;
        if (!state) return;

        // Prevent rapid retries
        const now = Date.now();
        if (state.isRetrying && now - state.lastRetryTime < state.retryDelay) {
            console.log('Retry too soon, ignoring error');
            return;
        }

        state.isRetrying = true;
        state.lastRetryTime = now;

        state.retryCount++;
        console.log(`Music retry attempt ${state.retryCount}/${state.maxRetries}`);

        if (state.retryCount >= state.maxRetries) {
            console.log('Max retries reached, stopping music stream attempts');
            musicStatus.textContent = 'Music unavailable - click to retry';

            // Add click handler to reset retry count
            musicStatus.style.cursor = 'pointer';
            musicStatus.onclick = () => {
                console.log('User clicked to retry music');
                state.retryCount = 0;
                state.isRetrying = false;
                musicStatus.textContent = 'Retrying...';
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

        musicStatus.textContent = `Stream unavailable - trying alternative (${state.retryCount}/${state.maxRetries})...`;

        // Delay the fallback attempt to prevent rapid retries
        setTimeout(() => {
            loadFallbackMusic();
        }, 1000); // 1 second delay
    });
    
    audio.addEventListener('loadstart', () => {
        musicStatus.textContent = 'Loading stream...';
    });
    
    audio.addEventListener('canplay', () => {
        musicStatus.textContent = 'Click to start music';
        // Only update stream info when stream actually changes
        updateStreamInfo();

        // Reset retry count on successful load
        const state = window.musicPlayerState;
        if (state && state.retryCount > 0) {
            console.log('Stream loaded successfully, resetting retry count');
            state.retryCount = 0;
            state.isRetrying = false;
        }
    });
    
    audio.addEventListener('waiting', () => {
        musicStatus.textContent = 'Buffering...';
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
            console.log('Preventing auto-play on mobile');
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
                console.log('Music paused due to page visibility change on mobile');
            }
        } else if (document.hidden) {
            // Page became hidden on desktop - let music continue playing
            console.log('Page became hidden on desktop, music continues playing');
        } else {
            // Page became visible again - prevent auto-resume on mobile
            if (isMobileDevice()) {
                // On mobile, ensure music stays paused when page becomes visible
                if (state.audio.played.length > 0 && !state.isPlaying) {
                    // If audio was previously played and is now paused, keep it paused
                    state.audio.pause();
                    state.isPlaying = false;
                    updateMusicPlayerUI();
                    console.log('Prevented auto-resume on mobile when page became visible');
                }
            } else {
                // On desktop, let music continue as it was
                console.log('Page became visible again on desktop, music state unchanged');
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
                console.log('Music paused due to window blur on mobile');
            }
        } else {
            // Window lost focus on desktop - let music continue playing
            console.log('Window lost focus on desktop, music continues playing');
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
                console.log('Prevented auto-resume on mobile when window regained focus');
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
            musicStatus.textContent = 'Click to start music';
            // Only update stream info once on initialization
            updateStreamInfo();
        }
    }, musicInitDelay);
    
    // Set initial stream info immediately for better UX
    updateStreamInfo();
    
    // Load saved stream preference
    loadSavedStreamPreference();
    
    console.log('Music player initialized');
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
        musicStatus.textContent = statusText;
    } else {
        // Show stream info even when paused
        musicStatus.textContent = 'Click to start music';
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
        musicStatus.textContent = 'Paused';
        updateMusicPlayerUI();
    } else {
        // User explicitly wants to play music
        state.userWantsMusic = true;
        
        // Try to play the audio
        const playPromise = state.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                state.isPlaying = true;
                // Don't update stream info on every play - only when stream changes
                updateMusicPlayerUI();
            }).catch(error => {
                console.log('Auto-play prevented:', error);
                musicStatus.textContent = 'Click to start music';
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
        musicStatus.textContent = 'Muted';
    } else {
        if (state.isPlaying && state.streamInfo) {
            musicStatus.textContent = `${state.streamInfo.name} - ${state.streamInfo.description}`;
        } else {
            musicStatus.textContent = 'Paused';
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
        console.log('Retry limit reached, preventing manual stream change');
        musicStatus.textContent = 'Music unavailable - too many failures';
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
            musicStatus.textContent = 'YouTube stream selected - Click stream info to open';
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
        
        console.log('YouTube stream selected:', streamData.name);
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
            musicStatus.textContent = 'Click to start music';
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
    
    console.log('Music stream changed to:', streamData.name);
}

// Function to load saved stream preference
function loadSavedStreamPreference() {
    const streamSelect = DOM_CACHE.musicStreamSelect;
    const currentStreamInfo = DOM_CACHE.currentStreamInfo;
    
    if (!streamSelect || !currentStreamInfo) {
        console.log('Music stream elements not found, skipping preference load');
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
                console.log('Loaded saved YouTube stream preference:', savedStream);
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
            
            console.log('Loaded saved stream preference:', savedStream);
        } else {
            // Set default to betweenlevel if no valid preference
            streamSelect.value = 'betweenlevel';
            const streamData = MUSIC_STREAMS.betweenlevel;
            currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
            console.log('No valid stream preference found, using default');
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
        console.log('Still in retry cooldown, skipping fallback attempt');
        return;
    }

    if (state.retryCount >= state.maxRetries) {
        console.log('Max retries reached in loadFallbackMusic, stopping all requests');
        musicStatus.textContent = 'Music unavailable - too many failures';

        // Ensure no more requests are made
        state.audio.src = '';
        state.audio.load();
        state.isRetrying = false;
        return;
    }

    state.isRetrying = true;
    state.lastRetryTime = Date.now();

    const randomSource = fallbackSources[Math.floor(Math.random() * fallbackSources.length)];
    console.log(`Trying fallback source (${state.retryCount}/${state.maxRetries}):`, randomSource);
    state.audio.src = randomSource;
    musicStatus.textContent = `Trying alternative source (${state.retryCount}/${state.maxRetries})...`;

    // Don't autostart - just update the stream info and wait for user interaction
    updateStreamInfo();
    musicStatus.textContent = 'Click to start music';
}

// Memory management and cleanup functions
function cleanupAudioResources() {
    if (audioContext) {
        try {
            audioContext.close();
            audioContext = null;
            console.log('Audio context cleaned up');
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
            console.log('Music player audio cleaned up');
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
    
    console.log('Game resources cleaned up');
}

// Call cleanup when page unloads
window.addEventListener('beforeunload', () => {
    cleanupAudioResources();
    cleanupGameResources();
    console.log('Cleanup completed before page unload');
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
window.addUserMessage = addUserMessage;
window.toggleAutosave = toggleAutosave;
window.changeAutosaveInterval = changeAutosaveInterval;
window.initMusicPlayer = initMusicPlayer;
window.toggleMusic = toggleMusic;
window.toggleMute = toggleMute;
window.updateStreamInfo = updateStreamInfo;
window.getStreamDetails = getStreamDetails;
window.playTitleMusic = playTitleMusic;
window.stopTitleMusic = stopTitleMusic;


window.toggleClickSounds = toggleClickSounds;
window.testClickSounds = testClickSounds;
window.playCriticalClickSound = playCriticalClickSound;
window.playPurchaseSound = playPurchaseSound;
window.testPurchaseSound = testPurchaseSound;
window.testCriticalClickSound = testCriticalClickSound;
window.changeMusicStream = changeMusicStream;
window.loadSavedStreamPreference = loadSavedStreamPreference;

// Test function for music stream changer
window.testMusicStreamChanger = function() {
    console.log('=== MUSIC STREAM CHANGER TEST ===');
    console.log('Available streams:', Object.keys(MUSIC_STREAMS));
    console.log('Current music player state:', window.musicPlayerState);
    
    const streamSelect = DOM_CACHE.musicStreamSelect;
    const currentStreamInfo = DOM_CACHE.currentStreamInfo;
    
    if (streamSelect) {
        console.log('Stream select element found:', streamSelect.value);
    } else {
        console.log('Stream select element NOT found');
    }
    
    if (currentStreamInfo) {
        console.log('Current stream info element found:', currentStreamInfo.textContent);
    } else {
        console.log('Current stream info element NOT found');
    }
    
    console.log('Test complete!');
};



// Test function for stream switching
window.testStreamSwitching = function() {
    console.log('=== STREAM SWITCHING TEST ===');

    const streamSelect = DOM_CACHE.musicStreamSelect;
    if (!streamSelect) {
        console.log('Stream select element not found');
        return;
    }

    console.log('Testing stream switching...');

    // Test switching to different stream types
    const testStreams = ['groovesalad', 'defcon', 'dronezone', 'illstreet'];

    testStreams.forEach((streamKey, index) => {
        setTimeout(() => {
            console.log(`Switching to ${streamKey}...`);
            streamSelect.value = streamKey;
            changeMusicStream();
        }, index * 2000); // Switch every 2 seconds
    });

    console.log('Stream switching test complete! Check console for results.');
};



// Function to test click sounds
function testClickSounds() {
    console.log('=== CLICK SOUNDS TEST ===');
    
    if (!audioContext) {
        console.log('Audio context not initialized, creating...');
        initAudioContext();
    }
    
    if (!clickSoundsEnabled) {
        console.log('Click sounds are disabled, enabling...');
        clickSoundsEnabled = true;
    }
    
    console.log('Testing all three sound variations...');
    
    // Test each sound type
    setTimeout(() => playBasicStrawSipSound(), 100);
    setTimeout(() => playAlternativeStrawSipSound(), 300);
    setTimeout(() => playBubbleStrawSipSound(), 500);
    
    console.log('Sound test complete! Check console for any errors.');
}

// Function to test purchase sound
function testPurchaseSound() {
    console.log('=== PURCHASE SOUND TEST ===');
    
    if (!audioContext) {
        console.log('Audio context not initialized, creating...');
        initAudioContext();
    }
    
    if (!clickSoundsEnabled) {
        console.log('Click sounds are disabled, enabling...');
        clickSoundsEnabled = true;
    }
    
    console.log('Testing purchase sound...');
    
    // Test purchase sound
    playPurchaseSound();
    
    console.log('Purchase sound test complete! Check console for any errors.');
}

// Function to test critical click sound
function testCriticalClickSound() {
    console.log('=== CRITICAL CLICK SOUND TEST ===');
    
    if (!audioContext) {
        console.log('Audio context not initialized, creating...');
        initAudioContext();
    }
    
    if (!clickSoundsEnabled) {
        console.log('Click sounds are disabled, enabling...');
        clickSoundsEnabled = true;
    }
    
    console.log('Testing critical click sound...');
    
    // Test critical click sound
    playCriticalClickSound();
    
    console.log('Critical click sound test complete! Check console for any errors.');
}

// Debug function to test audio element
window.testAudio = function() {
    console.log('=== AUDIO DEBUG TEST ===');
    
    if (!window.musicPlayerState || !window.musicPlayerState.audio) {
        console.error('No music player state or audio element found');
        return;
    }
    
    const audio = window.musicPlayerState.audio;
    console.log('Audio element details:', {
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
        paused: audio.paused,
        ended: audio.ended,
        duration: audio.duration,
        currentTime: audio.currentTime,
        volume: audio.volume,
        muted: audio.muted
    });
    
    // Show current stream information
    if (window.musicPlayerState.streamInfo) {
        console.log('Current stream info:', window.musicPlayerState.streamInfo);
    }
    
    // Try to create a simple test audio
    console.log('Creating test audio element...');
    const testAudio = new Audio();
    testAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    testAudio.volume = 0.1;
    
    console.log('Test audio created, attempting to play...');
    const testPromise = testAudio.play();
    if (testPromise !== undefined) {
        testPromise.then(() => {
            console.log('Test audio playing successfully!');
            setTimeout(() => {
                testAudio.pause();
                console.log('Test audio stopped');
            }, 2000);
        }).catch(error => {
            console.error('Test audio failed:', error);
        });
    }
};

// Debug function to show detailed stream information
window.showStreamInfo = function() {
    console.log('=== STREAM INFORMATION ===');
    
    if (!window.musicPlayerState) {
        console.error('No music player state found');
        return;
    }
    
    const state = window.musicPlayerState;
    console.log('Music player state:', {
        isPlaying: state.isPlaying,
        isMuted: state.isMuted,
        currentStream: state.currentStream,
        streamInfo: state.streamInfo
    });
    
    if (state.audio) {
        console.log('Audio details:', {
            src: state.audio.src,
            readyState: state.audio.readyState,
            networkState: state.audio.networkState,
            paused: state.audio.paused,
            volume: state.audio.volume,
            muted: state.audio.muted
        });
    }
    
    // Test stream details function
    if (state.currentStream) {
        console.log('Stream details for current URL:', getStreamDetails(state.currentStream));
    }
};


