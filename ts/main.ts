// Main Game Logic - Legacy game logic being refactored into modular architecture (TypeScript)
// Thin shim that preserves runtime behavior while migration continues.

// Re-export nothing; this file sets up globals used by HTML and other modules

// Bring over the JS file contents verbatim with minimal edits for TS compatibility
// We import the existing JS via a triple-slash reference to keep order under Vite
// but here we inline the logic from original main.js, adapted for TS types.

// Ported inline from original main.js (TS-ified minimal changes)

const GC: any = (typeof window !== 'undefined' && (window as any).GAME_CONFIG) || {};
// DOM_CACHE and Decimal are declared in global types

// Test utilities removed from production build

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
import { mobileInputHandler } from './ui/mobile-input';
import { bootstrapSystem, initSplashScreen } from './core/systems/bootstrap';
import { toDecimal } from './core/numbers/migration-utils';
// DecimalOps removed - no longer using toSafeNumber

// Export for potential use
(window as any).initSplashScreen = initSplashScreen;

function initGame() {
  try {
    console.log('🔧 Starting game initialization...');

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

    console.log('✅ All dependencies available, proceeding with initialization...');

    const CONF = GC || {};
    const BAL = CONF.BALANCE || {};
    const TIMING = CONF.TIMING || {};

    (window as any).sips = toDecimal(0);
    let straws = toDecimal(0);
    let cups = toDecimal(0);
    (window as any).straws = straws;
    (window as any).cups = cups;
    let suctions = toDecimal(0);
    (window as any).suctions = suctions;

    let spd = toDecimal(0);
    let strawSPD = toDecimal(0);
    let cupSPD = toDecimal(0);
    let suctionClickBonus = toDecimal(0);
    let widerStraws = toDecimal(0);
    (window as any).widerStraws = widerStraws;
    let betterCups = toDecimal(0);
    (window as any).betterCups = betterCups;
    let level = toDecimal(1);
    (window as any).level = level;

    const DEFAULT_DRINK_RATE = TIMING.DEFAULT_DRINK_RATE;
    const drinkRate = DEFAULT_DRINK_RATE;
    const drinkProgress = 0;
    let lastDrinkTime = Date.now() - DEFAULT_DRINK_RATE;
    try {
      (window as any).App?.state?.setState?.({ lastDrinkTime, drinkRate });
    } catch (error) {
      console.warn('Failed to set initial drink timing:', error);
    }

    let fasterDrinks = toDecimal(0);
    (window as any).fasterDrinks = fasterDrinks;
    let criticalClicks = toDecimal(0);
    (window as any).criticalClicks = criticalClicks;
    let criticalClickChance = toDecimal(BAL.CRITICAL_CLICK_BASE_CHANCE);
    (window as any).criticalClickChance = criticalClickChance;
    let criticalClickMultiplier = toDecimal(BAL.CRITICAL_CLICK_BASE_MULTIPLIER);
    (window as any).criticalClickMultiplier = criticalClickMultiplier;
    let fasterDrinksUpCounter = toDecimal(0);
    (window as any).fasterDrinksUpCounter = fasterDrinksUpCounter;
    let criticalClickUpCounter = toDecimal(0);
    (window as any).criticalClickUpCounter = criticalClickUpCounter;

    console.log('✅ Game variables initialized');

    // Load saved game if available
    try {
      console.log('🔧 Attempting to load saved game...');
      const savedGame = (window as any).App?.systems?.save?.loadGame?.();
      if (savedGame) {
        console.log('✅ Saved game loaded successfully');
        (window as any).sips = toDecimal(savedGame.sips || 0);
        straws = toDecimal(savedGame.straws || 0);
        (window as any).straws = straws;
        cups = toDecimal(savedGame.cups || 0);
        (window as any).cups = cups;
        (window as any).suctions = toDecimal(savedGame.suctions || 0);
        widerStraws = toDecimal(savedGame.widerStraws || 0);
        (window as any).widerStraws = widerStraws;
        betterCups = toDecimal(savedGame.betterCups || 0);
        (window as any).betterCups = betterCups;
        level = toDecimal(savedGame.level || 1);
        (window as any).level = level;
        (window as any).fasterDrinks = toDecimal(savedGame.fasterDrinks || 0);
        (window as any).criticalClicks = toDecimal(savedGame.criticalClicks || 0);
        criticalClickChance = toDecimal(
          savedGame.criticalClickChance || BAL.CRITICAL_CLICK_BASE_CHANCE
        );
        (window as any).criticalClickChance = criticalClickChance;
        criticalClickMultiplier = toDecimal(
          savedGame.criticalClickMultiplier || BAL.CRITICAL_CLICK_BASE_MULTIPLIER
        );
        (window as any).criticalClickMultiplier = criticalClickMultiplier;
        (window as any).fasterDrinksUpCounter = toDecimal(savedGame.fasterDrinksUpCounter || 0);
        (window as any).criticalClickUpCounter = toDecimal(savedGame.criticalClickUpCounter || 0);

        // Restore drink timing
        const savedDrinkRate = savedGame.drinkRate || DEFAULT_DRINK_RATE;
        const savedLastDrinkTime = savedGame.lastDrinkTime || Date.now() - DEFAULT_DRINK_RATE;
        const savedDrinkProgress = savedGame.drinkProgress || 0;
        try {
          (window as any).App?.state?.setState?.({
            drinkRate: savedDrinkRate,
            lastDrinkTime: savedLastDrinkTime,
            drinkProgress: savedDrinkProgress,
          });
        } catch (error) {
          console.warn('Failed to restore drink timing:', error);
        }
      } else {
        console.log('ℹ️ No saved game found, starting fresh');
      }
    } catch (error) {
      console.warn('Failed to load saved game:', error);
    }

    // Seed App.state snapshot
    try {
      console.log('🔧 Seeding App.state with game data...');
      // Preserve extreme values - don't convert to regular numbers
      (window as any).App?.state?.setState?.({
        sips: (window as any).sips,
        straws: straws,
        cups: cups,
        suctions: (window as any).suctions,
        widerStraws: widerStraws,
        betterCups: betterCups,
        fasterDrinks: (window as any).fasterDrinks,
        criticalClicks: criticalClicks,
        level: level,
        // Preserve extreme SPD values
        spd: spd,
        strawSPD: strawSPD,
        cupSPD: cupSPD,
        drinkRate: Number(drinkRate || 0),
        drinkProgress: Number(drinkProgress || 0),
        lastDrinkTime: Number(lastDrinkTime || 0),
        // Preserve extreme click values
        criticalClickChance: criticalClickChance,
        criticalClickMultiplier: criticalClickMultiplier,
        // Preserve extreme bonus values
        suctionClickBonus: suctionClickBonus,
        fasterDrinksUpCounter: fasterDrinksUpCounter,
        criticalClickUpCounter: criticalClickUpCounter,
      });
      console.log('✅ App.state seeded successfully');
    } catch (error) {
      console.warn('Failed to seed App.state:', error);
    }

    // Update UI displays after ensuring DOM cache is ready
    const updateDisplaysWhenReady = () => {
      const domCache = (window as any).DOM_CACHE;
      if (!domCache || !domCache.isReady || !domCache.isReady()) {
        // Waiting for DOM_CACHE
        console.log('⏳ Waiting for DOM_CACHE to be ready...');
        setTimeout(updateDisplaysWhenReady, 100);
        return;
      }
      // DOM_CACHE ready, updating displays
      console.log('✅ DOM_CACHE ready, updating displays...');
      try {
        (window as any).App?.ui?.updateTopSipsPerDrink?.();
        (window as any).App?.ui?.updateTopSipsPerSecond?.();
        console.log('✅ Initial displays updated');
      } catch (error) {
        console.warn('Failed to update initial displays:', error);
      }
    };
    updateDisplaysWhenReady();

    try {
      console.log('🔧 Initializing unlocks system...');
      (window as any).App?.systems?.unlocks?.init?.();
      console.log('✅ Unlocks system initialized');
    } catch (error) {
      console.warn('Failed to initialize unlocks system:', error);
    }

    // Initialize mobile input handling using modular system
    try {
      console.log('🔧 Initializing mobile input handler...');
      mobileInputHandler.initialize();
      console.log('✅ Mobile input handler initialized');
    } catch (error) {
      console.warn('Failed to initialize mobile input handler:', error);
    }

    try {
      console.log('🔧 Initializing button audio system...');
      (window as any).App?.systems?.audio?.button?.initButtonAudioSystem?.();
      console.log('✅ Button audio system initialized');
    } catch (error) {
      console.warn('Failed to initialize button audio system:', error);
    }

    try {
      console.log('🔧 Updating button sounds toggle...');
      (window as any).App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.();
      console.log('✅ Button sounds toggle updated');
    } catch (error) {
      console.warn('Failed to update button sounds toggle:', error);
    }

    // Initialize UI systems if not already done
    try {
      console.log('🔧 Initializing UI systems...');
      if (
        (window as any).App?.ui?.initializeUI &&
        typeof (window as any).App.ui.initializeUI === 'function'
      ) {
        (window as any).App.ui.initializeUI();
        console.log('✅ UI systems initialized');
      }
    } catch (error) {
      console.warn('Failed to initialize UI systems:', error);
    }

    // Initialize button system if not already done
    try {
      console.log('🔧 Initializing button system...');
      if (
        (window as any).App?.ui?.initButtonSystem &&
        typeof (window as any).App.ui.initButtonSystem === 'function'
      ) {
        (window as any).App.ui.initButtonSystem();
        console.log('✅ Button system initialized');
      }
    } catch (error) {
      console.warn('Failed to initialize button system:', error);
    }

    // Update all displays
    try {
      console.log('🔧 Updating all displays...');
      setTimeout(() => {
        if (
          (window as any).App?.ui?.updateAllDisplays &&
          typeof (window as any).App.ui.updateAllDisplays === 'function'
        ) {
          (window as any).App.ui.updateAllDisplays();
          console.log('✅ All displays updated');
        }
      }, 100);
    } catch (error) {
      console.warn('Failed to update all displays:', error);
    }

    console.log('✅ Game initialization complete');
  } catch (error) {
    console.error('❌ Error in initGame:', error);
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (splashScreen && gameContent) {
      splashScreen.style.display = 'none';
      gameContent.style.display = 'block';
    }
  }
}

