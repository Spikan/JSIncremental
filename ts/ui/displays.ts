// UI Display Updates (TypeScript)
import { formatNumber, updateButtonState, updateCostDisplay } from './utils';
import { useGameStore } from '../core/state/zustand-store';
import { LargeNumber } from '../core/numbers/large-number';

// Optimized display update functions using subscribeWithSelector
export function updateTopSipsPerDrink(): void {
  if (typeof window === 'undefined') return;
  const topSipsPerDrinkElement: any = (window as any).DOM_CACHE?.topSipsPerDrink;

  if (!topSipsPerDrinkElement) return;

  try {
    // Subscribe to SPS changes only
    useGameStore.subscribe(
      state => state.spd,
      spd => {
        if (topSipsPerDrinkElement) {
          // Use spd directly - formatNumber will handle LargeNumber properly
          topSipsPerDrinkElement.innerHTML = formatNumber(spd);
        }
      },
      { fireImmediately: true }
    );
  } catch (error) {
    console.warn('Failed to update top sips per drink:', error);
    // Fallback: update once
    const state = useGameStore.getState();
    if (topSipsPerDrinkElement && state) {
      // Use state.spd directly - formatNumber will handle LargeNumber properly
      topSipsPerDrinkElement.innerHTML = formatNumber(state.spd);
    }
  }
}

export function updateTopSipsPerSecond(): void {
  if (typeof window === 'undefined') return;
  const topSipsPerSecondElement: any = (window as any).DOM_CACHE?.topSipsPerSecond;

  if (!topSipsPerSecondElement) return;

  try {
    // Subscribe to both SPS and drink rate changes
    useGameStore.subscribe(
      state => ({ spd: state.spd, drinkRate: state.drinkRate }),
      ({ spd, drinkRate }) => {
        if (topSipsPerSecondElement) {
          // Keep LargeNumber for spd and do division properly
          const sipsPerDrinkLarge = spd && typeof spd.toNumber === 'function' ? spd : null;
          const drinkRateMs = Number(drinkRate || 0) || 1000;
          const drinkRateSeconds = drinkRateMs / 1000;

          let sipsPerSecond;
          if (sipsPerDrinkLarge) {
            // Convert drinkRateSeconds to LargeNumber for proper division
            const drinkRateSecondsLarge = new LargeNumber(drinkRateSeconds);
            sipsPerSecond = sipsPerDrinkLarge.divide(drinkRateSecondsLarge);
          } else {
            // Fallback for non-LargeNumber values
            const sipsPerDrink = Number(spd || 0);
            sipsPerSecond = sipsPerDrink / drinkRateSeconds;
          }

          topSipsPerSecondElement.innerHTML = formatNumber(sipsPerSecond);
        }
      },
      { fireImmediately: true }
    );
  } catch (error) {
    console.warn('Failed to update top sips per second:', error);
    // Fallback: update once
    const state = useGameStore.getState();
    if (topSipsPerSecondElement && state) {
      // Handle LargeNumber for spd and do division properly
      const sipsPerDrinkLarge =
        state.spd && typeof state.spd.toNumber === 'function' ? state.spd : null;
      const drinkRateMs = Number(state.drinkRate || 0) || 1000;
      const drinkRateSeconds = drinkRateMs / 1000;

      let sipsPerSecond;
      if (sipsPerDrinkLarge) {
        // Convert drinkRateSeconds to LargeNumber for proper division
        const drinkRateSecondsLarge = new LargeNumber(drinkRateSeconds);
        sipsPerSecond = sipsPerDrinkLarge.divide(drinkRateSecondsLarge);
      } else {
        // Fallback for non-LargeNumber values
        const sipsPerDrink = Number(state.spd || 0);
        sipsPerSecond = sipsPerDrink / drinkRateSeconds;
      }

      topSipsPerSecondElement.innerHTML = formatNumber(sipsPerSecond);
    }
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
          // criticalClickChance should remain a regular number, not LargeNumber
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
    // criticalClickChance should remain a regular number, not LargeNumber
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
      currentDrinkSpeedCompact.textContent = `${drinkRateSeconds.toFixed(2)}s`;
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
    const remainingSeconds = (remainingTime / 1000).toFixed(1);
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
  const topSipElement =
    (window as any).DOM_CACHE?.topSipValue || document.getElementById('topSipValue');
  if (topSipElement) {
    try {
      const state = useGameStore.getState();
      console.log('DEBUG: updateTopSipCounter - state.sips:', state.sips);
      console.log('DEBUG: updateTopSipCounter - state.sips type:', typeof state.sips);
      console.log(
        'DEBUG: updateTopSipCounter - state.sips has toNumber:',
        !!(state.sips && typeof state.sips.toNumber === 'function')
      );
      if (state.sips && typeof state.sips.toNumber === 'function') {
        console.log('DEBUG: updateTopSipCounter - state.sips.toNumber():', state.sips.toNumber());
        console.log(
          'DEBUG: updateTopSipCounter - isFinite:',
          Number.isFinite(state.sips.toNumber())
        );
      }
      // Use state.sips directly - formatNumber will handle LargeNumber properly
      const formatted = formatNumber(state.sips);
      console.log('DEBUG: updateTopSipCounter - formatted result:', formatted);
      (topSipElement as HTMLElement).textContent = formatted;
    } catch (error) {
      console.warn('Failed to update display:', error);
    }
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
      drinkRateElement.textContent = `${drinkRateSeconds.toFixed(2)}s`;
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
      currentDrinkSpeedCompact.textContent = `${drinkRateSeconds.toFixed(2)}s`;
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
        (display as HTMLElement).textContent = `${drinkRateSeconds.toFixed(2)}s`;
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

export { updateCostDisplay, updateButtonState };
