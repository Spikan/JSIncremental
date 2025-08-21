// DOM Cache - Centralized DOM element management for Soda Clicker Pro
// This file manages all cached DOM element references for better performance and maintainability

const DOM_CACHE = {
    // Game elements
    levelNumber: null,
    levelText: null,
    sodaButton: null,
    topSipValue: null,
    topSipsPerDrink: null,
    topSipsPerSecond: null,

    // Music player elements
    musicPlayer: null,
    musicToggleBtn: null,
    musicMuteBtn: null,
    musicStatus: null,
    musicStreamSelect: null,
    currentStreamInfo: null,

    // Shop elements
    shopDiv: null,
    widerStraws: null,
    betterCups: null,
    widerStrawsSPD: null,
    betterCupsSPD: null,
    totalWiderStrawsSPD: null,
    totalBetterCupsSPD: null,

    // Stats elements
    statsTab: null,

    // Progress elements
    drinkProgressFill: null,
    drinkCountdown: null,

    // Additional elements that are frequently accessed
    playTime: null,
    lastSaveTime: null,
    totalPlayTime: null,
    sessionTime: null,
    daysSinceStart: null,
    totalClicks: null,
    clicksPerSecond: null,
    bestClickStreak: null,
    totalSipsEarned: null,
    currentSipsPerSecond: null,
    highestSipsPerSecond: null,
    strawsPurchased: null,
    cupsPurchased: null,
    widerStrawsPurchased: null,
    betterCupsPurchased: null,
    suctionsPurchased: null,
    criticalClicksPurchased: null,
    currentLevel: null,
    totalUpgrades: null,
    fasterDrinksOwned: null,
    levelUpDiv: null,

    // Initialize all cached elements
    init: function() {
        console.log('Initializing DOM cache...');

        // Core game elements
        this.levelNumber = document.getElementById('levelNumber');
        this.levelText = document.getElementById('levelText');
        this.sodaButton = document.getElementById('sodaButton');
        this.topSipValue = document.getElementById('topSipValue');
        this.topSipsPerDrink = document.getElementById('topSipsPerDrink');
        this.topSipsPerSecond = document.getElementById('topSipsPerSecond');

        // Music player elements
        this.musicPlayer = document.querySelector('.music-player');
        this.musicToggleBtn = document.getElementById('musicToggleBtn');
        this.musicMuteBtn = document.getElementById('musicMuteBtn');
        this.musicStatus = document.getElementById('musicStatus');
        this.musicStreamSelect = document.getElementById('musicStreamSelect');
        this.currentStreamInfo = document.getElementById('currentStreamInfo');

        // Shop elements
        this.shopDiv = document.getElementById('shopDiv');
        this.widerStraws = document.getElementById('widerStraws');
        this.betterCups = document.getElementById('betterCups');
        this.widerStrawsSPD = document.getElementById('widerStrawsSPD');
        this.betterCupsSPD = document.getElementById('betterCupsSPD');
        this.totalWiderStrawsSPD = document.getElementById('totalWiderStrawsSPD');
        this.totalBetterCupsSPD = document.getElementById('totalBetterCupsSPD');

        // Stats elements
        this.statsTab = document.getElementById('statsTab');

        // Progress elements
        this.drinkProgressFill = document.getElementById('drinkProgressFill');
        this.drinkCountdown = document.getElementById('drinkCountdown');

        // Additional frequently accessed elements
        this.playTime = document.getElementById('playTime');
        this.lastSaveTime = document.getElementById('lastSaveTime');
        this.totalPlayTime = document.getElementById('totalPlayTime');
        this.sessionTime = document.getElementById('sessionTime');
        this.daysSinceStart = document.getElementById('daysSinceStart');
        this.totalClicks = document.getElementById('totalClicks');
        this.clicksPerSecond = document.getElementById('clicksPerSecond');
        this.bestClickStreak = document.getElementById('bestClickStreak');
        this.totalSipsEarned = document.getElementById('totalSipsEarned');
        this.currentSipsPerSecond = document.getElementById('currentSipsPerSecond');
        this.highestSipsPerSecond = document.getElementById('highestSipsPerSecond');
        this.strawsPurchased = document.getElementById('strawsPurchased');
        this.cupsPurchased = document.getElementById('cupsPurchased');
        this.widerStrawsPurchased = document.getElementById('widerStrawsPurchased');
        this.betterCupsPurchased = document.getElementById('betterCupsPurchased');
        this.suctionsPurchased = document.getElementById('suctionsPurchased');
        this.criticalClicksPurchased = document.getElementById('criticalClicksPurchased');
        this.currentLevel = document.getElementById('currentLevel');
        this.totalUpgrades = document.getElementById('totalUpgrades');
        this.fasterDrinksOwned = document.getElementById('fasterDrinksOwned');
        this.levelUpDiv = document.getElementById('levelUpDiv');

        console.log('DOM cache initialized successfully');
    },

    // Utility method to get an element by ID if it's not already cached
    get: function(id) {
        return document.getElementById(id);
    },

    // Utility method to check if all critical elements are loaded
    isReady: function() {
        return !!(this.sodaButton && this.musicPlayer && this.shopDiv);
    }
};

// Expose DOM cache to window for module access
window.DOM_CACHE = DOM_CACHE;

// Auto-initialize when DOM is ready if not already initialized
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded - initializing DOM_CACHE');
        if (!DOM_CACHE.isReady()) {
            DOM_CACHE.init();
        }
    });
} else {
    // DOM already loaded
    console.log('DOM already loaded - initializing DOM_CACHE');
    if (!DOM_CACHE.isReady()) {
        DOM_CACHE.init();
    }
}
