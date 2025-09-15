// UI Display Updates (TypeScript)
import { formatNumber, updateButtonState, updateCostDisplay } from './utils';
import { getCostCalculationData, getDisplayData } from '../core/state/zustand-store';
import { safeToNumberOrDecimal, toDecimal } from '../core/numbers/simplified';
import subscriptionManager from './subscription-manager';
import debounceManager from './debounce-utils';
import { updateLastSaveTime, updatePurchasedCounts } from './stats';
import { checkUpgradeAffordability } from './affordability';
import { getUpgradesAndConfig } from '../core/systems/config-accessor';
import { domQuery } from '../services/dom-query';
import { uiBatcher } from '../services/ui-batcher';
// Logger import removed - not used in this file
import {
  nextStrawCost,
  nextCupCost,
  nextWiderStrawsCost,
  nextBetterCupsCost,
} from '../core/rules/purchases';

// Direct break_eternity.js Decimal access (consistent with core systems)
const Decimal = (globalThis as any).Decimal;

// Cost calculation function (copied from affordability.ts)
function calculateAllCosts(): any {
  const { upgrades: dataUp, config } = getUpgradesAndConfig();
  const costs = {} as any;

  // Get all resource counts in one optimized call
  const resourceData = getCostCalculationData();

  // Use the new improved cost calculation functions
  const strawBaseCost = toDecimal(dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5);
  const strawScaling = toDecimal(dataUp?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08);
  const strawCount = toDecimal(resourceData.straws || 0);
  costs.straw = nextStrawCost(strawCount, strawBaseCost, strawScaling);

  const cupBaseCost = toDecimal(dataUp?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15);
  const cupScaling = toDecimal(dataUp?.cups?.scaling ?? config.CUP_SCALING ?? 1.15);
  const cupCount = toDecimal(resourceData.cups || 0);
  costs.cup = nextCupCost(cupCount, cupBaseCost, cupScaling);

  const suctionBaseCost = toDecimal(dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST ?? 40);
  const suctionScaling = toDecimal(dataUp?.suction?.scaling ?? config.SUCTION_SCALING ?? 1.12);
  const suctionCount = toDecimal(resourceData.suctions || 0);
  costs.suction = suctionBaseCost.multiply(suctionScaling.pow(suctionCount));

  const fasterDrinksBaseCost = toDecimal(
    dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST ?? 80
  );
  const fasterDrinksScaling = toDecimal(
    dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING ?? 1.1
  );
  const fasterDrinksCount = toDecimal(resourceData.fasterDrinks || 0);
  costs.fasterDrinks = fasterDrinksBaseCost.multiply(fasterDrinksScaling.pow(fasterDrinksCount));

  const widerStrawsBaseCost = toDecimal(
    dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150
  );
  const widerStrawsScaling = toDecimal(
    dataUp?.widerStraws?.scaling ?? config.WIDER_STRAWS_SCALING ?? 1.2
  );
  const widerStrawsCount = toDecimal(resourceData.widerStraws || 0);
  costs.widerStraws = nextWiderStrawsCost(
    widerStrawsCount,
    widerStrawsBaseCost,
    widerStrawsScaling
  );

  const betterCupsBaseCost = toDecimal(
    dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400
  );
  const betterCupsScaling = toDecimal(
    dataUp?.betterCups?.scaling ?? config.BETTER_CUPS_SCALING ?? 1.25
  );
  const betterCupsCount = toDecimal(resourceData.betterCups || 0);
  costs.betterCups = nextBetterCupsCost(betterCupsCount, betterCupsBaseCost, betterCupsScaling);

  const levelUpBaseCost = toDecimal(config.LEVEL_UP_BASE_COST ?? 3000);
  const levelUpScaling = toDecimal(config.LEVEL_UP_SCALING ?? 1.15);
  const levelCount = toDecimal(resourceData.level || 1);
  costs.levelUp = levelUpBaseCost.multiply(levelUpScaling.pow(levelCount));

  return costs;
}

// Subscription keys for tracking
const SUBSCRIPTION_KEYS = {
  TOP_SIPS_PER_DRINK: 'topSipsPerDrink',
  TOP_SIPS_PER_SECOND: 'topSipsPerSecond',
  TOP_SIP_COUNTER: 'topSipCounter',
} as const;

