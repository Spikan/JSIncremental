// Main Game Logic - Legacy game logic being refactored into modular architecture (TypeScript)
// Thin shim that preserves runtime behavior while migration continues.

// Re-export nothing; this file sets up globals used by HTML and other modules

// Bring over the JS file contents verbatim with minimal edits for TS compatibility
// We import the existing JS via a triple-slash reference to keep order under Vite
// but here we inline the logic from original main.js, adapted for TS types.

// Ported inline from original main.js (TS-ified minimal changes)
// Removed unused import

import { domQuery } from './services/dom-query';

const GC: any = (typeof window !== 'undefined' && (window as any).GAME_CONFIG) || {};
// DOM_CACHE and Decimal are declared in global types

// Test utilities removed - no longer needed

// These are used in the game configuration
const BAL = (GC && GC.BALANCE) || {};
const TIMING = (GC && GC.TIMING) || {};
const LIMITS = (GC && GC.LIMITS) || {};

// Use the variables to avoid unused warnings
if (BAL && TIMING && LIMITS) {
  // Configuration loaded successfully
}

(function ensureDomCacheReady() {
  try {
    if (typeof DOM_CACHE === 'undefined') {
      console.error('DOM_CACHE not loaded. Please ensure dom-cache.ts is loaded before main.ts');
      return;
    }
    if (!DOM_CACHE.isReady()) {
      console.warn('DOM_CACHE not ready, initializing...');
      DOM_CACHE.init();
    }
  } catch (error) {
    console.warn('Failed to ensure DOM_CACHE readiness:', error);
  }
})();

// Import modular systems at the top
import { saveGameLoader } from './core/systems/save-game-loader';
import { mobileInputHandler } from './ui/mobile-input';
import { bootstrapSystem, initSplashScreen } from './core/systems/bootstrap';
// DecimalOps removed - no longer using toSafeNumber

// Export for potential use
(window as any).initSplashScreen = initSplashScreen;

