// UI Statistics Updates
// Handles all statistics display updates for different tabs and categories

// Import consolidated utilities
import { formatNumber } from './utils.js';

// Update play time display
export function updatePlayTime() {
    if (typeof window === 'undefined') return;
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
        const totalMs = Number(window.App?.state?.getState?.()?.totalPlayTime || 0);
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
        const start = Number(window.App?.state?.getState?.()?.sessionStartTime || 0);
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
        const clicks = Number(window.App?.state?.getState?.()?.totalClicks || 0);
        totalClicksElement.textContent = formatNumber(clicks);
    }
    
    // Critical clicks
    const criticalClicksElement = window.DOM_CACHE?.criticalClicksStats;
    if (criticalClicksElement) {
        const crit = Number(window.App?.state?.getState?.()?.criticalClicks || 0);
        criticalClicksElement.textContent = formatNumber(crit);
    }
    
    // Click streak
    const clickStreakElement = window.DOM_CACHE?.clickStreak;
    if (clickStreakElement) {
        const st = window.App?.state?.getState?.() || {};
        clickStreakElement.textContent = String(Number(st.currentClickStreak || 0));
    }
    
    // Best click streak
    const bestClickStreakElement = window.DOM_CACHE?.bestClickStreak;
    if (bestClickStreakElement) {
        const st = window.App?.state?.getState?.() || {};
        bestClickStreakElement.textContent = String(Number(st.bestClickStreak || 0));
    }
}

// Update economy-related statistics
export function updateEconomyStats() {
    // Total sips earned
    const totalSipsEarnedElement = window.DOM_CACHE?.totalSipsEarned;
    if (totalSipsEarnedElement) {
        const total = Number(window.App?.state?.getState?.()?.totalSipsEarned || 0);
        totalSipsEarnedElement.textContent = formatNumber(total);
    }
    
    // Highest sips per second
    const highestSipsPerSecondElement = window.DOM_CACHE?.highestSipsPerSecond;
    if (highestSipsPerSecondElement) {
        const high = Number(window.App?.state?.getState?.()?.highestSipsPerSecond || 0);
        highestSipsPerSecondElement.textContent = formatNumber(high);
    }
}

// Update shop-related statistics
export function updateShopStats() {
    // Straws purchased
    const strawsPurchasedElement = window.DOM_CACHE?.strawsPurchased;
    if (strawsPurchasedElement) {
        const v = Number(window.App?.state?.getState?.()?.straws || 0);
        strawsPurchasedElement.textContent = formatNumber(v);
    }
    
    // Cups purchased
    const cupsPurchasedElement = window.DOM_CACHE?.cupsPurchased;
    if (cupsPurchasedElement) {
        const v = Number(window.App?.state?.getState?.()?.cups || 0);
        cupsPurchasedElement.textContent = formatNumber(v);
    }
    
    // Suctions purchased
    const suctionsPurchasedElement = window.DOM_CACHE?.suctionsPurchased;
    if (suctionsPurchasedElement) {
        const v = Number(window.App?.state?.getState?.()?.suctions || 0);
        suctionsPurchasedElement.textContent = formatNumber(v);
    }
    
    // Critical clicks purchased
    const criticalClicksPurchasedElement = window.DOM_CACHE?.criticalClicksPurchased;
    if (criticalClicksPurchasedElement) {
        const v = Number(window.App?.state?.getState?.()?.criticalClicks || 0);
        criticalClicksPurchasedElement.textContent = formatNumber(v);
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
        const level = Number(window.App?.state?.getState?.()?.level || 1);
        currentLevelElement.textContent = String(level);
    }
    
    // Total upgrades (sum of all upgrade counters)
    const totalUpgradesElement = window.DOM_CACHE?.totalUpgrades;
    if (totalUpgradesElement) {
        const st = window.App?.state?.getState?.() || {};
        const widerStraws = Number(st.widerStraws || 0);
        const betterCups = Number(st.betterCups || 0);
        const suctionUpCounter = Number(st.suctionUpCounter || 0);
        const fasterDrinksUpCounter = Number(st.fasterDrinksUpCounter || 0);
        const criticalClickUpCounter = Number(st.criticalClickUpCounter || 0);
        
        const totalUpgrades = widerStraws + betterCups + suctionUpCounter + fasterDrinksUpCounter + criticalClickUpCounter;
        totalUpgradesElement.textContent = formatNumber(totalUpgrades);
    }
    
    // Faster drinks owned
    const fasterDrinksOwnedElement = window.DOM_CACHE?.fasterDrinksOwned;
    if (fasterDrinksOwnedElement) {
        const owned = Number(window.App?.state?.getState?.()?.fasterDrinks || 0);
        fasterDrinksOwnedElement.textContent = formatNumber(owned);
    }
}