// Debounce keys for performance optimization
const DEBOUNCE_KEYS = {
  UPDATE_ALL_DISPLAYS: 'updateAllDisplays',
  UPDATE_AFFORDABILITY: 'updateAffordability',
  UPDATE_PURCHASED_COUNTS: 'updatePurchasedCounts',
  UPDATE_STATS: 'updateStats',
  UPDATE_DRINK_SPEED: 'updateDrinkSpeedDisplay',
  UPDATE_AUTOSAVE_STATUS: 'updateAutosaveStatus',
  UPDATE_LAST_SAVE_TIME: 'updateLastSaveTime',
} as const;

// Performance-optimized update intervals (ms)
const UPDATE_INTERVALS = {
  FAST: 16, // ~60fps for critical updates
  NORMAL: 100, // 10fps for normal updates
  SLOW: 250, // 4fps for expensive operations
  VERY_SLOW: 500, // 2fps for very expensive operations
} as const;

// Optimized display update functions using subscribeWithSelector
export function updateTopSipsPerDrink(): void {
  if (typeof window === 'undefined') return;

  // Check if critical elements are ready
  if (
    !domQuery.exists('#sodaButton') ||
    !domQuery.exists('#shopTab') ||
    !domQuery.exists('#topSipValue')
  ) {
    return;
  }

  const topSipsPerDrinkElement: HTMLElement | null = domQuery.getById('topSipsPerDrink');

  if (!topSipsPerDrinkElement) {
    return;
  }

  // Clean up existing subscription if any
  if (subscriptionManager.has(SUBSCRIPTION_KEYS.TOP_SIPS_PER_DRINK)) {
    subscriptionManager.unregister(SUBSCRIPTION_KEYS.TOP_SIPS_PER_DRINK);
  }

  try {
    // Get current state and update immediately
    const displayData = getDisplayData();
    if (displayData && displayData.spd !== undefined) {
      const formatted = formatNumber(displayData.spd);
      topSipsPerDrinkElement.innerHTML = formatted;
    }
  } catch (error) {
    console.warn('Failed to update topSipsPerDrink:', error);
  }
}

export function updateTopSipsPerSecond(): void {
  if (typeof window === 'undefined') return;

  // Check if critical elements are ready
  if (
    !domQuery.exists('#sodaButton') ||
    !domQuery.exists('#shopTab') ||
    !domQuery.exists('#topSipValue')
  ) {
    return;
  }

  const topSipsPerSecondElement: HTMLElement | null = domQuery.getById('topSipsPerSecond');

  if (!topSipsPerSecondElement) {
    return;
  }

  // Clean up existing subscription if any
  if (subscriptionManager.has(SUBSCRIPTION_KEYS.TOP_SIPS_PER_SECOND)) {
    subscriptionManager.unregister(SUBSCRIPTION_KEYS.TOP_SIPS_PER_SECOND);
  }

  try {
    // Get current state and update immediately
    const displayData = getDisplayData();
    if (displayData && displayData.spd !== undefined && displayData.drinkRate !== undefined) {
      // Handle Decimal for spd and do division properly
      const sipsPerDrinkLarge =
        displayData.spd && typeof displayData.spd.toNumber === 'function' ? displayData.spd : null;
      const drinkRateMs = safeToNumberOrDecimal(displayData.drinkRate || 0);
      const drinkRateMsNum =
        typeof drinkRateMs === 'number'
          ? drinkRateMs
          : Math.abs(drinkRateMs.toNumber()) < 1e15
            ? drinkRateMs.toNumber()
            : 1000;
      const drinkRateSeconds = drinkRateMsNum / 1000;

      let sipsPerSecond;
      if (sipsPerDrinkLarge) {
        // Convert drinkRateSeconds to Decimal for proper division
        const drinkRateSecondsLarge = new Decimal(drinkRateSeconds);
        sipsPerSecond = sipsPerDrinkLarge.divide(drinkRateSecondsLarge);
      } else {
        // Fallback for non-Decimal values - use safe conversion
        const sipsPerDrink = safeToNumberOrDecimal(displayData.spd || 0);
        sipsPerSecond =
          (typeof sipsPerDrink === 'number'
            ? sipsPerDrink
            : Math.abs(sipsPerDrink.toNumber()) < 1e15
              ? sipsPerDrink.toNumber()
              : 0) / drinkRateSeconds;
      }

      const formatted = formatNumber(sipsPerSecond);
      topSipsPerSecondElement.innerHTML = formatted;
    }
  } catch (error) {
    console.warn('Failed to update top sips per second:', error);
  }
}

