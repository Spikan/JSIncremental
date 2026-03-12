// UI Display Updates (TypeScript)
import { formatNumber, updateButtonState, updateCostDisplay } from './utils';
import { getCostCalculationData, getDisplayData, useGameStore } from '../core/state/zustand-store';
import { safeToNumberOrDecimal, toDecimal } from '../core/numbers/simplified';
import { hybridLevelSystem } from '../core/systems/hybrid-level-system';
import subscriptionManager from './subscription-manager';
import debounceManager from './debounce-utils';
import { updateLastSaveTime, updatePurchasedCounts } from './stats';
import { checkUpgradeAffordability } from './affordability';
import { getUpgradesAndConfig } from '../core/systems/config-accessor';
import { domQuery } from '../services/dom-query';
import { isFountainEnabled, createFountainProgress } from './fountain-progress';
import { isSodaButtonProgressEnabled, createSodaButtonProgress } from './soda-button-progress';
import { createSodaButtonIndicator } from './soda-button-indicator';
import { uiBatcher } from '../services/ui-batcher';
import { errorHandler } from '../core/error-handling/error-handler';
import { config } from '../config';
import { FEATURE_UNLOCKS } from '../feature-unlocks';
// Logger import removed - not used in this file
import {
  nextStrawCost,
  nextCupCost,
  nextWiderStrawsCost,
  nextBetterCupsCost,
} from '../core/rules/purchases';

// Direct break_eternity.js Decimal access (consistent with core systems)
import Decimal from 'break_eternity.js';

// Cost calculation function (copied from affordability.ts)
function calculateAllCosts(): Record<string, Decimal> {
  const { upgrades: dataUp, config } = getUpgradesAndConfig();
  const costs: Record<string, Decimal> = {} as Record<string, Decimal>;

  // Get all resource counts in one optimized call
  const resourceData = getCostCalculationData();

  // Use the new improved cost calculation functions
  const strawBaseCost = toDecimal(dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5);
  const strawScaling = toDecimal(dataUp?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08);
  const strawCount = toDecimal(resourceData.straws || 0);
  costs['straw'] = nextStrawCost(strawCount, strawBaseCost, strawScaling);

  const cupBaseCost = toDecimal(dataUp?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15);
  const cupScaling = toDecimal(dataUp?.cups?.scaling ?? config.CUP_SCALING ?? 1.15);
  const cupCount = toDecimal(resourceData.cups || 0);
  costs['cup'] = nextCupCost(cupCount, cupBaseCost, cupScaling);

  const suctionBaseCost = toDecimal(dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST ?? 40);
  const suctionScaling = toDecimal(dataUp?.suction?.scaling ?? config.SUCTION_SCALING ?? 1.12);
  const suctionCount = toDecimal(resourceData.suctions || 0);
  costs['suction'] = suctionBaseCost.multiply(suctionScaling.pow(suctionCount));

  const fasterDrinksBaseCost = toDecimal(
    dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST ?? 80
  );
  const fasterDrinksScaling = toDecimal(
    dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING ?? 1.1
  );
  const fasterDrinksCount = toDecimal(resourceData.fasterDrinks || 0);
  costs['fasterDrinks'] = fasterDrinksBaseCost.multiply(fasterDrinksScaling.pow(fasterDrinksCount));

  const widerStrawsBaseCost = toDecimal(
    dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150
  );
  const widerStrawsScaling = toDecimal(
    dataUp?.widerStraws?.scaling ?? config.WIDER_STRAWS_SCALING ?? 1.2
  );
  const widerStrawsCount = toDecimal(resourceData.widerStraws || 0);
  costs['widerStraws'] = nextWiderStrawsCost(
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
  costs['betterCups'] = nextBetterCupsCost(betterCupsCount, betterCupsBaseCost, betterCupsScaling);

  const levelUpBaseCost = toDecimal(config.LEVEL_UP_BASE_COST ?? 3000);
  const levelUpScaling = toDecimal(config.LEVEL_UP_SCALING ?? 1.15);
  const levelCount = toDecimal(resourceData.level || 1);
  costs['levelUp'] = levelUpBaseCost.multiply(levelUpScaling.pow(levelCount));

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
  // If enhanced TopInfoBar is present, avoid duplicate writes
  try {
    if (document.querySelector('.currency-display-section')) return;
  } catch {
    // Ignore DOM lookup failures in partial render environments.
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
    errorHandler.handleError(error, 'updateTopSipsPerDrink');
  }
}

export function updateTopSipsPerSecond(): void {
  if (typeof window === 'undefined') return;
  // If enhanced TopInfoBar is present, avoid duplicate writes
  try {
    if (document.querySelector('.currency-display-section')) return;
  } catch {
    // Ignore DOM lookup failures in partial render environments.
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
    errorHandler.handleError(error, 'updateTopSipsPerSecond');
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
      // Calculate total click value (base + suction bonuses) using Decimal-safe math
      const DecimalCtor = (window as any).Decimal;
      if (DecimalCtor) {
        const base = new DecimalCtor(1);
        const bonus =
          displayData.suctionClickBonus &&
          typeof (displayData.suctionClickBonus as any).toString === 'function'
            ? new DecimalCtor((displayData.suctionClickBonus as any).toString())
            : new DecimalCtor(Number(displayData.suctionClickBonus || 0));
        const total = base.add(bonus);
        clickValueElement.textContent = total.toFixed(1);
      } else {
        const baseClickValue = 1;
        const suctionBonus = Number(displayData.suctionClickBonus || 0);
        const totalClickValue = baseClickValue + suctionBonus;
        clickValueElement.textContent = totalClickValue.toFixed(1);
      }
    }
  } catch (error) {
    errorHandler.handleError(error, 'updateClickValueDisplay');
  }
}

