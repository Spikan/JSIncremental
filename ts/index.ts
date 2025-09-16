// Entry module providing a small public API surface and environment checks (TypeScript)

console.log('🚀 ts/index.ts module loading...');
console.log('🔧 Module execution started');
(window as any).__tsIndexLoaded = true;

import { useGameStore } from './core/state/zustand-store';
import { optimizedEventBus } from './services/optimized-event-bus';
import { performanceMonitor } from './services/performance';
import './config';
import './core/constants';
import { ServiceLocator, SERVICE_KEYS } from './core/services/service-locator';
import Decimal from 'break_eternity.js';
// DOM migration completed - using modern domQuery service
import './god';
// Static imports removed - using dynamic imports instead

console.log('🔧 Imports completed, setting up App object...');
// Environment system replaced by hybrid level system
import { hybridLevelSystem } from './core/systems/hybrid-level-system';
import { AppStorage as storageImpl } from './services/storage';
import './main';

// Import functions that are referenced in the code
import { initGame } from './main';
import { config as GC } from './config';

let storage: any = storageImpl;
// Use optimized event bus
// Event bus exposed through proper module exports instead of globals

let EVENT_NAMES: any = {};

// Diagnostics helper (no-op in dev)
function __pushDiag(_marker: any): void {
  // Diagnostics removed - no longer using window globals
}

console.log('🔧 index.ts starting App initialization...');
__pushDiag({ type: 'index', stage: 'start' });
// Report resolved base for dynamic imports
try {
  console.log('BASE_URL =', import.meta.env.BASE_URL);
  __pushDiag({ type: 'base', base: import.meta.env.BASE_URL, url: import.meta.url });
} catch {}

// Initialize Zustand store
console.log('🔧 Initializing Zustand store...');
const zustandStore = useGameStore;

// Modernized - App object initialization handled by store
// Legacy compatibility - minimal App object for existing code
// App object no longer assigned to window - use proper module exports instead
const App = {
  state: {
    ...zustandStore,
    actions: zustandStore.getState().actions, // Add actions for direct access
  }, // Consolidated Zustand store with actions
  storage,
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
    loop: { start: () => {} },
    audio: {
      button: {
        initButtonAudioSystem: () => {},
        playButtonClickSound: () => {},
        updateButtonSoundsToggleButton: () => {},
      },
    },
    gameInit: {},
    drink: { processDrink: () => {} },
    unlocks: { checkAllUnlocks: () => {} },
    hybridLevel: hybridLevelSystem,
    dev: {},
  },
  ui: {
    updateDrinkProgress: () => {},
    updatePlayTime: () => {},
    updateLastSaveTime: () => {},
    updateAllStats: () => {},
    updatePurchasedCounts: () => {},
    checkUpgradeAffordability: () => {},
    updateTopSipCounter: () => {},
    updateTopSipsPerDrink: () => {},
    updateTopSipsPerSecond: () => {},
    initializeUI: () => {},
  },
  data: {},
  performance: performanceMonitor, // Performance monitoring
  stateBridge: null,
} as any;

// Export for proper module access
if (typeof window !== 'undefined') {
  (globalThis as any).App = App;
}

// Initial theme will be applied by save system after loading game state
// This prevents theme conflicts during initialization

__pushDiag({ type: 'index', stage: 'app-created' });

