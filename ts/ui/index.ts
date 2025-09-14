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
// import subscriptionManager from './subscription-manager'; // Not needed for sidebar navigation
import { topInfoBar, TopInfoBarData } from './top-info-bar';
import { useGameStore } from '../core/state/zustand-store';
import { sidebarNavigation } from './sidebar-navigation';
import { drinkProgressBar, levelProgressBar, ProgressBarData } from './progress-bar';
import { visualFeedback } from './visual-feedback';
import {
  initializeEnhancedAffordabilitySystem,
  addPurchaseSuccessAnimation,
} from './enhanced-affordability';
import { initializeSodaDrinkerProThemes, addThemeStyles } from './soda-drinker-pro-themes';
import { initializeAuthenticSDP } from './authentic-sdp';
import { initializeSoda3D } from './soda-3d';
import { konamiCodeDetector } from './konami-code';
// import { runFullLayoutValidation } from './layout-validation'; // Disabled - sections removed

// Export all UI modules
export { displays, stats, feedback, affordability, buttons };
export { labels };
export { topInfoBar, sidebarNavigation, drinkProgressBar, levelProgressBar, visualFeedback };
export type { TopInfoBarData, ProgressBarData };

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
    const state = useGameStore.getState();
    if (!state) {
      console.warn('No state available for top info bar update');
      return;
    }

    const data: TopInfoBarData = {
      level: state.level || 1,
      totalSips: state.sips || 0,
      perDrink: state.spd || 0,
      title: 'Soda Drinker', // Title is not in the state, use default
    };

    // Update the top info bar with current state
    topInfoBar.update(data);
  } catch (error) {
    console.warn('Failed to update top info bar:', error);
  }
}

/**
 * Initialize the enhanced sidebar navigation system
 */
export function initializeEnhancedNavigation(): void {
  try {
    // The sidebar navigation manager initializes itself
    console.log('✅ Enhanced sidebar navigation system initialized');
  } catch (error) {
    console.warn('Failed to initialize enhanced sidebar navigation:', error);
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
      const state = useGameStore.getState();
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
    const state = useGameStore.getState();
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
      progress: 0, // Level progress not in state, use default
      total: 100, // Level target not in state, use default
      rate: 0, // Level rate not in state, use default
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
      const clickData = data as ClickSodaEventData;
      // Use optimized batch update for better performance
      updateAllDisplaysOptimized();
      updateClickValueDisplay();
      updateTopInfoBar(); // Update the header with new sips total
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

    // Subscribe to level changes to update level text automatically
    try {
      import('../core/state/zustand-store').then(({ useSubscribeToLevel }) => {
        useSubscribeToLevel(() => {
          updateLevelText();
          updateLevelNumber();
        });
      });
    } catch (error) {
      console.warn('Failed to subscribe to level changes:', error);
    }
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

    // Initialize displays
    try {
      updateDrinkSpeedDisplayOptimized();
      updateClickValueDisplay();
    } catch (error) {
      console.warn('Failed to initialize displays:', error);
    }

    // Layout validation disabled - sections were intentionally removed
    // try {
    //   runFullLayoutValidation();
    // } catch (error) {
    //   console.warn('Layout validation failed:', error);
    // }
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

    // Initialize secrets system
    initializeSecretsSystem();

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
    const state = useGameStore.getState();
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
 * Initialize secrets system and UI
 */
function initializeSecretsSystem(): void {
  try {
    const state = useGameStore.getState();
    const secretsUnlocked = state?.options?.secretsUnlocked ?? false;
    const godTabEnabled = state?.options?.godTabEnabled ?? false;

    // Show/hide secrets section based on unlock status
    const secretsSection = document.querySelector('.secrets-section');
    if (secretsSection) {
      if (secretsUnlocked) {
        secretsSection.classList.remove('hidden');
      } else {
        secretsSection.classList.add('hidden');
      }
    }

    // Update god toggle button text
    const godButton = document.querySelector('.god-toggle-btn');
    if (godButton) {
      godButton.textContent = `🙏 Talk to God ${godTabEnabled ? 'ON' : 'OFF'}`;
    }

    // Initialize Konami code detector (it starts listening automatically)
    // The detector is imported and initialized automatically
    console.log('🔐 Secrets system initialized. Konami code detector active.');
    console.log(
      '🔐 Konami detector status:',
      konamiCodeDetector.isSecretsUnlocked() ? 'UNLOCKED' : 'LOCKED'
    );
    console.log('🔐 Secrets unlocked:', secretsUnlocked ? 'YES' : 'NO');
    console.log('🙏 God tab enabled:', godTabEnabled ? 'YES' : 'NO');
  } catch (error) {
    console.warn('Failed to initialize secrets system:', error);
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
  // Mobile navigation is now handled by the sidebar navigation manager
  // No additional setup needed as the sidebar handles mobile interactions
  console.log('✅ Mobile navigation initialized via sidebar system');
}

// Initialize swipe gestures for sidebar navigation
// function initializeSwipeGestures(): void {
//   // Swipe gestures are now handled by the sidebar navigation manager
//   // No additional setup needed as the sidebar handles mobile swipe interactions
//   console.log('✅ Swipe gestures initialized via sidebar system');
// }

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

// toggleSidebarSection removed - no longer needed as shop is direct content

// isMobileDevice function removed - no longer needed

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

// safeToggleSidebarSection removed - no longer needed as shop is direct content

// Initialize error boundaries for critical operations
export function initializeErrorBoundaries(): void {
  try {
    // Wrap critical global functions with error boundaries
    if (typeof window !== 'undefined') {
      (window as any).safeUpdateAllDisplays = safeUpdateAllDisplays;
      // safeToggleSidebarSection removed - no longer needed
    }
  } catch (error) {
    reportUIError(error, 'initialize_error_boundaries', ErrorSeverity.HIGH);
  }
}

// Helper function to trigger haptic feedback
// triggerHapticFeedback function removed - no longer needed

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
