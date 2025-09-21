// Drink system: centralizes drink processing and related state/UI updates with Decimal support
//
// MEMORY: SPD (SIPS PER DRINK) MUST ALWAYS USE BREAK_ETERNITY DECIMAL OPERATIONS
// MEMORY: EXTREMELY LARGE SPD VALUES ARE THE INTENDED RESULT OF PROGRESSION
// MEMORY: NEVER CONVERT SPD TO JAVASCRIPT NUMBERS - PRESERVE FULL DECIMAL PRECISION
// MEMORY: DRINK PROGRESSION SHOULD PRODUCE EXPONENTIALLY LARGE VALUES AS INTENDED

// Modern ES6 imports - proper module resolution
import { toDecimal } from '../numbers/simplified';
import { useGameStore } from '../state/zustand-store';
import { hybridLevelSystem } from './hybrid-level-system';
import { errorHandler } from '../error-handling/error-handler';
import { recalcProduction } from './resources';

// Factory function for dependency injection (for tests)
export function processDrinkFactory({
  getNow = () => Date.now(),
  getState = () => useGameStore.getState(),
  setState = (state: any) => useGameStore.setState(state),
}: {
  getNow?: () => number;
  getState?: () => any;
  setState?: (state: any) => void;
} = {}) {
  return function processDrink(): void {
    try {
      // Get current state
      const state = getState();
      const now = getNow();

      // Apply level bonuses from hybrid level system (defensive access)
      let levelBonuses = { sipMultiplier: 1.0, clickMultiplier: 1.0 };
      try {
        if (hybridLevelSystem?.getCurrentLevelBonuses) {
          levelBonuses = hybridLevelSystem.getCurrentLevelBonuses();
        }
      } catch (error) {
        errorHandler.handleError(error, 'getLevelBonuses', { fallback: 'using defaults' });
      }

      // Recalculate SPD based on current resources
      const productionResult = recalcProduction({
        straws: state.straws || 0,
        cups: state.cups || 0,
        widerStraws: state.widerStraws || 0,
        betterCups: state.betterCups || 0,
      });

      const baseSpdVal = productionResult.sipsPerDrink;
      const spdVal = toDecimal(baseSpdVal.mul(toDecimal(levelBonuses.sipMultiplier)).toString());

      // Always update SPD in store so UI stays in sync even during cooldown
      setState({ spd: spdVal });

      // Only process a drink if enough time has passed
      if (now - state.lastDrinkTime >= state.drinkRate) {
        const currentSips = toDecimal(state.sips || 0);
        const newSips = currentSips.add(spdVal);

        // Update state with new values
        setState({
          sips: newSips,
          totalSipsEarned: toDecimal(state.totalSipsEarned || 0).add(spdVal),
          lastDrinkTime: now,
          drinkProgress: 0,
        });
      }

      // Calculate sips per second for tracking using the EFFECTIVE SPD (with multipliers)
      const spdNum = spdVal;
      const rateInSeconds = state.drinkRate / 1000;
      const rateInSecondsDecimal = toDecimal(rateInSeconds);
      const currentSipsPerSecond =
        rateInSeconds > 0 ? spdNum.div(rateInSecondsDecimal) : toDecimal(0);

      // Update highest sips per second if needed
      if (currentSipsPerSecond.gt(toDecimal(state.highestSipsPerSecond || 0))) {
        setState({ highestSipsPerSecond: currentSipsPerSecond });
      }

      // Drink processed successfully
    } catch (error) {
      errorHandler.handleError(error, 'processDrink', { critical: true });
      // Don't throw - this would crash the game loop
      // Instead, log the error and continue with a safe fallback
      console.error('Drink processing failed, continuing with safe fallback:', error);
    }
  };
}

// Unified modern drink system export - delegate to factory implementation
// Lazily initialize to avoid TDZ issues from circular imports during module evaluation
let __processDrinkMemo: (() => void) | null = null;

export function getProcessDrink(): () => void {
  if (!__processDrinkMemo) {
    __processDrinkMemo = processDrinkFactory();
  }
  return __processDrinkMemo;
}

// Convenience export that defers to the memoized implementation
export function processDrink(): void {
  try {
    getProcessDrink()();
  } catch (error) {
    errorHandler.handleError(error, 'processDrink', { critical: true });
  }
}
