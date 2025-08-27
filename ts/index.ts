// Entry module providing a small public API surface and environment checks (TypeScript)

import { useGameStore } from './core/state/zustand-store.ts';
import { createEventBus } from './services/event-bus.ts';
import { performanceMonitor } from './services/performance.ts';
import './config.ts';
import './core/constants.ts';
import './dom-cache.ts';
import './god.ts';
import * as gameInitStatic from './core/systems/game-init.ts';
import * as loopStatic from './core/systems/loop-system.ts';
import { processDrinkFactory as processDrinkFactoryStatic } from './core/systems/drink-system.ts';
import * as uiStatic from './ui/index.ts';
import * as unlocksStatic from './feature-unlocks.ts';
import * as clicksStatic from './core/systems/clicks-system.ts';
import * as audioButtonStatic from './core/systems/button-audio.ts';
import * as purchasesStatic from './core/systems/purchases-system.ts';
import * as devStatic from './core/systems/dev.ts';
import * as saveStatic from './core/systems/save-system.ts';
import * as optionsStatic from './core/systems/options-system.ts';
import { AppStorage as storageImpl } from './services/storage.ts';
import './main.ts';

let storage: any = (typeof window !== 'undefined' && (window as any).storage) || storageImpl;
const eventBus = createEventBus();
try {
  (window as any).eventBus = eventBus;
  (window as any).bus = eventBus;
} catch (error) {
  console.warn('Failed to expose event bus globally:', error);
}

let EVENT_NAMES: any = (typeof window !== 'undefined' && (window as any).EVENT_NAMES) || {};
try {
  if (typeof window !== 'undefined' && (window as any).EVENT_NAMES)
    EVENT_NAMES = (window as any).EVENT_NAMES;
} catch (error) {
  console.warn('Failed to get EVENT_NAMES from window:', error);
}

