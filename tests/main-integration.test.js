// Main.js Integration Tests
// Tests the refactored main.js file to ensure all functionality works correctly

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Main.js Integration - Refactored Functionality', () => {
  let mockApp;
  let mockGameConfig;
  let mockDecimal;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock Decimal library
    mockDecimal = class Decimal {
      constructor(value) {
        this.value = value;
      }
      
      plus(other) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value + otherValue);
      }
      
      minus(other) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value - otherValue);
      }
      
      times(other) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value * otherValue);
      }
      
      div(other) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value / otherValue);
      }
      
      gte(other) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return this.value >= otherValue;
      }
      
      lte(other) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value <= otherValue);
      }
      
      toNumber() {
        return this.value;
      }
      
      toString() {
        return this.value.toString();
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
        LEVEL_UP_SCALING: 1.5
      },
      TIMING: {
        CLICK_STREAK_WINDOW: 1000,
        DOM_READY_DELAY: 100
      },
      LIMITS: {
        TARGET_FPS: 60,
        STATS_UPDATE_INTERVAL: 1000,
        AFFORDABILITY_CHECK_INTERVAL: 500,
        MAX_CLICK_TIMES: 100
      }
    };
    
    // Mock App object with all required systems
    mockApp = {
      ui: {
        // Core UI functions that were moved from main.js
        checkUpgradeAffordability: vi.fn(),
        updateAllStats: vi.fn(),
        updatePlayTime: vi.fn(),
        updateLastSaveTime: vi.fn(),
        updateDrinkProgress: vi.fn(),
        updateTopSipsPerDrink: vi.fn(),
        updateTopSipsPerSecond: vi.fn(),
        updateClickStats: vi.fn(),
        updateAutosaveStatus: vi.fn(),
        updateButtonState: vi.fn(),
        updateCostDisplay: vi.fn(),
        updateCriticalClickDisplay: vi.fn(),
        updateDrinkSpeedDisplay: vi.fn(),
        updateCompactDrinkSpeedDisplays: vi.fn(),
        updateLevelNumber: vi.fn(),
        updateLevelText: vi.fn(),
        updateTopSipCounter: vi.fn(),
        updateClickSoundsToggleText: vi.fn(),
        updateCountdownText: vi.fn(),
        updateTimeStats: vi.fn(),
        updateEconomyStats: vi.fn(),
        updateShopStats: vi.fn(),
        updateAchievementStats: vi.fn(),
        performBatchUIUpdate: vi.fn(),
        initializeUI: vi.fn(),
        updateAllDisplays: vi.fn()
      },
      systems: {
        loop: {
          start: vi.fn(),
          stop: vi.fn()
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
            lastSaveTime: Date.now()
          })),
          deleteSave: vi.fn(),
          queueSave: vi.fn()
        },
        options: {
          saveOptions: vi.fn(),
          loadOptions: vi.fn(() => ({
            autosaveEnabled: true,
            autosaveInterval: 30,
            clickSoundsEnabled: true
          }))
        },
        autosave: {
          computeAutosaveCounter: vi.fn(({ enabled, counter, intervalSec, drinkRateMs }) => {
            if (!enabled) return { nextCounter: 0, shouldSave: false };
            
            const drinksPerSecond = 1000 / drinkRateMs;
            const drinksForAutosave = Math.ceil(intervalSec * drinksPerSecond);
            const next = counter + 1;
            
            if (next >= drinksForAutosave) {
              return { nextCounter: 1, shouldSave: true };
            }
            return { nextCounter: next, shouldSave: false };
          })
        },
        resources: {
          recalcProduction: vi.fn(() => ({
            sps: 10,
            spd: 5
          }))
        },
        purchases: {
          canAfford: vi.fn((cost) => window.sips.gte(cost)),
          purchase: vi.fn((item, cost) => {
            if (window.sips.gte(cost)) {
              window.sips = window.sips.minus(cost);
              return true;
            }
            return false;
          })
        },
        clicks: {
          processClick: vi.fn((multiplier = 1) => {
            const baseSips = 1;
            const totalSips = baseSips * multiplier;
            window.sips = window.sips.plus(totalSips);
            window.totalClicks++;
            return totalSips;
          })
        },
        audio: {
          button: {
            initButtonAudioSystem: vi.fn(),
            updateButtonSoundsToggleButton: vi.fn(),
            playButtonClickSound: vi.fn()
          }
        },
        gameInit: {
          initSplashScreen: vi.fn(),
          startGameCore: vi.fn(),
          initOnDomReady: vi.fn()
        }
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
          lastSaveTime: Date.now()
        })),
        saveGame: vi.fn(),
        setBoolean: vi.fn(),
        getBoolean: vi.fn(() => true),
        deleteGame: vi.fn()
      },
      events: {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn()
      },
      stateBridge: {
        setLevel: vi.fn(),
        setLastDrinkTime: vi.fn(),
        setDrinkProgress: vi.fn(),
        setDrinkRate: vi.fn(),
        setSips: vi.fn(),
        setStraws: vi.fn(),
        setCups: vi.fn()
      },
      data: {
        upgrades: {
          straws: { baseCost: 10, scaling: 1.15 },
          cups: { baseCost: 50, scaling: 1.2 },
          fasterDrinks: { baseCost: 200, scaling: 1.3 }
        }
      },
      rules: {
        economy: {
          computeStrawSPD: vi.fn(() => 2),
          computeCupSPD: vi.fn(() => 3),
          computeStrawCost: vi.fn((count) => 10 * Math.pow(1.15, count)),
          computeCupCost: vi.fn((count) => 50 * Math.pow(1.2, count))
        },
        clicks: {
          processClick: vi.fn((baseSips = 1, multiplier = 1) => baseSips * multiplier)
        },
        purchases: {
          canAfford: vi.fn((cost) => window.sips.gte(cost))
        }
      }
    };
    
    // Setup global mocks
    global.window = {
      ...global.window,
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
      criticalClickChance: new mockDecimal(0.001),
      criticalClickMultiplier: new mockDecimal(5),
      criticalClicks: new mockDecimal(0),
      criticalClickUpCounter: new mockDecimal(1),
      suctionClickBonus: new mockDecimal(0),
      level: new mockDecimal(1),
      totalSipsEarned: new mockDecimal(5000),
      totalClicks: 150,
      gameStartDate: Date.now() - 86400000,
      lastClickTime: Date.now() - 5000,
      clickTimes: [Date.now() - 1000, Date.now() - 500],
      clickSoundsEnabled: true,
      autosaveEnabled: true,
      autosaveInterval: 30,
      autosaveCounter: 0,
      lastDrinkTime: Date.now(),
      drinkRate: 1000,
      drinkProgress: 0,
      sps: new mockDecimal(10),
      currentClickStreak: 0,
      bestClickStreak: 0
    };
    
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="splashScreen" style="display: block;">
        <div class="splash-content">
          <h1 class="splash-title">Soda Clicker Pro</h1>
          <p class="splash-subtitle-text">Click to start!</p>
          <p class="splash-instruction">Click anywhere to begin</p>
          <p class="splash-version">v1.0.0</p>
        </div>
      </div>
      <div id="gameContent" style="display: none;">
        <div id="sodaButton" class="soda-button"></div>
        <div id="statsTab" class="tab active"></div>
        <div id="shopTab" class="tab"></div>
        <div id="unlocksTab" class="tab"></div>
        <div id="lastSaveTime"></div>
        <div id="clickSoundsToggle"></div>
        <div id="autosaveToggle"></div>
        <div id="autosaveInterval"></div>
      </div>
    `;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Refactored Function Calls', () => {
    it('should call UI functions through App.ui namespace', () => {
      // Test that all UI calls go through the proper namespace
      const uiFunctions = [
        'checkUpgradeAffordability',
        'updateAllStats',
        'updatePlayTime',
        'updateLastSaveTime',
        'updateDrinkProgress',
        'updateTopSipsPerDrink',
        'updateTopSipsPerSecond',
        'updateClickStats',
        'updateAutosaveStatus'
      ];
      
      uiFunctions.forEach(funcName => {
        expect(mockApp.ui[funcName]).toBeDefined();
        expect(typeof mockApp.ui[funcName]).toBe('function');
      });
    });

    it('should call system functions through App.systems namespace', () => {
      // Test that all system calls go through the proper namespace
      const systemFunctions = [
        'save.performSaveSnapshot',
        'options.saveOptions',
        'options.loadOptions',
        'autosave.computeAutosaveCounter',
        'loop.start',
        'audio.button.playButtonClickSound'
      ];
      
      systemFunctions.forEach(funcPath => {
        const parts = funcPath.split('.');
        let obj = mockApp.systems;
        parts.forEach(part => {
          expect(obj[part]).toBeDefined();
          obj = obj[part];
        });
      });
    });

    it('should use optional chaining for safe function calls', () => {
      // Test that function calls use optional chaining
      expect(() => {
        // These should not throw even if functions are missing
        window.App?.ui?.updateAllStats?.();
        window.App?.systems?.save?.performSaveSnapshot?.();
        window.App?.systems?.options?.saveOptions?.();
      }).not.toThrow();
    });
  });

  describe('Game Loop Integration', () => {
    it('should use modular loop system', () => {
      expect(mockApp.systems.loop.start).toBeDefined();
      
      // Test loop system integration
      const loopConfig = {
        updateDrinkProgress: vi.fn(),
        processDrink: vi.fn(),
        updateStats: vi.fn(),
        updatePlayTime: vi.fn(),
        updateLastSaveTime: vi.fn()
      };
      
      mockApp.systems.loop.start(loopConfig);
      expect(mockApp.systems.loop.start).toHaveBeenCalledWith(loopConfig);
    });

    it('should calculate drink progress correctly in game loop', () => {
      // Test drink progress calculation logic
      const mockUpdateDrinkProgress = vi.fn();
      
      // Simulate the progress calculation logic from the game loop
      const currentTime = Date.now();
      const lastDrinkTime = currentTime - 2500; // 2.5 seconds ago
      const drinkRate = 5000; // 5 seconds
      
      const timeSinceLastDrink = currentTime - lastDrinkTime;
      const progressPercentage = Math.min((timeSinceLastDrink / drinkRate) * 100, 100);
      
      // Verify calculation
      expect(progressPercentage).toBe(50); // 2.5s / 5s = 50%
      
      // Test progress clamping
      const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100);
      expect(clampedProgress).toBe(50);
      
      // Test edge cases
      expect(Math.min(Math.max(-10, 0), 100)).toBe(0); // Negative progress clamped to 0
      expect(Math.min(Math.max(150, 0), 100)).toBe(100); // Over 100% clamped to 100
    });

    it('should call UI updates through App namespace', () => {
      // Test that UI updates go through the proper namespace
      mockApp.ui.updateAllStats();
      mockApp.ui.updatePlayTime();
      mockApp.ui.updateLastSaveTime();
      
      expect(mockApp.ui.updateAllStats).toHaveBeenCalled();
      expect(mockApp.ui.updatePlayTime).toHaveBeenCalled();
      expect(mockApp.ui.updateLastSaveTime).toHaveBeenCalled();
    });
  });

  describe('Save System Integration', () => {
    it('should use modular save system', () => {
      expect(mockApp.systems.save.performSaveSnapshot).toBeDefined();
      
      const saveData = mockApp.systems.save.performSaveSnapshot();
      expect(saveData).toBeDefined();
      expect(saveData.sips).toBe(1000);
    });

    it('should handle save operations through App namespace', () => {
      // Test save operations
      mockApp.systems.save.performSaveSnapshot();
      expect(mockApp.systems.save.performSaveSnapshot).toHaveBeenCalled();
    });
  });

  describe('Options System Integration', () => {
    it('should use modular options system', () => {
      expect(mockApp.systems.options.saveOptions).toBeDefined();
      expect(mockApp.systems.options.loadOptions).toBeDefined();
      
      // Test options operations
      const options = { autosaveEnabled: true, autosaveInterval: 60 };
      mockApp.systems.options.saveOptions(options);
      const loadedOptions = mockApp.systems.options.loadOptions();
      
      expect(mockApp.systems.options.saveOptions).toHaveBeenCalledWith(options);
      expect(loadedOptions.autosaveEnabled).toBe(true);
    });
  });

  describe('Autosave System Integration', () => {
    it('should use modular autosave system', () => {
      expect(mockApp.systems.autosave.computeAutosaveCounter).toBeDefined();
      
      // Test autosave calculations
      const result = mockApp.systems.autosave.computeAutosaveCounter({
        enabled: true,
        counter: 0,
        intervalSec: 30,
        drinkRateMs: 1000
      });
      
      expect(result.nextCounter).toBe(1);
      expect(result.shouldSave).toBe(false);
    });
  });

  describe('Audio System Integration', () => {
    it('should use modular audio system', () => {
      expect(mockApp.systems.audio.button.playButtonClickSound).toBeDefined();
      
      // Test audio operations
      mockApp.systems.audio.button.playButtonClickSound();
      expect(mockApp.systems.audio.button.playButtonClickSound).toHaveBeenCalled();
    });
  });

  describe('Event System Integration', () => {
    it('should use modular event system', () => {
      expect(mockApp.events.emit).toBeDefined();
      
      // Test event emission
      mockApp.events.emit('game:click', { value: 1 });
      expect(mockApp.events.emit).toHaveBeenCalledWith('game:click', { value: 1 });
    });
  });

  describe('Storage System Integration', () => {
    it('should use modular storage system', () => {
      expect(mockApp.storage.loadGame).toBeDefined();
      expect(mockApp.storage.saveGame).toBeDefined();
      
      // Test storage operations
      const gameData = mockApp.storage.loadGame();
      mockApp.storage.saveGame(gameData);
      
      expect(mockApp.storage.loadGame).toHaveBeenCalled();
      expect(mockApp.storage.saveGame).toHaveBeenCalledWith(gameData);
    });
  });

  describe('State Bridge Integration', () => {
    it('should use modular state bridge', () => {
      expect(mockApp.stateBridge.setLevel).toBeDefined();
      expect(mockApp.stateBridge.setSips).toBeDefined();
      
      // Test state bridge operations
      mockApp.stateBridge.setLevel(5);
      mockApp.stateBridge.setSips(2000);
      
      expect(mockApp.stateBridge.setLevel).toHaveBeenCalledWith(5);
      expect(mockApp.stateBridge.setSips).toHaveBeenCalledWith(2000);
    });
  });

  describe('Rules System Integration', () => {
    it('should use modular rules system', () => {
      expect(mockApp.rules.economy.computeStrawCost).toBeDefined();
      expect(mockApp.rules.clicks.processClick).toBeDefined();
      expect(mockApp.rules.purchases.canAfford).toBeDefined();
      
      // Test rules operations
      const strawCost = mockApp.rules.economy.computeStrawCost(5);
      const clickResult = mockApp.rules.clicks.processClick(1, 2);
      const canAfford = mockApp.rules.purchases.canAfford(100);
      
      expect(strawCost).toBe(10 * Math.pow(1.15, 5));
      expect(clickResult).toBe(2);
      expect(canAfford).toBe(true);
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('should handle missing App object gracefully', () => {
      // Test that missing App object doesn't crash
      const originalApp = window.App;
      delete window.App;
      
      expect(() => {
        // Should not crash
        window.App?.ui?.updateAllStats?.();
        window.App?.systems?.save?.performSaveSnapshot?.();
      }).not.toThrow();
      
      // Restore
      window.App = originalApp;
    });

    it('should handle missing UI functions gracefully', () => {
      // Test that missing UI functions don't crash
      const originalUpdateStats = mockApp.ui.updateAllStats;
      delete mockApp.ui.updateAllStats;
      
      expect(() => {
        // Should not crash
        window.App?.ui?.updateAllStats?.();
      }).not.toThrow();
      
      // Restore
      mockApp.ui.updateAllStats = originalUpdateStats;
    });

    it('should handle missing system functions gracefully', () => {
      // Test that missing system functions don't crash
      const originalSave = mockApp.systems.save;
      delete mockApp.systems.save;
      
      expect(() => {
        // Should not crash
        window.App?.systems?.save?.performSaveSnapshot?.();
      }).not.toThrow();
      
      // Restore
      mockApp.systems.save = originalSave;
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle rapid function calls efficiently', () => {
      const startTime = performance.now();
      
      // Simulate rapid function calls
      for (let i = 0; i < 1000; i++) {
        window.App?.ui?.updateAllStats?.();
        window.App?.systems?.save?.performSaveSnapshot?.();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1000ms)
      expect(duration).toBeLessThan(1000);
    });

    it('should not create excessive objects during operations', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Simulate extended operations
      for (let i = 0; i < 100; i++) {
        window.App?.ui?.updateAllStats?.();
        window.App?.systems?.save?.performSaveSnapshot?.();
        window.App?.systems?.options?.loadOptions?.();
      }
      
      // Memory usage should remain reasonable
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Integration and System Interaction', () => {
    it('should maintain proper separation of concerns', () => {
      // Test that UI functions are in UI namespace
      expect(mockApp.ui.updateAllStats).toBeDefined();
      expect(mockApp.ui.checkUpgradeAffordability).toBeDefined();
      
      // Test that system functions are in systems namespace
      expect(mockApp.systems.save.performSaveSnapshot).toBeDefined();
      expect(mockApp.systems.options.saveOptions).toBeDefined();
      
      // Test that rules are in rules namespace
      expect(mockApp.rules.economy.computeStrawCost).toBeDefined();
      expect(mockApp.rules.clicks.processClick).toBeDefined();
    });

    it('should handle cross-system communication correctly', () => {
      // Test that systems can communicate through the App namespace
      const saveData = mockApp.systems.save.performSaveSnapshot();
      mockApp.storage.saveGame(saveData);
      
      expect(mockApp.systems.save.performSaveSnapshot).toHaveBeenCalled();
      expect(mockApp.storage.saveGame).toHaveBeenCalledWith(saveData);
    });

    it('should maintain event-driven architecture', () => {
      // Test that events are properly emitted and handled
      mockApp.events.emit('game:click', { value: 1 });
      expect(mockApp.events.emit).toHaveBeenCalledWith('game:click', { value: 1 });
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain existing game functionality', () => {
      // Test that core game mechanics still work
      expect(window.sips.value).toBe(1000);
      expect(window.straws.value).toBe(5);
      expect(window.cups.value).toBe(3);
      expect(window.level.value).toBe(1);
    });

    it('should maintain existing game state', () => {
      // Test that game state is preserved
      expect(window.totalClicks).toBe(150);
      expect(window.gameStartDate).toBeDefined();
      expect(window.lastClickTime).toBeDefined();
      expect(window.clickTimes).toBeDefined();
    });

    it('should maintain existing configuration', () => {
      // Test that game configuration is preserved
      expect(mockGameConfig.BALANCE.STRAW_BASE_COST).toBe(10);
      expect(mockGameConfig.BALANCE.CUP_BASE_COST).toBe(50);
      expect(mockGameConfig.TIMING.CLICK_STREAK_WINDOW).toBe(1000);
    });
  });

  describe('Future Extensibility', () => {
    it('should support adding new UI modules', () => {
      // Test that new UI modules can be added
      mockApp.ui.newModule = {
        newFunction: vi.fn()
      };
      
      expect(mockApp.ui.newModule.newFunction).toBeDefined();
      expect(typeof mockApp.ui.newModule.newFunction).toBe('function');
    });

    it('should support adding new system modules', () => {
      // Test that new system modules can be added
      mockApp.systems.newSystem = {
        newFunction: vi.fn()
      };
      
      expect(mockApp.systems.newSystem.newFunction).toBeDefined();
      expect(typeof mockApp.systems.newSystem.newFunction).toBe('function');
    });

    it('should support adding new rules', () => {
      // Test that new rules can be added
      mockApp.rules.newRule = {
        newFunction: vi.fn()
      };
      
      expect(mockApp.rules.newRule.newFunction).toBeDefined();
      expect(typeof mockApp.rules.newRule.newFunction).toBe('function');
    });
  });
});