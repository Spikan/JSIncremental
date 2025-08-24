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

export function deleteSave() {
  try {
    (window as any).App?.storage?.deleteSave?.();
    try {
      (window as any).App?.systems?.unlocks?.reset?.();
    } catch (error) {
      console.warn('Failed to reset unlocks after save deletion:', error);
    }
    (window as any).App?.events?.emit?.((window as any).App?.EVENT_NAMES?.GAME?.DELETED, {});
    return true;
  } catch (e) {
    console.warn('deleteSave failed', e);
    return false;
  }
}
