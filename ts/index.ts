// Entry module providing a small public API surface and environment checks (TypeScript)

// Module loading
(window as any).__tsIndexLoaded = true;

// import { useGameStore } from './core/state/zustand-store'; // Removed - using dynamic import instead
import { optimizedEventBus } from './services/optimized-event-bus';
import { performanceMonitor } from './services/performance';
import './config';
import './core/constants';
import { errorHandler } from './core/error-handling/error-handler';
// ServiceLocator removed - using Zustand store directly
// Decimal import removed - using toDecimal from simplified.ts
import { toDecimal } from './core/numbers/simplified';
// processDrinkFactory removed - using direct processDrink function
// DOM migration completed - using modern domQuery service
import './god';
// Static imports removed - using dynamic imports instead
import { processDrinkFactory } from './core/systems/drink-system';
import { useGameStore } from './core/state/zustand-store';
import { systemInitializationManager } from './core/systems/system-initialization';

// Create the processDrink function using the factory
const processDrink = processDrinkFactory();
// Add all critical system imports to avoid dynamic import issues
import * as storageModule from './services/storage';
// System module imports removed - using direct imports instead
// UI module import removed - using direct imports instead
import * as levelSelectorModule from './ui/level-selector';

// Setting up App object
// Environment system replaced by hybrid level system
import { hybridLevelSystem } from './core/systems/hybrid-level-system';
import { startGameCore } from './core/systems/game-init';
import { start } from './core/systems/loop-system';
import { FEATURE_UNLOCKS } from './feature-unlocks';
import {
  updateDrinkProgress as uiUpdateDrinkProgress,
  updatePlayTime,
  updateLastSaveTime,
  updateAllStats,
  updatePurchasedCounts,
  checkUpgradeAffordability,
  updateTopSipCounter,
  updateTopSipsPerDrink,
  updateTopSipsPerSecond,
  updateLevelNumber,
  updateEnhancedProgressBars,
  initializeUI,
} from './ui/index';
import {
  initButtonAudioSystem,
  playButtonClickSound,
  updateButtonSoundsToggleButton,
} from './core/systems/button-audio';
import { AppStorage as storageImpl } from './services/storage';
import './main';

// Import functions that are referenced in the code
import { initGame } from './main';
import { config as GC } from './config';
import { installDomReadyBootstrap } from './core/systems/bootstrap';

let storage: any = storageImpl;
// Use optimized event bus
// Event bus exposed through proper module exports instead of globals

let EVENT_NAMES: any = {};

// Diagnostics removed

// Starting App initialization
// Report resolved base for dynamic imports
try {
  // BASE_URL = import.meta.env.BASE_URL
} catch (error) {
  errorHandler.handleError(error, 'getBaseURL', { base: import.meta.env.BASE_URL });
}

// Initialize Zustand store

// Modernized - App object initialization handled by store
// Legacy compatibility removed - using pure Zustand store
const App = {
  // No state bridge - use useGameStore directly
  store: useGameStore, // Expose store for direct access
  storage: storageImpl,
  events: optimizedEventBus,
  EVENT_NAMES,
  rules: { clicks: {}, purchases: {}, economy: {} },
  systems: {
    resources: {},
    purchases: {},
    unlockPurchases: {},
    clicks: {},
    autosave: {},
    save: {},
    options: {},
    loop: { start },
    audio: {
      button: {
        initButtonAudioSystem,
        playButtonClickSound,
        updateButtonSoundsToggleButton,
      },
    },
    gameInit: { startGameCore },
    drink: { processDrink },
    unlocks: { checkAllUnlocks: FEATURE_UNLOCKS.checkAllUnlocks },
    hybridLevel: hybridLevelSystem,
    dev: {},
  },
  ui: {
    updateDrinkProgress: uiUpdateDrinkProgress,
    updatePlayTime,
    updateLastSaveTime,
    updateAllStats,
    updatePurchasedCounts,
    checkUpgradeAffordability,
    updateTopSipCounter,
    updateTopSipsPerDrink,
    updateTopSipsPerSecond,
    updateEnhancedProgressBars,
    initializeUI,
  },
  data: {},
  performance: performanceMonitor, // Performance monitoring
} as any;

