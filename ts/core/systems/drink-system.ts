// Drink system: centralizes drink processing and related state/UI updates with Decimal support
//
// MEMORY: SPD (SIPS PER DRINK) MUST ALWAYS USE BREAK_ETERNITY DECIMAL OPERATIONS
// MEMORY: EXTREMELY LARGE SPD VALUES ARE THE INTENDED RESULT OF PROGRESSION
// MEMORY: NEVER CONVERT SPD TO JAVASCRIPT NUMBERS - PRESERVE FULL DECIMAL PRECISION
// MEMORY: DRINK PROGRESSION SHOULD PRODUCE EXPONENTIALLY LARGE VALUES AS INTENDED

// Modern ES6 imports - proper module resolution
import { toDecimal } from '../numbers/simplified';
import { ServiceLocator, SERVICE_KEYS } from '../services/service-locator';

export type ProcessDrinkArgs = {
  getNow?: () => number;
  getApp?: () => any;
  getGameConfig?: () => any;
  getSips?: () => any;
  setSips?: (value: any) => void;
  getSipsPerDrink?: () => any;
  getDrinkRate?: () => number;
  getLastDrinkTime?: () => number;
  getSpd?: () => any;
  getTotalSipsEarned?: () => any;
  getHighestSipsPerSecond?: () => any;
  getLastAutosaveClockMs?: () => number;
  setLastAutosaveClockMs?: (value: number) => void;
};

export function processDrinkFactory({
  getNow = () => Date.now(),
  getApp = () => ServiceLocator.get(SERVICE_KEYS.APP),
  getGameConfig = () => ServiceLocator.get(SERVICE_KEYS.GAME_CONFIG),
  getSips = () => ServiceLocator.get('sips'),
  setSips = (value: any) => ServiceLocator.register('sips', value),
  getSipsPerDrink = () => ServiceLocator.get('sipsPerDrink'),
  getDrinkRate = () => 1000,
  getLastDrinkTime = () => 0,
  getSpd = () => ServiceLocator.get('spd'),
  getTotalSipsEarned = () => ServiceLocator.get('totalSipsEarned'),
  getHighestSipsPerSecond = () => ServiceLocator.get('highestSipsPerSecond'),
  getLastAutosaveClockMs = () => ServiceLocator.get('lastAutosaveClockMs'),
  setLastAutosaveClockMs = (value: number) => ServiceLocator.register('lastAutosaveClockMs', value),
}: ProcessDrinkArgs = {}) {
  return function processDrink() {
    try {
      const App = getApp();
      const GAME_CONFIG = getGameConfig();
      const BAL = GAME_CONFIG?.BALANCE || {};
      const state = App?.state?.getState?.() || {};

      // Required state from legacy globals (kept during migration)
      const drinkRate: number = Number(state.drinkRate ?? getDrinkRate());
      const lastDrinkTime: number = Number(state.lastDrinkTime ?? getLastDrinkTime());

      const now = getNow();
      // Debug logging removed for production
      if (now - lastDrinkTime < drinkRate) {
        // Too soon to process drink
        return;
      }

      // Add full sips-per-drink (base + production) with Decimal support
      const sipsPerDrink = getSipsPerDrink();
      const stateSpdValue = state.spd?.toNumber?.() ?? state.spd ?? 0;
      const baseSpdVal = toDecimal(
        stateSpdValue > 0 ? stateSpdValue : (sipsPerDrink?.toNumber?.() ?? sipsPerDrink ?? BAL.BASE_SIPS_PER_DRINK ?? 1)
      );
      // Debug logging removed for production

      // Apply level bonuses from hybrid level system (defensive access)
      let levelBonuses = { sipMultiplier: 1.0, clickMultiplier: 1.0 };
      try {
        if (App?.systems?.hybridLevel?.getCurrentLevelBonuses) {
          levelBonuses = App.systems.hybridLevel.getCurrentLevelBonuses();
        }
      } catch (error) {
        console.warn('⚠️ Failed to get level bonuses, using defaults:', error);
      }
      const spdVal = baseSpdVal.mul(toDecimal(levelBonuses.sipMultiplier));

      // Handle sips accumulation with Decimal arithmetic
      const currentSips = toDecimal(getSips() || 0);
      const newSips = currentSips.add(spdVal);
      // Debug logging removed for production
      setSips(newSips);

      // Mirror totals with Decimal support
      const prevTotal = toDecimal(getTotalSipsEarned() || 0);
      const prevHigh = toDecimal(getHighestSipsPerSecond() || 0);
      const spdNum = toDecimal(state.spd ?? getSpd() ?? 0);

      // Calculate current sips per second (keep in Decimal space to preserve precision)
      const rateInSeconds = drinkRate / 1000;
      const rateInSecondsDecimal = toDecimal(rateInSeconds);
      const currentSipsPerSecond =
        rateInSeconds > 0 ? spdNum.div(rateInSecondsDecimal) : toDecimal(0);

      // Compare highest SPS using Decimal operations to preserve extreme values
      const highest = prevHigh.gte(currentSipsPerSecond) ? prevHigh : currentSipsPerSecond;

      // Update total sips earned
      const newTotalEarned = prevTotal.add(spdVal);

      // Reset progress and last drink time
      const nextLast = now;
      const nextProgress = 0;

      try {
        App?.stateBridge?.setLastDrinkTime?.(nextLast);
      } catch (error) {
        console.warn('Failed to set last drink time via bridge:', error);
      }
      try {
        App?.stateBridge?.setDrinkProgress?.(nextProgress);
      } catch (error) {
        console.warn('Failed to set drink progress via bridge:', error);
      }

      try {
        // Keep Decimal in state for sips and totalSipsPerSecond to preserve extreme value precision
        // Always use string representation to avoid precision loss with extreme values
        const highestForUI = highest.toString();

        App?.state?.setState?.({
          sips: getSips(),
          totalSipsEarned: newTotalEarned,
          highestSipsPerSecond: highestForUI,
          lastDrinkTime: nextLast,
          drinkProgress: nextProgress,
        });
      } catch (error) {
        console.warn('Failed to update drink state:', error);
      }

      try {
        App?.ui?.updateDrinkProgress?.(nextProgress, drinkRate);
      } catch (error) {
        console.warn('Failed to update drink progress UI:', error);
      }
      // Update top counters immediately after awarding sips
      try {
        App?.ui?.updateTopSipsPerDrink?.();
      } catch (error) {
        console.warn('Failed to update top sips per drink display:', error);
      }
      try {
        App?.ui?.updateTopSipsPerSecond?.();
      } catch (error) {
        console.warn('Failed to update top sips per second display:', error);
      }
      try {
        App?.ui?.updateTopSipCounter?.();
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
          const last = Number(getLastAutosaveClockMs() || 0);
          const intervalMs = Math.max(0, intervalSec * 1000);
          if (!last) {
            setLastAutosaveClockMs(nowMs);
          } else if (nowMs - last >= intervalMs) {
            try {
              App?.systems?.save?.performSaveSnapshot?.();
            } catch (error) {
              console.warn('Failed to perform autosave snapshot:', error);
            }
            setLastAutosaveClockMs(nowMs);
          }
        }
      } catch (error) {
        console.warn('Failed to handle wall-clock autosave:', error);
      }
      try {
        App?.ui?.checkUpgradeAffordability?.();
      } catch (error) {
        console.warn('Failed to check upgrade affordability:', error);
      }
    } catch (error) {
      console.warn('Failed to process drink:', error);
    }
  };
}
