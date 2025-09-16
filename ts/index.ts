// Entry module providing a small public API surface and environment checks (TypeScript)

import { useGameStore } from './core/state/zustand-store.ts';
import { optimizedEventBus } from './services/optimized-event-bus.ts';
import { performanceMonitor } from './services/performance.ts';
import './config.ts';
import './core/constants.ts';
// DOM migration completed - using modern domQuery service
import './god.ts';
// Static imports removed - using dynamic imports instead
// Environment system replaced by hybrid level system
import { hybridLevelSystem } from './core/systems/hybrid-level-system.ts';
import { AppStorage as storageImpl } from './services/storage.ts';
import './main.ts';

// Import functions that are referenced in the code
import { initGame } from './main.ts';
import { config as GC } from './config.ts';

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
  // Load critical systems synchronously for production stability
  console.log('🔧 Loading critical systems...');

  // Load loop system immediately - this is critical for game functionality
  try {
    const loopModule = await import('./core/systems/loop-system.ts');
    Object.assign(App.systems.loop, loopModule);
    console.log('✅ Loop system loaded');
  } catch (e) {
    console.error('❌ Failed to load loop system:', e);
    __pushDiag({
      type: 'wire',
      module: 'loop-critical',
      ok: false,
      err: String((e && (e as any).message) || e),
    });
  }

  // Load drink system immediately - also critical
  try {
    const drinkModule = await import('./core/systems/drink-system.ts');
    const factory = drinkModule.processDrinkFactory?.();
    if (factory) {
      App.systems.drink.processDrink = factory;
      console.log('✅ Drink system loaded');
    }
  } catch (e) {
    console.warn('⚠️ Failed to load drink system:', e);
  }

  // Other systems can load asynchronously
  console.log('🔧 Critical systems loaded, continuing with async systems...');

  __pushDiag({ type: 'wire', module: 'core-static', ok: true });
} catch (e) {
  __pushDiag({
    type: 'wire',
    module: 'core-static',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
}

// Ensure a default, non-blocking initOnDomReady exists even if early imports stall
try {
  // Simplified initialization - using proper module imports instead of complex nested structure
  __pushDiag({ type: 'initOnDomReady', used: 'default-fallback' });
  try {
    // Kick game progression after splash via loop once available
    // Use proper module access instead of window globals
    let booted = false;
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max
    const tryBoot = () => {
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
            initGame();
          } catch {}
        }
        const loopStart = App?.systems?.loop?.start;
        console.log('🔧 Checking loop system availability:', !!loopStart);
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
    tryBoot();
  } catch {}

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
                              console.warn(
                                'Failed to load level selector for notifications:',
                                error
                              );
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
} catch {}

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
  const uiModule = await import('./ui/index.ts');
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
  const st = await import('./services/storage.ts');
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
  const res = await import('./core/systems/resources.ts');
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
  const pur = await import('./core/systems/purchases-system.ts');
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
  const save = await import('./core/systems/save-system.ts');
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
  const clicks = await import('./core/systems/clicks-system.ts');
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
  const audio = await import('./core/systems/button-audio.ts');
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
  const autosave = await import('./core/systems/autosave.ts');
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
  const dev = await import('./core/systems/dev.ts');
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
// game-init already loaded early

console.log('✅ App object created and ready');
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
} catch {}

try {
  // initOnDomReady no longer on window - use proper module exports
} catch (error) {
  console.warn('⚠️ DOM-ready initialization failed:', error);
}

export {};
