// Entry module providing a small public API surface and environment checks (TypeScript)

import { useGameStore } from './core/state/zustand-store.ts';
import { createEventBus } from './services/event-bus.ts';
import { performanceMonitor } from './services/performance.ts';

let storage: any = (typeof window !== 'undefined' && (window as any).storage) || {
  loadGame: () => null,
  saveGame: () => {},
};
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

console.log('🔧 index.ts starting App initialization...');

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

// Install lazy-loading proxies for critical systems so callers don't block on module load
try {
  // Loop system: provide a lazy start() that imports the real module on first call
  if (typeof (window as any).App.systems.loop.start !== 'function') {
    (window as any).App.systems.loop.start = (args: any) => {
      try {
        return import('./core/systems/loop-system.ts')
          .then(mod => {
            Object.assign((window as any).App.systems.loop, mod);
            return (mod as any).start?.(args);
          })
          .catch((error: any) => {
            console.warn('Lazy import of loop-system failed:', error);
            return undefined;
          });
      } catch (error) {
        console.warn('Lazy start loop failed:', error);
        return undefined;
      }
    };
  }
} catch (error) {
  console.warn('Failed to install lazy loop proxy:', error);
}

try {
  // UI system: provide lazy wrappers for initializeUI and switchTab
  const ensureUiLoaded = () =>
    import('./ui/index.ts')
      .then(mod => {
        Object.assign((window as any).App.ui, mod);
        return (window as any).App.ui;
      })
      .catch((error: any) => {
        console.warn('Lazy import of UI module failed:', error);
        return (window as any).App.ui;
      });
  if (typeof (window as any).App.ui.initializeUI !== 'function') {
    (window as any).App.ui.initializeUI = () => {
      return ensureUiLoaded().then((ui: any) => ui.initializeUI?.());
    };
  }
  if (typeof (window as any).App.ui.switchTab !== 'function') {
    (window as any).App.ui.switchTab = (tabName: string, event?: any) => {
      return ensureUiLoaded().then((ui: any) => ui.switchTab?.(tabName, event));
    };
  }
} catch (error) {
  console.warn('Failed to install lazy UI proxies:', error);
}

// Provide a resilient startGame shim early so UI can call it immediately
try {
  // Ensure initGame is available without importing main.ts to avoid circular init
  if (typeof (window as any).initGame !== 'function') {
    (window as any).initGame = function initGameShim() {
      try {
        const tryCall = (retries = 50) => {
          const real = (window as any).initGame;
          if (typeof real === 'function' && real !== initGameShim) {
            return real();
          }
          if (retries <= 0) return undefined;
          setTimeout(() => tryCall(retries - 1), 50);
          return undefined;
        };
        return tryCall();
      } catch (error) {
        console.warn('initGame shim error:', error);
        return undefined;
      }
    };
  }
  if (typeof (window as any).startGame !== 'function') {
    (window as any).startGame = function startGameShim() {
      try {
        const gi = (window as any).App?.systems?.gameInit;
        const impl = gi?.startGame || gi?.startGameCore;
        if (typeof impl === 'function') {
          return impl();
        }
        // Retry shortly until game-init module finishes loading
        setTimeout(() => {
          try {
            const gi2 = (window as any).App?.systems?.gameInit;
            const impl2 = gi2?.startGame || gi2?.startGameCore;
            if (typeof impl2 === 'function') impl2();
          } catch (error) {
            console.warn('Deferred startGame call failed:', error);
          }
        }, 100);
      } catch (error) {
        console.warn('startGame shim error:', error);
      }
    };
  }
} catch (error) {
  console.warn('Failed to install startGame shim:', error);
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
  if (typeof (window as any).App.ui.initializeUI === 'function')
    (window as any).App.ui.initializeUI();
} catch (e) {
  console.warn('⚠️ UI module load failed (ok during early bootstrap):', e);
}

try {
  const unlocks = await import('./feature-unlocks.ts');
  (window as any).App.systems.unlocks =
    unlocks && (unlocks as any).FEATURE_UNLOCKS ? (unlocks as any).FEATURE_UNLOCKS : {};
} catch (e) {
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
  console.warn('⚠️ storage service load failed:', e);
}

try {
  const res = await import('./core/systems/resources.ts');
  Object.assign((window as any).App.systems.resources, res);
} catch (e) {
  console.warn('⚠️ resources system load failed:', e);
}
try {
  const pur = await import('./core/systems/purchases-system.ts');
  Object.assign((window as any).App.systems.purchases, pur);
} catch (e) {
  console.warn('⚠️ purchases system load failed:', e);
}
try {
  const loop = await import('./core/systems/loop-system.ts');
  Object.assign((window as any).App.systems.loop, loop);
} catch (e) {
  console.warn('⚠️ loop system load failed:', e);
}
try {
  const save = await import('./core/systems/save-system.ts');
  Object.assign((window as any).App.systems.save, save);
} catch (e) {
  console.warn('⚠️ save system load failed:', e);
}
try {
  const drink = await import('./core/systems/drink-system.ts');
  const factory = (drink as any).processDrinkFactory?.();
  if (factory) {
    (window as any).App.systems.drink.processDrink = factory;
  }
} catch (e) {
  console.warn('⚠️ drink system load failed:', e);
}
try {
  const clicks = await import('./core/systems/clicks-system.ts');
  Object.assign((window as any).App.systems.clicks, clicks);
} catch (e) {
  console.warn('⚠️ clicks system load failed:', e);
}
try {
  const audio = await import('./core/systems/button-audio.ts');
  Object.assign((window as any).App.systems.audio.button, audio);
} catch (e) {
  console.warn('⚠️ button-audio system load failed:', e);
}
try {
  const autosave = await import('./core/systems/autosave.ts');
  Object.assign((window as any).App.systems.autosave, autosave);
} catch (e) {
  console.warn('⚠️ autosave system load failed:', e);
}
try {
  const dev = await import('./core/systems/dev.ts');
  (window as any).App.systems.dev = dev as any;
} catch (e) {
  console.warn('⚠️ dev system load failed:', e);
}
try {
  const gameInit = await import('./core/systems/game-init.ts');
  Object.assign((window as any).App.systems.gameInit, gameInit);
  (window as any).initOnDomReady = (gameInit as any).initOnDomReady;
  try {
    if (
      !(window as any).App.systems.gameInit.startGame &&
      (window as any).App.systems.gameInit.startGameCore
    ) {
      (window as any).App.systems.gameInit.startGame = (
        window as any
      ).App.systems.gameInit.startGameCore;
    }
  } catch (error) {
    console.warn('Failed to initialize game init system:', error);
  }
} catch (e) {
  console.warn('⚠️ game-init system load failed:', e);
}

console.log('✅ App object created and ready');
console.log('🔧 index.ts finished loading, App object created:', !!(window as any).App);

try {
  console.log('🔍 index.ts: Checking for initOnDomReady...');
  console.log('🔍 initOnDomReady exists:', typeof (window as any).initOnDomReady);
  console.log('🔍 App object exists:', !!(window as any).App);

  if ((window as any).initOnDomReady) {
    console.log('✅ Calling initOnDomReady...');
    (window as any).initOnDomReady();
  } else {
    console.log('❌ initOnDomReady not available');
  }
} catch (error) {
  console.warn('⚠️ DOM-ready initialization failed:', error);
}

export {};
