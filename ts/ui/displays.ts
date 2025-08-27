// UI Display Updates (TypeScript)
import { formatNumber, updateButtonState, updateCostDisplay } from './utils';
import { useGameStore } from '../core/state/zustand-store';
import { Decimal } from '../core/numbers';

// Store subscription references to avoid multiple subscriptions
let topSipsPerDrinkSubscription: (() => void) | null = null;
let topSipsPerSecondSubscription: (() => void) | null = null;

// Optimized display update functions using subscribeWithSelector
export function updateTopSipsPerDrink(): void {
  console.log('🔧 UPDATE TOP SIPS PER DRINK: Function called');
  if (typeof window === 'undefined') return;

  // Check if DOM_CACHE is ready
  const domCache = (window as any).DOM_CACHE;
  if (!domCache || !domCache.isReady || !domCache.isReady()) {
    console.log('DEBUG: updateTopSipsPerDrink - DOM_CACHE not ready, skipping update');
    return;
  }

  const topSipsPerDrinkElement: any =
    domCache.topSipsPerDrink || document.getElementById('topSipsPerDrink');

  console.log('🔧 UPDATE TOP SIPS PER DRINK: Element found =', !!topSipsPerDrinkElement);

  // Silent updates unless there's an issue

  if (!topSipsPerDrinkElement) {
    console.error('DEBUG: updateTopSipsPerDrink - element not found!');
    return;
  }

  // Clean up existing subscription if any
  if (topSipsPerDrinkSubscription) {
    console.log('🔧 UPDATE TOP SIPS PER DRINK: Cleaning up existing subscription');
    // Clean up existing subscription
    topSipsPerDrinkSubscription();
    topSipsPerDrinkSubscription = null;
  }

  try {
    // Get current state and update immediately
    const state = useGameStore.getState();
    if (state && state.spd !== undefined) {
      const formatted = formatNumber(state.spd);
      console.log('🔧 UPDATE TOP SIPS PER DRINK: Updating with value:', formatted);
      topSipsPerDrinkElement.innerHTML = formatted;
    } else {
      console.log('🔧 UPDATE TOP SIPS PER DRINK: No SPD value available');
    }
  } catch (error) {
    console.warn('Failed to update top sips per drink:', error);
  }
}

export function updateTopSipsPerSecond(): void {
  console.log('🔧 UPDATE TOP SIPS PER SECOND: Function called');
  if (typeof window === 'undefined') return;

  // Check if DOM_CACHE is ready
  const domCache = (window as any).DOM_CACHE;
  if (!domCache || !domCache.isReady()) {
    console.log('DEBUG: updateTopSipsPerSecond - DOM_CACHE not ready, skipping update');
    return;
  }

  const topSipsPerSecondElement: any =
    domCache.topSipsPerSecond || document.getElementById('topSipsPerSecond');

  console.log('🔧 UPDATE TOP SIPS PER SECOND: Element found =', !!topSipsPerSecondElement);

  // Silent updates unless there's an issue

  if (!topSipsPerSecondElement) {
    console.error('DEBUG: updateTopSipsPerSecond - element not found!');
    return;
  }

  // Clean up existing subscription if any
  if (topSipsPerSecondSubscription) {
    console.log('🔧 UPDATE TOP SIPS PER SECOND: Cleaning up existing subscription');
    // Clean up existing subscription
    topSipsPerSecondSubscription();
    topSipsPerSecondSubscription = null;
  }

  try {
    // Get current state and update immediately
    const state = useGameStore.getState();
    if (state && state.spd !== undefined && state.drinkRate !== undefined) {
      // Handle Decimal for spd and do division properly
      const sipsPerDrinkLarge =
        state.spd && typeof state.spd.toNumber === 'function' ? state.spd : null;
      const drinkRateMs = Number(state.drinkRate || 0) || 1000;
      const drinkRateSeconds = drinkRateMs / 1000;

      let sipsPerSecond;
      if (sipsPerDrinkLarge) {
        // Convert drinkRateSeconds to Decimal for proper division
        const drinkRateSecondsLarge = new Decimal(drinkRateSeconds);
        sipsPerSecond = sipsPerDrinkLarge.divide(drinkRateSecondsLarge);
      } else {
        // Fallback for non-Decimal values
        const sipsPerDrink = Number(state.spd || 0);
        sipsPerSecond = sipsPerDrink / drinkRateSeconds;
      }

      const formatted = formatNumber(sipsPerSecond);
      console.log('🔧 UPDATE TOP SIPS PER SECOND: Updating with value:', formatted);
      topSipsPerSecondElement.innerHTML = formatted;
    } else {
      console.log('🔧 UPDATE TOP SIPS PER SECOND: Missing SPD or drinkRate values');
    }
  } catch (error) {
    console.warn('Failed to update top sips per second:', error);
  }
}

