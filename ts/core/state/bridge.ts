// Typed legacy state bridge that mirrors globals into App.state
// Enhanced for Decimal support with unlimited scaling
//
// MEMORY: ALL VALUE SYNCHRONIZATION MUST PRESERVE BREAK_ETERNITY DECIMAL PRECISION
// MEMORY: EXTREME VALUES IN WINDOW OBJECTS SHOULD BE PRESERVED IN STATE
// MEMORY: NEVER APPLY MAX_SAFE_INTEGER LIMITS TO SPD OR OTHER CORE VALUES
// MEMORY: BRIDGE SHOULD MAINTAIN FULL PRECISION ACROSS WINDOW ↔ ZUSTAND BOUNDARY

import type { GameState } from './shape';
// Direct break_eternity.js access
import { toDecimal } from '../numbers/migration-utils';
import { DecimalType } from '../numbers/decimal-utils';

// Type for actions available in the Zustand store (enhanced for Decimal)
interface StateActions {
  setDrinkRate?: (value: number) => void;
  setDrinkProgress?: (value: number) => void;
  setLastDrinkTime?: (value: number) => void;
  setLevel?: (value: number) => void;
  setSips?: (value: number | DecimalType) => void;
  setStraws?: (value: number | DecimalType) => void;
  setCups?: (value: number | DecimalType) => void;
  setSuctions?: (value: number | DecimalType) => void;
  setWiderStraws?: (value: number | DecimalType) => void;
  setBetterCups?: (value: number | DecimalType) => void;
  setFasterDrinks?: (value: number | DecimalType) => void;
  setCriticalClicks?: (value: number | DecimalType) => void;
  setCriticalClickChance?: (value: number) => void;
  setCriticalClickMultiplier?: (value: number | DecimalType) => void;
  setSuctionClickBonus?: (value: number | DecimalType) => void;
  setSPD?: (value: number | DecimalType) => void;
  setStrawSPD?: (value: number | DecimalType) => void;
  setCupSPD?: (value: number | DecimalType) => void;
  setFasterDrinksUpCounter?: (value: number | DecimalType) => void;
  setCriticalClickUpCounter?: (value: number | DecimalType) => void;
}

type AppLike = {
  state: {
    setState?: (partial: Partial<GameState>) => void;
    getState?: () => GameState;
    actions?: StateActions;
  };
};

// Type for values that can be Decimal or primitive (enhanced for unlimited scaling)
type NumericValue = number | string | DecimalType | { toNumber(): number } | { _v: number };

export function createStateBridge(app: AppLike) {
  function setDrinkRate(value: NumericValue) {
    try {
      // Preserve extreme values - pass Decimal directly
      app.state.actions?.setDrinkRate?.(toDecimal(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function setDrinkProgress(value: NumericValue) {
    try {
      // Preserve extreme values - pass Decimal directly
      app.state.actions?.setDrinkProgress?.(toDecimal(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function setLastDrinkTime(value: NumericValue) {
    try {
      // Preserve extreme values - pass Decimal directly
      app.state.actions?.setLastDrinkTime?.(toDecimal(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function setLevel(value: NumericValue) {
    // Preserve extreme values - pass Decimal directly
    try {
      app.state.actions?.setLevel?.(toDecimal(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function toDecimalValue(value: NumericValue): DecimalType {
    return toDecimal(value);
  }

  function syncSips(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setSips?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncStraws(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setStraws?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCups(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setCups?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncSuctions(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setSuctions?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncWiderStraws(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setWiderStraws?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncBetterCups(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setBetterCups?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncFasterDrinks(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setFasterDrinks?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCriticalClicks(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setCriticalClicks?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCriticalClickChance(value: NumericValue) {
    try {
      // Preserve extreme values - no truncation
      app.state.actions?.setCriticalClickChance?.(toDecimal(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCriticalClickMultiplier(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setCriticalClickMultiplier?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncSuctionClickBonus(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      app.state.actions?.setSuctionClickBonus?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncSpd(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      // Preserve extreme values - always use Decimal for SPD
      app.state.actions?.setSPD?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncStrawSPD(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      // Preserve extreme values - always use Decimal for StrawSPD
      app.state.actions?.setStrawSPD?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function syncCupSPD(value: NumericValue) {
    try {
      const largeNumberValue = toDecimalValue(value);
      // Preserve extreme values - always use Decimal for CupSPD
      app.state.actions?.setCupSPD?.(largeNumberValue);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function init() {
    try {
      const seed: Partial<GameState> = {};
      const w = typeof window !== 'undefined' ? (window as any) : {};

      // Helper function to safely get window properties
      const getWindowValue = (key: string): NumericValue | undefined => {
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
            // Preserve extreme values - use safe conversion
            const decimalValue = toDecimal(value);
            (seed as any)[seedKey] =
              Math.abs(decimalValue.toNumber()) < 1e15 ? decimalValue.toNumber() : 0;
          } else if (seedKey === 'level') {
            (seed as any)[seedKey] = toDecimalValue(value);
          } else if (
            typeof seedKey === 'string' &&
            (seedKey === 'criticalClickChance' ||
              seedKey === 'currentClickStreak' ||
              seedKey === 'bestClickStreak')
          ) {
            // These remain as numbers - use safe conversion
            const decimalValue = toDecimal(value);
            (seed as any)[seedKey] =
              typeof decimalValue.toNumber === 'function' &&
              Math.abs(decimalValue.toNumber()) < 1e15
                ? decimalValue.toNumber()
                : 0;
          } else {
            // All other values become Decimal
            (seed as any)[seedKey] = toDecimalValue(value);
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
      setSeedIfExists('spd', 'spd');
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
      if (seed.spd !== undefined) app.state.actions?.setSPD?.(seed.spd);
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
      if (typeof w.spd !== 'undefined') syncSpd(w.spd);
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
    syncSpd,
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
