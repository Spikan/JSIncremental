// Drink system: centralizes drink processing and related state/UI updates with Decimal support
//
// MEMORY: SPD (SIPS PER DRINK) MUST ALWAYS USE BREAK_ETERNITY DECIMAL OPERATIONS
// MEMORY: EXTREMELY LARGE SPD VALUES ARE THE INTENDED RESULT OF PROGRESSION
// MEMORY: NEVER CONVERT SPD TO JAVASCRIPT NUMBERS - PRESERVE FULL DECIMAL PRECISION
// MEMORY: DRINK PROGRESSION SHOULD PRODUCE EXPONENTIALLY LARGE VALUES AS INTENDED

import { toDecimal } from '../numbers/migration-utils';
// Direct Decimal access - no wrapper needed

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

      // Add full sips-per-drink (base + production) with Decimal support
      const spdVal = toDecimal(
        state.spd ?? w.sipsPerDrink?.toNumber?.() ?? w.sipsPerDrink ?? BAL.BASE_SIPS_PER_DRINK ?? 1
      );

      // Handle sips accumulation with Decimal arithmetic
      const currentSips = toDecimal(w.sips || 0);
      w.sips = currentSips.add(spdVal);

      // Mirror totals with Decimal support
      const prevTotal = toDecimal(w.App?.state?.getState?.()?.totalSipsEarned || 0);
      const prevHigh = toDecimal(w.App?.state?.getState?.()?.highestSipsPerSecond || 0);
      const spdNum = toDecimal(state.spd ?? 0);

      // Calculate current sips per second (convert to number for rate calculation)
      const rateInSeconds = drinkRate / 1000;
      const currentSipsPerSecond =
        // Preserve extreme values in SPS calculation
        rateInSeconds > 0 ? spdNum.toNumber() / rateInSeconds : 0;
      // Preserve extreme values when comparing highest SPS
      const highest = Math.max(prevHigh.toNumber(), currentSipsPerSecond);

      // Update total sips earned
      const newTotalEarned = prevTotal.add(spdVal);

      // Reset progress and last drink time
      const nextLast = now;
      const nextProgress = 0;

      try {
        w.App?.stateBridge?.setLastDrinkTime?.(nextLast);
      } catch (error) {
        console.warn('Failed to set last drink time via bridge:', error);
      }
      try {
        w.App?.stateBridge?.setDrinkProgress?.(nextProgress);
      } catch (error) {
        console.warn('Failed to set drink progress via bridge:', error);
      }

      try {
        // Keep Decimal in state for sips and totalSipsEarned to avoid Infinity in UI formatting
        w.App?.state?.setState?.({
          sips: w.sips,
          totalSipsEarned: newTotalEarned,
          highestSipsPerSecond: highest,
          lastDrinkTime: nextLast,
          drinkProgress: nextProgress,
        });
      } catch (error) {
        console.warn('Failed to update drink state:', error);
      }

      try {
        w.App?.ui?.updateDrinkProgress?.(nextProgress, drinkRate);
      } catch (error) {
        console.warn('Failed to update drink progress UI:', error);
      }
      // Update top counters immediately after awarding sips
      try {
        w.App?.ui?.updateTopSipsPerDrink?.();
      } catch (error) {
        console.warn('Failed to update top sips per drink display:', error);
      }
      try {
        w.App?.ui?.updateTopSipsPerSecond?.();
      } catch (error) {
        console.warn('Failed to update top sips per second display:', error);
      }
      try {
        w.App?.ui?.updateTopSipCounter?.();
      } catch (error) {
        console.warn('Failed to update top sip counter display:', error);
      }
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
            } catch (error) {
              console.warn('Failed to perform autosave snapshot:', error);
            }
            w.__lastAutosaveClockMs = nowMs;
          }
        }
      } catch (error) {
        console.warn('Failed to handle wall-clock autosave:', error);
      }
      try {
        w.App?.ui?.checkUpgradeAffordability?.();
      } catch (error) {
        console.warn('Failed to check upgrade affordability:', error);
      }
    } catch (error) {
      console.warn('Failed to process drink:', error);
    }
  };
}
