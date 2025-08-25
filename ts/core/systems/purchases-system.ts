import { nextCupCost, nextStrawCost } from '../rules/purchases.ts';
import { recalcProduction } from './resources.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';
import { LargeNumber } from '../numbers/large-number';
import { toLargeNumber, gte } from '../numbers/migration-utils';

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
  sips: number | LargeNumber;
  straws: number | LargeNumber;
  cups: number | LargeNumber;
  widerStraws: number | LargeNumber;
  betterCups: number | LargeNumber;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5;
  const scaling = upgrades?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const strawsLarge = toLargeNumber(straws);
  const cupsLarge = toLargeNumber(cups);
  const widerStrawsLarge = toLargeNumber(widerStraws);
  const betterCupsLarge = toLargeNumber(betterCups);

  const cost = nextStrawCost(strawsLarge, baseCost, scaling);

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newStraws = strawsLarge.add(new LargeNumber(1));
  const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
    straws: newStraws,
    cups: cupsLarge,
    widerStraws: widerStrawsLarge,
    betterCups: betterCupsLarge,
  });

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
  sips: number | LargeNumber;
  straws: number | LargeNumber;
  cups: number | LargeNumber;
  widerStraws: number | LargeNumber;
  betterCups: number | LargeNumber;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15;
  const scaling = upgrades?.cups?.scaling ?? config.CUP_SCALING ?? 1.15;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const strawsLarge = toLargeNumber(straws);
  const cupsLarge = toLargeNumber(cups);
  const widerStrawsLarge = toLargeNumber(widerStraws);
  const betterCupsLarge = toLargeNumber(betterCups);

  const cost = nextCupCost(cupsLarge, baseCost, scaling);

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCups = cupsLarge.add(new LargeNumber(1));
  const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
    straws: strawsLarge,
    cups: newCups,
    widerStraws: widerStrawsLarge,
    betterCups: betterCupsLarge,
  });

  return {
    spent: cost,
    cups: newCups,
    strawSPD,
    cupSPD,
    sipsPerDrink,
  };
}

export function purchaseWiderStraws({
  sips,
  straws,
  cups,
  widerStraws,
  betterCups,
}: {
  sips: number | LargeNumber;
  straws: number | LargeNumber;
  cups: number | LargeNumber;
  widerStraws: number | LargeNumber;
  betterCups: number | LargeNumber;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const strawsLarge = toLargeNumber(straws);
  const cupsLarge = toLargeNumber(cups);
  const widerStrawsLarge = toLargeNumber(widerStraws);
  const betterCupsLarge = toLargeNumber(betterCups);

  const baseCostLarge = new LargeNumber(baseCost);
  const newWiderStrawsLarge = widerStrawsLarge.add(new LargeNumber(1));
  const cost = baseCostLarge.multiply(newWiderStrawsLarge);

  // Check affordability using LargeNumber comparison
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
  sips: number | LargeNumber;
  straws: number | LargeNumber;
  cups: number | LargeNumber;
  widerStraws: number | LargeNumber;
  betterCups: number | LargeNumber;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const strawsLarge = toLargeNumber(straws);
  const cupsLarge = toLargeNumber(cups);
  const widerStrawsLarge = toLargeNumber(widerStraws);
  const betterCupsLarge = toLargeNumber(betterCups);

  const baseCostLarge = new LargeNumber(baseCost);
  const newBetterCupsLarge = betterCupsLarge.add(new LargeNumber(1));
  const cost = baseCostLarge.multiply(newBetterCupsLarge);

  // Check affordability using LargeNumber comparison
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
  sips: number | LargeNumber;
  suctions: number | LargeNumber;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.suction?.baseCost ?? config.SUCTION_BASE_COST;
  const scaling = up?.suction?.scaling ?? config.SUCTION_SCALING;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const suctionsLarge = toLargeNumber(suctions);

  const baseCostLarge = new LargeNumber(baseCost);
  const scalingLarge = new LargeNumber(scaling);
  const cost = baseCostLarge.multiply(scalingLarge.pow(suctionsLarge.toNumber()));

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newSuctions = suctionsLarge.add(new LargeNumber(1));
  const suctionClickBonus = new LargeNumber(config.SUCTION_CLICK_BONUS ?? 0).multiply(newSuctions);

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
  sips: number | LargeNumber;
  suctionUpCounter: number | LargeNumber;
}) {
  const { config } = getTypedConfig();

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const counterLarge = toLargeNumber(suctionUpCounter);

  const baseCostLarge = new LargeNumber(config.SUCTION_UPGRADE_BASE_COST ?? 0);
  const cost = baseCostLarge.multiply(counterLarge);

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCounter = counterLarge.add(new LargeNumber(1));
  const suctionClickBonus = new LargeNumber(config.SUCTION_CLICK_BONUS ?? 0).multiply(newCounter);

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
  sips: number | LargeNumber;
  fasterDrinks: number | LargeNumber;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST;
  const scaling = up?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const fasterDrinksLarge = toLargeNumber(fasterDrinks);

  const baseCostLarge = new LargeNumber(baseCost);
  const scalingLarge = new LargeNumber(scaling);
  const cost = baseCostLarge.multiply(scalingLarge.pow(fasterDrinksLarge.toNumber()));

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newFasterDrinks = fasterDrinksLarge.add(new LargeNumber(1));

  return {
    spent: cost,
    fasterDrinks: newFasterDrinks,
  };
}

