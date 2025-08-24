// Typed legacy state bridge that mirrors globals into App.state

import type { GameState } from './shape';

// Type for actions available in the Zustand store
interface StateActions {
  setDrinkRate?: (value: number) => void;
  setDrinkProgress?: (value: number) => void;
  setLastDrinkTime?: (value: number) => void;
  setLevel?: (value: number) => void;
  setSips?: (value: number) => void;
  setStraws?: (value: number) => void;
  setCups?: (value: number) => void;
  setSuctions?: (value: number) => void;
  setWiderStraws?: (value: number) => void;
  setBetterCups?: (value: number) => void;
  setFasterDrinks?: (value: number) => void;
  setCriticalClicks?: (value: number) => void;
  setCriticalClickChance?: (value: number) => void;
  setCriticalClickMultiplier?: (value: number) => void;
  setSuctionClickBonus?: (value: number) => void;
  setSPS?: (value: number) => void;
  setStrawSPD?: (value: number) => void;
  setCupSPD?: (value: number) => void;
  setFasterDrinksUpCounter?: (value: number) => void;
  setCriticalClickUpCounter?: (value: number) => void;
}

type AppLike = {
  state: {
    setState?: (partial: Partial<GameState>) => void;
    getState?: () => GameState;
    actions?: StateActions;
  };
};

// Type for values that can be Decimal-like or primitive
type DecimalValue = number | string | { toNumber(): number } | { _v: number };

