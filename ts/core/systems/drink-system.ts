// Drink system: centralizes drink processing and related state/UI updates

export type ProcessDrinkArgs = {
  getNow?: () => number;
};

export function processDrinkFactory({ getNow = () => Date.now() }: ProcessDrinkArgs = {}) {
  return function processDrink() {
    try {
      const w: any = (typeof window !== 'undefined' ? window : {}) as any;
      const BAL = w.GAME_CONFIG?.BALANCE || {};
      const state = w.App?.state?.getState?.() || {};

      // Required state from legacy globals (kept during migration)
      const drinkRate: number = Number(state.drinkRate ?? w.drinkRate ?? 1000);
      const lastDrinkTime: number = Number(state.lastDrinkTime ?? w.lastDrinkTime ?? 0);

      const now = getNow();
      if (now - lastDrinkTime < drinkRate) return;

      // Add full sips-per-drink (base + production)
      const spsVal = Number(
        state.sps ?? w.sipsPerDrink?.toNumber?.() ?? w.sipsPerDrink ?? BAL.BASE_SIPS_PER_DRINK ?? 1
      );
      if (typeof w.sips?.plus === 'function') {
        w.sips = w.sips.plus(spsVal);
      } else {
        w.sips = Number(w.sips || 0) + spsVal;
      }

      // Mirror totals
      const prevTotal = Number(w.App?.state?.getState?.()?.totalSipsEarned || 0);
      const prevHigh = Number(w.App?.state?.getState?.()?.highestSipsPerSecond || 0);
      const spsNum = Number(state.sps ?? 0);
      const currentSipsPerSecond = (drinkRate ? 1000 / drinkRate : 0) * spsNum;
      const highest = Math.max(prevHigh, currentSipsPerSecond);

      // Reset progress and last drink time
      const nextLast = now;
      const nextProgress = 0;

      try {
        w.App?.stateBridge?.setLastDrinkTime?.(nextLast);
      } catch {}
      try {
        w.App?.stateBridge?.setDrinkProgress?.(nextProgress);
      } catch {}

      try {
        const toNum = (v: any) =>
          v && typeof v.toNumber === 'function' ? v.toNumber() : Number(v || 0);
        w.App?.state?.setState?.({
          sips: toNum(w.sips),
          totalSipsEarned: prevTotal + spsVal,
          highestSipsPerSecond: highest,
          lastDrinkTime: nextLast,
          drinkProgress: nextProgress,
        });
      } catch {}

      try {
        w.App?.ui?.updateDrinkProgress?.(nextProgress, drinkRate);
      } catch {}
      // Update top counters immediately after awarding sips
      try {
        w.App?.ui?.updateTopSipsPerDrink?.();
      } catch {}
      try {
        w.App?.ui?.updateTopSipsPerSecond?.();
      } catch {}
      try {
        w.App?.ui?.updateTopSipCounter?.();
      } catch {}
      // Autosave handled by wall-clock timer below
      // Wall-clock autosave: also trigger by elapsed real time regardless of drink cadence
      try {
        const enabled = !!state?.options?.autosaveEnabled;
        const intervalSec = Number(state?.options?.autosaveInterval || 10);
        if (enabled) {
          const nowMs = Date.now();
          const last = Number(w.__lastAutosaveClockMs || 0);
          const intervalMs = Math.max(0, intervalSec * 1000);
          if (!last) {
            w.__lastAutosaveClockMs = nowMs;
          } else if (nowMs - last >= intervalMs) {
            try {
              w.App?.systems?.save?.performSaveSnapshot?.();
            } catch {}
            w.__lastAutosaveClockMs = nowMs;
          }
        }
      } catch {}
      try {
        w.App?.ui?.checkUpgradeAffordability?.();
      } catch {}
    } catch {}
  };
}
