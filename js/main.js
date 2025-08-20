// Soda Clicker Pro - Main Game Logic
// 
// TALK TO GOD FEATURE SETUP:
// The Giphy API key is now configured via environment variables
// Your API key is securely stored and ready to use!

// Import configuration
import { config } from './config.js';
import { templePhrases, totalPhrases } from './phrases.js';

let sips = new Decimal(0);
let straws = new Decimal(0);
let cups = new Decimal(0);
let suctions = new Decimal(0);
let sps = new Decimal(0);
let strawSPS = new Decimal(0);
let cupSPS = new Decimal(0);
let suctionClickBonus = new Decimal(0);
let strawUpCounter = new Decimal(1);
let cupUpCounter = new Decimal(1);
let suctionUpCounter = new Decimal(1);
let level = new Decimal(1);

// Drink system variables
const DEFAULT_DRINK_RATE = 5000; // 5 seconds in milliseconds
let drinkRate = DEFAULT_DRINK_RATE;
let drinkProgress = 0;
let lastDrinkTime = Date.now();

// Faster Drinks upgrade variables
let fasterDrinks = new Decimal(0);
let fasterDrinksUpCounter = new Decimal(1);

// Critical Click system variables
let criticalClickChance = new Decimal(0.0001); // 0.01% base chance
let criticalClickMultiplier = new Decimal(10); // 10x multiplier for critical hits
let criticalClicks = new Decimal(0); // Total critical clicks achieved
let criticalClickUpCounter = new Decimal(1); // Upgrade counter for critical chance

// Sound system variables
let clickSoundsEnabled = true;

// Auto-save and options variables
let autosaveEnabled = true;
let autosaveInterval = 10; // seconds
let autosaveCounter = 0;
let gameStartTime = Date.now();
let lastSaveTime = null;

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
    const strawCost = Math.floor(10 * Math.pow(1.1, straws.toNumber()));
    const cupCost = Math.floor(20 * Math.pow(1.2, cups.toNumber()));
    const suctionCost = Math.floor(50 * Math.pow(1.15, suctions.toNumber()));
    const fasterDrinksCost = Math.floor(100 * Math.pow(1.12, fasterDrinks.toNumber()));
    const criticalClickCost = Math.floor(75 * Math.pow(1.15, criticalClicks.toNumber()));
    const strawUpCost = 200 * strawUpCounter.toNumber();
    const cupUpCost = 500 * cupUpCounter.toNumber();
    const suctionUpCost = 1000 * suctionUpCounter.toNumber();
    const fasterDrinksUpCost = 2000 * fasterDrinksUpCounter.toNumber();
    const criticalClickUpCost = 1500 * criticalClickUpCounter.toNumber();
    const levelUpCost = 5000 * level.toNumber();
    
    // Update button states based on affordability
    updateButtonState('buyStraw', sips.gte(strawCost), strawCost);
    updateButtonState('buyCup', sips.gte(cupCost), cupCost);
    updateButtonState('buySuction', sips.gte(suctionCost), suctionCost);
    updateButtonState('buyFasterDrinks', sips.gte(fasterDrinksCost), fasterDrinksCost);
    updateButtonState('buyCriticalClick', sips.gte(criticalClickCost), criticalClickCost);
    updateButtonState('upgradeStraw', sips.gte(strawUpCost), strawUpCost);
    updateButtonState('upgradeCup', sips.gte(cupUpCost), cupUpCost);
    updateButtonState('upgradeSuction', sips.gte(suctionUpCost), suctionUpCost);
    updateButtonState('upgradeFasterDrinks', sips.gte(fasterDrinksUpCost), fasterDrinksUpCost);
    updateButtonState('upgradeCriticalClick', sips.gte(criticalClickUpCost), criticalClickUpCost);
    updateButtonState('levelUp', sips.gte(levelUpCost), levelUpCost);
    
    // Update cost displays with affordability indicators
    updateCostDisplay('strawCost', strawCost, sips.gte(strawCost));
    updateCostDisplay('cupCost', cupCost, sips.gte(cupCost));
    updateCostDisplay('suctionCost', suctionCost, sips.gte(suctionCost));
    updateCostDisplay('fasterDrinksCost', fasterDrinksCost, sips.gte(fasterDrinksCost));
    updateCostDisplay('criticalClickCost', criticalClickCost, sips.gte(criticalClickCost));
    updateCostDisplay('strawUpCost', strawUpCost, sips.gte(strawUpCost));
    updateCostDisplay('cupUpCost', cupUpCost, sips.gte(cupUpCost));
    updateCostDisplay('suctionUpCost', suctionUpCost, sips.gte(suctionUpCost));
    updateCostDisplay('fasterDrinksUpCost', fasterDrinksUpCost, sips.gte(fasterDrinksUpCost));
    updateCostDisplay('criticalClickUpCost', criticalClickUpCost, sips.gte(criticalClickUpCost));
    updateCostDisplay('levelCost', levelUpCost, sips.gte(levelUpCost));
}