export function updateCriticalClickDisplay(): void {
  if (typeof window === 'undefined') return;
  const criticalClickChanceCompact = document.getElementById('criticalClickChanceCompact');

  if (!criticalClickChanceCompact) return;

  try {
    // Subscribe to critical click chance changes only
    useGameStore.subscribe(
      state => state.criticalClickChance,
      chance => {
        if (criticalClickChanceCompact) {
          // criticalClickChance should remain a regular number, not Decimal
          const numericChance = Number(chance ?? NaN);
          if (!Number.isNaN(numericChance)) {
            criticalClickChanceCompact.textContent = `${(numericChance * 100).toFixed(1)}%`;
          }
        }
      },
      { fireImmediately: true }
    );
  } catch (error) {
    console.warn('Failed to update critical click display:', error);
    // Fallback: update once
    const state = useGameStore.getState();
    // criticalClickChance should remain a regular number, not Decimal
    const chance = Number(state.criticalClickChance ?? NaN);
    if (!Number.isNaN(chance)) {
      criticalClickChanceCompact.textContent = `${(chance * 100).toFixed(1)}%`;
    }
  }
}

export function updateDrinkSpeedDisplay(): void {
  if (typeof window === 'undefined') return;
  const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
  const drinkSpeedBonusCompact = document.getElementById('drinkSpeedBonusCompact');
  try {
    const state = useGameStore.getState();
    if (currentDrinkSpeedCompact && state) {
      const drinkRateSeconds = Number(state.drinkRate || 0) / 1000;
      currentDrinkSpeedCompact.textContent = `${formatNumber(drinkRateSeconds)}s`;
    }
    if (drinkSpeedBonusCompact && state) {
      const baseMs = Number((window as any).GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE || 5000);
      const currMs = Number(state.drinkRate || baseMs) || baseMs;
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
      if (currentProgress == null) currentProgress = Number(state.drinkProgress || 0);
      if (currentDrinkRate == null) currentDrinkRate = Number(state.drinkRate || 0);
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
  console.log('🔧 UPDATE TOP SIP COUNTER: Function called');
  if (typeof window === 'undefined') return;

  // Check if DOM_CACHE is ready
  const domCache = (window as any).DOM_CACHE;
  if (!domCache || !domCache.isReady()) {
    console.log('DEBUG: updateTopSipCounter - DOM_CACHE not ready, skipping update');
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
      const level = Number(state.level || 1);
      levelEl.innerHTML = String(level);
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
      const level = Number(state.level || 1);
      const levelText = getLevelText(level);
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
      const drinkRateSeconds = Number(state.drinkRate || 0) / 1000;
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
      const drinkRateSeconds = Number(state.drinkRate || 0) / 1000;
      currentDrinkSpeedCompact.textContent = `${formatNumber(drinkRateSeconds)}s`;
    }
    if (drinkSpeedBonusCompact && state) {
      const baseMs = Number((window as any).GAME_CONFIG?.TIMING?.DEFAULT_DRINK_RATE || 5000);
      const currMs = Number(state.drinkRate || baseMs) || baseMs;
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
        const drinkRateSeconds = Number(state.drinkRate || 0) / 1000;
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

// Debug function for testing top indicators
export function debugTopIndicators(): void {
  console.log('=== TOP INDICATORS DEBUG ===');
  console.log('DOM_CACHE available:', !!(window as any).DOM_CACHE);
  console.log('DOM_CACHE.isReady():', (window as any).DOM_CACHE?.isReady?.());

  const elements = ['topSipValue', 'topSipsPerDrink', 'topSipsPerSecond'];

  elements.forEach(id => {
    const element = document.getElementById(id);
    const cachedElement = (window as any).DOM_CACHE?.[id];
    console.log(`Element ${id}:`, {
      direct: !!element,
      cached: !!cachedElement,
      same: element === cachedElement,
      content: element?.textContent || 'N/A',
    });
  });

  // Test state access
  try {
    const state = useGameStore.getState();
    console.log('Game state:', {
      sips: state.sips,
      spd: state.spd,
      drinkRate: state.drinkRate,
    });
  } catch (error) {
    console.error('Failed to access game state:', error);
  }

  // Test event system
  try {
    const events = (window as any).App?.events;
    console.log('Event system available:', !!events);
    if (events) {
      console.log('Available events:', Object.keys(events));
    }
  } catch (error) {
    console.error('Failed to access event system:', error);
  }

  // Test if functions are available
  const testFunctions = ['updateTopSipCounter', 'updateTopSipsPerDrink', 'updateTopSipsPerSecond'];

  testFunctions.forEach(funcName => {
    const func = (window as any).App?.ui?.[funcName];
    console.log(`Function ${funcName} available:`, typeof func === 'function');
  });

  console.log('=== END DEBUG ===');
}

// Debug function to manually trigger updates
export function forceUpdateTopIndicators(): void {
  console.log('=== FORCE UPDATE TOP INDICATORS ===');
  try {
    updateTopSipCounter();
    updateTopSipsPerDrink();
    updateTopSipsPerSecond();
    console.log('Manual updates completed');
  } catch (error) {
    console.error('Failed to force update:', error);
  }
  console.log('=== END FORCE UPDATE ===');
}

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

// Make debug functions globally available
if (typeof window !== 'undefined') {
  (window as any).debugTopIndicators = debugTopIndicators;
  (window as any).forceUpdateTopIndicators = forceUpdateTopIndicators;
  (window as any).testStateChangesAndUpdates = testStateChangesAndUpdates;
  (window as any).testEventSystem = testEventSystem;
  (window as any).testSodaClick = testSodaClick;
  (window as any).testSodaButtonClick = testSodaButtonClick;
}

export { updateCostDisplay, updateButtonState };
