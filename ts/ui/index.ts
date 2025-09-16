// UI System Coordinator
// Main entry point for all UI-related functionality

import { logger } from '../services/logger';
import { timerManager } from '../services/timer-manager';
import { domQuery } from '../services/dom-query';
import { uiBatcher } from '../services/ui-batcher';
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
import {
  showEnhancedClickFeedback,
  showEnhancedPurchaseFeedback,
  enhanceButtonInteractions,
} from './enhanced-feedback';
import { updateAllDisplaysAnimated } from './enhanced-displays';
import * as affordability from './affordability';
import * as labels from './labels';
import { devToolsManager } from './dev-tools-manager';
import { enhancedAudioManager } from '../services/enhanced-audio-manager';
import { audioControlsManager } from './audio-controls';
import * as utils from './utils';
import * as buttons from './buttons';
// import subscriptionManager from './subscription-manager'; // Not needed for sidebar navigation
import { topInfoBar, TopInfoBarData } from './top-info-bar';
import { getGameData, getOptionsData } from '../core/state/zustand-store';
import { sidebarNavigation } from './sidebar-navigation';
import { drinkProgressBar, levelProgressBar, ProgressBarData } from './progress-bar';
import { visualFeedback } from './visual-feedback';
import {
  initializeEnhancedAffordabilitySystem,
  addPurchaseSuccessAnimation,
} from './enhanced-affordability';
import { addThemeStyles } from './soda-drinker-pro-themes';
import { initializeAuthenticSDP } from './authentic-sdp';
import { createSoda3DButton } from './soda-3d-lightweight';
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
    const gameData = getGameData();
    if (!gameData) {
      logger.warn('No state available for top info bar update');
      return;
    }

    const data: TopInfoBarData = {
      level: gameData.level || 1,
      totalSips: gameData.sips || 0,
      perDrink: gameData.spd || 0,
      title: 'Soda Drinker', // Title is not in the state, use default
    };

    // Update the top info bar with current state
    topInfoBar.update(data);
  } catch (error) {
    logger.warn('Failed to update top info bar:', error);
  }
}

/**
 * Initialize the enhanced sidebar navigation system
 */
export function initializeEnhancedNavigation(): void {
  try {
    // The sidebar navigation manager initializes itself
    logger.info('Enhanced sidebar navigation system initialized');
  } catch (error) {
    logger.warn('Failed to initialize enhanced sidebar navigation:', error);
  }
}

/**
 * Set up direct soda button click handler as fallback
 */