// Export for proper module access
if (typeof window !== 'undefined') {
  // App object no longer assigned to globalThis - use proper module exports
  // Expose functions that HTML expects
  (globalThis as any).startGame = startGameCore;
  (globalThis as any).initGame = initGame;
}

// Initial theme will be applied by save system after loading game state
// This prevents theme conflicts during initialization

// App created

// Static wiring of core systems/UI for deterministic bootstrap
try {
  // Create lazy loading system for critical modules

  // Inline loop system to avoid import hanging issues in production

  // Initialize Zustand store with default values
  useGameStore.setState({
    sips: toDecimal(0),
    spd: toDecimal(1),
    level: 1,
    drinkRate: 1000,
    drinkProgress: 0,
    lastDrinkTime: Date.now() - 2000, // Set to 2 seconds ago so drinks can process immediately
    totalClicks: 0,
    totalSipsEarned: toDecimal(0),
    highestSipsPerSecond: toDecimal(0),
    suctionClickBonus: 0,
    options: {
      autosaveEnabled: true,
      autosaveInterval: 30,
      clickSoundsEnabled: true,
      musicEnabled: true,
      devToolsEnabled: false,
      secretsUnlocked: false,
      godTabEnabled: false,
    },
  });
  // Zustand store initialized

  // Store the store itself for direct access if needed
  (App as any).store = useGameStore;

  // Initial UI update to show current state
  setTimeout(() => {
    try {
      updateTopSipCounter();
      updateTopSipsPerDrink();
      updateTopSipsPerSecond();
      updateLevelNumber();
    } catch (error) {
      errorHandler.handleError(error, 'initialUIUpdate');
    }
  }, 100); // Small delay to ensure DOM is ready

  // Set up store subscriptions for automatic UI updates

  // Subscribe to state changes and trigger UI updates
  useGameStore.subscribe((state, prevState) => {
    try {
      // Only update UI if state actually changed
      if (state !== prevState) {
        // Debounce UI updates to prevent excessive re-renders
        setTimeout(() => {
          try {
            // Check if DOM is ready before updating UI
            if (typeof document !== 'undefined' && document.readyState === 'complete') {
              // Update header displays that should always be visible
              updateTopSipCounter();
              updateTopSipsPerDrink();
              updateTopSipsPerSecond();
              updateLevelNumber();

              // Update tab-specific displays
              updateAllStats();
              checkUpgradeAffordability();
              updatePurchasedCounts();
            }
          } catch (error) {
            errorHandler.handleError(error, 'storeSubscriptionUIUpdate');
          }
        }, 16); // ~60fps
      }
    } catch (error) {
      errorHandler.handleError(error, 'storeSubscription');
    }
  });

  // Modernized drink system using only Zustand store
  // Drink system is available through direct import - no global assignment needed

  // Load hybrid level system early so UI can access it
  // Hybrid level system is available through direct import - no global assignment needed

  // Loop system is available through direct import - no global assignment needed

  // Other systems can load asynchronously
  // Core static wiring ok

  // Initialize all systems with loading screen
  const initializeGame = async () => {
    try {
      // Initialize all systems with progress tracking
      await systemInitializationManager.initializeAllSystems();

      // Ensure baseline timing state
      const st = useGameStore.getState();
      const CFG = GC as any;
      const TIMING = (CFG.TIMING || {}) as any;
      const DEFAULT_RATE = Number(TIMING.DEFAULT_DRINK_RATE || 5000);
      if (!st.drinkRate || Number(st.drinkRate) <= 0) {
        useGameStore.setState({ drinkRate: DEFAULT_RATE });
      }
      if (!st.lastDrinkTime || st.lastDrinkTime <= 0) {
        useGameStore.setState({ lastDrinkTime: Date.now() - DEFAULT_RATE });
      }

      // Call initGame if present
      if (typeof initGame === 'function') {
        initGame();
      }

      // Check if loop system is available
      const loopStart = start;
      if (typeof loopStart !== 'function') {
        throw new Error('Loop system not available or start method is not a function');
      }

      // Starting game loop
      loopStart({
        updateDrinkProgress: () => {
          try {
            const state = useGameStore.getState();
            const now = Date.now();
            const last = Number(state.lastDrinkTime ?? 0);
            const rate = Number(state.drinkRate || 5000);

            // Debug the timing values
            console.log('📊 updateDrinkProgress debug:', {
              now,
              lastDrinkTime: last,
              rate,
              timeSinceLastDrink: now - last,
              drinkProgress: state.drinkProgress,
            });

            const pct = Math.min(((now - last) / Math.max(rate, 1)) * 100, 100);

            console.log('📊 updateDrinkProgress:', {
              pct,
              shouldUpdate: pct !== state.drinkProgress,
            });

            useGameStore.setState({ drinkProgress: pct });
            // Also update the classic progress UI directly for immediate feedback
            uiUpdateDrinkProgress(pct, rate);

            // Note: updateDrinkProgress is called from the game loop
          } catch (error) {
            errorHandler.handleError(error, 'updateDrinkProgress', { critical: true });
          }
        },
        processDrink: () => {
          // Note: processDrink is called from the main game loop, not here
          // This is just a wrapper to handle errors
          try {
            processDrink();
          } catch (error) {
            errorHandler.handleError(error, 'processDrink', { critical: true });
          }
        },
        updateStats: () => {
          try {
            // Update header displays that should always be visible
            try {
              updateTopSipCounter();
              updateTopSipsPerDrink();
              updateTopSipsPerSecond();
              updateLevelNumber();
            } catch (error) {
              errorHandler.handleError(error, 'updateHeaderDisplays', { inLoop: true });
            }

            // Update tab-specific displays
            try {
              updateAllStats();
            } catch (error) {
              errorHandler.handleError(error, 'updateAllStats', { inLoop: true });
            }

            // Check for level unlocks
            try {
              const newlyUnlockedLevels = hybridLevelSystem?.checkForUnlocks?.();
              if (newlyUnlockedLevels && newlyUnlockedLevels.length > 0) {
                // Show notifications for newly unlocked levels
                try {
                  const levelSelector = (levelSelectorModule as any).levelSelector;
                  if (levelSelector && levelSelector.showUnlockNotification) {
                    newlyUnlockedLevels.forEach((levelId: number) => {
                      levelSelector.showUnlockNotification(levelId);
                    });
                  }
                } catch (error) {
                  errorHandler.handleError(error, 'showLevelUnlockNotifications', {
                    newlyUnlockedLevels,
                  });
                }
              }
            } catch (error) {
              errorHandler.handleError(error, 'checkLevelUnlocks');
            }
          } catch (error) {
            errorHandler.handleError(error, 'updateStats', { critical: true });
          }
        },
        updatePlayTime: () => {
          try {
            // Update play time display
            updatePlayTime();
          } catch (error) {
            errorHandler.handleError(error, 'updatePlayTime', { critical: true });
          }
        },
        updateLastSaveTime: () => {
          try {
            // Update last save time display
            updateLastSaveTime();
          } catch (error) {
            errorHandler.handleError(error, 'updateLastSaveTime', { critical: true });
          }
        },
        updateUI: () => {
          try {
            // Update header displays that should always be visible
            updateTopSipCounter();
            updateTopSipsPerDrink();
            updateTopSipsPerSecond();
            updateLevelNumber();

            // Update tab-specific displays
            updateAllStats();
            checkUpgradeAffordability();
            updatePurchasedCounts();
            // Enhanced progress bars (new UI)
            updateEnhancedProgressBars();
          } catch (error) {
            errorHandler.handleError(error, 'updateUI', { critical: true });
          }
        },
      });
    } catch (error) {
      errorHandler.handleError(error, 'initializeGame', { critical: true });
      throw error;
    }
  };

  // Start initialization
  initializeGame().catch(error => {
    errorHandler.handleError(error, 'gameInitialization', { critical: true });
  });
} catch (e) {
  errorHandler.handleError(e, 'criticalSystemsLoading', {
    critical: true,
    message: (e as any)?.message,
    stack: (e as any)?.stack,
    name: (e as any)?.name,
    type: typeof e,
  });
  // core-static wiring failed
  // Re-throw to ensure the error is not silently ignored
  throw e;
}