export function updateProductionSummary(): void {
  if (typeof window === 'undefined') return;

  const totalStrawElement = document.getElementById('totalStrawProduction');
  const totalCupElement = document.getElementById('totalCupProduction');
  const totalPassiveElement = document.getElementById('totalPassiveProduction');

  try {
    const state = useGameStore.getState();
    if (state) {
      // Calculate straw production
      const strawCount = Number(state.straws || 0);
      const strawSPD = Number(state.strawSPD || 0);
      const widerStrawsBonus = Number(state.widerStraws || 0);
      const totalStrawProduction = strawCount * strawSPD * (1 + widerStrawsBonus / 100);

      // Calculate cup production
      const cupCount = Number(state.cups || 0);
      const cupSPD = Number(state.cupSPD || 0);
      const betterCupsBonus = Number(state.betterCups || 0);
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
    errorHandler.handleError(error, 'updateProductionSummary');
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
      const baseMs = Number(
        (window as unknown as { GAME_CONFIG?: { TIMING?: Record<string, number> } }).GAME_CONFIG
          ?.TIMING?.['DEFAULT_DRINK_RATE'] || 5000
      );
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
    errorHandler.handleError(error, 'updateDrinkSpeedDisplay');
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
        (status as HTMLElement).className = 'autosave-on';
      } else {
        status.textContent = 'Autosave: OFF';
        (status as HTMLElement).className = 'autosave-off';
      }
      if (checkbox) {
        try {
          checkbox.checked = !!opts.autosaveEnabled;
        } catch (error) {
          errorHandler.handleError(error, 'updateAutosaveCheckbox');
        }
      }
      if (select) {
        try {
          const val = String(opts.autosaveInterval ?? '10');
          if (select.value !== val) select.value = val;
        } catch (error) {
          errorHandler.handleError(error, 'updateAutosaveSelect');
        }
      }
    }
  } catch (error) {
    errorHandler.handleError(error, 'updateAutosaveStatus');
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
    errorHandler.handleError(error, 'updateDrinkProgress');
  }
  const progressFill = domQuery.getById('drinkProgressFill');
  const countdown = domQuery.getById('drinkCountdown');

  // Soda button progress overlay (highest priority)
  try {
    if (config.UI?.ENABLE_3D_SODA_BUTTON && config.UI?.USE_THREE_SODA_BUTTON) {
      // Feed Three.js button if present
      const api = (window as any).sodaThree;
      if (api && typeof currentProgress === 'number') {
        try {
          api.updateProgress(currentProgress);
        } catch {
          // Ignore optional renderer updates and keep the rest of the UI responsive.
        }
      }
      // Ring indicator overlay
      const sodaBtnA = document.getElementById('sodaButton') as HTMLElement | null;
      if (sodaBtnA) {
        let indicatorA: any = (sodaBtnA as any).__sodaIndicator;
        if (!indicatorA) {
          indicatorA = createSodaButtonIndicator(sodaBtnA);
          indicatorA.mount();
          (sodaBtnA as any).__sodaIndicator = indicatorA;
        }
        if (typeof currentProgress === 'number') indicatorA.update(currentProgress);
      }
    } else if (isSodaButtonProgressEnabled()) {
      const sodaBtn = document.getElementById('sodaButton') as HTMLElement | null;
      if (sodaBtn) {
        let overlay: any = (sodaBtn as any).__sodaProgress;
        if (!overlay) {
          overlay = createSodaButtonProgress(sodaBtn);
          overlay.mount();
          (sodaBtn as any).__sodaProgress = overlay;
        }
        if (typeof currentProgress === 'number') overlay.update(currentProgress);
      }
    } else if (isFountainEnabled()) {
      const panel = document.getElementById('fountainPanel') as HTMLElement | null;
      const host = (panel || document.getElementById('drinkProgressBar')) as HTMLElement | null;
      if (host) {
        // Ensure singleton instance per container
        let instance: any = (host as any).__fountain;
        if (!instance) {
          instance = createFountainProgress(host, {
            reducedMotion:
              window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            ariaLabel: 'Drink progress',
          });
          instance.mount();
          (host as any).__fountain = instance;
          try {
            if (host.id === 'drinkProgressBar') host.classList.add('fountain-host');
          } catch {
            // Ignore host decoration failures in constrained DOM environments.
          }
        }
        if (typeof currentProgress === 'number') {
          instance.update(
            currentProgress,
            typeof currentDrinkRate === 'number' ? currentDrinkRate : undefined
          );
        }
        // Hide legacy fill to avoid visual overlap
        if (host.id === 'drinkProgressBar') {
          const legacyFill = progressFill as HTMLElement | null;
          if (legacyFill) legacyFill.style.visibility = 'hidden';
        }
      }
    }
  } catch (e) {
    // Fail safely to legacy bar if anything goes wrong
  }
  if (progressFill && typeof currentProgress === 'number') {
    const clampedProgress = Math.min(Math.max(currentProgress, 0), 100);
    // If modern UIs are enabled, hide legacy width update; else update it
    if (!isFountainEnabled() && !isSodaButtonProgressEnabled()) {
      (progressFill as HTMLElement).style.width = `${clampedProgress}%`;
    }
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
  // If enhanced TopInfoBar is present, avoid duplicate writes
  try {
    if (document.querySelector('.currency-display-section')) return;
  } catch {
    // Ignore DOM lookup failures in partial render environments.
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
      errorHandler.handleError(error, 'updateDisplay');
    }
  }
}

