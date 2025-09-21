// Main Game Logic - Modular architecture (TypeScript)
// Thin shim that preserves runtime behavior while migration continues.

// Re-export nothing; this file sets up globals used by HTML and other modules

// Bring over the JS file contents verbatim with minimal edits for TypeScript
// We import the existing JS via a triple-slash reference to keep order under Vite
// but here we inline the logic from original main.js, adapted for TS types.

// Ported inline from original main.js (TS-ified minimal changes)
// Removed unused import

import { domQuery } from './services/dom-query';
import { timerManager } from './services/timer-manager';
import { getStoreActions } from './core/state/zustand-store';
import { pwaService } from './services/pwa-service';
import { errorHandler } from './core/error-handling/error-handler';

import { config as GC } from './config';
// Decimal is declared in global types

// Test utilities removed - no longer needed

// These are used in the game configuration
const BAL = (GC && GC.BALANCE) || {};
const TIMING = (GC && GC.TIMING) || {};
const LIMITS = (GC && GC.LIMITS) || {};

// Use the variables to avoid unused warnings
if (BAL && TIMING && LIMITS) {
  // Configuration loaded successfully
}

(function ensureDomReady() {
  try {
    if (typeof document === 'undefined') {
      errorHandler.handleError(new Error('Document not available'), 'checkDOMReadiness', {
        critical: true,
      });
      return;
    }
    if (document.readyState === 'loading') {
      errorHandler.handleError(new Error('DOM still loading'), 'checkDOMReadiness', {
        severity: 'low',
      });
    }
  } catch (error) {
    errorHandler.handleError(error, 'checkDOMReadiness');
  }
})();

// Import modular systems at the top
import { saveGameLoader } from './core/systems/save-game-loader';
import { mobileInputHandler } from './ui/mobile-input';
import { bootstrapSystem } from './core/systems/bootstrap';
import { processOfflineProgression } from './core/systems/offline-progression';
import { showOfflineModal } from './ui/offline-modal';
import { sidebarNavigation } from './ui/sidebar-navigation';
import { sodaDrinkerHeaderService } from './services/soda-drinker-header-service';
import { start as startLoop } from './core/systems/loop-system';
// DecimalOps removed - no longer using toSafeNumber

// Export for potential use
// Export initGame for proper module access
export { initGame };

