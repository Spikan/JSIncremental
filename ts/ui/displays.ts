// UI Display Updates (TypeScript)
import { formatNumber, updateButtonState, updateCostDisplay } from './utils';
import { useGameStore } from '../core/state/zustand-store';
import { Decimal } from '../core/numbers';
import { safeToNumberOrDecimal } from '../core/numbers/safe-conversion';
import subscriptionManager from './subscription-manager';
import debounceManager from './debounce-utils';
import { updateLastSaveTime, updatePurchasedCounts } from './stats';
import { checkUpgradeAffordability } from './affordability';

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

  // Check if DOM_CACHE is ready
  const domCache = (window as any).DOM_CACHE;
  if (!domCache || (typeof domCache.isReady === 'function' && !domCache.isReady())) {
    return;
  }

  const topSipsPerDrinkElement: HTMLElement | null =
    domCache.topSipsPerDrink || document.getElementById('topSipsPerDrink');

  if (!topSipsPerDrinkElement) {
    return;
  }

  // Clean up existing subscription if any
  if (subscriptionManager.has(SUBSCRIPTION_KEYS.TOP_SIPS_PER_DRINK)) {
    subscriptionManager.unregister(SUBSCRIPTION_KEYS.TOP_SIPS_PER_DRINK);
  }

  try {
    // Get current state and update immediately
    const state = useGameStore.getState();
    if (state && state.spd !== undefined) {
      const formatted = formatNumber(state.spd);
      topSipsPerDrinkElement.innerHTML = formatted;
    }
  } catch (error) {
    // Error handling - logging removed for production
  }
}