// Load async systems before tryBoot
// Hybrid level system already loaded above

// tryBoot is now called inside the async try block after systems are loaded

// Legacy forced splash fallback removed: loading screen has its own watchdog Continue button

// initOnDomReady diagnostics removed
try {
  const isTestEnv = typeof window !== 'undefined' && (window as any).__TEST_ENV__ === true;
  if (!isTestEnv) {
    setTimeout(() => {
      try {
        // initOnDomReady call removed
        // initOnDomReady default invoked
      } catch (error) {
        errorHandler.handleError(error, 'pushDiagnosticInfo');
      }
    }, 0);
  }
} catch (error) {
  errorHandler.handleError(error, 'initializeDiagnosticSystem');
}

// Remove early dynamic imports; core is now statically wired above for stability

// Initialize UI immediately when available
try {
  // Modernized - UI initialization handled by store
  // UI initialization modernized
  // UI initialized
} catch (e) {
  // UI init failed
}

// Install unified DOMContentLoaded bootstrap
try {
  installDomReadyBootstrap();
} catch (error) {
  errorHandler.handleError(error, 'installDomReadyBootstrap');
}

// Initialize button audio system on first user interaction (prevents autoplay warnings)
try {
  const isTestEnv = typeof window !== 'undefined' && (window as any).__TEST_ENV__ === true;
  if (!isTestEnv) {
    const unlock = () => {
      try {
        // Modernized - audio system handled by store
      } catch (error) {
        errorHandler.handleError(error, 'initializeAudioSystem');
      }
      try {
        document.removeEventListener('pointerdown', unlock, true);
        document.removeEventListener('touchstart', unlock, true);
        document.removeEventListener('click', unlock, true);
        document.removeEventListener('keydown', unlock, true);
        document.removeEventListener('mousedown', unlock, true);
        document.removeEventListener('touchend', unlock, true);
      } catch (error) {
        errorHandler.handleError(error, 'removeEventListeners');
      }
    };
    document.addEventListener('pointerdown', unlock, { capture: true, once: true } as any);
    document.addEventListener('touchstart', unlock, { capture: true, once: true } as any);
    document.addEventListener('click', unlock, { capture: true, once: true } as any);
    document.addEventListener('keydown', unlock, { capture: true, once: true } as any);
    document.addEventListener('mousedown', unlock, { capture: true, once: true } as any);
    document.addEventListener('touchend', unlock, { capture: true, once: true } as any);
    // audio init setup installed
  } else {
    // audio init skipped in test
  }
} catch (e) {
  // audio init failed
}

