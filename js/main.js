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

// ========================================
// UNIFIED BUTTON EVENT HANDLER SYSTEM
// ========================================

// Button configuration for consistent behavior
const BUTTON_CONFIG = {
    // Button types and their configurations
    types: {
        'shop-btn': {
            audio: 'purchase',
            feedback: 'purchase',
            className: 'shop-btn'
        },
        'clicking-upgrade-btn': {
            audio: 'purchase', 
            feedback: 'purchase',
            className: 'clicking-upgrade-btn'
        },
        'drink-speed-upgrade-btn': {
            audio: 'purchase',
            feedback: 'purchase', 
            className: 'drink-speed-upgrade-btn'
        },
        'level-up-btn': {
            audio: 'purchase',
            feedback: 'levelup',
            className: 'level-up-btn'
        },
        'save-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'save-btn'
        },
        'sound-toggle-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'sound-toggle-btn'
        },
        'dev-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'dev-btn'
        },
        'chat-send-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'chat-send-btn'
        },
        'splash-start-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'splash-start-btn'
        }
    },
    
    // Function mappings for button actions
    actions: {
        'buyStraw': { func: buyStraw, type: 'shop-btn' },
        'buyCup': { func: buyCup, type: 'shop-btn' },
        'buyWiderStraws': { func: buyWiderStraws, type: 'shop-btn' },
        'buyBetterCups': { func: buyBetterCups, type: 'shop-btn' },
        'buySuction': { func: buySuction, type: 'clicking-upgrade-btn' },
        'buyCriticalClick': { func: buyCriticalClick, type: 'clicking-upgrade-btn' },
        'buyFasterDrinks': { func: buyFasterDrinks, type: 'drink-speed-upgrade-btn' },
        'upgradeFasterDrinks': { func: upgradeFasterDrinks, type: 'drink-speed-upgrade-btn' },
        'levelUp': { func: levelUp, type: 'level-up-btn' },
        'save': { func: save, type: 'save-btn' },
        'delete_save': { func: delete_save, type: 'save-btn' },
        'toggleButtonSounds': { func: window.App?.systems?.audio?.button?.toggleButtonSounds, type: 'sound-toggle-btn' },
        'sendMessage': { func: window.sendMessage, type: 'chat-send-btn' },
        'startGame': { func: window.App?.systems?.gameInit?.startGame, type: 'splash-start-btn' }
    }
};

// Unified button click handler
function handleButtonClick(event, button, actionName) {
    event.preventDefault();
    event.stopPropagation();
    
    // Get button configuration
    const action = BUTTON_CONFIG.actions[actionName];
    if (!action) {
        console.warn('Unknown button action:', actionName);
        return;
    }
    
    const buttonType = BUTTON_CONFIG.types[action.type];
    if (!buttonType) {
        console.warn('Unknown button type:', action.type);
        return;
    }
    
    // Capture click coordinates for feedback
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    // Play appropriate audio
    try {
        if (window.App?.systems?.audio?.button) {
            if (buttonType.audio === 'purchase') {
                window.App.systems.audio.button.playButtonPurchaseSound();
            } else {
                window.App.systems.audio.button.playButtonClickSound();
            }
        }
    } catch (error) {
        console.warn('Audio playback failed:', error);
    }
    
    // Add click animation using existing CSS classes
    button.classList.add('button-clicked');
    setTimeout(() => {
        button.classList.remove('button-clicked');
    }, 150);
    
    // Execute the action with coordinates
    try {
        if (action.func) {
            action.func(clickX, clickY);
        }
    } catch (error) {
        console.error('Button action failed:', error);
    }
}

// Setup unified button event listeners
function setupUnifiedButtonSystem() {
    console.log('🔧 Setting up unified button event handler system...');
    
    // Remove all onclick attributes and replace with event listeners
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        // Remove onclick attribute
        const onclick = button.getAttribute('onclick');
        if (onclick) {
            button.removeAttribute('onclick');
            
            // Parse onclick to determine action
            const actionMatch = onclick.match(/(\w+)\(/);
            if (actionMatch) {
                const actionName = actionMatch[1];
                const action = BUTTON_CONFIG.actions[actionName];
                
                if (action) {
                    // Add unified event listener
                    button.addEventListener('click', (e) => handleButtonClick(e, button, actionName));
                    
                    // Add appropriate CSS classes for styling
                    if (action.type) {
                        button.classList.add(action.type);
                    }
                    
                    console.log(`🔧 Added unified listener for ${actionName} button`);
                } else {
                    console.warn(`Unknown action: ${actionName}`);
                }
            }
        }
    });
    
    // Special handling for buttons without onclick attributes
    setupSpecialButtonHandlers();
    
    console.log('🔧 Unified button event handler system setup complete');
}

// Setup special button handlers that don't use onclick
function setupSpecialButtonHandlers() {
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = button.textContent.toLowerCase().match(/\b\w+/)?.[0];
            if (tabName) {
                switchTab(tabName, e);
            }
        });
    });
    
    // Soda button (special case - not using onclick)
    const sodaButton = DOM_CACHE.sodaButton;
    if (sodaButton) {
        sodaButton.addEventListener('click', (e) => {
            const clickX = e.clientX;
            const clickY = e.clientY;
            
            // Play audio
            try {
                if (window.App?.systems?.audio?.button) {
                    window.App.systems.audio.button.playButtonClickSound();
                }
            } catch (error) {
                console.warn('Audio playback failed:', error);
            }
            
            // Add click animation using existing CSS classes
            sodaButton.classList.add('soda-clicked');
            setTimeout(() => {
                sodaButton.classList.remove('soda-clicked');
            }, 150);
            
            // Call sodaClick with coordinates
            sodaClick(1, clickX, clickY);
        });
    }
    
    // Chat input keyboard support
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Legacy function for backward compatibility
function setupShopButtonEventListeners() {
    // This is now handled by the unified system
    console.log('🔧 Shop button event listeners now handled by unified system');
}

// Set up event listeners when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupUnifiedButtonSystem);
} else {
    // DOM already loaded
    setupUnifiedButtonSystem();
}

