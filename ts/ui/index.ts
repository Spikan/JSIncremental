// UI System Coordinator
// Main entry point for all UI-related functionality

import * as displays from './displays';
import * as stats from './stats';
import * as feedback from './feedback';
import * as affordability from './affordability';
import * as labels from './labels';
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
export const updatePurchasedCounts = stats.updatePurchasedCounts;

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
  // UI system initializing
  buttons.initButtonSystem();
  // Sync options UI on init
  try {
    updateAutosaveStatus();
  } catch (error) {
    console.warn('Failed to update autosave status on init:', error);
  }
  try {
    (window as any).App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.();
  } catch (error) {
    console.warn('Failed to update button sounds toggle on init:', error);
  }
  // Check event system availability

  if ((window as any).App?.events) {
    // Set up CLICK.SODA event listener
    (window as any).App.events.on((window as any).App.EVENT_NAMES?.CLICK?.SODA, (data: any) => {
      console.log('🔧 CLICK.SODA event received, updating displays');

      updateTopSipCounter();
      updateTopSipsPerDrink();
      updateTopSipsPerSecond();
      checkUpgradeAffordability();

      if (data && typeof data.gained === 'number') {
        showClickFeedback(data.gained, data.critical, data.clickX, data.clickY);
      }
    });
    (window as any).App.events.on(
      (window as any).App.EVENT_NAMES?.ECONOMY?.PURCHASE,
      (data: any) => {
        console.log('🔧 PURCHASE EVENT RECEIVED:', data);
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();
        updateTopSipCounter();
        checkUpgradeAffordability();
        updateCriticalClickDisplay();
        console.log('🔧 CALLING updatePurchasedCounts()');
        updatePurchasedCounts(); // Update shop owned counters
        if (
          data &&
          data.item &&
          data.cost &&
          typeof data.clickX === 'number' &&
          typeof data.clickY === 'number'
        ) {
          showPurchaseFeedback(data.item, data.cost, data.clickX, data.clickY);
        }
      }
    );
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
  // Update all displays

  // Check if DOM_CACHE is ready before updating
  const domCache = (window as any).DOM_CACHE;
  if (!domCache || !domCache.isReady || !domCache.isReady()) {
    // DOM_CACHE not ready, retry
    setTimeout(updateAllDisplays, 100);
    return;
  }

  updateTopSipsPerDrink();
  updateTopSipsPerSecond();
  updateTopSipCounter();
  updateCriticalClickDisplay();
  updateDrinkSpeedDisplay();
  updateAutosaveStatus();
  updatePlayTime();
  updateLastSaveTime();
  // Always update shop stats regardless of active tab
  updateShopStats();
  updateAllStats();
  checkUpgradeAffordability();
  // Update complete
}

// Move switchTab into UI to eliminate window.switchTab
export function switchTab(tabName: string, event: any): void {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach((tab: any) => tab.classList.remove('active'));
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn: any) => btn.classList.remove('active'));
  const selectedTab = document.getElementById(`${tabName}Tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  const clickedButton = event?.target as any;
  try {
    clickedButton?.classList?.add('active');
  } catch (error) {
    console.warn('Failed to activate tab button:', error);
  }
  if (tabName === 'stats') {
    try {
      updateAllStats();
    } catch (error) {
      console.warn('Failed to update stats tab:', error);
    }
  }
  if (tabName === 'unlocks') {
    try {
      const sys = (window as any).App?.systems?.unlocks;
      if (sys?.updateUnlocksTab) sys.updateUnlocksTab();
    } catch (error) {
      console.warn('Failed to update unlocks tab:', error);
    }
  }
}

// Batch UI updates for performance (use in game loop)
export function performBatchUIUpdate(): void {
  requestAnimationFrame(() => {
    updateTopSipsPerDrink();
    updateTopSipsPerSecond();
    updateTopSipCounter();
    updatePlayTime();
    if (
      typeof window !== 'undefined' &&
      (window as any).DOM_CACHE?.statsTab?.classList?.contains('active')
    ) {
      updateAllStats();
    }
    if (Math.random() < 0.1) {
      checkUpgradeAffordability();
    }
  });
}
