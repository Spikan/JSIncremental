// UI System Coordinator
// Main entry point for all UI-related functionality

import * as displays from './displays';
import * as stats from './stats.js';
import * as feedback from './feedback.js';
import * as affordability from './affordability';
import * as labels from './labels.js';
import * as utils from './utils';
import * as buttons from './buttons';

// Export all UI modules
export { displays, stats, feedback, affordability, buttons };
export { labels };

// Convenience functions using consolidated utilities
export const updateCostDisplay = utils.updateCostDisplay;
export const updateButtonState = utils.updateButtonState;
export const updateTopSipsPerDrink = displays.updateTopSipsPerDrink;
export const updateTopSipsPerSecond = displays.updateTopSipsPerSecond;
export const updateCriticalClickDisplay = displays.updateCriticalClickDisplay;
export const updateDrinkSpeedDisplay = displays.updateDrinkSpeedDisplay;
export const updateAutosaveStatus = displays.updateAutosaveStatus;
export const updateDrinkProgress = displays.updateDrinkProgress;
export const updateTopSipCounter = displays.updateTopSipCounter;
export const updateLevelNumber = displays.updateLevelNumber;
export const updateLevelText = displays.updateLevelText;
export const updateDrinkRate = displays.updateDrinkRate;
export const updateCompactDrinkSpeedDisplays = displays.updateCompactDrinkSpeedDisplays;

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
export const updateShopButtonStates = affordability.updateShopButtonStates;

// Labels
export const updateClickSoundsToggleText = labels.updateClickSoundsToggleText;
export const updateCountdownText = labels.updateCountdownText;
export const setMusicStatusText = labels.setMusicStatusText;

// Initialize UI event listeners
export function initializeUI(): void {
    console.log('UI system initialized');
    buttons.initButtonSystem();
    if ((window as any).App?.events) {
        (window as any).App.events.on((window as any).App.EVENT_NAMES?.CLICK?.SODA, (data: any) => {
            updateTopSipsPerDrink();
            updateTopSipsPerSecond();
            updateTopSipCounter();
            checkUpgradeAffordability();
            if (data && typeof data.gained === 'number') {
                showClickFeedback(data.gained, data.critical, data.clickX, data.clickY);
            }
        });
        (window as any).App.events.on((window as any).App.EVENT_NAMES?.ECONOMY?.PURCHASE, (data: any) => {
            updateTopSipsPerDrink();
            updateTopSipsPerSecond();
            updateTopSipCounter();
            checkUpgradeAffordability();
            updateCriticalClickDisplay();
            if (data && data.item && data.cost && typeof data.clickX === 'number' && typeof data.clickY === 'number') {
                showPurchaseFeedback(data.item, data.cost, data.clickX, data.clickY);
            }
        });
        (window as any).App.events.on((window as any).App.EVENT_NAMES?.GAME?.SAVED, () => {
            updateLastSaveTime();
        });
        (window as any).App.events.on((window as any).App.EVENT_NAMES?.GAME?.LOADED, () => {
            setTimeout(() => {
                updateAllDisplays();
                checkUpgradeAffordability();
            }, 100);
        });
    }
}

// Update all UI displays (useful for initialization and major state changes)
export function updateAllDisplays(): void {
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
export function performBatchUIUpdate(): void {
    requestAnimationFrame(() => {
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();
        updateTopSipCounter();
        updatePlayTime();
        if (typeof window !== 'undefined' && (window as any).DOM_CACHE?.statsTab?.classList?.contains('active')) {
            updateAllStats();
        }
        if (Math.random() < 0.1) {
            checkUpgradeAffordability();
        }
    });
}