try {
  // Modernized - event names handled by store
  // Modernized - event names handled by store
  // EVENT_NAMES no longer assigned to window - use proper module exports
} catch (error) {
  errorHandler.handleError(error, 'exposeEventNamesGlobally');
}

// Convenience: expose live actions getter at App.actions for console/dev usage
try {
  // Modernized - actions handled by store
  // Modernized - actions handled by store
  // App.actions no longer defined on window - use proper module exports
} catch (error) {
  errorHandler.handleError(error, 'exposeAppActionsGetter');
}

// State bridge removed - no longer needed

try {
  // Modernized - UI module handled by store
  // Modernized - UI module handled by store
  // UI system modernized - no global assignment needed
  // ui import ok
  // Initialize UI system
  try {
    const isTestEnv = typeof window !== 'undefined' && (window as any).__TEST_ENV__ === true;
    if (!isTestEnv) {
      initializeUI();
    }
  } catch {}
} catch (e) {
  errorHandler.handleError(e, 'uiSystemInitialization', { critical: true });
}

try {
  // unlocks already loaded early
} catch (e) {
  errorHandler.handleError(e, 'unlocksSystemLoad', { severity: 'low' });
}

try {
  const st = storageModule;
  storage = (st as any).AppStorage ? (st as any).AppStorage : storage;
  try {
    // Storage no longer assigned to window - use proper module exports
  } catch (error) {
    errorHandler.handleError(error, 'exposeStorageGlobally');
  }
} catch (e) {
  // storage import failed
  errorHandler.handleError(e, 'storageServiceLoad', { severity: 'low' });
}

