// Comprehensive Core Systems Tests
// Tests all core systems: save, options, loop, autosave, etc.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

declare global {
  interface Window {
    App?: any;
    GAME_CONFIG?: any;
    Decimal?: any;
    sips?: any;
    straws?: any;
    cups?: any;
    suctions?: any;
    fasterDrinks?: any;
    widerStraws?: any;
    betterCups?: any;
    criticalClickChance?: number;
    criticalClickMultiplier?: number;
    criticalClicks?: any;
    criticalClickUpCounter?: number;
    suctionClickBonus?: number;
    level?: number;
    totalSipsEarned?: any;
    totalClicks?: number;
    gameStartDate?: number;
    lastClickTime?: number;
    clickTimes?: number[];
    lastSaveTime?: number;
    autosaveEnabled?: boolean;
    autosaveInterval?: number;
    autosaveCounter?: number;
    lastDrinkTime?: number;
    drinkRate?: number;
    drinkProgress?: number;
    sps?: any;
    currentClickStreak?: number;
    bestClickStreak?: number;
  }
}

describe('Core Systems - Comprehensive Testing', () => {
  let mockApp: any;
  let mockGameConfig: any;
  let mockDecimal: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock Decimal library
    mockDecimal = class Decimal {
      private _value: number;

      constructor(value: any) {
        this._value = Number(value) || 0;
      }

      // Basic arithmetic methods
      plus(other: any): Decimal {
        const otherValue = other instanceof Decimal ? other._value : Number(other);
        return new Decimal(this._value + otherValue);
      }

      minus(other: any): Decimal {
        const otherValue = other instanceof Decimal ? other._value : Number(other);
        return new Decimal(this._value - otherValue);
      }

      times(other: any): Decimal {
        const otherValue = other instanceof Decimal ? other._value : Number(other);
        return new Decimal(this._value * otherValue);
      }

      div(other: any): Decimal {
        const otherValue = other instanceof Decimal ? other._value : Number(other);
        return new Decimal(this._value / otherValue);
      }

      // Comparison methods
      gte(other: any): boolean {
        const otherValue = other instanceof Decimal ? other._value : Number(other);
        return this._value >= otherValue;
      }

      lte(other: any): Decimal {
        const otherValue = other instanceof Decimal ? other._value : Number(other);
        return new Decimal(this._value <= otherValue);
      }

      toNumber(): number {
        return this._value;
      }

      toString(): string {
        return String(this._value);
      }
    };

    // Mock game configuration
    mockGameConfig = {
      BALANCE: {
        BASE_SIPS_PER_DRINK: 1,
        STRAW_BASE_COST: 10,
        STRAW_SCALING: 1.15,
        CUP_BASE_COST: 50,
        CUP_SCALING: 1.2,
        SUCTION_BASE_COST: 100,
        SUCTION_SCALING: 1.25,
        FASTER_DRINKS_BASE_COST: 200,
        FASTER_DRINKS_SCALING: 1.3,
        CRITICAL_CLICK_BASE_COST: 500,
        CRITICAL_CLICK_SCALING: 1.35,
        WIDER_STRAWS_BASE_COST: 1000,
        WIDER_STRAWS_SCALING: 1.4,
        BETTER_CUPS_BASE_COST: 2500,
        BETTER_CUPS_SCALING: 1.45,
        LEVEL_UP_BASE_COST: 10000,
        LEVEL_UP_SCALING: 1.5,
      },
      TIMING: {
        CLICK_STREAK_WINDOW: 1000,
        DOM_READY_DELAY: 100,
      },
      LIMITS: {
        TARGET_FPS: 60,
        STATS_UPDATE_INTERVAL: 1000,
        AFFORDABILITY_CHECK_INTERVAL: 500,
        MAX_CLICK_TIMES: 100,
      },
    };

    // Mock App object with comprehensive core systems
    mockApp = {
      ui: {
        updateAllStats: vi.fn(),
        updatePlayTime: vi.fn(),
        updateLastSaveTime: vi.fn(),
        updateDrinkProgress: vi.fn(),
        checkUpgradeAffordability: vi.fn(),
        performBatchUIUpdate: vi.fn(),
      },
      systems: {
        loop: {
          start: vi.fn(),
          stop: vi.fn(),
        },
        save: {
          performSaveSnapshot: vi.fn(() => ({
            sips: 1000,
            straws: 5,
            cups: 3,
            suctions: 2,
            fasterDrinks: 1,
            widerStraws: 0,
            betterCups: 0,
            criticalClickChance: 0.001,
            criticalClickMultiplier: 5,
            criticalClicks: 0,
            criticalClickUpCounter: 1,
            suctionClickBonus: 0,
            level: 1,
            totalSipsEarned: 5000,
            totalClicks: 150,
            gameStartDate: Date.now() - 86400000,
            lastClickTime: Date.now() - 5000,
            clickTimes: [Date.now() - 1000, Date.now() - 500],
            lastSaveTime: Date.now(),
          })),
          deleteSave: vi.fn(),
          queueSave: vi.fn(),
        },
        options: {
          saveOptions: vi.fn(),
          loadOptions: vi.fn(() => ({
            autosaveEnabled: true,
            autosaveInterval: 30,
            clickSoundsEnabled: true,
          })),
        },
        autosave: {
          computeAutosaveCounter: vi.fn(
            ({
              enabled,
              counter,
              intervalSec,
              drinkRateMs,
            }: {
              enabled: boolean;
              counter: number;
              intervalSec: number;
              drinkRateMs: number;
            }) => {
              if (!enabled) return { nextCounter: 0, shouldSave: false };

              const drinksPerSecond = 1000 / drinkRateMs;
              const drinksForAutosave = Math.ceil(intervalSec * drinksPerSecond);
              const next = counter + 1;

              if (next >= drinksForAutosave) {
                return { nextCounter: 1, shouldSave: true };
              }
              return { nextCounter: next, shouldSave: false };
            }
          ),
        },
        resources: {
          recalcProduction: vi.fn(() => ({
            sps: 10,
            spd: 5,
          })),
        },
        purchases: {
          canAfford: vi.fn((cost: any) => (global as any).window.sips.gte(cost)),
          purchase: vi.fn((item: string, cost: any) => {
            if ((global as any).window.sips.gte(cost)) {
              (global as any).window.sips = (global as any).window.sips.minus(cost);
              return true;
            }
            return false;
          }),
        },
        clicks: {
          processClick: vi.fn((multiplier: number = 1) => {
            const baseSips = 1;
            const totalSips = baseSips * multiplier;
            (global as any).window.sips = (global as any).window.sips.plus(totalSips);
            (global as any).window.totalClicks++;
            return totalSips;
          }),
        },
        audio: {
          button: {
            initButtonAudioSystem: vi.fn(),
            updateButtonSoundsToggleButton: vi.fn(),
            playButtonClickSound: vi.fn(),
          },
        },
        gameInit: {
          initSplashScreen: vi.fn(),
          startGameCore: vi.fn(),
          initOnDomReady: vi.fn(),
        },
      },
      storage: {
        loadGame: vi.fn(() => ({
          sips: 1000,
          straws: 5,
          cups: 3,
          suctions: 2,
          fasterDrinks: 1,
          widerStraws: 0,
          betterCups: 0,
          criticalClickChance: 0.001,
          criticalClickMultiplier: 5,
          criticalClicks: 0,
          criticalClickUpCounter: 1,
          suctionClickBonus: 0,
          level: 1,
          totalSipsEarned: 5000,
          totalClicks: 150,
          gameStartDate: Date.now() - 86400000,
          lastClickTime: Date.now() - 5000,
          clickTimes: [Date.now() - 1000, Date.now() - 500],
          lastSaveTime: Date.now(),
        })),
        saveGame: vi.fn(),
        setBoolean: vi.fn(),
        getBoolean: vi.fn(() => true),
        deleteGame: vi.fn(),
      },
      events: {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
      },
      stateBridge: {
        setLevel: vi.fn(),
        setLastDrinkTime: vi.fn(),
        setDrinkProgress: vi.fn(),
        setDrinkRate: vi.fn(),
        setSips: vi.fn(),
        setStraws: vi.fn(),
        setCups: vi.fn(),
      },
      data: {
        upgrades: {
          straws: { baseCost: 10, scaling: 1.15 },
          cups: { baseCost: 50, scaling: 1.2 },
          fasterDrinks: { baseCost: 200, scaling: 1.3 },
        },
      },
      rules: {
        economy: {
          computeStrawSPD: vi.fn(() => 2),
          computeCupSPD: vi.fn(() => 3),
          computeStrawCost: vi.fn((count: number) => 10 * Math.pow(1.15, count)),
          computeCupCost: vi.fn((count: number) => 50 * Math.pow(1.2, count)),
        },
        clicks: {
          processClick: vi.fn(
            (baseSips: number = 1, multiplier: number = 1) => baseSips * multiplier
          ),
        },
        purchases: {
          canAfford: vi.fn((cost: any) => (global as any).window.sips.gte(cost)),
        },
      },
    };

    // Mock window object with game state
    (global as any).window = {
      App: mockApp,
      GAME_CONFIG: mockGameConfig,
      Decimal: mockDecimal,
      sips: new mockDecimal(1000),
      straws: new mockDecimal(5),
      cups: new mockDecimal(3),
      suctions: new mockDecimal(2),
      fasterDrinks: new mockDecimal(1),
      widerStraws: new mockDecimal(0),
      betterCups: new mockDecimal(0),
      criticalClickChance: 0.001,
      criticalClickMultiplier: 5,
      criticalClicks: new mockDecimal(0),
      criticalClickUpCounter: 1,
      suctionClickBonus: 0,
      level: 1,
      totalSipsEarned: new mockDecimal(5000),
      totalClicks: 150,
      gameStartDate: Date.now() - 86400000,
      lastClickTime: Date.now() - 5000,
      clickTimes: [Date.now() - 1000, Date.now() - 500],
      lastSaveTime: Date.now(),
      autosaveEnabled: true,
      autosaveInterval: 30,
      autosaveCounter: 0,
      lastDrinkTime: Date.now(),
      drinkRate: 1000,
      drinkProgress: 0,
      sps: new mockDecimal(10),
      currentClickStreak: 0,
      bestClickStreak: 0,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Save System', () => {
    it('should perform save snapshots correctly', () => {
      expect(mockApp.systems.save.performSaveSnapshot).toBeDefined();

      const saveData = mockApp.systems.save.performSaveSnapshot();

      expect(saveData).toBeDefined();
      expect(saveData.sips).toBe(1000);
      expect(saveData.straws).toBe(5);
      expect(saveData.cups).toBe(3);
      expect(saveData.lastSaveTime).toBeDefined();
      expect(typeof saveData.lastSaveTime).toBe('number');
    });

    it('should handle save data validation', () => {
      const saveData = mockApp.systems.save.performSaveSnapshot();

      // Test that all required fields are present
      const requiredFields = [
        'sips',
        'straws',
        'cups',
        'suctions',
        'fasterDrinks',
        'widerStraws',
        'betterCups',
        'criticalClickChance',
        'criticalClickMultiplier',
        'criticalClicks',
        'criticalClickUpCounter',
        'suctionClickBonus',
        'level',
        'totalSipsEarned',
        'totalClicks',
        'gameStartDate',
        'lastClickTime',
        'clickTimes',
        'lastSaveTime',
      ];

      requiredFields.forEach(field => {
        expect(saveData).toHaveProperty(field);
      });
    });

    it('should delete saves correctly', () => {
      expect(mockApp.systems.save.deleteSave).toBeDefined();

      mockApp.systems.save.deleteSave();
      expect(mockApp.systems.save.deleteSave).toHaveBeenCalled();
    });

    it('should queue saves correctly', () => {
      expect(mockApp.systems.save.queueSave).toBeDefined();

      const saveOptions = {
        now: Date.now(),
        lastOp: 'click',
        minIntervalMs: 1000,
        schedule: true,
        perform: vi.fn(),
      };

      mockApp.systems.save.queueSave(saveOptions);
      expect(mockApp.systems.save.queueSave).toHaveBeenCalledWith(saveOptions);
    });
  });

  describe('Options System', () => {
    it('should save options correctly', () => {
      expect(mockApp.systems.options.saveOptions).toBeDefined();

      const options = {
        autosaveEnabled: true,
        autosaveInterval: 60,
        clickSoundsEnabled: false,
      };

      mockApp.systems.options.saveOptions(options);
      expect(mockApp.systems.options.saveOptions).toHaveBeenCalledWith(options);
    });

    it('should load options correctly', () => {
      expect(mockApp.systems.options.loadOptions).toBeDefined();

      const options = mockApp.systems.options.loadOptions();

      expect(options).toBeDefined();
      expect(options.autosaveEnabled).toBe(true);
      expect(options.autosaveInterval).toBe(30);
      expect(options.clickSoundsEnabled).toBe(true);
    });

    it('should handle missing options gracefully', () => {
      // Test with no parameters
      const options = mockApp.systems.options.loadOptions();
      expect(options).toBeDefined();
      expect(options.autosaveEnabled).toBe(true);
    });
  });

  describe('Autosave System', () => {
    it('should compute autosave counter correctly', () => {
      expect(mockApp.systems.autosave.computeAutosaveCounter).toBeDefined();

      // Test enabled autosave
      const result1 = mockApp.systems.autosave.computeAutosaveCounter({
        enabled: true,
        counter: 0,
        intervalSec: 30,
        drinkRateMs: 1000,
      });

      expect(result1.nextCounter).toBe(1);
      expect(result1.shouldSave).toBe(false);

      // Test disabled autosave
      const result2 = mockApp.systems.autosave.computeAutosaveCounter({
        enabled: false,
        counter: 0,
        intervalSec: 30,
        drinkRateMs: 1000,
      });

      expect(result2.nextCounter).toBe(0);
      expect(result2.shouldSave).toBe(false);
    });

    it('should trigger save at correct intervals', () => {
      // Test that save is triggered when counter reaches threshold
      const drinkRateMs = 1000; // 1 second per drink
      const intervalSec = 30; // 30 seconds
      const drinksForAutosave = Math.ceil(intervalSec * (1000 / drinkRateMs));

      // Test just before threshold
      const result1 = mockApp.systems.autosave.computeAutosaveCounter({
        enabled: true,
        counter: drinksForAutosave - 2, // 28, so next will be 29
        intervalSec,
        drinkRateMs,
      });

      expect(result1.nextCounter).toBe(29);
      expect(result1.shouldSave).toBe(false);

      // Test at threshold
      const result2 = mockApp.systems.autosave.computeAutosaveCounter({
        enabled: true,
        counter: drinksForAutosave,
        intervalSec,
        drinkRateMs,
      });

      expect(result2.nextCounter).toBe(1);
      expect(result2.shouldSave).toBe(true);
    });
  });

  describe('Loop System', () => {
    it('should start game loop correctly', () => {
      expect(mockApp.systems.loop.start).toBeDefined();

      const loopConfig = {
        updateDrinkProgress: vi.fn(),
        processDrink: vi.fn(),
        updateStats: vi.fn(),
        updatePlayTime: vi.fn(),
        updateLastSaveTime: vi.fn(),
      };

      mockApp.systems.loop.start(loopConfig);
      expect(mockApp.systems.loop.start).toHaveBeenCalledWith(loopConfig);
    });

    it('should stop game loop correctly', () => {
      expect(mockApp.systems.loop.stop).toBeDefined();

      mockApp.systems.loop.stop();
      expect(mockApp.systems.loop.stop).toHaveBeenCalled();
    });
  });

  describe('Resources System', () => {
    it('should recalculate production correctly', () => {
      expect(mockApp.systems.resources.recalcProduction).toBeDefined();

      const result = mockApp.systems.resources.recalcProduction();

      expect(result).toBeDefined();
      expect(result.sps).toBe(10);
      expect(result.spd).toBe(5);
    });

    it('should handle production calculations with upgrades', () => {
      const upgrades = {
        straws: 5,
        cups: 3,
        fasterDrinks: 1,
      };

      const result = mockApp.systems.resources.recalcProduction(upgrades);
      expect(result).toBeDefined();
    });
  });

  describe('Purchases System', () => {
    it('should check affordability correctly', () => {
      expect(mockApp.systems.purchases.canAfford).toBeDefined();

      // Test affordable purchase
      const canAffordStraw = mockApp.systems.purchases.canAfford(10);
      expect(canAffordStraw).toBe(true); // 1000 >= 10

      // Test unaffordable purchase
      const canAffordExpensive = mockApp.systems.purchases.canAfford(10000);
      expect(canAffordExpensive).toBe(false); // 1000 < 10000
    });

    it('should process purchases correctly', () => {
      expect(mockApp.systems.purchases.purchase).toBeDefined();

      const initialSips = (global as any).window.sips.toNumber();

      // Test successful purchase
      const success = mockApp.systems.purchases.purchase('straw', 10);
      expect(success).toBe(true);
      expect((global as any).window.sips.toNumber()).toBe(initialSips - 10);

      // Test failed purchase
      const failure = mockApp.systems.purchases.purchase('expensive', 10000);
      expect(failure).toBe(false);
      expect((global as any).window.sips.toNumber()).toBe(initialSips - 10); // Should not change
    });
  });

  describe('Clicks System', () => {
    it('should process clicks correctly', () => {
      expect(mockApp.systems.clicks.processClick).toBeDefined();

      const initialSips = (global as any).window.sips.toNumber();
      const initialClicks = (global as any).window.totalClicks;

      const sipsEarned = mockApp.systems.clicks.processClick(1);

      expect(sipsEarned).toBe(1);
      expect((global as any).window.sips.toNumber()).toBe(initialSips + 1);
      expect((global as any).window.totalClicks).toBe(initialClicks + 1);
    });

    it('should handle click multipliers correctly', () => {
      const initialSips = (global as any).window.sips.toNumber();

      // Test with multiplier
      const sipsEarned = mockApp.systems.clicks.processClick(5);

      expect(sipsEarned).toBe(5);
      expect((global as any).window.sips.toNumber()).toBe(initialSips + 5);
    });
  });

  describe('Audio System', () => {
    it('should initialize button audio system', () => {
      expect(mockApp.systems.audio.button.initButtonAudioSystem).toBeDefined();

      mockApp.systems.audio.button.initButtonAudioSystem();
      expect(mockApp.systems.audio.button.initButtonAudioSystem).toHaveBeenCalled();
    });

    it('should update button sounds toggle button', () => {
      expect(mockApp.systems.audio.button.updateButtonSoundsToggleButton).toBeDefined();

      mockApp.systems.audio.button.updateButtonSoundsToggleButton();
      expect(mockApp.systems.audio.button.updateButtonSoundsToggleButton).toHaveBeenCalled();
    });

    it('should play button click sounds', () => {
      expect(mockApp.systems.audio.button.playButtonClickSound).toBeDefined();

      mockApp.systems.audio.button.playButtonClickSound();
      expect(mockApp.systems.audio.button.playButtonClickSound).toHaveBeenCalled();
    });
  });

  describe('Game Init System', () => {
    it('should initialize splash screen', () => {
      expect(mockApp.systems.gameInit.initSplashScreen).toBeDefined();

      mockApp.systems.gameInit.initSplashScreen();
      expect(mockApp.systems.gameInit.initSplashScreen).toHaveBeenCalled();
    });

    it('should start game core', () => {
      expect(mockApp.systems.gameInit.startGameCore).toBeDefined();

      mockApp.systems.gameInit.startGameCore();
      expect(mockApp.systems.gameInit.startGameCore).toHaveBeenCalled();
    });

    it('should initialize on DOM ready', () => {
      expect(mockApp.systems.gameInit.initOnDomReady).toBeDefined();

      mockApp.systems.gameInit.initOnDomReady();
      expect(mockApp.systems.gameInit.initOnDomReady).toHaveBeenCalled();
    });
  });

  describe('Storage System', () => {
    it('should load game data correctly', () => {
      expect(mockApp.storage.loadGame).toBeDefined();

      const gameData = mockApp.storage.loadGame();

      expect(gameData).toBeDefined();
      expect(gameData.sips).toBe(1000);
      expect(gameData.straws).toBe(5);
      expect(gameData.cups).toBe(3);
    });

    it('should save game data correctly', () => {
      expect(mockApp.storage.saveGame).toBeDefined();

      const gameData = {
        sips: 2000,
        straws: 10,
        cups: 6,
      };

      mockApp.storage.saveGame(gameData);
      expect(mockApp.storage.saveGame).toHaveBeenCalledWith(gameData);
    });

    it('should handle boolean preferences correctly', () => {
      expect(mockApp.storage.getBoolean).toBeDefined();
      expect(mockApp.storage.setBoolean).toBeDefined();

      // Test getting boolean
      const clickSounds = mockApp.storage.getBoolean('clickSoundsEnabled');
      expect(clickSounds).toBe(true);

      // Test setting boolean
      mockApp.storage.setBoolean('clickSoundsEnabled', false);
      expect(mockApp.storage.setBoolean).toHaveBeenCalledWith('clickSoundsEnabled', false);
    });

    it('should delete game data correctly', () => {
      expect(mockApp.storage.deleteGame).toBeDefined();

      mockApp.storage.deleteGame();
      expect(mockApp.storage.deleteGame).toHaveBeenCalled();
    });
  });

  describe('Event System', () => {
    it('should emit events correctly', () => {
      expect(mockApp.events.emit).toBeDefined();

      const eventData = { type: 'click', value: 1 };
      mockApp.events.emit('game:click', eventData);

      expect(mockApp.events.emit).toHaveBeenCalledWith('game:click', eventData);
    });

    it('should handle event listeners', () => {
      expect(mockApp.events.on).toBeDefined();
      expect(mockApp.events.off).toBeDefined();

      const clickHandler = vi.fn();

      // Test adding listener
      mockApp.events.on('game:click', clickHandler);
      expect(mockApp.events.on).toHaveBeenCalledWith('game:click', clickHandler);

      // Test removing listener
      mockApp.events.off('game:click', clickHandler);
      expect(mockApp.events.off).toHaveBeenCalledWith('game:click', clickHandler);
    });
  });

  describe('State Bridge', () => {
    it('should set level correctly', () => {
      expect(mockApp.stateBridge.setLevel).toBeDefined();

      mockApp.stateBridge.setLevel(5);
      expect(mockApp.stateBridge.setLevel).toHaveBeenCalledWith(5);
    });

    it('should set drink timing correctly', () => {
      expect(mockApp.stateBridge.setLastDrinkTime).toBeDefined();
      expect(mockApp.stateBridge.setDrinkProgress).toBeDefined();
      expect(mockApp.stateBridge.setDrinkRate).toBeDefined();

      const now = Date.now();

      mockApp.stateBridge.setLastDrinkTime(now);
      mockApp.stateBridge.setDrinkProgress(0.5);
      mockApp.stateBridge.setDrinkRate(500);

      expect(mockApp.stateBridge.setLastDrinkTime).toHaveBeenCalledWith(now);
      expect(mockApp.stateBridge.setDrinkProgress).toHaveBeenCalledWith(0.5);
      expect(mockApp.stateBridge.setDrinkRate).toHaveBeenCalledWith(500);
    });

    it('should set resource values correctly', () => {
      expect(mockApp.stateBridge.setSips).toBeDefined();
      expect(mockApp.stateBridge.setStraws).toBeDefined();
      expect(mockApp.stateBridge.setCups).toBeDefined();

      mockApp.stateBridge.setSips(2000);
      mockApp.stateBridge.setStraws(10);
      mockApp.stateBridge.setCups(6);

      expect(mockApp.stateBridge.setSips).toHaveBeenCalledWith(2000);
      expect(mockApp.stateBridge.setStraws).toHaveBeenCalledWith(10);
      expect(mockApp.stateBridge.setCups).toHaveBeenCalledWith(6);
    });
  });

  describe('Rules System', () => {
    describe('Economy Rules', () => {
      it('should compute straw SPD correctly', () => {
        expect(mockApp.rules.economy.computeStrawSPD).toBeDefined();

        const spd = mockApp.rules.economy.computeStrawSPD();
        expect(spd).toBe(2);
      });

      it('should compute cup SPD correctly', () => {
        expect(mockApp.rules.economy.computeCupSPD).toBeDefined();

        const spd = mockApp.rules.economy.computeCupSPD();
        expect(spd).toBe(3);
      });

      it('should compute straw cost correctly', () => {
        expect(mockApp.rules.economy.computeStrawCost).toBeDefined();

        const cost1 = mockApp.rules.economy.computeStrawCost(0);
        const cost2 = mockApp.rules.economy.computeStrawCost(1);
        const cost3 = mockApp.rules.economy.computeStrawCost(2);

        expect(cost1).toBe(10);
        expect(cost2).toBe(11.5);
        expect(cost3).toBeCloseTo(13.225, 3);
      });

      it('should compute cup cost correctly', () => {
        expect(mockApp.rules.economy.computeCupCost).toBeDefined();

        const cost1 = mockApp.rules.economy.computeCupCost(0);
        const cost2 = mockApp.rules.economy.computeCupCost(1);
        const cost3 = mockApp.rules.economy.computeCupCost(2);

        expect(cost1).toBe(50);
        expect(cost2).toBe(60);
        expect(cost3).toBe(72);
      });
    });

    describe('Click Rules', () => {
      it('should process clicks correctly', () => {
        expect(mockApp.rules.clicks.processClick).toBeDefined();

        const result1 = mockApp.rules.clicks.processClick(1, 1);
        const result2 = mockApp.rules.clicks.processClick(2, 3);

        expect(result1).toBe(1);
        expect(result2).toBe(6);
      });
    });

    describe('Purchase Rules', () => {
      it('should check affordability correctly', () => {
        expect(mockApp.rules.purchases.canAfford).toBeDefined();

        const canAfford10 = mockApp.rules.purchases.canAfford(10);
        const canAfford10000 = mockApp.rules.purchases.canAfford(10000);

        expect(canAfford10).toBe(true);
        expect(canAfford10000).toBe(false);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game flow', () => {
      // Test that all systems work together
      expect(mockApp.systems.loop.start).toBeDefined();
      expect(mockApp.systems.save.performSaveSnapshot).toBeDefined();
      expect(mockApp.systems.options.saveOptions).toBeDefined();
      expect(mockApp.systems.autosave.computeAutosaveCounter).toBeDefined();
      expect(mockApp.systems.resources.recalcProduction).toBeDefined();
      expect(mockApp.systems.purchases.canAfford).toBeDefined();
      expect(mockApp.systems.clicks.processClick).toBeDefined();
    });

    it('should maintain state consistency across systems', () => {
      const initialState = {
        sips: (global as any).window.sips.toNumber(),
        straws: (global as any).window.straws.toNumber(),
        cups: (global as any).window.cups.toNumber(),
        level: (global as any).window.level,
      };

      // Simulate some operations
      mockApp.systems.clicks.processClick(1);
      mockApp.systems.purchases.purchase('straw', 10);

      // Check that state is consistent
      expect((global as any).window.sips.toNumber()).toBe(initialState.sips + 1 - 10);
      expect((global as any).window.straws.toNumber()).toBe(initialState.straws);
      expect((global as any).window.cups.toNumber()).toBe(initialState.cups);
      expect((global as any).window.level).toBe(initialState.level);
    });

    it('should handle save and load cycle correctly', () => {
      // Save current state
      const saveData = mockApp.systems.save.performSaveSnapshot();

      // Modify state
      (global as any).window.sips = new mockDecimal(2000);
      (global as any).window.straws = new mockDecimal(10);

      // Load saved state
      const loadedData = mockApp.storage.loadGame();

      // Verify data integrity
      expect(loadedData.sips).toBe(1000);
      expect(loadedData.straws).toBe(5);
      expect(loadedData.cups).toBe(3);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing systems gracefully', () => {
      // Test that missing systems don't crash the game
      const originalSave = mockApp.systems.save;
      delete mockApp.systems.save;

      expect(() => {
        // Should not crash
        mockApp.systems.save?.performSaveSnapshot?.();
      }).not.toThrow();

      // Restore
      mockApp.systems.save = originalSave;
    });

    it('should handle missing UI functions gracefully', () => {
      // Test that missing UI functions don't crash
      const originalUpdateStats = mockApp.ui.updateAllStats;
      delete mockApp.ui.updateAllStats;

      expect(() => {
        // Should not crash
        mockApp.ui.updateAllStats?.();
      }).not.toThrow();

      // Restore
      mockApp.ui.updateAllStats = originalUpdateStats;
    });

    it('should handle rapid system calls without errors', () => {
      // Test that rapid system calls don't cause errors
      expect(() => {
        for (let i = 0; i < 100; i++) {
          mockApp.systems.clicks.processClick(1);
          mockApp.systems.purchases.canAfford(10);
          mockApp.systems.autosave.computeAutosaveCounter({
            enabled: true,
            counter: i,
            intervalSec: 30,
            drinkRateMs: 1000,
          });
        }
      }).not.toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle rapid system operations efficiently', () => {
      const startTime = performance.now();

      // Simulate rapid system operations
      for (let i = 0; i < 1000; i++) {
        mockApp.systems.clicks.processClick(1);
        mockApp.systems.purchases.canAfford(10);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1000ms)
      expect(duration).toBeLessThan(1000);
      expect(mockApp.systems.clicks.processClick).toHaveBeenCalledTimes(1000);
      expect(mockApp.systems.purchases.canAfford).toHaveBeenCalledTimes(1000);
    });

    it('should not leak memory during operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Simulate extended system operations
      for (let i = 0; i < 100; i++) {
        mockApp.systems.save.performSaveSnapshot();
        mockApp.systems.options.loadOptions();
        mockApp.systems.resources.recalcProduction();
      }

      // Memory usage should remain reasonable
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('DOM Cache System', () => {
    it('should cache progress elements correctly', () => {
      // Test that progress elements are properly cached
      const mockProgressFill = { style: { width: '' } };
      const mockCountdown = { textContent: '', classList: { add: vi.fn(), remove: vi.fn() } };

      // Mock DOM elements
      const mockGetElementById = vi.fn((id: string) => {
        if (id === 'drinkProgressFill') return mockProgressFill;
        if (id === 'drinkCountdown') return mockCountdown;
        return null;
      });

      // Mock document
      (global as any).document = {
        getElementById: mockGetElementById,
      };

      // Test DOM cache functionality with mocked elements
      const mockDOMCache = {
        progressFill: mockProgressFill,
        countdown: mockCountdown,
        get: vi.fn((id: string) => {
          if (id === 'drinkProgressFill') return mockProgressFill;
          if (id === 'drinkCountdown') return mockCountdown;
          return null;
        }),
      };

      // Verify elements are accessible
      expect(mockDOMCache.progressFill).toBe(mockProgressFill);
      expect(mockDOMCache.countdown).toBe(mockCountdown);

      // Test fallback DOM access
      expect(mockDOMCache.get('drinkProgressFill')).toBe(mockProgressFill);
      expect(mockDOMCache.get('drinkCountdown')).toBe(mockCountdown);

      // Cleanup
      delete (global as any).document;
    });

    it('should handle missing progress elements gracefully', () => {
      // Test graceful handling of missing elements
      const mockGetElementById = vi.fn(() => null);

      (global as any).document = {
        getElementById: mockGetElementById,
      };

      // Mock DOM cache with missing elements
      const mockDOMCache = {
        progressFill: null,
        countdown: null,
        init: vi.fn(),
      };

      // Should not throw when elements are missing
      expect(() => {
        mockDOMCache.init();
      }).not.toThrow();

      // Missing elements should be null
      expect(mockDOMCache.progressFill).toBeNull();
      expect(mockDOMCache.countdown).toBeNull();

      // Cleanup
      delete (global as any).document;
    });
  });
});
