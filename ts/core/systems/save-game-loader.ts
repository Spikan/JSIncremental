// Save Game Loading System
// Handles loading and restoring game state from save data

import { getStoreActions } from '../state/zustand-store';
import { errorHandler } from '../error-handling/error-handler';
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
  totalClicks?: number | string | any;
  gameStartDate?: number | string | any;
  lastClickTime?: number | string | any;
  totalPlayTime?: number | string | any;
  lastDrinkTime?: number | string | any;
  drinkProgress?: number | string | any;
  // SPD values for extreme value preservation
  spd?: number | string | any;
  strawSPD?: number | string | any;
  cupSPD?: number | string | any;
  // Options including Konami code state
  options?: any;
  // Hybrid level system data
  hybridLevelData?: {
    currentLevel?: number;
    unlockedLevels?: number[];
  };
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

      // Load options (including Konami code state)
      this.loadOptions(savegame);

      // Load hybrid level system data
      this.loadHybridLevelData(savegame);

      console.log('✅ Game state loaded successfully');
    } catch (error) {
      errorHandler.handleError(error, 'loadGameState', { savegame });
      throw error;
    }
  }

  /**
   * Load basic resources (sips, straws, cups, suctions)
   */
  private loadBasicResources(savegame: SaveGameData): void {
    try {
      if (typeof savegame.sips !== 'undefined') {
        // Use parseDecimalValue to preserve extreme values
        const sipsValue = this.parseDecimalValue(savegame.sips);
        getStoreActions().setSips(sipsValue);
        // Global state removed - using Zustand store only
      }

      if (typeof savegame.straws !== 'undefined') {
        const strawsValue = this.parseDecimalValue(savegame.straws);
        getStoreActions().setStraws(strawsValue);
        // Global state removed - using Zustand store only
      }

      if (typeof savegame.cups !== 'undefined') {
        const cupsValue = this.parseDecimalValue(savegame.cups);
        getStoreActions().setCups(cupsValue);
        // Global state removed - using Zustand store only
      }

      if (typeof savegame.suctions !== 'undefined') {
        const suctionsValue = this.parseDecimalValue(savegame.suctions);
        getStoreActions().setSuctions(suctionsValue);
        // Global state removed - using Zustand store only
      }

      // Load SPD values to preserve extreme values - CRITICAL: Use parseDecimalValue to preserve precision
      if (typeof savegame.spd !== 'undefined') {
        const spdValue = this.parseDecimalValue(savegame.spd);
        getStoreActions().setSPD(spdValue);
        // Global state removed - using Zustand store only
      }

      if (typeof savegame.strawSPD !== 'undefined') {
        const strawSPDValue = this.parseDecimalValue(savegame.strawSPD);
        getStoreActions().setStrawSPD(strawSPDValue);
        // Global state removed - using Zustand store only
      }

      if (typeof savegame.cupSPD !== 'undefined') {
        const cupSPDValue = this.parseDecimalValue(savegame.cupSPD);
        getStoreActions().setCupSPD(cupSPDValue);
        // Global state removed - using Zustand store only
      }
    } catch (error) {
      errorHandler.handleError(error, 'loadBasicResources', { savegame });
    }
  }

  /**
   * Load upgrade levels
   */
  private loadUpgradeLevels(savegame: SaveGameData): void {
    try {
      if (typeof savegame.fasterDrinks !== 'undefined') {
        const fasterDrinksValue = this.parseDecimalValue(savegame.fasterDrinks);
        getStoreActions().setFasterDrinks(fasterDrinksValue);
        // Global state removed - using Zustand store only
      }

      if (typeof savegame.widerStraws !== 'undefined') {
        const widerStrawsValue = this.parseDecimalValue(savegame.widerStraws);
        getStoreActions().setWiderStraws(widerStrawsValue);
        // Global state removed - using Zustand store only
      }

      if (typeof savegame.betterCups !== 'undefined') {
        const betterCupsValue = this.parseDecimalValue(savegame.betterCups);
        getStoreActions().setBetterCups(betterCupsValue);
        // Global state removed - using Zustand store only
      }
    } catch (error) {
      errorHandler.handleError(error, 'loadUpgradeLevels', { savegame });
    }
  }

  /**
   * Load critical click system data
   */
  private loadCriticalClickSystem(savegame: SaveGameData): void {
    try {
      if (typeof savegame.suctionClickBonus !== 'undefined') {
        const bonusValue = this.parseDecimalValue(savegame.suctionClickBonus);
        getStoreActions().setSuctionClickBonus(bonusValue);
      }
    } catch (error) {
      errorHandler.handleError(error, 'loadCriticalClickSystem', { savegame });
    }
  }

  /**
   * Load level and progress data
   */
  private loadLevelAndProgress(savegame: SaveGameData): void {
    try {
      // Level is now handled by hybrid level system, skip old level loading
      // Only load totalClicks for progress tracking
      if (typeof savegame.totalClicks !== 'undefined') {
        const totalClicksValue = this.parseDecimalValue(savegame.totalClicks);
        getStoreActions().setTotalClicks(totalClicksValue);
      }
    } catch (error) {
      errorHandler.handleError(error, 'loadLevelAndProgress', { savegame });
    }
  }

  /**
   * Load timing and session data
   */
  private loadTimingData(savegame: SaveGameData): void {
    try {
      if (typeof savegame.gameStartDate !== 'undefined') {
        const gameStartDateValue = this.parseDecimalValue(savegame.gameStartDate);
        // Convert to number for timing compatibility
        const dateNum =
          typeof gameStartDateValue === 'number'
            ? gameStartDateValue
            : gameStartDateValue.toNumber();
        getStoreActions().setSessionStartTime(dateNum);
      }

      if (typeof savegame.lastClickTime !== 'undefined') {
        const lastClickTimeValue = this.parseDecimalValue(savegame.lastClickTime);
        // Convert to number for timing compatibility
        const timeNum =
          typeof lastClickTimeValue === 'number'
            ? lastClickTimeValue
            : lastClickTimeValue.toNumber();
        getStoreActions().setState({ lastClickTime: timeNum });
      }

      if (typeof savegame.totalPlayTime !== 'undefined') {
        const totalPlayTimeValue = this.parseDecimalValue(savegame.totalPlayTime);
        // Convert to number for timing compatibility
        const playTimeNum =
          typeof totalPlayTimeValue === 'number'
            ? totalPlayTimeValue
            : totalPlayTimeValue.toNumber();
        getStoreActions().setTotalPlayTime(playTimeNum);
      }
    } catch (error) {
      errorHandler.handleError(error, 'loadTimingData', { savegame });
    }
  }

  /**
   * Parse decimal value with fallback - handles Decimal and Decimal objects
   * CRITICAL: This function should NEVER truncate extreme values - preserve them as Decimals
   */
  private parseDecimalValue(value: any, defaultValue: number = 0): any {
    if (value === null || value === undefined) return defaultValue;

    // For regular numbers within safe range, return as number
    if (typeof value === 'number') {
      if (isFinite(value) && Math.abs(value) < 1e15) {
        return value;
      }
      // For extreme numbers, convert to Decimal to preserve precision
      return new (window as any).Decimal(value);
    }

    // For strings, try to parse but preserve extreme values as Decimal
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) return defaultValue;
      if (isFinite(parsed) && Math.abs(parsed) < 1e15) {
        return parsed;
      }
      // For extreme string values, convert to Decimal
      return new (window as any).Decimal(value);
    }

    // Handle objects with toNumber method (Decimal.js, Decimal)
    if (value && typeof value.toNumber === 'function') {
      try {
        const num = value.toNumber();
        if (isFinite(num) && Math.abs(num) < 1e15) {
          return num;
        }
        // CRITICAL FIX: For extreme values, return the Decimal object itself, don't truncate!
        return value;
      } catch (error) {
        errorHandler.handleError(error, 'parseDecimalValue', {
          value: value?.toString(),
          defaultValue,
        });
        return defaultValue;
      }
    }

    // Handle serialized Decimal objects (might have _value property)
    if (value && typeof value._value !== 'undefined') {
      const num = Number(value._value);
      if (isFinite(num) && Math.abs(num) < 1e15) {
        return num;
      }
      // For extreme values, reconstruct as Decimal
      return new (window as any).Decimal(value._value);
    }

    // Handle objects with value property (alternative serialization format)
    if (value && typeof value.value !== 'undefined') {
      const num = Number(value.value);
      if (isFinite(num) && Math.abs(num) < 1e15) {
        return num;
      }
      // For extreme values, reconstruct as Decimal
      return new (window as any).Decimal(value.value);
    }

    // Handle arrays (some serialization might convert to arrays)
    if (Array.isArray(value) && value.length > 0) {
      const num = Number(value[0]);
      if (isFinite(num) && Math.abs(num) < 1e15) {
        return num;
      }
      // For extreme values, reconstruct as Decimal
      return new (window as any).Decimal(value[0]);
    }

    return defaultValue;
  }

  /**
   * Load options including Konami code state
   */
  private loadOptions(savegame: SaveGameData): void {
    try {
      if (savegame.options && typeof savegame.options === 'object') {
        // Load options into the state
        getStoreActions().setState({ options: savegame.options });

        // Also save to the options system for persistence
        try {
          // Modernized - options save handled by store
        } catch (error) {
          errorHandler.handleError(error, 'saveOptionsToOptionsSystem', {
            options: savegame.options,
          });
        }

        console.log('✅ Options loaded:', {
          secretsUnlocked: savegame.options.secretsUnlocked,
          godTabEnabled: savegame.options.godTabEnabled,
        });
      }
    } catch (error) {
      errorHandler.handleError(error, 'loadOptions', { savegame });
    }
  }

  /**
   * Load hybrid level system data
   */
  private loadHybridLevelData(savegame: SaveGameData): void {
    try {
      if (savegame.hybridLevelData) {
        const { currentLevel, unlockedLevels } = savegame.hybridLevelData;

        // Restore hybrid level system state
        // Modernized - hybrid system handled by store
        // Hybrid system access modernized - using direct import
        const { hybridLevelSystem } = require('./hybrid-level-system');
        const hybridSystem = hybridLevelSystem;
        if (hybridSystem && typeof hybridSystem.restoreState === 'function') {
          // Ensure level 1 is always unlocked
          const levelsToRestore = [...new Set([1, ...(unlockedLevels || [])])];
          const levelToRestore = currentLevel || 1;

          hybridSystem.restoreState(levelToRestore, levelsToRestore);

          // Update UI displays after restoring hybrid level state
          try {
            // Modernized - UI updates handled by store
            // Modernized - UI updates handled by store
          } catch (error) {
            errorHandler.handleError(error, 'updateUIDisplaysAfterHybridLevelRestoration');
          }
        } else {
          errorHandler.handleError(
            new Error('Hybrid level system not available'),
            'hybridLevelStateRestoration',
            { severity: 'low' }
          );
        }
      } else {
        // No hybrid level data in save, apply default theme
        try {
          // Modernized - hybrid level system handled by store
        } catch (error) {
          errorHandler.handleError(error, 'applyDefaultTheme');
        }
      }
    } catch (error) {
      errorHandler.handleError(error, 'loadHybridLevelData');
    }
  }

  /**
   * Emit game loaded event
   */
  public emitGameLoadedEvent(hasSaveData: boolean): void {
    try {
      // Modernized - event emission handled by store
      console.log('Game loaded event modernized:', {
        save: hasSaveData,
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitGameLoadedEvent');
    }
  }
}

// Export singleton instance
export const saveGameLoader = SaveGameLoader.getInstance();