export function updateLevelNumber(): void {
  if (typeof window === 'undefined') return;
  const levelEl: any = domQuery.getById('levelNumber');
  if (levelEl) {
    try {
      // Use hybrid level system as single source of truth
      const hybridSystem = hybridLevelSystem;
      if (hybridSystem && typeof hybridSystem.getCurrentLevelId === 'function') {
        const levelId = hybridSystem.getCurrentLevelId();
        levelEl.innerHTML = String(levelId);
      } else {
        // Hybrid system not available - fail fast instead of fallback
        throw new Error('Hybrid level system not available - cannot update level display');
      }
    } catch (error) {
      errorHandler.handleError(error, 'updateDisplay');
    }
  }
}

export function updateLevelText(): void {
  if (typeof window === 'undefined') return;

  try {
    // Use hybrid level system as single source of truth
    // Modernized - hybrid system handled by store
    // Hybrid system access modernized - using direct import
    const hybridSystem = hybridLevelSystem;
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
    errorHandler.handleError(error, 'updateLevelText');
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
    errorHandler.handleError(error, 'updateDisplay');
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
      const baseMs = Number(
        (window as unknown as { GAME_CONFIG?: { TIMING?: Record<string, number> } }).GAME_CONFIG
          ?.TIMING?.['DEFAULT_DRINK_RATE'] || 5000
      );
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
    errorHandler.handleError(error, 'updateDisplay');
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
      errorHandler.handleError(error, 'updateDisplay');
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
        errorHandler.handleError(error, 'optimizedDisplayUpdate');
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
      errorHandler.handleError(new Error('No state available'), 'upgradeDisplaysUpdate');
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

    // Surface a clear short-term objective
    updateNextGoalDisplay(displayData);
  } catch (error) {
    errorHandler.handleError(error, 'updateUpgradeDisplays');
  }
}

