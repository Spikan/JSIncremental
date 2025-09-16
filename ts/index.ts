// Entry module providing a small public API surface and environment checks (TypeScript)

console.log('🚀 ts/index.ts module loading...');
console.log('🔧 Module execution started');
(window as any).__tsIndexLoaded = true;

import { useGameStore } from './core/state/zustand-store';
import { optimizedEventBus } from './services/optimized-event-bus';
import { performanceMonitor } from './services/performance';
import './config';
import './core/constants';
// ServiceLocator removed - using Zustand store directly
// Decimal import removed - using toDecimal from simplified.ts
import { toDecimal } from './core/numbers/simplified';
// processDrinkFactory removed - using direct processDrink function
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
} catch (error) {
  console.error('❌ Failed to get base URL:', error);
  __pushDiag({ type: 'base', base: '/', url: 'unknown', err: String(error) });
}

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

  // Inline loop system to avoid import hanging issues in production
  console.log('🔧 Creating inline loop system...');

  let rafId: number | null = null;

  const loopSystem = {
    start: ({
      updateDrinkProgress,
      processDrink,
      updateStats,
      updatePlayTime,
      updateLastSaveTime,
      updateUI,
      getNow = () => Date.now(),
    }: any) => {
      console.log('🔧 Loop system start called');
      try {
        loopSystem.stop();
      } catch (error) {
        console.warn('Failed to stop previous loop:', error);
      }
      let lastStatsUpdate = 0;

      function tick() {
        try {
          if (updateDrinkProgress) updateDrinkProgress();
        } catch (error) {
          console.error('❌ CRITICAL: Failed to update drink progress in loop:', error);
          // Don't continue the loop if drink progress fails - this is core functionality
          throw error;
        }
        try {
          if (processDrink) {
            console.log('🔧 Calling processDrink in game loop...');
            processDrink();
            console.log('🔧 processDrink completed in game loop');
          } else {
            console.warn('⚠️ processDrink function not available in game loop');
          }
        } catch (error) {
          console.error('❌ CRITICAL: Failed to process drink in loop:', error);
          // Don't continue the loop if drink processing fails - this is core functionality
          throw error;
        }
        try {
          if (updateUI) updateUI();
        } catch (error) {
          console.warn('Failed to update UI in loop:', error);
        }
        const now = getNow();
        if (now - lastStatsUpdate >= 1000) {
          lastStatsUpdate = now;
          try {
            if (updateStats) updateStats();
          } catch (error) {
            console.warn('Failed to update stats in loop:', error);
          }
          try {
            if (updatePlayTime) updatePlayTime();
          } catch (error) {
            console.warn('Failed to update play time in loop:', error);
          }
          try {
            if (updateLastSaveTime) updateLastSaveTime();
          } catch (error) {
            console.warn('Failed to update last save time in loop:', error);
          }
        }
        rafId = requestAnimationFrame(tick) as unknown as number;
      }

      function runOnceSafely(fn: (() => void) | undefined) {
        try {
          if (fn) fn();
        } catch (error) {
          console.warn('Failed to run function safely:', error);
        }
      }

      if (updateDrinkProgress) runOnceSafely(updateDrinkProgress);
      if (processDrink) runOnceSafely(processDrink);
      lastStatsUpdate = getNow();
      if (updateStats) runOnceSafely(updateStats);
      if (updatePlayTime) runOnceSafely(updatePlayTime);
      if (updateLastSaveTime) runOnceSafely(updateLastSaveTime);
      rafId = requestAnimationFrame(tick) as unknown as number;
    },
    stop: () => {
      console.log('🔧 Loop system stopped');
      if (rafId != null) {
        cancelAnimationFrame(rafId as unknown as number);
        rafId = null;
      }
    },
  };

  // Initialize Zustand store with default values
  console.log('🔧 Initializing Zustand store...');
  const { useGameStore } = await import('./core/state/zustand-store');
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
  console.log('✅ Zustand store initialized');

  // Modernized drink system using only Zustand store
  console.log('🔧 Using modernized drink system...');
  const { processDrink } = await import('./core/systems/drink-system');
  console.log('🔧 processDrink function:', typeof processDrink);
  App.systems.drink.processDrink = processDrink;
  console.log('✅ Drink system loaded');

  // Load hybrid level system early so UI can access it
  console.log('🔧 Loading hybrid level system...');
  try {
    const hybridLevel = await import('./core/systems/hybrid-level-system');
    App.systems.hybridLevel = hybridLevel.hybridLevelSystem;
    console.log('✅ Hybrid level system loaded');
  } catch (e) {
    console.warn('⚠️ hybrid level system load failed:', e);
  }

  App.systems.loop = loopSystem;
  console.log('✅ Inline loop system created');

  // Other systems can load asynchronously
  console.log('🔧 Critical systems loaded, continuing with async systems...');
  console.log('🔧 About to call __pushDiag...');

  __pushDiag({ type: 'wire', module: 'core-static', ok: true });
  console.log('🔧 __pushDiag completed successfully');

  // Define tryBoot function - no retries, fail fast
  const tryBoot = () => {
    console.log('🔧 tryBoot called');
    try {
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

      // Call initGame if present
      if (typeof initGame === 'function') {
        console.log('🔧 Calling initGame...');
        initGame();
        console.log('✅ initGame completed successfully');
      }

      // Check if loop system is available
      const loopStart = App?.systems?.loop?.start;
      if (!loopStart || typeof loopStart !== 'function') {
        throw new Error('Loop system not available or start method is not a function');
      }

      console.log('🔧 Loop system available, starting game...');
      console.log('🔧 Starting game loop...');
      loopStart({
        updateDrinkProgress: () => {
          try {
            const state = useGameStore.getState();
            const now = Date.now();
            const last = Number(state.lastDrinkTime ?? 0);
            const rate = Number(state.drinkRate ?? 1000);
            const pct = Math.min(((now - last) / Math.max(rate, 1)) * 100, 100);
            useGameStore.setState({ drinkProgress: pct });
            App?.ui?.updateDrinkProgress?.(pct, rate);
          } catch (error) {
            console.error('❌ Failed to update drink progress:', error);
          }
        },
        processDrink: () => {
          try {
            console.log('🔧 Calling processDrink...');
            const beforeSips = useGameStore.getState().sips;
            console.log('🔧 Before processDrink - sips:', beforeSips?.toString?.() || beforeSips);
            App?.systems?.drink?.processDrink?.();
            const afterSips = useGameStore.getState().sips;
            console.log('🔧 After processDrink - sips:', afterSips?.toString?.() || afterSips);
            console.log('🔧 processDrink completed');
          } catch (error) {
            console.error('❌ processDrink error:', error);
          }
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
          } catch (error) {
            console.error('❌ Failed to update stats:', error);
          }
        },
        updatePlayTime: () => {
          try {
            App?.ui?.updatePlayTime?.();
          } catch (error) {
            console.error('❌ Failed to update play time:', error);
          }
        },
        updateLastSaveTime: () => {
          try {
            App?.ui?.updateLastSaveTime?.();
          } catch (error) {
            console.error('❌ Failed to update last save time:', error);
          }
        },
        updateUI: () => {
          try {
            // Update individual header elements
            console.log('🔧 updateUI: calling updateTopSipCounter...');
            App?.ui?.updateTopSipCounter?.();
            console.log('🔧 updateUI: calling updateTopSipsPerDrink...');
            App?.ui?.updateTopSipsPerDrink?.();
            console.log('🔧 updateUI: calling updateTopSipsPerSecond...');
            App?.ui?.updateTopSipsPerSecond?.();

            // Update main game UI elements
            console.log('🔧 updateUI: calling updateAllDisplays...');
            App?.ui?.updateAllDisplays?.();
            console.log('🔧 updateUI: calling updateDrinkProgress...');
            App?.ui?.updateDrinkProgress?.();
            console.log('🔧 updateUI: completed successfully');
          } catch (error) {
            console.error('❌ updateUI error:', error);
          }
        },
      });
      console.log('✅ Game loop started successfully');
    } catch (error) {
      console.error('❌ Error in tryBoot:', error);
      throw error; // Fail fast, no retries
    }
  };

  // Now that critical systems are loaded, call tryBoot
  console.log('🔧 About to call tryBoot function...');
  console.log('🔧 App.systems.drink.processDrink available:', !!App?.systems?.drink?.processDrink);
  console.log('🔧 App.systems.loop.start available:', !!App?.systems?.loop?.start);
  console.log('🔧 Calling tryBoot now...');
  try {
    tryBoot();
    console.log('🔧 tryBoot call completed');
  } catch (tryBootError) {
    console.error('❌ CRITICAL: tryBoot failed:', tryBootError);
    throw tryBootError;
  }
} catch (e) {
  console.error('❌ CRITICAL: Error in critical systems loading:', e);
  console.error('❌ Critical systems error details:', {
    message: (e as any)?.message,
    stack: (e as any)?.stack,
    name: (e as any)?.name,
    type: typeof e,
  });
  __pushDiag({
    type: 'wire',
    module: 'core-static',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  // Re-throw to ensure the error is not silently ignored
  throw e;
}

// Load async systems before tryBoot
console.log('🔧 Loading async systems...');

// Hybrid level system already loaded above

console.log('🔧 Async systems loaded, starting tryBoot initialization...');

// tryBoot is now called inside the async try block after systems are loaded

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
      // Loop system should already be running from tryBoot above
      console.log('🔄 Splash screen force-hidden, loop should already be running');
    }
  } catch (error) {
    console.error('❌ Failed to hide splash screen:', error);
  }
}, 1000);

