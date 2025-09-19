// Migration script for purchases-system.ts
// This file has been partially migrated to use direct Decimal operations
// TODO: Complete migration by replacing remaining Decimal references
//
// MEMORY: ALL PURCHASE COSTS MUST USE BREAK_ETERNITY DECIMAL OPERATIONS
// MEMORY: EXTREMELY LARGE PURCHASE COSTS ARE THE INTENDED RESULT
// MEMORY: NEVER CONVERT PURCHASE COSTS TO JAVASCRIPT NUMBERS - USE FULL DECIMAL PRECISION
// MEMORY: SPD CALCULATIONS MUST PRESERVE DECIMAL PRECISION THROUGHOUT

import {
  nextCupCost,
  nextStrawCost,
  nextWiderStrawsCost,
  nextBetterCupsCost,
} from '../rules/purchases.ts';
import { safeToNumberOrDecimal } from '../numbers/simplified';
import { recalcProduction } from './resources.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';
// Import Decimal properly
import Decimal from 'break_eternity.js';
import { toDecimal, gte, DecimalType } from '../numbers/simplified';
import { useGameStore } from '../state/zustand-store';
import * as ui from '../../ui/index';
import { optimizedEventBus } from '../../services/optimized-event-bus';
import { safeStateOperation, errorHandler } from '../error-handling/error-handler';
import { StateGameError } from '../error-handling/error-types';

// Centralized state update function with standardized error handling
function updateGameState(updates: {
  sips?: any;
  straws?: any;
  cups?: any;
  suctions?: any;
  widerStraws?: any;
  betterCups?: any;
  fasterDrinks?: any;
  level?: any;
  strawSPD?: any;
  cupSPD?: any;
  spd?: any;
  drinkRate?: number;
  suctionClickBonus?: any;
}) {
  return (
    safeStateOperation(
      () => {
        // Use Zustand store directly - no more dual state management
        const storeActions = useGameStore.getState().actions;

        // Sanitize Decimal values for state updates
        if (updates.strawSPD)
          updates.strawSPD = sanitizeDecimal(updates.strawSPD, new Decimal('0.6'));
        if (updates.cupSPD) updates.cupSPD = sanitizeDecimal(updates.cupSPD, new Decimal('1.2'));
        if (updates.spd) updates.spd = sanitizeDecimal(updates.spd, new Decimal('1'));

        // Apply updates
        if (updates.sips !== undefined) storeActions.setSips(updates.sips);
        if (updates.straws !== undefined) storeActions.setStraws(updates.straws);
        if (updates.cups !== undefined) storeActions.setCups(updates.cups);
        if (updates.suctions !== undefined) storeActions.setSuctions(updates.suctions);
        if (updates.widerStraws !== undefined) storeActions.setWiderStraws(updates.widerStraws);
        if (updates.betterCups !== undefined) storeActions.setBetterCups(updates.betterCups);
        if (updates.fasterDrinks !== undefined) storeActions.setFasterDrinks(updates.fasterDrinks);
        if (updates.level !== undefined) storeActions.setLevel(updates.level);
        if (updates.strawSPD !== undefined) storeActions.setStrawSPD(updates.strawSPD);
        if (updates.cupSPD !== undefined) storeActions.setCupSPD(updates.cupSPD);
        if (updates.spd !== undefined) storeActions.setSPD(updates.spd);
        if (updates.drinkRate !== undefined) storeActions.setDrinkRate(updates.drinkRate);
        if (updates.suctionClickBonus !== undefined)
          storeActions.setSuctionClickBonus(updates.suctionClickBonus);

        return true;
      },
      'updateGameState',
      { updates: Object.keys(updates) }
    ) ?? false
  );
}

function getTypedConfig(): { upgrades: any; config: any } {
  const { upgrades, config } = getUpgradesAndConfig();
  return { upgrades, config: config as any };
}