function initGame() {
  try {
    // Starting game initialization
    console.log('🔧 Unlocks system available:', !!(window as any).App?.systems?.unlocks);
    if (!(window as any).App?.systems?.unlocks) {
      console.log('⏳ Waiting for unlocks system to load...');
      setTimeout(initGame, 100);
      return;
    }
    if (typeof DOM_CACHE === 'undefined') {
      console.log('⏳ Waiting for DOM_CACHE to load...');
      setTimeout(initGame, 100);
      return;
    }
    if (!GC || (typeof GC === 'object' && Object.keys(GC).length === 0)) {
      console.log('⏳ Waiting for GAME_CONFIG to load...');
      setTimeout(initGame, 100);
      return;
    }

    const CONF = GC || {};
    const BAL = CONF.BALANCE || {};
    const TIMING = CONF.TIMING || {};

    // Initialize state through Zustand store instead of legacy globals
    // All state is now managed through App.state

    const DEFAULT_DRINK_RATE = TIMING.DEFAULT_DRINK_RATE;
    const drinkRate = DEFAULT_DRINK_RATE;
    let lastDrinkTime = Date.now() - DEFAULT_DRINK_RATE;
    try {
      (window as any).App?.state?.setState?.({ lastDrinkTime, drinkRate });
    } catch (error) {
      console.warn('Failed to set drink time state:', error);
    }
    if (!Object.getOwnPropertyDescriptor(window, 'lastDrinkTime')) {
      Object.defineProperty(window, 'lastDrinkTime', {
        get() {
          return lastDrinkTime;
        },
        set(v) {
          lastDrinkTime = Number(v) || 0;
          try {
            (window as any).App?.stateBridge?.setLastDrinkTime(lastDrinkTime);
          } catch (error) {
            console.warn('Failed to set last drink time via bridge:', error);
          }
        },
      });
    }

    let fasterDrinks = new Decimal(0);
    (window as any).fasterDrinks = fasterDrinks;
    const fasterDrinksUpCounter = new Decimal(1);
    (window as any).fasterDrinksUpCounter = fasterDrinksUpCounter;

    let criticalClickChance = new Decimal(BAL.CRITICAL_CLICK_BASE_CHANCE);
    (window as any).criticalClickChance = criticalClickChance;
    let criticalClickMultiplier = new Decimal(BAL.CRITICAL_CLICK_BASE_MULTIPLIER);
    (window as any).criticalClickMultiplier = criticalClickMultiplier;
    // Critical clicks now managed through store

    try {
      (window as any).App?.ui?.updateAutosaveStatus?.();
    } catch (error) {
      console.warn('Failed to update autosave status:', error);
    }
    const gameStartTime = Date.now();
    let lastSaveTime: any = null;
    if (!Object.getOwnPropertyDescriptor(window, 'lastSaveTime')) {
      Object.defineProperty(window, 'lastSaveTime', {
        get() {
          try {
            return Number(
              (window as any).App?.state?.getState?.()?.lastSaveTime ?? lastSaveTime ?? 0
            );
          } catch (error) {
            console.warn('Failed to get last save time from App state:', error);
          }
          return Number(lastSaveTime || 0);
        },
        set(v) {
          lastSaveTime = Number(v) || 0;
          try {
            (window as any).App?.state?.setState?.({ lastSaveTime });
          } catch (error) {
            console.warn('Failed to set last save time in App state:', error);
          }
        },
      });
    }
    try {
      (window as any).App?.state?.setState?.({ sessionStartTime: gameStartTime, totalPlayTime: 0 });
    } catch (error) {
      console.warn('Failed to set session start time:', error);
    }

    let gameStartDate = Date.now();
    try {
      (window as any).App?.state?.setState?.({ sessionStartTime: Number(gameStartDate) });
    } catch (error) {
      console.warn('Failed to set game start date:', error);
    }
    try {
      (window as any).App?.state?.setState?.({ lastClickTime: 0 });
    } catch (error) {
      console.warn('Failed to set last click time:', error);
    }

    try {
      DOM_CACHE.init();
    } catch (error) {
      console.warn('Failed to initialize DOM_CACHE:', error);
    }

    // Load save using modular system
    let savegame: any = null;
    try {
      const w: any = window as any;
      if (w.App && w.App.storage && typeof w.App.storage.loadGame === 'function') {
        savegame = w.App.storage.loadGame();
      } else {
        savegame = JSON.parse(localStorage.getItem('save') as any);
      }
    } catch (e) {
      console.warn('Failed to load save, starting fresh.', e);
      savegame = null;
    }

    // Use modular save game loader
    saveGameLoader.loadGameState(savegame);

    try {
      (window as any).App?.events?.emit?.((window as any).App?.EVENT_NAMES?.GAME?.LOADED, {
        save: !!savegame,
      });
    } catch (error) {
      console.warn('Failed to emit game loaded event:', error);
    }

    // Use Zustand store for state management instead of local variables
    // Get current state from store
    const currentState = (window as any).App?.state?.getState?.() || {};

    // Compute production
    const config = BAL || {};
    if ((window as any).App?.systems?.resources?.recalcProduction) {
      const up = (window as any).App?.data?.upgrades || {};
      const result = (window as any).App.systems.resources.recalcProduction({
        straws: currentState.straws || new Decimal(0),
        cups: currentState.cups || new Decimal(0),
        widerStraws: currentState.widerStraws || new Decimal(0),
        betterCups: currentState.betterCups || new Decimal(0),
        base: {
          strawBaseSPD: up?.straws?.baseSPD ?? config.STRAW_BASE_SPD,
          cupBaseSPD: up?.cups?.baseSPD ?? config.CUP_BASE_SPD,
          baseSipsPerDrink: config.BASE_SIPS_PER_DRINK,
        },
        multipliers: {
          widerStrawsPerLevel:
            up?.widerStraws?.multiplierPerLevel ?? config.WIDER_STRAWS_MULTIPLIER,
          betterCupsPerLevel: up?.betterCups?.multiplierPerLevel ?? config.BETTER_CUPS_MULTIPLIER,
        },
      });

      // Handle Decimal results properly - convert to numbers for Decimal compatibility
      // Use safe conversion to handle extreme values without returning Infinity
      // Preserve extreme SPD values - don't use toSafeNumber
      const strawSPDValue = result.strawSPD;
      const cupSPDValue = result.cupSPD;
      // Preserve extreme SPD values - don't use toSafeNumber
      const spdValue = result.sipsPerDrink;

      // Store values directly in Zustand store instead of local variables

      // Update Zustand store with recalculated values
      try {
        (window as any).App?.state?.setState?.({
          strawSPD: strawSPDValue,
          cupSPD: cupSPDValue,
          spd: spdValue,
        });
      } catch (error) {
        console.warn('Failed to update store with recalculated SPD values:', error);
      }
    } else {
      // Fallback production calculation using store values
      const strawSPD = new Decimal(config.STRAW_BASE_SPD);
      const cupSPD = new Decimal(config.CUP_BASE_SPD);
      const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);

      // Update store with fallback values
      (window as any).App?.state?.setState?.({
        strawSPD: strawSPD,
        cupSPD: cupSPD,
        spd: baseSipsPerDrink,
      });
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
      console.warn('Failed to restore drink timing:', error);
    }

    // Seed App.state snapshot
    try {
      // State is already managed through the store, no need to seed again
      // The store already contains the loaded/initialized values
    } catch (error) {
      console.warn('Failed to seed App.state:', error);
    }

    // Update UI displays after ensuring DOM cache is ready
    const updateDisplaysWhenReady = () => {
      // DOM cache replaced with domQuery service
      if (
        !domQuery.exists('#sodaButton') ||
        !domQuery.exists('#shopTab') ||
        !domQuery.exists('#topSipValue')
      ) {
        // Waiting for DOM_CACHE
        setTimeout(updateDisplaysWhenReady, 100);
        return;
      }
      // DOM_CACHE ready, updating displays
      (window as any).App?.ui?.updateTopSipsPerDrink?.();
      (window as any).App?.ui?.updateTopSipsPerSecond?.();
    };
    updateDisplaysWhenReady();
    try {
      (window as any).App?.systems?.unlocks?.init?.();
    } catch (error) {
      console.warn('Failed to initialize unlocks system:', error);
    }

    // Initialize mobile input handling using modular system
    mobileInputHandler.initialize();
    try {
      (window as any).App?.systems?.audio?.button?.initButtonAudioSystem?.();
    } catch (error) {
      console.warn('Failed to initialize button audio system:', error);
    }
    try {
      (window as any).App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.();
    } catch (error) {
      console.warn('Failed to update button sounds toggle:', error);
    }
  } catch (error) {
    console.error('Error in initGame:', error);
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (splashScreen && gameContent) {
      splashScreen.style.display = 'none';
      gameContent.style.display = 'block';

      // Reinitialize DOM cache now that game content is visible
      if ((window as any).DOM_CACHE && typeof (window as any).DOM_CACHE.init === 'function') {
        console.log('🔄 Reinitializing DOM cache after game content becomes visible (main.ts)');
        (window as any).DOM_CACHE.init();
      }
    }
  }
}

// Legacy function removed - duplicate of mobile-input.ts version

function startGame() {
  try {
    (window as any).App?.systems?.gameInit?.startGame?.();
  } catch (error) {
    console.error('Error in startGame:', error);
  }
}

(window as any).initGame = initGame;
(window as any).startGame = startGame;

// Initialize game when ready using bootstrap system
bootstrapSystem.initializeGameWhenReady(initGame);