// Check if upgrades are affordable and update UI accordingly
function checkUpgradeAffordability() {
    // IMPROVED BALANCE: Updated costs to match new progression system
    const config = window.GAME_CONFIG?.BALANCE || {};
    const dataUp = window.App?.data?.upgrades || {};
    
    // Use the same data source as the purchase system for consistency
    const strawCost = Math.floor((dataUp.straws?.baseCost ?? config.STRAW_BASE_COST) * Math.pow(dataUp.straws?.scaling ?? config.STRAW_SCALING, straws.toNumber()));
    const cupCost = Math.floor((dataUp.cups?.baseCost ?? config.CUP_BASE_COST) * Math.pow(dataUp.cups?.scaling ?? config.CUP_SCALING, cups.toNumber()));
    const suctionCost = Math.floor(config.SUCTION_BASE_COST * Math.pow(config.SUCTION_SCALING, suctions.toNumber()));
    const fasterDrinksCost = Math.floor((dataUp.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST) * Math.pow(dataUp.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING, fasterDrinks.toNumber()));
    const criticalClickCost = Math.floor((dataUp.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST) * Math.pow(dataUp.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING, criticalClicks.toNumber()));
    const widerStrawsCost = Math.floor((dataUp.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST) * (widerStraws.toNumber() + 1));
    const betterCupsCost = Math.floor((dataUp.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST) * (betterCups.toNumber() + 1));
    const fasterDrinksUpCost = (dataUp.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST) * fasterDrinksUpCounter.toNumber();
    const criticalClickUpCost = (dataUp.criticalClick?.upgradeBaseCost ?? config.CRITICAL_CLICK_UPGRADE_BASE_COST) * criticalClickUpCounter.toNumber();
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
        // Critical click upgrade button doesn't exist, so don't try to update it
        // updateButtonState('upgradeCriticalClick', window.sips.gte(criticalClickUpCost), criticalClickUpCost);
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
        // Critical click upgrade cost display doesn't exist, so don't try to update it
        // updateCostDisplay('criticalClickUpCost', criticalClickUpCost, window.sips.gte(criticalClickUpCost));
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
    
    // First try to find by onclick attribute (for backward compatibility)
    button = document.querySelector(`button[onclick*="${buttonId}"]`);
    
    // If not found, try to find by button text content (for our new event listener setup)
    if (!button) {
        const shopButtons = document.querySelectorAll('.shop-btn');
        shopButtons.forEach(shopButton => {
            const buttonText = shopButton.textContent || '';
            
            if (buttonId === 'buyStraw' && buttonText.includes('Extra Straw')) {
                button = shopButton;
            } else if (buttonId === 'buyCup' && buttonText.includes('Bigger Cup')) {
                button = shopButton;
            } else if (buttonId === 'buyWiderStraws' && buttonText.includes('Wider Straws')) {
                button = shopButton;
            } else if (buttonId === 'buyBetterCups' && buttonText.includes('Better Cups')) {
                button = shopButton;
            }
        });
    }
    
    // If still not found, try to find by the cost span ID pattern
    if (!button) {
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
        console.log(`🔧 Found button for ${buttonId}, updating state. Affordable: ${isAffordable}`);
        if (isAffordable) {
            button.classList.remove('disabled');
            button.classList.add('affordable');
            button.title = `Click to purchase for ${prettify(cost)} Sips`;
        } else {
            button.classList.remove('affordable');
            button.classList.add('disabled');
            button.title = `Costs ${prettify(cost)} Sips (You have ${prettify(window.sips)})`;
        }
    } else {
        console.warn(`🔧 Could not find button for ${buttonId}`);
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
        // Update the cost text
        element.textContent = cost.toLocaleString();
        
        // Update CSS classes for affordability
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
        
        // Update shop button states now that everything is initialized
        updateShopButtonStates();
        
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
                // Get touch coordinates for feedback positioning
                const touch = e.changedTouches[0];
                const clickX = touch.clientX;
                const clickY = touch.clientY;
                // Directly trigger click logic for mobile since default click is prevented
                try { sodaClick(1, clickX, clickY); } catch {}
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
    
    // Update the compact drink speed displays
    updateCompactDrinkSpeedDisplays();
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

// Function to update the compact drink speed displays
function updateCompactDrinkSpeedDisplays() {
    // Update current drink speed display
    const currentDrinkSpeedElement = document.getElementById('currentDrinkSpeedCompact');
    if (currentDrinkSpeedElement) {
        const drinkRateSeconds = getDrinkRateSeconds();
        currentDrinkSpeedElement.textContent = drinkRateSeconds.toFixed(2) + 's';
    }
    
    // Update drink speed bonus display
    const drinkSpeedBonusElement = document.getElementById('drinkSpeedBonusCompact');
    if (drinkSpeedBonusElement) {
        const config = window.GAME_CONFIG?.BALANCE || {};
        const baseDrinkRate = config.DEFAULT_DRINK_RATE || 5000;
        const currentDrinkRate = drinkRate;
        const reduction = ((baseDrinkRate - currentDrinkRate) / baseDrinkRate) * 100;
        drinkSpeedBonusElement.textContent = reduction.toFixed(1) + '%';
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


function sodaClick(number, clickX = null, clickY = null) {
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
    try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.CLICK?.SODA, { gained: totalSipsGained, critical: isCritical, clickX, clickY }); } catch {}
    
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

// Unified purchase handler to fix all shop issues
function handlePurchase(purchaseType, purchaseData, clickX = null, clickY = null) {
    try {
        console.log(`🔧 DEBUG: handlePurchase called for ${purchaseType}`);
        
        const sys = window.App?.systems?.purchases;
        if (!sys) {
            console.error('🔧 Debug: Purchase system not available');
            return false;
        }
        
        // Get the appropriate purchase function
        const purchaseFunction = sys[`purchase${purchaseType}`];
        if (!purchaseFunction) {
            console.error(`🔧 Debug: purchase${purchaseType} function not available`);
            return false;
        }
        
        console.log('🔧 Debug: Purchase data before conversion:', purchaseData);
        
        // Convert all Decimal objects to numbers safely
        const convertedData = {};
        for (const [key, value] of Object.entries(purchaseData)) {
            if (value && typeof value.toNumber === 'function') {
                convertedData[key] = value.toNumber();
            } else {
                convertedData[key] = Number(value) || 0;
            }
        }
        
        console.log('🔧 Debug: Converted purchase data:', convertedData);
        
        // Call the purchase function
        const result = purchaseFunction(convertedData);
        console.log('🔧 Debug: Purchase result:', result);
        
        if (!result) {
            console.error('🔧 Debug: Purchase failed - insufficient funds or invalid data');
            return false;
        }
        
        // Validate and convert all result values
        const validatedResult = {};
        for (const [key, value] of Object.entries(result)) {
            validatedResult[key] = Number(value) || 0;
        }
        
        console.log('🔧 Debug: Validated result:', validatedResult);
        
        // Update game state
        window.sips = window.sips.minus(validatedResult.spent);
        
        // Update the specific resource that was purchased
        if (validatedResult.straws !== undefined) {
            straws = new Decimal(validatedResult.straws);
            window.straws = straws;
        }
        if (validatedResult.cups !== undefined) {
            cups = new Decimal(validatedResult.cups);
            window.cups = cups;
        }
        if (validatedResult.widerStraws !== undefined) {
            widerStraws = new Decimal(validatedResult.widerStraws);
            window.widerStraws = widerStraws;
        }
        if (validatedResult.betterCups !== undefined) {
            betterCups = new Decimal(validatedResult.betterCups);
            window.betterCups = betterCups;
        }
        
        // Update production values
        if (validatedResult.strawSPD !== undefined) {
            strawSPD = new Decimal(validatedResult.strawSPD);
        }
        if (validatedResult.cupSPD !== undefined) {
            cupSPD = new Decimal(validatedResult.cupSPD);
        }
        if (validatedResult.sipsPerDrink !== undefined) {
            sps = new Decimal(validatedResult.sipsPerDrink);
        }
        
        // Update UI displays
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();
        
        // Play sound
        try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
        
        // Show feedback using passed coordinates
        
        const itemNames = {
            'Straw': 'Extra Straw',
            'Cup': 'Bigger Cup',
            'WiderStraws': 'Wider Straws Upgrade',
            'BetterCups': 'Better Cups Upgrade'
        };
        
        showPurchaseFeedback(itemNames[purchaseType], validatedResult.spent, clickX, clickY);
        
        // Update shop UI
        updateShopUI(purchaseType, validatedResult);
        
        // Check affordability for all items
        checkUpgradeAffordability();
        
        console.log(`🔧 Debug: ${purchaseType} purchase completed successfully`);
        return true;
        
    } catch (error) {
        console.error(`🔧 Debug: ${purchaseType} purchase failed with error:`, error);
        console.error('🔧 Debug: Error stack:', error.stack);
        return false;
    }
}

// Unified shop UI updater
function updateShopUI(purchaseType, result) {
    console.log(`🔧 Debug: Updating shop UI for ${purchaseType}`);
    
    switch (purchaseType) {
        case 'Straw':
            updateElement('straws', result.straws);
            updateElement('strawSPD', result.strawSPD);
            updateTotalProduction('totalStrawSPD', result.strawSPD, result.straws);
            break;
            
        case 'Cup':
            updateElement('cups', result.cups);
            updateElement('cupSPD', result.cupSPD);
            updateTotalProduction('totalCupSPD', result.cupSPD, result.cups);
            break;
            
        case 'WiderStraws':
            updateElement('widerStraws', result.widerStraws);
            updateUpgradeMultiplier('widerStrawsSPD', result.strawSPD, 0.6);
            updateTotalProduction('totalWiderStrawsSPD', result.strawSPD, window.straws.toNumber());
            break;
            
        case 'BetterCups':
            updateElement('betterCups', result.betterCups);
            updateUpgradeMultiplier('betterCupsSPD', result.cupSPD, 1.2);
            updateTotalProduction('totalBetterCupsSPD', result.cupSPD, window.cups.toNumber());
            break;
    }
}

// Helper function to update element text content
function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element && value !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            element.textContent = numValue.toString();
            console.log(`🔧 Debug: Updated ${elementId} to ${numValue}`);
        } else {
            console.error(`🔧 Debug: Invalid value for ${elementId}:`, value);
            element.textContent = '0';
        }
    }
}