// Update button state based on affordability
function updateButtonState(buttonId, isAffordable, cost) {
    const button = document.querySelector(`button[onclick*="${buttonId}"]`);
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
        // Load saved game data
        let savegame = JSON.parse(localStorage.getItem("save"));
        
        if (savegame && typeof savegame.sips !== "undefined" && savegame.sips !== null) {
            sips = new Decimal(savegame.sips);
            straws = new Decimal(savegame.straws || 0);
            cups = new Decimal(savegame.cups || 0);
            suctions = new Decimal(savegame.suctions || 0);
            fasterDrinks = new Decimal(savegame.fasterDrinks || 0);
            sps = new Decimal(savegame.sps || 0);
            strawUpCounter = new Decimal(savegame.strawUpCounter || 1);
            cupUpCounter = new Decimal(savegame.cupUpCounter || 1);
            suctionUpCounter = new Decimal(savegame.suctionUpCounter || 1);
            fasterDrinksUpCounter = new Decimal(savegame.fasterDrinksUpCounter || 1);
            criticalClickChance = new Decimal(savegame.criticalClickChance || 0.0001);
            criticalClickMultiplier = new Decimal(savegame.criticalClickMultiplier || 10);
            criticalClicks = new Decimal(savegame.criticalClicks || 0);
            criticalClickUpCounter = new Decimal(savegame.criticalClickUpCounter || 1);
            suctionClickBonus = new Decimal(savegame.suctionClickBonus || 0);
            level = new Decimal(savegame.level || 1);
            totalSipsEarned = new Decimal(savegame.totalSipsEarned || 0);
            gameStartDate = savegame.gameStartDate || Date.now();
            lastClickTime = savegame.lastClickTime || 0;
            clickTimes = savegame.clickTimes || [];
        }
        
        strawSPS = new Decimal(0.4).times(strawUpCounter);
        cupSPS = new Decimal(cupUpCounter.toNumber());
        suctionClickBonus = new Decimal(0.2).times(suctions);
        
        // Initialize drink rate based on upgrades
        updateDrinkRate();
        
        console.log('Game variables initialized, calling reload...');
        
        // Only call reload if we're sure the DOM is ready
        if (document.getElementById('sips')) {
            reload();
        } else {
            console.log('DOM not ready yet, skipping reload');
        }
        
        console.log('Starting game loop...');
        // Start the game loop
        startGameLoop();
        
        // Update prominent stats header with initial values
        updateProminentStats();
        
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
    // Update drink progress every 100ms for very smooth animation
    window.setInterval(function() {
        updateDrinkProgress();
    }, 100);
    
    // Main drink interval for game logic
    window.setInterval(function() {
        processDrink();
    }, 100); // Check every 100ms for more responsive gameplay
    
    // Update play time, last save time, and stats every second
    window.setInterval(function() {
        updatePlayTime();
        updateLastSaveTime();
        updateAllStats();
    }, 1000);
}

function updateDrinkProgress() {
    const currentTime = Date.now();
    const timeSinceLastDrink = currentTime - lastDrinkTime;
    drinkProgress = (timeSinceLastDrink / drinkRate) * 100;
    
    // Cache DOM elements to reduce queries
    const progressFill = document.getElementById('drinkProgressFill');
    const countdown = document.getElementById('drinkCountdown');
    
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
}

