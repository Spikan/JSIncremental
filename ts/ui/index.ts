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
  if ((window as any).__UI_WIRED__) return;
  (window as any).__UI_WIRED__ = true;
  // UI system initializing
  buttons.initButtonSystem();

  // Initialize mobile navigation features
  initializeMobileNavigation();

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

      if (data && data.gained) {
        // Convert Decimal to number for feedback display, preserving extreme values
        let feedbackValue = data.gained;
        if (typeof feedbackValue.toNumber === 'function') {
          const numValue = feedbackValue.toNumber();
          // For extreme values, use a safe display number
          feedbackValue = isFinite(numValue) && Math.abs(numValue) < 1e15 ? numValue : 999999999;
        } else if (typeof feedbackValue !== 'number') {
          feedbackValue = Number(feedbackValue) || 0;
        }
        showClickFeedback(feedbackValue, data.critical, data.clickX, data.clickY);
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

// Initialize mobile navigation features
function initializeMobileNavigation(): void {
  if (!isMobileDevice()) return;

  // Add keyboard navigation support for mobile tabs
  const mobileTabItems = document.querySelectorAll('.mobile-tab-item');
  mobileTabItems.forEach((item: any) => {
    // Handle keyboard navigation
    item.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const action = item.getAttribute('data-action');
        if (action && action.startsWith('switchTab:')) {
          const tabName = action.split(':')[1];
          switchTab(tabName, e);
        }
      }
    });

    // Handle touch events
    item.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();
      item.classList.add('touching');
    });

    item.addEventListener('touchend', (e: TouchEvent) => {
      e.preventDefault();
      item.classList.remove('touching');
      const action = item.getAttribute('data-action');
      if (action && action.startsWith('switchTab:')) {
        const tabName = action.split(':')[1];
        switchTab(tabName, e);
      }
    });
  });

  // Initialize swipe gestures for tab content
  initializeSwipeGestures();

  console.log('✅ Mobile navigation initialized');
}

// Initialize swipe gestures for tab switching
function initializeSwipeGestures(): void {
  const tabContents = document.querySelectorAll('.tab-content');
  const tabOrder = ['soda', 'unlocks', 'shop', 'stats', 'god', 'options', 'dev'];

  let startX = 0;
  let startY = 0;
  let currentTabIndex = 0;

  // Find current tab index
  function getCurrentTabIndex(): number {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return 0;

    const tabId = activeTab.id.replace('Tab', '');
    return tabOrder.indexOf(tabId);
  }

  // Switch to tab by index
  function switchToTabByIndex(index: number): void {
    if (index < 0 || index >= tabOrder.length) return;

    const tabName = tabOrder[index];
    if (tabName) {
      const event = new Event('swipe');
      switchTab(tabName, event);
    }
  }

  // Add swipe listeners to all tab content areas
  tabContents.forEach((tabContent: any) => {
    tabContent.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0 && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentTabIndex = getCurrentTabIndex();
      }
    });

    tabContent.addEventListener('touchend', (e: TouchEvent) => {
      if (e.changedTouches && e.changedTouches.length > 0 && e.changedTouches[0]) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Only process horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            // Swipe right - previous tab
            switchToTabByIndex(currentTabIndex - 1);
          } else {
            // Swipe left - next tab
            switchToTabByIndex(currentTabIndex + 1);
          }
        }
      }
    });
  });

  console.log('✅ Swipe gestures initialized');
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
  // Always update shop stats and purchased counts regardless of active tab
  updateShopStats();
  updatePurchasedCounts();
  updateAllStats();
  checkUpgradeAffordability();
  // Update complete
}

// Enhanced switchTab function for both desktop and mobile navigation
export function switchTab(tabName: string, event: any): void {
  // Update tab content visibility
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach((tab: any) => tab.classList.remove('active'));
  const selectedTab = document.getElementById(`${tabName}Tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Update desktop tab buttons
  const desktopTabButtons = document.querySelectorAll('.tab-btn');
  desktopTabButtons.forEach((btn: any) => btn.classList.remove('active'));

  // Update mobile tab items
  const mobileTabItems = document.querySelectorAll('.mobile-tab-item');
  mobileTabItems.forEach((item: any) => item.classList.remove('active'));

  // Find and activate the correct tab button/item
  const clickedElement = event?.target as any;
  let targetElement = clickedElement;

  // If clicking on a child element, find the parent tab element
  if (
    clickedElement &&
    !clickedElement.classList.contains('tab-btn') &&
    !clickedElement.classList.contains('mobile-tab-item')
  ) {
    targetElement =
      clickedElement.closest('.tab-btn') || clickedElement.closest('.mobile-tab-item');
  }

  // Activate the clicked element
  if (targetElement) {
    targetElement.classList.add('active');
  } else {
    // Fallback: activate by data-action attribute
    const fallbackElement = document.querySelector(`[data-action="switchTab:${tabName}"]`);
    if (fallbackElement) {
      fallbackElement.classList.add('active');
    }
  }

  // Add haptic feedback on mobile
  if (isMobileDevice()) {
    triggerHapticFeedback();
  }

  // Tab-specific updates
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

// Helper function to detect mobile device
function isMobileDevice(): boolean {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

// Helper function to trigger haptic feedback
function triggerHapticFeedback(): void {
  try {
    // Check if vibration API is available
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
  } catch (error) {
    // Haptic feedback is not critical, so we can silently fail
    console.debug('Haptic feedback not available:', error);
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
