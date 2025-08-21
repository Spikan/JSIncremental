// UI System Coordinator
// Main entry point for all UI-related functionality

import * as displays from './displays.js';
import * as stats from './stats.js';
import * as feedback from './feedback.js';
import * as affordability from './affordability.js';
import * as labels from './labels.js';

// Export all UI modules
export { displays, stats, feedback, affordability };
export { labels };

// Convenience functions that delegate to specific modules
export const updateCostDisplay = displays.updateCostDisplay;
export const updateButtonState = displays.updateButtonState;
export const updateTopSipsPerDrink = displays.updateTopSipsPerDrink;
export const updateTopSipsPerSecond = displays.updateTopSipsPerSecond;
export const updateCriticalClickDisplay = displays.updateCriticalClickDisplay;
export const updateDrinkSpeedDisplay = displays.updateDrinkSpeedDisplay;
export const updateAutosaveStatus = displays.updateAutosaveStatus;
export const updateDrinkProgress = displays.updateDrinkProgress;
export const updateTopSipCounter = displays.updateTopSipCounter;
export const updateLevelNumber = displays.updateLevelNumber;
export const updateLevelText = displays.updateLevelText;

export const updatePlayTime = stats.updatePlayTime;
export const updateLastSaveTime = stats.updateLastSaveTime;
export const updateAllStats = stats.updateAllStats;
export const updateTimeStats = stats.updateTimeStats;
export const updateClickStats = stats.updateClickStats;
export const updateEconomyStats = stats.updateEconomyStats;
export const updateShopStats = stats.updateShopStats;
export const updateAchievementStats = stats.updateAchievementStats;

export const showClickFeedback = feedback.showClickFeedback;
export const showPurchaseFeedback = feedback.showPurchaseFeedback;
export const showLevelUpFeedback = feedback.showLevelUpFeedback;
export const showOfflineProgress = feedback.showOfflineProgress;

export const checkUpgradeAffordability = affordability.checkUpgradeAffordability;

// Labels
export const updateClickSoundsToggleText = labels.updateClickSoundsToggleText;
export const updateCountdownText = labels.updateCountdownText;
export const setMusicStatusText = labels.setMusicStatusText;

// Initialize UI event listeners
export function initializeUI() {
    console.log('UI system initialized');
    
    // Set up event listeners for UI updates
    if (window.App?.events) {
        // Listen for game events and update UI accordingly
        window.App.events.on(window.App.EVENT_NAMES?.CLICK?.SODA, (data) => {
            // Only update UI if game is ready
            if (window.sips && typeof window.sips.gte === 'function') {
                updateTopSipsPerDrink();
                updateTopSipsPerSecond();
                updateTopSipCounter();
                checkUpgradeAffordability();
                if (data.gained) {
                    showClickFeedback(data.gained, data.critical);
                }
            }
        });
        
        window.App.events.on(window.App.EVENT_NAMES?.ECONOMY?.PURCHASE, (data) => {
            // Only update UI if game is ready
            if (window.sips && typeof window.sips.gte === 'function') {
                updateTopSipsPerDrink();
                updateTopSipsPerSecond();
                updateTopSipCounter();
                checkUpgradeAffordability();
                updateCriticalClickDisplay();
                if (data.item && data.cost) {
                    showPurchaseFeedback(data.item, data.cost);
                }
            }
        });
        
        window.App.events.on(window.App.EVENT_NAMES?.GAME?.SAVED, () => {
            updateLastSaveTime();
        });
        
        window.App.events.on(window.App.EVENT_NAMES?.GAME?.LOADED, () => {
            // Wait a bit for game state to be fully initialized
            setTimeout(() => {
                updateAllDisplays();
                checkUpgradeAffordability();
            }, 100);
        });
    }
}

// Update all UI displays (useful for initialization and major state changes)
export function updateAllDisplays() {
    updateTopSipsPerDrink();
    updateTopSipsPerSecond();
    updateTopSipCounter();
    updateCriticalClickDisplay();
    updateDrinkSpeedDisplay();
    updateAutosaveStatus();
    updatePlayTime();
    updateLastSaveTime();
    updateAllStats();
    checkUpgradeAffordability();
}

// Batch UI updates for performance (use in game loop)
export function performBatchUIUpdate() {
    // Only update visible elements to improve performance
    requestAnimationFrame(() => {
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();
        updateTopSipCounter();
        updatePlayTime();
        
        // Only update stats if stats tab is active
        if (window.DOM_CACHE?.statsTab?.classList?.contains('active')) {
            updateAllStats();
        }
        
        // Update affordability less frequently
        if (Math.random() < 0.1) { // 10% chance per frame
            checkUpgradeAffordability();
        }
    });
}
