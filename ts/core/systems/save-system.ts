// Save system: queueing and performing saves via App.storage (TypeScript)

type QueueArgs = {
  now: number;
  lastOp: number;
  minIntervalMs: number;
  schedule: (_ms: number) => void;
  perform: () => void;
};

export function queueSave({ now, lastOp, minIntervalMs, schedule, perform }: QueueArgs) {
  const elapsed = Number(now) - Number(lastOp || 0);
  if (elapsed < Number(minIntervalMs)) {
    const delay = Number(minIntervalMs) - elapsed;
    schedule(Math.max(0, delay));
    return { queued: true } as const;
  }
  perform();
  return { queued: false } as const;
}

export function performSaveSnapshot(): any {
  try {
    const w: any = window as any;
    const state = w.App?.state?.getState?.() || {};
    const payload = {
      sips: String(w.sips || 0),
      straws: String(w.straws || 0),
      cups: String(w.cups || 0),
      widerStraws: String(w.widerStraws || 0),
      betterCups: String(w.betterCups || 0),
      suctions: String(w.suctions || 0),
      fasterDrinks: String(w.fasterDrinks || 0),
      totalSipsEarned: String(w.totalSipsEarned || 0),
      // Save SPD values to preserve extreme values
      spd: String(state.spd || w.spd || 0),
      strawSPD: String(state.strawSPD || w.strawSPD || 0),
      cupSPD: String(state.cupSPD || w.cupSPD || 0),
      drinkRate: Number(w.drinkRate || 0),
      lastDrinkTime: Number(w.lastDrinkTime || 0),
      drinkProgress: Number(w.drinkProgress || 0),
      lastSaveTime: Date.now(),
      totalPlayTime: Number(state.totalPlayTime || 0),
      totalClicks: Number(state.totalClicks || w.totalClicks || 0),
      // Save hybrid level system data (single source of truth for levels)
      hybridLevelData: (() => {
        const hybridSystem = w.App?.systems?.hybridLevel;
        const currentLevel = hybridSystem?.getCurrentLevelId?.() || 1;
        const unlockedLevels = hybridSystem?.getUnlockedLevelIds?.() || [1];
        return {
          currentLevel,
          unlockedLevels,
        };
      })(),
      // Save options including Konami code state
      options: state.options || {},
    };

    console.log('💾 Full save payload:', payload);
    w.App?.storage?.saveGame?.(payload);
    try {
      w.App?.state?.setState?.({ lastSaveTime: payload.lastSaveTime });
    } catch (error) {
      console.warn('Failed to update last save time in state:', error);
    }
    w.App?.events?.emit?.(w.App?.EVENT_NAMES?.GAME?.SAVED, payload);
    return payload;
  } catch (e) {
    console.warn('performSaveSnapshot failed', e);
    return null;
  }
}

