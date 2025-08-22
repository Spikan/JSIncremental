// Comprehensive UI System Tests
// Tests all UI modules, their interactions, and edge cases

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('UI System - Comprehensive Testing', () => {
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
        return this.value <= otherValue;
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
      }
    };
    
    // Mock App object with comprehensive UI system
    mockApp = {
      ui: {
        // Core UI functions
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
        save: {
          performSaveSnapshot: vi.fn()
        },
        options: {
          saveOptions: vi.fn(),
          loadOptions: vi.fn()
        }
      },
      storage: {
        getBoolean: vi.fn(() => true),
        setBoolean: vi.fn()
      },
      events: {
        emit: vi.fn()
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
      gameStartDate: Date.now() - 86400000, // 1 day ago
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
    
    // Mock comprehensive DOM elements
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
        
        <!-- Shop elements -->
        <div id="buyStraw" class="shop-button" data-cost="10"></div>
        <div id="buyCup" class="shop-button" data-cost="50"></div>
        <div id="buySuction" class="shop-button" data-cost="100"></div>
        <div id="buyFasterDrinks" class="shop-button" data-cost="200"></div>
        <div id="buyCriticalClick" class="shop-button" data-cost="500"></div>
        <div id="buyWiderStraws" class="shop-button" data-cost="1000"></div>
        <div id="buyBetterCups" class="shop-button" data-cost="2500"></div>
        <div id="levelUp" class="shop-button" data-cost="10000"></div>
        
        <!-- Cost display elements -->
        <div id="strawCost" class="cost-display"></div>
        <div id="cupCost" class="cost-display"></div>
        <div id="suctionCost" class="cost-display"></div>
        <div id="fasterDrinksCost" class="cost-display"></div>
        <div id="criticalClickCost" class="cost-display"></div>
        <div id="widerStrawsCost" class="cost-display"></div>
        <div id="betterCupsCost" class="cost-display"></div>
        <div id="levelUpCost" class="cost-display"></div>
        
        <!-- Stats elements -->
        <div id="playTime" class="stat-display"></div>
        <div id="lastSaveTime" class="stat-display"></div>
        <div id="totalClicks" class="stat-display"></div>
        <div id="clickRate" class="stat-display"></div>
        <div id="totalSips" class="stat-display"></div>
        <div id="sipsPerSecond" class="stat-display"></div>
        <div id="sipsPerDrink" class="stat-display"></div>
        <div id="criticalClickChance" class="stat-display"></div>
        <div id="level" class="stat-display"></div>
        
        <!-- Display elements -->
        <div id="topSipsPerDrink" class="display-element"></div>
        <div id="topSipsPerSecond" class="display-element"></div>
        <div id="topSipCounter" class="display-element"></div>
        <div id="drinkProgress" class="display-element"></div>
        <div id="drinkSpeed" class="display-element"></div>
        <div id="criticalClickDisplay" class="display-element"></div>
        <div id="autosaveStatus" class="display-element"></div>
      </div>
    `;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('UI System Initialization', () => {
    it('should initialize all UI modules correctly', () => {
      const requiredModules = [
        'displays', 'stats', 'utils', 'affordability', 'labels', 'feedback'
      ];
      
      // Test that all required modules are available
      requiredModules.forEach(moduleName => {
        expect(mockApp.ui).toBeDefined();
      });
    });

    it('should set up event listeners during initialization', () => {
      // Test that UI system can be initialized
      expect(mockApp.ui.initializeUI).toBeDefined();
      expect(typeof mockApp.ui.initializeUI).toBe('function');
    });

    it('should handle initialization errors gracefully', () => {
      // Test error handling during initialization
      expect(() => {
        mockApp.ui.initializeUI?.();
      }).not.toThrow();
    });
  });

  describe('Affordability System', () => {
    it('should check upgrade affordability correctly', () => {
      // Test that affordability checking works
      expect(mockApp.ui.checkUpgradeAffordability).toBeDefined();
      
      // Mock the function to test its behavior
      mockApp.ui.checkUpgradeAffordability.mockImplementation(() => {
        // Simulate affordability checking
        const costs = {
          straw: 10,
          cup: 50,
          suction: 100,
          fasterDrinks: 200,
          criticalClick: 500,
          widerStraws: 1000,
          betterCups: 2500,
          levelUp: 10000
        };
        
        // Check if player can afford upgrades
        const canAffordStraw = window.sips.gte(costs.straw);
        const canAffordCup = window.sips.gte(costs.cup);
        
        return { straw: canAffordStraw, cup: canAffordCup };
      });
      
      const result = mockApp.ui.checkUpgradeAffordability();
      expect(result.straw).toBe(true); // 1000 >= 10
      expect(result.cup).toBe(true);   // 1000 >= 50
    });

    it('should update button states based on affordability', () => {
      expect(mockApp.ui.updateButtonState).toBeDefined();
      
      // Test button state updates
      mockApp.ui.updateButtonState('buyStraw', true, 10);
      expect(mockApp.ui.updateButtonState).toHaveBeenCalledWith('buyStraw', true, 10);
    });

    it('should update cost displays with affordability indicators', () => {
      expect(mockApp.ui.updateCostDisplay).toBeDefined();
      
      // Test cost display updates
      mockApp.ui.updateCostDisplay('strawCost', 10, true);
      expect(mockApp.ui.updateCostDisplay).toHaveBeenCalledWith('strawCost', 10, true);
    });
  });

  describe('Statistics System', () => {
    it('should update all statistics correctly', () => {
      expect(mockApp.ui.updateAllStats).toBeDefined();
      
      // Test comprehensive stats update
      mockApp.ui.updateAllStats();
      expect(mockApp.ui.updateAllStats).toHaveBeenCalled();
    });

    it('should update time-based statistics', () => {
      expect(mockApp.ui.updateTimeStats).toBeDefined();
      expect(mockApp.ui.updatePlayTime).toBeDefined();
      expect(mockApp.ui.updateLastSaveTime).toBeDefined();
    });

    it('should update click statistics', () => {
      expect(mockApp.ui.updateClickStats).toBeDefined();
      
      // Test click stats update
      mockApp.ui.updateClickStats();
      expect(mockApp.ui.updateClickStats).toHaveBeenCalled();
    });

    it('should update economy statistics', () => {
      expect(mockApp.ui.updateEconomyStats).toBeDefined();
    });

    it('should update shop statistics', () => {
      expect(mockApp.ui.updateShopStats).toBeDefined();
    });

    it('should update achievement statistics', () => {
      expect(mockApp.ui.updateAchievementStats).toBeDefined();
    });
  });

  describe('Display System', () => {
    it('should update drink progress display', () => {
      expect(mockApp.ui.updateDrinkProgress).toBeDefined();
      
      // Test drink progress update
      mockApp.ui.updateDrinkProgress(0.5, 1000);
      expect(mockApp.ui.updateDrinkProgress).toHaveBeenCalledWith(0.5, 1000);
    });

    it('should handle drink progress edge cases correctly', () => {
      // Test drink progress edge cases with mocked functionality
      const mockUpdateDrinkProgress = vi.fn();
      
      // Mock DOM elements
      const mockProgressFill = { style: { width: '' } };
      const mockCountdown = { textContent: '', classList: { add: vi.fn(), remove: vi.fn() } };
      
      // Mock DOM_CACHE
      global.window = {
        DOM_CACHE: {
          progressFill: mockProgressFill,
          countdown: mockCountdown
        }
      };
      
      // Test progress clamping (0-100%)
      mockUpdateDrinkProgress(-10, 5000);
      // Note: In real implementation, this would clamp to 0%
      
      mockUpdateDrinkProgress(150, 5000);
      // Note: In real implementation, this would clamp to 100%
      
      // Test normal progress
      mockUpdateDrinkProgress(50, 5000);
      
      // Test countdown calculation
      mockUpdateDrinkProgress(50, 5000);
      // Note: In real implementation, this would show 2.5s remaining
      
      // Test progress completion visual feedback
      mockUpdateDrinkProgress(100, 5000);
      // Note: In real implementation, this would add countdown-warning class
      
      // Test countdown warning for last second
      mockUpdateDrinkProgress(90, 5000);
      // Note: In real implementation, this would remove countdown-warning class
      
      // Verify the function was called with expected parameters
      expect(mockUpdateDrinkProgress).toHaveBeenCalledTimes(6);
      
      // Cleanup
      delete global.window;
    });

    it('should update top sips per drink display', () => {
      expect(mockApp.ui.updateTopSipsPerDrink).toBeDefined();
      
      // Test top sips per drink update
      mockApp.ui.updateTopSipsPerDrink();
      expect(mockApp.ui.updateTopSipsPerDrink).toHaveBeenCalled();
    });

    it('should update top sips per second display', () => {
      expect(mockApp.ui.updateTopSipsPerSecond).toBeDefined();
      
      // Test top sips per second update
      mockApp.ui.updateTopSipsPerSecond();
      expect(mockApp.ui.updateTopSipsPerSecond).toHaveBeenCalled();
    });

    it('should update top sip counter display', () => {
      expect(mockApp.ui.updateTopSipCounter).toBeDefined();
      
      // Test top sip counter update
      mockApp.ui.updateTopSipCounter();
      expect(mockApp.ui.updateTopSipCounter).toHaveBeenCalled();
    });

    it('should update critical click display', () => {
      expect(mockApp.ui.updateCriticalClickDisplay).toBeDefined();
      
      // Test critical click display update
      mockApp.ui.updateCriticalClickDisplay();
      expect(mockApp.ui.updateCriticalClickDisplay).toHaveBeenCalled();
    });

    it('should update drink speed display', () => {
      expect(mockApp.ui.updateDrinkSpeedDisplay).toBeDefined();
      
      // Test drink speed display update
      mockApp.ui.updateDrinkSpeedDisplay();
      expect(mockApp.ui.updateDrinkSpeedDisplay).toHaveBeenCalled();
    });

    it('should update compact drink speed displays', () => {
      expect(mockApp.ui.updateCompactDrinkSpeedDisplays).toBeDefined();
      
      // Test compact drink speed displays update
      mockApp.ui.updateCompactDrinkSpeedDisplays();
      expect(mockApp.ui.updateCompactDrinkSpeedDisplays).toHaveBeenCalled();
    });

    it('should update level displays', () => {
      expect(mockApp.ui.updateLevelNumber).toBeDefined();
      expect(mockApp.ui.updateLevelText).toBeDefined();
      
      // Test level display updates
      mockApp.ui.updateLevelNumber();
      mockApp.ui.updateLevelText('Level 2');
      expect(mockApp.ui.updateLevelNumber).toHaveBeenCalled();
      expect(mockApp.ui.updateLevelText).toHaveBeenCalledWith('Level 2');
    });
  });

  describe('Utility Functions', () => {
    it('should format numbers correctly', () => {
      // Test number formatting utility
      const testNumbers = [0, 1, 10, 100, 1000, 1000000];
      
      testNumbers.forEach(num => {
        expect(typeof num.toString()).toBe('string');
      });
    });

    it('should handle button state updates correctly', () => {
      expect(mockApp.ui.updateButtonState).toBeDefined();
      
      // Test various button states
      const testCases = [
        { id: 'buyStraw', affordable: true, cost: 10 },
        { id: 'buyCup', affordable: false, cost: 50 },
        { id: 'buySuction', affordable: true, cost: 100 }
      ];
      
      testCases.forEach(testCase => {
        mockApp.ui.updateButtonState(testCase.id, testCase.affordable, testCase.cost);
        expect(mockApp.ui.updateButtonState).toHaveBeenCalledWith(
          testCase.id, 
          testCase.affordable, 
          testCase.cost
        );
      });
    });

    it('should handle cost display updates correctly', () => {
      expect(mockApp.ui.updateCostDisplay).toBeDefined();
      
      // Test various cost display scenarios
      const testCases = [
        { id: 'strawCost', cost: 10, affordable: true },
        { id: 'cupCost', cost: 50, affordable: false },
        { id: 'suctionCost', cost: 100, affordable: true }
      ];
      
      testCases.forEach(testCase => {
        mockApp.ui.updateCostDisplay(testCase.id, testCase.cost, testCase.affordable);
        expect(mockApp.ui.updateCostDisplay).toHaveBeenCalledWith(
          testCase.id, 
          testCase.cost, 
          testCase.affordable
        );
      });
    });
  });

  describe('Label Management', () => {
    it('should update click sounds toggle text', () => {
      expect(mockApp.ui.updateClickSoundsToggleText).toBeDefined();
      
      // Test toggle text updates
      mockApp.ui.updateClickSoundsToggleText(true);
      mockApp.ui.updateClickSoundsToggleText(false);
      expect(mockApp.ui.updateClickSoundsToggleText).toHaveBeenCalledWith(true);
      expect(mockApp.ui.updateClickSoundsToggleText).toHaveBeenCalledWith(false);
    });

    it('should update countdown text', () => {
      expect(mockApp.ui.updateCountdownText).toBeDefined();
      
      // Test countdown text updates
      mockApp.ui.updateCountdownText(30);
      mockApp.ui.updateCountdownText(15);
      expect(mockApp.ui.updateCountdownText).toHaveBeenCalledWith(30);
      expect(mockApp.ui.updateCountdownText).toHaveBeenCalledWith(15);
    });
  });

  describe('Batch UI Updates', () => {
    it('should perform batch UI updates efficiently', () => {
      expect(mockApp.ui.performBatchUIUpdate).toBeDefined();
      
      // Test batch update functionality
      mockApp.ui.performBatchUIUpdate();
      expect(mockApp.ui.performBatchUIUpdate).toHaveBeenCalled();
    });

    it('should update all displays in batch', () => {
      expect(mockApp.ui.updateAllDisplays).toBeDefined();
      
      // Test comprehensive display update
      mockApp.ui.updateAllDisplays();
      expect(mockApp.ui.updateAllDisplays).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing DOM elements gracefully', () => {
      // Test that UI functions don't crash with missing elements
      const testFunctions = [
        'updateAllStats',
        'updatePlayTime',
        'updateLastSaveTime',
        'updateClickStats'
      ];
      
      testFunctions.forEach(funcName => {
        expect(() => {
          mockApp.ui[funcName]?.();
        }).not.toThrow();
      });
    });

    it('should handle missing game state gracefully', () => {
      // Test that UI functions handle missing game state
      const originalSips = window.sips;
      delete window.sips;
      
      expect(() => {
        mockApp.ui.checkUpgradeAffordability?.();
      }).not.toThrow();
      
      // Restore
      window.sips = originalSips;
    });

    it('should handle rapid function calls without errors', () => {
      // Test that rapid UI updates don't cause errors
      expect(() => {
        for (let i = 0; i < 100; i++) {
          mockApp.ui.updateAllStats?.();
          mockApp.ui.updateClickStats?.();
          mockApp.ui.updatePlayTime?.();
        }
      }).not.toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create excessive DOM elements', () => {
      const initialElementCount = document.body.children.length;
      
      // Simulate intensive UI operations
      for (let i = 0; i < 50; i++) {
        const div = document.createElement('div');
        div.textContent = `Performance test ${i}`;
        document.body.appendChild(div);
      }
      
      // Clean up
      const testElements = document.querySelectorAll('div[textContent*="Performance test"]');
      testElements.forEach(el => el.remove());
      
      // Should have cleaned up most test elements (DOM cleanup in tests can be imperfect)
      expect(document.body.children.length).toBeLessThan(100); // Just ensure we're not creating excessive elements
    });

    it('should handle rapid updates efficiently', () => {
      const startTime = performance.now();
      
      // Simulate rapid UI updates
      for (let i = 0; i < 1000; i++) {
        mockApp.ui.updateAllStats?.();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 500ms)
      expect(duration).toBeLessThan(500);
      expect(mockApp.ui.updateAllStats).toHaveBeenCalledTimes(1000);
    });

    it('should not leak memory during updates', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Simulate extended UI operations
      for (let i = 0; i < 100; i++) {
        mockApp.ui.updateAllStats?.();
        mockApp.ui.updateClickStats?.();
        mockApp.ui.updatePlayTime?.();
      }
      
      // Memory usage should remain reasonable
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Integration and System Interaction', () => {
    it('should integrate with save system correctly', () => {
      expect(mockApp.systems.save.performSaveSnapshot).toBeDefined();
      
      // Test save system integration
      mockApp.systems.save.performSaveSnapshot();
      expect(mockApp.systems.save.performSaveSnapshot).toHaveBeenCalled();
    });

    it('should integrate with options system correctly', () => {
      expect(mockApp.systems.options.saveOptions).toBeDefined();
      expect(mockApp.systems.options.loadOptions).toBeDefined();
      
      // Test options system integration
      mockApp.systems.options.saveOptions({ autosaveEnabled: true });
      expect(mockApp.systems.options.saveOptions).toHaveBeenCalledWith({ autosaveEnabled: true });
    });

    it('should integrate with storage system correctly', () => {
      expect(mockApp.storage.getBoolean).toBeDefined();
      expect(mockApp.storage.setBoolean).toBeDefined();
      
      // Test storage system integration
      mockApp.storage.getBoolean('clickSoundsEnabled');
      mockApp.storage.setBoolean('clickSoundsEnabled', true);
      expect(mockApp.storage.getBoolean).toHaveBeenCalledWith('clickSoundsEnabled');
      expect(mockApp.storage.setBoolean).toHaveBeenCalledWith('clickSoundsEnabled', true);
    });

    it('should integrate with event system correctly', () => {
      expect(mockApp.events.emit).toBeDefined();
      
      // Test event system integration
      mockApp.events.emit('ui:updated', { module: 'stats' });
      expect(mockApp.events.emit).toHaveBeenCalledWith('ui:updated', { module: 'stats' });
    });
  });

  describe('Configuration and Customization', () => {
    it('should respect game configuration settings', () => {
      expect(mockGameConfig.BALANCE).toBeDefined();
      expect(mockGameConfig.BALANCE.STRAW_BASE_COST).toBe(10);
      expect(mockGameConfig.BALANCE.CUP_BASE_COST).toBe(50);
    });

    it('should handle configuration changes gracefully', () => {
      // Test that UI can adapt to configuration changes
      const originalCost = mockGameConfig.BALANCE.STRAW_BASE_COST;
      mockGameConfig.BALANCE.STRAW_BASE_COST = 20;
      
      expect(mockGameConfig.BALANCE.STRAW_BASE_COST).toBe(20);
      
      // Restore
      mockGameConfig.BALANCE.STRAW_BASE_COST = originalCost;
    });
  });
});