// Drink system: centralizes drink processing and related state/UI updates with Decimal support
//
// MEMORY: SPD (SIPS PER DRINK) MUST ALWAYS USE BREAK_ETERNITY DECIMAL OPERATIONS
// MEMORY: EXTREMELY LARGE SPD VALUES ARE THE INTENDED RESULT OF PROGRESSION
// MEMORY: NEVER CONVERT SPD TO JAVASCRIPT NUMBERS - PRESERVE FULL DECIMAL PRECISION
// MEMORY: DRINK PROGRESSION SHOULD PRODUCE EXPONENTIALLY LARGE VALUES AS INTENDED

// Modern ES6 imports - proper module resolution
import { toDecimal } from '../numbers/simplified';
import { useGameStore } from '../state/zustand-store';

// Modern drink system using only Zustand store
export function processDrink(): void {
  try {
    // Get current state from Zustand store
    const state = useGameStore.getState();
    const now = Date.now();

    // Check if enough time has passed since last drink
    console.log('🔧 Drink system timing check:', {
      now,
      lastDrinkTime: state.lastDrinkTime,
      drinkRate: state.drinkRate,
      timeSinceLastDrink: now - state.lastDrinkTime,
      shouldProcess: now - state.lastDrinkTime >= state.drinkRate,
    });

    if (now - state.lastDrinkTime < state.drinkRate) {
      console.log('🔧 Drink system: too soon, returning early');
      return;
    }

    // Get game config from global (this is the only global we need)
    const GAME_CONFIG = (globalThis as any).GAME_CONFIG;
    const BAL = GAME_CONFIG?.BALANCE || {};

    // Apply level bonuses from hybrid level system (defensive access)
    let levelBonuses = { sipMultiplier: 1.0, clickMultiplier: 1.0 };
    try {
      const App = (globalThis as any).App;
      if (App?.systems?.hybridLevel?.getCurrentLevelBonuses) {
        levelBonuses = App.systems.hybridLevel.getCurrentLevelBonuses();
      }
    } catch (error) {
      console.warn('⚠️ Failed to get level bonuses, using defaults:', error);
    }

    // Calculate base SPD value - handle Decimal 0 properly
    const stateSpdValue = state.spd?.toNumber?.() ?? state.spd ?? 0;
    const baseSpdVal = toDecimal(
      stateSpdValue > 0
        ? stateSpdValue
        : (state.spd?.toNumber?.() ?? state.spd ?? BAL.BASE_SIPS_PER_DRINK ?? 1)
    );

    console.log('🔧 Drink system calculation:', {
      stateSpd: state.spd,
      stateSpdValue,
      baseSpdVal: baseSpdVal.toString(),
      levelBonuses,
      BAL_BASE_SIPS_PER_DRINK: BAL.BASE_SIPS_PER_DRINK,
    });

    const spdVal = baseSpdVal.mul(toDecimal(levelBonuses.sipMultiplier));
    const currentSips = toDecimal(state.sips || 0);
    const newSips = currentSips.add(spdVal);

    console.log('🔧 Drink system sips calculation:', {
      spdVal: spdVal.toString(),
      currentSips: currentSips.toString(),
      newSips: newSips.toString(),
    });

    // Update Zustand store with new values
    useGameStore.setState({
      sips: newSips,
      totalSipsEarned: toDecimal(state.totalSipsEarned || 0).add(spdVal),
      lastDrinkTime: now,
      drinkProgress: 0,
    });

    // Calculate sips per second for tracking
    const spdNum = toDecimal(state.spd || 0);
    const rateInSeconds = state.drinkRate / 1000;
    const rateInSecondsDecimal = toDecimal(rateInSeconds);
    const currentSipsPerSecond =
      rateInSeconds > 0 ? spdNum.div(rateInSecondsDecimal) : toDecimal(0);

    // Update highest sips per second if needed
    if (currentSipsPerSecond.gt(toDecimal(state.highestSipsPerSecond || 0))) {
      useGameStore.setState({ highestSipsPerSecond: currentSipsPerSecond });
    }

    // Update last autosave clock (this is handled by the autosave system)
    // useGameStore.setState({ lastAutosaveClockMs: now });

    console.log('✅ Drink processed successfully - sips:', newSips.toString());
  } catch (error) {
    console.error('❌ CRITICAL: Failed to process drink:', error);
    throw error;
  }
}
