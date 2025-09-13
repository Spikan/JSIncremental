// UI System Coordinator
// Main entry point for all UI-related functionality

import * as displays from './displays';
import * as stats from './stats';
import * as feedback from './feedback';
import * as affordability from './affordability';
import * as labels from './labels';
import * as utils from './utils';
import * as buttons from './buttons';
import subscriptionManager from './subscription-manager';

// Export all UI modules
export { displays, stats, feedback, affordability, buttons };
export { labels };

// Simple error severity levels
enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Helper function to report UI errors with proper categorization
function reportUIError(
  error: any,
  context: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): void {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const timestamp = new Date().toISOString();

    // Log error with context
    console.error(`🚨 [UI-${severity.toUpperCase()}] ${context}: ${errorMessage}`, {
      timestamp,
      context,
      severity,
      stackTrace: error instanceof Error ? error.stack : undefined,
    });

    // In production, you could send this to an error tracking service
    // For now, we'll just log it with proper categorization
  } catch (reportingError) {
    // Fallback to console if error reporting fails
    console.error('Failed to report UI error:', reportingError);
    console.error('Original error:', error);
  }
}

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

  try {
    // Initialize error boundaries first
    initializeErrorBoundaries();

    // UI system initializing
    buttons.initButtonSystem();

    // Initialize mobile navigation features
    initializeMobileNavigation();
  } catch (error) {
    reportUIError(error, 'initialize_ui_main', ErrorSeverity.CRITICAL);
  }

  // Sync options UI on init
  try {
    updateAutosaveStatus();
  } catch (error) {
    reportUIError(error, 'update_autosave_status_init', ErrorSeverity.LOW);
  }
  try {
    (window as any).App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.();
  } catch (error) {
    reportUIError(error, 'update_button_sounds_toggle_init', ErrorSeverity.LOW);
  }
  // Check event system availability

  if ((window as any).App?.events) {
    // Set up CLICK.SODA event listener
    (window as any).App.events.on((window as any).App.EVENT_NAMES?.CLICK?.SODA, (data: any) => {
      updateTopSipCounter();
      updateTopSipsPerDrink();
      updateTopSipsPerSecond();
      checkUpgradeAffordability();

      if (data && data.gained) {
        // Pass the value directly - showClickFeedback will handle Decimal objects properly
        showClickFeedback(data.gained, data.critical, data.clickX, data.clickY);
      }
    });
    (window as any).App.events.on(
      (window as any).App.EVENT_NAMES?.ECONOMY?.PURCHASE,
      (data: any) => {
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();
        updateTopSipCounter();
        checkUpgradeAffordability();
        updateCriticalClickDisplay();
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
  const mobileEventListeners: Array<{ element: Element; type: string; handler: EventListener }> =
    [];

  mobileTabItems.forEach((item: any) => {
    // Handle keyboard navigation
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const action = item.getAttribute('data-action');
        if (action && action.startsWith('switchTab:')) {
          const tabName = action.split(':')[1];
          switchTab(tabName, e);
        }
      }
    };

    // Handle touch events
    const touchstartHandler = (e: TouchEvent) => {
      e.preventDefault();
      item.classList.add('touching');
    };

    const touchendHandler = (e: TouchEvent) => {
      e.preventDefault();
      item.classList.remove('touching');
      const action = item.getAttribute('data-action');
      if (action && action.startsWith('switchTab:')) {
        const tabName = action.split(':')[1];
        switchTab(tabName, e);
      }
    };

    // Add event listeners and track them for cleanup
    item.addEventListener('keydown', keydownHandler);
    item.addEventListener('touchstart', touchstartHandler);
    item.addEventListener('touchend', touchendHandler);

    mobileEventListeners.push(
      { element: item, type: 'keydown', handler: keydownHandler as EventListener },
      { element: item, type: 'touchstart', handler: touchstartHandler as EventListener },
      { element: item, type: 'touchend', handler: touchendHandler as EventListener }
    );
  });

  // Register cleanup with subscription manager
  subscriptionManager.register(
    'mobile-navigation',
    () => {
      mobileEventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      mobileEventListeners.length = 0;
    },
    'Mobile Navigation Event Listeners'
  );

  // Initialize swipe gestures for tab content
  initializeSwipeGestures();

  // Mobile navigation initialized
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
  const swipeEventListeners: Array<{ element: Element; type: string; handler: EventListener }> = [];

  tabContents.forEach((tabContent: any) => {
    const touchstartHandler = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0 && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentTabIndex = getCurrentTabIndex();
      }
    };

    const touchendHandler = (e: TouchEvent) => {
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
    };

    // Add event listeners and track them for cleanup
    tabContent.addEventListener('touchstart', touchstartHandler);
    tabContent.addEventListener('touchend', touchendHandler);

    swipeEventListeners.push(
      { element: tabContent, type: 'touchstart', handler: touchstartHandler as EventListener },
      { element: tabContent, type: 'touchend', handler: touchendHandler as EventListener }
    );
  });

  // Register cleanup with subscription manager
  subscriptionManager.register(
    'swipe-gestures',
    () => {
      swipeEventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      swipeEventListeners.length = 0;
    },
    'Swipe Gesture Event Listeners'
  );
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
      reportUIError(error, 'update_stats_tab', ErrorSeverity.MEDIUM);
    }
  }
  if (tabName === 'unlocks') {
    try {
      const sys = (window as any).App?.systems?.unlocks;
      if (sys?.updateUnlocksTab) sys.updateUnlocksTab();
    } catch (error) {
      reportUIError(error, 'update_unlocks_tab', ErrorSeverity.MEDIUM);
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

// Error Boundary Wrapper for Critical UI Operations
export function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  context: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  fallback?: () => void
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      reportUIError(error, context, severity);

      // Execute fallback if provided
      if (fallback) {
        try {
          fallback();
        } catch (fallbackError) {
          reportUIError(fallbackError, `${context}_fallback`, ErrorSeverity.HIGH);
        }
      }

      // Return undefined for functions that should return values
      return undefined;
    }
  }) as T;
}