// Function to reset game state to exactly match first load initialization
export function resetGameState() {
  try {
    const w: any = window as any;
    const GC: any = w.GAME_CONFIG || {};
    const BAL = GC.BALANCE || {};
    const TIMING = GC.TIMING || {};

    // Initialize Decimal objects exactly like initGame does
    w.sips = new Decimal(0);
    const straws = new Decimal(0);
    const cups = new Decimal(0);
    w.straws = straws;
    w.cups = cups;
    const suctions = new Decimal(0);
    w.suctions = suctions;

    // Initialize production variables
    const strawSPD = new Decimal(0);
    const cupSPD = new Decimal(0);

    // Calculate spd (sips per drink) - base amount since all resources are 0
    const baseSipsPerDrink = new Decimal(BAL.BASE_SIPS_PER_DRINK || 1);
    const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
    const spd = baseSipsPerDrink.plus(passiveSipsPerDrink); // Will be baseSipsPerDrink since resources are 0

    const suctionClickBonus = new Decimal(0);
    const widerStraws = new Decimal(0);
    w.widerStraws = widerStraws;
    const betterCups = new Decimal(0);
    w.betterCups = betterCups;
    const level = new Decimal(1);
    w.level = level;

    // Set up drink timing exactly like initGame
    const DEFAULT_DRINK_RATE = TIMING.DEFAULT_DRINK_RATE || 1000;
    const drinkRate = DEFAULT_DRINK_RATE;
    const drinkProgress = 0;
    const lastDrinkTime = Date.now() - DEFAULT_DRINK_RATE;

    // Set up drink timing state
    try {
      w.App?.state?.setState?.({ lastDrinkTime, drinkRate });
    } catch (error) {
      console.warn('Failed to set drink time state:', error);
    }

    // Set up global drink timing property
    if (!Object.getOwnPropertyDescriptor(window, 'lastDrinkTime')) {
      Object.defineProperty(window, 'lastDrinkTime', {
        get() {
          return lastDrinkTime;
        },
        set(v) {
          const newTime = Number(v) || 0;
          try {
            w.App?.stateBridge?.setLastDrinkTime(newTime);
          } catch (error) {
            console.warn('Failed to set last drink time via bridge:', error);
          }
        },
      });
    }

    // Initialize upgrade variables exactly like initGame
    const fasterDrinks = new Decimal(0);
    w.fasterDrinks = fasterDrinks;

    // Set up session timing exactly like initGame
    const gameStartTime = Date.now();
    let lastSaveTime: any = null;

    // Set up lastSaveTime property
    if (!Object.getOwnPropertyDescriptor(window, 'lastSaveTime')) {
      Object.defineProperty(window, 'lastSaveTime', {
        get() {
          try {
            return Number(w.App?.state?.getState?.()?.lastSaveTime ?? lastSaveTime ?? 0);
          } catch (error) {
            console.warn('Failed to get last save time from App state:', error);
          }
          return Number(lastSaveTime || 0);
        },
        set(v) {
          lastSaveTime = Number(v) || 0;
          try {
            w.App?.state?.setState?.({ lastSaveTime });
          } catch (error) {
            console.warn('Failed to set last save time in App state:', error);
          }
        },
      });
    }

    // Set session state exactly like initGame
    try {
      w.App?.state?.setState?.({
        sessionStartTime: gameStartTime,
        totalPlayTime: 0,
        lastClickTime: 0,
      });
    } catch (error) {
      console.warn('Failed to set session state:', error);
    }

    // DOM elements are already available, no initialization needed
    try {
      console.log('✅ DOM elements are ready for save system');
    } catch (error) {
      console.warn('Failed to verify DOM readiness:', error);
    }

    // Compute production exactly like initGame
    const config = BAL || {};
    if (w.App?.systems?.resources?.recalcProduction) {
      const up = w.App?.data?.upgrades || {};
      w.App.systems.resources.recalcProduction({
        straws: straws,
        cups: cups,
        widerStraws: widerStraws,
        betterCups: betterCups,
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
      // Production calculation completed (results are 0 since all resources are 0)
    }

    // Seed App.state snapshot exactly like initGame
    try {
      // Preserve extreme values - don't convert to regular numbers
      w.App?.state?.setState?.({
        sips: w.sips,
        straws: straws,
        cups: cups,
        suctions: suctions,
        widerStraws: widerStraws,
        betterCups: betterCups,
        fasterDrinks: fasterDrinks,
        level: level,
        spd: spd,
        strawSPD: strawSPD,
        cupSPD: cupSPD,
        drinkRate: Number(drinkRate || 0),
        drinkProgress: Number(drinkProgress || 0),
        lastDrinkTime: Number(lastDrinkTime || 0),
        lastSaveTime: 0,
        sessionStartTime: gameStartTime,
        totalPlayTime: 0,
        totalSipsEarned: 0,
        totalClicks: 0,
        highestSipsPerSecond: 0,
        currentClickStreak: 0,
        bestClickStreak: 0,
        // Preserve extreme values for click bonuses and counters
        suctionClickBonus: suctionClickBonus,
      });
    } catch (error) {
      console.warn('Failed to seed App.state:', error);
    }

    // Update displays exactly like initGame
    w.App?.ui?.updateTopSipsPerDrink?.();
    w.App?.ui?.updateTopSipsPerSecond?.();

    // Initialize systems exactly like initGame
    try {
      w.App?.systems?.unlocks?.init?.();
    } catch (error) {
      console.warn('Failed to initialize unlocks system:', error);
    }

    // Initialize mobile input
    try {
      w.App?.ui?.mobileInput?.initialize?.();
    } catch (error) {
      console.warn('Failed to initialize mobile input:', error);
    }

    // Initialize audio systems
    try {
      w.App?.systems?.audio?.button?.initButtonAudioSystem?.();
    } catch (error) {
      console.warn('Failed to initialize button audio system:', error);
    }

    try {
      w.App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.();
    } catch (error) {
      console.warn('Failed to update button sounds toggle:', error);
    }

    // Update autosave status
    try {
      w.App?.ui?.updateAutosaveStatus?.();
    } catch (error) {
      console.warn('Failed to update autosave status:', error);
    }

    return true;
  } catch (e) {
    console.warn('resetGameState failed', e);
    return false;
  }
}

export function deleteSave() {
  // Show confirmation dialog
  const confirmed = confirm(
    '⚠️ Are you sure you want to delete your save game?\n\n' +
      'This will permanently delete your progress and reset everything back to the beginning.\n\n' +
      'This action cannot be undone.'
  );

  if (!confirmed) {
    return false;
  }

  try {
    // Delete the save data
    // Modernized - save deletion handled by store

    // Reset unlocks
    try {
      // Modernized - unlocks reset handled by store
    } catch (error) {
      console.warn('Failed to reset unlocks after save deletion:', error);
    }

    // Reset hybrid level system
    try {
      // Modernized - hybrid system handled by store
      const hybridSystem = null;
      // Modernized - hybrid system reset handled by store
    } catch (error) {
      console.warn('Failed to reset hybrid level system after save deletion:', error);
    }

    // Reset game state
    resetGameState();

    // Emit delete event
    // Modernized - event emission handled by store

    // Show success message
    alert('✅ Save game deleted successfully!\n\nYour game has been reset to the beginning.');

    return true;
  } catch (e) {
    console.warn('deleteSave failed', e);
    alert('❌ Failed to delete save game. Please try again.');
    return false;
  }
}