export function purchaseStraw({
  sips,
  straws,
  cups,
  widerStraws,
  betterCups,
}: {
  sips: number | DecimalType;
  straws: number | DecimalType;
  cups: number | DecimalType;
  widerStraws: number | DecimalType;
  betterCups: number | DecimalType;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5;
  const scaling = upgrades?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const strawsLarge = toDecimal(straws);
  const cupsLarge = toDecimal(cups);
  const widerStrawsLarge = toDecimal(widerStraws);
  const betterCupsLarge = toDecimal(betterCups);

  let cost: DecimalType;
  let newStraws: DecimalType;
  let strawSPD: DecimalType;
  let cupSPD: DecimalType;
  let sipsPerDrink: DecimalType;

  try {
    // Validate inputs for extreme values
    if (!isFinite(Number(sipsLarge.toString())) || !isFinite(Number(strawsLarge.toString()))) {
      errorHandler.handleError(
        new StateGameError('Invalid input values detected', 'purchaseStraw', { sips, straws })
      );
      return null;
    }

    cost = nextStrawCost(strawsLarge, baseCost, scaling);

    // Validate cost calculation
    if (!cost || !cost.isFinite() || cost.lte(new Decimal(0))) {
      errorHandler.handleError(
        new StateGameError('Invalid cost calculation', 'purchaseStraw', { cost: cost.toString() })
      );
      return null;
    }

    // Check affordability using Decimal comparison with additional validation
    if (!gte(sipsLarge, cost)) {
      // Not an error - just insufficient funds
      return null;
    }

    newStraws = strawsLarge.add(new Decimal(1));

    // Recalculate production with error handling
    const productionResult = recalcProduction({
      straws: newStraws,
      cups: cupsLarge,
      widerStraws: widerStrawsLarge,
      betterCups: betterCupsLarge,
    });

    // Validate production results
    if (
      !productionResult ||
      !isFinite(Number(productionResult.strawSPD?.toString() || 'NaN')) ||
      !isFinite(Number(productionResult.cupSPD?.toString() || 'NaN')) ||
      !isFinite(Number(productionResult.sipsPerDrink?.toString() || 'NaN'))
    ) {
      errorHandler.handleError(
        new StateGameError('Invalid production calculation', 'purchaseStraw', { productionResult })
      );
      return null;
    }

    strawSPD = productionResult.strawSPD;
    cupSPD = productionResult.cupSPD;
    sipsPerDrink = productionResult.sipsPerDrink;
  } catch (error) {
    errorHandler.handleError(error, 'purchaseStraw', {
      sips,
      straws,
      cups,
      widerStraws,
      betterCups,
    });
    return null;
  }

  return {
    spent: cost,
    straws: newStraws,
    strawSPD,
    cupSPD,
    sipsPerDrink,
  };
}

export function purchaseCup({
  sips,
  straws,
  cups,
  widerStraws,
  betterCups,
}: {
  sips: number | DecimalType;
  straws: number | DecimalType;
  cups: number | DecimalType;
  widerStraws: number | DecimalType;
  betterCups: number | DecimalType;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15;
  const scaling = upgrades?.cups?.scaling ?? config.CUP_SCALING ?? 1.15;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const strawsLarge = toDecimal(straws);
  const cupsLarge = toDecimal(cups);
  const widerStrawsLarge = toDecimal(widerStraws);
  const betterCupsLarge = toDecimal(betterCups);

  let cost: DecimalType;
  let newCups: DecimalType;
  let strawSPD: DecimalType;
  let cupSPD: DecimalType;
  let sipsPerDrink: DecimalType;

  try {
    // Validate inputs for extreme values
    if (!isFinite(Number(sipsLarge.toString())) || !isFinite(Number(cupsLarge.toString()))) {
      errorHandler.handleError(new Error('Invalid input values detected'), 'purchaseCup', {
        sips: sipsLarge?.toString(),
        cups: cupsLarge?.toString(),
      });
      return null;
    }

    cost = nextCupCost(cupsLarge, baseCost, scaling);

    // Validate cost calculation
    if (!cost || !isFinite(Number(cost.toString())) || cost.lte(new Decimal(0))) {
      errorHandler.handleError(new Error('Invalid cost calculation'), 'purchaseCup', {
        cost: cost?.toString(),
      });
      return null;
    }

    // Check affordability using Decimal comparison with additional validation
    if (!gte(sipsLarge, cost)) {
      // Not affordable - this is normal behavior, not an error
      return null;
    }

    newCups = cupsLarge.add(new Decimal(1));

    // Recalculate production with error handling
    const productionResult = recalcProduction({
      straws: strawsLarge,
      cups: newCups,
      widerStraws: widerStrawsLarge,
      betterCups: betterCupsLarge,
    });

    // Validate production results
    if (
      !productionResult ||
      !isFinite(Number(productionResult.strawSPD?.toString() || 'NaN')) ||
      !isFinite(Number(productionResult.cupSPD?.toString() || 'NaN')) ||
      !isFinite(Number(productionResult.sipsPerDrink?.toString() || 'NaN'))
    ) {
      errorHandler.handleError(new Error('Invalid production calculation'), 'purchaseCup', {
        sips: sipsLarge?.toString(),
        cups: cupsLarge?.toString(),
      });
      return null;
    }

    strawSPD = productionResult.strawSPD;
    cupSPD = productionResult.cupSPD;
    sipsPerDrink = productionResult.sipsPerDrink;

    return {
      spent: cost,
      cups: newCups,
      strawSPD,
      cupSPD,
      sipsPerDrink,
    };
  } catch (error) {
    errorHandler.handleError(error, 'purchaseCup', { sips, straws, cups, widerStraws, betterCups });
    return null;
  }
}

export function purchaseWiderStraws({
  sips,
  straws,
  cups,
  widerStraws,
  betterCups,
}: {
  sips: number | DecimalType;
  straws: number | DecimalType;
  cups: number | DecimalType;
  widerStraws: number | DecimalType;
  betterCups: number | DecimalType;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150;
  const scaling = upgrades?.widerStraws?.scaling ?? config.WIDER_STRAWS_SCALING ?? 1.2;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const strawsLarge = toDecimal(straws);
  const cupsLarge = toDecimal(cups);
  const widerStrawsLarge = toDecimal(widerStraws);
  const betterCupsLarge = toDecimal(betterCups);

  const newWiderStrawsLarge = widerStrawsLarge.add(new Decimal(1));

  // Use the same milestone-based cost calculation as the display
  const cost = nextWiderStrawsCost(newWiderStrawsLarge, baseCost, scaling);

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
    straws: strawsLarge,
    cups: cupsLarge,
    widerStraws: newWiderStrawsLarge,
    betterCups: betterCupsLarge,
  });

  return {
    spent: cost,
    widerStraws: newWiderStrawsLarge,
    strawSPD,
    cupSPD,
    sipsPerDrink,
  };
}

export function purchaseBetterCups({
  sips,
  straws,
  cups,
  widerStraws,
  betterCups,
}: {
  sips: number | DecimalType;
  straws: number | DecimalType;
  cups: number | DecimalType;
  widerStraws: number | DecimalType;
  betterCups: number | DecimalType;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400;
  const scaling = upgrades?.betterCups?.scaling ?? config.BETTER_CUPS_SCALING ?? 1.25;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const strawsLarge = toDecimal(straws);
  const cupsLarge = toDecimal(cups);
  const widerStrawsLarge = toDecimal(widerStraws);
  const betterCupsLarge = toDecimal(betterCups);

  const newBetterCupsLarge = betterCupsLarge.add(new Decimal(1));

  // Use the same milestone-based cost calculation as the display
  const cost = nextBetterCupsCost(newBetterCupsLarge, baseCost, scaling);

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
    straws: strawsLarge,
    cups: cupsLarge,
    widerStraws: widerStrawsLarge,
    betterCups: newBetterCupsLarge,
  });

  return {
    spent: cost,
    betterCups: newBetterCupsLarge,
    strawSPD,
    cupSPD,
    sipsPerDrink,
  };
}

