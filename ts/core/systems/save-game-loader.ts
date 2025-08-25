// Save Game Loading System
// Handles loading and restoring game state from save data

import { storeActions } from '../state/zustand-store';
// DecimalOps removed - no longer using toSafeNumber

export interface SaveGameData {
  sips?: number | string | any;
  straws?: number | string | any;
  cups?: number | string | any;
  suctions?: number | string | any;
  widerStraws?: number | string | any;
  betterCups?: number | string | any;
  fasterDrinks?: number | string | any;
  criticalClickChance?: number | string | any;
  criticalClickMultiplier?: number | string | any;
  criticalClicks?: number | string | any;
  criticalClickUpCounter?: number | string | any;
  suctionClickBonus?: number | string | any;
  level?: number | string | any;
  totalClicks?: number | string | any;
  gameStartDate?: number | string | any;
  lastClickTime?: number | string | any;
  totalPlayTime?: number | string | any;
  lastDrinkTime?: number | string | any;
  drinkProgress?: number | string | any;
}

export class SaveGameLoader {
  private static instance: SaveGameLoader;

  public static getInstance(): SaveGameLoader {
    if (!SaveGameLoader.instance) {
      SaveGameLoader.instance = new SaveGameLoader();
    }
    return SaveGameLoader.instance;
  }

  /**
   * Load game state from save data
   */
  public loadGameState(savegame: SaveGameData | null): void {
    if (!savegame || typeof savegame.sips === 'undefined' || savegame.sips === null) {
      console.log('No save game data found, starting fresh');
      return;
    }

    try {
      console.log('Loading game state from save data...');

      // Load basic resources
      this.loadBasicResources(savegame);

      // Load upgrade levels
      this.loadUpgradeLevels(savegame);

      // Load critical click system
      this.loadCriticalClickSystem(savegame);

      // Load level and progress
      this.loadLevelAndProgress(savegame);

      // Load timing data
      this.loadTimingData(savegame);

      console.log('✅ Game state loaded successfully');
    } catch (error) {
      console.error('❌ Error loading game state:', error);
      throw error;
    }
  }

  /**
   * Load basic resources (sips, straws, cups, suctions)
   */
  private loadBasicResources(savegame: SaveGameData): void {
    try {
      if (typeof savegame.sips !== 'undefined') {
        // Pass through raw to let store convert to Decimal safely
        storeActions.setSips(savegame.sips as any);
        (window as any).sips = new (window as any).Decimal(String(savegame.sips));
      }

      if (typeof savegame.straws !== 'undefined') {
        storeActions.setStraws(savegame.straws as any);
        (window as any).straws = new (window as any).Decimal(String(savegame.straws));
      }

      if (typeof savegame.cups !== 'undefined') {
        storeActions.setCups(savegame.cups as any);
        (window as any).cups = new (window as any).Decimal(String(savegame.cups));
      }

      if (typeof savegame.suctions !== 'undefined') {
        storeActions.setSuctions(savegame.suctions as any);
        (window as any).suctions = new (window as any).Decimal(String(savegame.suctions));
      }
    } catch (error) {
      console.warn('Failed to load basic resources:', error);
    }
  }

  /**
   * Load upgrade levels
   */
  private loadUpgradeLevels(savegame: SaveGameData): void {
    try {
      if (typeof savegame.fasterDrinks !== 'undefined') {
        storeActions.setFasterDrinks(savegame.fasterDrinks as any);
        (window as any).fasterDrinks = new (window as any).Decimal(String(savegame.fasterDrinks));
      }

      if (typeof savegame.widerStraws !== 'undefined') {
        storeActions.setWiderStraws(savegame.widerStraws as any);
        (window as any).widerStraws = new (window as any).Decimal(String(savegame.widerStraws));
      }

      if (typeof savegame.betterCups !== 'undefined') {
        storeActions.setBetterCups(savegame.betterCups as any);
        (window as any).betterCups = new (window as any).Decimal(String(savegame.betterCups));
      }
    } catch (error) {
      console.warn('Failed to load upgrade levels:', error);
    }
  }