// Helper function to update total production displays
function updateTotalProduction(elementId, spd, count) {
    const element = document.getElementById(elementId);
    if (element && spd !== undefined && count !== undefined) {
        const total = Number(spd) * Number(count);
        if (!isNaN(total)) {
            element.textContent = total.toString() + ' per drink';
            console.log(`🔧 Debug: Updated ${elementId} to ${total} per drink`);
        } else {
            console.error(`🔧 Debug: Invalid total production for ${elementId}:`, { spd, count });
            element.textContent = '0 per drink';
        }
    }
}

// Helper function to update upgrade multiplier displays
function updateUpgradeMultiplier(elementId, newSPD, baseSPD) {
    const element = document.getElementById(elementId);
    if (element && newSPD !== undefined && baseSPD !== undefined) {
        const multiplier = Number(newSPD) / Number(baseSPD);
        if (!isNaN(multiplier)) {
            element.textContent = multiplier.toFixed(2) + 'x';
            console.log(`🔧 Debug: Updated ${elementId} to ${multiplier.toFixed(2)}x`);
        } else {
            console.error(`🔧 Debug: Invalid multiplier for ${elementId}:`, { newSPD, baseSPD });
            element.textContent = '0x';
        }
    }
}

// Check if the game is ready for purchases
function isGameReady() {
    // Check if App and purchase system exist
    if (!window.App?.systems?.purchases) {
        return false;
    }
    
    // Check if upgrades data is loaded and has actual content
    const dataUp = window.App?.data?.upgrades;
    if (!dataUp || Object.keys(dataUp).length === 0) {
        return false;
    }
    
    // Check if at least one upgrade type has data (indicating JSON was loaded)
    return !!(dataUp.straws || dataUp.cups || dataUp.widerStraws || dataUp.betterCups);
}

// Wait for App to be available with a timeout
function waitForApp(timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (window.App?.systems?.purchases) {
            resolve(window.App);
            return;
        }
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window.App?.systems?.purchases) {
                clearInterval(checkInterval);
                resolve(window.App);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('App initialization timeout'));
            }
        }, 100);
    });
}

// Update shop button states based on game readiness
function updateShopButtonStates() {
    const isReady = isGameReady();
    const shopButtons = document.querySelectorAll('.shop-btn');
    
    shopButtons.forEach(button => {
        if (isReady) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            // Remove loading text if it exists
            const loadingText = button.querySelector('.loading-text');
            if (loadingText) {
                loadingText.remove();
            }
        } else {
            button.disabled = true;
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
            // Add loading text if it doesn't exist
            if (!button.querySelector('.loading-text')) {
                const loadingText = document.createElement('div');
                loadingText.className = 'loading-text';
                loadingText.textContent = 'Loading...';
                loadingText.style.fontSize = '0.8rem';
                loadingText.style.color = '#888';
                button.appendChild(loadingText);
            }
        }
    });
    
    console.log(`🔧 Shop buttons ${isReady ? 'enabled' : 'disabled'} - Game ready: ${isReady}`);
}