export function updateClickValueDisplay(): void {
  if (typeof window === 'undefined') return;
  const clickValueElement = document.getElementById('clickValue');

  if (!clickValueElement) return;

  try {
    // Get current click value from game state
    const displayData = getDisplayData();
    if (displayData) {
      // Calculate total click value (base + suction bonuses)
      let baseClickValue = 1;
      const suctionBonus = Number(displayData.suctionClickBonus || 0);
      const totalClickValue = baseClickValue + suctionBonus;

      clickValueElement.textContent = totalClickValue.toFixed(1);
    }
  } catch (error) {
    console.warn('Failed to update click value display:', error);
  }
}

export function updateProductionSummary(): void {
  if (typeof window === 'undefined') return;

  const totalStrawElement = document.getElementById('totalStrawProduction');
  const totalCupElement = document.getElementById('totalCupProduction');
  const totalPassiveElement = document.getElementById('totalPassiveProduction');

  try {
    const state = (window as any).App?.state?.getState?.();
    if (state) {
      // Calculate straw production
      const strawCount = Number(state.straws || 0);
      const strawSPD = Number(state.strawSPD || 0);
      const widerStrawsBonus = Number(state.widerStrawsSPD || 0);
      const totalStrawProduction = strawCount * strawSPD * (1 + widerStrawsBonus / 100);

      // Calculate cup production
      const cupCount = Number(state.cups || 0);
      const cupSPD = Number(state.cupSPD || 0);
      const betterCupsBonus = Number(state.betterCupsSPD || 0);
      const totalCupProduction = cupCount * cupSPD * (1 + betterCupsBonus / 100);

      // Total passive production
      const totalProduction = totalStrawProduction + totalCupProduction;

      // Update displays
      if (totalStrawElement) {
        totalStrawElement.textContent = totalStrawProduction.toFixed(1);
      }
      if (totalCupElement) {
        totalCupElement.textContent = totalCupProduction.toFixed(1);
      }
      if (totalPassiveElement) {
        totalPassiveElement.textContent = totalProduction.toFixed(1);
      }
    }
  } catch (error) {
    console.warn('Failed to update production summary:', error);
  }
}

export function updateDrinkSpeedDisplay(): void {
  if (typeof window === 'undefined') return;
  const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
  const currentDrinkSpeed = document.getElementById('currentDrinkSpeed');
  const drinkSpeedBonusCompact = document.getElementById('drinkSpeedBonusCompact');
  try {
    const displayData = getDisplayData();
    if ((currentDrinkSpeedCompact || currentDrinkSpeed) && displayData) {
      const drinkRateMs = safeToNumberOrDecimal(displayData.drinkRate || 0);
      const drinkRateMsNum =
        typeof drinkRateMs === 'number'
          ? drinkRateMs
          : Math.abs(drinkRateMs.toNumber()) < 1e15
            ? drinkRateMs.toNumber()
            : 1000;
      const drinkRateSeconds = drinkRateMsNum / 1000;
      const formattedTime = `${formatNumber(drinkRateSeconds)}s`;

      if (currentDrinkSpeedCompact) {
        currentDrinkSpeedCompact.textContent = formattedTime;
      }
      if (currentDrinkSpeed) {
        currentDrinkSpeed.textContent = formattedTime;
      }
    }
    if (drinkSpeedBonusCompact && displayData) {
      const baseMs = Number((window as any).GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE || 5000);
      const drinkRateMs = safeToNumberOrDecimal(displayData.drinkRate || baseMs);
      const currMs =
        typeof drinkRateMs === 'number'
          ? drinkRateMs
          : Math.abs(drinkRateMs.toNumber()) < 1e15
            ? drinkRateMs.toNumber()
            : baseMs;
      const bonusPct = Math.max(0, (1 - currMs / baseMs) * 100);
      drinkSpeedBonusCompact.textContent = `${Math.round(bonusPct)}%`;
    }
  } catch (error) {
    console.warn('Failed to update display:', error);
  }
}