  /**
   * Load critical click system data
   */
  private loadCriticalClickSystem(savegame: SaveGameData): void {
    try {
      if (typeof savegame.criticalClickChance !== 'undefined') {
        const chanceValue = this.parseDecimalValue(savegame.criticalClickChance, 0.001);
        storeActions.setCriticalClickChance(chanceValue);
        (window as any).criticalClickChance = new (window as any).Decimal(chanceValue);
      }

      if (typeof savegame.criticalClickMultiplier !== 'undefined') {
        const multiplierValue = this.parseDecimalValue(savegame.criticalClickMultiplier, 5);
        storeActions.setCriticalClickMultiplier(multiplierValue);
        (window as any).criticalClickMultiplier = new (window as any).Decimal(multiplierValue);
      }

      if (typeof savegame.criticalClicks !== 'undefined') {
        const criticalClicksValue = this.parseDecimalValue(savegame.criticalClicks);
        storeActions.setCriticalClicks(criticalClicksValue);
        (window as any).criticalClicks = new (window as any).Decimal(criticalClicksValue);
      }

      if (typeof savegame.suctionClickBonus !== 'undefined') {
        const bonusValue = this.parseDecimalValue(savegame.suctionClickBonus);
        storeActions.setSuctionClickBonus(bonusValue);
      }
    } catch (error) {
      console.warn('Failed to load critical click system:', error);
    }
  }

  /**
   * Load level and progress data
   */
  private loadLevelAndProgress(savegame: SaveGameData): void {
    try {
      if (typeof savegame.level !== 'undefined') {
        const levelValue = Math.max(1, this.parseDecimalValue(savegame.level, 1));
        storeActions.setLevel(levelValue);
        (window as any).level = new (window as any).Decimal(levelValue);

        try {
          (window as any).App?.stateBridge?.setLevel(levelValue);
        } catch (error) {
          console.warn('Failed to set level via bridge:', error);
        }
      }

      if (typeof savegame.totalClicks !== 'undefined') {
        const totalClicksValue = this.parseDecimalValue(savegame.totalClicks);
        storeActions.setTotalClicks(totalClicksValue);
      }
    } catch (error) {
      console.warn('Failed to load level and progress:', error);
    }
  }

  /**
   * Load timing and session data
   */
  private loadTimingData(savegame: SaveGameData): void {
    try {
      if (typeof savegame.gameStartDate !== 'undefined') {
        const gameStartDateValue = this.parseDecimalValue(savegame.gameStartDate);
        storeActions.setSessionStartTime(gameStartDateValue);
      }

      if (typeof savegame.lastClickTime !== 'undefined') {
        const lastClickTimeValue = this.parseDecimalValue(savegame.lastClickTime);
        storeActions.setState({ lastClickTime: lastClickTimeValue });
      }

      if (typeof savegame.totalPlayTime !== 'undefined') {
        const totalPlayTimeValue = this.parseDecimalValue(savegame.totalPlayTime);
        storeActions.setTotalPlayTime(totalPlayTimeValue);
      }
    } catch (error) {
      console.warn('Failed to load timing data:', error);
    }
  }

  /**
   * Parse decimal value with fallback - handles Decimal and Decimal objects
   */
  private parseDecimalValue(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined) return defaultValue;

    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || defaultValue;

    // Handle objects with toNumber method (Decimal.js, Decimal)
    if (value && typeof value.toNumber === 'function') {
      try {
        // Preserve extreme values
        return value.toNumber();
      } catch (error) {
        console.warn('Failed to get number from object:', error);
      }
    }

    // Handle serialized Decimal objects (might have _value property)
    if (value && typeof value._value !== 'undefined') {
      return Number(value._value) || defaultValue;
    }

    // Handle objects with value property (alternative serialization format)
    if (value && typeof value.value !== 'undefined') {
      return Number(value.value) || defaultValue;
    }

    // Handle arrays (some serialization might convert to arrays)
    if (Array.isArray(value) && value.length > 0) {
      return Number(value[0]) || defaultValue;
    }

    return defaultValue;
  }

  /**
   * Emit game loaded event
   */
  public emitGameLoadedEvent(hasSaveData: boolean): void {
    try {
      (window as any).App?.events?.emit?.((window as any).App?.EVENT_NAMES?.GAME?.LOADED, {
        save: hasSaveData,
      });
    } catch (error) {
      console.warn('Failed to emit game loaded event:', error);
    }
  }
}

// Export singleton instance
export const saveGameLoader = SaveGameLoader.getInstance();