// Simplified purchase functions that poll for App to be ready
function buyStraw(clickX = null, clickY = null) {
    console.log('🔧 buyStraw called - checking App availability...');
    console.log('🔧 Debug: window.App exists?', !!window.App);
    console.log('🔧 Debug: window.App.systems exists?', !!window.App?.systems);
    console.log('🔧 Debug: window.App.systems.purchases exists?', !!window.App?.systems?.purchases);
    console.log('🔧 Debug: isGameReady() result:', isGameReady());
    console.log('🔧 Debug: This function is working!');
    
    // Try the new App system first
    if (window.App?.systems?.purchases && isGameReady()) {
        console.log('🔧 Using App system for Straw purchase');
        const result = handlePurchase('Straw', {
            sips: window.sips,
            straws: straws,
            cups: cups,
            widerStraws: widerStraws,
            betterCups: betterCups,
        }, clickX, clickY);
        console.log('🔧 handlePurchase result:', result);
        return result;
    }
    
    // Fallback to legacy system if App is not ready
    console.log('🔧 App not ready, using legacy system for Straw purchase');
    
    // Check if we have enough sips
    const config = window.GAME_CONFIG?.BALANCE || {};
    const strawCost = Math.floor(config.STRAW_BASE_COST * Math.pow(config.STRAW_SCALING, straws.toNumber()));
    
    if (window.sips.lt(strawCost)) {
        console.log('🔧 Not enough sips for straw purchase');
        return false;
    }
    
    // Perform the purchase using legacy logic
    window.sips = window.sips.minus(strawCost);
    straws = straws.plus(1);
    window.straws = straws;
    
    // Update production
    const strawSPD = new Decimal(config.STRAW_BASE_SPD || 0.6);
    const totalStrawSPD = strawSPD.times(straws);
    
    // Update UI
    updateElement('straws', straws);
    updateElement('strawSPD', strawSPD);
    updateTotalProduction('totalStrawSPD', strawSPD, straws);
    
    // Update affordability directly
    try {
        if (window.App?.ui?.checkUpgradeAffordability) {
            window.App.ui.checkUpgradeAffordability();
        } else if (typeof checkUpgradeAffordability === 'function') {
            checkUpgradeAffordability();
        }
    } catch (e) {
        console.log('🔧 checkUpgradeAffordability failed:', e);
    }
    
    // Play sound and show feedback
    try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
    try {
        if (window.App?.ui?.showPurchaseFeedback) {
            window.App.ui.showPurchaseFeedback('Extra Straw', strawCost, clickX, clickY);
        } else if (typeof showPurchaseFeedback === 'function') {
            showPurchaseFeedback('Extra Straw', strawCost, clickX, clickY);
        }
    } catch (e) {
        console.log('🔧 showPurchaseFeedback failed:', e);
    }
    
    console.log('🔧 Legacy straw purchase completed successfully');
    return true;
}

function buyCup(clickX = null, clickY = null) {
    console.log('🔧 buyCup called - checking App availability...');
    console.log('🔧 Debug: window.App exists?', !!window.App);
    console.log('🔧 Debug: window.App.systems exists?', !!window.App?.systems);
    console.log('🔧 Debug: window.App.systems.purchases exists?', !!window.App?.systems?.purchases);
    console.log('🔧 Debug: isGameReady() result:', isGameReady());
    
    // Try the new App system first
    if (window.App?.systems?.purchases && isGameReady()) {
        console.log('🔧 Using App system for Cup purchase');
        const result = handlePurchase('Cup', {
            sips: window.sips,
            straws: straws,
            cups: cups,
            widerStraws: widerStraws,
            betterCups: betterCups,
        }, clickX, clickY);
        console.log('🔧 handlePurchase result:', result);
        return result;
    }
    
    // Fallback to legacy system if App is not ready
    console.log('🔧 App not ready, using legacy system for Cup purchase');
    
    // Check if we have enough sips
    const config = window.GAME_CONFIG?.BALANCE || {};
    const cupCost = Math.floor(config.CUP_BASE_COST * Math.pow(config.CUP_SCALING, cups.toNumber()));
    
    if (window.sips.lt(cupCost)) {
        console.log('🔧 Not enough sips for cup purchase');
        return false;
    }
    
    // Perform the purchase using legacy logic
    window.sips = window.sips.minus(cupCost);
    cups = cups.plus(1);
    window.cups = cups;
    
    // Update production
    const cupSPD = new Decimal(config.CUP_BASE_SPD || 1.2);
    const totalCupSPD = cupSPD.times(cups);
    
    // Update UI
    updateElement('cups', cups);
    updateElement('cupSPD', cupSPD);
    updateTotalProduction('totalCupSPD', cupSPD, cups);
    
    // Update affordability directly
    try {
        if (window.App?.ui?.checkUpgradeAffordability) {
            window.App.ui.checkUpgradeAffordability();
        } else if (typeof checkUpgradeAffordability === 'function') {
            checkUpgradeAffordability();
        }
    } catch (e) {
        console.log('🔧 checkUpgradeAffordability failed:', e);
    }
    
    // Play sound and show feedback
    try { window.App?.systems?.audio?.button?.playButtonPurchaseSound?.(); } catch {}
    try {
        if (window.App?.ui?.showPurchaseFeedback) {
            window.App.ui.showPurchaseFeedback('Bigger Cup', cupCost, clickX, clickY);
        } else if (typeof showPurchaseFeedback === 'function') {
            showPurchaseFeedback('Bigger Cup', cupCost, clickX, clickY);
        }
    } catch (e) {
        console.log('🔧 showPurchaseFeedback failed:', e);
    }
    
    console.log('🔧 Legacy cup purchase completed successfully');
    return true;
}

function buyWiderStraws(clickX = null, clickY = null) {
    console.log('🔧 buyWiderStraws called - checking App availability...');
    
    if (!window.App?.systems?.purchases) {
        console.warn('🔧 App not available yet - purchase will be queued');
        // Queue the purchase to retry after a short delay
        setTimeout(() => {
            console.log('🔧 Retrying buyWiderStraws...');
            buyWiderStraws();
        }, 100);
        return false;
    }
    
    if (!isGameReady()) {
        console.warn('🔧 Game not ready yet - please wait for initialization');
        // Try to trigger the same initialization that sodaClick does
        try {
            checkUpgradeAffordability();
        } catch (e) {
            console.log('🔧 checkUpgradeAffordability failed:', e);
        }
        return false;
    }
    
    console.log('🔧 About to call handlePurchase for WiderStraws');
    const result = handlePurchase('WiderStraws', {
        sips: window.sips,
        straws: straws,
        cups: cups,
        widerStraws: widerStraws,
        betterCups: betterCups,
    }, clickX, clickY);
    console.log('🔧 handlePurchase result:', result);
    return result;
}