export function updateAutosaveStatus(): void {
  if (typeof window === 'undefined') return;
  const status = document.getElementById('autosaveStatus');
  const checkbox = document.getElementById('autosaveToggle') as HTMLInputElement | null;
  const select = document.getElementById('autosaveInterval') as HTMLSelectElement | null;
  try {
    const displayData = getDisplayData();
    const opts = displayData.options;
    if (status && opts) {
      if (opts.autosaveEnabled) {
        status.textContent = `Autosave: ON (${opts.autosaveInterval}s)`;
        (status as any).className = 'autosave-on';
      } else {
        status.textContent = 'Autosave: OFF';
        (status as any).className = 'autosave-off';
      }
      if (checkbox) {
        try {
          checkbox.checked = !!opts.autosaveEnabled;
        } catch (error) {
          console.warn('Failed to update display:', error);
        }
      }
      if (select) {
        try {
          const val = String(opts.autosaveInterval ?? '10');
          if (select.value !== val) select.value = val;
        } catch (error) {
          console.warn('Failed to update display:', error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to update display:', error);
  }
}

export function updateDrinkProgress(progress?: number, drinkRate?: number): void {
  if (typeof window === 'undefined') return;
  let currentProgress = typeof progress === 'number' ? progress : undefined;
  let currentDrinkRate = typeof drinkRate === 'number' ? drinkRate : undefined;
  try {
    const displayData = getDisplayData();
    if (displayData) {
      if (currentProgress == null) {
        const progress = safeToNumberOrDecimal(displayData.drinkProgress || 0);
        currentProgress =
          typeof progress === 'number'
            ? progress
            : Math.abs(progress.toNumber()) < 1e15
              ? progress.toNumber()
              : 0;
      }
      if (currentDrinkRate == null)
        currentDrinkRate = safeToNumberOrDecimal(displayData.drinkRate || 0);
    }
  } catch (error) {
    console.warn('Failed to update display:', error);
  }
  const progressFill = domQuery.getById('drinkProgressFill');
  const countdown = domQuery.getById('drinkCountdown');
  if (progressFill && typeof currentProgress === 'number') {
    const clampedProgress = Math.min(Math.max(currentProgress, 0), 100);
    (progressFill as HTMLElement).style.width = `${clampedProgress}%`;
    if (clampedProgress >= 100) {
      (progressFill as HTMLElement).classList?.add?.('progress-complete');
    } else {
      (progressFill as HTMLElement).classList?.remove?.('progress-complete');
    }
  }
  if (countdown && currentDrinkRate && typeof currentProgress === 'number') {
    const clampedProgress = Math.min(Math.max(currentProgress, 0), 100);
    const remainingTime = Math.max(
      0,
      currentDrinkRate - (clampedProgress / 100) * currentDrinkRate
    );
    const remainingSeconds = (remainingTime / 1000).toFixed(2);
    (countdown as HTMLElement).textContent = `${remainingSeconds}s`;
    if (remainingTime <= 1000) {
      (countdown as HTMLElement).classList.add('countdown-warning');
    } else {
      (countdown as HTMLElement).classList.remove('countdown-warning');
    }
  }
}

export function updateTopSipCounter(): void {
  if (typeof window === 'undefined') return;

  // Check if critical elements are ready
  if (
    !domQuery.exists('#sodaButton') ||
    !domQuery.exists('#shopTab') ||
    !domQuery.exists('#topSipValue')
  ) {
    return;
  }

  const topSipElement = domQuery.getById('topSipValue');

  if (topSipElement) {
    try {
      const displayData = getDisplayData();
      // Use displayData.sips directly - formatNumber will handle Decimal properly
      const formatted = formatNumber(displayData.sips);
      // Silent update - no visual feedback needed
      (topSipElement as HTMLElement).textContent = formatted;
    } catch (error) {
      console.warn('Failed to update display:', error);
    }
  }
}

export function updateLevelNumber(): void {
  if (typeof window === 'undefined') return;
  const levelEl: any = domQuery.getById('levelNumber');
  if (levelEl) {
    try {
      // Use hybrid level system as single source of truth
      const hybridSystem = (window as any).App?.systems?.hybridLevel;
      if (hybridSystem && typeof hybridSystem.getCurrentLevelId === 'function') {
        const levelId = hybridSystem.getCurrentLevelId();
        console.log('🔍 updateLevelNumber: Setting level number to:', levelId);
        levelEl.innerHTML = String(levelId);
        console.log('🔍 updateLevelNumber: DOM element now shows:', levelEl.innerHTML);
      } else {
        console.log('⚠️ updateLevelNumber: Hybrid system not available, using fallback');
        // Fallback to old system if hybrid system not available
        const displayData = getDisplayData();
        const level = safeToNumberOrDecimal(displayData.level || 1);
        const levelNum =
          typeof level === 'number'
            ? level
            : Math.abs(level.toNumber()) < 1e15
              ? level.toNumber()
              : 1;
        levelEl.innerHTML = String(levelNum);
      }
    } catch (error) {
      console.warn('Failed to update display:', error);
    }
  }
}

export function updateLevelText(): void {
  if (typeof window === 'undefined') return;

  try {
    // Use hybrid level system as single source of truth
    const hybridSystem = (window as any).App?.systems?.hybridLevel;
    let levelText = 'The Beach (Level 1)';

    if (hybridSystem && typeof hybridSystem.getCurrentLevel === 'function') {
      const currentLevel = hybridSystem.getCurrentLevel();

      if (currentLevel) {
        levelText = `${currentLevel.name} (Level ${currentLevel.id})`;
      }
    }

    // Update the current level name display
    const currentLevelNameEl = document.getElementById('currentLevelName');
    if (currentLevelNameEl) {
      currentLevelNameEl.textContent = levelText;
    }
  } catch (error) {
    console.warn('Failed to update level text:', error);
  }
}

export function updateDrinkRate(): void {
  if (typeof window === 'undefined') return;
  const drinkRateElement = document.getElementById('drinkRate');
  try {
    const displayData = getDisplayData();
    if (drinkRateElement && displayData) {
      const drinkRateMs = safeToNumberOrDecimal(displayData.drinkRate || 0);
      const drinkRateMsNum =
        typeof drinkRateMs === 'number'
          ? drinkRateMs
          : Math.abs(drinkRateMs.toNumber()) < 1e15
            ? drinkRateMs.toNumber()
            : 1000;
      const drinkRateSeconds = drinkRateMsNum / 1000;
      drinkRateElement.textContent = `${formatNumber(drinkRateSeconds)}s`;
    }
  } catch (error) {
    console.warn('Failed to update display:', error);
  }
}

export function updateCompactDrinkSpeedDisplays(): void {
  if (typeof window === 'undefined') return;
  const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
  const currentDrinkSpeed = document.getElementById('currentDrinkSpeed');
  const drinkSpeedBonusCompact = document.getElementById('drinkSpeedBonusCompact');
  try {
    const displayData = getDisplayData();
    if ((currentDrinkSpeedCompact || currentDrinkSpeed) && displayData) {
      const drinkRateMs = safeToNumberOrDecimal(displayData.drinkRate || 0);
      const drinkRateMsNum =
        typeof drinkRateMs === 'number'
          ? drinkRateMs
          : Math.abs(drinkRateMs.toNumber()) < 1e15
            ? drinkRateMs.toNumber()
            : 1000;
      const drinkRateSeconds = drinkRateMsNum / 1000;
      const formattedTime = `${formatNumber(drinkRateSeconds)}s`;

      if (currentDrinkSpeedCompact) {
        currentDrinkSpeedCompact.textContent = formattedTime;
      }
      if (currentDrinkSpeed) {
        currentDrinkSpeed.textContent = formattedTime;
      }
    }
    if (drinkSpeedBonusCompact && displayData) {
      const baseMs = Number((window as any).GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE || 5000);
      const drinkRateMs = safeToNumberOrDecimal(displayData.drinkRate || baseMs);
      const currMs =
        typeof drinkRateMs === 'number'
          ? drinkRateMs
          : Math.abs(drinkRateMs.toNumber()) < 1e15
            ? drinkRateMs.toNumber()
            : baseMs;
      const bonusPct = Math.max(0, (1 - currMs / baseMs) * 100);
      drinkSpeedBonusCompact.textContent = `${Math.round(bonusPct)}%`;
    }
  } catch (error) {
    console.warn('Failed to update display:', error);
  }
  const compactDisplays = document.querySelectorAll('[id*="Compact"]');
  compactDisplays.forEach(display => {
    try {
      const displayData = getDisplayData();
      if ((display as HTMLElement).id.includes('DrinkSpeed') && displayData) {
        const drinkRateMs = safeToNumberOrDecimal(displayData.drinkRate || 0);
        const drinkRateMsNum =
          typeof drinkRateMs === 'number'
            ? drinkRateMs
            : Math.abs(drinkRateMs.toNumber()) < 1e15
              ? drinkRateMs.toNumber()
              : 1000;
        const drinkRateSeconds = drinkRateMsNum / 1000;
        (display as HTMLElement).textContent = `${formatNumber(drinkRateSeconds)}s`;
      }
    } catch (error) {
      console.warn('Failed to update display:', error);
    }
  });
}

// getLevelText function removed - using hybrid level system directly

// Debug and test functions removed for production

// Performance-optimized batch update functions
/**
 * Debounced version of updateAllDisplays for better performance
 */
export const updateAllDisplaysOptimized = () => {
  uiBatcher.schedule(
    'updateAllDisplays',
    () => {
      try {
        updateTopSipCounter();
        updateTopSipsPerDrink();
        updateTopSipsPerSecond();
        updateLevelNumber();
        updateLevelText();

        // Update upgrade prices and affordability
        updateUpgradeDisplays();

        // Update cost displays and button states
        checkUpgradeAffordability();
      } catch (error) {
        console.warn('Error in optimized display update:', error);
      }
    },
    'high'
  );
};

/**
 * Update all upgrade displays including prices and stats
 */
function updateUpgradeDisplays(): void {
  try {
    const displayData = getDisplayData();
    if (!displayData) {
      console.warn('No state available for upgrade displays update');
      return;
    }

    // Update click upgrades
    updateClickUpgradeDisplays(displayData);

    // Update drink speed upgrades
    updateDrinkSpeedUpgradeDisplays(displayData);

    // Update production buildings
    updateProductionBuildingDisplays(displayData);

    // Update level up display
    updateLevelUpDisplay(displayData);

    // Update production summary
    updateProductionSummaryDisplay(displayData);

    // Update soda stats
    updateSodaStats(displayData);
  } catch (error) {
    console.warn('Error updating upgrade displays:', error);
  }
}

/**
 * Update click upgrade displays
 */
function updateClickUpgradeDisplays(state: any): void {
  // Suction upgrade
  const suctionBonus = state.suctionClickBonus || 0;

  // Handle both Decimal objects and regular numbers
  const bonusValue =
    typeof suctionBonus.toFixed === 'function'
      ? suctionBonus.toFixed(1)
      : parseFloat(suctionBonus.toString()).toFixed(1);

  updateStatDisplay('suctionClickBonusCompact', bonusValue);
}

/**
 * Update drink speed upgrade displays
 */
function updateDrinkSpeedUpgradeDisplays(state: any): void {
  const costs = calculateAllCosts();

  // Faster Drinks upgrade
  const currentDrinkSpeed = state.drinkRate || 5000;
  const canAffordFasterDrinks = state.sips >= costs.fasterDrinks;

  updateCostDisplay('fasterDrinksCostCompact', costs.fasterDrinks, canAffordFasterDrinks);
  updateCostDisplay('fasterDrinksCost', costs.fasterDrinks, canAffordFasterDrinks);
  updateStatDisplay('currentDrinkSpeedCompact', (currentDrinkSpeed / 1000).toFixed(2) + 's');

  // Update the new faster drinks button display
  updateStatDisplay('currentDrinkSpeed', (currentDrinkSpeed / 1000).toFixed(2) + 's');
}

/**
 * Update production building displays
 */
function updateProductionBuildingDisplays(state: any): void {
  // Straw production
  const strawsOwned = state.straws || 0;
  const strawSPD = state.strawSPD || 0;

  updateStatDisplay('straws', strawsOwned);
  updateStatDisplay('strawSPD', strawSPD);

  // Cup production
  const cupsOwned = state.cups || 0;
  const cupSPD = state.cupSPD || 0;

  updateStatDisplay('cups', cupsOwned);
  updateStatDisplay('cupSPD', cupSPD);

  // Wider Straws enhancement
  const widerStrawsOwned = state.widerStraws || 0;
  const widerStrawsSPD = state.widerStrawsSPD || 0;

  updateStatDisplay('widerStraws', widerStrawsOwned);
  updateStatDisplay('widerStrawsSPD', widerStrawsSPD);

  // Better Cups enhancement
  const betterCupsOwned = state.betterCups || 0;
  const betterCupsSPD = state.betterCupsSPD || 0;

  updateStatDisplay('betterCups', betterCupsOwned);
  updateStatDisplay('betterCupsSPD', betterCupsSPD);
}

/**
 * Update level up display
 */
function updateLevelUpDisplay(state: any): void {
  // Use hybrid level system as primary
  const hybridSystem = (window as any).App?.systems?.hybridLevel;

  if (hybridSystem && typeof hybridSystem.getCurrentLevel === 'function') {
    // Get the next unlockable level (not just next sequential)
    const nextLevel = hybridSystem.getNextUnlockableLevel();

    if (nextLevel) {
      const sips = state.sips || new Decimal(0);
      const clicks = state.totalClicks || 0;
      const currentLevel = hybridSystem.getCurrentLevel();
      const currentLevelNum = currentLevel?.id || 1;

      const canUnlock =
        sips.gte(nextLevel.unlockRequirement.sips) &&
        clicks >= nextLevel.unlockRequirement.clicks &&
        currentLevelNum >= (nextLevel.unlockRequirement.level || 1);

      // Update the next level name
      const nextLevelNameEl = document.getElementById('nextLevelName');
      if (nextLevelNameEl) {
        nextLevelNameEl.textContent = `Next: ${nextLevel.name} (Level ${nextLevel.id})`;
      }

      // Update the requirements
      const requirementsEl = document.getElementById('levelRequirements');
      if (requirementsEl) {
        const sipsText = formatNumber(nextLevel.unlockRequirement.sips);

        let requirementsText = `${sipsText} sips, ${nextLevel.unlockRequirement.clicks.toLocaleString()} clicks`;
        if (nextLevel.unlockRequirement.level) {
          requirementsText += `, level ${nextLevel.unlockRequirement.level}`;
        }

        requirementsEl.textContent = requirementsText;
        requirementsEl.style.color = canUnlock ? '#2ecc71' : '#ffffff';
      }

      // Update unlock button state
      const unlockBtn = document.querySelector('[data-action="unlockLevel"]');
      if (unlockBtn) {
        if (canUnlock) {
          unlockBtn.classList.remove('disabled');
          unlockBtn.removeAttribute('disabled');
        } else {
          unlockBtn.classList.add('disabled');
          unlockBtn.setAttribute('disabled', 'true');
        }
      }
      return;
    }
  }

  // If no hybrid system or no next level, show default
  const nextLevelNameEl = document.getElementById('nextLevelName');
  const requirementsEl = document.getElementById('levelRequirements');
  const unlockBtn = document.querySelector('[data-action="unlockLevel"]');

  if (nextLevelNameEl) {
    nextLevelNameEl.textContent = 'All Levels Unlocked!';
  }

  if (requirementsEl) {
    requirementsEl.textContent = 'No more levels to unlock';
    requirementsEl.style.color = '#ffffff';
  }

  if (unlockBtn) {
    unlockBtn.classList.add('disabled');
    unlockBtn.setAttribute('disabled', 'true');
  }
}

/**
 * Update production summary display
 */
function updateProductionSummaryDisplay(state: any): void {
  // Update total straw production
  const totalStrawProduction = state.strawSPD || 0;
  updateStatDisplay('totalStrawProduction', totalStrawProduction);

  // Update total cup production
  const totalCupProduction = state.cupSPD || 0;
  updateStatDisplay('totalCupProduction', totalCupProduction);

  // Update total passive production
  const totalPassiveProduction = totalStrawProduction + totalCupProduction;
  updateStatDisplay('totalPassiveProduction', totalPassiveProduction);
}

/**
 * Update soda stats display
 */
function updateSodaStats(state: any): void {
  // Update click value - calculate total click value (base + suction bonuses)
  let baseClickValue = 1;
  const suctionBonus = Number(state.suctionClickBonus || 0);
  const totalClickValue = baseClickValue + suctionBonus;
  updateStatDisplay('clickValue', totalClickValue.toFixed(1));
}

/**
 * Update a stat display element
 */
function updateStatDisplay(elementId: string, value: string | number): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = String(value);
  }
}

/**
 * Throttled version of affordability checking for better performance
 */
export const checkUpgradeAffordabilityOptimized = debounceManager.throttle(
  DEBOUNCE_KEYS.UPDATE_AFFORDABILITY,
  () => {
    try {
      // Call the actual affordability check directly
      checkUpgradeAffordability();
    } catch (error) {
      console.warn('Error in optimized affordability check:', error);
    }
  },
  UPDATE_INTERVALS.NORMAL,
  { leading: true, trailing: true }
);

/**
 * Debounced version of updatePurchasedCounts for better performance
 */
export const updatePurchasedCountsOptimized = debounceManager.debounce(
  DEBOUNCE_KEYS.UPDATE_PURCHASED_COUNTS,
  () => {
    try {
      // Call the actual stats update directly
      updatePurchasedCounts();
    } catch (error) {
      console.warn('Error in optimized purchased counts update:', error);
    }
  },
  UPDATE_INTERVALS.SLOW,
  { trailing: true, maxWait: UPDATE_INTERVALS.VERY_SLOW }
);

/**
 * Throttled version of updateDrinkSpeedDisplay for better performance
 */
export const updateDrinkSpeedDisplayOptimized = debounceManager.throttle(
  DEBOUNCE_KEYS.UPDATE_DRINK_SPEED,
  () => {
    try {
      updateDrinkSpeedDisplay();
    } catch (error) {
      console.warn('Error in optimized drink speed display update:', error);
    }
  },
  UPDATE_INTERVALS.NORMAL,
  { leading: false, trailing: true }
);

/**
 * Throttled version of updateAutosaveStatus for better performance
 */
export const updateAutosaveStatusOptimized = debounceManager.throttle(
  DEBOUNCE_KEYS.UPDATE_AUTOSAVE_STATUS,
  () => {
    try {
      updateAutosaveStatus();
    } catch (error) {
      console.warn('Error in optimized autosave status update:', error);
    }
  },
  UPDATE_INTERVALS.SLOW,
  { leading: false, trailing: true }
);

/**
 * Throttled version of updateLastSaveTime for better performance
 */
export const updateLastSaveTimeOptimized = debounceManager.throttle(
  DEBOUNCE_KEYS.UPDATE_LAST_SAVE_TIME,
  () => {
    try {
      // Call the actual stats update directly
      updateLastSaveTime();
    } catch (error) {
      console.warn('Error in optimized last save time update:', error);
    }
  },
  UPDATE_INTERVALS.SLOW,
  { leading: false, trailing: true }
);

/**
 * Clean up all display subscriptions and debounced functions
 * Call this when the UI is being destroyed or reset
 */
export function cleanupDisplaySubscriptions(): void {
  console.log('🧹 Cleaning up all display subscriptions and debounced functions');

  // Clean up all display-related subscriptions
  Object.values(SUBSCRIPTION_KEYS).forEach(key => {
    if (subscriptionManager.has(key)) {
      subscriptionManager.unregister(key);
    }
  });

  // Clean up all debounced functions
  Object.values(DEBOUNCE_KEYS).forEach(key => {
    if (debounceManager.has(key)) {
      debounceManager.cancel(key);
    }
  });

  // Log cleanup stats
  const subscriptionStats = subscriptionManager.getStats();
  const debounceKeys = debounceManager.getKeys();
  console.log(
    `🧹 Display cleanup complete. Remaining subscriptions: ${subscriptionStats.count}, debounced functions: ${debounceKeys.length}`
  );
}

export { updateCostDisplay, updateButtonState, updateLevelUpDisplay };
