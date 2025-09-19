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
import { useGameStore } from './core/state/zustand-store';
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
// DecimalOps removed - no longer using toSafeNumber

// Export for potential use
// Export initGame for proper module access
export { initGame };

function initGame() {
  try {
    // Starting game initialization
    console.log('🔧 Starting game initialization...');
    console.log('🔧 Unlocks system available:', true); // Modernized - always available
    // Modernized - unlocks system always available
    if (typeof document === 'undefined' || !domQuery.exists('#sodaButton')) {
      console.log('⏳ Waiting for DOM elements to load...');
      console.log('🔧 Document ready state:', document?.readyState);
      console.log('🔧 Soda button exists:', domQuery.exists('#sodaButton'));
      console.log('🔧 Soda button element:', document?.getElementById('sodaButton'));
      timerManager.setTimeout(initGame, 100, 'Retry initGame - DOM not ready');
      return;
    }

    // Initialize PWA service
    try {
      pwaService.getStatus(); // This initializes the service
      console.log('📱 PWA service initialized');

      // Check PWA installability
      const isInstallable = pwaService.checkInstallability();
      console.log('📱 PWA installable:', isInstallable);

      if (!isInstallable) {
        const status = pwaService.getDetailedStatus();
        console.log('📱 PWA status:', status);
      }

      // Add install button click handler
      const installButton = document.getElementById('pwa-install-button');
      if (installButton) {
        installButton.addEventListener('click', async () => {
          try {
            const success = await pwaService.installApp();
            if (success) {
              console.log('✅ PWA installed successfully');
            } else {
              console.log('❌ PWA installation failed or was dismissed');
            }
          } catch (error) {
            errorHandler.handleError(error, 'pwaInstallation', { action: 'install' });
          }
        });
      }
    } catch (error) {
      errorHandler.handleError(error, 'pwaServiceInitialization');
    }
    if (!GC || (typeof GC === 'object' && Object.keys(GC).length === 0)) {
      console.log('⏳ Waiting for GAME_CONFIG to load...');
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
      useGameStore.getState().actions.setLastDrinkTime(lastDrinkTime);
      useGameStore.getState().actions.setDrinkRate(drinkRate);
    } catch (error) {
      errorHandler.handleError(error, 'setDrinkTimeState', { lastDrinkTime, drinkRate });
    }
    if (!Object.getOwnPropertyDescriptor(window, 'lastDrinkTime')) {
      Object.defineProperty(window, 'lastDrinkTime', {
        get() {
          return lastDrinkTime;
        },
        set(v) {
          lastDrinkTime = Number(v) || 0;
          try {
            // Modernized - use store directly
            useGameStore.getState().actions.setLastDrinkTime(lastDrinkTime);
          } catch (error) {
            errorHandler.handleError(error, 'setLastDrinkTimeViaBridge', { lastDrinkTime });
          }
        },
      });
    }

    // Variables removed - using proper state management instead
    // Critical clicks now managed through store

    try {
      // Modernized - autosave status updates handled by store
    } catch (error) {
      errorHandler.handleError(error, 'updateAutosaveStatus');
    }
    const gameStartTime = Date.now();
    let lastSaveTime: any = null;
    if (!Object.getOwnPropertyDescriptor(window, 'lastSaveTime')) {
      Object.defineProperty(window, 'lastSaveTime', {
        get() {
          try {
            return Number(useGameStore.getState().lastSaveTime ?? lastSaveTime ?? 0);
          } catch (error) {
            errorHandler.handleError(error, 'getLastSaveTimeFromAppState');
          }
          return Number(lastSaveTime || 0);
        },
        set(v) {
          lastSaveTime = Number(v) || 0;
          try {
            useGameStore.getState().actions.setLastSaveTime(lastSaveTime);
          } catch (error) {
            errorHandler.handleError(error, 'setLastSaveTimeInAppState', { lastSaveTime });
          }
        },
      });
    }
    try {
      useGameStore.getState().actions.setSessionStartTime(gameStartTime);
      // totalPlayTime managed by store
    } catch (error) {
      errorHandler.handleError(error, 'setSessionStartTime', { gameStartTime });
    }

    let gameStartDate = Date.now();
    try {
      useGameStore.getState().actions.setSessionStartTime(Number(gameStartDate));
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
      console.log('✅ DOM elements are ready');
    } catch (error) {
      errorHandler.handleError(error, 'verifyDOMReadiness');
    }

    // Load save using modular system
    let savegame: any = null;
    try {
      // Use localStorage directly for now
      savegame = JSON.parse(localStorage.getItem('save') as any);
    } catch (e) {
      errorHandler.handleError(e, 'loadSave', { fallback: 'starting fresh' });
      savegame = null;
    }

    // Use modular save game loader
    saveGameLoader.loadGameState(savegame);

    try {
      // Modernized - events handled by store
      console.log('Game loaded:', { save: !!savegame });
    } catch (error) {
      errorHandler.handleError(error, 'emitGameLoadedEvent');
    }

    // Check for offline progression if this was a returning player
    if (savegame) {
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
    const up = {
      straws: { baseSPD: config.STRAW_BASE_SPD },
      cups: { baseSPD: config.CUP_BASE_SPD },
      widerStraws: { multiplierPerLevel: config.WIDER_STRAWS_MULTIPLIER },
      betterCups: { multiplierPerLevel: config.BETTER_CUPS_MULTIPLIER },
    };

    const result = {
      base: {
        strawBaseSPD: up.straws.baseSPD,
        cupBaseSPD: up.cups.baseSPD,
        baseSipsPerDrink: config.BASE_SIPS_PER_DRINK,
      },
      multipliers: {
        widerStrawsPerLevel: up.widerStraws.multiplierPerLevel,
        betterCupsPerLevel: up.betterCups.multiplierPerLevel,
      },
    };

    // Handle Decimal results properly - convert to numbers
    try {
      // Use safe conversion to handle extreme values without returning Infinity
      // Preserve extreme SPD values - don't use toSafeNumber
      // Modernized - use actual values from store
      const strawSPDValue = result.base.strawBaseSPD;
      const cupSPDValue = result.base.cupBaseSPD;
      // Preserve extreme SPD values - don't use toSafeNumber
      const spdValue = result.base.baseSipsPerDrink;

      // Store values directly in Zustand store instead of local variables

      // Update Zustand store with recalculated values
      try {
        // Modernized - state updates handled by store
        console.log('State update modernized:', {
          strawSPD: strawSPDValue,
          cupSPD: cupSPDValue,
          spd: spdValue,
        });
      } catch (error) {
        errorHandler.handleError(error, 'updateStoreWithRecalculatedSPD');
      }
    } catch (error) {
      errorHandler.handleError(error, 'handleDecimalResults');
    }

    // Production calculation using store values
    try {
      const strawSPD = new Decimal(config.STRAW_BASE_SPD);
      const cupSPD = new Decimal(config.CUP_BASE_SPD);
      const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);

      // Update store with values
      // Modernized - state updates handled by store
      console.log('State update modernized:', {
        strawSPD: strawSPD,
        cupSPD: cupSPD,
        spd: baseSipsPerDrink,
      });
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
      if (
        !domQuery.exists('#sodaButton') ||
        !domQuery.exists('#shopTab') ||
        !domQuery.exists('#topSipValue')
      ) {
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
      console.log('Initializing sidebar navigation...');
      sidebarNavigation.forceInitialize();
      console.log('Sidebar navigation initialized:', sidebarNavigation);
    } catch (error) {
      errorHandler.handleError(error, 'initializeSidebarNavigation');
    }

    // Initialize Soda Drinker Pro header
    try {
      console.log('Initializing Soda Drinker Pro header...');
      sodaDrinkerHeaderService
        .initialize()
        .then(() => {
          console.log('Soda Drinker Pro header initialized');
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
      console.log('🔄 Game content is visible, DOM elements are ready');

      // Try to start a minimal game loop even if initGame failed
      try {
        // const w = window as any;
        // Loop system access modernized - using direct import
        const { startLoop } = require('./core/systems/loop-system');
        if (startLoop) {
          startLoop({
            updateDrinkProgress: () => {},
            processDrink: () => {},
            updateStats: () => {},
            updateUI: () => {},
            updatePlayTime: () => {},
            updateLastSaveTime: () => {},
          });
          console.log('🔄 Minimal game loop started');
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