function buyBetterCups(clickX = null, clickY = null) {
    console.log('🔧 buyBetterCups called - checking App availability...');
    
    if (!window.App?.systems?.purchases) {
        console.warn('🔧 App not available yet - purchase will be queued');
        // Queue the purchase to retry after a short delay
        setTimeout(() => {
            console.log('🔧 Retrying buyBetterCups...');
            buyBetterCups();
        }, 100);
        return false;
    }
    
    if (!isGameReady()) {
        console.warn('🔧 Game not ready yet - please wait for initialization');
        // Try to trigger the same initialization that sodaClick does
        try {
            checkUpgradeAffordability();
        } catch (e) {
            console.log('🔧 checkUpgradeAffordability failed:', e);
        }
        return false;
    }
    
    console.log('🔧 About to call handlePurchase for BetterCups');
    const result = handlePurchase('BetterCups', {
        sips: window.sips,
        straws: straws,
        cups: cups,
        widerStraws: widerStraws,
        betterCups: betterCups,
    }, clickX, clickY);
    console.log('🔧 handlePurchase result:', result);
    return result;
}

function buySuction(clickX = null, clickY = null) {
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
            showPurchaseFeedback('Improved Suction', res.spent, clickX, clickY);
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

function buyFasterDrinks(clickX = null, clickY = null) {
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
            
            // Get click coordinates from the event if available
            const clickEvent = window.lastClickEvent;
            const clickX = clickEvent?.clientX || null;
            const clickY = clickEvent?.clientY || null;
            
            showPurchaseFeedback('Faster Drinks', res.spent, clickX, clickY);
            checkUpgradeAffordability();
            return;
    }
    }
    
}

function upgradeFasterDrinks(clickX = null, clickY = null) {
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
        
        // Get click coordinates from the event if available
        const clickEvent = window.lastClickEvent;
        const clickX = clickEvent?.clientX || null;
        const clickY = clickEvent?.clientY || null;
        
        showPurchaseFeedback('Critical Click', res.spent, clickX, clickY);
        // reload(); // Removed - causing issues
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
        // reload(); // Removed - causing issues
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
        
        // Reset unlocked features to soda, options, and dev tools (these should always be available)
        FEATURE_UNLOCKS.unlockedFeatures = new Set(['soda', 'options', 'dev']);
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
        let widerStrawsCost = Math.floor(config.WIDER_STRAWS_BASE_COST * (widerStraws.toNumber() + 1));
        let betterCupsCost = Math.floor(config.BETTER_CUPS_BASE_COST * (betterCups.toNumber() + 1));

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



 

// Core game start function
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
function showPurchaseFeedback(itemName, cost, clickX = null, clickY = null) {
    console.log('🔧 main.js showPurchaseFeedback called with:', { itemName, cost, clickX, clickY });
    if (window.App?.ui?.showPurchaseFeedback) { 
        try { 
            return window.App.ui.showPurchaseFeedback(itemName, cost, clickX, clickY); 
        } catch (e) {
            console.error('🔧 Error calling UI system showPurchaseFeedback:', e);
        }
    } else {
        console.warn('🔧 UI system showPurchaseFeedback not available');
    }
}

        // Divine oracle functionality
function sendMessage() { try { return window.sendMessage?.(); } catch {} }



function addUserMessage(message) { try { return window.addUserMessage?.(message); } catch {} }
















// Event listener optimization - consolidate multiple handlers
document.addEventListener('DOMContentLoaded', function() {
    // Initially disable shop buttons until game is ready
    updateShopButtonStates();
    
    // Global click event listener to capture coordinates for purchase feedback
    document.addEventListener('click', function(e) {
        window.lastClickEvent = e;
    });
    
    // Add click event listener to soda button for coordinate capture
    const sodaButton = DOM_CACHE.sodaButton;
    if (sodaButton) {
        sodaButton.addEventListener('click', function(e) {
            const clickX = e.clientX;
            const clickY = e.clientY;
            console.log('🔧 Soda button clicked at:', { clickX, clickY });
            // Call sodaClick with coordinates
            sodaClick(1, clickX, clickY);
        });
    }
    
    // Add event listeners to faster drinks buttons for coordinate capture
    const fasterDrinksButtons = document.querySelectorAll('.drink-speed-upgrade-btn');
    fasterDrinksButtons.forEach(button => {
        button.removeAttribute('onclick'); // Remove onclick to prevent conflicts
        
        button.addEventListener('click', function(e) {
            const clickX = e.clientX;
            const clickY = e.clientY;
            console.log('🔧 Faster drinks button clicked at:', { clickX, clickY });
            
            // Determine which button was clicked and call appropriate function
            const buttonText = button.textContent || '';
            if (buttonText.includes('Upgrade Faster Drinks')) {
                upgradeFasterDrinks(clickX, clickY);
            } else {
                buyFasterDrinks(clickX, clickY);
            }
        });
    });
    
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

// Note: toggleButtonSounds is already defined in js/core/systems/button-audio.js

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
// music globals removed

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

// ============================================================================
// DEV TOOLS FUNCTIONS
// ============================================================================
// Development and testing utilities for debugging and game balance testing

// Helper function to safely get Decimal values
function safeDecimal(value, defaultValue = 0) {
    // If value is already a valid Decimal object, return it
    if (value && typeof value.toNumber === 'function' && typeof value.isZero === 'function') {
        return value;
    }
    
    // Return null if no valid Decimal object - caller should handle this
    return null;
}

// Feature unlock functions
function devUnlockAll() {
    if (!window.FEATURE_UNLOCKS) {
        console.error('🔧 Dev: FEATURE_UNLOCKS system not available');
        alert('Feature unlock system not available. Please refresh the page.');
        return;
    }
    
    if (!confirm('🔓 Unlock ALL features? This will make everything available immediately.')) return;
    
    const allFeatures = [
        'suction', 'criticalClick', 'fasterDrinks', 'straws', 'cups', 
        'widerStraws', 'betterCups', 'levelUp', 'shop', 'stats', 'god', 'unlocks'
    ];
    
    allFeatures.forEach(feature => {
        if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.unlockFeature) {
            window.FEATURE_UNLOCKS.unlockFeature(feature);
        }
    });
    
    // Force refresh UI
    if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.updateFeatureVisibility) {
        window.FEATURE_UNLOCKS.updateFeatureVisibility();
    }
    
    if (typeof showPurchaseFeedback === 'function') {
        showPurchaseFeedback('🔓 All Features Unlocked!', 0);
    }
    console.log('🔧 Dev: All features unlocked');
}

function devUnlockShop() {
    if (!window.FEATURE_UNLOCKS) {
        console.error('🔧 Dev: FEATURE_UNLOCKS system not available');
        alert('Feature unlock system not available. Please refresh the page.');
        return;
    }
    
    if (!confirm('🛒 Unlock shop and all shop items?')) return;
    
    const shopFeatures = ['shop', 'straws', 'cups', 'widerStraws', 'betterCups'];
    
    shopFeatures.forEach(feature => {
        if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.unlockFeature) {
            window.FEATURE_UNLOCKS.unlockFeature(feature);
        }
    });
    
    if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.updateFeatureVisibility) {
        window.FEATURE_UNLOCKS.updateFeatureVisibility();
    }
    
    if (typeof showPurchaseFeedback === 'function') {
        showPurchaseFeedback('🛒 Shop Unlocked!', 0);
    }
    console.log('🔧 Dev: Shop unlocked');
}

