// UI System Coordinator
// Main entry point for all UI-related functionality

import * as displays from './displays';
import {
  updateAllDisplaysOptimized,
  checkUpgradeAffordabilityOptimized,
  updatePurchasedCountsOptimized,
  updateDrinkSpeedDisplayOptimized,
  updateAutosaveStatusOptimized,
  updateLastSaveTimeOptimized,
} from './displays';
import * as stats from './stats';
import * as feedback from './feedback';
import * as affordability from './affordability';
import * as labels from './labels';
import * as utils from './utils';
import * as buttons from './buttons';
import subscriptionManager from './subscription-manager';
import { topInfoBar, TopInfoBarData } from './top-info-bar';
import { useGameStore } from '../core/state/zustand-store';
import { navigationManager, NavigationTab } from './navigation';
import { drinkProgressBar, levelProgressBar, ProgressBarData } from './progress-bar';
import { visualFeedback } from './visual-feedback';
import {
  initializeEnhancedAffordabilitySystem,
  addPurchaseSuccessAnimation,
} from './enhanced-affordability';
import { initializeSodaDrinkerProThemes, addThemeStyles } from './soda-drinker-pro-themes';
import { initializeAuthenticSDP } from './authentic-sdp';
import { initializeSoda3D } from './soda-3d';

// Export all UI modules
export { displays, stats, feedback, affordability, buttons };
export { labels };
export { topInfoBar, navigationManager, drinkProgressBar, levelProgressBar, visualFeedback };
export type { TopInfoBarData, NavigationTab, ProgressBarData };

// Export optimized functions
export {
  updateAllDisplaysOptimized,
  checkUpgradeAffordabilityOptimized,
  updatePurchasedCountsOptimized,
  updateDrinkSpeedDisplayOptimized,
  updateAutosaveStatusOptimized,
  updateLastSaveTimeOptimized,
};

/**
 * Update the enhanced top information bar with current game state
 * Cache bust: v2
 */
export function updateTopInfoBar(): void {
  try {
    const state = (window as any).App?.state?.getState?.();
    if (!state) {
      return;
    }

    const data: TopInfoBarData = {
      level: state.level || 1,
      totalSips: state.sips || 0,
      perDrink: state.spd || 0,
      title: state.title || 'Soda Drinker',
    };

    topInfoBar.update(data);
  } catch (error) {
    console.warn('Failed to update top info bar:', error);
  }
}

/**
 * Initialize the enhanced navigation system
 */
export function initializeEnhancedNavigation(): void {
  try {
    // Initialize the navigation manager
    navigationManager.initializeNavigation();

    // Set up event listeners for tab switching
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const action = target.getAttribute('data-action');

      if (action && action.startsWith('switchTab:')) {
        const tabId = action.split(':')[1];
        if (tabId) {
          navigationManager.switchTab(tabId);
          event.preventDefault();
        }
      }
    });

    // Set up keyboard navigation
    document.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target as HTMLElement;
        const action = target.getAttribute('data-action');

        if (action && action.startsWith('switchTab:')) {
          const tabId = action.split(':')[1];
          if (tabId) {
            navigationManager.switchTab(tabId);
            event.preventDefault();
          }
        }
      }
    });

    console.log('✅ Enhanced navigation system initialized');
  } catch (error) {
    console.warn('Failed to initialize enhanced navigation:', error);
  }
}

/**
 * Set up direct soda button click handler as fallback
 */