export function updateTopSipsPerSecond(): void {
  if (typeof window === 'undefined') return;

  // Check if DOM_CACHE is ready
  const domCache = (window as any).DOM_CACHE;
  if (!domCache || (typeof domCache.isReady === 'function' && !domCache.isReady())) {
    return;
  }

  const topSipsPerSecondElement: HTMLElement | null =
    domCache.topSipsPerSecond || document.getElementById('topSipsPerSecond');

  if (!topSipsPerSecondElement) {
    return;
  }

  // Clean up existing subscription if any
  if (subscriptionManager.has(SUBSCRIPTION_KEYS.TOP_SIPS_PER_SECOND)) {
    subscriptionManager.unregister(SUBSCRIPTION_KEYS.TOP_SIPS_PER_SECOND);
  }

  try {
    // Get current state and update immediately
    const state = useGameStore.getState();
    if (state && state.spd !== undefined && state.drinkRate !== undefined) {
      // Handle Decimal for spd and do division properly
      const sipsPerDrinkLarge =
        state.spd && typeof state.spd.toNumber === 'function' ? state.spd : null;
      const drinkRateMs = safeToNumberOrDecimal(state.drinkRate || 0);
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
        const sipsPerDrink = safeToNumberOrDecimal(state.spd || 0);
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

export function updateCriticalClickDisplay(): void {
  if (typeof window === 'undefined') return;
  const criticalClickChanceCompact = document.getElementById('criticalClickChanceCompact');
  const criticalChanceElement = document.getElementById('criticalChance');

  try {
    // Subscribe to critical click chance changes only
    useGameStore.subscribe(
      state => state.criticalClickChance,
      chance => {
        const numericChance = Number(chance ?? NaN);
        const formattedChance = !Number.isNaN(numericChance)
          ? `${(numericChance * 100).toFixed(1)}%`
          : '0.0%';

        // Update compact display (existing)
        if (criticalClickChanceCompact) {
          criticalClickChanceCompact.textContent = formattedChance;
        }

        // Update new main UI display
        if (criticalChanceElement) {
          criticalChanceElement.textContent = formattedChance;
        }
      },
      { fireImmediately: true }
    );
  } catch (error) {
    console.warn('Failed to update critical click display:', error);
    // Fallback: update once
    const state = useGameStore.getState();
    const chance = Number(state.criticalClickChance ?? NaN);
    const formattedChance = !Number.isNaN(chance) ? `${(chance * 100).toFixed(1)}%` : '0.0%';

    if (criticalClickChanceCompact) {
      criticalClickChanceCompact.textContent = formattedChance;
    }
    if (criticalChanceElement) {
      criticalChanceElement.textContent = formattedChance;
    }
  }
}

export function updateClickValueDisplay(): void {
  if (typeof window === 'undefined') return;
  const clickValueElement = document.getElementById('clickValue');

  if (!clickValueElement) return;

  try {
    // Get current click value from game state
    const state = (window as any).App?.state?.getState?.();
    if (state) {
      // Calculate total click value (base + suction bonuses)
      let baseClickValue = 1;
      const suctionBonus = Number(state.suctionClickBonus || 0);
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
  const drinkSpeedBonusCompact = document.getElementById('drinkSpeedBonusCompact');
  try {
    const state = useGameStore.getState();
    if (currentDrinkSpeedCompact && state) {
      const drinkRateMs = safeToNumberOrDecimal(state.drinkRate || 0);
      const drinkRateMsNum =
        typeof drinkRateMs === 'number'
          ? drinkRateMs
          : Math.abs(drinkRateMs.toNumber()) < 1e15
            ? drinkRateMs.toNumber()
            : 1000;
      const drinkRateSeconds = drinkRateMsNum / 1000;
      currentDrinkSpeedCompact.textContent = `${formatNumber(drinkRateSeconds)}s`;
    }
    if (drinkSpeedBonusCompact && state) {
      const baseMs = Number((window as any).GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE || 5000);
      const drinkRateMs = safeToNumberOrDecimal(state.drinkRate || baseMs);
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
    const state = useGameStore.getState();
    const opts = state.options;
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
    const state = useGameStore.getState();
    if (state) {
      if (currentProgress == null) {
        const progress = safeToNumberOrDecimal(state.drinkProgress || 0);
        currentProgress =
          typeof progress === 'number'
            ? progress
            : Math.abs(progress.toNumber()) < 1e15
              ? progress.toNumber()
              : 0;
      }
      if (currentDrinkRate == null) currentDrinkRate = safeToNumberOrDecimal(state.drinkRate || 0);
    }
  } catch (error) {
    console.warn('Failed to update display:', error);
  }
  const progressFill =
    (window as any).DOM_CACHE?.progressFill || document.getElementById('drinkProgressFill');
  const countdown =
    (window as any).DOM_CACHE?.countdown || document.getElementById('drinkCountdown');
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
    const remainingSeconds = formatNumber(remainingTime / 1000);
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

  // Check if DOM_CACHE is ready
  const domCache = (window as any).DOM_CACHE;
  if (!domCache || (typeof domCache.isReady === 'function' && !domCache.isReady())) {
    return;
  }

  const topSipElement = domCache.topSipValue || document.getElementById('topSipValue');

  // Silent updates unless there's an issue

  if (topSipElement) {
    try {
      const state = useGameStore.getState();
      // Use state.sips directly - formatNumber will handle Decimal properly
      const formatted = formatNumber(state.sips);
      // Silent update - no visual feedback needed
      (topSipElement as HTMLElement).textContent = formatted;
    } catch (error) {
      console.warn('Failed to update display:', error);
    }
  } else {
    console.error('DEBUG: updateTopSipCounter - topSipElement not found!');
  }
}

export function updateLevelNumber(): void {
  if (typeof window === 'undefined') return;
  const levelEl: any = (window as any).DOM_CACHE?.levelNumber;
  if (levelEl) {
    try {
      const state = useGameStore.getState();
      const level = safeToNumberOrDecimal(state.level || 1);
      const levelNum =
        typeof level === 'number'
          ? level
          : Math.abs(level.toNumber()) < 1e15
            ? level.toNumber()
            : 1;
      levelEl.innerHTML = String(levelNum);
    } catch (error) {
      console.warn('Failed to update display:', error);
    }
  }
}

export function updateLevelText(): void {
  if (typeof window === 'undefined') return;
  const levelTextEl: any = (window as any).DOM_CACHE?.levelText;
  if (levelTextEl) {
    try {
      const state = useGameStore.getState();
      const level = safeToNumberOrDecimal(state.level || 1);
      const levelNum =
        typeof level === 'number'
          ? level
          : Math.abs(level.toNumber()) < 1e15
            ? level.toNumber()
            : 1;
      const levelText = getLevelText(levelNum);
      levelTextEl.innerHTML = levelText;
    } catch (error) {
      console.warn('Failed to update display:', error);
    }
  }
}

export function updateDrinkRate(): void {
  if (typeof window === 'undefined') return;
  const drinkRateElement = document.getElementById('drinkRate');
  try {
    const state = useGameStore.getState();
    if (drinkRateElement && state) {
      const drinkRateMs = safeToNumberOrDecimal(state.drinkRate || 0);
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
  const drinkSpeedBonusCompact = document.getElementById('drinkSpeedBonusCompact');
  try {
    const state = useGameStore.getState();
    if (currentDrinkSpeedCompact && state) {
      const drinkRateMs = safeToNumberOrDecimal(state.drinkRate || 0);
      const drinkRateMsNum =
        typeof drinkRateMs === 'number'
          ? drinkRateMs
          : Math.abs(drinkRateMs.toNumber()) < 1e15
            ? drinkRateMs.toNumber()
            : 1000;
      const drinkRateSeconds = drinkRateMsNum / 1000;
      currentDrinkSpeedCompact.textContent = `${formatNumber(drinkRateSeconds)}s`;
    }
    if (drinkSpeedBonusCompact && state) {
      const baseMs = Number((window as any).GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE || 5000);
      const drinkRateMs = safeToNumberOrDecimal(state.drinkRate || baseMs);
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
      const state = useGameStore.getState();
      if ((display as HTMLElement).id.includes('DrinkSpeed') && state) {
        const drinkRateMs = safeToNumberOrDecimal(state.drinkRate || 0);
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

function getLevelText(level: number): string {
  const levelTexts = [
    'On a Blue Background',
    'With a Straw',
    'In a Cup',
    'With Suction',
    'Faster Drinking',
    'Critical Hits',
    'Advanced Upgrades',
    'Master Soda Drinker',
    'Soda Legend',
    'Ultimate Soda Master',
  ];
  const index = Math.min(Math.floor(level - 1), levelTexts.length - 1);
  return levelTexts[index] || levelTexts[levelTexts.length - 1] || 'Unknown Level';
}

// Debug functions removed for production

// Debug function to test state changes and subscriptions
export function testStateChangesAndUpdates(): void {
  console.log('=== TESTING STATE CHANGES AND UPDATES ===');

  try {
    const state = useGameStore.getState();
    console.log('Initial state:', {
      sips: state.sips,
      spd: state.spd,
      drinkRate: state.drinkRate,
    });

    // Test adding sips
    console.log('Testing sip addition...');
    state.actions.addSips(10);

    // Wait a bit and check state again
    setTimeout(() => {
      const newState = useGameStore.getState();
      console.log('State after adding 10 sips:', {
        sips: newState.sips,
        spd: newState.spd,
        drinkRate: newState.drinkRate,
      });

      // Check if elements were updated
      const topSipElement = document.getElementById('topSipValue');
      const topSipsPerDrinkElement = document.getElementById('topSipsPerDrink');
      const topSipsPerSecondElement = document.getElementById('topSipsPerSecond');

      console.log('Element contents after state change:', {
        topSipValue: topSipElement?.textContent,
        topSipsPerDrink: topSipsPerDrinkElement?.innerHTML,
        topSipsPerSecond: topSipsPerSecondElement?.innerHTML,
      });

      // Test SPD change
      console.log('Testing SPD change...');
      state.actions.setSPD(5);

      setTimeout(() => {
        const finalState = useGameStore.getState();
        console.log('Final state after SPD change:', {
          sips: finalState.sips,
          spd: finalState.spd,
          drinkRate: finalState.drinkRate,
        });

        console.log('Final element contents:', {
          topSipValue: topSipElement?.textContent,
          topSipsPerDrink: topSipsPerDrinkElement?.innerHTML,
          topSipsPerSecond: topSipsPerSecondElement?.innerHTML,
        });

        console.log('=== STATE CHANGE TEST COMPLETED ===');
      }, 200);
    }, 200);
  } catch (error) {
    console.error('Failed to test state changes:', error);
  }
}

// Debug function to manually test event system
export function testEventSystem(): void {
  console.log('=== TESTING EVENT SYSTEM ===');

  try {
    // Test if we can emit a CLICK.SODA event manually
    const eventName = (window as any).App?.EVENT_NAMES?.CLICK?.SODA;
    console.log('Event name:', eventName);

    if ((window as any).App?.events && eventName) {
      console.log('Emitting test CLICK.SODA event...');
      (window as any).App.events.emit(eventName, {
        value: 1,
        gained: 1,
        test: true,
      });
      console.log('Test event emitted successfully');
    } else {
      console.error('Cannot emit test event - event system not ready');
    }
  } catch (error) {
    console.error('Failed to test event system:', error);
  }

  console.log('=== END EVENT SYSTEM TEST ===');
}

// Debug function to manually test soda click handling
export function testSodaClick(): void {
  console.log('=== TESTING SODA CLICK HANDLING ===');

  try {
    const handleSodaClick = (window as any).App?.systems?.clicks?.handleSodaClick;
    console.log('handleSodaClick function:', {
      exists: typeof handleSodaClick === 'function',
      function: handleSodaClick,
    });

    if (typeof handleSodaClick === 'function') {
      console.log('Calling handleSodaClick manually...');
      handleSodaClick(1);
      console.log('Manual handleSodaClick completed');
    } else {
      console.error('handleSodaClick function not available');
    }
  } catch (error) {
    console.error('Failed to test soda click handling:', error);
  }

  console.log('=== END SODA CLICK TEST ===');
}

// Debug function to test direct button click simulation
export function testSodaButtonClick(): void {
  console.log('=== TESTING DIRECT SODA BUTTON CLICK ===');

  try {
    const sodaButton = document.getElementById('sodaButton');
    console.log('Soda button found:', !!sodaButton);

    if (sodaButton) {
      console.log('Dispatching click event on soda button...');
      const clickEvent = new Event('click', { bubbles: true });
      sodaButton.dispatchEvent(clickEvent);
      console.log('Click event dispatched');
    } else {
      console.error('Soda button not found');
    }
  } catch (error) {
    console.error('Failed to test button click:', error);
  }

  console.log('=== END BUTTON CLICK TEST ===');
}

// Debug functions removed for production

// Performance-optimized batch update functions
/**
 * Debounced version of updateAllDisplays for better performance
 */
export const updateAllDisplaysOptimized = debounceManager.debounce(
  DEBOUNCE_KEYS.UPDATE_ALL_DISPLAYS,
  () => {
    try {
      updateTopSipCounter();
      updateTopSipsPerDrink();
      updateTopSipsPerSecond();
    } catch (error) {
      console.warn('Error in optimized display update:', error);
    }
  },
  UPDATE_INTERVALS.NORMAL,
  { trailing: true, maxWait: UPDATE_INTERVALS.SLOW }
);

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

export { updateCostDisplay, updateButtonState };