export function purchaseSuction({
  sips,
  suctions,
}: {
  sips: number | DecimalType;
  suctions: number | DecimalType;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.suction?.baseCost ?? config.SUCTION_BASE_COST;
  const scaling = up?.suction?.scaling ?? config.SUCTION_SCALING;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const suctionsLarge = toDecimal(suctions);

  const baseCostLarge = new Decimal(baseCost);
  const scalingLarge = new Decimal(scaling);
  // Use direct Decimal pow for extreme values instead of toSafeNumber
  const cost = baseCostLarge.multiply(scalingLarge.pow(suctionsLarge));

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const newSuctions = suctionsLarge.add(new Decimal(1));
  const suctionClickBonus = new Decimal(config.SUCTION_CLICK_BONUS ?? 0).multiply(newSuctions);

  return {
    spent: cost,
    suctions: newSuctions,
    suctionClickBonus,
  };
}

export function upgradeSuction({
  sips,
  suctionUpCounter,
}: {
  sips: number | DecimalType;
  suctionUpCounter: number | DecimalType;
}) {
  const { config } = getTypedConfig();

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const counterLarge = toDecimal(suctionUpCounter);

  const baseCostLarge = new Decimal(config.SUCTION_UPGRADE_BASE_COST ?? 0);
  const cost = baseCostLarge.multiply(counterLarge);

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCounter = counterLarge.add(new Decimal(1));
  const suctionClickBonus = new Decimal(config.SUCTION_CLICK_BONUS ?? 0).multiply(newCounter);

  return {
    spent: cost,
    suctionUpCounter: newCounter,
    suctionClickBonus,
  };
}

export function purchaseFasterDrinks({
  sips,
  fasterDrinks,
}: {
  sips: number | DecimalType;
  fasterDrinks: number | DecimalType;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST;
  const scaling = up?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const fasterDrinksLarge = toDecimal(fasterDrinks);

  const baseCostLarge = new Decimal(baseCost);
  const scalingLarge = new Decimal(scaling);
  // Use direct Decimal pow for extreme values instead of toSafeNumber
  const cost = baseCostLarge.multiply(scalingLarge.pow(fasterDrinksLarge));

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const newFasterDrinks = fasterDrinksLarge.add(new Decimal(1));

  return {
    spent: cost,
    fasterDrinks: newFasterDrinks,
  };
}

export function levelUp({
  sips,
  level,
  sipsPerDrink,
}: {
  sips: number | DecimalType;
  level: number | DecimalType;
  sipsPerDrink: number | DecimalType;
}) {
  const { config } = getTypedConfig();
  const base = config.LEVEL_UP_BASE_COST ?? 0;
  const scaling = config.LEVEL_UP_SCALING ?? 1;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const levelLarge = toDecimal(level);
  const sipsPerDrinkLarge = toDecimal(sipsPerDrink);

  const baseLarge = new Decimal(base);
  const scalingLarge = new Decimal(scaling);
  // Use direct Decimal pow for extreme values instead of toSafeNumber
  const cost = baseLarge.multiply(scalingLarge.pow(levelLarge));

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const newLevel = levelLarge.add(new Decimal(1));
  const sipsGained = new Decimal(config.LEVEL_UP_SIPS_MULTIPLIER ?? 1).multiply(sipsPerDrinkLarge);
  const sipsDelta = sipsGained.subtract(cost);

  return {
    spent: cost,
    level: newLevel,
    sipsDelta,
    sipsGained,
  };
}

// Convenience execute-style helpers that read/update Zustand store directly
// Helper function to sanitize Decimal values
function sanitizeDecimal(value: DecimalType, fallback: DecimalType): DecimalType {
  if (!value) return fallback;
  try {
    if (!isFinite(Number(value.toString()))) {
      errorHandler.handleError(new Error('Sanitizing extreme Decimal value'), 'sanitizeDecimal', {
        value: value?.toString(),
      });
      return fallback;
    }
    return value;
  } catch (error) {
    errorHandler.handleError(error, 'sanitizeDecimal', {
      value: value?.toString(),
      fallback: fallback?.toString(),
    });
    return fallback;
  }
}

// Function to sanitize the entire app state and update it
// Function to validate and handle extreme values robustly
export function validateExtremeValues(): void {
  try {
    // Guard against Node.js environment
    if (typeof window === 'undefined') {
      return;
    }
    // Modernized - state handled by store
    const rawState = useGameStore.getState();

    // Log extreme values for debugging and monitoring
    if (rawState.sips) {
      const sipsValue = toDecimal(rawState.sips);
      if (!isFinite(Number(sipsValue.toString()))) {
        // Extreme sips detected - this is expected behavior in idle games
      }
    }

    if (rawState.straws) {
      const strawsValue = toDecimal(rawState.straws);
      if (!isFinite(Number(strawsValue.toString()))) {
        // Extreme straws detected - this is expected behavior in idle games
      }
    }

    if (rawState.cups) {
      const cupsValue = toDecimal(rawState.cups);
      if (!isFinite(Number(cupsValue.toString()))) {
        // Extreme cups detected - this is expected behavior in idle games
      }
    }

    // Extreme value validation complete
  } catch (error) {
    errorHandler.handleError(error, 'validateExtremeValues');
  }
}

function getAppState(): any {
  try {
    // Guard against Node.js environment
    if (typeof window === 'undefined') {
      return {};
    }
    // Modernized - state handled by store
    const rawState = useGameStore.getState();

    // Log extreme values for debugging (preserve the actual values)
    if (rawState.sips) {
      const sipsValue = toDecimal(rawState.sips);
      if (!isFinite(Number(sipsValue.toString()))) {
        console.log('🔥 getAppState: Extreme sips detected:', sipsValue.toString());
      }
    }

    if (rawState.straws) {
      const strawsValue = toDecimal(rawState.straws);
      if (!isFinite(Number(strawsValue.toString()))) {
        console.log('🔥 getAppState: Extreme straws detected:', strawsValue.toString());
      }
    }

    if (rawState.cups) {
      const cupsValue = toDecimal(rawState.cups);
      if (!isFinite(Number(cupsValue.toString()))) {
        console.log('🔥 getAppState: Extreme cups detected:', cupsValue.toString());
      }
    }

    // Return raw state as-is to preserve extreme values for proper handling
    return rawState;
  } catch (error) {
    errorHandler.handleError(error, 'getAppState');
    return {};
  }
}
// function _setAppState(patch: any): void {
//   try {
//     // Modernized - state updates handled by store
//   } catch (error) {
//     console.warn('Failed to set app state:', error);
//   }
// }
// function _toNum(v: any): number {
//   return v && typeof v.toNumber === 'function' ? DecimalOps.toSafeNumber(v) : Number(v || 0);
// }

function subtractFromWallet(spent: number | DecimalType): any {
  const state = useGameStore.getState();
  const current = toDecimal(state.sips ?? 0);

  // For extreme values, subtract directly as Decimal to preserve precision
  let next: DecimalType;
  const spentDec = spent instanceof Decimal ? spent : new Decimal(spent || 0);
  // Use standard break_eternity methods (sub)
  next = current.sub(spentDec);

  // Update Zustand store directly
  useGameStore.setState({ sips: next });
  return next;
}

export const execute = {
  buyStraw(): boolean {
    const st = getAppState();
    const result = purchaseStraw({
      sips: st.sips,
      straws: st.straws,
      cups: st.cups,
      widerStraws: st.widerStraws,
      betterCups: st.betterCups,
    });
    if (!result) return false;
    // const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      errorHandler.handleError(error, 'updateSipsAfterStrawPurchase', {
        spent: result.spent?.toString(),
      });
    }
    let strawsNum: string | undefined;
    try {
      // Handle Decimal straws with extreme value support
      let strawsValue = result.straws;
      if (strawsValue instanceof Decimal) {
        // Log extreme values but preserve them
        if (!isFinite(Number(strawsValue.toString()))) {
          console.log('🔥 Extreme straws value detected in state update:', strawsValue.toString());
        }
      }
      strawsNum =
        // Preserve extreme values - use string to avoid precision loss
        strawsValue instanceof Decimal ? strawsValue.toString() : String(strawsValue);
      // Update Zustand store directly
      useGameStore.setState({ straws: new Decimal(strawsNum) });
    } catch (error) {
      errorHandler.handleError(error, 'updateStrawsAfterStrawPurchase', {
        strawsValue: strawsNum?.toString(),
      });
    }
    // Update state using centralized function
    const stateUpdated = updateGameState({
      sips: useGameStore.getState().sips,
      straws: result.straws,
      strawSPD: result.strawSPD,
      cupSPD: result.cupSPD,
      spd: result.sipsPerDrink,
    });

    if (!stateUpdated) {
      errorHandler.handleError(
        new StateGameError(
          'Failed to update game state after straw purchase',
          'updateGameStateAfterStrawPurchase',
          { result }
        )
      );
    }
    // State is now managed directly by Zustand - no fallback needed
    try {
      ui.checkUpgradeAffordability?.();
    } catch (error) {
      errorHandler.handleError(error, 'checkUpgradeAffordabilityAfterStrawPurchase');
    }
    try {
      ui.updateShopButtonStates?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopButtonStatesAfterStrawPurchase');
    }
    try {
      ui.updateAllStats?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateAllStatsAfterStrawPurchase');
    }
    try {
      console.log('🔍 PURCHASE: About to call updateShopStats for straw');
      ui.updateShopStats?.();
      console.log('🔍 PURCHASE: updateShopStats called successfully for straw');
      ui.updateAllDisplays?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopDisplaysAfterStrawPurchase');
    }
    try {
      console.log('🛒 EMITTING PURCHASE EVENT for straw:', { item: 'straw', cost: result.spent });
      optimizedEventBus.emit('economy:purchase', {
        item: 'straw',
        cost: result.spent,
        quantity: 1,
        timestamp: Date.now(),
      });
      console.log('🛒 PURCHASE EVENT EMITTED for straw');
    } catch (error) {
      errorHandler.handleError(error, 'emitPurchaseEventForStraw', {
        item: 'straw',
        cost: result.spent?.toString(),
      });
    }
    return true;
  },
  buyCup(): boolean {
    const st = getAppState();
    const result = purchaseCup({
      sips: st.sips,
      straws: st.straws,
      cups: st.cups,
      widerStraws: st.widerStraws,
      betterCups: st.betterCups,
    });
    if (!result) return false;
    // const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      errorHandler.handleError(error, 'updateSipsAfterCupPurchase', {
        spent: result.spent?.toString(),
      });
    }
    let cupsNum: string | undefined;
    try {
      // Handle Decimal cups with extreme value support
      let cupsValue = result.cups;
      if (cupsValue instanceof Decimal) {
        // Log extreme values but preserve them
        if (!isFinite(Number(cupsValue.toString()))) {
          console.log('🔥 Extreme cups value detected in state update:', cupsValue.toString());
        }
      }
      cupsNum =
        // Preserve extreme values - use string to avoid precision loss
        cupsValue instanceof Decimal ? cupsValue.toString() : String(cupsValue);
      // Update Zustand store directly
      useGameStore.setState({ cups: new Decimal(cupsNum) });
    } catch (error) {
      errorHandler.handleError(error, 'updateCupsAfterCupPurchase', {
        cupsValue: cupsNum?.toString(),
      });
    }
    try {
      // Use Zustand store directly - no more dual state management
      const storeActions = useGameStore.getState().actions;
      storeActions.setSips(useGameStore.getState().sips);
      storeActions.setCups(result.cups);
      storeActions.setStrawSPD(result.strawSPD);
      storeActions.setCupSPD(result.cupSPD);
      storeActions.setSPD(result.sipsPerDrink);
    } catch (error) {
      errorHandler.handleError(error, 'updateStoreAfterCupPurchase');
    }
    // State is now managed directly by Zustand - no fallback needed
    try {
      ui.checkUpgradeAffordability?.();
    } catch (error) {
      errorHandler.handleError(error, 'checkUpgradeAffordabilityAfterCupPurchase');
    }
    try {
      ui.updateShopButtonStates?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopButtonStatesAfterCupPurchase');
    }
    try {
      ui.updateAllStats?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateAllStatsAfterCupPurchase');
    }
    try {
      ui.updateShopStats?.();
      ui.updateAllDisplays?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopDisplaysAfterCupPurchase');
    }
    try {
      optimizedEventBus.emit('economy:purchase', {
        item: 'cup',
        cost: result.spent,
        quantity: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitPurchaseEventForCup');
    }
    return true;
  },
  buyWiderStraws(): boolean {
    const st = getAppState();
    const result = purchaseWiderStraws({
      sips: st.sips,
      straws: st.straws,
      cups: st.cups,
      widerStraws: st.widerStraws,
      betterCups: st.betterCups,
    });
    if (!result) return false;
    // const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      errorHandler.handleError(error, 'updateSipsAfterWiderStrawsPurchase');
    }
    try {
      // Update Zustand store directly
      useGameStore.setState({
        widerStraws: new Decimal(
          (result.widerStraws as any).toString?.() ?? String(result.widerStraws)
        ),
      });
    } catch (error) {
      errorHandler.handleError(error, 'updateWiderStrawsAfterPurchase');
    }
    try {
      // Use Zustand store directly - no more dual state management
      const storeActions = useGameStore.getState().actions;
      storeActions.setSips(useGameStore.getState().sips);
      storeActions.setWiderStraws(result.widerStraws);
      storeActions.setStrawSPD(result.strawSPD);
      storeActions.setCupSPD(result.cupSPD);
      storeActions.setSPD(result.sipsPerDrink);
    } catch (error) {
      errorHandler.handleError(error, 'updateStoreAfterWiderStrawsPurchase');
    }
    // State is now managed directly by Zustand - no fallback needed
    try {
      ui.checkUpgradeAffordability?.();
    } catch (error) {
      errorHandler.handleError(error, 'checkUpgradeAffordabilityAfterWiderStrawsPurchase');
    }
    try {
      ui.updateShopButtonStates?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopButtonStatesAfterWiderStrawsPurchase');
    }
    try {
      ui.updateAllStats?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateAllStatsAfterWiderStrawsPurchase');
    }
    try {
      ui.updateShopStats?.();
      ui.updateAllDisplays?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopDisplaysAfterWiderStrawsPurchase');
    }
    try {
      optimizedEventBus.emit('economy:purchase', {
        item: 'widerStraws',
        cost: result.spent,
        quantity: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitPurchaseEventForWiderStraws');
    }
    return true;
  },
  buyBetterCups(): boolean {
    const st = getAppState();
    const result = purchaseBetterCups({
      sips: st.sips,
      straws: st.straws,
      cups: st.cups,
      widerStraws: st.widerStraws,
      betterCups: st.betterCups,
    });
    if (!result) return false;
    // const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      errorHandler.handleError(error, 'updateSipsAfterBetterCupsPurchase');
    }
    try {
      // Update Zustand store directly
      useGameStore.setState({
        betterCups: new Decimal(
          (result.betterCups as any).toString?.() ?? String(result.betterCups)
        ),
      });
    } catch (error) {
      errorHandler.handleError(error, 'updateBetterCupsAfterPurchase');
    }
    try {
      // Use Zustand store directly - no more dual state management
      const storeActions = useGameStore.getState().actions;
      storeActions.setSips(useGameStore.getState().sips);
      storeActions.setBetterCups(result.betterCups);
      storeActions.setStrawSPD(result.strawSPD);
      storeActions.setCupSPD(result.cupSPD);
      storeActions.setSPD(result.sipsPerDrink);
    } catch (error) {
      errorHandler.handleError(error, 'updateStoreAfterBetterCupsPurchase');
    }
    // State is now managed directly by Zustand - no fallback needed
    try {
      ui.checkUpgradeAffordability?.();
    } catch (error) {
      errorHandler.handleError(error, 'checkUpgradeAffordabilityAfterBetterCupsPurchase');
    }
    try {
      ui.updateShopButtonStates?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopButtonStatesAfterBetterCupsPurchase');
    }
    try {
      ui.updateAllStats?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateAllStatsAfterBetterCupsPurchase');
    }
    try {
      ui.updateShopStats?.();
      ui.updateAllDisplays?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopDisplaysAfterBetterCupsPurchase');
    }
    try {
      optimizedEventBus.emit('economy:purchase', {
        item: 'betterCups',
        cost: result.spent,
        quantity: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitPurchaseEventForBetterCups');
    }
    return true;
  },
  buySuction(): boolean {
    const st = getAppState();
    console.log('🔧 buySuction: Current state before purchase:', {
      sips: st.sips?.toString(),
      suctions: st.suctions?.toString(),
      suctionClickBonus: st.suctionClickBonus?.toString(),
    });

    const result = purchaseSuction({
      sips: st.sips,
      suctions: st.suctions,
    });
    if (!result) return false;

    console.log('🔧 buySuction: Purchase result:', {
      spent: result.spent?.toString(),
      suctions: result.suctions?.toString(),
      suctionClickBonus: result.suctionClickBonus?.toString(),
    });

    // const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      errorHandler.handleError(error, 'updateSipsAfterSuctionPurchase');
    }
    try {
      // Update Zustand store with new suction values
      console.log('🔧 buySuction: About to update store with:', {
        suctions: result.suctions?.toString(),
        suctionClickBonus: result.suctionClickBonus?.toString(),
      });
      // State is now managed directly by Zustand - no fallback needed
      console.log('🔧 buySuction: Store updated, new state:', useGameStore.getState());
      // Also update global for backward compatibility
      // Update Zustand store directly
      useGameStore.setState({
        suctions: new Decimal((result.suctions as any).toString?.() ?? String(result.suctions)),
      });
    } catch (error) {
      errorHandler.handleError(error, 'updateSuctionsAfterPurchase');
    }
    try {
      ui.checkUpgradeAffordability?.();
    } catch (error) {
      errorHandler.handleError(error, 'checkUpgradeAffordabilityAfterSuctionPurchase');
    }
    try {
      ui.updateShopButtonStates?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopButtonStatesAfterSuctionPurchase');
    }
    try {
      ui.updateAllStats?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateAllStatsAfterSuctionPurchase');
    }
    try {
      ui.updateShopStats?.();
      ui.updateAllDisplays?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopDisplaysAfterSuctionPurchase');
    }
    try {
      optimizedEventBus.emit('economy:purchase', {
        item: 'suction',
        cost: result.spent,
        quantity: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitPurchaseEventForSuction');
    }
    return true;
  },
  buyFasterDrinks(): boolean {
    const st = getAppState();
    const result = purchaseFasterDrinks({
      sips: st.sips,
      fasterDrinks: st.fasterDrinks,
    });
    if (!result) return false;
    // const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      errorHandler.handleError(error, 'updateSipsAfterFasterDrinksPurchase');
    }
    try {
      // Update Zustand store directly
      useGameStore.setState({
        fasterDrinks: new Decimal(
          (result.fasterDrinks as any).toString?.() ?? String(result.fasterDrinks)
        ),
      });
    } catch (error) {
      errorHandler.handleError(error, 'updateFasterDrinksAfterPurchase');
    }
    // Compute next drink rate based on config and new fasterDrinks count
    const { config } = getTypedConfig();
    const baseMs = Number((window as any).GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE ?? 5000);
    const baseReduction = Number(config.FASTER_DRINKS_REDUCTION_PER_LEVEL ?? 0);
    const minMs = Number(config.MIN_DRINK_RATE ?? 500);
    const effectiveReduction = Math.max(0, baseReduction);
    const effectiveLevels = Number(result.fasterDrinks || 0);
    const factor = Math.pow(1 - effectiveReduction, effectiveLevels);
    const nextRate = Math.max(minMs, Math.round(baseMs * factor));
    // Apply to state (authoritative)
    try {
      // Use Zustand store directly - no more dual state management
      const storeActions = useGameStore.getState().actions;
      storeActions.setSips(useGameStore.getState().sips);
      storeActions.setFasterDrinks(result.fasterDrinks);
      storeActions.setDrinkRate(nextRate);
    } catch (error) {
      errorHandler.handleError(error, 'updateStoreAfterFasterDrinksPurchase');
    }
    // State is now managed directly by Zustand - no fallback needed
    try {
      // stateBridge is null, so this call is not needed
    } catch (error) {
      errorHandler.handleError(error, 'setDrinkRateViaBridgeAfterFasterDrinksPurchase');
    }
    try {
      ui.updateCompactDrinkSpeedDisplays?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateCompactDrinkSpeedDisplaysAfterFasterDrinksPurchase');
    }
    try {
      ui.checkUpgradeAffordability?.();
    } catch (error) {
      errorHandler.handleError(error, 'checkUpgradeAffordabilityAfterFasterDrinksPurchase');
    }
    try {
      ui.updateShopButtonStates?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopButtonStatesAfterFasterDrinksPurchase');
    }
    try {
      ui.updateAllStats?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateAllStatsAfterFasterDrinksPurchase');
    }
    try {
      ui.updateShopStats?.();
      ui.updateAllDisplays?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateShopDisplaysAfterFasterDrinksPurchase');
    }
    try {
      optimizedEventBus.emit('economy:purchase', {
        item: 'fasterDrinks',
        cost: result.spent,
        quantity: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitPurchaseEventForFasterDrinks');
    }
    return true;
  },
  levelUp(): boolean {
    const st = getAppState();
    const result = levelUp({
      sips: st.sips,
      level: st.level,
      sipsPerDrink: st.spd,
    });
    if (!result) return false;
    // const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      // Preserve extreme values - use Decimal operations directly
      const curr = st.sips as any;
      const nextLarge =
        curr && curr.add && curr.subtract
          ? curr.add(result.sipsGained as any).subtract(result.spent as any)
          : new Decimal(curr ?? 0).add(result.sipsGained as any).subtract(result.spent as any);
      // Update Zustand store directly
      useGameStore.setState({
        sips: nextLarge,
        level: new Decimal(result.level),
      });
      // Use Zustand store directly - no more dual state management
      const storeActions = useGameStore.getState().actions;
      storeActions.setSips(nextLarge);
      storeActions.setLevel(safeToNumberOrDecimal(result.level));
    } catch (error) {
      errorHandler.handleError(error, 'updateStateAfterLevelUp');
      try {
        // Fallback to current sips value
        const storeActions = useGameStore.getState().actions;
        storeActions.setSips(useGameStore.getState().sips);
        storeActions.setLevel(safeToNumberOrDecimal(result.level));
        // Level already updated in Zustand store above
      } catch (error) {
        errorHandler.handleError(error, 'updateStateViaFallbackAfterLevelUp');
      }
    }
    try {
      ui.checkUpgradeAffordability?.();
    } catch (error) {
      errorHandler.handleError(error, 'checkUpgradeAffordabilityAfterLevelUp');
    }
    try {
      ui.updateAllStats?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateAllStatsAfterLevelUp');
    }
    try {
      ui.updateShopStats?.();
      ui.updateAllDisplays?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateDisplaysAfterLevelUp');
    }
    try {
      ui.updateLevelText?.();
      ui.updateLevelNumber?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateLevelDisplaysAfterLevelUp');
    }
    try {
      optimizedEventBus.emit('economy:purchase', {
        item: 'levelUp',
        cost: result.spent,
        quantity: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitPurchaseEventForLevelUp');
    }
    try {
      // Emit specific level up event for theme system and other listeners
      optimizedEventBus.emit('economy:upgrade_purchased', {
        upgrade: 'level',
        level: result.level,
        cost: result.spent,
        timestamp: Date.now(),
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitLevelUpEvent');
    }
    return true;
  },
};
