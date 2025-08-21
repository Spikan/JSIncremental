// Soda Clicker Pro - Main Game Logic
// 
// TEMPLEOS GOD FEATURE SETUP:
// Divine oracle feature - draws wisdom from sacred texts
// No external API keys needed for the divine guidance system
// (But if you know, you know... this runs on 64-bit spiritual processing power)


import { templePhrases, totalPhrases } from './phrases.js';

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
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                if (fps < 30) {
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

// DOM Element Cache - Imported from dom-cache.js
// Ensures DOM_CACHE is available before proceeding
if (typeof DOM_CACHE === 'undefined') {
    console.error('DOM_CACHE not loaded. Please ensure dom-cache.js is loaded before main.js');
}

let sips = new Decimal(0);
let straws = new Decimal(0);
let cups = new Decimal(0);
let suctions = new Decimal(0);
let sps = new Decimal(0);
let strawSPS = new Decimal(0);
let cupSPS = new Decimal(0);
let suctionClickBonus = new Decimal(0);
let widerStraws = new Decimal(0);
let betterCups = new Decimal(0);
let widerStrawsSPS = new Decimal(0);
let betterCupsSPS = new Decimal(0);
let level = new Decimal(1);

// Drink system variables
const DEFAULT_DRINK_RATE = 5000; // 5 seconds in milliseconds
let drinkRate = DEFAULT_DRINK_RATE;
let drinkProgress = 0;
let lastDrinkTime = Date.now();

// Faster Drinks upgrade variables
let fasterDrinks = new Decimal(0);
let fasterDrinksUpCounter = new Decimal(1);

// Critical Click system variables - IMPROVED BALANCE
let criticalClickChance = new Decimal(0.001); // 0.1% base chance (10x higher)
let criticalClickMultiplier = new Decimal(5); // 5x multiplier (more balanced)
let criticalClicks = new Decimal(0); // Total critical clicks achieved
let criticalClickUpCounter = new Decimal(1); // Upgrade counter for critical chance

// Suction upgrade system variables
let suctionUpCounter = new Decimal(1); // Upgrade counter for suction upgrades

// Sound system variables
let clickSoundsEnabled = true;

// Auto-save and options variables
let autosaveEnabled = true;
let autosaveInterval = 10; // seconds
let autosaveCounter = 0;
let gameStartTime = Date.now();
let lastSaveTime = null;

// Save optimization - batch save operations
let saveQueue = [];
let saveTimeout = null;
let lastSaveOperation = 0;
const MIN_SAVE_INTERVAL = 1000; // Minimum 1 second between saves

// Statistics tracking variables
let totalClicks = 0;
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
    
    // Multiple event listeners for maximum compatibility
    splashScreen.addEventListener('click', function(e) {
        console.log('Splash screen clicked!');
        if (typeof eruda !== 'undefined') {
            eruda.get('console').log('Splash screen clicked!');
        }
        e.preventDefault();
        e.stopPropagation();
        startGame();
    }, true);
    
    splashScreen.addEventListener('touchstart', function(e) {
        console.log('Splash screen touched!');
        if (typeof eruda !== 'undefined') {
            eruda.get('console').log('Splash screen touched!');
        }
        e.preventDefault();
        e.stopPropagation();
        startGame();
    }, true);
    
    // Also allow keyboard input to start
    document.addEventListener('keydown', function(event) {
        if (splashScreen.style.display !== 'none') {
            console.log('Keyboard input detected, starting game...');
            if (typeof eruda !== 'undefined') {
                eruda.get('console').log('Keyboard input detected, starting game...');
            }
            startGame();
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
}

// Make switchTab globally available for HTML onclick attributes
window.switchTab = switchTab;

// Check if upgrades are affordable and update UI accordingly
function checkUpgradeAffordability() {
    // IMPROVED BALANCE: Updated costs to match new progression system
    const strawCost = Math.floor(5 * Math.pow(1.08, straws.toNumber()));
    const cupCost = Math.floor(15 * Math.pow(1.15, cups.toNumber()));
    const suctionCost = Math.floor(40 * Math.pow(1.10, suctions.toNumber()));
    const fasterDrinksCost = Math.floor(80 * Math.pow(1.10, fasterDrinks.toNumber()));
    const criticalClickCost = Math.floor(60 * Math.pow(1.10, criticalClicks.toNumber()));
    const widerStrawsCost = Math.floor(150 * Math.pow(1.12, widerStraws.toNumber()));
    const betterCupsCost = Math.floor(400 * Math.pow(1.12, betterCups.toNumber()));
    const fasterDrinksUpCost = 1500 * fasterDrinksUpCounter.toNumber();
    const criticalClickUpCost = 1200 * criticalClickUpCounter.toNumber();
    const levelUpCost = 3000 * Math.pow(1.15, level.toNumber());
    

    

    
    // Update button states based on affordability
    updateButtonState('buyStraw', sips.gte(strawCost), strawCost);
    updateButtonState('buyCup', sips.gte(cupCost), cupCost);
    updateButtonState('buySuction', sips.gte(suctionCost), suctionCost);
    updateButtonState('buyFasterDrinks', sips.gte(fasterDrinksCost), fasterDrinksCost);
    updateButtonState('buyCriticalClick', sips.gte(criticalClickCost), criticalClickCost);
    updateButtonState('buyWiderStraws', sips.gte(widerStrawsCost), widerStrawsCost);
    updateButtonState('buyBetterCups', sips.gte(betterCupsCost), betterCupsCost);
    updateButtonState('upgradeFasterDrinks', sips.gte(fasterDrinksUpCost), fasterDrinksUpCost);
    updateButtonState('upgradeCriticalClick', sips.gte(criticalClickUpCost), criticalClickUpCost);
    updateButtonState('levelUp', sips.gte(levelUpCost), levelUpCost);
    
    // Update cost displays with affordability indicators
    updateCostDisplay('strawCost', strawCost, sips.gte(strawCost));
    updateCostDisplay('cupCost', cupCost, sips.gte(cupCost));
    updateCostDisplay('suctionCost', suctionCost, sips.gte(suctionCost));
    updateCostDisplay('fasterDrinksCost', fasterDrinksCost, sips.gte(fasterDrinksCost));
    updateCostDisplay('criticalClickCost', criticalClickCost, sips.gte(criticalClickCost));
    updateCostDisplay('widerStrawsCost', widerStrawsCost, sips.gte(widerStrawsCost));
    updateCostDisplay('betterCupsCost', betterCupsCost, sips.gte(betterCupsCost));
    updateCostDisplay('fasterDrinksUpCost', fasterDrinksUpCost, sips.gte(fasterDrinksUpCost));
    updateCostDisplay('criticalClickUpCost', criticalClickUpCost, sips.gte(criticalClickUpCost));
    updateCostDisplay('levelCost', levelUpCost, sips.gte(levelUpCost));
    
    // Update compact clicking upgrade displays
    updateCostDisplay('suctionCostCompact', suctionCost, sips.gte(suctionCost));
    updateCostDisplay('criticalClickCostCompact', criticalClickCost, sips.gte(criticalClickCost));
    // Update compact drink speed upgrade displays
    updateCostDisplay('fasterDrinksCostCompact', fasterDrinksCost, sips.gte(fasterDrinksCost));
    updateCostDisplay('fasterDrinksUpCostCompact', fasterDrinksUpCost, sips.gte(fasterDrinksUpCost));
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
            button.title = `Costs ${prettify(cost)} Sips (You have ${prettify(sips)})`;
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
    console.log('initGame called');
    
    try {
        // Initialize DOM cache first
        DOM_CACHE.init();
        
        // Initialize feature detection and enable advanced features
        FEATURE_DETECTION.init();
        FEATURE_DETECTION.enableAdvancedFeatures();
        
        // Load saved game data
        let savegame = JSON.parse(localStorage.getItem("save"));
        
        if (savegame && typeof savegame.sips !== "undefined" && savegame.sips !== null) {
            sips = new Decimal(savegame.sips);
            straws = new Decimal(savegame.straws || 0);
            cups = new Decimal(savegame.cups || 0);
            suctions = new Decimal(savegame.suctions || 0);
            fasterDrinks = new Decimal(savegame.fasterDrinks || 0);
            sps = new Decimal(savegame.sps || 0);
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
        
        strawSPS = new Decimal(0.6);
        cupSPS = new Decimal(1.2);
        widerStrawsSPS = new Decimal(0.6);
        betterCupsSPS = new Decimal(1.2);
        suctionClickBonus = new Decimal(0.3).times(suctions);
        
            // Initialize drink rate based on upgrades
    updateDrinkRate();
    
    // Update the top sips per drink display
    updateTopSipsPerDrink();
        
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
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    const statsInterval = 1000; // Update stats every second
    
    function gameLoop(currentTime) {
        // Update drink progress and game logic at 60 FPS
        if (currentTime - lastUpdate >= frameInterval) {
            updateDrinkProgress();
            processDrink();
            // Check affordability more frequently for better responsiveness
            if (currentTime - lastUpdate >= 200) { // Check every 200ms
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
            progressFill.classList.remove('nearly-complete', 'complete');
            if (drinkProgress >= 100) {
                progressFill.classList.add('complete');
            } else if (drinkProgress >= 75) {
                progressFill.classList.add('nearly-complete');
            }
        });
    }
}

function processDrink() {
    const currentTime = Date.now();
    if (currentTime - lastDrinkTime >= drinkRate) {
        // Process the drink
        spsClick(sps);
        lastDrinkTime = currentTime;
        drinkProgress = 0;
        
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
    // Each faster drink reduces time by 1%
    // Each upgrade increases the effectiveness
    let totalReduction = fasterDrinks.times(fasterDrinksUpCounter).times(0.01);
    let newDrinkRate = DEFAULT_DRINK_RATE * (1 - totalReduction.toNumber());
    
    // Ensure drink rate doesn't go below 0.5 seconds
    newDrinkRate = Math.max(500, newDrinkRate);
    
    setDrinkRate(newDrinkRate);
    
    // Update the top sips per drink display
    updateTopSipsPerDrink();
}

// Function to get current drink rate in seconds
function getDrinkRateSeconds() {
    return drinkRate / 1000;
}

// Function to update the top sips per drink display
function updateTopSipsPerDrink() {
    const topSipsPerDrinkElement = DOM_CACHE.topSipsPerDrink;
    if (topSipsPerDrinkElement) {
        // Base sips per drink is 1, but this could be modified by future upgrades
        const baseSipsPerDrink = 1;
        topSipsPerDrinkElement.textContent = baseSipsPerDrink;
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
    localStorage.setItem('gameOptions', JSON.stringify(options));
}

function loadOptions() {
    const savedOptions = localStorage.getItem('gameOptions');
    if (savedOptions) {
        const options = JSON.parse(savedOptions);
        autosaveEnabled = options.autosaveEnabled !== undefined ? options.autosaveEnabled : true;
        autosaveInterval = options.autosaveInterval || 10;
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
        totalClicksElement.textContent = prettify(totalClicks);
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
        const currentSPS = strawSPS.times(straws).plus(cupSPS.times(cups)).plus(widerStrawsSPS.times(widerStraws)).plus(betterCupsSPS.times(betterCups));
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
    totalClicks++;
    const now = Date.now();
    
    // Track click streak
    if (now - lastClickTime < 1000) { // Within 1 second
        currentClickStreak++;
        if (currentClickStreak > bestClickStreak) {
            bestClickStreak = currentClickStreak;
        }
    } else {
        currentClickStreak = 1;
    }
    
    lastClickTime = now;
    clickTimes.push(now);
    
    // Keep only last 100 clicks for performance
    if (clickTimes.length > 100) {
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
        const baseFreq = 200 + Math.random() * 100; // 200-300 Hz base frequency
        const duration = 0.1 + Math.random() * 0.1; // 0.1-0.2 seconds
        const volume = 0.3 + Math.random() * 0.2; // 0.3-0.5 volume
        
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
        const baseFreq1 = 150 + Math.random() * 80; // 150-230 Hz
        const baseFreq2 = 300 + Math.random() * 120; // 300-420 Hz
        const duration = 0.08 + Math.random() * 0.12; // 0.08-0.2 seconds
        const volume = 0.25 + Math.random() * 0.15; // 0.25-0.4 volume
        
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
        const baseFreq1 = 180 + Math.random() * 60; // 180-240 Hz
        const baseFreq2 = 350 + Math.random() * 100; // 350-450 Hz
        const baseFreq3 = 500 + Math.random() * 150; // 500-650 Hz
        const duration = 0.12 + Math.random() * 0.08; // 0.12-0.2 seconds
        const volume = 0.2 + Math.random() * 0.15; // 0.2-0.35 volume
        
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
        const baseFreq1 = 400 + Math.random() * 200; // 400-600 Hz - higher pitch
        const baseFreq2 = 800 + Math.random() * 300; // 800-1100 Hz - even higher
        const baseFreq3 = 1200 + Math.random() * 400; // 1200-1600 Hz - highest
        const duration = 0.3 + Math.random() * 0.2; // 0.3-0.5 seconds - longer
        const volume = 0.4 + Math.random() * 0.2; // 0.4-0.6 volume - louder
        
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
        const baseFreq1 = 80 + Math.random() * 40; // 80-120 Hz - very low, deep
        const baseFreq2 = 160 + Math.random() * 60; // 160-220 Hz - low
        const duration = 0.4 + Math.random() * 0.2; // 0.4-0.6 seconds - longer for satisfaction
        const volume = 0.35 + Math.random() * 0.15; // 0.35-0.5 volume
        
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
    localStorage.setItem('clickSoundsEnabled', clickSoundsEnabled.toString());
    
    // Update UI if there's a toggle button
    const toggleButton = document.getElementById('clickSoundsToggle');
    if (toggleButton) {
        toggleButton.textContent = clickSoundsEnabled ? '🔊 Click Sounds ON' : '🔇 Click Sounds OFF';
        toggleButton.classList.toggle('sounds-off', !clickSoundsEnabled);
    }
    
    console.log('Click sounds:', clickSoundsEnabled ? 'enabled' : 'disabled');
}

// Load click sounds preference from localStorage
function loadClickSoundsPreference() {
    const saved = localStorage.getItem('clickSoundsEnabled');
    if (saved !== null) {
        clickSoundsEnabled = saved === 'true';
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
        let totalReduction = fasterDrinks.times(fasterDrinksUpCounter).times(0.01);
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
    sips = sips.plus(totalSipsGained);
    
    // Batch DOM updates to reduce layout thrashing
    requestAnimationFrame(() => {

        
        // Update top sip counter
        const topSipElement = DOM_CACHE.topSipValue;
        if (topSipElement) {
            topSipElement.innerHTML = prettify(sips);
        }
        
        // Show click feedback
        showClickFeedback(totalSipsGained, isCritical);
        
        // Visual feedback with smoother image transition
        const sodaButton = DOM_CACHE.sodaButton;
        if (sodaButton) {
            // Add a CSS class for the click effect instead of changing src
            sodaButton.classList.add('soda-clicked');
            
            // Remove the class after animation completes
            setTimeout(() => {
                sodaButton.classList.remove('soda-clicked');
            }, 150);
        }
    });
    
    // Check if level up is possible
    checkLevelUp();
    
    // Update upgrade affordability
    checkUpgradeAffordability();
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
    const randomX = (Math.random() - 0.5) * 80; // -40px to +40px (reduced range)
    const randomY = (Math.random() - 0.5) * 40;  // -20px to +20px (reduced range)
    
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
        }, isCritical ? 2000 : 1000); // Critical feedback stays longer
    });
}

function spsClick(amount) {
    sips = sips.plus(amount);
    
    // Track passive income in total sips earned
    totalSipsEarned = totalSipsEarned.plus(amount);
    
    // Update highest SPS if current is higher
    const currentSPS = strawSPS.times(straws).plus(cupSPS.times(cups)).plus(widerStrawsSPS.times(widerStraws)).plus(betterCupsSPS.times(betterCups));
    if (currentSPS.gt(highestSipsPerSecond)) {
        highestSipsPerSecond = currentSPS;
    }
    
    // Update top sip counter
    const topSipElement = DOM_CACHE.topSipValue;
    if (topSipElement) {
        topSipElement.innerHTML = prettify(sips);
    }
    
    // Update critical click display
    updateCriticalClickDisplay();
}

function buyStraw() {
    // IMPROVED BALANCE: Better early game progression
    let strawCost = Math.floor(5 * Math.pow(1.08, straws.toNumber())); // Reduced from 10, gentler scaling
    if (sips.gte(strawCost)) {
        straws = straws.plus(1);
        sips = sips.minus(strawCost);
        strawSPS = new Decimal(0.6); // Base value, no upgrade multiplier
        sps = strawSPS.times(straws).plus(cupSPS.times(cups)).plus(widerStrawsSPS.times(widerStraws)).plus(betterCupsSPS.times(betterCups));
        
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
    let cupCost = Math.floor(15 * Math.pow(1.15, cups.toNumber())); // Reduced from 20, gentler scaling
    if (sips.gte(cupCost)) {
        cups = cups.plus(1);
        sips = sips.minus(cupCost);
        cupSPS = new Decimal(1.2); // Base value, no upgrade multiplier
        sps = strawSPS.times(straws).plus(cupSPS.times(cups)).plus(widerStrawsSPS.times(widerStraws)).plus(betterCupsSPS.times(betterCups));
        
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
    // IMPROVED BALANCE: Separate upgrade item
    let widerStrawsCost = Math.floor(150 * Math.pow(1.12, widerStraws.toNumber())); // Balanced scaling
    if (sips.gte(widerStrawsCost)) {
        widerStraws = widerStraws.plus(1);
        sips = sips.minus(widerStrawsCost);
        widerStrawsSPS = new Decimal(0.6); // Base value per wider straw
        sps = strawSPS.times(straws).plus(cupSPS.times(cups)).plus(widerStrawsSPS.times(widerStraws)).plus(betterCupsSPS.times(betterCups));
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        // Show purchase feedback
        showPurchaseFeedback('Wider Straws', widerStrawsCost);
        
        reload();
        checkUpgradeAffordability();
    }
}

function buyBetterCups() {
    // IMPROVED BALANCE: Separate upgrade item
    let betterCupsCost = Math.floor(400 * Math.pow(1.12, betterCups.toNumber())); // Balanced scaling
    if (sips.gte(betterCupsCost)) {
        betterCups = betterCups.plus(1);
        sips = sips.minus(betterCupsCost);
        betterCupsSPS = new Decimal(1.2); // Base value per better cup
        sps = strawSPS.times(straws).plus(cupSPS.times(cups)).plus(widerStrawsSPS.times(widerStraws)).plus(betterCupsSPS.times(betterCups));
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        // Show purchase feedback
        showPurchaseFeedback('Better Cups', betterCupsCost);
        
        reload();
        checkUpgradeAffordability();
    }
}



function buySuction() {
    // IMPROVED BALANCE: Better click bonus progression
    let suctionCost = Math.floor(40 * Math.pow(1.10, suctions.toNumber())); // Reduced from 50, gentler scaling
    
    if (sips.gte(suctionCost)) {
        suctions = suctions.plus(1);
        sips = sips.minus(suctionCost);
        suctionClickBonus = new Decimal(0.3).times(suctions); // Increased from 0.2 for better value
        
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
    let suctionUpCost = 800 * suctionUpCounter.toNumber(); // Reduced from 1000
    
    if (sips.gte(suctionUpCost)) {
        sips = sips.minus(suctionUpCost);
        suctionUpCounter = suctionUpCounter.plus(1);
        suctionClickBonus = new Decimal(0.3).times(suctionUpCounter); // Increased base value
        
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
    let fasterDrinksCost = Math.floor(80 * Math.pow(1.10, fasterDrinks.toNumber())); // Reduced from 100, gentler scaling
    if (sips.gte(fasterDrinksCost)) {
        fasterDrinks = fasterDrinks.plus(1);
        sips = sips.minus(fasterDrinksCost);
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
    let fasterDrinksUpCost = 1500 * fasterDrinksUpCounter.toNumber(); // Reduced from 2000
    if (sips.gte(fasterDrinksUpCost)) {
        sips = sips.minus(fasterDrinksUpCost);
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
    let criticalClickCost = Math.floor(60 * Math.pow(1.10, criticalClicks.toNumber())); // Reduced from 75, gentler scaling
    if (sips.gte(criticalClickCost)) {
        criticalClicks = criticalClicks.plus(1);
        sips = sips.minus(criticalClickCost);
        
        // Increase critical click chance by 0.01% (0.0001) per purchase - doubled from 0.005%
        criticalClickChance = criticalClickChance.plus(0.0001);
        
        // Update critical click display
        updateCriticalClickDisplay();
        
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
    let criticalClickUpCost = 1200 * criticalClickUpCounter.toNumber(); // Reduced from 1500
    if (sips.gte(criticalClickUpCost)) {
        sips = sips.minus(criticalClickUpCost);
        criticalClickUpCounter = criticalClickUpCounter.plus(1);
        
        // Increase critical click multiplier by 2x per upgrade
        criticalClickMultiplier = criticalClickMultiplier.plus(2);
        
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
    let levelUpCost = 3000 * Math.pow(1.15, level.toNumber()); // Reduced base cost, better scaling
    if (sips.gte(levelUpCost)) {
        sips = sips.minus(levelUpCost);
        level = level.plus(1);
        
        // Calculate sips gained from level up (150% increase instead of 100%)
        const sipsGained = sps.times(1.5);
        
        // Add bonus sips for leveling up
        sips = sips.plus(sipsGained);
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        // Update displays
        DOM_CACHE.levelNumber.innerHTML = level.toNumber();
        
        // Update top sip counter
        const topSipElement = DOM_CACHE.topSipValue;
        if (topSipElement) {
            topSipElement.innerHTML = prettify(sips);
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
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 800);
}

// Function to check if level up is possible
function checkLevelUp() {
    // This function checks if the player can afford to level up
    // It's called after each click to update the level up button state
    const levelUpCost = 3000 * Math.pow(1.15, level.toNumber()); // Updated to match new balance
    const levelUpButton = document.querySelector('button[onclick*="levelUp"]');
    
    if (levelUpButton) {
        if (sips.gte(levelUpCost)) {
            levelUpButton.classList.remove('disabled');
            levelUpButton.classList.add('affordable');
        } else {
            levelUpButton.classList.remove('affordable');
            levelUpButton.classList.add('disabled');
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
        sips: sips.toString(),
        straws: straws.toString(),
        cups: cups.toString(),
        suctions: suctions.toString(),
        fasterDrinks: fasterDrinks.toString(),
        sps: sps.toString(),
        strawSPS: strawSPS.toString(),
        cupSPS: cupSPS.toString(),
        suctionClickBonus: suctionClickBonus.toString(),
        widerStraws: widerStraws.toString(),
        betterCups: betterCups.toString(),
        widerStrawsSPS: widerStrawsSPS.toString(),
        betterCupsSPS: betterCupsSPS.toString(),
        fasterDrinksUpCounter: fasterDrinksUpCounter.toString(),
        criticalClickChance: criticalClickChance.toString(),
        criticalClickMultiplier: criticalClickMultiplier.toString(),
        criticalClicks: criticalClicks.toString(),
        criticalClickUpCounter: criticalClickUpCounter.toString(),
        level: level.toString(),
        totalSipsEarned: totalSipsEarned.toString(),
        gameStartDate: gameStartDate,
        lastClickTime: lastClickTime,
        clickTimes: clickTimes
    };

    try {
        localStorage.setItem("save", JSON.stringify(save));
        lastSaveTime = Date.now();
        lastSaveOperation = Date.now();
        updateLastSaveTime();
        console.log('Game saved successfully');
    } catch (error) {
        console.error('Failed to save game:', error);
        // Fallback: try to save with reduced data
        try {
            const minimalSave = { sips: sips.toString(), level: level.toString() };
            localStorage.setItem("save", JSON.stringify(minimalSave));
            console.log('Minimal save completed');
        } catch (fallbackError) {
            console.error('Even minimal save failed:', fallbackError);
        }
    }
}

function delete_save() {
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete your save? This will completely reset your game progress and cannot be undone.")) {
        // Remove save from localStorage
        localStorage.removeItem("save");
        
        // Reset all game variables to their initial values
        sips = new Decimal(0);
        straws = new Decimal(0);
        cups = new Decimal(0);
        suctions = new Decimal(0);
        sps = new Decimal(0);
        strawSPS = new Decimal(0);
        cupSPS = new Decimal(0);
        suctionClickBonus = new Decimal(0);
        widerStraws = new Decimal(0);
        betterCups = new Decimal(0);
        widerStrawsSPS = new Decimal(0);
        betterCupsSPS = new Decimal(0);
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
        criticalClickChance = new Decimal(0.001);
        criticalClickMultiplier = new Decimal(5);
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
        totalClicks = 0;
        currentClickStreak = 0;
        bestClickStreak = 0;
        totalSipsEarned = new Decimal(0);
        highestSipsPerSecond = new Decimal(0);
        gameStartDate = Date.now();
        lastClickTime = 0;
        clickTimes = [];
        

        
        // Update the UI to reflect the reset
        reload();
        updateCriticalClickDisplay();
        updateAllStats();
        checkUpgradeAffordability();
        
        // Show success message
        alert("Save deleted successfully! Your game has been reset to the beginning.");
        
        console.log('Game save deleted and all variables reset to initial values');
    }
}


function prettify(input) {
    if (input instanceof Decimal) {
        if (input.lt(1000)) {
            return input.toFixed(2);
        } else if (input.lt(1e6)) {
            return input.toFixed(1);
        } else if (input.lt(1e9)) {
            return (input.toNumber() / 1e6).toFixed(2) + "M";
        } else if (input.lt(1e12)) {
            return (input.toNumber() / 1e9).toFixed(2) + "B";
        } else if (input.lt(1e15)) {
            return (input.toNumber() / 1e12).toFixed(2) + "T";
        } else if (input.lt(1e18)) {
            return (input.toNumber() / 1e15).toFixed(2) + "Qa";
        } else if (input.lt(1e21)) {
            return (input.toNumber() / 1e18).toFixed(2) + "Qi";
        } else if (input.lt(1e24)) {
            return (input.toNumber() / 1e21).toFixed(2) + "Sx";
        } else if (input.lt(1e27)) {
            return (input.toNumber() / 1e24).toFixed(2) + "Sp";
        } else if (input.lt(1e30)) {
            return (input.toNumber() / 1e27).toFixed(2) + "Oc";
        } else {
            return input.toExponential(2);
        }
    }
    return input.toFixed(2);
}


function reload() {
    try {
        // IMPROVED BALANCE: Updated cost calculations to match new balance
        let strawCost = Math.floor(5 * Math.pow(1.08, straws.toNumber()));
        let cupCost = Math.floor(15 * Math.pow(1.15, cups.toNumber()));
        let suctionCost = Math.floor(40 * Math.pow(1.10, suctions.toNumber()));
        let fasterDrinksCost = Math.floor(80 * Math.pow(1.10, fasterDrinks.toNumber()));
        let criticalClickCost = Math.floor(60 * Math.pow(1.10, criticalClicks.toNumber()));
        let widerStrawsCost = Math.floor(150 * Math.pow(1.12, widerStraws.toNumber()));
        let betterCupsCost = Math.floor(400 * Math.pow(1.12, betterCups.toNumber()));

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
            'sips': prettify(sips),
            'topSipValue': prettify(sips),
            'sps': prettify(sps),
            'strawSPS': prettify(strawSPS),
            'cupSPS': prettify(cupSPS),
            'suctionClickBonus': prettify(suctionClickBonus),
            'totalStrawSPS': prettify(strawSPS.times(straws)),
            'totalCupSPS': prettify(cupSPS.times(cups)),
            'totalSuctionBonus': prettify(suctionClickBonus.times(suctions)),
            'widerStraws': widerStraws.toNumber(),
            'widerStrawsCost': widerStrawsCost.toString(),
            'widerStrawsSPS': prettify(widerStrawsSPS),
            'totalWiderStrawsSPS': prettify(widerStrawsSPS.times(widerStraws)),
            'betterCups': betterCups.toNumber(),
            'betterCupsCost': betterCupsCost.toString(),
            'betterCupsSPS': prettify(betterCupsSPS),
            'totalBetterCupsSPS': prettify(betterCupsSPS.times(betterCups)),
            'fasterDrinksUpCost': (1500 * fasterDrinksUpCounter.toNumber()).toString(),
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
            'fasterDrinksUpCostCompact': (1500 * fasterDrinksUpCounter.toNumber()).toString()
        };

        // Update each element safely
        for (const [id, value] of Object.entries(elements)) {
            const element = DOM_CACHE.get(id);
            if (element) {
                element.innerHTML = value;
            }
        }
        
        // Update drink speed display
        updateDrinkSpeedDisplay();
        
        // Update critical click display
        updateCriticalClickDisplay();
        
        // Check affordability after reloading all values
        checkUpgradeAffordability();
        
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
    }, 100);
});



// Global function for splash screen button (backup method)
window.startGameFromButton = function() {
    console.log('startGameFromButton called');
    
    // Eruda debugging for mobile
    if (typeof eruda !== 'undefined') {
        eruda.get('console').log('startGameFromButton called');
    }
    
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
};

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
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 2000);
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

function addGodMessage(content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message god-message';
    
    // Use divine styling for consistency
    messageDiv.classList.add('templeos-message');
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="images/TempleOS.jpg" alt="God" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">
        </div>
        <div class="message-content">
            <div class="message-sender">God</div>
            <div class="message-text">${content}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function getGodResponse(userMessage) {
    try {
        // Check for the sacred "geodude" keyword first
        if (userMessage.toLowerCase().includes('geodude')) {
            // Trigger YouTube video autoplay
            triggerGeodudeVideo();
            addGodMessage("🎵 The sacred melodies of Geodude echo through the digital realm...");
            return;
        }
        
        // Divine mode is now the default - always respond with sacred phrases
        const divineResponse = getDivineResponse(userMessage);
        addGodMessage(divineResponse);
        return; // Exit early for divine mode
        

        

        

    } catch (error) {
        console.error('Error getting divine response:', error);

        const errorMessages = [
            "The divine connection is experiencing technical difficulties. Please try again later!",
            "The sacred system is temporarily offline. My apologies for the inconvenience!",
            "Even divine systems have bad days. Try again in a moment!",
            "The holy servers are overloaded. Please wait and try again!",
            "My sacred connection is acting up. Give it a moment and try again!"
        ];
        
        const randomError = errorMessages[lcgRandomInt(0, errorMessages.length - 1)];
        addGodMessage(randomError);
    }
}





// LCG (Linear Congruential Generator) for deterministic randomness
// This provides consistent, reproducible randomness for the god feature
// while maintaining good statistical properties
let lcgSeed = Date.now();

function lcgNext() {
    // LCG parameters: a = 1664525, c = 1013904223, m = 2^32
    // These are standard LCG parameters that provide good randomness
    lcgSeed = (1664525 * lcgSeed + 1013904223) >>> 0;
    return lcgSeed / 4294967296; // Normalize to [0, 1)
}

function lcgRandomInt(min, max) {
    return Math.floor(lcgNext() * (max - min + 1)) + min;
}

// Function to reset LCG seed (useful for testing or changing randomness)
function resetLCGSeed(newSeed = null) {
    lcgSeed = newSeed || Date.now();
    console.log('LCG seed reset to:', lcgSeed);
}

// Function to get divine response (only phrases, no Giphy)
function getDivineResponse(userMessage) {
    // Ensure word bank is loaded
    if (!bibleWordBank || bibleWordBank.length === 0) {
        console.warn('Word bank not loaded yet, attempting to load...');
        loadWordBank().then(() => {
            // Retry the response after loading
            if (bibleWordBank && bibleWordBank.length > 0) {
                const response = generateBibleWords();
                addGodMessage(response);
            } else {
                addGodMessage("The sacred texts are temporarily unavailable. Please try again.");
            }
        }).catch(error => {
            console.error('Failed to load word bank:', error);
            addGodMessage("Divine wisdom is experiencing technical difficulties.");
        });
        return "Loading divine wisdom...";
    }

    return generateBibleWords();
}

// Function to check if word bank is ready
function isWordBankReady() {
    return bibleWordBank && bibleWordBank.length > 0;
}



// Helper function to generate Bible words
function generateBibleWords() {
    // Clean response - just 32 words, one per line
    // (Because 32-bit should be enough for anyone... or 64-bit if you're feeling divine)
    let words = [];

    // Generate exactly 32 words using LCG
    for (let i = 0; i < 32; i++) {
        words.push(getRandomBibleWord());
    }

    // Return just the words, one per line
    return words.join('\n');
}

// Word bank array loaded from JSON
let bibleWordBank = null;

// Load the word bank from JSON file
async function loadWordBank() {
    if (!bibleWordBank) {
        try {
            console.log('Loading word bank from word_bank.json...');
            const response = await fetch('word_bank.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.words || !Array.isArray(data.words)) {
                throw new Error('Invalid word bank format - expected {words: [...]} structure');
            }
            
            bibleWordBank = data.words; // Access the 'words' array from the JSON structure
            console.log(`✅ Successfully loaded ${bibleWordBank.length} words from word_bank.json`);
            
        } catch (error) {
            console.error('❌ Failed to load word bank:', error);
            // Fallback to a small set of words if JSON fails to load
            bibleWordBank = ['lord', 'god', 'jesus', 'christ', 'spirit', 'holy', 'heaven', 'earth'];
            console.log('Using fallback word bank with', bibleWordBank.length, 'words');
        }
    }
    return bibleWordBank;
}



function getRandomBibleWord() {
    // Use the comprehensive word bank from word_bank.json
    // This contains 13,290 unique words from the King James Bible
    // (That's more words than most operating systems have for divine guidance!)
    if (!bibleWordBank) {
        console.warn('Word bank not loaded yet, using fallback');
        return 'word';
    }

    const randomIndex = lcgRandomInt(0, bibleWordBank.length - 1);
    return bibleWordBank[randomIndex];
}

// Sacred Geodude YouTube video autoplay function
function triggerGeodudeVideo() {
            // Two sacred YouTube videos that will autoplay at random
        const geodudeVideos = [
            'https://www.youtube.com/embed/Mhvl7X_as8I?autoplay=1&mute=0', // Geodude video 1
            'https://www.youtube.com/embed/ok7fOwdk2gc?autoplay=1&mute=0'  // Geodude video 2
        ];
    
    // Randomly select one of the two videos using LCG
    const randomVideo = geodudeVideos[lcgRandomInt(0, geodudeVideos.length - 1)];
    
    // Create video modal if it doesn't exist
    let videoModal = document.getElementById('geodudeVideoModal');
    if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.id = 'geodudeVideoModal';
        videoModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close Sacred Video';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: #00FF00;
            color: #000;
            border: none;
            padding: 10px 20px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            z-index: 10001;
        `;
        closeBtn.onclick = () => {
            videoModal.remove();
        };
        
        // Create iframe for YouTube video
        const videoFrame = document.createElement('iframe');
        videoFrame.src = randomVideo;
        videoFrame.style.cssText = `
            width: 80%;
            height: 80%;
            border: 2px solid #00FF00;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
        `;
        videoFrame.allow = 'autoplay; encrypted-media';
        
        videoModal.appendChild(closeBtn);
        videoModal.appendChild(videoFrame);
        document.body.appendChild(videoModal);
        
        // Auto-close after 30 seconds (or user can close manually)
        setTimeout(() => {
            if (videoModal.parentNode) {
                videoModal.remove();
            }
        }, 30000);
    } else {
        // If modal already exists, just update the video source
        const videoFrame = videoModal.querySelector('iframe');
        if (videoFrame) {
            videoFrame.src = randomVideo;
        }
        videoModal.style.display = 'flex';
    }
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

// Make all other functions globally available for HTML onclick attributes
window.sodaClick = sodaClick;
window.levelUp = levelUp;
window.checkLevelUp = checkLevelUp;
window.buyStraw = buyStraw;
window.buyCup = buyCup;
window.buyWiderStraws = buyWiderStraws;
window.buyBetterCups = buyBetterCups;
window.buySuction = buySuction;
window.upgradeSuction = upgradeSuction;
window.buyFasterDrinks = buyFasterDrinks;
window.upgradeFasterDrinks = upgradeFasterDrinks;
window.buyCriticalClick = buyCriticalClick;
window.upgradeCriticalClick = upgradeCriticalClick;
window.triggerGeodudeVideo = triggerGeodudeVideo;
    window.save = save;
    window.delete_save = delete_save;
    window.sendMessage = sendMessage;

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
    
    // Initialize music player state
    window.musicPlayerState = {
        isPlaying: false,
        isMuted: false,
        audio: null,
        currentStream: null,
        streamInfo: {},
        retryCount: 0,
        maxRetries: 10,
        isRetrying: false,
        lastRetryTime: 0,
        retryDelay: 2000 // 2 second delay between retries
    };
    
    // Create audio element for lofi stream
    const audio = new Audio();
    // Use a working lofi stream for authentic lofi beats
    audio.src = 'https://ice1.somafm.com/groovesalad-128-mp3';
    audio.loop = true;
    audio.volume = 0.3; // Start at 30% volume
    
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

                // Try the default stream again
                state.audio.src = 'https://ice1.somafm.com/groovesalad-128-mp3';
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
    
    // Store audio reference
    window.musicPlayerState.audio = audio;
    
    // Add event listeners
    musicToggleBtn.addEventListener('click', toggleMusic);
    musicMuteBtn.addEventListener('click', toggleMute);
    
    // Add mobile-specific event listeners to pause music when window loses focus
    let wasPlayingBeforeBlur = false;
    
    // Function to detect if user is on a mobile device
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && window.innerHeight <= 1024);
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
                updateMusicPlayerUI();
                console.log('Music paused due to page visibility change on mobile');
            }
        } else if (document.hidden) {
            // Page became hidden on desktop - let music continue playing
            console.log('Page became hidden on desktop, music continues playing');
        } else {
            // Page became visible again - don't auto-resume, let user decide
            console.log('Page became visible again, music remains paused');
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
                updateMusicPlayerUI();
                console.log('Music paused due to window blur on mobile');
            }
        } else {
            // Window lost focus on desktop - let music continue playing
            console.log('Window lost focus on desktop, music continues playing');
        }
    });
    
    // Update initial button states
    updateMusicPlayerUI();
    
    // Try to auto-play (may be blocked by browser)
    setTimeout(() => {
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            // Don't auto-play, just show ready state
            musicStatus.textContent = 'Click to start music';
            // Only update stream info once on initialization
            updateStreamInfo();
        }
    }, 1000);
    
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
        musicStatus.textContent = 'Paused';
        updateMusicPlayerUI();
    } else {
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
    // SomaFM Stations (Default Options)
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
        const streamPreferences = JSON.parse(localStorage.getItem('musicStreamPreferences') || '{}');
        streamPreferences.selectedStream = selectedStream;
        localStorage.setItem('musicStreamPreferences', JSON.stringify(streamPreferences));
        
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
    const streamPreferences = JSON.parse(localStorage.getItem('musicStreamPreferences') || '{}');
    streamPreferences.selectedStream = selectedStream;
    localStorage.setItem('musicStreamPreferences', JSON.stringify(streamPreferences));
    
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
        const streamPreferences = JSON.parse(localStorage.getItem('musicStreamPreferences') || '{}');
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
            // Set default to groovesalad if no valid preference
            streamSelect.value = 'groovesalad';
            const streamData = MUSIC_STREAMS.groovesalad;
            currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
            console.log('No valid stream preference found, using default');
        }
    } catch (error) {
        console.error('Error loading stream preference:', error);
        // Fallback to default
        streamSelect.value = 'groovesalad';
        const streamData = MUSIC_STREAMS.groovesalad;
        currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
    }
}

function loadFallbackMusic() {
    // Try alternative lofi sources if the main one fails
    const fallbackSources = [
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
window.updateCriticalClickDisplay = updateCriticalClickDisplay;
window.updateDrinkSpeedDisplay = updateDrinkSpeedDisplay;
window.loadOptions = loadOptions;
window.updatePlayTime = updatePlayTime;
window.updateLastSaveTime = updateLastSaveTime;
window.trackClick = trackClick;
window.showClickFeedback = showClickFeedback;
window.showPurchaseFeedback = showPurchaseFeedback;
window.addUserMessage = addUserMessage;
window.addGodMessage = addGodMessage;
window.scrollToBottom = scrollToBottom;
window.escapeHtml = escapeHtml;


window.toggleAutosave = toggleAutosave;
window.changeAutosaveInterval = changeAutosaveInterval;
window.getGodResponse = getGodResponse;
window.initMusicPlayer = initMusicPlayer;
window.toggleMusic = toggleMusic;
window.toggleMute = toggleMute;
window.updateStreamInfo = updateStreamInfo;
window.getStreamDetails = getStreamDetails;

window.getDivineResponse = getDivineResponse;
window.resetLCGSeed = resetLCGSeed;
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