// Static wiring of core systems/UI for deterministic bootstrap
try {
  // Create lazy loading system for critical modules
  console.log('🔧 Setting up lazy loading for critical systems...');

  // Create lazy-loaded loop system
  let loopModuleLoaded = false;
  let loopModulePromise: Promise<any> | null = null;

  App.systems.loop = {
    start: async (args: any) => {
      console.log('🔧 Loop system start called, loading module...');

      if (!loopModuleLoaded && !loopModulePromise) {
        loopModulePromise = import('./core/systems/loop-system')
          .then(module => {
            console.log('✅ Loop system module loaded');
            loopModuleLoaded = true;
            return module;
          })
          .catch(err => {
            console.warn('⚠️ Loop system module failed to load:', err.message);
            return null;
          });
      }

      if (loopModulePromise) {
        const module = await loopModulePromise;
        if (module && module.start) {
          console.log('🔧 Using real loop system');
          return module.start(args);
        }
      }

      // Fallback implementation
      console.log('🔧 Using fallback loop system');
      const tick = () => {
        try {
          if (args.updateDrinkProgress) args.updateDrinkProgress();
          if (args.processDrink) args.processDrink();
          if (args.updateUI) args.updateUI();
          if (args.updateStats) args.updateStats();
        } catch (error) {
          console.warn('Fallback loop error:', error);
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    stop: () => {
      console.log('🔧 Loop system stopped');
    },
  };

  console.log('✅ Lazy-loaded loop system created');

  // Load drink system immediately - also critical
  try {
    console.log('🔧 About to import drink system...');
    const drinkModule = (await Promise.race([
      import('./core/systems/drink-system'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Drink system import timeout')), 5000)
      ),
    ])) as any;
    console.log('🔧 Drink system import completed, processing factory...');
    const factory = drinkModule.processDrinkFactory?.({
      getApp: () => App,
      getGameConfig: () => (window as any).GAME_CONFIG,
      getSips: () => (window as any).sips,
      setSips: (value: any) => {
        (window as any).sips = value;
      },
      getSipsPerDrink: () => (window as any).sipsPerDrink,
      getDrinkRate: () => (window as any).drinkRate,
      getLastDrinkTime: () => (window as any).lastDrinkTime,
      getSpd: () => (window as any).spd,
      getTotalSipsEarned: () => App?.state?.getState?.()?.totalSipsEarned,
      getHighestSipsPerSecond: () => App?.state?.getState?.()?.highestSipsPerSecond,
      getLastAutosaveClockMs: () => (window as any).__lastAutosaveClockMs,
      setLastAutosaveClockMs: (value: number) => {
        (window as any).__lastAutosaveClockMs = value;
      },
    });
    if (factory) {
      App.systems.drink.processDrink = factory;
      console.log('✅ Drink system loaded');
    }
  } catch (e) {
    console.warn('⚠️ Failed to load drink system:', e);
    console.log('🔧 Creating fallback drink system...');
    // Create a minimal fallback drink system
    App.systems.drink = {
      processDrink: () => {
        console.log('🔧 Fallback drink system called');
        // Minimal fallback implementation
        try {
          const w: any = window;
          const state = w.App?.state?.getState?.() || {};
          const drinkRate = Number(state.drinkRate ?? 1000);
          const lastDrinkTime = Number(state.lastDrinkTime ?? 0);
          const now = Date.now();

          if (now - lastDrinkTime >= drinkRate) {
            const spd = Number(state.spd ?? 1);
            w.sips = (w.sips || 0) + spd;
            w.App?.state?.setState?.({
              sips: w.sips,
              lastDrinkTime: now,
              drinkProgress: 0,
            });
          }
        } catch (error) {
          console.warn('Fallback drink error:', error);
        }
      },
    };
    console.log('✅ Fallback drink system created');
  }

  // Other systems can load asynchronously
  console.log('🔧 Critical systems loaded, continuing with async systems...');
  console.log('🔧 About to call __pushDiag...');

  __pushDiag({ type: 'wire', module: 'core-static', ok: true });
  console.log('🔧 __pushDiag completed successfully');
} catch (e) {
  __pushDiag({
    type: 'wire',
    module: 'core-static',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
}

// Ensure a default, non-blocking initOnDomReady exists even if early imports stall
console.log('🔧 About to start tryBoot initialization...');
console.log('🔧 Reached tryBoot initialization section');

// Define tryBoot function outside of try block so it can run independently
let booted = false;
let retryCount = 0;
const maxRetries = 50; // 5 seconds max
const tryBoot = () => {
  console.log(`🔧 tryBoot called (attempt ${retryCount + 1}/${maxRetries})`);
  try {
    if (retryCount >= maxRetries) {
      console.error('❌ Max retries reached for loop system initialization');
      return;
    }
    retryCount++;
    // Ensure baseline timing state
    if (App?.state?.getState && App?.state?.setState) {
      const st = App.state.getState();
      const CFG = GC as any;
      const TIMING = (CFG.TIMING || {}) as any;
      const DEFAULT_RATE = Number(TIMING.DEFAULT_DRINK_RATE || 5000);
      if (!st.drinkRate || Number(st.drinkRate) <= 0) {
        App.state.setState({ drinkRate: DEFAULT_RATE });
      }
      if (!st.lastDrinkTime) {
        App.state.setState({ lastDrinkTime: Date.now() - DEFAULT_RATE });
      }
    }
    // Call initGame if present (one-time)
    if (!booted && typeof initGame === 'function') {
      try {
        console.log('🔧 Calling initGame...');
        initGame();
        console.log('✅ initGame completed successfully');
      } catch (error) {
        console.error('❌ initGame failed:', error);
      }
    }
    const loopStart = App?.systems?.loop?.start;
    console.log('🔧 Checking loop system availability:', !!loopStart);
    console.log('🔧 App.systems.loop:', App?.systems?.loop);
    console.log('🔧 Available methods:', Object.keys(App?.systems?.loop || {}));
    if (!booted && typeof loopStart === 'function') {
      console.log('🔧 Starting game loop...');
      loopStart({
        updateDrinkProgress: () => {
          try {
            const st = App?.state?.getState?.() || {};
            const now = Date.now();
            const last = Number(st.lastDrinkTime ?? 0);
            const rate = Number(st.drinkRate ?? 1000);
            const pct = Math.min(((now - last) / Math.max(rate, 1)) * 100, 100);
            App?.state?.setState?.({ drinkProgress: pct });
            App?.ui?.updateDrinkProgress?.(pct, rate);
          } catch {}
        },
        processDrink: () => {
          try {
            App?.systems?.drink?.processDrink?.();
          } catch {}
        },
        updateStats: () => {
          try {
            App?.ui?.updatePlayTime?.();
            App?.ui?.updateLastSaveTime?.();
            App?.ui?.updateAllStats?.();
            App?.ui?.updatePurchasedCounts?.();
            App?.ui?.checkUpgradeAffordability?.();
            App?.systems?.unlocks?.checkAllUnlocks?.();

            // Check for level unlocks
            try {
              const newlyUnlockedLevels = App?.systems?.hybridLevel?.checkForUnlocks?.();
              if (newlyUnlockedLevels && newlyUnlockedLevels.length > 0) {
                // Import and show notifications for newly unlocked levels
                import('./ui/level-selector')
                  .then(({ levelSelector }) => {
                    newlyUnlockedLevels.forEach((levelId: number) => {
                      levelSelector.showUnlockNotification(levelId);
                    });
                  })
                  .catch(error => {
                    console.warn('Failed to load level selector for notifications:', error);
                  });
              }
            } catch (error) {
              console.warn('Failed to check level unlocks:', error);
            }
          } catch {}
        },
        updatePlayTime: () => {
          try {
            App?.ui?.updatePlayTime?.();
          } catch {}
        },
        updateLastSaveTime: () => {
          try {
            App?.ui?.updateLastSaveTime?.();
          } catch {}
        },
        updateUI: () => {
          try {
            // Update individual header elements
            App?.ui?.updateTopSipCounter?.();
            App?.ui?.updateTopSipsPerDrink?.();
            App?.ui?.updateTopSipsPerSecond?.();
          } catch (error) {
            console.error('❌ updateUI error:', error);
          }
        },
      });
      booted = true;
      console.log('✅ Game loop started successfully');
      __pushDiag({ type: 'loop', stage: 'fallback-started' });
      return;
    } else {
      console.log(`⏳ Loop system not ready, retrying... (${retryCount}/${maxRetries})`);
    }
  } catch (error) {
    console.error('❌ Error in tryBoot:', error);
  }
  setTimeout(tryBoot, 100);
};

// Call tryBoot outside of any try block to ensure it runs
console.log('🔧 About to call tryBoot function...');
try {
  console.log('🔧 Calling tryBoot now...');
  tryBoot();
  console.log('🔧 tryBoot call completed');
} catch (error) {
  console.error('❌ Error calling tryBoot:', error);
}

// After 1s, force-show game content to avoid being stuck on splash
setTimeout(() => {
  try {
    const splash = document.getElementById('splashScreen') as any;
    const game = document.getElementById('gameContent') as any;
    if (splash && game && splash.style.display !== 'none') {
      console.log('🔄 Force-hiding splash screen after timeout');
      splash.style.display = 'none';
      splash.style.visibility = 'hidden';
      splash.style.pointerEvents = 'none';
      if (splash.parentNode) splash.parentNode.removeChild(splash);
      game.style.display = 'block';
      game.style.visibility = 'visible';
      game.style.opacity = '1';
      document.body?.classList?.add('game-started');
      __pushDiag({ type: 'splash', action: 'forced-hide' });
      // After forced hide, also try to boot the loop
      try {
        // Use proper module access instead of window globals
        let booted = false;
        const tryBoot2 = () => {
          try {
            const loopStart = App?.systems?.loop?.start;
            if (!booted && typeof loopStart === 'function') {
              loopStart({
                updateDrinkProgress: () => {
                  try {
                    const st = App?.state?.getState?.() || {};
                    const now = Date.now();
                    const last = Number(st.lastDrinkTime ?? 0);
                    const rate = Number(st.drinkRate ?? 1000);
                    const pct = Math.min(((now - last) / Math.max(rate, 1)) * 100, 100);
                    App?.state?.setState?.({ drinkProgress: pct });
                    App?.ui?.updateDrinkProgress?.(pct, rate);
                  } catch {}
                },
                processDrink: () => {
                  try {
                    App?.systems?.drink?.processDrink?.();
                  } catch {}
                },
                updateStats: () => {
                  try {
                    App?.ui?.updatePlayTime?.();
                    App?.ui?.updateLastSaveTime?.();
                    App?.ui?.updateAllStats?.();
                    App?.ui?.updatePurchasedCounts?.();
                    App?.ui?.checkUpgradeAffordability?.();
                    App?.systems?.unlocks?.checkAllUnlocks?.();

                    // Check for level unlocks
                    try {
                      const newlyUnlockedLevels = App?.systems?.hybridLevel?.checkForUnlocks?.();
                      if (newlyUnlockedLevels && newlyUnlockedLevels.length > 0) {
                        // Import and show notifications for newly unlocked levels
                        import('./ui/level-selector')
                          .then(({ levelSelector }) => {
                            newlyUnlockedLevels.forEach((levelId: number) => {
                              levelSelector.showUnlockNotification(levelId);
                            });
                          })
                          .catch(error => {
                            console.warn('Failed to load level selector for notifications:', error);
                          });
                      }
                    } catch (error) {
                      console.warn('Failed to check level unlocks:', error);
                    }
                  } catch {}
                },
                updatePlayTime: () => {
                  try {
                    App?.ui?.updatePlayTime?.();
                  } catch {}
                },
                updateLastSaveTime: () => {
                  try {
                    App?.ui?.updateLastSaveTime?.();
                  } catch {}
                },
                updateUI: () => {
                  try {
                    // Update individual header elements
                    App?.ui?.updateTopSipCounter?.();
                    App?.ui?.updateTopSipsPerDrink?.();
                    App?.ui?.updateTopSipsPerSecond?.();
                  } catch (error) {
                    console.error('❌ updateUI error (second loop):', error);
                  }
                },
              });
              booted = true;
              __pushDiag({ type: 'loop', stage: 'fallback-started-post-hide' });
              return;
            }
          } catch {}
          setTimeout(tryBoot2, 100);
        };
        tryBoot2();
      } catch {}
    }
  } catch {}
}, 1000);

__pushDiag({ type: 'wire', module: 'initOnDomReady-default' });
try {
  setTimeout(() => {
    try {
      // initOnDomReady call removed
      __pushDiag({ type: 'initOnDomReady', used: 'default-invoked' });
    } catch {}
  }, 0);
} catch {}

// Remove early dynamic imports; core is now statically wired above for stability

// Initialize UI immediately when available
try {
  // Modernized - UI initialization handled by store
  // UI initialization modernized
  __pushDiag({ type: 'ui', stage: 'initialized' });
} catch (e) {
  __pushDiag({ type: 'ui', stage: 'init-failed', err: String((e && (e as any).message) || e) });
}

// Initialize button audio system on first user interaction (prevents autoplay warnings)
try {
  const unlock = () => {
    try {
      // Modernized - audio system handled by store
      // Audio system initialization removed - using proper module imports
    } catch {}
    try {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      document.removeEventListener('mousedown', unlock, true);
      document.removeEventListener('touchend', unlock, true);
    } catch {}
  };
  document.addEventListener('pointerdown', unlock, { capture: true, once: true } as any);
  document.addEventListener('touchstart', unlock, { capture: true, once: true } as any);
  document.addEventListener('click', unlock, { capture: true, once: true } as any);
  document.addEventListener('keydown', unlock, { capture: true, once: true } as any);
  document.addEventListener('mousedown', unlock, { capture: true, once: true } as any);
  document.addEventListener('touchend', unlock, { capture: true, once: true } as any);
  __pushDiag({ type: 'audio', stage: 'initialized' });
} catch (e) {
  __pushDiag({ type: 'audio', stage: 'init-failed', err: String((e && (e as any).message) || e) });
}

try {
  // Modernized - event names handled by store
  // Modernized - event names handled by store
  // EVENT_NAMES no longer assigned to window - use proper module exports
} catch (error) {
  console.warn('Failed to expose EVENT_NAMES globally:', error);
}

// Convenience: expose live actions getter at App.actions for console/dev usage
try {
  // Modernized - actions handled by store
  // Modernized - actions handled by store
  // App.actions no longer defined on window - use proper module exports
} catch (error) {
  console.warn('Failed to expose App.actions getter:', error);
}

try {
  const bridge = (_app: any) => ({
    init: () => {
      // No-op for compatibility
    },
    setDrinkRate: () => {
      // No-op for compatibility
    },
    setDrinkProgress: () => {
      // No-op for compatibility
    },
    setLastDrinkTime: () => {
      // No-op for compatibility
    },
    setLevel: () => {
      // No-op for compatibility
    },
    autoSync: () => {
      // No-op for compatibility
    },
  });
  // Modernized - bridge handled by store
  // Modernized - bridge handled by store
  const bridgeInstance = bridge(App);
  bridgeInstance.init();
  // Modernized - state bridge handled by store
  // Modernized - state bridge handled by store
  App.stateBridge = bridgeInstance;
  console.log('✅ State bridge initialized');
} catch (error) {
  console.warn('⚠️ State bridge initialization failed:', error);
}

try {
  const uiModule = await import('./ui/index');
  // Modernized - UI module handled by store
  // Modernized - UI module handled by store
  Object.assign(App.ui, uiModule);
  __pushDiag({ type: 'import', module: 'ui', ok: true });
  // Modernized - UI initialization handled by store
  if (typeof App.ui.initializeUI === 'function') App.ui.initializeUI();
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'ui',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ UI module load failed (ok during early bootstrap):', e);
}

try {
  // unlocks already loaded early
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'unlocks',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ unlocks system load failed:', e);
}

try {
  const st = await import('./services/storage');
  storage = (st as any).AppStorage ? (st as any).AppStorage : storage;
  try {
    // Storage no longer assigned to window - use proper module exports
  } catch (error) {
    console.warn('Failed to expose storage globally:', error);
  }
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'storage',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ storage service load failed:', e);
}

try {
  const res = await import('./core/systems/resources');
  Object.assign(App.systems.resources, res);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'resources',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ resources system load failed:', e);
}
try {
  const pur = await import('./core/systems/purchases-system');
  Object.assign(App.systems.purchases, pur);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'purchases',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ purchases system load failed:', e);
}
// Loop system already loaded above - skipping duplicate load
try {
  const save = await import('./core/systems/save-system');
  Object.assign(App.systems.save, save);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'save',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ save system load failed:', e);
}
// Drink system already loaded above - skipping duplicate load
try {
  const clicks = await import('./core/systems/clicks-system');
  Object.assign(App.systems.clicks, clicks);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'clicks',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ clicks system load failed:', e);
}
try {
  const audio = await import('./core/systems/button-audio');
  Object.assign(App.systems.audio.button, audio);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'button-audio',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ button-audio system load failed:', e);
}
try {
  const autosave = await import('./core/systems/autosave');
  Object.assign(App.systems.autosave, autosave);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'autosave',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ autosave system load failed:', e);
}
try {
  const dev = await import('./core/systems/dev');
  App.systems.dev = dev as any;
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'dev',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ dev system load failed:', e);
}

// Load hybrid level system
try {
  const hybridLevel = await import('./core/systems/hybrid-level-system');
  App.systems.hybridLevel = hybridLevel.hybridLevelSystem;
  console.log('✅ Hybrid level system loaded');
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'hybrid-level',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ hybrid level system load failed:', e);
}

// game-init already loaded early

console.log('✅ App object created and ready');

// Register services with the service locator
console.log('🔧 Registering services with service locator...');
ServiceLocator.register(SERVICE_KEYS.APP, App);
ServiceLocator.register(SERVICE_KEYS.DECIMAL, Decimal);
ServiceLocator.register(SERVICE_KEYS.GAME_CONFIG, (window as any).GAME_CONFIG);
ServiceLocator.register('sips', (window as any).sips);
ServiceLocator.register('sipsPerDrink', (window as any).sipsPerDrink);
ServiceLocator.register('spd', (window as any).spd);
ServiceLocator.register('totalSipsEarned', 0);
ServiceLocator.register('highestSipsPerSecond', 0);
ServiceLocator.register('lastAutosaveClockMs', 0);
console.log('✅ Services registered successfully');

console.log('🔧 index.ts finished loading, App object created:', !!App);
__pushDiag({ type: 'index', stage: 'end' });

// Pages-only safety: seed minimal state if initGame isn't present soon, so loop can tick
try {
  const seedIfNeeded = () => {
    try {
      // Check if game is already initialized
      if (typeof initGame === 'function') return;
      const app = App;
      if (!app?.state?.setState) return;
      const CFG = GC as any;
      const BAL = (CFG.BALANCE || {}) as any;
      const TIMING = (CFG.TIMING || {}) as any;
      const DEFAULT_RATE = Number(TIMING.DEFAULT_DRINK_RATE || 5000);
      const now = Date.now();
      const lastDrinkTime = now - DEFAULT_RATE;

      // Set last drink time and drink rate through proper state management
      const DecimalCtor = (globalThis as any).Decimal || Number;
      const toDec = (v: any) =>
        DecimalCtor === Number ? Number(v || 0) : new DecimalCtor(String(v ?? 0));
      const baseSPD = BAL.BASE_SIPS_PER_DRINK ?? 1;
      const strawBaseSPD = BAL.STRAW_BASE_SPD ?? 0.6;
      const cupBaseSPD = BAL.CUP_BASE_SPD ?? 1.2;

      app.state.setState({
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
      __pushDiag({ type: 'seed', ok: true });
    } catch (e) {
      __pushDiag({ type: 'seed', ok: false, err: String((e && (e as any).message) || e) });
    }
  };
  setTimeout(seedIfNeeded, 400);
} catch (error) {
  console.error('❌ Error in outer tryBoot initialization:', error);
}

try {
  // initOnDomReady no longer on window - use proper module exports
} catch (error) {
  console.warn('⚠️ DOM-ready initialization failed:', error);
}

export {};