function initGame() {
  try {
    // Starting game initialization
    // Modernized - unlocks system always available
    if (typeof document === 'undefined' || !domQuery.exists('#sodaButton')) {
      timerManager.setTimeout(initGame, 100, 'Retry initGame - DOM not ready');
      return;
    }

    // Initialize PWA service (skip in tests)
    try {
      if (!(typeof window !== 'undefined' && (window as any).__TEST_ENV__ === true)) {
        pwaService.getStatus(); // This initializes the service

        // Check PWA installability
        const isInstallable = pwaService.checkInstallability();

        if (!isInstallable) {
          pwaService.getDetailedStatus();
        }

        // Add install button click handler
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
          installButton.addEventListener('click', async () => {
            try {
              await pwaService.installApp();
            } catch (error) {
              errorHandler.handleError(error, 'pwaInstallation', { action: 'install' });
            }
          });
        }
      }
    } catch (error) {
      errorHandler.handleError(error, 'pwaServiceInitialization');
    }
    if (!GC || (typeof GC === 'object' && Object.keys(GC).length === 0)) {
      // GAME_CONFIG must be available - fail fast if not
      throw new Error('GAME_CONFIG not available - configuration must be loaded before initGame');
    }

    const CONF = GC;
    const BAL = CONF.BALANCE;
    const TIMING = CONF.TIMING;

    // Initialize state through Zustand store
    // All state is now managed through Zustand store

    const DEFAULT_DRINK_RATE = TIMING.DEFAULT_DRINK_RATE;
    const drinkRate = DEFAULT_DRINK_RATE;
    let lastDrinkTime = Date.now() - DEFAULT_DRINK_RATE;
    try {
      const actions = getStoreActions();
      actions.setLastDrinkTime(lastDrinkTime);
      actions.setDrinkRate(drinkRate);
    } catch (error) {
      errorHandler.handleError(error, 'setDrinkTimeState', { lastDrinkTime, drinkRate });
    }
    // Legacy global property bridge removed - use store directly

    // Variables removed - using proper state management instead
    // Critical clicks now managed through store

    try {
      // Modernized - autosave status updates handled by store
    } catch (error) {
      errorHandler.handleError(error, 'updateAutosaveStatus');
    }
    const gameStartTime = Date.now();
    // let lastSaveTime: any = null; // Legacy variable removed
    // Legacy global property bridge removed - use store directly
    try {
      const actions = getStoreActions();
      actions.setSessionStartTime(gameStartTime);
      // totalPlayTime managed by store
    } catch (error) {
      errorHandler.handleError(error, 'setSessionStartTime', { gameStartTime });
    }

    let gameStartDate = Date.now();
    try {
      const actions = getStoreActions();
      actions.setSessionStartTime(Number(gameStartDate));
    } catch (error) {
      errorHandler.handleError(error, 'setGameStartDate');
    }
    try {
      // Modernized - lastClickTime managed by store
    } catch (error) {
      errorHandler.handleError(error, 'setLastClickTime');
    }

    try {
      // DOM is already ready, no initialization needed
    } catch (error) {
      errorHandler.handleError(error, 'verifyDOMReadiness');
    }

    // Load save using storage service (validated)
    let savegame: any = null;
    try {
      // top-level import to avoid await in non-async
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { AppStorage } = require('./services/storage');
      savegame = AppStorage.loadGame();
    } catch (e) {
      errorHandler.handleError(e, 'loadSave', { fallback: 'starting fresh' });
      savegame = null;
    }

    // Use modular save game loader
    saveGameLoader.loadGameState(savegame);

    try {
      // Modernized - events handled by store
    } catch (error) {
      errorHandler.handleError(error, 'emitGameLoadedEvent');
    }

    // Check for offline progression if this was a returning player
    if (savegame && !(typeof window !== 'undefined' && (window as any).__TEST_ENV__ === true)) {
      try {
        // Delay offline progression check to ensure state is fully loaded
        timerManager.setTimeout(
          () => {
            const offlineResult = processOfflineProgression({
              maxOfflineHours: 8, // Cap at 8 hours
              minOfflineMinutes: 1, // Show modal if away for 1+ minutes
              offlineEfficiency: 1.0, // Full efficiency offline
            });

            if (offlineResult) {
              // Show welcome back modal with offline earnings
              showOfflineModal(offlineResult, {
                showParticles: true,
                autoCloseAfter: 0, // No auto-close, let player claim
                playSound: false, // No sound for now
              });
            }
          },
          500,
          'Offline progression check'
        );
      } catch (error) {
        errorHandler.handleError(error, 'processOfflineProgression');
      }
    }

    // Use Zustand store for state management instead of local variables
    // Get current state from store
    // Compute production
    const config = BAL || {};

    // Configuration values are used for state updates through the store system

    // Handle Decimal results properly - convert to numbers
    try {
      // Use safe conversion to handle extreme values without returning Infinity
      // Preserve extreme SPD values - don't use toSafeNumber
      // Modernized - use actual values from store
      // Values are used for state updates but not directly referenced

      // Store values directly in Zustand store instead of local variables

      // Update Zustand store with recalculated values
      try {
        // Modernized - state updates handled by store
      } catch (error) {
        errorHandler.handleError(error, 'updateStoreWithRecalculatedSPD');
      }
    } catch (error) {
      errorHandler.handleError(error, 'handleDecimalResults');
    }

    // Production calculation using store values
    try {
      // Create Decimal values for configuration
      new Decimal(config.STRAW_BASE_SPD);
      new Decimal(config.CUP_BASE_SPD);
      new Decimal(config.BASE_SIPS_PER_DRINK);

      // Update store with values
      // Modernized - state updates handled by store
    } catch (error) {
      errorHandler.handleError(error, 'updateStoreWithValues');
    }

    // Restore drink timing if present in save
    try {
      if (savegame) {
        if (typeof savegame.lastDrinkTime === 'number' && savegame.lastDrinkTime > 0) {
          lastDrinkTime = savegame.lastDrinkTime;
        } else if (typeof savegame.drinkProgress === 'number' && savegame.drinkProgress >= 0) {
          const progressMs = (savegame.drinkProgress / 100) * drinkRate;
          lastDrinkTime = Date.now() - progressMs;
        }
      }
    } catch (error) {
      errorHandler.handleError(error, 'restoreDrinkTiming');
    }

    // Seed Zustand store snapshot
    try {
      // State is already managed through the store, no need to seed again
      // The store already contains the loaded/initialized values
    } catch (error) {
      errorHandler.handleError(error, 'seedZustandStore');
    }

    // Update UI displays after ensuring DOM cache is ready
    const updateDisplaysWhenReady = () => {
      // DOM cache replaced with domQuery service
      if (!domQuery.exists('#sodaButton') || !domQuery.exists('#topSipValue')) {
        // Waiting for DOM elements
        timerManager.setTimeout(
          updateDisplaysWhenReady,
          100,
          'Retry display update - DOM not ready'
        );
        return;
      }
      // DOM elements ready, updating displays
      // Modernized - UI updates handled by store
    };
    updateDisplaysWhenReady();
    try {
      // Modernized - unlocks system handled by store
    } catch (error) {
      errorHandler.handleError(error, 'initializeUnlocksSystem');
    }

    // Initialize mobile input handling using modular system
    mobileInputHandler.initialize();

    // Initialize sidebar navigation
    try {
      sidebarNavigation.forceInitialize();
    } catch (error) {
      errorHandler.handleError(error, 'initializeSidebarNavigation');
    }

    // Initialize Soda Drinker Pro header
    try {
      sodaDrinkerHeaderService
        .initialize()
        .then(() => {
          // Header initialized successfully
        })
        .catch(error => {
          errorHandler.handleError(error, 'initializeSodaDrinkerProHeader');
        });
    } catch (error) {
      errorHandler.handleError(error, 'initializeSodaDrinkerProHeader');
    }

    try {
      // Modernized - audio system handled by store
    } catch (error) {
      errorHandler.handleError(error, 'initializeButtonAudioSystem');
    }
    try {
      // Modernized - audio button handled by store
    } catch (error) {
      errorHandler.handleError(error, 'updateButtonSoundsToggle');
    }
  } catch (error) {
    errorHandler.handleError(error, 'initGame', { critical: true });

    // Always try to show the game even if initialization fails
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (splashScreen && gameContent) {
      try {
        splashScreen.style.display = 'none';
        splashScreen.style.visibility = 'hidden';
        splashScreen.style.pointerEvents = 'none';
        if (splashScreen.parentNode) splashScreen.parentNode.removeChild(splashScreen);
      } catch (e) {
        errorHandler.handleError(e, 'hideSplashScreen');
      }

      try {
        gameContent.style.display = 'block';
        gameContent.style.visibility = 'visible';
        gameContent.style.opacity = '1';
        gameContent.classList?.add('active');
        document.body?.classList?.add('game-started');
      } catch (e) {
        errorHandler.handleError(e, 'showGameContent');
      }

      // DOM elements are already available, no reinitialization needed

      // Try to start a minimal game loop even if initGame failed
      try {
        // const w = window as any;
        // Loop system access modernized - using direct import
        if (startLoop) {
          startLoop({
            updateDrinkProgress: () => {},
            processDrink: async () => {},
            updateStats: () => {},
            updateUI: () => {},
            updatePlayTime: () => {},
            updateLastSaveTime: () => {},
          });
        }
      } catch (e) {
        errorHandler.handleError(e, 'startMinimalGameLoop');
      }
    }
  }
}

// Function removed - duplicate of mobile-input.ts version

// startGame function removed - functionality moved to proper modules

// Debug functions removed - use proper module imports instead

// Initialize game when ready using bootstrap system
bootstrapSystem.initializeGameWhenReady(initGame);