// Critical UI Operations with Error Boundaries
export const safeUpdateAllDisplays = withErrorBoundary(
  updateAllDisplays,
  'update_all_displays',
  ErrorSeverity.HIGH,
  () => {
    // Fallback: try to update basic displays only
    try {
      displays.updateTopSipsPerDrink();
      displays.updateTopSipsPerSecond();
      displays.updateDrinkSpeedDisplay();
    } catch (fallbackError) {
      reportUIError(fallbackError, 'basic_display_fallback', ErrorSeverity.CRITICAL);
    }
  }
);

export const safeSwitchTab = withErrorBoundary(
  switchTab,
  'switch_tab',
  ErrorSeverity.MEDIUM,
  () => {
    // Fallback: show soda tab
    try {
      const sodaTab = document.querySelector('.tab-content[id="sodaTab"]');
      const otherTabs = document.querySelectorAll('.tab-content:not(#sodaTab)');

      if (sodaTab) {
        sodaTab.classList.add('active');
        otherTabs.forEach(tab => tab.classList.remove('active'));
      }
    } catch (fallbackError) {
      reportUIError(fallbackError, 'switch_tab_fallback', ErrorSeverity.HIGH);
    }
  }
);

// Initialize error boundaries for critical operations
export function initializeErrorBoundaries(): void {
  try {
    // Wrap critical global functions with error boundaries
    if (typeof window !== 'undefined') {
      (window as any).safeUpdateAllDisplays = safeUpdateAllDisplays;
      (window as any).safeSwitchTab = safeSwitchTab;
    }
  } catch (error) {
    reportUIError(error, 'initialize_error_boundaries', ErrorSeverity.HIGH);
  }
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