try {
  // Resources system modernized - no global assignment needed
} catch (e) {
  // resources import failed
  errorHandler.handleError(e, 'resourcesSystemLoad', { severity: 'low' });
}
try {
  // Purchases system modernized - no global assignment needed
} catch (e) {
  // purchases import failed
  errorHandler.handleError(e, 'purchasesSystemLoad', { severity: 'low' });
}
// Loop system already loaded above - skipping duplicate load
try {
  // Save system modernized - no global assignment needed
} catch (e) {
  // save import failed
  errorHandler.handleError(e, 'saveSystemLoad', { severity: 'low' });
}
// Drink system already loaded above - skipping duplicate load
try {
  // Clicks system modernized - no global assignment needed
} catch (e) {
  // clicks import failed
  errorHandler.handleError(e, 'clicksSystemLoad', { severity: 'low' });
}
try {
  // Audio system modernized - no global assignment needed
} catch (e) {
  // button-audio import failed
  errorHandler.handleError(e, 'buttonAudioSystemLoad', { severity: 'low' });
}
try {
  // Autosave system modernized - no global assignment needed
} catch (e) {
  // autosave import failed
  errorHandler.handleError(e, 'autosaveSystemLoad', { severity: 'low' });
}
try {
  // Dev system modernized - no global assignment needed
} catch (e) {
  // dev import failed
  errorHandler.handleError(e, 'devSystemLoad', { severity: 'low' });
}

// game-init already loaded early

// Services already registered earlier
// index end

// Pages-only safety: seed minimal state if initGame isn't present soon, so loop can tick
try {
  const seedIfNeeded = () => {
    try {
      // Check if game is already initialized
      if (typeof initGame === 'function') return;
      const app = App;
      if (!app?.store?.setState) return;
      const CFG = GC as any;
      const BAL = (CFG.BALANCE || {}) as any;
      const TIMING = (CFG.TIMING || {}) as any;
      const DEFAULT_RATE = Number(TIMING.DEFAULT_DRINK_RATE || 5000);
      const now = Date.now();
      const lastDrinkTime = now - DEFAULT_RATE;

      // Set last drink time and drink rate through proper state management
      const DecimalCtor = Decimal;
      if (!DecimalCtor) {
        errorHandler.handleError(
          new Error('Decimal constructor not available'),
          'decimalConstructorCheck',
          { critical: true }
        );
        return;
      }
      const toDec = (v: any) => new DecimalCtor(String(v ?? 0));
      const baseSPD = BAL.BASE_SIPS_PER_DRINK ?? 1;
      const strawBaseSPD = BAL.STRAW_BASE_SPD ?? 0.6;
      const cupBaseSPD = BAL.CUP_BASE_SPD ?? 1.2;

      app.store.setState({
        sips: toDec(0),
        straws: toDec(0),
        cups: toDec(0),
        suctions: toDec(0),
        widerStraws: toDec(0),
        betterCups: toDec(0),
        fasterDrinks: toDec(0),
        // criticalClicks removed - using proper state management
        level: toDec(1),
        spd: toDec(baseSPD),
        strawSPD: toDec(strawBaseSPD),
        cupSPD: toDec(cupBaseSPD),
        drinkRate: DEFAULT_RATE,
        drinkProgress: 0,
        lastDrinkTime: lastDrinkTime,
      });
      // seed ok
    } catch (e) {
      // seed failed
    }
  };
  try {
    const isTestEnv = typeof window !== 'undefined' && (window as any).__TEST_ENV__ === true;
    if (!isTestEnv) {
      setTimeout(seedIfNeeded, 400);
    }
  } catch {}
} catch (error) {
  errorHandler.handleError(error, 'outerTryBootInitialization', { critical: true });
  // Re-throw to ensure the error is not silently ignored
  throw error;
}

try {
  // initOnDomReady no longer on window - use proper module exports
} catch (error) {
  errorHandler.handleError(error, 'domReadyInitialization', { severity: 'low' });
}

export {};