function devUnlockUpgrades() {
    if (!window.FEATURE_UNLOCKS) {
        console.error('🔧 Dev: FEATURE_UNLOCKS system not available');
        alert('Feature unlock system not available. Please refresh the page.');
        return;
    }
    
    if (!confirm('⚡ Unlock all upgrade systems?')) return;
    
    const upgradeFeatures = ['suction', 'criticalClick', 'fasterDrinks', 'levelUp'];
    
    upgradeFeatures.forEach(feature => {
        if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.unlockFeature) {
            window.FEATURE_UNLOCKS.unlockFeature(feature);
        }
    });
    
    if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.updateFeatureVisibility) {
        window.FEATURE_UNLOCKS.updateFeatureVisibility();
    }
    
    if (typeof showPurchaseFeedback === 'function') {
        showPurchaseFeedback('⚡ Upgrades Unlocked!', 0);
    }
    console.log('🔧 Dev: Upgrades unlocked');
}

function devResetUnlocks() {
    if (!window.FEATURE_UNLOCKS) {
        console.error('🔧 Dev: FEATURE_UNLOCKS system not available');
        alert('Feature unlock system not available. Please refresh the page.');
        return;
    }
    
    if (!confirm('🔄 Reset all feature unlocks? This will lock everything except basic soda clicking.')) return;
    
    if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.reset) {
        window.FEATURE_UNLOCKS.reset();
    }
    
    if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.updateFeatureVisibility) {
        window.FEATURE_UNLOCKS.updateFeatureVisibility();
    }
    
    if (typeof showPurchaseFeedback === 'function') {
        showPurchaseFeedback('🔄 Unlocks Reset!', 0);
    }
    console.log('🔧 Dev: Unlocks reset');
}

// Time travel functions
function devAddTime(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const days = Math.floor(milliseconds / 86400000);
    const weeks = Math.floor(milliseconds / 604800000);
    const months = Math.floor(milliseconds / 2592000000);
    
    let timeLabel = '';
    if (months > 0) timeLabel = `${months} month${months > 1 ? 's' : ''}`;
    else if (weeks > 0) timeLabel = `${weeks} week${weeks > 1 ? 's' : ''}`;
    else if (days > 0) timeLabel = `${days} day${days > 1 ? 's' : ''}`;
    else if (hours > 0) timeLabel = `${hours} hour${hours > 1 ? 's' : ''}`;
    
    if (!confirm(`⏰ Add ${timeLabel} of offline time? This will simulate being away from the game.`)) return;
    
    // Simulate offline progress
    const offlineTime = milliseconds / 1000; // Convert to seconds
    const offlineSips = calculateOfflineProgress(offlineTime);
    
    console.log(`🔧 Dev: Time travel debug - Time: ${offlineTime}s, SPS: ${window.sps?.toString() || 'undefined'}, Drink Rate: ${window.drinkRate || 'undefined'}, Offline Sips: ${offlineSips}`);
    
    // Safely add sips
    if (window.sips && typeof window.sips.plus === 'function') {
        window.sips = window.sips.plus(offlineSips);
    } else {
        // Fallback if sips is not a valid Decimal object
        console.warn('🔧 Dev: window.sips is not a valid Decimal, creating new one');
        window.sips = new (window.Decimal || Decimal)(offlineSips);
    }
    
    // Update last save time to reflect the time travel
    if (window.lastSaveTime) {
        window.lastSaveTime = Date.now() - milliseconds;
    }
    
    if (typeof showPurchaseFeedback === 'function') {
        showPurchaseFeedback(`⏰ +${offlineSips.toLocaleString()} Sips from ${timeLabel} Time Travel!`, 0);
    }
    console.log(`🔧 Dev: Added ${offlineSips.toLocaleString()} sips from ${timeLabel} time travel`);
    
    // Refresh UI
    updateAllStats();
    
    // Additional UI updates to ensure everything is refreshed
    if (window.App?.ui?.updateTopSipCounter) {
        try { window.App.ui.updateTopSipCounter(); } catch {}
    }
    if (window.App?.ui?.updateTopSipsPerDrink) {
        try { window.App.ui.updateTopSipsPerDrink(); } catch {}
    }
    if (window.App?.ui?.updateTopSipsPerSecond) {
        try { window.App.ui.updateTopSipsPerSecond(); } catch {}
    }
    if (typeof checkUpgradeAffordability === 'function') {
        checkUpgradeAffordability();
    }
    
    console.log(`🔧 Dev: UI refreshed after time travel. New sips total: ${window.sips?.toString() || 'undefined'}`);
}