export function setupDirectSodaClickHandler(): () => void {
  logger.debug('Setting up direct soda click handler...');

  // Set up debounced monitoring for top bar updates
  let lastValues = { sips: null, spd: null, level: null, hybridLevel: null };
  let updateTimeout: string = '';
  let valueCheckInterval: string = '';

  const debouncedUpdateTopBar = () => {
    if (updateTimeout) {
      timerManager.clearTimer(updateTimeout);
    }
    updateTimeout = timerManager.setTimeout(
      () => {
        updateTopInfoBar();
        updateTimeout = '';
      },
      100,
      'Top bar update debounce'
    ); // 100ms debounce
  };

  const checkForValueChanges = () => {
    try {
      const gameData = getGameData();
      if (gameData) {
        const currentSips = gameData.sips;
        const currentSPD = gameData.spd;
        const currentLevel = gameData.level;

        // Also check hybrid level system's current level
        // Modernized - hybrid system handled by store
        const hybridSystem = (window as any).App?.systems?.hybridLevel;
        const currentHybridLevel = hybridSystem?.getCurrentLevelId?.() || 1;

        // Check if any relevant values have changed
        if (
          currentSips !== lastValues.sips ||
          currentSPD !== lastValues.spd ||
          currentLevel !== lastValues.level ||
          currentHybridLevel !== lastValues.hybridLevel
        ) {
          lastValues = {
            sips: currentSips,
            spd: currentSPD,
            level: currentLevel,
            hybridLevel: currentHybridLevel,
          };
          debouncedUpdateTopBar();

          // Update hybrid level system display
          try {
            console.log('🔄 Value change detected, calling updateAllDisplaysAnimated');
            updateAllDisplaysAnimated();
          } catch (error) {
            console.warn('Failed to call updateAllDisplaysAnimated:', error);
          }
        }
      }
    } catch (error) {
      // Silent - don't spam console
    }
  };

  // Check for changes every 500ms (more frequent than before)
  valueCheckInterval = timerManager.setInterval(
    checkForValueChanges,
    500,
    'Value change monitoring'
  );

  // Cleanup function
  const cleanup = () => {
    if (updateTimeout) {
      timerManager.clearTimer(updateTimeout);
      updateTimeout = '';
    }
    if (valueCheckInterval) {
      timerManager.clearTimer(valueCheckInterval);
      valueCheckInterval = '';
    }
  };

  // Register cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Force an immediate update of the top bar
  updateTopInfoBar();

  // Add debug function for testing header elements
  (window as any).testHeader = () => {
    logger.debug('Testing header elements...');
    const topSipValue = document.getElementById('topSipValue');
    const topSipsPerDrink = document.getElementById('topSipsPerDrink');
    const topSipsPerSecond = document.getElementById('topSipsPerSecond');
    logger.debug('topSipValue:', topSipValue, 'current text:', topSipValue?.textContent);
    logger.debug(
      'topSipsPerDrink:',
      topSipsPerDrink,
      'current text:',
      topSipsPerDrink?.textContent
    );
    logger.debug(
      'topSipsPerSecond:',
      topSipsPerSecond,
      'current text:',
      topSipsPerSecond?.textContent
    );

    // Try to manually update them
    if (topSipValue) {
      topSipValue.textContent = 'TEST123';
      logger.debug('Set topSipValue to TEST123');
    }
    if (topSipsPerDrink) {
      topSipsPerDrink.textContent = 'TEST456';
      logger.debug('Set topSipsPerDrink to TEST456');
    }
    if (topSipsPerSecond) {
      topSipsPerSecond.textContent = 'TEST789';
      logger.debug('Set topSipsPerSecond to TEST789');
    }
  };

  // Add debug function to window for manual testing
  (window as any).testSodaClick = async () => {
    logger.debug('Testing soda click manually...');
    try {
      const { handleSodaClickFactory } = await import('../core/systems/clicks-system');
      const handleSodaClick = handleSodaClickFactory();
      await handleSodaClick(1);
      logger.debug('Manual soda click test successful!');
    } catch (error) {
      logger.error('Manual soda click test failed:', error);
    }
  };

  logger.debug('Added testSodaClick() function to window for debugging');

  // Add debug function to manually test header updates
  (window as any).testHeaderUpdates = () => {
    logger.debug('Testing header updates manually...');
    try {
      const gameData = getGameData();
      logger.debug('Current state:', {
        sips: gameData.sips.toString(),
        spd: gameData.spd.toString(),
        drinkRate: gameData.drinkRate,
      });

      // Test individual update functions
      logger.debug('Calling updateTopSipCounter...');
      updateTopSipCounter();

      logger.debug('Calling updateTopSipsPerDrink...');
      updateTopSipsPerDrink();

      logger.debug('Calling updateTopSipsPerSecond...');
      updateTopSipsPerSecond();

      // Check if elements exist and their current values
      const topSipValue = document.getElementById('topSipValue');
      const topSipsPerDrink = document.getElementById('topSipsPerDrink');
      const topSipsPerSecond = document.getElementById('topSipsPerSecond');

      logger.debug('Element values after manual update:', {
        topSipValue: topSipValue?.textContent,
        topSipsPerDrink: topSipsPerDrink?.innerHTML,
        topSipsPerSecond: topSipsPerSecond?.innerHTML,
      });

      logger.debug('Manual header update test complete!');
    } catch (error) {
      logger.error('Manual header update test failed:', error);
    }
  };

  logger.debug('Added testHeaderUpdates() function to window for debugging');
  logger.debug('Sips monitoring set up for top bar updates');

  // Return cleanup function for manual cleanup if needed
  return cleanup;
}

/**
 * Update the enhanced progress bars with current game state
 */
