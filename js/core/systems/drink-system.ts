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

      // Add base sips per drink
      const base = Number(BAL.BASE_SIPS_PER_DRINK ?? 1);
      if (typeof w.sips?.plus === 'function') {
        w.sips = w.sips.plus(base);
      } else {
        w.sips = Number(w.sips || 0) + base;
      }

      // Mirror totals
      const prevTotal = Number(w.App?.state?.getState?.()?.totalSipsEarned || 0);
      const prevHigh = Number(w.App?.state?.getState?.()?.highestSipsPerSecond || 0);
      const spsNum = Number(state.sps ?? 0);
      const currentSipsPerSecond = (drinkRate ? (1000 / drinkRate) : 0) * spsNum;
      const highest = Math.max(prevHigh, currentSipsPerSecond);

      // Reset progress and last drink time
      const nextLast = now;
      const nextProgress = 0;

      try { w.App?.stateBridge?.setLastDrinkTime?.(nextLast); } catch {}
      try { w.App?.stateBridge?.setDrinkProgress?.(nextProgress); } catch {}

      try {
        const toNum = (v: any) => (v && typeof v.toNumber === 'function') ? v.toNumber() : Number(v || 0);
        w.App?.state?.setState?.({
          sips: toNum(w.sips),
          totalSipsEarned: prevTotal + base,
          highestSipsPerSecond: highest,
          lastDrinkTime: nextLast,
          drinkProgress: nextProgress,
        });
      } catch {}

      try { w.App?.ui?.updateDrinkProgress?.(nextProgress, drinkRate); } catch {}
      try { w.App?.systems?.autosave?.computeAutosaveCounter && w.App.systems.autosave.computeAutosaveCounter; } catch {}
      try { w.App?.ui?.checkUpgradeAffordability?.(); } catch {}
    } catch {}
  };
}
