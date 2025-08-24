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
      straws:
        w.straws && typeof w.straws.toNumber === 'function'
          ? w.straws.toNumber()
          : Number(w.straws || 0),
      cups:
        w.cups && typeof w.cups.toNumber === 'function' ? w.cups.toNumber() : Number(w.cups || 0),
      widerStraws: String(w.widerStraws || 0),
      betterCups: String(w.betterCups || 0),
      suctions: String(w.suctions || 0),
      criticalClicks: String(w.criticalClicks || 0),
      fasterDrinks: String(w.fasterDrinks || 0),
      totalSipsEarned: String(w.totalSipsEarned || 0),
      drinkRate: Number(w.drinkRate || 0),
      lastDrinkTime: Number(w.lastDrinkTime || 0),
      drinkProgress: Number(w.drinkProgress || 0),
      lastSaveTime: Date.now(),
      totalPlayTime: Number(state.totalPlayTime || 0),
      totalClicks: Number(state.totalClicks || w.totalClicks || 0),
      level:
        w.level && typeof w.level.toNumber === 'function'
          ? w.level.toNumber()
          : Number(w.level || 1),
    };

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

// Function to reset game state to default values
export function resetGameState() {
  try {
    const w: any = window as any;
    const defaultState = {
      sips: 0,
      straws: 0,
      cups: 0,
      suctions: 0,
      widerStraws: 0,
      betterCups: 0,
      fasterDrinks: 0,
      criticalClicks: 0,
      level: 1,
      sps: 0,
      strawSPD: 0,
      cupSPD: 0,
      drinkRate: 1000,
      drinkProgress: 0,
      lastDrinkTime: 0,
      lastSaveTime: 0,
      lastClickTime: 0,
      sessionStartTime: Date.now(),
      totalPlayTime: 0,
      totalSipsEarned: 0,
      totalClicks: 0,
      highestSipsPerSecond: 0,
      currentClickStreak: 0,
      bestClickStreak: 0,
      criticalClickChance: 0,
      criticalClickMultiplier: 0,
      suctionClickBonus: 0,
      fasterDrinksUpCounter: 0,
      criticalClickUpCounter: 0,
    };

    // Reset global state
    w.sips = 0;
    w.straws = 0;
    w.cups = 0;
    w.suctions = 0;
    w.widerStraws = 0;
    w.betterCups = 0;
    w.fasterDrinks = 0;
    w.criticalClicks = 0;
    w.level = 1;
    w.drinkRate = 1000;
    w.drinkProgress = 0;
    w.lastDrinkTime = 0;
    w.lastSaveTime = 0;
    w.lastClickTime = 0;
    w.sessionStartTime = Date.now();
    w.totalPlayTime = 0;
    w.totalSipsEarned = 0;
    w.totalClicks = 0;
    w.highestSipsPerSecond = 0;

    // Reset Zustand store
    w.App?.state?.setState?.(defaultState);

    // Update all displays
    w.App?.ui?.updateAllDisplays?.();
    w.App?.ui?.updateTopSipCounter?.();
    w.App?.ui?.updateTopSipsPerDrink?.();
    w.App?.ui?.updateTopSipsPerSecond?.();
    w.App?.ui?.updateAllStats?.();

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
    (window as any).App?.storage?.deleteSave?.();

    // Reset unlocks
    try {
      (window as any).App?.systems?.unlocks?.reset?.();
    } catch (error) {
      console.warn('Failed to reset unlocks after save deletion:', error);
    }

    // Reset game state
    resetGameState();

    // Emit delete event
    (window as any).App?.events?.emit?.((window as any).App?.EVENT_NAMES?.GAME?.DELETED, {});

    // Show success message
    alert('✅ Save game deleted successfully!\n\nYour game has been reset to the beginning.');

    return true;
  } catch (e) {
    console.warn('deleteSave failed', e);
    alert('❌ Failed to delete save game. Please try again.');
    return false;
  }
}