export function updateEnhancedProgressBars(): void {
  try {
    const gameData = getGameData();
    if (!gameData) return;

    // Update drink progress bar
    const drinkData: ProgressBarData = {
      progress: gameData.drinkProgress || 0,
      total: 100,
      rate: gameData.drinkRate || 0,
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
    logger.warn('Failed to update enhanced progress bars:', error);
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
    logger.error(`[UI-${severity.toUpperCase()}] ${context}: ${errorMessage}`, {
      timestamp,
      context,
      severity,
      stackTrace: error instanceof Error ? error.stack : undefined,
    });

    // In production, you could send this to an error tracking service
    // For now, we'll just log it with proper categorization
  } catch (reportingError) {
    // Fallback to console if error reporting fails
    logger.error('Failed to report UI error:', reportingError);
    logger.error('Original error:', error);
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

    // Set up direct soda click handler as fallback
    setupDirectSodaClickHandler();
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
    // Modernized - audio button handled by store
  } catch (error) {
    reportUIError(error, 'update_button_sounds_toggle_init', ErrorSeverity.LOW);
  }
  // Check event system availability

  if (window.App?.events) {
    // Set up CLICK.SODA event listener
    window.App.events.on(window.App.EVENT_NAMES?.CLICK?.SODA!, (data: unknown) => {
      const clickData = data as ClickSodaEventData;
      // Use enhanced animated displays for better visual experience
      try {
        console.log('🔄 Main update: Calling updateAllDisplaysAnimated');
        updateAllDisplaysAnimated();
        updateClickValueDisplay();
        updateTopInfoBar(); // Update the header with new sips total
        checkUpgradeAffordabilityOptimized();
      } catch (error) {
        console.error('❌ Main update: Enhanced displays failed:', error);
        throw error; // Fail fast instead of fallback
      }

      // Add visual feedback for soda click (using existing CSS system)
      const sodaButton = document.getElementById('sodaButton');
      if (sodaButton) {
        // Use the existing soda-clicked class instead of our animation
        sodaButton.classList.add('soda-clicked');
        timerManager.setTimeout(
          () => {
            sodaButton.classList.remove('soda-clicked');
          },
          120,
          'Remove soda-clicked class'
        );
      }

      if (clickData && clickData.gained) {
        // Play click sound effect
        try {
          if (clickData.critical) {
            enhancedAudioManager.playSound('click-critical');
          } else {
            enhancedAudioManager.playSound('click');
          }
        } catch (error) {
          logger.debug('Failed to play click sound:', error);
        }

        // Use enhanced Framer Motion feedback for better visual experience
        try {
          showEnhancedClickFeedback(
            clickData.gained,
            clickData.critical,
            clickData.clickX,
            clickData.clickY
          );
        } catch (error) {
          logger.error('Enhanced click feedback failed:', error);
          throw error; // Fail fast instead of fallback
        }
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

      if (purchaseData && purchaseData.item) {
        // Play purchase success sound
        try {
          enhancedAudioManager.playSound('purchase-success');
        } catch (error) {
          logger.debug('Failed to play purchase success sound:', error);
        }

        // Use enhanced purchase feedback with button animations
        try {
          showEnhancedPurchaseFeedback(
            purchaseData.item,
            Number(purchaseData.cost || 0),
            typeof purchaseData.clickX === 'number' ? purchaseData.clickX : null,
            typeof purchaseData.clickY === 'number' ? purchaseData.clickY : null,
            true // success
          );
        } catch (error) {
          logger.error('Enhanced purchase feedback failed:', error);
          throw error; // Fail fast instead of fallback
        }
      }
    });
    // Modernized - event handling by store
    console.log('Game saved event modernized');
    updateLastSaveTime();

    // Modernized - event handling by store
    console.log('Game loaded event modernized');
    timerManager.setTimeout(
      () => {
        updateAllDisplays();
        checkUpgradeAffordability();
      },
      100,
      'Post-game-load display update'
    );

    // Subscribe to level changes to update level text automatically
    try {
      import('../core/state/zustand-store').then(({ useSubscribeToLevel }) => {
        useSubscribeToLevel(() => {
          updateLevelText();
          updateLevelNumber();
        });
      });
    } catch (error) {
      logger.warn('Failed to subscribe to level changes:', error);
    }
  }

  // Initialize enhanced UI components
  try {
    initializeEnhancedUIComponents();

    // Initialize enhanced affordability system
    initializeEnhancedAffordabilitySystem();

    // Initialize enhanced button interactions with Framer Motion
    try {
      enhanceButtonInteractions();
      logger.info('Enhanced button interactions initialized');
    } catch (error) {
      logger.warn('Failed to initialize enhanced button interactions:', error);
    }

    // Initialize Soda Drinker Pro theme system
    addThemeStyles();
    // initializeSodaDrinkerProThemes(); // Disabled - using hybrid level system themes instead

    // Initialize authentic SDP experience
    initializeAuthenticSDP();

    // Initialize lightweight 3D soda button with performance optimization
    try {
      const soda3DButton = createSoda3DButton({
        containerSelector: '#sodaButton',
        size: 200,
        rotationSpeed: 1.0,
        hoverSpeedMultiplier: 2.0,
        performanceMode: 'medium', // Start with balanced performance
        frameRateLimit: 30, // 30fps default
        // clickAnimationDuration removed
      });

      // Store reference for performance management
      (window as any).soda3DButton = soda3DButton;

      // Click handler is now built into the 3D button
      // No need to add additional handlers

      logger.info('Lightweight 3D soda button initialized with performance optimization');
    } catch (error) {
      logger.error('Failed to initialize 3D soda button:', error);
    }

    // Initialize displays
    try {
      updateDrinkSpeedDisplayOptimized();
      updateClickValueDisplay();
    } catch (error) {
      logger.warn('Failed to initialize displays:', error);
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
    logger.debug('Initializing enhanced UI components...');

    // Initialize enhanced navigation
    initializeEnhancedNavigation();

    // Initialize dev tools manager
    devToolsManager.initialize();

    // Initialize enhanced audio manager
    enhancedAudioManager.startBackgroundMusic();

    // Initialize audio controls manager
    audioControlsManager.initialize();

    // Initialize enhanced top info bar
    topInfoBar.initializeElements();

    // Initialize enhanced progress bars
    drinkProgressBar.initializeElements('drink-progress-container');
    levelProgressBar.initializeElements('level-progress-container');

    // Initialize dev tools button
    initializeDevToolsButton();

    // Initialize secrets system
    initializeSecretsSystem();

    logger.info('Enhanced UI components initialized');
  } catch (error) {
    logger.warn('Failed to initialize enhanced UI components:', error);
  }
}

/**
 * Initialize dev tools button with correct state
 */
function initializeDevToolsButton(): void {
  try {
    const optionsData = getOptionsData();
    const devToolsEnabled = optionsData?.devToolsEnabled ?? false;

    const button = document.querySelector('.dev-toggle-btn');
    if (button) {
      button.textContent = `🔧 Dev Tools ${devToolsEnabled ? 'ON' : 'OFF'}`;
    }

    logger.debug('Dev tools button initialized:', devToolsEnabled ? 'ON' : 'OFF');
  } catch (error) {
    logger.warn('Failed to initialize dev tools button:', error);
  }
}

/**
 * Initialize secrets system and UI
 */
function initializeSecretsSystem(): void {
  try {
    const optionsData = getOptionsData();
    const secretsUnlocked = optionsData?.secretsUnlocked ?? false;
    const godTabEnabled = optionsData?.godTabEnabled ?? false;

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
    logger.debug('Secrets system initialized. Konami code detector active.');
    logger.debug(
      'Konami detector status:',
      konamiCodeDetector.isSecretsUnlocked() ? 'UNLOCKED' : 'LOCKED'
    );
    logger.debug('Secrets unlocked:', secretsUnlocked ? 'YES' : 'NO');
    logger.debug('God tab enabled:', godTabEnabled ? 'YES' : 'NO');
  } catch (error) {
    logger.warn('Failed to initialize secrets system:', error);
  }
}

// Initialize mobile navigation features
function initializeMobileNavigation(): void {
  // Mobile navigation is now handled by the sidebar navigation manager
  // No additional setup needed as the sidebar handles mobile interactions
  logger.debug('Mobile navigation initialized via sidebar system');
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

  // Check if critical elements are ready before updating
  if (
    !domQuery.exists('#sodaButton') ||
    !domQuery.exists('#shopTab') ||
    !domQuery.exists('#topSipValue')
  ) {
    // Critical elements not ready, retry
    timerManager.setTimeout(updateAllDisplays, 100, 'Retry display update');
    return;
  }

  // Use optimized batch update for better performance
  updateAllDisplaysOptimized();
  uiBatcher.schedule('updateClickValueDisplay', updateClickValueDisplay, 'normal');
  uiBatcher.schedule('updateProductionSummary', updateProductionSummary, 'normal');
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
    logger.warn('Failed to update enhanced UI components:', error);
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
    // No fallback - fail fast instead
    throw new Error('Display update failed - no fallback available');
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
      domQuery.getById('statsTab')?.classList?.contains('active')
    ) {
      updateAllStats();
    }
    if (Math.random() < 0.1) {
      checkUpgradeAffordability();
    }
  });
}
