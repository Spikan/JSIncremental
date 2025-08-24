import { nextCupCost, nextStrawCost } from '../rules/purchases.ts';
import { recalcProduction } from './resources.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';

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
  sips: number;
  straws: number;
  cups: number;
  widerStraws: number;
  betterCups: number;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5;
  const scaling = upgrades?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08;
  const cost = nextStrawCost(straws, baseCost, scaling);
  if (sips < cost) return null;
  const newStraws = straws + 1;
  const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
    straws: newStraws,
    cups,
    widerStraws,
    betterCups,
  });
  return { spent: cost, straws: newStraws, strawSPD, cupSPD, sipsPerDrink };
}

export function purchaseCup({
  sips,
  straws,
  cups,
  widerStraws,
  betterCups,
}: {
  sips: number;
  straws: number;
  cups: number;
  widerStraws: number;
  betterCups: number;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15;
  const scaling = upgrades?.cups?.scaling ?? config.CUP_SCALING ?? 1.15;
  const cost = nextCupCost(cups, baseCost, scaling);
  if (sips < cost) return null;
  const newCups = cups + 1;
  const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
    straws,
    cups: newCups,
    widerStraws,
    betterCups,
  });
  return { spent: cost, cups: newCups, strawSPD, cupSPD, sipsPerDrink };
}

export function purchaseWiderStraws({
  sips,
  straws,
  cups,
  widerStraws,
  betterCups,
}: {
  sips: number;
  straws: number;
  cups: number;
  widerStraws: number;
  betterCups: number;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150;
  const cost = Math.floor(baseCost * (Number(widerStraws) + 1));
  if (sips < cost) return null;
  const newWiderStraws = Number(widerStraws) + 1;
  const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
    straws,
    cups,
    widerStraws: newWiderStraws,
    betterCups,
  });
  return { spent: cost, widerStraws: newWiderStraws, strawSPD, cupSPD, sipsPerDrink };
}

export function purchaseBetterCups({
  sips,
  straws,
  cups,
  widerStraws,
  betterCups,
}: {
  sips: number;
  straws: number;
  cups: number;
  widerStraws: number;
  betterCups: number;
}) {
  const { upgrades, config } = getTypedConfig();
  const baseCost = upgrades?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400;
  const cost = Math.floor(baseCost * (Number(betterCups) + 1));
  if (sips < cost) return null;
  const newBetterCups = Number(betterCups) + 1;
  const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
    straws,
    cups,
    widerStraws,
    betterCups: newBetterCups,
  });
  return { spent: cost, betterCups: newBetterCups, strawSPD, cupSPD, sipsPerDrink };
}

export function purchaseSuction({ sips, suctions }: { sips: number; suctions: number }) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.suction?.baseCost ?? config.SUCTION_BASE_COST;
  const scaling = up?.suction?.scaling ?? config.SUCTION_SCALING;
  const cost = Math.floor(baseCost * Math.pow(scaling, Number(suctions)));
  if (sips < cost) return null;
  const newSuctions = Number(suctions) + 1;
  const suctionClickBonus = (config.SUCTION_CLICK_BONUS ?? 0) * newSuctions;
  return { spent: cost, suctions: newSuctions, suctionClickBonus };
}

export function upgradeSuction({
  sips,
  suctionUpCounter,
}: {
  sips: number;
  suctionUpCounter: number;
}) {
  const { config } = getTypedConfig();
  const cost = (config.SUCTION_UPGRADE_BASE_COST ?? 0) * Number(suctionUpCounter);
  if (sips < cost) return null;
  const newCounter = Number(suctionUpCounter) + 1;
  const suctionClickBonus = (config.SUCTION_CLICK_BONUS ?? 0) * newCounter;
  return { spent: cost, suctionUpCounter: newCounter, suctionClickBonus };
}