export function upgradeFasterDrinks({
  sips,
  fasterDrinksUpCounter,
}: {
  sips: number | LargeNumber;
  fasterDrinksUpCounter: number | LargeNumber;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const base = up?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 0;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const counterLarge = toLargeNumber(fasterDrinksUpCounter);

  const baseLarge = new LargeNumber(base);
  const cost = baseLarge.multiply(counterLarge);

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCounter = counterLarge.add(new LargeNumber(1));

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
  sips: number | LargeNumber;
  criticalClicks: number | LargeNumber;
  criticalClickChance: number | LargeNumber;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST;
  const scaling = up?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const criticalClicksLarge = toLargeNumber(criticalClicks);
  const criticalClickChanceLarge = toLargeNumber(criticalClickChance);

  const baseCostLarge = new LargeNumber(baseCost);
  const scalingLarge = new LargeNumber(scaling);
  const cost = baseCostLarge.multiply(scalingLarge.pow(criticalClicksLarge.toNumber()));

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCriticalClicks = criticalClicksLarge.add(new LargeNumber(1));
  const newChance = criticalClickChanceLarge.add(
    new LargeNumber(config.CRITICAL_CLICK_CHANCE_INCREMENT ?? 0)
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
  sips: number | LargeNumber;
  criticalClickUpCounter: number | LargeNumber;
  criticalClickMultiplier: number | LargeNumber;
}) {
  const { config } = getTypedConfig();

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const counterLarge = toLargeNumber(criticalClickUpCounter);
  const multiplierLarge = toLargeNumber(criticalClickMultiplier);

  const baseCostLarge = new LargeNumber(config.CRITICAL_CLICK_UPGRADE_BASE_COST ?? 0);
  const cost = baseCostLarge.multiply(counterLarge);

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newCounter = counterLarge.add(new LargeNumber(1));
  const newMultiplier = multiplierLarge.add(
    new LargeNumber(config.CRITICAL_CLICK_MULTIPLIER_INCREMENT ?? 0)
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
  sips: number | LargeNumber;
  level: number | LargeNumber;
  sipsPerDrink: number | LargeNumber;
}) {
  const { config } = getTypedConfig();
  const base = config.LEVEL_UP_BASE_COST ?? 0;
  const scaling = config.LEVEL_UP_SCALING ?? 1;

  // Convert inputs to LargeNumber for calculations
  const sipsLarge = toLargeNumber(sips);
  const levelLarge = toLargeNumber(level);
  const sipsPerDrinkLarge = toLargeNumber(sipsPerDrink);

  const baseLarge = new LargeNumber(base);
  const scalingLarge = new LargeNumber(scaling);
  const cost = baseLarge.multiply(scalingLarge.pow(levelLarge.toNumber()));

  // Check affordability using LargeNumber comparison
  if (!gte(sipsLarge, cost)) return null;

  const newLevel = levelLarge.add(new LargeNumber(1));
  const sipsGained = new LargeNumber(config.LEVEL_UP_SIPS_MULTIPLIER ?? 1).multiply(
    sipsPerDrinkLarge
  );
  const sipsDelta = sipsGained.subtract(cost);

  return {
    spent: cost,
    level: newLevel,
    sipsDelta,
    sipsGained,
  };
}

// Convenience execute-style helpers that read/update App.state directly
function getAppState(): any {
  try {
    return (window as any).App?.state?.getState?.() || {};
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
//   return v && typeof v.toNumber === 'function' ? v.toNumber() : Number(v || 0);
// }

function subtractFromWallet(spent: number | LargeNumber): any {
  const w: any = (typeof window !== 'undefined' ? window : {}) as any;
  const spentNum = spent instanceof LargeNumber ? spent.toNumber() : Number(spent || 0);
  const current = toLargeNumber(w.sips ?? 0);
  const next = current.subtract(new LargeNumber(spentNum));
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
      // Handle LargeNumber straws
      const strawsNum =
        result.straws instanceof LargeNumber ? result.straws.toNumber() : Number(result.straws);
      w.straws = new (w.Decimal || Number)(strawsNum);
    } catch (error) {
      console.warn('Failed to update straws after straw purchase:', error);
    }
    try {
      const actions = w.App?.state?.actions;
      actions?.setSips?.(w.sips);
      actions?.setStraws?.(result.straws);
      actions?.setStrawSPD?.(result.strawSPD);
      actions?.setCupSPD?.(result.cupSPD);
      actions?.setSPD?.(result.sipsPerDrink);
    } catch (error) {
      console.warn('Failed to update App.state via actions after straw purchase:', error);
    }
    // Fallback: ensure state is patched even if actions path failed
    try {
      w.App?.state?.setState?.({
        sips: w.sips,
        straws: result.straws,
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
      console.log('🔧 Calling updateShopStats after straw purchase');
      w.App?.ui?.updateShopStats?.();
      console.log('🔧 Calling updateAllDisplays after straw purchase');
      w.App?.ui?.updateAllDisplays?.();
    } catch (error) {
      console.warn('Failed to update shop displays after straw purchase:', error);
    }
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'straw',
        cost: result.spent,
      });
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
      // Handle LargeNumber cups
      const cupsNum =
        result.cups instanceof LargeNumber ? result.cups.toNumber() : Number(result.cups);
      w.cups = new (w.Decimal || Number)(cupsNum);
    } catch (error) {
      console.warn('Failed to update cups after cup purchase:', error);
    }
    try {
      const actions = w.App?.state?.actions;
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
        cups: result.cups,
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
        (result.widerStraws as any).toNumber?.() ?? Number(result.widerStraws)
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
        (result.betterCups as any).toNumber?.() ?? Number(result.betterCups)
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
        (result.suctions as any).toNumber?.() ?? Number(result.suctions)
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
        (result.fasterDrinks as any).toNumber?.() ?? Number(result.fasterDrinks)
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
      // Subtract cost using LargeNumber-safe wallet subtraction
      subtractFromWallet(result.spent);
    } catch (error) {
      console.warn('Failed to update sips after critical click purchase:', error);
    }
    try {
      w.criticalClicks = new (w.Decimal || Number)(
        (result.criticalClicks as any).toNumber?.() ?? Number(result.criticalClicks)
      );
    } catch (error) {
      console.warn('Failed to update critical clicks after purchase:', error);
    }
    try {
      w.criticalClickChance = new (w.Decimal || Number)(
        (result.criticalClickChance as any).toNumber?.() ?? Number(result.criticalClickChance)
      );
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
      const spent = (result.spent as any).toNumber?.() ?? Number(result.spent);
      const gained = (result.sipsGained as any).toNumber?.() ?? Number(result.sipsGained);
      const curr = st.sips as any;
      const nextLarge =
        curr && curr.add && curr.subtract
          ? curr.add(result.sipsGained as any).subtract(result.spent as any)
          : (curr ?? 0) + gained - spent;
      w.sips = nextLarge;
      const actions = w.App?.state?.actions;
      actions?.setSips?.(nextLarge);
      actions?.setLevel?.(((result.level as any).toNumber?.() ?? Number(result.level)) as any);
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