// Helper function to calculate offline progress
function calculateOfflineProgress(seconds) {
    // Try to get sps value first
    const sps = safeDecimal(window.sps, 0);
    if (sps && !sps.isZero()) {
        const sipsPerSecond = sps.toNumber();
        return Math.floor(sipsPerSecond * seconds);
    }
    
    // Calculate from base game state if sps is not available
    const baseSipsPerDrink = window.GAME_CONFIG?.BALANCE?.BASE_SIPS_PER_DRINK || 1;
    const drinkRate = window.drinkRate || 5000; // Default 5 seconds
    const drinksPerSecond = 1000 / drinkRate;
    
    // Calculate passive production from straws and cups
    let passiveSipsPerDrink = 0;
    if (window.straws && window.straws.gte && window.straws.gte(1)) {
        const strawSPD = window.GAME_CONFIG?.BALANCE?.STRAW_BASE_SPD || 0.1;
        passiveSipsPerDrink += strawSPD * window.straws.toNumber();
    }
    if (window.cups && window.cups.gte && window.cups.gte(1)) {
        const cupSPD = window.GAME_CONFIG?.BALANCE?.CUP_BASE_SPD || 0.2;
        passiveSipsPerDrink += cupSPD * window.cups.toNumber();
    }
    
    const totalSipsPerDrink = baseSipsPerDrink + passiveSipsPerDrink;
    const totalSipsPerSecond = totalSipsPerDrink * drinksPerSecond;
    
    console.log(`🔧 Dev: Calculated offline progress - Base: ${baseSipsPerDrink}, Passive: ${passiveSipsPerDrink}, Total/Drink: ${totalSipsPerDrink}, Total/Second: ${totalSipsPerSecond}`);
    
    return Math.floor(totalSipsPerSecond * seconds);
}

// Resource management functions
function devAddSips(amount) {
    if (!confirm(`🥤 Add ${amount.toLocaleString()} sips to your balance?`)) return;
    
    // Safely get current sips and add the amount
    const currentSips = safeDecimal(window.sips, 0);
    if (!currentSips) {
        console.warn('🔧 Dev: Could not get current sips, setting to default value');
        window.sips = new (window.Decimal || Decimal)(amount);
    } else {
        window.sips = currentSips.plus(amount);
    }
    
    if (typeof showPurchaseFeedback === 'function') {
        showPurchaseFeedback(`🥤 +${amount.toLocaleString()} Sips!`, 0);
    }
    console.log(`🔧 Dev: Added ${amount} sips`);
    
    // Refresh UI
    if (typeof updateAllStats === 'function') {
        updateAllStats();
    }
    if (typeof checkUpgradeAffordability === 'function') {
        checkUpgradeAffordability();
    }
}

// Testing tools
let godMode = false;

function devToggleGodMode() {
    godMode = !godMode;
    
    if (godMode) {
        // Enable god mode - make everything free
        window.originalCosts = {
            straw: strawCost,
            cup: cupCost,
            widerStraws: widerStrawsCost,
            betterCups: betterCupsCost,
            suction: suctionCost,
            fasterDrinks: fasterDrinksCost,
            criticalClick: criticalClickCost,
            levelUp: levelUpCost
        };
        
        // Set all costs to 0
        strawCost = 0;
        cupCost = 0;
        widerStrawsCost = 0;
        betterCupsCost = 0;
        suctionCost = 0;
        fasterDrinksCost = 0;
        criticalClickCost = 0;
        levelUpCost = 0;
        
        if (typeof showPurchaseFeedback === 'function') {
            showPurchaseFeedback('👑 God Mode Enabled!', 0);
        }
        console.log('🔧 Dev: God mode enabled - all purchases are free');
    } else {
        // Disable god mode - restore original costs
        if (window.originalCosts) {
            strawCost = window.originalCosts.straw;
            cupCost = window.originalCosts.cup;
            widerStrawsCost = window.originalCosts.widerStraws;
            betterCupsCost = window.originalCosts.betterCups;
            suctionCost = window.originalCosts.suction;
            fasterDrinksCost = window.originalCosts.fasterDrinks;
            criticalClickCost = window.originalCosts.criticalClick;
            levelUpCost = window.originalCosts.levelUp;
        }
        
        if (typeof showPurchaseFeedback === 'function') {
            showPurchaseFeedback('👑 God Mode Disabled!', 0);
        }
        console.log('🔧 Dev: God mode disabled - normal costs restored');
    }
    
    // Refresh UI
    checkUpgradeAffordability();
}

function devShowDebugInfo() {
    const debugInfo = {
        'Game Version': 'Soda Clicker Pro',
        'Current Sips': window.sips ? (safeDecimal(window.sips, 0)?.toString() || 'invalid') : 'undefined',
        'Total Clicks': window.totalClicks || 0,
        'Sips Per Second': window.sps ? (safeDecimal(window.sps, 0)?.toString() || 'invalid') : 'undefined',
        'Unlocked Features': window.FEATURE_UNLOCKS ? Array.from(window.FEATURE_UNLOCKS.unlockedFeatures) : 'undefined',
        'God Mode': godMode ? 'Enabled' : 'Disabled',
        'Last Save': window.lastSaveTime ? new Date(window.lastSaveTime).toLocaleString() : 'Never',
        'Play Time': window.playTime || 0,
        'Memory Usage': performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A'
    };
    
    console.group('🔧 Debug Information');
    Object.entries(debugInfo).forEach(([key, value]) => {
        console.log(`${key}:`, value);
    });
    console.groupEnd();
    
    // Also show in a simple alert for quick reference
    const debugText = Object.entries(debugInfo)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    
    alert('🔧 Debug Information:\n\n' + debugText);
}

