// Save system: queueing and performing saves via App.storage (TypeScript)

import { useGameStore } from '../state/zustand-store';
import * as ui from '../../ui/index';
import { mobileInputHandler } from '../../ui/mobile-input';
import { recalcProduction } from './resources';
import { FEATURE_UNLOCKS as unlockSystem } from '../../feature-unlocks';
import { hybridLevelSystem } from './hybrid-level-system';
import { optimizedEventBus } from '../../services/optimized-event-bus';
import { AppStorage } from '../../services/storage';
import { getUpgradesData } from '../../services/data-service';
import { errorHandler, safeStateOperation } from '../error-handling/error-handler';

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
    const state = useGameStore.getState();
    const payload = {
      sips: String(state.sips || 0),
      straws: String(state.straws || 0),
      cups: String(state.cups || 0),
      widerStraws: String(state.widerStraws || 0),
      betterCups: String(state.betterCups || 0),
      suctions: String(state.suctions || 0),
      fasterDrinks: String(state.fasterDrinks || 0),
      totalSipsEarned: String(state.totalSipsEarned || 0),
      // Save SPD values to preserve extreme values
      spd: String(state.spd || 0),
      strawSPD: String(state.strawSPD || 0),
      cupSPD: String(state.cupSPD || 0),
      drinkRate: Number(state.drinkRate || 0),
      lastDrinkTime: Number(state.lastDrinkTime || 0),
      drinkProgress: Number(state.drinkProgress || 0),
      lastSaveTime: Date.now(),
      totalPlayTime: Number(state.totalPlayTime || 0),
      totalClicks: Number(state.totalClicks || 0),
      // Save hybrid level system data (single source of truth for levels)
      hybridLevelData: (() => {
        const hybridSystem = hybridLevelSystem;
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
    AppStorage.saveGame(payload);
    safeStateOperation(
      () => useGameStore.setState({ lastSaveTime: payload.lastSaveTime }),
      'updateLastSaveTime',
      { lastSaveTime: payload.lastSaveTime }
    );
    optimizedEventBus.emit('game:saved', {
      timestamp: Date.now(),
      saveData: payload,
    });
    return payload;
  } catch (e) {
    errorHandler.handleError(e, 'performSaveSnapshot', { error: e });
    return null;
  }
}

// Function to reset game state to exactly match first load initialization
export async function resetGameState() {
  try {
    const w: any = window as any;
    const GC: any = w.GAME_CONFIG || {};
    const BAL = GC.BALANCE || {};
    const TIMING = GC.TIMING || {};

    // Initialize game state in Zustand store - single source of truth
    const defaultGameState = {
      sips: new Decimal(0),
      straws: new Decimal(0),
      cups: new Decimal(0),
      suctions: new Decimal(0),
      widerStraws: new Decimal(0),
      betterCups: new Decimal(0),
      level: new Decimal(1),
      spd: new Decimal(BAL.BASE_SIPS_PER_DRINK || 1),
      strawSPD: new Decimal(0),
      cupSPD: new Decimal(0),
      suctionClickBonus: new Decimal(0),
    };

    // Set up drink timing exactly like initGame
    const DEFAULT_DRINK_RATE = TIMING.DEFAULT_DRINK_RATE || 1000;
    const drinkRate = DEFAULT_DRINK_RATE;
    const drinkProgress = 0;
    const lastDrinkTime = Date.now() - DEFAULT_DRINK_RATE;

    // Set up drink timing state
    safeStateOperation(
      () => useGameStore.setState({ lastDrinkTime, drinkRate }),
      'setDrinkTimeState',
      { lastDrinkTime, drinkRate }
    );

    // Legacy global property bridge removed - use store directly

    // Initialize upgrade variables exactly like initGame
    const fasterDrinks = new Decimal(0);

    // Set up session timing exactly like initGame
    const gameStartTime = Date.now();
    // let lastSaveTime: any = null; // Legacy variable removed

    // Legacy global property bridge removed - use store directly

    // Set session state exactly like initGame
    safeStateOperation(
      () =>
        useGameStore.setState({
          sessionStartTime: gameStartTime,
          totalPlayTime: 0,
          lastClickTime: 0,
        }),
      'setSessionState',
      { gameStartTime }
    );

    // DOM elements are already available, no initialization needed
    console.log('✅ DOM elements are ready for save system');

    // Compute production exactly like initGame
    const config = BAL || {};
    if (recalcProduction) {
      const up = getUpgradesData();
      recalcProduction({
        straws: defaultGameState.straws,
        cups: defaultGameState.cups,
        widerStraws: defaultGameState.widerStraws,
        betterCups: defaultGameState.betterCups,
        base: {
          strawBaseSPD: up?.['straws']?.baseSPD ?? config.STRAW_BASE_SPD,
          cupBaseSPD: up?.['cups']?.baseSPD ?? config.CUP_BASE_SPD,
          baseSipsPerDrink: config.BASE_SIPS_PER_DRINK,
        },
        multipliers: {
          widerStrawsPerLevel:
            up?.['widerStraws']?.multiplierPerLevel ?? config.WIDER_STRAWS_MULTIPLIER,
          betterCupsPerLevel:
            up?.['betterCups']?.multiplierPerLevel ?? config.BETTER_CUPS_MULTIPLIER,
        },
      });
      // Production calculation completed (results are 0 since all resources are 0)
    }

    // Initialize Zustand store with default state
    try {
      useGameStore.setState({
        ...defaultGameState,
        fasterDrinks: fasterDrinks,
        drinkRate: Number(drinkRate || 0),
        drinkProgress: Number(drinkProgress || 0),
        lastDrinkTime: Number(lastDrinkTime || 0),
        lastSaveTime: 0,
        sessionStartTime: gameStartTime,
        totalPlayTime: 0,
        totalSipsEarned: new Decimal(0),
        totalClicks: new Decimal(0),
        highestSipsPerSecond: new Decimal(0),
        currentClickStreak: 0,
        bestClickStreak: 0,
      });
    } catch (error) {
      errorHandler.handleError(error, 'seedZustandStore', { stateData: 'reset' });
    }

    // Update displays exactly like initGame
    ui.updateTopSipsPerDrink?.();
    ui.updateTopSipsPerSecond?.();

    // Initialize systems exactly like initGame
    try {
      unlockSystem?.init?.();
    } catch (error) {
      errorHandler.handleError(error, 'initializeUnlocksSystem');
    }

    // Initialize mobile input
    try {
      mobileInputHandler?.initialize?.();
    } catch (error) {
      errorHandler.handleError(error, 'initializeMobileInput');
    }

    // Initialize audio systems
    try {
      // Audio system access modernized - using direct import
      const { initButtonAudioSystem } = await import('./button-audio');
      initButtonAudioSystem?.();
    } catch (error) {
      errorHandler.handleError(error, 'initializeButtonAudioSystem');
    }

    try {
      // Audio system access modernized - using direct import
      const { updateButtonSoundsToggleButton } = await import('./button-audio');
      updateButtonSoundsToggleButton?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateButtonSoundsToggle');
    }

    // Update autosave status
    try {
      ui.updateAutosaveStatus?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateAutosaveStatus');
    }

    return true;
  } catch (e) {
    errorHandler.handleError(e, 'resetGameState');
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
      errorHandler.handleError(error, 'resetUnlocksAfterSaveDeletion');
    }

    // Reset hybrid level system
    try {
      // Modernized - hybrid system handled by store
      // Hybrid system access modernized - using direct import
      const hybridSystem = hybridLevelSystem;
      if (hybridSystem && typeof hybridSystem.restoreState === 'function') {
        hybridSystem.restoreState(1, [1]);
      }
      // Modernized - hybrid system reset handled by store
    } catch (error) {
      errorHandler.handleError(error, 'resetHybridLevelSystemAfterSaveDeletion');
    }

    // Reset game state
    resetGameState();

    // Emit delete event
    // Modernized - event emission handled by store

    // Show success message
    alert('✅ Save game deleted successfully!\n\nYour game has been reset to the beginning.');

    return true;
  } catch (e) {
    errorHandler.handleError(e, 'deleteSave');
    alert('❌ Failed to delete save game. Please try again.');
    return false;
  }
}