__pushDiag({ type: 'wire', module: 'initOnDomReady-default' });
try {
  setTimeout(() => {
    try {
      // initOnDomReady call removed
      __pushDiag({ type: 'initOnDomReady', used: 'default-invoked' });
    } catch (error) {
      console.error('Failed to push diagnostic info:', error);
    }
  }, 0);
} catch (error) {
  console.error('Failed to initialize diagnostic system:', error);
}

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
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    }
    try {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      document.removeEventListener('mousedown', unlock, true);
      document.removeEventListener('touchend', unlock, true);
    } catch (error) {
      console.error('Failed to remove event listeners:', error);
    }
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

// State bridge removed - no longer needed

try {
  console.log('🔧 Loading UI system with dynamic import...');
  const uiModule = await Promise.race([
    import('./ui/index'),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('UI system import timeout after 10 seconds')), 10000)
    ),
  ]);
  console.log('🔧 UI system loaded, initializing...');
  // Modernized - UI module handled by store
  // Modernized - UI module handled by store
  Object.assign(App.ui, uiModule);
  __pushDiag({ type: 'import', module: 'ui', ok: true });
  // Modernized - UI initialization handled by store
  if (typeof App.ui.initializeUI === 'function') {
    App.ui.initializeUI();
    console.log('✅ UI system initialized');
  } else {
    console.warn('⚠️ UI system initializeUI method not found');
  }
} catch (e) {
  console.error('❌ UI system initialization failed:', e);
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

// game-init already loaded early

console.log('✅ App object created and ready');

// Services already registered earlier

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
      const DecimalCtor = (globalThis as any).Decimal;
      if (!DecimalCtor) {
        console.error('❌ CRITICAL: Decimal constructor not available!');
        return;
      }
      const toDec = (v: any) => new DecimalCtor(String(v ?? 0));
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
  console.error('❌ CRITICAL: Error in outer tryBoot initialization:', error);
  // Re-throw to ensure the error is not silently ignored
  throw error;
}

try {
  // initOnDomReady no longer on window - use proper module exports
} catch (error) {
  console.warn('⚠️ DOM-ready initialization failed:', error);
}

export {};