type GoalCardState = {
  eyebrow: string;
  title: string;
  detail: string;
  meta: string;
  progressPct: number;
};

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function setNextGoalCard(goal: GoalCardState): void {
  updateStatDisplay('nextGoalEyebrow', goal.eyebrow);
  updateStatDisplay('nextGoalTitle', goal.title);
  updateStatDisplay('nextGoalDetail', goal.detail);
  updateStatDisplay('nextGoalMeta', goal.meta);

  const progressFill = document.getElementById('nextGoalProgressFill');
  if (progressFill) {
    progressFill.style.width = `${clampProgress(goal.progressPct)}%`;
  }
}

function updateNextGoalDisplay(state: any): void {
  const hasGoalCard =
    document.getElementById('nextGoalTitle') && document.getElementById('nextGoalProgressFill');
  if (!hasGoalCard) return;

  const costs = calculateAllCosts();
  const currentSips = toDecimal(state.sips || 0);
  const totalClicks = Number(state.totalClicks || 0);
  const suctions = Number(state.suctions || 0);
  const fasterDrinks = Number(state.fasterDrinks || 0);
  const straws = Number(state.straws || 0);
  const cups = Number(state.cups || 0);
  const widerStraws = Number(state.widerStraws || 0);
  const betterCups = Number(state.betterCups || 0);

  const buildCostGoal = (
    eyebrow: string,
    title: string,
    detail: string,
    cost: Decimal | undefined
  ): GoalCardState => {
    const targetCost = cost ?? new Decimal(0);
    const progressRatio = targetCost.gt(0) ? currentSips.div(targetCost).mul(100).toNumber() : 100;
    return {
      eyebrow,
      title,
      detail,
      meta: `${formatNumber(currentSips)} / ${formatNumber(targetCost)} sips`,
      progressPct: progressRatio,
    };
  };

  const buildUnlockGoal = (
    featureName: string,
    eyebrow: string,
    title: string,
    detail: string
  ): GoalCardState | null => {
    if (FEATURE_UNLOCKS.checkUnlock(featureName)) {
      return null;
    }
    const unlockCost = FEATURE_UNLOCKS.getUnlockCost(featureName);
    if (unlockCost == null) return null;
    const targetCost = toDecimal(unlockCost);
    const progressRatio = targetCost.gt(0) ? currentSips.div(targetCost).mul(100).toNumber() : 100;
    return {
      eyebrow,
      title,
      detail,
      meta: `${formatNumber(currentSips)} / ${formatNumber(targetCost)} sips`,
      progressPct: progressRatio,
    };
  };

  const unlockSuctionGoal = buildUnlockGoal(
    'suction',
    'ACTIVE PATH',
    'Unlock Turbo Sip',
    'Give clicks a real payoff before you pivot into automation.'
  );
  if (unlockSuctionGoal) {
    setNextGoalCard(unlockSuctionGoal);
    return;
  }

  if (suctions < 2) {
    setNextGoalCard(
      buildCostGoal(
        'ACTIVE PATH',
        'Buy Turbo Sip',
        'Your taps should feel stronger immediately.',
        costs['suction']
      )
    );
    return;
  }

  const unlockFasterGoal = buildUnlockGoal(
    'fasterDrinks',
    'RHYTHM PATH',
    'Unlock Quick Chug',
    'Shorter drink cycles make the whole game feel less sluggish.'
  );
  if (unlockFasterGoal) {
    setNextGoalCard(unlockFasterGoal);
    return;
  }

  if (fasterDrinks < 1) {
    setNextGoalCard(
      buildCostGoal(
        'RHYTHM PATH',
        'Buy Quick Chug',
        'Speed up the passive loop so progress never stalls.',
        costs['fasterDrinks']
      )
    );
    return;
  }

  if (straws < 3) {
    setNextGoalCard(
      buildCostGoal(
        'PASSIVE PATH',
        'Build Extra Straws',
        'Start stacking passive sip production in the background.',
        costs['straw']
      )
    );
    return;
  }

  if (cups < 2) {
    setNextGoalCard(
      buildCostGoal(
        'PASSIVE PATH',
        'Buy Bigger Cups',
        'Cups create chunkier jumps and make each cycle feel meaningful.',
        costs['cup']
      )
    );
    return;
  }

  if (widerStraws < 1) {
    setNextGoalCard(
      buildCostGoal(
        'SYNERGY PATH',
        'Upgrade Wider Straws',
        'Lean into straws and make your passive engine scale harder.',
        costs['widerStraws']
      )
    );
    return;
  }

  if (betterCups < 1) {
    setNextGoalCard(
      buildCostGoal(
        'SYNERGY PATH',
        'Upgrade Better Cups',
        'Push cup builds so your next level arrives sooner.',
        costs['betterCups']
      )
    );
    return;
  }

  const nextLevel = hybridLevelSystem?.getNextUnlockableLevel?.();
  if (nextLevel) {
    const sipProgress = nextLevel.unlockRequirement.sips
      ? currentSips.div(nextLevel.unlockRequirement.sips).mul(100).toNumber()
      : 100;
    const clickProgress = nextLevel.unlockRequirement.clicks
      ? (totalClicks / nextLevel.unlockRequirement.clicks) * 100
      : 100;
    setNextGoalCard({
      eyebrow: 'LEVEL PUSH',
      title: `Reach ${nextLevel.name}`,
      detail: 'New levels should feel like short-term milestones, not distant wallpaper.',
      meta: `${formatNumber(currentSips)} / ${formatNumber(nextLevel.unlockRequirement.sips)} sips, ${totalClicks.toLocaleString()} / ${nextLevel.unlockRequirement.clicks.toLocaleString()} clicks`,
      progressPct: Math.min(sipProgress, clickProgress),
    });
    return;
  }

  setNextGoalCard(
    buildCostGoal(
      'BUILD',
      'Keep Scaling',
      'Stack whichever upgrade fits your current path best.',
      costs['cup']
    )
  );
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
  const fasterCost = costs['fasterDrinks'] ?? new Decimal(0);
  const canAffordFasterDrinks = state.sips >= fasterCost;

  updateCostDisplay('fasterDrinksCostCompact', fasterCost, canAffordFasterDrinks);
  updateCostDisplay('fasterDrinksCost', fasterCost, canAffordFasterDrinks);
  updateStatDisplay('currentDrinkSpeedCompact', `${(currentDrinkSpeed / 1000).toFixed(2)}s`);

  // Update the new faster drinks button display
  updateStatDisplay('currentDrinkSpeed', `${(currentDrinkSpeed / 1000).toFixed(2)}s`);
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
  // Modernized - hybrid system handled by store
  // Hybrid system access modernized - using direct import
  const hybridSystem = hybridLevelSystem;

  if (hybridSystem && typeof hybridSystem.getCurrentLevel === 'function') {
    // Get the next unlockable level (not just next sequential)
    const nextLevel = hybridSystem.getNextUnlockableLevel();

    if (nextLevel) {
      const sips = state.sips || new Decimal(0);
      const clicks = state.totalClicks || 0;

      const canUnlock =
        sips.gte(nextLevel.unlockRequirement.sips) && clicks >= nextLevel.unlockRequirement.clicks;

      // Update the next level name
      const nextLevelNameEl = document.getElementById('nextLevelName');
      if (nextLevelNameEl) {
        nextLevelNameEl.textContent = `Next: ${nextLevel.name} (Level ${nextLevel.id})`;
      }

      // Update the requirements
      const requirementsEl = document.getElementById('levelRequirements');
      if (requirementsEl) {
        const sipsText = formatNumber(nextLevel.unlockRequirement.sips);

        const requirementsText = `${sipsText} sips, ${nextLevel.unlockRequirement.clicks.toLocaleString()} clicks`;

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
  const baseClickValue = 1;
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
      errorHandler.handleError(error, 'optimizedAffordabilityCheck');
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
      errorHandler.handleError(error, 'optimizedPurchasedCountsUpdate');
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
      errorHandler.handleError(error, 'optimizedDrinkSpeedDisplayUpdate');
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
      errorHandler.handleError(error, 'optimizedAutosaveStatusUpdate');
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
      errorHandler.handleError(error, 'optimizedLastSaveTimeUpdate');
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
