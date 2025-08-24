// Entry module providing a small public API surface and environment checks (TypeScript)

import { createStore } from './core/state/index.ts';
import { defaultState } from './core/state/shape.ts';
import { createEventBus } from './services/event-bus.ts';

let storage: any = (typeof window !== 'undefined' && (window as any).storage) || { loadGame: () => null, saveGame: () => {} };
const eventBus = createEventBus();
try { (window as any).eventBus = eventBus; (window as any).bus = eventBus; } catch {}

let EVENT_NAMES: any = (typeof window !== 'undefined' && (window as any).EVENT_NAMES) || {};
try { if (typeof window !== 'undefined' && (window as any).EVENT_NAMES) EVENT_NAMES = (window as any).EVENT_NAMES; } catch {}

console.log('🔧 index.ts starting App initialization...');
(window as any).App = {
  state: createStore(defaultState),
  storage,
  events: eventBus,
  EVENT_NAMES,
  rules: { clicks: {}, purchases: {}, economy: {} },
  systems: { resources: {}, purchases: {}, clicks: {}, autosave: {}, save: {}, options: {}, loop: {}, audio: { button: {} }, gameInit: {}, drink: {} },
  ui: {},
  data: {},
};

try { (window as any).EVENT_NAMES = (window as any).App.EVENT_NAMES; } catch {}

try {
  const bridge = (typeof (window as any).createStateBridge === 'function') ? (window as any).createStateBridge : ((_app: any) => ({
    init: () => {}, setDrinkRate: () => {}, setDrinkProgress: () => {}, setLastDrinkTime: () => {}, setLevel: () => {}, autoSync: () => {}
  }));
  const bridgeInstance = bridge((window as any).App);
  bridgeInstance.init();
  (window as any).App.stateBridge = bridgeInstance;
  console.log('✅ State bridge initialized');
} catch (error) { console.warn('⚠️ State bridge initialization failed:', error); }

try {
  const uiModule = await import('./ui/index.ts');
  Object.assign((window as any).App.ui, uiModule);
  if (typeof (window as any).App.ui.initializeUI === 'function') (window as any).App.ui.initializeUI();
} catch (e) { console.warn('⚠️ UI module load failed (ok during early bootstrap):', e); }

try { const unlocks = await import('./feature-unlocks.ts'); (window as any).App.systems.unlocks = (unlocks && (unlocks as any).FEATURE_UNLOCKS) ? (unlocks as any).FEATURE_UNLOCKS : {}; } catch (e) { console.warn('⚠️ unlocks system load failed:', e); }

try { const st = await import('./services/storage.ts'); storage = (st as any).AppStorage ? (st as any).AppStorage : storage; try { (window as any).storage = storage; } catch {} } catch (e) { console.warn('⚠️ storage service load failed:', e); }

try { const res = await import('./core/systems/resources.ts'); Object.assign((window as any).App.systems.resources, res); } catch (e) { console.warn('⚠️ resources system load failed:', e); }
try { const pur = await import('./core/systems/purchases-system.ts'); Object.assign((window as any).App.systems.purchases, pur); } catch (e) { console.warn('⚠️ purchases system load failed:', e); }
try { const loop = await import('./core/systems/loop-system.ts'); Object.assign((window as any).App.systems.loop, loop); } catch (e) { console.warn('⚠️ loop system load failed:', e); }
try { const save = await import('./core/systems/save-system.ts'); Object.assign((window as any).App.systems.save, save); } catch (e) { console.warn('⚠️ save system load failed:', e); }
try {
  const drink = await import('./core/systems/drink-system.ts');
  const factory = (drink as any).processDrinkFactory?.();
  if (factory) { (window as any).App.systems.drink.processDrink = factory; }
} catch (e) { console.warn('⚠️ drink system load failed:', e); }
try { const clicks = await import('./core/systems/clicks-system.ts'); Object.assign((window as any).App.systems.clicks, clicks); } catch (e) { console.warn('⚠️ clicks system load failed:', e); }
try { const audio = await import('./core/systems/button-audio.ts'); Object.assign((window as any).App.systems.audio.button, audio); } catch (e) { console.warn('⚠️ button-audio system load failed:', e); }
try { const autosave = await import('./core/systems/autosave.ts'); Object.assign((window as any).App.systems.autosave, autosave); } catch (e) { console.warn('⚠️ autosave system load failed:', e); }
try { const dev = await import('./core/systems/dev.ts'); (window as any).App.systems.dev = dev as any; } catch (e) { console.warn('⚠️ dev system load failed:', e); }
try {
  const gameInit = await import('./core/systems/game-init.ts');
  Object.assign((window as any).App.systems.gameInit, gameInit);
  (window as any).initOnDomReady = (gameInit as any).initOnDomReady;
  try { if (!(window as any).App.systems.gameInit.startGame && (window as any).App.systems.gameInit.startGameCore) {
    (window as any).App.systems.gameInit.startGame = (window as any).App.systems.gameInit.startGameCore;
  } } catch {}
} catch (e) { console.warn('⚠️ game-init system load failed:', e); }

console.log('✅ App object created and ready');
console.log('🔧 index.ts finished loading, App object created:', !!(window as any).App);

try { if ((window as any).initOnDomReady) { (window as any).initOnDomReady(); } } catch (error) {
  console.warn('⚠️ DOM-ready initialization failed:', error);
}

export {}