// Legacy function for backward compatibility (exported but not used in main flow)
export function setupMobileTouchHandling() {
  mobileInputHandler.initialize();
}

function startGame() {
  try {
    // Check if App object is available first
    if (!(window as any).App) {
      console.log('⏳ startGame called but App object not ready, retrying...');
      let retryCount = 0;
      const maxRetries = 30; // Max 3 seconds (30 * 100ms)
      const retryInterval = () => {
        retryCount++;
        if ((window as any).App) {
          console.log('✅ App object now available, checking gameInit...');
          startGame(); // Recursively call to check gameInit
        } else if (retryCount >= maxRetries) {
          console.error('❌ startGame failed: App object not available after max retries');
        } else {
          setTimeout(retryInterval, 100);
        }
      };
      setTimeout(retryInterval, 100);
      return;
    }

    // Check if gameInit is actually available
    const gameInit = (window as any).App?.systems?.gameInit;
    if (gameInit && typeof gameInit.startGame === 'function') {
      console.log('🚀 Starting game via gameInit...');
      gameInit.startGame();
    } else {
      console.log('⏳ startGame called but gameInit not ready, retrying...');
      // Retry with exponential backoff
      let retryCount = 0;
      const maxRetries = 20; // Max 2 seconds (20 * 100ms)
      const retryInterval = () => {
        retryCount++;
        const gameInitRetry = (window as any).App?.systems?.gameInit;
        if (gameInitRetry && typeof gameInitRetry.startGame === 'function') {
          console.log('✅ gameInit now ready, starting game...');
          gameInitRetry.startGame();
        } else if (retryCount >= maxRetries) {
          console.error('❌ startGame failed: gameInit not available after max retries');
          console.log('🔍 Debug info:', {
            appExists: !!(window as any).App,
            systemsExists: !!(window as any).App?.systems,
            gameInitExists: !!(window as any).App?.systems?.gameInit,
            gameInitType: typeof (window as any).App?.systems?.gameInit,
          });
        } else {
          setTimeout(retryInterval, 100);
        }
      };
      setTimeout(retryInterval, 100);
    }
  } catch (error) {
    console.error('Error in startGame:', error);
  }
}

(window as any).initGame = initGame;
(window as any).startGame = startGame;

// Initialize game when ready using bootstrap system
bootstrapSystem.initializeGameWhenReady(initGame);