function devExportSave() {
    try {
        const saveData = {
            sips: window.sips ? (safeDecimal(window.sips, 0)?.toString() || '0') : '0',
            straws: window.straws ? (safeDecimal(window.straws, 0)?.toString() || '0') : '0',
            cups: window.cups ? (safeDecimal(window.cups, 0)?.toString() || '0') : '0',
            widerStraws: window.widerStraws ? (safeDecimal(window.widerStraws, 0)?.toString() || '0') : '0',
            betterCups: window.betterCups ? (safeDecimal(window.betterCups, 0)?.toString() || '0') : '0',
            suctions: window.suctions ? (safeDecimal(window.suctions, 0)?.toString() || '0') : '0',
            fasterDrinks: window.fasterDrinks ? (safeDecimal(window.fasterDrinks, 0)?.toString() || '0') : '0',
            criticalClicks: window.criticalClicks ? (safeDecimal(window.criticalClicks, 0)?.toString() || '0') : '0',
            totalClicks: window.totalClicks || 0,
            playTime: window.playTime || 0,
            lastSaveTime: window.lastSaveTime || Date.now(),
            unlockedFeatures: window.FEATURE_UNLOCKS ? Array.from(window.FEATURE_UNLOCKS.unlockedFeatures) : [],
            timestamp: Date.now()
        };
        
        const saveString = JSON.stringify(saveData, null, 2);
        const blob = new Blob([saveString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `soda-clicker-save-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showPurchaseFeedback('💾 Save Exported!', 0);
        console.log('🔧 Dev: Save exported');
    } catch (error) {
        console.error('🔧 Dev: Error exporting save:', error);
        alert('Error exporting save: ' + error.message);
    }
}

function devImportSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const saveData = JSON.parse(e.target.result);
                
                if (!confirm('📥 Import this save data? This will overwrite your current progress!')) return;
                
                // Import the save data
                if (saveData.sips) window.sips = new (window.Decimal || Decimal)(saveData.sips);
                if (saveData.straws) window.straws = new (window.Decimal || Decimal)(saveData.straws);
                if (saveData.cups) window.cups = new (window.Decimal || Decimal)(saveData.cups);
                if (saveData.widerStraws) window.widerStraws = new (window.Decimal || Decimal)(saveData.widerStraws);
                if (saveData.betterCups) window.betterCups = new (window.Decimal || Decimal)(saveData.betterCups);
                if (saveData.suctions) window.suctions = new (window.Decimal || Decimal)(saveData.suctions);
                if (saveData.fasterDrinks) window.fasterDrinks = new (window.Decimal || Decimal)(saveData.fasterDrinks);
                if (saveData.criticalClicks) window.criticalClicks = new (window.Decimal || Decimal)(saveData.criticalClicks);
                if (saveData.totalClicks) window.totalClicks = saveData.totalClicks;
                if (saveData.playTime) window.playTime = saveData.playTime;
                if (saveData.lastSaveTime) window.lastSaveTime = saveData.lastSaveTime;
                
                // Import unlocked features
                if (saveData.unlockedFeatures && window.FEATURE_UNLOCKS) {
                    window.FEATURE_UNLOCKS.unlockedFeatures = new Set(saveData.unlockedFeatures);
                    window.FEATURE_UNLOCKS.saveUnlockedFeatures();
                    window.FEATURE_UNLOCKS.updateFeatureVisibility();
                }
                
                showPurchaseFeedback('📥 Save Imported!', 0);
                console.log('🔧 Dev: Save imported');
                
                // Refresh UI
                updateAllStats();
                checkUpgradeAffordability();
                
            } catch (error) {
                console.error('🔧 Dev: Error importing save:', error);
                alert('Error importing save: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ============================================================================
// END DEV TOOLS FUNCTIONS
// ============================================================================

    window.save = save;

// Dev tools functions
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
window.updateDevModeStatus = updateDevModeStatus;

// Quick unlock function for console access
function quickUnlock() {
    console.log('🔧 Quick unlock activated - unlocking all features...');
    devUnlockAll();
}

// Make quick unlock available globally for console access
window.quickUnlock = quickUnlock;
window.q = quickUnlock; // Short alias

function devToggleDevMode() {
    if (window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.toggleDevMode) {
        const isEnabled = window.FEATURE_UNLOCKS.toggleDevMode();
        
        if (isEnabled) {
            if (typeof showPurchaseFeedback === 'function') {
                showPurchaseFeedback('🔧 Dev Mode Enabled!', 0);
            }
            console.log('🔧 Dev: Dev mode enabled - all features unlocked');
        } else {
            if (typeof showPurchaseFeedback === 'function') {
                showPurchaseFeedback('🔧 Dev Mode Disabled!', 0);
            }
            console.log('🔧 Dev: Dev mode disabled - normal unlock conditions restored');
        }
        
        // Update status display
        updateDevModeStatus();
        
        // Refresh UI
        if (window.FEATURE_UNLOCKS.updateFeatureVisibility) {
            window.FEATURE_UNLOCKS.updateFeatureVisibility();
        }
    } else {
        console.error('🔧 Dev: FEATURE_UNLOCKS system not available');
        alert('Feature unlock system not available');
    }
}

// Update dev mode status display
function updateDevModeStatus() {
    const statusElement = document.getElementById('devModeStatus');
    if (statusElement) {
        const isDevMode = window.FEATURE_UNLOCKS && window.FEATURE_UNLOCKS.isDevMode ? 
            window.FEATURE_UNLOCKS.isDevMode() : false;
        
        statusElement.textContent = isDevMode ? 'Enabled' : 'Disabled';
        statusElement.className = `dev-status-value ${isDevMode ? 'enabled' : ''}`;
    }
}

// Initialize dev mode status display
setTimeout(() => {
    if (window.updateDevModeStatus) {
        window.updateDevModeStatus();
    }
    
    // Show available dev commands in console
    console.log('🔧 Dev Tools Available:');
    console.log('  - quickUnlock() or q() - Unlock all features');
    console.log('  - devToggleDevMode() - Toggle dev mode (always unlocked)');
    console.log('  - devToggleGodMode() - Toggle god mode (free purchases)');
    console.log('  - devAddSips(amount) - Add sips');
    console.log('  - devAddTime(ms) - Add offline time');
    console.log('  - devShowDebugInfo() - Show debug information');
    console.log('  - testDevTools() - Test dev tools functionality');
}, 1000); // Small delay to ensure FEATURE_UNLOCKS is loaded

// Test function for dev tools
window.testDevTools = function() {
    console.log('🔧 Testing Dev Tools...');
    
    // Test if dev tab exists
    const devTab = document.getElementById('devTab');
    if (devTab) {
        console.log('✅ Dev tab found');
    } else {
        console.error('❌ Dev tab not found');
    }
    
    // Test if dev functions are available
    const functions = ['devUnlockAll', 'devToggleDevMode', 'devToggleGodMode', 'quickUnlock'];
    functions.forEach(func => {
        if (window[func]) {
            console.log(`✅ ${func} function available`);
        } else {
            console.error(`❌ ${func} function not available`);
        }
    });
    
    // Test if purchase functions are available
    console.log('🔧 Testing purchase functions...');
    if (typeof window.buyStraw === 'function') {
        console.log('✅ buyStraw function available');
    } else {
        console.error('❌ buyStraw function not available');
    }
    
    if (typeof window.buyCup === 'function') {
        console.log('✅ buyCup function available');
    } else {
        console.error('❌ buyCup function not available');
    }
    
    // Test tab switching
    try {
        switchTab('dev', new Event('click'));
        console.log('✅ Dev tab switching works');
    } catch (error) {
        console.error('❌ Dev tab switching failed:', error);
    }
    
    console.log('🔧 Dev tools test complete');
};

// Update shop displays after purchases
function updateShopDisplays() {
    // This function was causing issues - removed
    // Will add proper UI updates to each purchase function instead
}

// Make switchTab globally available for HTML onclick attributes