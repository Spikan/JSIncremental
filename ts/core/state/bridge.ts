// Typed legacy state bridge that mirrors globals into App.state

type AppLike = {
  state: {
    setState?: (_partial: any) => void;
    getState?: () => any;
    actions?: any; // Zustand actions
  };
};

export function createStateBridge(app: AppLike) {
  function setDrinkRate(value: any) {
    try {
      app.state.actions?.setDrinkRate?.(Number(value) || 0);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function setDrinkProgress(value: any) {
    try {
      app.state.actions?.setDrinkProgress?.(Number(value) || 0);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function setLastDrinkTime(value: any) {
    try {
      app.state.actions?.setLastDrinkTime?.(Number(value) || 0);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function setLevel(value: any) {
    const numeric =
      value && typeof value.toNumber === 'function' ? value.toNumber() : Number(value) || 1;
    try {
      app.state.actions?.setLevel?.(numeric);
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function toNum(value: any): number {
    return value && typeof value.toNumber === 'function' ? value.toNumber() : Number(value) || 0;
  }

  function syncSips(value: any) {
    try {
      app.state.actions?.setSips?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncStraws(value: any) {
    try {
      app.state.actions?.setStraws?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncCups(value: any) {
    try {
      app.state.actions?.setCups?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncSuctions(value: any) {
    try {
      app.state.actions?.setSuctions?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncWiderStraws(value: any) {
    try {
      app.state.actions?.setWiderStraws?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncBetterCups(value: any) {
    try {
      app.state.actions?.setBetterCups?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncFasterDrinks(value: any) {
    try {
      app.state.actions?.setFasterDrinks?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncCriticalClicks(value: any) {
    try {
      app.state.actions?.setCriticalClicks?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncCriticalClickChance(value: any) {
    try {
      app.state.actions?.setCriticalClickChance?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncCriticalClickMultiplier(value: any) {
    try {
      app.state.actions?.setCriticalClickMultiplier?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncSuctionClickBonus(value: any) {
    try {
      app.state.actions?.setSuctionClickBonus?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncSps(value: any) {
    try {
      app.state.actions?.setSPS?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncStrawSPD(value: any) {
    try {
      app.state.actions?.setStrawSPD?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }
  function syncCupSPD(value: any) {
    try {
      app.state.actions?.setCupSPD?.(toNum(value));
    } catch (error) {
      console.warn('State bridge operation failed:', error);
    }
  }

  function init() {
    try {
      const seed: any = {};
      const w: any = typeof window !== 'undefined' ? window : {};
      if (typeof w.drinkRate !== 'undefined') seed.drinkRate = Number(w.drinkRate) || 0;
      if (typeof w.drinkProgress !== 'undefined') seed.drinkProgress = Number(w.drinkProgress) || 0;
      if (typeof w.lastDrinkTime !== 'undefined') seed.lastDrinkTime = Number(w.lastDrinkTime) || 0;
      if (typeof w.level !== 'undefined')
        seed.level =
          typeof w.level?.toNumber === 'function' ? w.level.toNumber() : Number(w.level) || 1;
      if (typeof w.sips !== 'undefined') seed.sips = toNum(w.sips);
      if (typeof w.straws !== 'undefined') seed.straws = toNum(w.straws);
      if (typeof w.cups !== 'undefined') seed.cups = toNum(w.cups);
      if (typeof w.suctions !== 'undefined') seed.suctions = toNum(w.suctions);
      if (typeof w.widerStraws !== 'undefined') seed.widerStraws = toNum(w.widerStraws);
      if (typeof w.betterCups !== 'undefined') seed.betterCups = toNum(w.betterCups);
      if (typeof w.fasterDrinks !== 'undefined') seed.fasterDrinks = toNum(w.fasterDrinks);
      if (typeof w.criticalClicks !== 'undefined') seed.criticalClicks = toNum(w.criticalClicks);
      if (typeof w.criticalClickChance !== 'undefined')
        seed.criticalClickChance = toNum(w.criticalClickChance);
      if (typeof w.criticalClickMultiplier !== 'undefined')
        seed.criticalClickMultiplier = toNum(w.criticalClickMultiplier);
      if (typeof w.suctionClickBonus !== 'undefined')
        seed.suctionClickBonus = toNum(w.suctionClickBonus);
      if (typeof w.fasterDrinksUpCounter !== 'undefined')
        seed.fasterDrinksUpCounter = toNum(w.fasterDrinksUpCounter);
      if (typeof w.criticalClickUpCounter !== 'undefined')
        seed.criticalClickUpCounter = toNum(w.criticalClickUpCounter);
      if (typeof w.sps !== 'undefined') seed.sps = toNum(w.sps);
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