// Diagnostics helper (no-op in dev)
function __pushDiag(marker: any): void {
  try {
    (window as any).__diag = Array.isArray((window as any).__diag) ? (window as any).__diag : [];
    (window as any).__diag.push(marker);
  } catch {}
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

(window as any).App = {
  state: {
    ...zustandStore,
    actions: zustandStore.getState().actions, // Add actions for direct access
  }, // Consolidated Zustand store with actions
  storage,
  events: eventBus,
  EVENT_NAMES,
  rules: { clicks: {}, purchases: {}, economy: {} },
  systems: {
    resources: {},
    purchases: {},
    clicks: {},
    autosave: {},
    save: {},
    options: {},
    loop: {},
    audio: { button: {} },
    gameInit: {},
    drink: {},
  },
  ui: {},
  data: {},
  performance: performanceMonitor, // Performance monitoring
};

__pushDiag({ type: 'index', stage: 'app-created' });

// Static wiring of core systems/UI for deterministic bootstrap
try {
  // Loop system
  Object.assign((window as any).App.systems.loop, loopStatic);
  // Drink system
  try {
    const factory = processDrinkFactoryStatic?.();
    if (factory) (window as any).App.systems.drink.processDrink = factory;
  } catch {}
  // Clicks system
  Object.assign((window as any).App.systems.clicks, clicksStatic);
  // Purchases system
  try {
    Object.assign((window as any).App.systems.purchases, purchasesStatic);
  } catch {}
  // Unlocks
  (window as any).App.systems.unlocks = (unlocksStatic as any)?.FEATURE_UNLOCKS || {};
  // Game init
  Object.assign((window as any).App.systems.gameInit, gameInitStatic);
  (window as any).initOnDomReady = (gameInitStatic as any).initOnDomReady;
  try {
    if (
      !(window as any).App.systems.gameInit.startGame &&
      (window as any).App.systems.gameInit.startGameCore
    ) {
      (window as any).App.systems.gameInit.startGame = (
        window as any
      ).App.systems.gameInit.startGameCore;
    }
  } catch {}
  // UI
  Object.assign((window as any).App.ui, uiStatic);
  // Audio (button) system
  try {
    Object.assign((window as any).App.systems.audio.button, audioButtonStatic);
  } catch {}
  // Save system
  try {
    Object.assign((window as any).App.systems.save, saveStatic);
  } catch {}
  // Options system
  try {
    Object.assign((window as any).App.systems.options, optionsStatic);
  } catch {}
  // Dev tools
  try {
    (window as any).App.systems.dev = devStatic as any;
  } catch {}
  try {
    if (typeof (window as any).App.ui.initializeUI === 'function')
      (window as any).App.ui.initializeUI();
  } catch {}
  // Initialize unlocks after UI is ready so visibility updates apply
  try {
    (window as any).App.systems.unlocks?.init?.();
  } catch {}
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
  (function () {
    let invoked = false;
    const startedAt = Date.now();
    (window as any).initOnDomReady = function () {
      if (invoked) return;
      invoked = true;
      const attempt = () => {
        try {
          const fn = (window as any).App?.systems?.gameInit?.initSplashScreen;
          if (typeof fn === 'function') {
            fn();
            __pushDiag({ type: 'initOnDomReady', used: 'default-fallback' });
            try {
              // Kick game progression after splash via loop once available
              const w: any = window as any;
              let booted = false;
              const tryBoot = () => {
                try {
                  // Ensure baseline timing state
                  if (w.App?.state?.getState && w.App?.state?.setState) {
                    const st = w.App.state.getState();
                    const CFG = (w.GAME_CONFIG || {}) as any;
                    const TIMING = (CFG.TIMING || {}) as any;
                    const DEFAULT_RATE = Number(TIMING.DEFAULT_DRINK_RATE || 5000);
                    if (!st.drinkRate || Number(st.drinkRate) <= 0) {
                      w.App.state.setState({ drinkRate: DEFAULT_RATE });
                    }
                    if (!st.lastDrinkTime) {
                      w.App.state.setState({ lastDrinkTime: Date.now() - DEFAULT_RATE });
                    }
                  }
                  // Call initGame if present (one-time)
                  if (!booted && typeof w.initGame === 'function') {
                    try {
                      w.initGame();
                    } catch {}
                  }
                  const loopStart = w.App?.systems?.loop?.start;
                  if (!booted && typeof loopStart === 'function') {
                    loopStart({
                      updateDrinkProgress: () => {
                        try {
                          const st = w.App?.state?.getState?.() || {};
                          const now = Date.now();
                          const last = Number(st.lastDrinkTime ?? w.lastDrinkTime ?? 0);
                          const rate = Number(st.drinkRate ?? w.drinkRate ?? 1000);
                          const pct = Math.min(((now - last) / Math.max(rate, 1)) * 100, 100);
                          w.App?.state?.setState?.({ drinkProgress: pct });
                          w.App?.ui?.updateDrinkProgress?.(pct, rate);
                        } catch {}
                      },
                      processDrink: () => {
                        try {
                          w.App?.systems?.drink?.processDrink?.();
                        } catch {}
                      },
                      updateStats: () => {
                        try {
                          w.App?.ui?.updatePlayTime?.();
                          w.App?.ui?.updateLastSaveTime?.();
                          w.App?.ui?.updateAllStats?.();
                          w.App?.ui?.updatePurchasedCounts?.();
                          w.App?.ui?.checkUpgradeAffordability?.();
                          w.App?.systems?.unlocks?.checkAllUnlocks?.();
                        } catch {}
                      },
                      updatePlayTime: () => {
                        try {
                          w.App?.ui?.updatePlayTime?.();
                        } catch {}
                      },
                      updateLastSaveTime: () => {
                        try {
                          w.App?.ui?.updateLastSaveTime?.();
                        } catch {}
                      },
                    });
                    booted = true;
                    __pushDiag({ type: 'loop', stage: 'fallback-started' });
                    return;
                  }
                } catch {}
                setTimeout(tryBoot, 100);
              };
              tryBoot();
            } catch {}
            return;
          }
        } catch {}
        // After 1s, force-show game content to avoid being stuck on splash
        if (Date.now() - startedAt > 1000) {
          try {
            const splash = document.getElementById('splashScreen') as any;
            const game = document.getElementById('gameContent') as any;
            if (splash && game) {
              splash.style.display = 'none';
              splash.style.visibility = 'hidden';
              splash.style.pointerEvents = 'none';
              game.style.display = 'block';
              game.style.visibility = 'visible';
              game.style.opacity = '1';
              document.body?.classList?.add('game-started');
              __pushDiag({ type: 'splash', action: 'forced-hide' });
              // After forced hide, also try to boot the loop
              try {
                const w: any = window as any;
                let booted = false;
                const tryBoot2 = () => {
                  try {
                    const loopStart = w.App?.systems?.loop?.start;
                    if (!booted && typeof loopStart === 'function') {
                      loopStart({
                        updateDrinkProgress: () => {
                          try {
                            const st = w.App?.state?.getState?.() || {};
                            const now = Date.now();
                            const last = Number(st.lastDrinkTime ?? w.lastDrinkTime ?? 0);
                            const rate = Number(st.drinkRate ?? w.drinkRate ?? 1000);
                            const pct = Math.min(((now - last) / Math.max(rate, 1)) * 100, 100);
                            w.App?.state?.setState?.({ drinkProgress: pct });
                            w.App?.ui?.updateDrinkProgress?.(pct, rate);
                          } catch {}
                        },
                        processDrink: () => {
                          try {
                            w.App?.systems?.drink?.processDrink?.();
                          } catch {}
                        },
                        updateStats: () => {
                          try {
                            w.App?.ui?.updatePlayTime?.();
                            w.App?.ui?.updateLastSaveTime?.();
                            w.App?.ui?.updateAllStats?.();
                            w.App?.ui?.updatePurchasedCounts?.();
                            w.App?.ui?.checkUpgradeAffordability?.();
                            w.App?.systems?.unlocks?.checkAllUnlocks?.();
                          } catch {}
                        },
                        updatePlayTime: () => {
                          try {
                            w.App?.ui?.updatePlayTime?.();
                          } catch {}
                        },
                        updateLastSaveTime: () => {
                          try {
                            w.App?.ui?.updateLastSaveTime?.();
                          } catch {}
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
          return;
        }
        invoked = false;
        setTimeout(() => (window as any).initOnDomReady?.(), 100);
      };
      attempt();
    };
    __pushDiag({ type: 'wire', module: 'initOnDomReady-default' });
    try {
      setTimeout(() => {
        try {
          (window as any).initOnDomReady?.();
          __pushDiag({ type: 'initOnDomReady', used: 'default-invoked' });
        } catch {}
      }, 0);
    } catch {}
  })();
} catch {}

// Remove early dynamic imports; core is now statically wired above for stability

// Initialize UI immediately when available
try {
  if (typeof (window as any).App.ui.initializeUI === 'function') {
    (window as any).App.ui.initializeUI();
    __pushDiag({ type: 'ui', stage: 'initialized' });
  }
} catch (e) {
  __pushDiag({ type: 'ui', stage: 'init-failed', err: String((e && (e as any).message) || e) });
}

// Initialize button audio system on first user interaction (prevents autoplay warnings)
try {
  const unlock = () => {
    try {
      const audio = (window as any).App?.systems?.audio?.button;
      audio?.initButtonAudioSystem?.();
      audio?.playButtonClickSound?.();
      audio?.updateButtonSoundsToggleButton?.();
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
  (window as any).EVENT_NAMES = (window as any).App.EVENT_NAMES;
} catch (error) {
  console.warn('Failed to expose EVENT_NAMES globally:', error);
}

// Convenience: expose live actions getter at App.actions for console/dev usage
try {
  Object.defineProperty((window as any).App, 'actions', {
    configurable: true,
    enumerable: false,
    get() {
      try {
        return (window as any).App.state?.getState?.()?.actions;
      } catch {
        return undefined;
      }
    },
  });
} catch (error) {
  console.warn('Failed to expose App.actions getter:', error);
}

try {
  const bridge =
    typeof (window as any).createStateBridge === 'function'
      ? (window as any).createStateBridge
      : (_app: any) => ({
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
  const bridgeInstance = bridge((window as any).App);
  bridgeInstance.init();
  (window as any).App.stateBridge = bridgeInstance;
  console.log('✅ State bridge initialized');
} catch (error) {
  console.warn('⚠️ State bridge initialization failed:', error);
}

try {
  const uiModule = await import('./ui/index.ts');
  Object.assign((window as any).App.ui, uiModule);
  __pushDiag({ type: 'import', module: 'ui', ok: true });
  if (typeof (window as any).App.ui.initializeUI === 'function')
    (window as any).App.ui.initializeUI();
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
    (window as any).storage = storage;
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
  Object.assign((window as any).App.systems.resources, res);
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
  Object.assign((window as any).App.systems.purchases, pur);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'purchases',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ purchases system load failed:', e);
}
try {
  const loop = await import('./core/systems/loop-system.ts');
  Object.assign((window as any).App.systems.loop, loop);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'loop',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ loop system load failed:', e);
}
try {
  const save = await import('./core/systems/save-system.ts');
  Object.assign((window as any).App.systems.save, save);
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'save',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ save system load failed:', e);
}
try {
  const drink = await import('./core/systems/drink-system.ts');
  const factory = (drink as any).processDrinkFactory?.();
  if (factory) {
    (window as any).App.systems.drink.processDrink = factory;
  }
} catch (e) {
  __pushDiag({
    type: 'import',
    module: 'drink',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ drink system load failed:', e);
}
try {
  const clicks = await import('./core/systems/clicks-system.ts');
  Object.assign((window as any).App.systems.clicks, clicks);
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
  Object.assign((window as any).App.systems.audio.button, audio);
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
  Object.assign((window as any).App.systems.autosave, autosave);
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
  (window as any).App.systems.dev = dev as any;
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
console.log('🔧 index.ts finished loading, App object created:', !!(window as any).App);
__pushDiag({ type: 'index', stage: 'end' });

// Pages-only safety: seed minimal state if initGame isn't present soon, so loop can tick
try {
  const seedIfNeeded = () => {
    try {
      if (typeof (window as any).initGame === 'function') return;
      const w: any = window as any;
      const app = w.App;
      if (!app?.state?.setState) return;
      const CFG = (w.GAME_CONFIG || {}) as any;
      const BAL = (CFG.BALANCE || {}) as any;
      const TIMING = (CFG.TIMING || {}) as any;
      const DEFAULT_RATE = Number(TIMING.DEFAULT_DRINK_RATE || 5000);
      const now = Date.now();
      const lastDrinkTime = now - DEFAULT_RATE;

      w.lastDrinkTime = lastDrinkTime;
      w.drinkRate = DEFAULT_RATE;

      const DecimalCtor = (w as any).Decimal || Number;
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
        criticalClicks: toDec(0),
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
  if ((window as any).initOnDomReady) {
    (window as any).initOnDomReady();
  }
} catch (error) {
  console.warn('⚠️ DOM-ready initialization failed:', error);
}

export {};
