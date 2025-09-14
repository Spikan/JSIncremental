// Migration script for purchases-system.ts
// This file has been partially migrated to use direct Decimal operations
// TODO: Complete migration by replacing remaining Decimal references
//
// MEMORY: ALL PURCHASE COSTS MUST USE BREAK_ETERNITY DECIMAL OPERATIONS
// MEMORY: EXTREMELY LARGE PURCHASE COSTS ARE THE INTENDED RESULT
// MEMORY: NEVER CONVERT PURCHASE COSTS TO JAVASCRIPT NUMBERS - USE FULL DECIMAL PRECISION
// MEMORY: SPD CALCULATIONS MUST PRESERVE DECIMAL PRECISION THROUGHOUT

import { nextCupCost, nextStrawCost } from '../rules/purchases.ts';
import { safeToNumberOrDecimal } from '../numbers/safe-conversion';
import { recalcProduction } from './resources.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';
// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { toDecimal, gte } from '../numbers/migration-utils';
import { DecimalType } from '../numbers/decimal-utils';

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
      console.warn('🚫 purchaseStraw: Invalid input values detected');
      return null;
    }

    cost = nextStrawCost(strawsLarge, baseCost, scaling);

    // Validate cost calculation
    if (!cost || !cost.isFinite() || cost.lte(new Decimal(0))) {
      console.warn('🚫 purchaseStraw: Invalid cost calculation:', cost.toString());
      return null;
    }

    // Check affordability using Decimal comparison with additional validation
    if (!gte(sipsLarge, cost)) {
      console.log(
        '🚫 purchaseStraw: Not affordable - sips:',
        sipsLarge.toString(),
        'cost:',
        cost.toString()
      );
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
      console.warn('🚫 purchaseStraw: Invalid production calculation');
      return null;
    }

    strawSPD = productionResult.strawSPD;
    cupSPD = productionResult.cupSPD;
    sipsPerDrink = productionResult.sipsPerDrink;
  } catch (error) {
    console.warn('🚫 purchaseStraw: Error during calculation:', error);
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
      console.warn('🚫 purchaseCup: Invalid input values detected');
      return null;
    }

    cost = nextCupCost(cupsLarge, baseCost, scaling);

    // Validate cost calculation
    if (!cost || !isFinite(Number(cost.toString())) || cost.lte(new Decimal(0))) {
      console.warn('🚫 purchaseCup: Invalid cost calculation:', cost?.toString());
      return null;
    }

    // Check affordability using Decimal comparison with additional validation
    if (!gte(sipsLarge, cost)) {
      console.log(
        '🚫 purchaseCup: Not affordable - sips:',
        sipsLarge.toString(),
        'cost:',
        cost.toString()
      );
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
      console.warn('🚫 purchaseCup: Invalid production calculation');
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
    console.warn('🚫 purchaseCup: Error during calculation:', error);
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

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const strawsLarge = toDecimal(straws);
  const cupsLarge = toDecimal(cups);
  const widerStrawsLarge = toDecimal(widerStraws);
  const betterCupsLarge = toDecimal(betterCups);

  const baseCostLarge = new Decimal(baseCost);
  const newWiderStrawsLarge = widerStrawsLarge.add(new Decimal(1));
  const cost = baseCostLarge.multiply(newWiderStrawsLarge);

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

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const strawsLarge = toDecimal(straws);
  const cupsLarge = toDecimal(cups);
  const widerStrawsLarge = toDecimal(widerStraws);
  const betterCupsLarge = toDecimal(betterCups);

  const baseCostLarge = new Decimal(baseCost);
  const newBetterCupsLarge = betterCupsLarge.add(new Decimal(1));
  const cost = baseCostLarge.multiply(newBetterCupsLarge);

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

export function upgradeFasterDrinks({
  sips,
  fasterDrinksUpCounter,
}: {
  sips: number | DecimalType;
  fasterDrinksUpCounter: number | DecimalType;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const base = up?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 0;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const counterLarge = toDecimal(fasterDrinksUpCounter);

  const baseLarge = new Decimal(base);
  const cost = baseLarge.multiply(counterLarge);

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCounter = counterLarge.add(new Decimal(1));

  return {
    spent: cost,
    fasterDrinksUpCounter: newCounter,
  };
}

export function purchaseCriticalClick({
  sips,
  criticalClicks,
  criticalClickChance,
}: {
  sips: number | DecimalType;
  criticalClicks: number | DecimalType;
  criticalClickChance: number | DecimalType;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST;
  const scaling = up?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING;

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const criticalClicksLarge = toDecimal(criticalClicks);
  const criticalClickChanceLarge = toDecimal(criticalClickChance);

  const baseCostLarge = new Decimal(baseCost);
  const scalingLarge = new Decimal(scaling);
  const cost = baseCostLarge.multiply(
    // Use direct Decimal pow for extreme values
    scalingLarge.pow(criticalClicksLarge)
  );

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCriticalClicks = criticalClicksLarge.add(new Decimal(1));
  const newChance = criticalClickChanceLarge.add(
    new Decimal(config.CRITICAL_CLICK_CHANCE_INCREMENT ?? 0)
  );

  return {
    spent: cost,
    criticalClicks: newCriticalClicks,
    criticalClickChance: newChance,
  };
}

export function upgradeCriticalClick({
  sips,
  criticalClickUpCounter,
  criticalClickMultiplier,
}: {
  sips: number | DecimalType;
  criticalClickUpCounter: number | DecimalType;
  criticalClickMultiplier: number | DecimalType;
}) {
  const { config } = getTypedConfig();

  // Convert inputs to Decimal for calculations
  const sipsLarge = toDecimal(sips);
  const counterLarge = toDecimal(criticalClickUpCounter);
  const multiplierLarge = toDecimal(criticalClickMultiplier);

  const baseCostLarge = new Decimal(config.CRITICAL_CLICK_UPGRADE_BASE_COST ?? 0);
  const cost = baseCostLarge.multiply(counterLarge);

  // Check affordability using Decimal comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCounter = counterLarge.add(new Decimal(1));
  const newMultiplier = multiplierLarge.add(
    new Decimal(config.CRITICAL_CLICK_MULTIPLIER_INCREMENT ?? 0)
  );

  return {
    spent: cost,
    criticalClickUpCounter: newCounter,
    criticalClickMultiplier: newMultiplier,
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

// Convenience execute-style helpers that read/update App.state directly
// Helper function to sanitize Decimal values
function sanitizeDecimal(value: DecimalType, fallback: DecimalType): DecimalType {
  if (!value) return fallback;
  try {
    if (!isFinite(Number(value.toString()))) {
      console.warn('🚫 Sanitizing extreme Decimal value:', value.toString());
      return fallback;
    }
    return value;
  } catch (error) {
    console.warn('🚫 Error sanitizing Decimal, using fallback:', error);
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
    const rawState = (window as any).App?.state?.getState?.() || {};

    // Log extreme values for debugging and monitoring
    if (rawState.sips) {
      const sipsValue = toDecimal(rawState.sips);
      if (!isFinite(Number(sipsValue.toString()))) {
        console.log('🔥 validateExtremeValues: Extreme sips detected:', sipsValue.toString());
      }
    }

    if (rawState.straws) {
      const strawsValue = toDecimal(rawState.straws);
      if (!isFinite(Number(strawsValue.toString()))) {
        console.log('🔥 validateExtremeValues: Extreme straws detected:', strawsValue.toString());
      }
    }

    if (rawState.cups) {
      const cupsValue = toDecimal(rawState.cups);
      if (!isFinite(Number(cupsValue.toString()))) {
        console.log('🔥 validateExtremeValues: Extreme cups detected:', cupsValue.toString());
      }
    }

    console.log('🔍 validateExtremeValues: Extreme value validation complete');
  } catch (error) {
    console.warn('🚨 validateExtremeValues: Error during validation:', error);
  }
}

function getAppState(): any {
  try {
    // Guard against Node.js environment
    if (typeof window === 'undefined') {
      return {};
    }
    const rawState = (window as any).App?.state?.getState?.() || {};

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
    console.warn('Failed to get app state, returning empty object:', error);
    return {};
  }
}
// function _setAppState(patch: any): void {
//   try {
//     (window as any).App?.state?.setState?.(patch);
//   } catch (error) {
//     console.warn('Failed to set app state:', error);
//   }
// }
// function _toNum(v: any): number {
//   return v && typeof v.toNumber === 'function' ? DecimalOps.toSafeNumber(v) : Number(v || 0);
// }

function subtractFromWallet(spent: number | DecimalType): any {
  const w: any = (typeof window !== 'undefined' ? window : {}) as any;
  const current = toDecimal(w.sips ?? 0);

  // For extreme values, subtract directly as Decimal to preserve precision
  let next: DecimalType;
  if (spent instanceof Decimal) {
    // Use direct Decimal subtraction for extreme values
    next = current.subtract(spent);
  } else {
    // For regular numbers, convert to Decimal
    next = current.subtract(new Decimal(spent || 0));
  }

  w.sips = next;
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
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after straw purchase:', error);
    }
    try {
      // Handle Decimal straws with extreme value support
      let strawsValue = result.straws;
      if (strawsValue instanceof Decimal) {
        // Log extreme values but preserve them
        if (!isFinite(Number(strawsValue.toString()))) {
          console.log('🔥 Extreme straws value detected in state update:', strawsValue.toString());
        }
      }
      const strawsNum =
        // Preserve extreme values - use string to avoid precision loss
        strawsValue instanceof Decimal ? strawsValue.toString() : String(strawsValue);
      w.straws = new (w.Decimal || Number)(strawsNum);
    } catch (error) {
      console.warn('Failed to update straws after straw purchase:', error);
    }
    try {
      const actions = w.App?.state?.actions;
      // Use sanitized values for state update
      const sanitizedStrawSPD = sanitizeDecimal(result.strawSPD, new Decimal('0.6'));
      const sanitizedCupSPD = sanitizeDecimal(result.cupSPD, new Decimal('1.2'));
      const sanitizedSPD = sanitizeDecimal(result.sipsPerDrink, new Decimal('1'));

      actions?.setSips?.(w.sips);
      actions?.setStraws?.(result.straws); // Use original result, sanitization happens in window.straws
      actions?.setStrawSPD?.(sanitizedStrawSPD);
      actions?.setCupSPD?.(sanitizedCupSPD);
      actions?.setSPD?.(sanitizedSPD);
    } catch (error) {
      console.warn('Failed to update App.state via actions after straw purchase:', error);
    }
    // Fallback: ensure state is patched even if actions path failed
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        straws: result.straws, // Use original result value
        strawSPD: result.strawSPD,
        cupSPD: result.cupSPD,
        spd: result.sipsPerDrink,
      });
    } catch (error) {
      console.warn('Failed to fallback setState after straw purchase:', error);
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after straw purchase:', error);
    }
    try {
      w.App?.ui?.updateShopButtonStates?.();
    } catch (error) {
      console.warn('Failed to update shop button states after straw purchase:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after straw purchase:', error);
    }
    try {
      console.log('🔍 PURCHASE: About to call updateShopStats for straw');
      w.App?.ui?.updateShopStats?.();
      console.log('🔍 PURCHASE: updateShopStats called successfully for straw');
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after straw purchase:', error);
    }
    try {
      console.log('🛒 EMITTING PURCHASE EVENT for straw:', { item: 'straw', cost: result.spent });
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'straw',
        cost: result.spent,
      });
      console.log('🛒 PURCHASE EVENT EMITTED for straw');
    } catch (error) {
      console.warn('Failed to emit purchase event for straw:', error);
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
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after cup purchase:', error);
    }
    try {
      // Handle Decimal cups with extreme value support
      let cupsValue = result.cups;
      if (cupsValue instanceof Decimal) {
        // Log extreme values but preserve them
        if (!isFinite(Number(cupsValue.toString()))) {
          console.log('🔥 Extreme cups value detected in state update:', cupsValue.toString());
        }
      }
      const cupsNum =
        // Preserve extreme values - use string to avoid precision loss
        cupsValue instanceof Decimal ? cupsValue.toString() : String(cupsValue);
      w.cups = new (w.Decimal || Number)(cupsNum);
    } catch (error) {
      console.warn('Failed to update cups after cup purchase:', error);
    }
    try {
      const actions = w.App?.state?.actions;
      // Use values as-is for state update
      actions?.setSips?.(w.sips);
      actions?.setCups?.(result.cups);
      actions?.setStrawSPD?.(result.strawSPD);
      actions?.setCupSPD?.(result.cupSPD);
      actions?.setSPD?.(result.sipsPerDrink);
    } catch (error) {
      console.warn('Failed to update App.state via actions after cup purchase:', error);
    }
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        cups: result.cups, // Use original result value
        strawSPD: result.strawSPD,
        cupSPD: result.cupSPD,
        spd: result.sipsPerDrink,
      });
    } catch (error) {
      console.warn('Failed to fallback setState after cup purchase:', error);
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after cup purchase:', error);
    }
    try {
      w.App?.ui?.updateShopButtonStates?.();
    } catch (error) {
      console.warn('Failed to update shop button states after cup purchase:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after cup purchase:', error);
    }
    try {
      w.App?.ui?.updateShopStats?.();
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after cup purchase:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'cup',
        cost: result.spent,
      });
    } catch (error) {
      console.warn('Failed to emit purchase event for cup:', error);
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
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after wider straws purchase:', error);
    }
    try {
      w.widerStraws = new (w.Decimal || Number)(
        (result.widerStraws as any).toString?.() ?? String(result.widerStraws)
      );
    } catch (error) {
      console.warn('Failed to update wider straws after purchase:', error);
    }
    try {
      const actions = w.App?.state?.actions;
      actions?.setSips?.(w.sips);
      actions?.setWiderStraws?.(result.widerStraws);
      actions?.setStrawSPD?.(result.strawSPD);
      actions?.setCupSPD?.(result.cupSPD);
      actions?.setSPD?.(result.sipsPerDrink);
    } catch (error) {
      console.warn('Failed to update App.state via actions after wider straws purchase:', error);
    }
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        widerStraws: result.widerStraws,
        strawSPD: result.strawSPD,
        cupSPD: result.cupSPD,
        spd: result.sipsPerDrink,
      });
    } catch (error) {
      console.warn('Failed to fallback setState after wider straws purchase:', error);
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after wider straws purchase:', error);
    }
    try {
      w.App?.ui?.updateShopButtonStates?.();
    } catch (error) {
      console.warn('Failed to update shop button states after wider straws purchase:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after wider straws purchase:', error);
    }
    try {
      w.App?.ui?.updateShopStats?.();
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after wider straws purchase:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'widerStraws',
        cost: result.spent,
      });
    } catch (error) {
      console.warn('Failed to emit purchase event for wider straws:', error);
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
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after better cups purchase:', error);
    }
    try {
      w.betterCups = new (w.Decimal || Number)(
        (result.betterCups as any).toString?.() ?? String(result.betterCups)
      );
    } catch (error) {
      console.warn('Failed to update better cups after purchase:', error);
    }
    try {
      const actions = w.App?.state?.actions;
      actions?.setSips?.(w.sips);
      actions?.setBetterCups?.(result.betterCups);
      actions?.setStrawSPD?.(result.strawSPD);
      actions?.setCupSPD?.(result.cupSPD);
      actions?.setSPD?.(result.sipsPerDrink);
    } catch (error) {
      console.warn('Failed to update App.state via actions after better cups purchase:', error);
    }
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        betterCups: result.betterCups,
        strawSPD: result.strawSPD,
        cupSPD: result.cupSPD,
        spd: result.sipsPerDrink,
      });
    } catch (error) {
      console.warn('Failed to fallback setState after better cups purchase:', error);
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after better cups purchase:', error);
    }
    try {
      w.App?.ui?.updateShopButtonStates?.();
    } catch (error) {
      console.warn('Failed to update shop button states after better cups purchase:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after better cups purchase:', error);
    }
    try {
      w.App?.ui?.updateShopStats?.();
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after better cups purchase:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'betterCups',
        cost: result.spent,
      });
    } catch (error) {
      console.warn('Failed to emit purchase event for better cups:', error);
    }
    return true;
  },
  buySuction(): boolean {
    const st = getAppState();
    const result = purchaseSuction({
      sips: st.sips,
      suctions: st.suctions,
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after suction purchase:', error);
    }
    try {
      w.suctions = new (w.Decimal || Number)(
        (result.suctions as any).toString?.() ?? String(result.suctions)
      );
    } catch (error) {
      console.warn('Failed to update suctions after purchase:', error);
    }
    try {
      const actions = w.App?.state?.actions;
      actions?.setSips?.(w.sips);
      actions?.setSuctions?.(result.suctions);
      actions?.setSuctionClickBonus?.(result.suctionClickBonus);
    } catch (error) {
      console.warn('Failed to update App.state via actions after suction purchase:', error);
    }
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        suctions: result.suctions,
        suctionClickBonus: result.suctionClickBonus,
      });
    } catch (error) {
      console.warn('Failed to fallback setState after suction purchase:', error);
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after suction purchase:', error);
    }
    try {
      w.App?.ui?.updateShopButtonStates?.();
    } catch (error) {
      console.warn('Failed to update shop button states after suction purchase:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after suction purchase:', error);
    }
    try {
      w.App?.ui?.updateShopStats?.();
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after suction purchase:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'suction',
        cost: result.spent,
      });
    } catch (error) {
      console.warn('Failed to emit purchase event for suction:', error);
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
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after faster drinks purchase:', error);
    }
    try {
      w.fasterDrinks = new (w.Decimal || Number)(
        (result.fasterDrinks as any).toString?.() ?? String(result.fasterDrinks)
      );
    } catch (error) {
      console.warn('Failed to update faster drinks after purchase:', error);
    }
    // Compute next drink rate based on config and new fasterDrinks count
    const { config } = getTypedConfig();
    const baseMs = Number(w.GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE ?? 5000);
    const baseReduction = Number(config.FASTER_DRINKS_REDUCTION_PER_LEVEL ?? 0);
    const bonusPerUpgrade = Number(config.FASTER_DRINKS_UPGRADE_BONUS_PER_LEVEL ?? 0);
    const minMs = Number(config.MIN_DRINK_RATE ?? 500);
    const upgrades = Number(st.fasterDrinksUpCounter || 0);
    const effectiveReduction = Math.max(0, baseReduction + bonusPerUpgrade * upgrades);
    const effectiveLevels = Number(result.fasterDrinks || 0);
    const factor = Math.pow(1 - effectiveReduction, effectiveLevels);
    const nextRate = Math.max(minMs, Math.round(baseMs * factor));
    // Apply to state (authoritative)
    try {
      const actions = w.App?.state?.actions;
      actions?.setSips?.(w.sips);
      actions?.setFasterDrinks?.(result.fasterDrinks);
      actions?.setDrinkRate?.(nextRate);
    } catch (error) {
      console.warn('Failed to update App.state via actions after faster drinks purchase:', error);
    }
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        fasterDrinks: result.fasterDrinks,
        drinkRate: nextRate,
      });
    } catch (error) {
      console.warn('Failed to fallback setState after faster drinks purchase:', error);
    }
    try {
      w.App?.stateBridge?.setDrinkRate?.(nextRate);
    } catch (error) {
      console.warn('Failed to set drink rate via bridge after faster drinks purchase:', error);
    }
    try {
      w.App?.ui?.updateCompactDrinkSpeedDisplays?.();
    } catch (error) {
      console.warn(
        'Failed to update compact drink speed displays after faster drinks purchase:',
        error
      );
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after faster drinks purchase:', error);
    }
    try {
      w.App?.ui?.updateShopButtonStates?.();
    } catch (error) {
      console.warn('Failed to update shop button states after faster drinks purchase:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after faster drinks purchase:', error);
    }
    try {
      w.App?.ui?.updateShopStats?.();
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after faster drinks purchase:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'fasterDrinks',
        cost: result.spent,
      });
    } catch (error) {
      console.warn('Failed to emit purchase event for faster drinks:', error);
    }
    return true;
  },
  buyCriticalClick(): boolean {
    const st = getAppState();
    const result = purchaseCriticalClick({
      sips: st.sips,
      criticalClicks: st.criticalClicks,
      criticalClickChance: st.criticalClickChance,
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      // Subtract cost using Decimal-safe wallet subtraction
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after critical click purchase:', error);
    }
    try {
      w.criticalClicks = new (w.Decimal || Number)(
        (result.criticalClicks as any).toString?.() ?? String(result.criticalClicks)
      );
    } catch (error) {
      console.warn('Failed to update critical clicks after purchase:', error);
    }
    try {
      // Preserve extreme values - use Decimal constructor directly
      w.criticalClickChance = new (w.Decimal || Number)(result.criticalClickChance);
    } catch (error) {
      console.warn('Failed to update critical click chance after purchase:', error);
    }
    try {
      const actions = w.App?.state?.actions;
      actions?.setSips?.(w.sips);
      actions?.setCriticalClicks?.(result.criticalClicks);
      actions?.setCriticalClickChance?.(result.criticalClickChance);
    } catch (error) {
      console.warn('Failed to update state via actions after critical click purchase:', error);
    }
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        criticalClicks: result.criticalClicks,
        criticalClickChance: result.criticalClickChance,
      });
    } catch (error) {
      console.warn('Failed to fallback setState after critical click purchase:', error);
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after critical click purchase:', error);
    }
    try {
      w.App?.ui?.updateShopButtonStates?.();
    } catch (error) {
      console.warn('Failed to update shop button states after critical click purchase:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after critical click purchase:', error);
    }
    try {
      w.App?.ui?.updateShopStats?.();
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after critical click purchase:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'criticalClick',
        cost: result.spent,
      });
    } catch (error) {
      console.warn('Failed to emit purchase event for critical click:', error);
    }
    return true;
  },
  upgradeFasterDrinks(): boolean {
    const st = getAppState();
    const result = upgradeFasterDrinks({
      sips: st.sips,
      fasterDrinksUpCounter: st.fasterDrinksUpCounter,
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after faster drinks upgrade:', error);
    }
    // Recalculate drinkRate factoring in upgrades (if any modifiers apply, integrate here)
    const { config } = getTypedConfig();
    const baseMs = Number(w.GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE ?? 5000);
    const baseReduction = Number(config.FASTER_DRINKS_REDUCTION_PER_LEVEL ?? 0);
    const bonusPerUpgrade = Number(config.FASTER_DRINKS_UPGRADE_BONUS_PER_LEVEL ?? 0);
    const minMs = Number(config.MIN_DRINK_RATE ?? 500);
    const upgrades = Number(result.fasterDrinksUpCounter || 0);
    const effectiveReduction = Math.max(0, baseReduction + bonusPerUpgrade * upgrades);
    const totalLevels = Number(st.fasterDrinks || 0);
    const factor = Math.pow(1 - effectiveReduction, totalLevels);
    const nextRate = Math.max(minMs, Math.round(baseMs * factor));
    try {
      const actions3 = w.App?.state?.actions;
      actions3?.setSips?.(w.sips);
      actions3?.setFasterDrinksUpCounter?.(result.fasterDrinksUpCounter);
      actions3?.setDrinkRate?.(nextRate);
    } catch (error) {
      console.warn('Failed to update state via actions after faster drinks upgrade:', error);
    }
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        fasterDrinksUpCounter: result.fasterDrinksUpCounter,
        drinkRate: nextRate,
      });
    } catch (error) {
      console.warn('Failed to fallback setState after faster drinks upgrade:', error);
    }
    try {
      w.App?.stateBridge?.setDrinkRate?.(nextRate);
    } catch (error) {
      console.warn('Failed to set drink rate via bridge after faster drinks upgrade:', error);
    }
    try {
      w.App?.ui?.updateCompactDrinkSpeedDisplays?.();
    } catch (error) {
      console.warn(
        'Failed to update compact drink speed displays after faster drinks upgrade:',
        error
      );
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after faster drinks upgrade:', error);
    }
    try {
      w.App?.ui?.updateShopButtonStates?.();
    } catch (error) {
      console.warn('Failed to update shop button states after faster drinks upgrade:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after faster drinks upgrade:', error);
    }
    try {
      w.App?.ui?.updateShopStats?.();
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after faster drinks upgrade:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.UPGRADE_PURCHASED, {
        item: 'fasterDrinksUp',
        cost: result.spent,
      });
    } catch (error) {
      console.warn('Failed to emit upgrade purchased event for faster drinks upgrade:', error);
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
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      // Preserve extreme values - use Decimal operations directly
      const curr = st.sips as any;
      const nextLarge =
        curr && curr.add && curr.subtract
          ? curr.add(result.sipsGained as any).subtract(result.spent as any)
          : new Decimal(curr ?? 0).add(result.sipsGained as any).subtract(result.spent as any);
      w.sips = nextLarge;
      const actions = w.App?.state?.actions;
      actions?.setSips?.(nextLarge);
      actions?.setLevel?.(safeToNumberOrDecimal(result.level));
    } catch (error) {
      console.warn('Failed to update state after level up:', error);
      try {
        const actions = w.App?.state?.actions;
        actions?.setSips?.(w.sips);
      } catch (error) {
        console.warn('Failed to update sips via actions after level up:', error);
      }
    }
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to check upgrade affordability after level up:', error);
    }
    try {
      w.App?.ui?.updateAllStats?.();
    } catch (error) {
      console.warn('Failed to update all stats after level up:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'levelUp',
        cost: result.spent,
        gained: result.sipsGained,
      });
    } catch (error) {
      console.warn('Failed to emit purchase event for level up:', error);
    }
    return true;
  },
};