export function setupDirectSodaClickHandler(): void {
  console.log('🔧 Setting up direct soda click handler...');

  // Set up debounced monitoring for top bar updates
  let lastValues = { sips: null, spd: null, level: null };
  let updateTimeout: number | null = null;

  const debouncedUpdateTopBar = () => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = window.setTimeout(() => {
      updateTopInfoBar();
      updateTimeout = null;
    }, 100); // 100ms debounce
  };

  const checkForValueChanges = () => {
    try {
      const state = (window as any).App?.state?.getState?.();
      if (state) {
        const currentSips = state.sips;
        const currentSPD = state.spd;
        const currentLevel = state.level;

        // Check if any relevant values have changed
        if (
          currentSips !== lastValues.sips ||
          currentSPD !== lastValues.spd ||
          currentLevel !== lastValues.level
        ) {
          lastValues = { sips: currentSips, spd: currentSPD, level: currentLevel };
          debouncedUpdateTopBar();
        }
      }
    } catch (error) {
      // Silent - don't spam console
    }
  };

  // Check for changes every 500ms (more frequent than before)
  setInterval(checkForValueChanges, 500);

  console.log('✅ Sips monitoring set up for top bar updates');

  // Force an immediate update of the top bar
  updateTopInfoBar();

  // Add debug function for testing header elements
  (window as any).testHeader = () => {
    console.log('🧪 Testing header elements...');
    const topSipValue = document.getElementById('topSipValue');
    const topSipsPerDrink = document.getElementById('topSipsPerDrink');
    const topSipsPerSecond = document.getElementById('topSipsPerSecond');
    console.log('🧪 topSipValue:', topSipValue, 'current text:', topSipValue?.textContent);
    console.log(
      '🧪 topSipsPerDrink:',
      topSipsPerDrink,
      'current text:',
      topSipsPerDrink?.textContent
    );
    console.log(
      '🧪 topSipsPerSecond:',
      topSipsPerSecond,
      'current text:',
      topSipsPerSecond?.textContent
    );

    // Try to manually update them
    if (topSipValue) {
      topSipValue.textContent = 'TEST123';
      console.log('🧪 Set topSipValue to TEST123');
    }
    if (topSipsPerDrink) {
      topSipsPerDrink.textContent = 'TEST456';
      console.log('🧪 Set topSipsPerDrink to TEST456');
    }
    if (topSipsPerSecond) {
      topSipsPerSecond.textContent = 'TEST789';
      console.log('🧪 Set topSipsPerSecond to TEST789');
    }
  };

  // Add debug function to window for manual testing
  (window as any).testSodaClick = async () => {
    console.log('🧪 Testing soda click manually...');
    try {
      const { handleSodaClick } = await import('../core/systems/clicks-system.ts');
      await handleSodaClick(1);
      console.log('🧪 Manual soda click test successful!');
    } catch (error) {
      console.error('🧪 Manual soda click test failed:', error);
    }
  };

  console.log('🧪 Added testSodaClick() function to window for debugging');

  // Add debug function to manually test header updates
  (window as any).testHeaderUpdates = () => {
    console.log('🧪 Testing header updates manually...');
    try {
      const state = useGameStore.getState();
      console.log('🧪 Current state:', {
        sips: state.sips.toString(),
        spd: state.spd.toString(),
        drinkRate: state.drinkRate,
      });

      // Test individual update functions
      console.log('🧪 Calling updateTopSipCounter...');
      updateTopSipCounter();

      console.log('🧪 Calling updateTopSipsPerDrink...');
      updateTopSipsPerDrink();

      console.log('🧪 Calling updateTopSipsPerSecond...');
      updateTopSipsPerSecond();

      // Check if elements exist and their current values
      const topSipValue = document.getElementById('topSipValue');
      const topSipsPerDrink = document.getElementById('topSipsPerDrink');
      const topSipsPerSecond = document.getElementById('topSipsPerSecond');

      console.log('🧪 Element values after manual update:', {
        topSipValue: topSipValue?.textContent,
        topSipsPerDrink: topSipsPerDrink?.innerHTML,
        topSipsPerSecond: topSipsPerSecond?.innerHTML,
      });

      console.log('🧪 Manual header update test complete!');
    } catch (error) {
      console.error('🧪 Manual header update test failed:', error);
    }
  };

  console.log('🧪 Added testHeaderUpdates() function to window for debugging');
}

/**
 * Update the enhanced progress bars with current game state
 */
export function updateEnhancedProgressBars(): void {
  try {
    const state = (window as any).App?.state?.getState?.();
    if (!state) return;

    // Update drink progress bar
    const drinkData: ProgressBarData = {
      progress: state.drinkProgress || 0,
      total: 100,
      rate: state.drinkRate || 0,
      label: 'Drink Progress',
      showTimeRemaining: true,
      showPercentage: true,
      showRate: true,
    };
    drinkProgressBar.update(drinkData);

    // Update level progress bar (if applicable)
    const levelData: ProgressBarData = {
      progress: state.levelProgress || 0,
      total: state.levelTarget || 100,
      rate: state.levelRate || 0,
      label: 'Level Progress',
      showTimeRemaining: false,
      showPercentage: true,
      showRate: false,
    };
    levelProgressBar.update(levelData);
  } catch (error) {
    console.warn('Failed to update enhanced progress bars:', error);
  }
}