export function purchaseFasterDrinks({
  sips,
  fasterDrinks,
}: {
  sips: number;
  fasterDrinks: number;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST;
  const scaling = up?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING;
  const cost = Math.floor(baseCost * Math.pow(scaling, Number(fasterDrinks)));
  if (sips < cost) return null;
  const newFasterDrinks = Number(fasterDrinks) + 1;
  return { spent: cost, fasterDrinks: newFasterDrinks };
}

export function upgradeFasterDrinks({
  sips,
  fasterDrinksUpCounter,
}: {
  sips: number;
  fasterDrinksUpCounter: number;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const base = up?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 0;
  const cost = base * Number(fasterDrinksUpCounter);
  if (sips < cost) return null;
  const newCounter = Number(fasterDrinksUpCounter) + 1;
  return { spent: cost, fasterDrinksUpCounter: newCounter };
}

export function purchaseCriticalClick({
  sips,
  criticalClicks,
  criticalClickChance,
}: {
  sips: number;
  criticalClicks: number;
  criticalClickChance: number;
}) {
  const { upgrades: up, config } = getTypedConfig();
  const baseCost = up?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST;
  const scaling = up?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING;
  const cost = Math.floor(baseCost * Math.pow(scaling, Number(criticalClicks)));
  if (sips < cost) return null;
  const newCriticalClicks = Number(criticalClicks) + 1;
  const newChance =
    Number(criticalClickChance ?? 0) + (config.CRITICAL_CLICK_CHANCE_INCREMENT ?? 0);
  return { spent: cost, criticalClicks: newCriticalClicks, criticalClickChance: newChance };
}

export function upgradeCriticalClick({
  sips,
  criticalClickUpCounter,
  criticalClickMultiplier,
}: {
  sips: number;
  criticalClickUpCounter: number;
  criticalClickMultiplier: number;
}) {
  const { config } = getTypedConfig();
  const cost = (config.CRITICAL_CLICK_UPGRADE_BASE_COST ?? 0) * Number(criticalClickUpCounter);
  if (sips < cost) return null;
  const newCounter = Number(criticalClickUpCounter) + 1;
  const newMultiplier =
    Number(criticalClickMultiplier ?? 0) + (config.CRITICAL_CLICK_MULTIPLIER_INCREMENT ?? 0);
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
  sips: number;
  level: number;
  sipsPerDrink: number;
}) {
  const { config } = getTypedConfig();
  const base = config.LEVEL_UP_BASE_COST ?? 0;
  const scaling = config.LEVEL_UP_SCALING ?? 1;
  const cost = base * Math.pow(scaling, Number(level));
  if (sips < cost) return null;
  const newLevel = Number(level) + 1;
  const sipsGained = (config.LEVEL_UP_SIPS_MULTIPLIER ?? 1) * Number(sipsPerDrink ?? 0);
  const sipsDelta = -cost + sipsGained;
  return { spent: cost, level: newLevel, sipsDelta, sipsGained };
}

// Convenience execute-style helpers that read/update App.state directly
function getAppState(): any {
  try {
    return (window as any).App?.state?.getState?.() || {};
  } catch {
    return {};
  }
}
function setAppState(patch: any): void {
  try {
    (window as any).App?.state?.setState?.(patch);
  } catch {}
}
function toNum(v: any): number {
  return v && typeof v.toNumber === 'function' ? v.toNumber() : Number(v || 0);
}

export const execute = {
  buyStraw(): boolean {
    const st = getAppState();
    const result = purchaseStraw({
      sips: Number(st.sips || 0),
      straws: Number(st.straws || 0),
      cups: Number(st.cups || 0),
      widerStraws: Number(st.widerStraws || 0),
      betterCups: Number(st.betterCups || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      w.sips = w.sips && w.sips.minus ? w.sips.minus(result.spent) : toNum(st.sips) - result.spent;
    } catch {}
    try {
      w.straws = new (w.Decimal || Number)(result.straws);
    } catch {}
    setAppState({
      sips: toNum(w.sips),
      straws: result.straws,
      strawSPD: result.strawSPD ?? 0,
      cupSPD: result.cupSPD ?? 0,
      sps: result.sipsPerDrink ?? 0,
    });
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'straw',
        cost: result.spent,
      });
    } catch {}
    return true;
  },
  buyCup(): boolean {
    const st = getAppState();
    const result = purchaseCup({
      sips: Number(st.sips || 0),
      straws: Number(st.straws || 0),
      cups: Number(st.cups || 0),
      widerStraws: Number(st.widerStraws || 0),
      betterCups: Number(st.betterCups || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      w.sips = w.sips && w.sips.minus ? w.sips.minus(result.spent) : toNum(st.sips) - result.spent;
    } catch {}
    try {
      w.cups = new (w.Decimal || Number)(result.cups);
    } catch {}
    setAppState({
      sips: toNum(w.sips),
      cups: result.cups,
      strawSPD: result.strawSPD ?? 0,
      cupSPD: result.cupSPD ?? 0,
      sps: result.sipsPerDrink ?? 0,
    });
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'cup',
        cost: result.spent,
      });
    } catch {}
    return true;
  },
  buyWiderStraws(): boolean {
    const st = getAppState();
    const result = purchaseWiderStraws({
      sips: Number(st.sips || 0),
      straws: Number(st.straws || 0),
      cups: Number(st.cups || 0),
      widerStraws: Number(st.widerStraws || 0),
      betterCups: Number(st.betterCups || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      w.sips = w.sips && w.sips.minus ? w.sips.minus(result.spent) : toNum(st.sips) - result.spent;
    } catch {}
    try {
      w.widerStraws = new (w.Decimal || Number)(result.widerStraws);
    } catch {}
    setAppState({
      sips: toNum(w.sips),
      widerStraws: result.widerStraws,
      strawSPD: result.strawSPD ?? 0,
      cupSPD: result.cupSPD ?? 0,
      sps: result.sipsPerDrink ?? 0,
    });
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'widerStraws',
        cost: result.spent,
      });
    } catch {}
    return true;
  },
  buyBetterCups(): boolean {
    const st = getAppState();
    const result = purchaseBetterCups({
      sips: Number(st.sips || 0),
      straws: Number(st.straws || 0),
      cups: Number(st.cups || 0),
      widerStraws: Number(st.widerStraws || 0),
      betterCups: Number(st.betterCups || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      w.sips = w.sips && w.sips.minus ? w.sips.minus(result.spent) : toNum(st.sips) - result.spent;
    } catch {}
    try {
      w.betterCups = new (w.Decimal || Number)(result.betterCups);
    } catch {}
    setAppState({
      sips: toNum(w.sips),
      betterCups: result.betterCups,
      strawSPD: result.strawSPD ?? 0,
      cupSPD: result.cupSPD ?? 0,
      sps: result.sipsPerDrink ?? 0,
    });
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'betterCups',
        cost: result.spent,
      });
    } catch {}
    return true;
  },
  buySuction(): boolean {
    const st = getAppState();
    const result = purchaseSuction({
      sips: Number(st.sips || 0),
      suctions: Number(st.suctions || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      w.sips = w.sips && w.sips.minus ? w.sips.minus(result.spent) : toNum(st.sips) - result.spent;
    } catch {}
    try {
      w.suctions = new (w.Decimal || Number)(result.suctions);
    } catch {}
    setAppState({
      sips: toNum(w.sips),
      suctions: result.suctions,
      suctionClickBonus: result.suctionClickBonus ?? 0,
    });
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'suction',
        cost: result.spent,
      });
    } catch {}
    return true;
  },
  buyFasterDrinks(): boolean {
    const st = getAppState();
    const result = purchaseFasterDrinks({
      sips: Number(st.sips || 0),
      fasterDrinks: Number(st.fasterDrinks || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      w.sips = w.sips && w.sips.minus ? w.sips.minus(result.spent) : toNum(st.sips) - result.spent;
    } catch {}
    try {
      w.fasterDrinks = new (w.Decimal || Number)(result.fasterDrinks);
    } catch {}
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
    setAppState({ sips: toNum(w.sips), fasterDrinks: result.fasterDrinks, drinkRate: nextRate });
    try {
      w.App?.stateBridge?.setDrinkRate?.(nextRate);
    } catch {}
    try {
      w.App?.ui?.updateCompactDrinkSpeedDisplays?.();
    } catch {}
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'fasterDrinks',
        cost: result.spent,
      });
    } catch {}
    return true;
  },
  buyCriticalClick(): boolean {
    const st = getAppState();
    const result = purchaseCriticalClick({
      sips: Number(st.sips || 0),
      criticalClicks: Number(st.criticalClicks || 0),
      criticalClickChance: Number(st.criticalClickChance || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      w.sips = w.sips && w.sips.minus ? w.sips.minus(result.spent) : toNum(st.sips) - result.spent;
    } catch {}
    try {
      w.criticalClicks = new (w.Decimal || Number)(result.criticalClicks);
    } catch {}
    try {
      w.criticalClickChance = new (w.Decimal || Number)(result.criticalClickChance);
    } catch {}
    setAppState({
      sips: toNum(w.sips),
      criticalClicks: result.criticalClicks,
      criticalClickChance: result.criticalClickChance,
    });
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'criticalClick',
        cost: result.spent,
      });
    } catch {}
    return true;
  },
  upgradeFasterDrinks(): boolean {
    const st = getAppState();
    const result = upgradeFasterDrinks({
      sips: Number(st.sips || 0),
      fasterDrinksUpCounter: Number(st.fasterDrinksUpCounter || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    try {
      w.sips = w.sips && w.sips.minus ? w.sips.minus(result.spent) : toNum(st.sips) - result.spent;
    } catch {}
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
    setAppState({
      sips: toNum(w.sips),
      fasterDrinksUpCounter: result.fasterDrinksUpCounter,
      drinkRate: nextRate,
    });
    try {
      w.App?.stateBridge?.setDrinkRate?.(nextRate);
    } catch {}
    try {
      w.App?.ui?.updateCompactDrinkSpeedDisplays?.();
    } catch {}
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.UPGRADE_PURCHASED, {
        item: 'fasterDrinksUp',
        cost: result.spent,
      });
    } catch {}
    return true;
  },
  levelUp(): boolean {
    const st = getAppState();
    const result = levelUp({
      sips: Number(st.sips || 0),
      level: Number(st.level || 0),
      sipsPerDrink: Number(st.sps || 0),
    });
    if (!result) return false;
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    const nextSips = toNum(st.sips) - result.spent + result.sipsGained;
    try {
      w.sips = w.Decimal ? new w.Decimal(nextSips) : nextSips;
    } catch {}
    setAppState({ sips: nextSips, level: result.level });
    try {
      w.App?.ui?.checkUpgradeAffordability?.();
    } catch {}
    try {
      w.App?.ui?.updateAllStats?.();
    } catch {}
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.ECONOMY?.PURCHASE, {
        item: 'levelUp',
        cost: result.spent,
        gained: result.sipsGained,
      });
    } catch {}
    return true;
  },
};