// Function to get current drink rate in seconds
function getDrinkRateSeconds() {
    return drinkRate / 1000;
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
    const playTimeElement = document.getElementById('playTime');
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
    const lastSaveElement = document.getElementById('lastSaveTime');
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
    const statsTab = document.getElementById('statsTab');
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
    const totalPlayTimeElement = document.getElementById('totalPlayTime');
    if (totalPlayTimeElement) {
        const totalTime = Date.now() - gameStartDate;
        const totalSeconds = Math.floor(totalTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        totalPlayTimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Current session time
    const sessionTimeElement = document.getElementById('sessionTime');
    if (sessionTimeElement) {
        const sessionTime = Date.now() - gameStartTime;
        const sessionSeconds = Math.floor(sessionTime / 1000);
        const hours = Math.floor(sessionSeconds / 3600);
        const minutes = Math.floor((sessionSeconds % 3600) / 60);
        const seconds = sessionSeconds % 60;
        sessionTimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Days since start
    const daysSinceStartElement = document.getElementById('daysSinceStart');
    if (daysSinceStartElement) {
        const daysSinceStart = Math.floor((Date.now() - gameStartDate) / (1000 * 60 * 60 * 24));
        daysSinceStartElement.textContent = daysSinceStart.toString();
    }
}

function updateClickStats() {
    // Total clicks
    const totalClicksElement = document.getElementById('totalClicks');
    if (totalClicksElement) {
        totalClicksElement.textContent = prettify(totalClicks);
    }
    
    // Clicks per second (last 10 seconds)
    const clicksPerSecondElement = document.getElementById('clicksPerSecond');
    if (clicksPerSecondElement) {
        const now = Date.now();
        const tenSecondsAgo = now - 10000;
        const recentClicks = clickTimes.filter(time => time > tenSecondsAgo).length;
        clicksPerSecondElement.textContent = (recentClicks / 10).toFixed(2);
    }
    
    // Best click streak
    const bestClickStreakElement = document.getElementById('bestClickStreak');
    if (bestClickStreakElement) {
        bestClickStreakElement.textContent = bestClickStreak.toString();
    }
}

function updateEconomyStats() {
    // Total sips earned
    const totalSipsEarnedElement = document.getElementById('totalSipsEarned');
    if (totalSipsEarnedElement) {
        totalSipsEarnedElement.textContent = prettify(totalSipsEarned);
    }
    
    // Current sips per second
    const currentSipsPerSecondElement = document.getElementById('currentSipsPerSecond');
    if (currentSipsPerSecondElement) {
        const currentSPS = strawSPS.times(straws).plus(cupSPS.times(cups));
        currentSipsPerSecondElement.textContent = prettify(currentSPS);
    }
    
    // Highest sips per second achieved
    const highestSipsPerSecondElement = document.getElementById('highestSipsPerSecond');
    if (highestSipsPerSecondElement) {
        highestSipsPerSecondElement.textContent = prettify(highestSipsPerSecond);
    }
}

function updateShopStats() {
    // Straws purchased
    const strawsPurchasedElement = document.getElementById('strawsPurchased');
    if (strawsPurchasedElement) {
        strawsPurchasedElement.textContent = prettify(straws);
    }
    
    // Cups purchased
    const cupsPurchasedElement = document.getElementById('cupsPurchased');
    if (cupsPurchasedElement) {
        cupsPurchasedElement.textContent = prettify(cups);
    }
    
    // Suctions purchased
    const suctionsPurchasedElement = document.getElementById('suctionsPurchased');
    if (suctionsPurchasedElement) {
        suctionsPurchasedElement.textContent = prettify(suctions);
    }
    
    // Critical clicks purchased
    const criticalClicksPurchasedElement = document.getElementById('criticalClicksPurchased');
    if (criticalClicksPurchasedElement) {
        criticalClicksPurchasedElement.textContent = prettify(criticalClicks);
    }
}

function updateAchievementStats() {
    // Current level
    const currentLevelElement = document.getElementById('currentLevel');
    if (currentLevelElement) {
        currentLevelElement.textContent = level.toString();
    }
    
    // Total upgrades (sum of all upgrade counters)
    const totalUpgradesElement = document.getElementById('totalUpgrades');
    if (totalUpgradesElement) {
        const totalUpgrades = strawUpCounter.plus(cupUpCounter).plus(suctionUpCounter).plus(fasterDrinksUpCounter).plus(criticalClickUpCounter);
        totalUpgradesElement.textContent = prettify(totalUpgrades);
    }
    
    // Faster drinks owned
    const fasterDrinksOwnedElement = document.getElementById('fasterDrinksOwned');
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
    if (document.getElementById('statsTab').classList.contains('active')) {
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
    const currentDrinkSpeed = document.getElementById('currentDrinkSpeed');
    const drinkSpeedBonus = document.getElementById('drinkSpeedBonus');
    
    if (currentDrinkSpeed && drinkSpeedBonus) {
        // Show current drink time
        currentDrinkSpeed.textContent = getDrinkRateSeconds().toFixed(2) + 's';
        
        // Calculate and show speed bonus percentage
        let totalReduction = fasterDrinks.times(fasterDrinksUpCounter).times(0.01);
        let speedBonusPercent = totalReduction.times(100);
        drinkSpeedBonus.textContent = speedBonusPercent.toFixed(1) + '%';
    }
}

// Function to update prominent stats header (visible in all tabs)
function updateProminentStats() {
    const prominentSips = document.getElementById('prominentSips');
    const prominentSPS = document.getElementById('prominentSPS');
    const prominentClickBonus = document.getElementById('prominentClickBonus');
    const prominentCriticalChance = document.getElementById('prominentCriticalChance');
    
    if (prominentSips) {
        prominentSips.textContent = prettify(sips);
    }
    
    if (prominentSPS) {
        prominentSPS.textContent = prettify(sps);
    }
    
    if (prominentClickBonus) {
        // Calculate total click bonus (base 1 + suction bonus)
        const totalClickBonus = new Decimal(1).plus(suctionClickBonus);
        prominentClickBonus.textContent = prettify(totalClickBonus);
    }
    
    if (prominentCriticalChance) {
        // Display critical click chance as percentage
        prominentCriticalChance.textContent = (criticalClickChance.times(100)).toFixed(4) + '%';
    }
}

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
        // Update display
        const sipsElement = document.getElementById("sips");
        if (sipsElement) {
            sipsElement.innerHTML = prettify(sips);
        }
        
        // Update prominent stats header
        updateProminentStats();
        
        // Show click feedback
        showClickFeedback(totalSipsGained, isCritical);
        
        // Visual feedback with smoother image transition
        const sodaButton = document.getElementById("sodaButton");
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
    const sodaContainer = document.querySelector('.soda-container');
    if (!sodaContainer) return;
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = isCritical ? 'click-feedback critical-feedback' : 'click-feedback';
    feedback.textContent = (isCritical ? '💥 CRITICAL! +' : '+') + prettify(sipsGained);
    
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
    const currentSPS = strawSPS.times(straws).plus(cupSPS.times(cups));
    if (currentSPS.gt(highestSipsPerSecond)) {
        highestSipsPerSecond = currentSPS;
    }
    
    document.getElementById("sips").innerHTML = prettify(sips);
    
    // Update prominent stats header
    updateProminentStats();
}

function buyStraw() {
    let strawCost = Math.floor(10 * Math.pow(1.1, straws.toNumber()));
    if (sips.gte(strawCost)) {
        straws = straws.plus(1);
        sips = sips.minus(strawCost);
        strawSPS = new Decimal(0.4).times(strawUpCounter);
        sps = strawSPS.times(straws).plus(cupSPS.times(cups));
        
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

function upgradeStraw() {
    let strawUpCost = 200 * strawUpCounter.toNumber();
    if (sips.gte(strawUpCost)) {
        sips = sips.minus(strawUpCost);
        strawUpCounter = strawUpCounter.plus(1);
        strawSPS = new Decimal(0.4).times(strawUpCounter);
        sps = new Decimal(0);
        sps = sps.plus(strawSPS.times(straws));
        sps = sps.plus(cupSPS.times(cups));
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        reload();
        checkUpgradeAffordability();
    }
}

function buyCup() {
    let cupCost = Math.floor(20 * Math.pow(1.2, cups.toNumber()));
    if (sips.gte(cupCost)) {
        cups = cups.plus(1);
        sips = sips.minus(cupCost);
        cupSPS = new Decimal(cupUpCounter.toNumber());
        sps = strawSPS.times(straws).plus(cupSPS.times(cups));
        
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

function upgradeCup() {
    let cupUpCost = 500 * cupUpCounter.toNumber();
    if (sips.gte(cupUpCost)) {
        sips = sips.minus(cupUpCost);
        cupUpCounter = cupUpCounter.plus(1);
        cupSPS = new Decimal(cupUpCounter.toNumber());
        sps = new Decimal(0);
        sps = sps.plus(strawSPS.times(straws));
        sps = sps.plus(cupSPS.times(cups));
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        reload();
        checkUpgradeAffordability();
    }
}

function buySuction() {
    let suctionCost = Math.floor(50 * Math.pow(1.15, suctions.toNumber()));
    
    if (sips.gte(suctionCost)) {
        suctions = suctions.plus(1);
        sips = sips.minus(suctionCost);
        suctionClickBonus = new Decimal(0.2).times(suctions);
        
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
    let suctionUpCost = 1000 * suctionUpCounter.toNumber();
    
    if (sips.gte(suctionUpCost)) {
        sips = sips.minus(suctionUpCost);
        suctionUpCounter = suctionUpCounter.plus(1);
        suctionClickBonus = new Decimal(0.2).times(suctionUpCounter);
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        reload();
        checkUpgradeAffordability();
    }
}

function buyFasterDrinks() {
    let fasterDrinksCost = Math.floor(100 * Math.pow(1.12, fasterDrinks.toNumber()));
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
    let fasterDrinksUpCost = 2000 * fasterDrinksUpCounter.toNumber();
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
    let criticalClickCost = Math.floor(75 * Math.pow(1.15, criticalClicks.toNumber()));
    if (sips.gte(criticalClickCost)) {
        criticalClicks = criticalClicks.plus(1);
        sips = sips.minus(criticalClickCost);
        
        // Increase critical click chance by 0.005% (0.00005) per purchase
        criticalClickChance = criticalClickChance.plus(0.00005);
        
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
    let criticalClickUpCost = 1500 * criticalClickUpCounter.toNumber();
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
    let levelUpCost = 5000 * level.toNumber();
    if (sips.gte(levelUpCost)) {
        sips = sips.minus(levelUpCost);
        level = level.plus(1);
        
        // Calculate sips gained from level up (100% increase)
        const sipsGained = sps;
        
        // Play purchase sound
        if (clickSoundsEnabled) {
            playPurchaseSound();
        }
        
        // Update displays
        document.getElementById("sips").innerHTML = prettify(sips);
        document.getElementById("levelNumber").innerHTML = level.toNumber();
        document.getElementById("sips").innerHTML = prettify(sips);
        
        // Show level up feedback
        showLevelUpFeedback(sipsGained);
        
        // Check affordability after level up
        checkUpgradeAffordability();
    }
}

// Function to show level up feedback
function showLevelUpFeedback(sipsGained) {
    const levelUpDiv = document.getElementById('levelUpDiv');
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
    const levelUpCost = 5000 * level.toNumber();
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
        document.getElementById("levelText").innerHTML = "On a Red Background";
        body.style.backgroundColor = "#AE323B";
    }
}

function save() {
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
        strawUpCounter: strawUpCounter.toString(),
        cupUpCounter: cupUpCounter.toString(),
        suctionUpCounter: suctionUpCounter.toString(),
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

    localStorage.setItem("save", JSON.stringify(save));
    lastSaveTime = Date.now();
    updateLastSaveTime();
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
        strawUpCounter = new Decimal(1);
        cupUpCounter = new Decimal(1);
        suctionUpCounter = new Decimal(1);
        level = new Decimal(1);
        
        // Reset drink system variables
        drinkRate = DEFAULT_DRINK_RATE;
        drinkProgress = 0;
        lastDrinkTime = Date.now();
        
        // Reset faster drinks upgrade variables
        fasterDrinks = new Decimal(0);
        fasterDrinksUpCounter = new Decimal(1);
        
        // Reset critical click system variables
        criticalClickChance = new Decimal(0.0001);
        criticalClickMultiplier = new Decimal(10);
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
        
        // Reset TempleOS mode
        window.templeOSMode = false;
        
        // Update the UI to reflect the reset
        reload();
        updateProminentStats();
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
        let strawCost = Math.floor(10 * Math.pow(1.1, straws.toNumber()));
        let cupCost = Math.floor(20 * Math.pow(1.2, cups.toNumber()));
        let suctionCost = Math.floor(50 * Math.pow(1.15, suctions.toNumber()));
        let fasterDrinksCost = Math.floor(100 * Math.pow(1.12, fasterDrinks.toNumber()));
        let criticalClickCost = Math.floor(75 * Math.pow(1.15, criticalClicks.toNumber()));

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
            'sps': prettify(sps),
            'strawSPS': prettify(strawSPS),
            'cupSPS': prettify(cupSPS),
            'suctionClickBonus': prettify(suctionClickBonus),
            'totalStrawSPS': prettify(strawSPS.times(straws)),
            'totalCupSPS': prettify(cupSPS.times(cups)),
            'totalSuctionBonus': prettify(suctionClickBonus.times(suctions)),
            'strawUpCost': (200 * strawUpCounter.toNumber()).toString(),
            'cupUpCost': (500 * cupUpCounter.toNumber()).toString(),
            'suctionUpCost': (1000 * suctionUpCounter.toNumber()).toString(),
            'fasterDrinksUpCost': (2000 * fasterDrinksUpCounter.toNumber()).toString(),
            'criticalClickUpCost': (1500 * criticalClickUpCounter.toNumber()).toString(),
            'levelNumber': level.toNumber()
        };

        // Update each element safely
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = value;
            }
        }
        
        // Update drink speed display
        updateDrinkSpeedDisplay();
        
        // Update prominent stats header (visible in all tabs)
        updateProminentStats();
        
        // Check affordability after reloading all values
        checkUpgradeAffordability();
        
        console.log('Reload completed successfully');
        
    } catch (error) {
        console.error('Error in reload function:', error);
    }
}

// Initialize splash screen when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing splash screen...');
    
    // Eruda debugging for mobile
    if (typeof eruda !== 'undefined') {
        eruda.get('console').log('DOM loaded, initializing splash screen...');
    }
    
    // Small delay to ensure everything is ready
    setTimeout(() => {
        initSplashScreen();
        loadOptions(); // Load options on page load
        updatePlayTime(); // Start play time tracking
        console.log('Splash screen initialization complete');
        
        if (typeof eruda !== 'undefined') {
            eruda.get('console').log('Splash screen initialization complete');
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
    const shopDiv = document.getElementById('shopDiv');
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

// Talk to God functionality
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    chatInput.value = '';
    
    // Get God's response (GIF from Giphy)
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

function addGodMessage(content, isGif = false, isTempleOS = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message god-message';
    
    if (isGif) {
        messageDiv.classList.add('gif-message');
        messageDiv.innerHTML = `
            <div class="message-avatar">👑</div>
            <div class="message-content">
                <div class="message-sender">God</div>
                <div class="message-text">${content}</div>
            </div>
        `;
    } else if (isTempleOS) {
        messageDiv.classList.add('templeos-message');
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="images/TempleOS.jpg" alt="TempleOS God" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
            </div>
            <div class="message-content">
                <div class="message-sender">TempleOS God</div>
                <div class="message-text">${content}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">👑</div>
            <div class="message-content">
                <div class="message-sender">God</div>
                <div class="message-text">${content}</div>
            </div>
        `;
    }
    
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
        // Check if we're in TempleOS mode
        if (window.templeOSMode) {
            // TempleOS God only responds with phrases from the list
            const templeResponse = getTempleOSResponse(userMessage);
            addGodMessage(`
                <div style="background: #000; color: #00FF00; font-family: 'Courier New', monospace; padding: 1rem; border-radius: 8px; text-align: left; max-height: 400px; overflow-y: auto;">
                    <div style="color: #FFFF00;">> TEMPLEOS v1.0.0</div>
                    <div style="color: #00FF00;">> Status: ONLINE</div>
                    <div style="color: #00FF00;">> Mode: DIVINE COMMUNICATION</div>
                    <div style="color: #00FF00;">> ------------------------</div>
                    ${templeResponse}
                </div>
            `, false, true); // Pass true to indicate TempleOS mode
            return; // Exit early for TempleOS mode
        }
        
        // Check for the secret "geodude" keyword (case-insensitive)
        if (userMessage.toLowerCase().includes('geodude')) {
            // Remove the thinking message if it exists
            const thinkingMessage = document.querySelector('.god-message:last-child');
            if (thinkingMessage) {
                thinkingMessage.remove();
            }
            
            // Randomly choose between the two geodude videos
            const geodudeVideos = [
                {
                    id: 'Mhvl7X_as8I',
                    title: 'Geodude Secret Video 1'
                },
                {
                    id: 'ok7fOwdk2gc',
                    title: 'Geodude Secret Video 2'
                }
            ];
            
            const randomVideo = geodudeVideos[Math.floor(Math.random() * geodudeVideos.length)];
            
            // Add the secret geodude response with embedded YouTube video (autoplay enabled)
            addGodMessage(`
                <div style="text-align: center; margin: 1rem 0;">
                    <p style="color: #00B36B; font-weight: bold; margin-bottom: 1rem;">🎵 You've discovered a divine secret! 🎵</p>
                    <div style="position: relative; width: 100%; max-width: 560px; margin: 0 auto;">
                        <iframe 
                            width="100%" 
                            height="315" 
                            src="https://www.youtube.com/embed/${randomVideo.id}?autoplay=1&mute=0" 
                            title="${randomVideo.title}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 179, 107, 0.3);">
                        </iframe>
                    </div>
                    <p style="color: #FF8E53; font-style: italic; margin-top: 1rem;">The heavens have blessed you with this sacred melody! 🌟</p>
                </div>
            `);
            return; // Exit early for the secret response
        }
        
        // Check for the secret "temple" keyword (case-insensitive) - TempleOS mode activation
        if (userMessage.toLowerCase().includes('temple')) {
            // Remove the thinking message if it exists
            const thinkingMessage = document.querySelector('.god-message:last-child');
            if (thinkingMessage) {
                thinkingMessage.remove();
            }
            
            // Activate TempleOS mode
            window.templeOSMode = true;
            const templeResponse = activateTempleOSMode();
            addGodMessage(`
                <div style="text-align: center; margin: 1rem 0;">
                    <p style="color: #FFD700; font-weight: bold; margin-bottom: 1rem;">🏛️ TEMPLEOS MODE ACTIVATED 🏛️</p>
                    <div style="background: #000; color: #00FF00; font-family: 'Courier New', monospace; padding: 1rem; border-radius: 8px; text-align: left; max-height: 400px; overflow-y: auto;">
                        <div style="color: #FFFF00;">> TEMPLEOS v1.0.0</div>
                        <div style="color: #00FF00;">> Loading divine phrases...</div>
                        <div style="color: #00FF00;">> Status: ONLINE</div>
                        <div style="color: #00FF00;">> Mode: DIVINE COMMUNICATION</div>
                        <div style="color: #00FF00;">> ------------------------</div>
                        ${templeResponse}
                    </div>
                    <p style="color: #FF8E53; font-style: italic; margin-top: 1rem;">TempleOS mode: Divine wisdom in 32-bit precision! 🏛️</p>
                    <p style="color: #00FF00; font-size: 0.9em; margin-top: 0.5rem;">Type anything to get TempleOS God responses. Type "exit" to return to normal God.</p>
                </div>
            `, false, true); // Use TempleOS profile picture
            return; // Exit early for the TempleOS response
        }
        
        // Check for exit command to return to normal God
        if (window.templeOSMode && userMessage.toLowerCase().includes('exit')) {
            window.templeOSMode = false;
            addGodMessage(`
                <div style="text-align: center; margin: 1rem 0;">
                    <p style="color: #FFD700; font-weight: bold; margin-bottom: 1rem;">🏛️ TEMPLEOS MODE DEACTIVATED 🏛️</p>
                    <p style="color: #00FF00;">> Returning to normal God mode...</p>
                    <p style="color: #FF8E53; font-style: italic; margin-top: 1rem;">Normal God has been restored. Type "temple" to reactivate TempleOS mode.</p>
                </div>
            `, false, true); // Use TempleOS profile picture for the exit message
            return; // Exit early for the exit response
        }
        
        // Show "God is typing..." message with divine variations (only in normal mode)
        const thinkingMessages = [
            "God is contemplating your question... 🤔",
            "The heavens are processing your request... ⭐",
            "Divine wisdom is being consulted... ✨",
            "God is meditating on your words... 🧘‍♂️",
            "The universe is aligning for your answer... 🌟"
        ];
        
        const randomThinking = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
        addGodMessage(randomThinking);
        
        // Search for God's mysterious response
        const gifUrl = await getDivineResponse(userMessage);
        
        // Add a natural delay to make responses feel more divine
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Remove the "thinking" message
        const thinkingMessage = document.querySelector('.god-message:last-child');
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
        
        // Add the divine response
        if (gifUrl) {
            addGodMessage(`<img src="${gifUrl}" alt="God's divine response" onerror="this.style.display='none'">`, true);
        } else {
            // Fallback divine messages
            const fallbackMessages = [
                "I'm sorry, my divine wisdom is temporarily clouded. Try asking about something else!",
                "The cosmic forces are not aligned for that question right now. Ask again later!",
                "That's beyond even my infinite wisdom. Perhaps rephrase your question?",
                "The universe is silent on that matter. Try a different approach!",
                "My divine knowledge has limits too, you know. Ask something else!"
            ];
            
            const randomFallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
            addGodMessage(randomFallback);
        }
    } catch (error) {
        console.error('Error getting God response:', error);
        
        const errorMessages = [
            "I'm experiencing some divine technical difficulties. Please try again later!",
            "The cosmic internet is down. My apologies for the inconvenience!",
            "Even gods have bad connection days. Try again in a moment!",
            "The divine servers are overloaded. Please wait and try again!",
            "My heavenly WiFi is acting up. Give it a moment and try again!"
        ];
        
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        addGodMessage(randomError);
    }
}

// Function to get God's mysterious divine response
async function getDivineResponse(query) {
    // God's mysterious response system using the Giphy API
    // Search for GIFs based on the user's message
    
    try {
        // Use Giphy search API to find relevant GIFs
        const gifUrl = await searchGiphyAPI(query);
        return gifUrl;
    } catch (error) {
        console.error('Error searching Giphy:', error);
        return null;
    }
}

// Function to search Giphy API for real GIFs
async function searchGiphyAPI(searchTerm) {
    // Get API key from configuration
    const GIPHY_API_KEY = config.giphyApiKey;
    
    try {
        // Search Giphy for GIFs matching the search term
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=10&rating=g`);
        
        if (!response.ok) {
            throw new Error(`Giphy API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            // Return the first (top) GIF from the search results
            return data.data[0].images.original.url;
        } else {
            // No GIFs found, return null to trigger fallback message
            return null;
        }
    } catch (error) {
        console.error('Giphy API request failed:', error);
        return null;
    }
}

// Function to activate TempleOS mode with 32 random phrases from Happy.TXT
function activateTempleOSMode() {
    // Use imported phrases from phrases.js (originally from Happy.TXT)
    // No need to redefine the array - it's imported from the module
    
    // Generate 32 random phrases from the imported array (total: ${totalPhrases} phrases)
    let response = '';
    for (let i = 0; i < 32; i++) {
        const randomPhrase = templePhrases[Math.floor(Math.random() * templePhrases.length)];
        const lineNumber = (i + 1).toString().padStart(2, '0');
        response += `<div style="color: #00FF00;">> [${lineNumber}] ${randomPhrase}</div>`;
    }
    
    return response;
}

// Function to get TempleOS God response (only phrases, no Giphy)
function getTempleOSResponse(userMessage) {
    // TempleOS God always responds with exactly 32 phrases for authenticity
    // This matches the original TempleOS behavior
    
    let response = '';
    for (let i = 0; i < 32; i++) {
        const randomPhrase = templePhrases[Math.floor(Math.random() * templePhrases.length)];
        const lineNumber = (i + 1).toString().padStart(2, '0');
        response += `<div style="color: #00FF00;">> [${lineNumber}] ${randomPhrase}</div>`;
    }
    
    return response;
}

// Fallback function for when Giphy API is not available
function getPlaceholderGif(searchTerm) {
    // Analyze the search term to provide contextually appropriate placeholder GIFs
    const lowerQuery = searchTerm.toLowerCase();
    
    // Define response categories based on message content
    let responseCategory = 'general';
    
    if (lowerQuery.includes('happy') || lowerQuery.includes('joy') || lowerQuery.includes('smile') || lowerQuery.includes('good')) {
        responseCategory = 'happy';
    } else if (lowerQuery.includes('sad') || lowerQuery.includes('cry') || lowerQuery.includes('bad') || lowerQuery.includes('help')) {
        responseCategory = 'sad';
    } else if (lowerQuery.includes('angry') || lowerQuery.includes('mad') || lowerQuery.includes('furious')) {
        responseCategory = 'angry';
    } else if (lowerQuery.includes('love') || lowerQuery.includes('heart') || lowerQuery.includes('romance')) {
        responseCategory = 'love';
    } else if (lowerQuery.includes('food') || lowerQuery.includes('eat') || lowerQuery.includes('hungry') || lowerQuery.includes('soda')) {
        responseCategory = 'food';
    } else if (lowerQuery.includes('work') || lowerQuery.includes('job') || lowerQuery.includes('busy')) {
        responseCategory = 'work';
    } else if (lowerQuery.includes('sleep') || lowerQuery.includes('tired') || lowerQuery.includes('bed')) {
        responseCategory = 'sleep';
    } else if (lowerQuery.includes('music') || lowerQuery.includes('dance') || lowerQuery.includes('sing')) {
        responseCategory = 'music';
    } else if (lowerQuery.includes('sport') || lowerQuery.includes('game') || lowerQuery.includes('play')) {
        responseCategory = 'sport';
    } else if (lowerQuery.includes('money') || lowerQuery.includes('rich') || lowerQuery.includes('poor')) {
        responseCategory = 'money';
    }
    
    // Placeholder GIFs for different categories
    const placeholderGifs = {
        happy: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        sad: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        angry: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        love: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        food: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        work: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        sleep: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        music: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        sport: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        money: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ],
        general: [
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/26ufcVAJHVlxvx8KI/giphy.gif'
        ]
    };
    
    const responses = placeholderGifs[responseCategory] || placeholderGifs.general;
    return responses[Math.floor(Math.random() * responses.length)];
}

// Add keyboard support for chat input
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Make all other functions globally available for HTML onclick attributes
window.sodaClick = sodaClick;
window.levelUp = levelUp;
window.checkLevelUp = checkLevelUp;
window.buyStraw = buyStraw;
window.upgradeStraw = upgradeStraw;
window.buyCup = buyCup;
window.upgradeCup = upgradeCup;
window.buySuction = buySuction;
window.upgradeSuction = upgradeSuction;
    window.buyFasterDrinks = buyFasterDrinks;
    window.upgradeFasterDrinks = upgradeFasterDrinks;
    window.buyCriticalClick = buyCriticalClick;
    window.upgradeCriticalClick = upgradeCriticalClick;
    window.save = save;
    window.delete_save = delete_save;
    window.sendMessage = sendMessage;

// Music Player Functions
function initMusicPlayer() {
    const musicPlayer = document.querySelector('.music-player');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const musicMuteBtn = document.getElementById('musicMuteBtn');
    const musicStatus = document.getElementById('musicStatus');
    
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
        streamInfo: {}
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
        musicStatus.textContent = 'Stream unavailable - trying alternative...';
        loadFallbackMusic();
    });
    
    audio.addEventListener('loadstart', () => {
        musicStatus.textContent = 'Loading stream...';
    });
    
    audio.addEventListener('canplay', () => {
        musicStatus.textContent = 'Click to start music';
        // Only update stream info when stream actually changes
        updateStreamInfo();
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
    
    // StarCraft OST streams (using SomaFM streams for now)
    // These will be handled by the UI display names, not by URL detection
    
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
    const musicPlayerTitle = document.querySelector('.music-player-title');
    const musicPlayerSubtitle = document.querySelector('.music-player-subtitle');
    
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
    const musicPlayer = document.querySelector('.music-player');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const musicMuteBtn = document.getElementById('musicMuteBtn');
    
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
    // StarCraft OST Tracks (Race-Based Alternatives)
    starcraft_terran: {
        url: 'https://ia800504.us.archive.org/12/items/sc-teamliquid-edited/(edited%20remastered%20OST)%20StarCraft%201%20--%20Terran%201.mp3',
        name: 'StarCraft - Terran Theme',
        description: 'Epic Terran battle music from the original game'
    },
    starcraft_zerg: {
        url: 'https://ia800504.us.archive.org/12/items/sc-teamliquid-edited/(edited%20remastered%20OST)%20StarCraft%201%20--%20Zerg%201.mp3',
        name: 'StarCraft - Zerg Theme',
        description: 'Dark Zerg swarm music from the original game'
    },
    starcraft_protoss: {
        url: 'https://ia800504.us.archive.org/12/items/sc-teamliquid-edited/(edited%20remastered%20OST)%20StarCraft%201%20--%20Protoss%201.mp3',
        name: 'StarCraft - Protoss Theme',
        description: 'Mystical Protoss music from the original game'
    },
    starcraft_broodwar: {
        url: 'https://ia800504.us.archive.org/12/items/sc-teamliquid-edited/(edited%20remastered%20OST)%20StarCraft%201%20--%20Protoss%202.mp3',
        name: 'StarCraft - Brood War Theme',
        description: 'Expansion pack music from Brood War'
    },
    // Legacy StarCraft Options (Using SomaFM as fallback)
    starcraft1: {
        url: 'https://ice1.somafm.com/groovesalad-128-mp3', // Using Groove Salad as Terran Theme
        name: 'StarCraft - Terran Theme (SomaFM)',
        description: 'Epic Terran battle music (SomaFM alternative)'
    },
    starcraft2: {
        url: 'https://ice1.somafm.com/defcon-128-mp3', // Using DEF CON as Zerg Theme
        name: 'StarCraft - Zerg Theme (SomaFM)',
        description: 'Dark Zerg swarm music (SomaFM alternative)'
    },
    starcraft3: {
        url: 'https://ice1.somafm.com/dronezone-128-mp3', // Using Drone Zone as Protoss Theme
        name: 'StarCraft - Protoss Theme (SomaFM)',
        description: 'Mystical Protoss music (SomaFM alternative)'
    },
    starcraft4: {
        url: 'https://ice1.somafm.com/illstreet-128-mp3', // Using Ill Street as Brood War Theme
        name: 'StarCraft - Brood War Theme (SomaFM)',
        description: 'Expansion pack music (SomaFM alternative)'
    }
};

// Function to change music stream
function changeMusicStream() {
    const streamSelect = document.getElementById('musicStreamSelect');
    const currentStreamInfo = document.getElementById('currentStreamInfo');
    
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
    
    // Store current playing state
    const wasPlaying = state.isPlaying;
    
    // Change the stream
    state.audio.src = streamData.url;
    state.currentStream = streamData.url;
    
    // Update the stream info display
    currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
    
    // Update music player display with custom stream info for StarCraft themes
    if (selectedStream.startsWith('starcraft')) {
        const customStreamInfo = {
            name: streamData.name,
            description: streamData.description,
            genre: 'Game OST',
            quality: '128k MP3',
            location: 'Blizzard Entertainment',
            type: 'StarCraft Soundtrack'
        };
        updateMusicPlayerDisplay(customStreamInfo);
        // Update the music player state with custom info
        if (state.streamInfo) {
            state.streamInfo = customStreamInfo;
        }
    } else {
        updateStreamInfo();
    }
    
    // If it was playing, try to continue playing
    if (wasPlaying) {
        const playPromise = state.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                state.isPlaying = true;
                updateMusicPlayerUI();
            }).catch(error => {
                console.log('Failed to play new stream:', error);
                state.isPlaying = false;
                musicStatus.textContent = 'Click to start music';
                updateMusicPlayerUI();
            });
        }
    }
    
    // Save the stream preference
    const streamPreferences = JSON.parse(localStorage.getItem('musicStreamPreferences') || '{}');
    streamPreferences.selectedStream = selectedStream;
    localStorage.setItem('musicStreamPreferences', JSON.stringify(streamPreferences));
    
    console.log('Music stream changed to:', streamData.name);
}

// Function to load saved stream preference
function loadSavedStreamPreference() {
    const streamSelect = document.getElementById('musicStreamSelect');
    const currentStreamInfo = document.getElementById('currentStreamInfo');
    
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
            currentStreamInfo.textContent = `Current: ${streamData.name} - ${streamData.description}`;
            
            // Update the music player to use the saved stream
            const state = window.musicPlayerState;
            if (state && state.audio) {
                state.audio.src = streamData.url;
                state.currentStream = streamData.url;
                
                // Handle custom stream info for StarCraft themes
                if (savedStream.startsWith('starcraft')) {
                    const customStreamInfo = {
                        name: streamData.name,
                        description: streamData.description,
                        genre: 'Game OST',
                        quality: '128k MP3',
                        location: 'Blizzard Entertainment',
                        type: 'StarCraft Soundtrack'
                    };
                    updateMusicPlayerDisplay(customStreamInfo);
                    if (state.streamInfo) {
                        state.streamInfo = customStreamInfo;
                    }
                } else {
                    updateStreamInfo();
                }
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
    if (state && state.audio) {
        const randomSource = fallbackSources[Math.floor(Math.random() * fallbackSources.length)];
        console.log('Trying fallback source:', randomSource);
        state.audio.src = randomSource;
        musicStatus.textContent = 'Trying alternative source...';
        
        // Try to play the new source
        const playPromise = state.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                state.isPlaying = true;
                // Only update stream info when switching to fallback source
                updateStreamInfo();
                updateMusicPlayerUI();
            }).catch(error => {
                console.log('Fallback source also failed:', error);
                musicStatus.textContent = 'Click to start music';
            });
        }
    }
}

// Make all other functions globally available to prevent undefined errors
window.updateAllStats = updateAllStats;
window.updateDrinkRate = updateDrinkRate;
window.updateDrinkSpeedDisplay = updateDrinkSpeedDisplay;
window.updateProminentStats = updateProminentStats;
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
window.getDivineResponse = getDivineResponse;
window.searchGiphyAPI = searchGiphyAPI;
window.getPlaceholderGif = getPlaceholderGif;
window.toggleAutosave = toggleAutosave;
window.changeAutosaveInterval = changeAutosaveInterval;
window.getGodResponse = getGodResponse;
window.initMusicPlayer = initMusicPlayer;
window.toggleMusic = toggleMusic;
window.toggleMute = toggleMute;
window.updateStreamInfo = updateStreamInfo;
window.getStreamDetails = getStreamDetails;
window.activateTempleOSMode = activateTempleOSMode;
window.getTempleOSResponse = getTempleOSResponse;
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
    
    const streamSelect = document.getElementById('musicStreamSelect');
    const currentStreamInfo = document.getElementById('currentStreamInfo');
    
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

// Test function for StarCraft OST streams
window.testStarCraftOST = function() {
    console.log('=== STARCRAFT OST STREAMS TEST ===');
    
    const state = window.musicPlayerState;
    if (!state || !state.audio) {
        console.log('Music player not initialized');
        return;
    }
    
    console.log('Testing StarCraft OST streams...');
    
    // Test each StarCraft OST stream
    const ostStreams = ['starcraft_terran', 'starcraft_zerg', 'starcraft_protoss', 'starcraft_broodwar'];
    
    ostStreams.forEach((streamKey, index) => {
        setTimeout(() => {
            console.log(`Testing ${streamKey}...`);
            const streamData = MUSIC_STREAMS[streamKey];
            if (streamData) {
                console.log(`Stream data:`, streamData);
                // Test if the URL is accessible
                const testAudio = new Audio();
                testAudio.src = streamData.url;
                testAudio.addEventListener('loadstart', () => console.log(`${streamKey}: Load started`));
                testAudio.addEventListener('canplay', () => console.log(`${streamKey}: Can play`));
                testAudio.addEventListener('error', (e) => console.log(`${streamKey}: Error -`, e));
            } else {
                console.log(`Stream ${streamKey} not found in MUSIC_STREAMS`);
            }
        }, index * 1000); // Test each stream 1 second apart
    });
    
    console.log('StarCraft OST test complete! Check console for results.');
};

// Test function for stream switching
window.testStreamSwitching = function() {
    console.log('=== STREAM SWITCHING TEST ===');
    
    const streamSelect = document.getElementById('musicStreamSelect');
    if (!streamSelect) {
        console.log('Stream select element not found');
        return;
    }
    
    console.log('Testing stream switching...');
    
    // Test switching to different stream types
    const testStreams = ['groovesalad', 'starcraft_terran', 'defcon', 'starcraft_zerg'];
    
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