// Simple error severity levels
enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Event data types
interface ClickSodaEventData {
  value?: unknown;
  gained?: unknown;
  eventName?: string;
  hasEventSystem?: boolean;
  hasEmit?: boolean;
  critical?: boolean;
  clickX?: number;
  clickY?: number;
}

interface PurchaseEventData {
  item: string;
  cost: unknown;
  gained?: unknown;
  clickX?: number;
  clickY?: number;
}

// Using existing global Window.App declaration from app-types.ts

// Helper function to report UI errors with proper categorization
function reportUIError(
  error: Error | string | unknown,
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
export const updateClickValueDisplay = displays.updateClickValueDisplay;
export const updateProductionSummary = displays.updateProductionSummary;
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

    // Set up direct soda click handler as fallback - DISABLED (causing double clicks)
  } catch (error) {
    reportUIError(error, 'initialize_ui_main', ErrorSeverity.CRITICAL);
  }

  // Sync options UI on init
  try {
    updateAutosaveStatusOptimized();
  } catch (error) {
    reportUIError(error, 'update_autosave_status_init', ErrorSeverity.LOW);
  }
  try {
    (window as any).App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.();
  } catch (error) {
    reportUIError(error, 'update_button_sounds_toggle_init', ErrorSeverity.LOW);
  }
  // Check event system availability

  if (window.App?.events) {
    // Set up CLICK.SODA event listener
    window.App.events.on(window.App.EVENT_NAMES?.CLICK?.SODA!, (data: unknown) => {
      console.log('🎉 CLICK.SODA event received!', data);
      const clickData = data as ClickSodaEventData;
      // Use optimized batch update for better performance
      updateAllDisplaysOptimized();
      updateClickValueDisplay();
      console.log('🔧 About to call updateTopInfoBar from CLICK.SODA event');
      updateTopInfoBar(); // Update the header with new sips total
      console.log('✅ updateTopInfoBar called from CLICK.SODA event');
      checkUpgradeAffordabilityOptimized();

      // Add visual feedback for soda click (using existing CSS system)
      const sodaButton = document.getElementById('sodaButton');
      if (sodaButton) {
        // Use the existing soda-clicked class instead of our animation
        sodaButton.classList.add('soda-clicked');
        setTimeout(() => {
          sodaButton.classList.remove('soda-clicked');
        }, 120);
      }

      if (clickData && clickData.gained) {
        // Pass the value directly - showClickFeedback will handle Decimal objects properly
        showClickFeedback(clickData.gained, clickData.critical, clickData.clickX, clickData.clickY);
      }
    });
    window.App.events.on(window.App.EVENT_NAMES?.ECONOMY?.PURCHASE!, (data: unknown) => {
      const purchaseData = data as PurchaseEventData;
      // Use optimized batch update for better performance
      updateAllDisplaysOptimized();
      updateClickValueDisplay();
      updateProductionSummary();
      checkUpgradeAffordabilityOptimized();
      updateCriticalClickDisplay();
      updateShopStats(); // Call updateShopStats to trigger updateEnhancementValues
      updatePurchasedCountsOptimized(); // Use optimized version

      // Add visual feedback for purchases
      if (purchaseData && purchaseData.item) {
        // Find the button that was clicked and add purchase success feedback
        const buttonSelectors = [
          `[data-action="buy${purchaseData.item}"]`,
          `[data-action="upgrade${purchaseData.item}"]`,
          `[data-action="${purchaseData.item}"]`,
        ];

        for (const selector of buttonSelectors) {
          const button = document.querySelector(selector);
          if (button) {
            // Use both existing and enhanced purchase success animations
            visualFeedback.addPurchaseSuccess(button as HTMLElement);
            addPurchaseSuccessAnimation(button as HTMLElement);
            break;
          }
        }
      }

      if (
        purchaseData &&
        purchaseData.item &&
        purchaseData.cost &&
        typeof purchaseData.clickX === 'number' &&
        typeof purchaseData.clickY === 'number'
      ) {
        showPurchaseFeedback(
          purchaseData.item,
          Number(purchaseData.cost),
          purchaseData.clickX,
          purchaseData.clickY
        );
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

  // Initialize enhanced UI components
  try {
    initializeEnhancedUIComponents();

    // Initialize enhanced affordability system
    initializeEnhancedAffordabilitySystem();

    // Initialize Soda Drinker Pro theme system
    addThemeStyles();
    initializeSodaDrinkerProThemes();

    // Initialize authentic SDP experience
    initializeAuthenticSDP();

    // Initialize 3D soda button
    console.log('🎮 About to initialize 3D soda button...');
    try {
      initializeSoda3D();
      console.log('✅ 3D soda button initialization completed');
    } catch (error) {
      console.error('❌ 3D soda button initialization failed:', error);
    }
  } catch (error) {
    reportUIError(error, 'initialize_enhanced_ui', ErrorSeverity.MEDIUM);
  }
}

/**
 * Initialize enhanced UI components
 */
function initializeEnhancedUIComponents(): void {
  try {
    console.log('🔧 Initializing enhanced UI components...');

    // Initialize enhanced navigation
    initializeEnhancedNavigation();

    // Initialize enhanced top info bar
    topInfoBar.initializeElements();

    // Initialize enhanced progress bars
    drinkProgressBar.initializeElements('drink-progress-container');
    levelProgressBar.initializeElements('level-progress-container');

    // Hide old UI elements
    hideOldUIElements();

    // Initialize dev tools button
    initializeDevToolsButton();

    console.log('✅ Enhanced UI components initialized');
  } catch (error) {
    console.warn('Failed to initialize enhanced UI components:', error);
  }
}

/**
 * Initialize dev tools button with correct state
 */
function initializeDevToolsButton(): void {
  try {
    const w = window as any;
    const state = w.App?.state?.getState?.();
    const devToolsEnabled = state?.options?.devToolsEnabled ?? false;
    
    const button = document.querySelector('.dev-toggle-btn');
    if (button) {
      button.textContent = `🔧 Dev Tools ${devToolsEnabled ? 'ON' : 'OFF'}`;
    }
    
    console.log('🔧 Dev tools button initialized:', devToolsEnabled ? 'ON' : 'OFF');
  } catch (error) {
    console.warn('Failed to initialize dev tools button:', error);
  }
}

/**
 * Hide old UI elements that are replaced by enhanced versions
 */
function hideOldUIElements(): void {
  try {
    // Hide old top sip counter
    const oldSipCounter = document.querySelector('.top-sip-counter');
    if (oldSipCounter) {
      (oldSipCounter as HTMLElement).style.display = 'none';
    }

    // Hide old progress bar if enhanced version exists
    const oldProgressContainer = document.querySelector('.drink-progress-container');
    const enhancedProgressContainer = document.querySelector('.enhanced-progress-container');
    if (oldProgressContainer && enhancedProgressContainer) {
      (oldProgressContainer as HTMLElement).style.display = 'none';
    }

    console.log('✅ Old UI elements hidden');
  } catch (error) {
    console.warn('Failed to hide old UI elements:', error);
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
  const tabOrder = ['soda', 'shop', 'stats', 'god', 'options', 'dev'];

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

  // Use optimized batch update for better performance
  updateAllDisplaysOptimized();
  updateCriticalClickDisplay();
  updateClickValueDisplay();
  updateProductionSummary();
  updateDrinkSpeedDisplayOptimized();
  updateAutosaveStatusOptimized();
  updatePlayTime();
  updateLastSaveTimeOptimized();
  // Always update shop stats and purchased counts regardless of active tab
  updateShopStats();
  updatePurchasedCounts();
  updateAllStats();
  checkUpgradeAffordability();

  // Update enhanced UI components
  try {
    updateTopInfoBar();
    updateEnhancedProgressBars();
  } catch (error) {
    console.warn('Failed to update enhanced UI components:', error);
  }

  // Update complete
}

// Enhanced switchTab function for both desktop and mobile navigation
export function switchTab(tabName: string, event?: Event | null): void {
  // Update tab content visibility
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => (tab as Element).classList.remove('active'));
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
export function withErrorBoundary<T extends (...args: unknown[]) => unknown>(
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
    // Fallback: try to update basic displays only with optimized versions
    try {
      updateAllDisplaysOptimized();
      updateDrinkSpeedDisplayOptimized();
    } catch (fallbackError) {
      reportUIError(fallbackError, 'basic_display_fallback', ErrorSeverity.CRITICAL);
    }
  }
);

export const safeSwitchTab = withErrorBoundary(
  (...args: unknown[]) => {
    const [tabName, event] = args;
    return switchTab(tabName as string, event as Event | null | undefined);
  },
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
