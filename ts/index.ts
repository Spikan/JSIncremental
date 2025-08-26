// Entry module providing a small public API surface and environment checks (TypeScript)

import { useGameStore } from './core/state/zustand-store.ts';
import { createEventBus } from './services/event-bus.ts';
import { performanceMonitor } from './services/performance.ts';
// Eager-load critical systems in production to avoid dynamic import issues on Pages
import * as staticLoop from './core/systems/loop-system.ts';
import { processDrinkFactory as staticProcessDrinkFactory } from './core/systems/drink-system.ts';

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

// Diagnostics helper (no-op in dev)
function __pushDiag(marker: any): void {
  try {
    (window as any).__diag = Array.isArray((window as any).__diag) ? (window as any).__diag : [];
    (window as any).__diag.push(marker);
  } catch {}
}

console.log('🔧 index.ts starting App initialization...');
__pushDiag({ type: 'index', stage: 'start' });

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

// Wire eagerly imported critical systems
try {
  Object.assign((window as any).App.systems.loop, staticLoop);
  __pushDiag({ type: 'import', module: 'loop-static', ok: true });
} catch (e) {
  __pushDiag({ type: 'import', module: 'loop-static', ok: false, err: String((e && (e as any).message) || e) });
}
try {
  const factory = staticProcessDrinkFactory?.();
  if (factory) {
    (window as any).App.systems.drink.processDrink = factory;
  }
  __pushDiag({ type: 'import', module: 'drink-static', ok: true });
} catch (e) {
  __pushDiag({ type: 'import', module: 'drink-static', ok: false, err: String((e && (e as any).message) || e) });
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
  const unlocks = await import('./feature-unlocks.ts');
  (window as any).App.systems.unlocks =
    unlocks && (unlocks as any).FEATURE_UNLOCKS ? (unlocks as any).FEATURE_UNLOCKS : {};
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
  __pushDiag({
    type: 'import',
    module: 'game-init',
    ok: false,
    err: String((e && (e as any).message) || e),
  });
  console.warn('⚠️ game-init system load failed:', e);
}

console.log('✅ App object created and ready');
console.log('🔧 index.ts finished loading, App object created:', !!(window as any).App);
__pushDiag({ type: 'index', stage: 'end' });

try {
  if ((window as any).initOnDomReady) {
    (window as any).initOnDomReady();
  }
} catch (error) {
  console.warn('⚠️ DOM-ready initialization failed:', error);
}

export {};
