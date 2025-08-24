// UI Display Updates (TypeScript)
import { formatNumber, updateButtonState, updateCostDisplay } from './utils';
import { useGameStore } from '../core/state/zustand-store';

export function updateTopSipsPerDrink(): void {
  if (typeof window === 'undefined') return;
  const topSipsPerDrinkElement: any = (window as any).DOM_CACHE?.topSipsPerDrink;
  try {
    const state = useGameStore.getState();
    if (topSipsPerDrinkElement && state) {
      const sps = Number(state.sps || 0);
      topSipsPerDrinkElement.innerHTML = formatNumber(sps);
    }
  } catch (error) {
    console.warn('Failed to update top sips per drink:', error);
  }
}

export function updateTopSipsPerSecond(): void {
  if (typeof window === 'undefined') return;
  const topSipsPerSecondElement: any = (window as any).DOM_CACHE?.topSipsPerSecond;
  try {
    const state = useGameStore.getState();
    if (topSipsPerSecondElement && state) {
      const sipsPerDrink = Number(state.sps || 0);
      const drinkRateMs = Number(state.drinkRate || 0) || 1000;
      const drinkRateSeconds = drinkRateMs / 1000;
      const sipsPerSecond = sipsPerDrink / drinkRateSeconds;
      topSipsPerSecondElement.innerHTML = formatNumber(sipsPerSecond);
    }
  } catch (error) {
    console.warn('Failed to update top sips per second:', error);
  }
}

export function updateCriticalClickDisplay(): void {
  if (typeof window === 'undefined') return;
  const criticalClickChanceCompact = document.getElementById('criticalClickChanceCompact');
  if (criticalClickChanceCompact) {
    try {
      const state = useGameStore.getState();
      const chance = Number(state.criticalClickChance ?? NaN);
      if (!Number.isNaN(chance)) {
        criticalClickChanceCompact.textContent = `${(chance * 100).toFixed(1)}%`;
      }
    } catch (error) {
      console.warn('Failed to update critical click display:', error);
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
      const sipsNum = Number(state.sips || 0);
      (topSipElement as HTMLElement).textContent = formatNumber(sipsNum);
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
