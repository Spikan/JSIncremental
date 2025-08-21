// UI Statistics Updates
// Handles all statistics display updates for different tabs and categories

// Update play time display
export function updatePlayTime() {
    const playTimeElement = window.DOM_CACHE?.playTime;
    if (playTimeElement && window.totalPlayTime !== undefined) {
        const totalSeconds = Math.floor(window.totalPlayTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            playTimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            playTimeElement.textContent = `${minutes}m ${seconds}s`;
        } else {
            playTimeElement.textContent = `${seconds}s`;
        }
    }
}

// Update last save time display
export function updateLastSaveTime() {
    const lastSaveElement = window.DOM_CACHE?.lastSaveTime;
    if (lastSaveElement && window.lastSaveTime) {
        const now = new Date();
        const lastSave = new Date(window.lastSaveTime);
        const diffSeconds = Math.floor((now - lastSave) / 1000);
        
        if (diffSeconds < 60) {
            lastSaveElement.textContent = `${diffSeconds}s ago`;
        } else if (diffSeconds < 3600) {
            const minutes = Math.floor(diffSeconds / 60);
            lastSaveElement.textContent = `${minutes}m ago`;
        } else {
            const hours = Math.floor(diffSeconds / 3600);
            lastSaveElement.textContent = `${hours}h ago`;
        }
    }
}

// Update all statistics (main coordinator function)
export function updateAllStats() {
    // Only update stats if the stats tab is active and elements exist
    if (window.DOM_CACHE?.statsTab?.classList?.contains('active')) {
        updateTimeStats();
        updateClickStats();
        updateEconomyStats();
        updateShopStats();
        updateAchievementStats();
    }
}

// Update time-related statistics
export function updateTimeStats() {
    // Total play time (including previous sessions)
    const totalPlayTimeElement = window.DOM_CACHE?.totalPlayTime;
    if (totalPlayTimeElement && window.totalPlayTime !== undefined) {
        const totalSeconds = Math.floor(window.totalPlayTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            totalPlayTimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            totalPlayTimeElement.textContent = `${minutes}m ${seconds}s`;
        } else {
            totalPlayTimeElement.textContent = `${seconds}s`;
        }
    }
    
    // Current session time
    const sessionTimeElement = window.DOM_CACHE?.sessionTime;
    if (sessionTimeElement && window.sessionStartTime) {
        const sessionTime = Date.now() - window.sessionStartTime;
        const sessionSeconds = Math.floor(sessionTime / 1000);
        const hours = Math.floor(sessionSeconds / 3600);
        const minutes = Math.floor((sessionSeconds % 3600) / 60);
        const seconds = sessionSeconds % 60;
        
        if (hours > 0) {
            sessionTimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            sessionTimeElement.textContent = `${minutes}m ${seconds}s`;
        } else {
            sessionTimeElement.textContent = `${seconds}s`;
        }
    }
}

// Update click-related statistics
export function updateClickStats() {
    // Total clicks
    const totalClicksElement = window.DOM_CACHE?.totalClicks;
    if (totalClicksElement && window.totalClicks !== undefined) {
        totalClicksElement.textContent = prettify(window.totalClicks);
    }
    
    // Critical clicks
    const criticalClicksElement = window.DOM_CACHE?.criticalClicksStats;
    if (criticalClicksElement && window.criticalClicks) {
        criticalClicksElement.textContent = prettify(window.criticalClicks);
    }
    
    // Click streak
    const clickStreakElement = window.DOM_CACHE?.clickStreak;
    if (clickStreakElement && window.currentClickStreak !== undefined) {
        clickStreakElement.textContent = window.currentClickStreak.toString();
    }
    
    // Best click streak
    const bestClickStreakElement = window.DOM_CACHE?.bestClickStreak;
    if (bestClickStreakElement && window.bestClickStreak !== undefined) {
        bestClickStreakElement.textContent = window.bestClickStreak.toString();
    }
}

// Update economy-related statistics
export function updateEconomyStats() {
    // Total sips earned
    const totalSipsEarnedElement = window.DOM_CACHE?.totalSipsEarned;
    if (totalSipsEarnedElement && window.totalSipsEarned) {
        totalSipsEarnedElement.textContent = prettify(window.totalSipsEarned);
    }
    
    // Highest sips per second
    const highestSipsPerSecondElement = window.DOM_CACHE?.highestSipsPerSecond;
    if (highestSipsPerSecondElement && window.highestSipsPerSecond) {
        highestSipsPerSecondElement.textContent = prettify(window.highestSipsPerSecond);
    }
}

// Update shop-related statistics
export function updateShopStats() {
    // Straws purchased
    const strawsPurchasedElement = window.DOM_CACHE?.strawsPurchased;
    if (strawsPurchasedElement && window.straws) {
        strawsPurchasedElement.textContent = prettify(window.straws);
    }
    
    // Cups purchased
    const cupsPurchasedElement = window.DOM_CACHE?.cupsPurchased;
    if (cupsPurchasedElement && window.cups) {
        cupsPurchasedElement.textContent = prettify(window.cups);
    }
    
    // Suctions purchased
    const suctionsPurchasedElement = window.DOM_CACHE?.suctionsPurchased;
    if (suctionsPurchasedElement && window.suctions) {
        suctionsPurchasedElement.textContent = prettify(window.suctions);
    }
    
    // Critical clicks purchased
    const criticalClicksPurchasedElement = window.DOM_CACHE?.criticalClicksPurchased;
    if (criticalClicksPurchasedElement && window.criticalClicks) {
        criticalClicksPurchasedElement.textContent = prettify(window.criticalClicks);
    }
}

// Update achievement-related statistics
export function updateAchievementStats() {
    // Helper function to safely get number value
    const safeToNumber = (value) => {
        if (!value) return 0;
        if (typeof value.toNumber === 'function') return value.toNumber();
        if (typeof value === 'number') return value;
        return Number(value) || 0;
    };
    
    // Current level
    const currentLevelElement = window.DOM_CACHE?.currentLevel;
    if (currentLevelElement && window.level) {
        currentLevelElement.textContent = safeToNumber(window.level).toString();
    }
    
    // Total upgrades (sum of all upgrade counters)
    const totalUpgradesElement = window.DOM_CACHE?.totalUpgrades;
    if (totalUpgradesElement) {
        const widerStraws = safeToNumber(window.widerStraws);
        const betterCups = safeToNumber(window.betterCups);
        const suctionUpCounter = safeToNumber(window.suctionUpCounter);
        const fasterDrinksUpCounter = safeToNumber(window.fasterDrinksUpCounter);
        const criticalClickUpCounter = safeToNumber(window.criticalClickUpCounter);
        
        const totalUpgrades = widerStraws + betterCups + suctionUpCounter + fasterDrinksUpCounter + criticalClickUpCounter;
        totalUpgradesElement.textContent = prettify(totalUpgrades);
    }
    
    // Faster drinks owned
    const fasterDrinksOwnedElement = window.DOM_CACHE?.fasterDrinksOwned;
    if (fasterDrinksOwnedElement && window.fasterDrinks) {
        fasterDrinksOwnedElement.textContent = prettify(window.fasterDrinks);
    }
}