export function createStateBridge(app: AppLike) {
  function setDrinkRate(value: DecimalValue) {
    try {
      const numericValue =
        typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value) || 0;
      app.state.actions?.setDrinkRate?.(numericValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function setDrinkProgress(value: DecimalValue) {
    try {
      const numericValue =
        typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value) || 0;
      app.state.actions?.setDrinkProgress?.(numericValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function setLastDrinkTime(value: DecimalValue) {
    try {
      const numericValue =
        typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value) || 0;
      app.state.actions?.setLastDrinkTime?.(numericValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function setLevel(value: DecimalValue) {
    const numeric =
      typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value) || 1;
    try {
      app.state.actions?.setLevel?.(numeric);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function toNum(value: DecimalValue): number {
    return typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value) || 0;
  }

  function syncSips(value: DecimalValue) {
    try {
      app.state.actions?.setSips?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncStraws(value: DecimalValue) {
    try {
      app.state.actions?.setStraws?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCups(value: DecimalValue) {
    try {
      app.state.actions?.setCups?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncSuctions(value: DecimalValue) {
    try {
      app.state.actions?.setSuctions?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncWiderStraws(value: DecimalValue) {
    try {
      app.state.actions?.setWiderStraws?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncBetterCups(value: DecimalValue) {
    try {
      app.state.actions?.setBetterCups?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncFasterDrinks(value: DecimalValue) {
    try {
      app.state.actions?.setFasterDrinks?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCriticalClicks(value: DecimalValue) {
    try {
      app.state.actions?.setCriticalClicks?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCriticalClickChance(value: DecimalValue) {
    try {
      app.state.actions?.setCriticalClickChance?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCriticalClickMultiplier(value: DecimalValue) {
    try {
      app.state.actions?.setCriticalClickMultiplier?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncSuctionClickBonus(value: DecimalValue) {
    try {
      app.state.actions?.setSuctionClickBonus?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncSps(value: DecimalValue) {
    try {
      app.state.actions?.setSPS?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncStrawSPD(value: DecimalValue) {
    try {
      app.state.actions?.setStrawSPD?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCupSPD(value: DecimalValue) {
    try {
      app.state.actions?.setCupSPD?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function init() {
    try {
      const seed: Partial<GameState> = {};
      const w = typeof window !== 'undefined' ? (window as any) : {};

      // Helper function to safely get window properties
      const getWindowValue = (key: string): DecimalValue | undefined => {
        return w[key];
      };

      // Helper function to set seed value if window property exists
      const setSeedIfExists = (key: string, seedKey: keyof GameState) => {
        const value = getWindowValue(key);
        if (value !== undefined) {
          if (
            typeof seedKey === 'string' &&
            (seedKey === 'drinkRate' || seedKey === 'drinkProgress' || seedKey === 'lastDrinkTime')
          ) {
            (seed as any)[seedKey] = Number(value) || 0;
          } else if (seedKey === 'level') {
            (seed as any)[seedKey] =
              typeof value === 'object' && 'toNumber' in value
                ? value.toNumber()
                : Number(value) || 1;
          } else {
            (seed as any)[seedKey] = toNum(value);
          }
        }
      };

      setSeedIfExists('drinkRate', 'drinkRate');
      setSeedIfExists('drinkProgress', 'drinkProgress');
      setSeedIfExists('lastDrinkTime', 'lastDrinkTime');
      setSeedIfExists('level', 'level');
      setSeedIfExists('sips', 'sips');
      setSeedIfExists('straws', 'straws');
      setSeedIfExists('cups', 'cups');
      setSeedIfExists('suctions', 'suctions');
      setSeedIfExists('widerStraws', 'widerStraws');
      setSeedIfExists('betterCups', 'betterCups');
      setSeedIfExists('fasterDrinks', 'fasterDrinks');
      setSeedIfExists('criticalClicks', 'criticalClicks');
      setSeedIfExists('criticalClickChance', 'criticalClickChance');
      setSeedIfExists('criticalClickMultiplier', 'criticalClickMultiplier');
      setSeedIfExists('suctionClickBonus', 'suctionClickBonus');
      setSeedIfExists('fasterDrinksUpCounter', 'fasterDrinksUpCounter');
      setSeedIfExists('criticalClickUpCounter', 'criticalClickUpCounter');
      setSeedIfExists('sps', 'sps');
      // Apply seed values using individual actions
      if (seed.drinkRate !== undefined) app.state.actions?.setDrinkRate?.(seed.drinkRate);
      if (seed.drinkProgress !== undefined)
        app.state.actions?.setDrinkProgress?.(seed.drinkProgress);
      if (seed.lastDrinkTime !== undefined)
        app.state.actions?.setLastDrinkTime?.(seed.lastDrinkTime);
      if (seed.level !== undefined) app.state.actions?.setLevel?.(seed.level);
      if (seed.sips !== undefined) app.state.actions?.setSips?.(seed.sips);
      if (seed.straws !== undefined) app.state.actions?.setStraws?.(seed.straws);
      if (seed.cups !== undefined) app.state.actions?.setCups?.(seed.cups);
      if (seed.suctions !== undefined) app.state.actions?.setSuctions?.(seed.suctions);
      if (seed.widerStraws !== undefined) app.state.actions?.setWiderStraws?.(seed.widerStraws);
      if (seed.betterCups !== undefined) app.state.actions?.setBetterCups?.(seed.betterCups);
      if (seed.fasterDrinks !== undefined) app.state.actions?.setFasterDrinks?.(seed.fasterDrinks);
      if (seed.criticalClicks !== undefined)
        app.state.actions?.setCriticalClicks?.(seed.criticalClicks);
      if (seed.criticalClickChance !== undefined)
        app.state.actions?.setCriticalClickChance?.(seed.criticalClickChance);
      if (seed.criticalClickMultiplier !== undefined)
        app.state.actions?.setCriticalClickMultiplier?.(seed.criticalClickMultiplier);
      if (seed.suctionClickBonus !== undefined)
        app.state.actions?.setSuctionClickBonus?.(seed.suctionClickBonus);
      if (seed.fasterDrinksUpCounter !== undefined)
        app.state.actions?.setFasterDrinksUpCounter?.(seed.fasterDrinksUpCounter);
      if (seed.criticalClickUpCounter !== undefined)
        app.state.actions?.setCriticalClickUpCounter?.(seed.criticalClickUpCounter);
      if (seed.sps !== undefined) app.state.actions?.setSPS?.(seed.sps);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function autoSync() {
    const w: any = typeof window !== 'undefined' ? window : {};
    try {
      if (typeof w.sips !== 'undefined') syncSips(w.sips);
      if (typeof w.straws !== 'undefined') syncStraws(w.straws);
      if (typeof w.cups !== 'undefined') syncCups(w.cups);
      if (typeof w.suctions !== 'undefined') syncSuctions(w.suctions);
      if (typeof w.widerStraws !== 'undefined') syncWiderStraws(w.widerStraws);
      if (typeof w.betterCups !== 'undefined') syncBetterCups(w.betterCups);
      if (typeof w.fasterDrinks !== 'undefined') syncFasterDrinks(w.fasterDrinks);
      if (typeof w.criticalClicks !== 'undefined') syncCriticalClicks(w.criticalClicks);
      if (typeof w.criticalClickChance !== 'undefined')
        syncCriticalClickChance(w.criticalClickChance);
      if (typeof w.criticalClickMultiplier !== 'undefined')
        syncCriticalClickMultiplier(w.criticalClickMultiplier);
      if (typeof w.suctionClickBonus !== 'undefined') syncSuctionClickBonus(w.suctionClickBonus);
      if (typeof w.sps !== 'undefined') syncSps(w.sps);
      if (typeof w.drinkRate !== 'undefined') setDrinkRate(w.drinkRate);
      if (typeof w.drinkProgress !== 'undefined') setDrinkProgress(w.drinkProgress);
      if (typeof w.lastDrinkTime !== 'undefined') setLastDrinkTime(w.lastDrinkTime);
      if (typeof w.level !== 'undefined') setLevel(w.level);
    } catch (error) {
      console.warn('State bridge auto-sync failed:', error);
    }
  }

  return {
    init,
    setDrinkRate,
    setDrinkProgress,
    setLastDrinkTime,
    setLevel,
    syncSips,
    syncStraws,
    syncCups,
    syncSuctions,
    syncWiderStraws,
    syncBetterCups,
    syncFasterDrinks,
    syncCriticalClicks,
    syncSps,
    syncStrawSPD,
    syncCupSPD,
    autoSync,
  };
}

// Expose globally for legacy bootstrap
try {
  (window as any).createStateBridge = createStateBridge;
} catch (error) {
  console.warn('Failed to expose state bridge globally:', error);
}
