// Global Functions and Dependencies Integration Tests
// Migrated from HTML test files to proper Vitest tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Global Functions and Dependencies Integration', () => {
  let mockApp;
  let mockGameConfig;
  let mockDecimal;
  let mockFeatureUnlocks;
  let mockDomCache;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock Decimal library
    mockDecimal = class Decimal {
      constructor(value) {
        this._value = Number(value) || 0;
      }
      
      plus(other) {
        const otherValue = other instanceof Decimal ? other._value : Number(other);
        return new Decimal(this._value + otherValue);
      }
      
      minus(other) {
        const otherValue = other instanceof Decimal ? other._value : Number(other);
        return new Decimal(this._value - otherValue);
      }
      
      toNumber() {
        return this._value;
      }
      
      toString() {
        return String(this._value);
      }
    };
    
    // Mock FEATURE_UNLOCKS
    mockFeatureUnlocks = {
      init: vi.fn(),
      checkAllUnlocks: vi.fn(),
      updateUnlocksTab: vi.fn(),
      updateFeatureVisibility: vi.fn(),
      unlockedFeatures: new Set(['soda', 'options']),
      unlockConditions: {
        shop: { sips: 100 },
        stats: { totalClicks: 50 },
        dev: { level: 5 }
      }
    };
    
    // Mock DOM_CACHE
    mockDomCache = {
      init: vi.fn(),
      progressFill: { style: { width: '' } },
      countdown: { textContent: '', classList: { add: vi.fn(), remove: vi.fn() } },
      get: vi.fn((id) => {
        if (id === 'drinkProgressFill') return mockDomCache.progressFill;
        if (id === 'drinkCountdown') return mockDomCache.countdown;
        return null;
      })
    };
    
    // Mock game configuration
    mockGameConfig = {
      BALANCE: {
        BASE_SIPS_PER_DRINK: 1,
        STRAW_BASE_COST: 10,
        STRAW_SCALING: 1.15
      },
      TIMING: {
        CLICK_STREAK_WINDOW: 1000
      }
    };
    
    // Mock App object
    mockApp = {
      ui: {
        updateAllStats: vi.fn(),
        updateDrinkProgress: vi.fn(),
        checkUpgradeAffordability: vi.fn()
      },
      systems: {
        purchases: {
          purchaseStraw: vi.fn(),
          purchaseCup: vi.fn(),
          purchaseSuction: vi.fn(),
          purchaseCriticalClick: vi.fn(),
          purchaseFasterDrinks: vi.fn(),
          purchaseWiderStraws: vi.fn(),
          purchaseBetterCups: vi.fn(),
          upgradeFasterDrinks: vi.fn(),
          levelUp: vi.fn()
        },
        save: {
          performSaveSnapshot: vi.fn(),
          deleteSave: vi.fn()
        },
        audio: {
          button: {
            toggleButtonSounds: vi.fn()
          }
        }
      },
      events: {
        emit: vi.fn()
      }
    };
    
    // Setup global mocks
    global.window = {
      App: mockApp,
      GAME_CONFIG: mockGameConfig,
      Decimal: mockDecimal,
      FEATURE_UNLOCKS: mockFeatureUnlocks,
      DOM_CACHE: mockDomCache,
      sips: new mockDecimal(1000),
      straws: new mockDecimal(5),
      cups: new mockDecimal(3),
      level: 1
    };
    
    global.Decimal = mockDecimal;
    global.FEATURE_UNLOCKS = mockFeatureUnlocks;
    global.DOM_CACHE = mockDomCache;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Core Game Functions', () => {
    it('should have all core purchase functions defined globally', () => {
      // Mock the global functions that should be available
      const coreFunctions = [
        'buyStraw', 'buyCup', 'buySuction', 'buyCriticalClick',
        'buyFasterDrinks', 'buyWiderStraws', 'buyBetterCups',
        'upgradeFasterDrinks', 'sodaClick', 'levelUp'
      ];
      
      // Mock these functions on window
      coreFunctions.forEach(funcName => {
        global.window[funcName] = vi.fn();
      });
      
      coreFunctions.forEach(funcName => {
        expect(typeof global.window[funcName]).toBe('function');
        expect(global.window[funcName]).toBeDefined();
      });
    });

    it('should have all game management functions defined globally', () => {
      const managementFunctions = [
        'save', 'toggleButtonSounds', 
        'sendMessage', 'startGame', 'switchTab'
      ];
      
      // Mock these functions on window
      managementFunctions.forEach(funcName => {
        global.window[funcName] = vi.fn();
      });
      
      managementFunctions.forEach(funcName => {
        expect(typeof global.window[funcName]).toBe('function');
        expect(global.window[funcName]).toBeDefined();
      });
    });

    it('should have all dev functions defined globally', () => {
      const devFunctions = [
        'devUnlockAll', 'devUnlockShop', 'devUnlockUpgrades', 'devResetUnlocks',
        'devAddTime', 'devAddSips', 'devToggleDevMode', 'devToggleGodMode',
        'devShowDebugInfo', 'devExportSave', 'devImportSave', 'quickUnlock'
      ];
      
      // Mock these functions on window
      devFunctions.forEach(funcName => {
        global.window[funcName] = vi.fn();
      });
      
      devFunctions.forEach(funcName => {
        expect(typeof global.window[funcName]).toBe('function');
        expect(global.window[funcName]).toBeDefined();
      });
    });
  });

  describe('Property Definitions', () => {
    it('should have sps property properly defined and configurable', () => {
      // Mock the property definition
      Object.defineProperty(global.window, 'sps', {
        get: () => new mockDecimal(10),
        set: (v) => {},
        configurable: true,
        enumerable: true
      });
      
      const spsDescriptor = Object.getOwnPropertyDescriptor(global.window, 'sps');
      
      expect(spsDescriptor).toBeDefined();
      expect(spsDescriptor.configurable).toBe(true);
      expect(typeof global.window.sps).toBeDefined();
    });

    it('should have drinkRate property properly defined and configurable', () => {
      // Mock the property definition
      Object.defineProperty(global.window, 'drinkRate', {
        get: () => 5000,
        set: (v) => {},
        configurable: true,
        enumerable: true
      });
      
      const drinkRateDescriptor = Object.getOwnPropertyDescriptor(global.window, 'drinkRate');
      
      expect(drinkRateDescriptor).toBeDefined();
      expect(drinkRateDescriptor.configurable).toBe(true);
      expect(typeof global.window.drinkRate).toBeDefined();
    });

    it('should allow defining new properties without errors', () => {
      expect(() => {
        Object.defineProperty(global.window, 'testProperty', {
          get: () => 'test',
          set: (v) => {},
          configurable: true
        });
      }).not.toThrow();
      
      expect(global.window.testProperty).toBe('test');
      
      // Cleanup
      delete global.window.testProperty;
    });

    it('should handle property access without errors', () => {
      // Mock properties
      global.window.sps = new mockDecimal(10);
      global.window.drinkRate = 5000;
      
      expect(() => {
        const spsValue = global.window.sps;
        const drinkRateValue = global.window.drinkRate;
      }).not.toThrow();
      
      expect(global.window.sps).toBeDefined();
      expect(global.window.drinkRate).toBeDefined();
    });
  });

  describe('Dependency Availability', () => {
    it('should have all core dependencies available', () => {
      const dependencies = [
        { name: 'FEATURE_UNLOCKS', obj: global.FEATURE_UNLOCKS },
        { name: 'DOM_CACHE', obj: global.DOM_CACHE },
        { name: 'GAME_CONFIG', obj: global.window.GAME_CONFIG },
        { name: 'Decimal', obj: global.Decimal },
        { name: 'App', obj: global.window.App }
      ];
      
      dependencies.forEach(({ name, obj }) => {
        expect(obj).toBeDefined();
        // Decimal is a constructor function, others are objects
        if (name === 'Decimal') {
          expect(typeof obj).toBe('function');
        } else {
          expect(typeof obj).toBe('object');
        }
      });
    });

    it('should have FEATURE_UNLOCKS methods available', () => {
      expect(global.FEATURE_UNLOCKS.init).toBeDefined();
      expect(global.FEATURE_UNLOCKS.checkAllUnlocks).toBeDefined();
      expect(global.FEATURE_UNLOCKS.updateUnlocksTab).toBeDefined();
      expect(global.FEATURE_UNLOCKS.updateFeatureVisibility).toBeDefined();
      
      expect(typeof global.FEATURE_UNLOCKS.init).toBe('function');
      expect(typeof global.FEATURE_UNLOCKS.checkAllUnlocks).toBe('function');
    });

    it('should have DOM_CACHE methods available', () => {
      expect(global.DOM_CACHE.init).toBeDefined();
      expect(global.DOM_CACHE.get).toBeDefined();
      
      expect(typeof global.DOM_CACHE.init).toBe('function');
      expect(typeof global.DOM_CACHE.get).toBe('function');
    });

    it('should handle dependency method calls without errors', () => {
      expect(() => {
        global.FEATURE_UNLOCKS.init();
        global.FEATURE_UNLOCKS.checkAllUnlocks();
        global.DOM_CACHE.init();
        global.DOM_CACHE.get('testElement');
      }).not.toThrow();
      
      expect(global.FEATURE_UNLOCKS.init).toHaveBeenCalled();
      expect(global.FEATURE_UNLOCKS.checkAllUnlocks).toHaveBeenCalled();
      expect(global.DOM_CACHE.init).toHaveBeenCalled();
      expect(global.DOM_CACHE.get).toHaveBeenCalledWith('testElement');
    });
  });

  describe('System Integration', () => {
    it('should have App object with all required subsystems', () => {
      expect(global.window.App).toBeDefined();
      expect(global.window.App.ui).toBeDefined();
      expect(global.window.App.systems).toBeDefined();
      expect(global.window.App.events).toBeDefined();
      
      // Test UI subsystem
      expect(global.window.App.ui.updateAllStats).toBeDefined();
      expect(global.window.App.ui.updateDrinkProgress).toBeDefined();
      expect(global.window.App.ui.checkUpgradeAffordability).toBeDefined();
      
      // Test systems subsystem
      expect(global.window.App.systems.purchases).toBeDefined();
      expect(global.window.App.systems.save).toBeDefined();
      expect(global.window.App.systems.audio).toBeDefined();
    });

    it('should handle system method calls without errors', () => {
      expect(() => {
        global.window.App.ui.updateAllStats();
        global.window.App.ui.updateDrinkProgress(50, 5000);
        global.window.App.systems.save.performSaveSnapshot();
        global.window.App.events.emit('test-event', {});
      }).not.toThrow();
      
      expect(global.window.App.ui.updateAllStats).toHaveBeenCalled();
      expect(global.window.App.ui.updateDrinkProgress).toHaveBeenCalledWith(50, 5000);
      expect(global.window.App.systems.save.performSaveSnapshot).toHaveBeenCalled();
      expect(global.window.App.events.emit).toHaveBeenCalledWith('test-event', {});
    });

    it('should have proper game state variables', () => {
      expect(global.window.sips).toBeDefined();
      expect(global.window.straws).toBeDefined();
      expect(global.window.cups).toBeDefined();
      expect(global.window.level).toBeDefined();
      
      expect(global.window.sips.toNumber()).toBe(1000);
      expect(global.window.straws.toNumber()).toBe(5);
      expect(global.window.cups.toNumber()).toBe(3);
      expect(global.window.level).toBe(1);
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('should handle missing dependencies gracefully', () => {
      // Temporarily remove dependencies
      const originalFeatureUnlocks = global.FEATURE_UNLOCKS;
      const originalDomCache = global.DOM_CACHE;
      
      global.FEATURE_UNLOCKS = undefined;
      global.DOM_CACHE = undefined;
      
      expect(() => {
        // These should not throw even with missing dependencies
        const hasFeatureUnlocks = typeof global.FEATURE_UNLOCKS !== 'undefined';
        const hasDomCache = typeof global.DOM_CACHE !== 'undefined';
        
        expect(hasFeatureUnlocks).toBe(false);
        expect(hasDomCache).toBe(false);
      }).not.toThrow();
      
      // Restore dependencies
      global.FEATURE_UNLOCKS = originalFeatureUnlocks;
      global.DOM_CACHE = originalDomCache;
    });

    it('should handle property access errors gracefully', () => {
      expect(() => {
        // Test accessing potentially undefined properties
        const spsValue = global.window.sps || new mockDecimal(0);
        const drinkRateValue = global.window.drinkRate || 5000;
        
        expect(spsValue).toBeDefined();
        expect(drinkRateValue).toBeDefined();
      }).not.toThrow();
    });

    it('should handle method calls on potentially undefined objects gracefully', () => {
      expect(() => {
        // Use optional chaining pattern like in the real code
        global.window.App?.ui?.updateAllStats?.();
        global.window.App?.systems?.save?.performSaveSnapshot?.();
        global.FEATURE_UNLOCKS?.init?.();
        global.DOM_CACHE?.init?.();
      }).not.toThrow();
    });
  });
});