// UI Statistics Updates
// Handles all statistics display updates for different tabs and categories

// Import consolidated utilities
import { formatNumber } from './utils.js';

// Update play time display
export function updatePlayTime() {
    const playTimeElement = window.DOM_CACHE?.playTime;
    try {
        const state = window.App?.state?.getState?.();
        if (playTimeElement && state) {
            const totalMs = Number(state.totalPlayTime || window.totalPlayTime || 0);
            const totalSeconds = Math.floor(totalMs / 1000);
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
    } catch {}
}

// Update last save time display
export function updateLastSaveTime() {
    const lastSaveElement = window.DOM_CACHE?.lastSaveTime;
    try {
        const lastSaveMs = Number(window.App?.state?.getState?.()?.lastSaveTime || window.lastSaveTime || 0);
        if (lastSaveElement && lastSaveMs) {
        const now = new Date();
        const lastSave = new Date(lastSaveMs);
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
    } catch {}
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
    if (totalPlayTimeElement) {
        const totalMs = Number(window.App?.state?.getState?.()?.totalPlayTime || window.totalPlayTime || 0);
        const totalSeconds = Math.floor(totalMs / 1000);
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
    if (sessionTimeElement) {
        const start = Number(window.App?.state?.getState?.()?.sessionStartTime || window.sessionStartTime || 0);
        if (start) {
        const sessionTime = Date.now() - start;
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
}

// Update click-related statistics
export function updateClickStats() {
    // Total clicks
    const totalClicksElement = window.DOM_CACHE?.totalClicks;
    if (totalClicksElement) {
        totalClicksElement.textContent = formatNumber(Number(window.totalClicks || 0));
    }
    
    // Critical clicks
    const criticalClicksElement = window.DOM_CACHE?.criticalClicksStats;
    if (criticalClicksElement) {
        criticalClicksElement.textContent = formatNumber(Number(window.criticalClicks || 0));
    }
    
    // Click streak
    const clickStreakElement = window.DOM_CACHE?.clickStreak;
    if (clickStreakElement) {
        clickStreakElement.textContent = String(Number(window.currentClickStreak || 0));
    }
    
    // Best click streak
    const bestClickStreakElement = window.DOM_CACHE?.bestClickStreak;
    if (bestClickStreakElement) {
        bestClickStreakElement.textContent = String(Number(window.bestClickStreak || 0));
    }
}

// Update economy-related statistics
export function updateEconomyStats() {
    // Total sips earned
    const totalSipsEarnedElement = window.DOM_CACHE?.totalSipsEarned;
    if (totalSipsEarnedElement) {
        totalSipsEarnedElement.textContent = formatNumber(Number(window.totalSipsEarned || 0));
    }
    
    // Highest sips per second
    const highestSipsPerSecondElement = window.DOM_CACHE?.highestSipsPerSecond;
    if (highestSipsPerSecondElement) {
        highestSipsPerSecondElement.textContent = formatNumber(Number(window.highestSipsPerSecond || 0));
    }
}

// Update shop-related statistics
export function updateShopStats() {
    // Straws purchased
    const strawsPurchasedElement = window.DOM_CACHE?.strawsPurchased;
    if (strawsPurchasedElement) {
        strawsPurchasedElement.textContent = formatNumber(Number(window.straws || 0));
    }
    
    // Cups purchased
    const cupsPurchasedElement = window.DOM_CACHE?.cupsPurchased;
    if (cupsPurchasedElement) {
        cupsPurchasedElement.textContent = formatNumber(Number(window.cups || 0));
    }
    
    // Suctions purchased
    const suctionsPurchasedElement = window.DOM_CACHE?.suctionsPurchased;
    if (suctionsPurchasedElement) {
        suctionsPurchasedElement.textContent = formatNumber(Number(window.suctions || 0));
    }
    
    // Critical clicks purchased
    const criticalClicksPurchasedElement = window.DOM_CACHE?.criticalClicksPurchased;
    if (criticalClicksPurchasedElement) {
        criticalClicksPurchasedElement.textContent = formatNumber(Number(window.criticalClicks || 0));
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
    if (currentLevelElement) {
        currentLevelElement.textContent = String(safeToNumber(window.level));
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
        totalUpgradesElement.textContent = formatNumber(totalUpgrades);
    }
    
    // Faster drinks owned
    const fasterDrinksOwnedElement = window.DOM_CACHE?.fasterDrinksOwned;
    if (fasterDrinksOwnedElement) {
        fasterDrinksOwnedElement.textContent = formatNumber(Number(window.fasterDrinks || 0));
    }
}
