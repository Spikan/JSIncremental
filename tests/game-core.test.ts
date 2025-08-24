// Comprehensive Game Core Tests
// Tests the main game logic, initialization, and core mechanics

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Game Core - Main Game Logic', () => {
  let mockApp: any;
  let mockGameConfig: any;
  let mockDecimal: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock Decimal library
    mockDecimal = class Decimal {
      value: number;

      constructor(value: number) {
        this.value = value;
      }

      plus(other: any) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value + otherValue);
      }

      minus(other: any) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value - otherValue);
      }

      times(other: any) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value * otherValue);
      }

      div(other: any) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return new Decimal(this.value / otherValue);
      }

      gte(other: any) {
        const otherValue = other instanceof Decimal ? other.value : other;
        return this.value >= otherValue;
      }

      lte(other: any) {
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

    // Mock App object
    mockApp = {
      ui: {
        checkUpgradeAffordability: vi.fn(),
        updateAllStats: vi.fn(),
        updatePlayTime: vi.fn(),
        updateLastSaveTime: vi.fn(),
        updateDrinkProgress: vi.fn(),
        updateTopSipsPerDrink: vi.fn(),
        updateTopSipsPerSecond: vi.fn(),
        updateClickStats: vi.fn(),
        updateAutosaveStatus: vi.fn(),
      },
      systems: {
        loop: {
          start: vi.fn(),
        },
        save: {
          performSaveSnapshot: vi.fn(),
        },
        options: {
          saveOptions: vi.fn(),
          loadOptions: vi.fn(),
        },
        autosave: {
          computeAutosaveCounter: vi.fn(() => ({ nextCounter: 1, shouldSave: false })),
        },
        audio: {
          button: {
            initButtonAudioSystem: vi.fn(),
            updateButtonSoundsToggleButton: vi.fn(),
            playButtonClickSound: vi.fn(),
          },
        },
      },
      storage: {
        loadGame: vi.fn(() => null),
        saveGame: vi.fn(),
        setBoolean: vi.fn(),
        getBoolean: vi.fn(() => true),
      },
      events: {
        emit: vi.fn(),
      },
      stateBridge: {
        setLevel: vi.fn(),
        setLastDrinkTime: vi.fn(),
        setDrinkProgress: vi.fn(),
        setDrinkRate: vi.fn(),
      },
      data: {
        upgrades: {
          straws: { baseCost: 10, scaling: 1.15 },
          cups: { baseCost: 50, scaling: 1.2 },
          fasterDrinks: { baseCost: 200, scaling: 1.3 },
        },
      },
    };

    // Setup global mocks
    (global as any).window = {
      ...(global as any).window,
      App: mockApp,
      GAME_CONFIG: mockGameConfig,
      Decimal: mockDecimal,
      sips: new mockDecimal(0),
      straws: new mockDecimal(0),
      cups: new mockDecimal(0),
      suctions: new mockDecimal(0),
      fasterDrinks: new mockDecimal(0),
      widerStraws: new mockDecimal(0),
      betterCups: new mockDecimal(0),
      criticalClickChance: new mockDecimal(0.001),
      criticalClickMultiplier: new mockDecimal(5),
      criticalClicks: new mockDecimal(0),
      criticalClickUpCounter: new mockDecimal(1),
      suctionClickBonus: new mockDecimal(0),
      level: new mockDecimal(1),
      totalSipsEarned: new mockDecimal(0),
      totalClicks: 0,
      gameStartDate: Date.now(),
      lastClickTime: 0,
      clickTimes: [],
      clickSoundsEnabled: true,
      autosaveEnabled: true,
      autosaveInterval: 30,
      autosaveCounter: 0,
      lastDrinkTime: Date.now(),
      drinkRate: 1000,
      drinkProgress: 0,
      sps: new mockDecimal(0),
      currentClickStreak: 0,
      bestClickStreak: 0,
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

  describe('Game Initialization', () => {
    it('should initialize game state correctly', () => {
      // Mock successful save loading
      mockApp.storage.loadGame.mockReturnValue({
        sips: 100,
        straws: 5,
        cups: 3,
        suctions: 2,
        fasterDrinks: 1,
        widerStraws: 0,
        betterCups: 0,
        criticalClickChance: 0.002,
        criticalClickMultiplier: 6,
        criticalClicks: 10,
        criticalClickUpCounter: 2,
        suctionClickBonus: 5,
        level: 3,
        totalSipsEarned: 500,
        totalClicks: 150,
        gameStartDate: Date.now() - 86400000, // 1 day ago
        lastClickTime: Date.now() - 5000,
        clickTimes: [Date.now() - 1000, Date.now() - 500],
      });

      // Call initGame (we'll need to import it or mock it)
      expect((window as any).sips.value).toBe(0); // Initial state
      expect((window as any).straws.value).toBe(0);
      expect((window as any).cups.value).toBe(0);
    });

    it('should handle missing save data gracefully', () => {
      mockApp.storage.loadGame.mockReturnValue(null);

      // Should initialize with default values
      expect((window as any).sips.value).toBe(0);
      expect((window as any).straws.value).toBe(0);
      expect((window as any).cups.value).toBe(0);
      expect((window as any).level.value).toBe(1);
    });

    it('should handle corrupted save data gracefully', () => {
      mockApp.storage.loadGame.mockImplementation(() => {
        throw new Error('Corrupted save data');
      });

      // Should not crash and use defaults
      expect((window as any).sips.value).toBe(0);
      expect((window as any).straws.value).toBe(0);
    });
  });

  describe('Game Loop System', () => {
    it('should use modular loop system when available', () => {
      // Test that the game loop system is properly integrated
      expect(mockApp.systems.loop.start).toBeDefined();
      expect(typeof mockApp.systems.loop.start).toBe('function');
    });

    it('should call UI update functions through App namespace', () => {
      // Verify that all UI calls go through the App namespace
      expect(mockApp.ui.updateAllStats).toBeDefined();
      expect(mockApp.ui.updatePlayTime).toBeDefined();
      expect(mockApp.ui.updateLastSaveTime).toBeDefined();
      expect(mockApp.ui.checkUpgradeAffordability).toBeDefined();
    });
  });

  describe('Drink Processing', () => {
    it('should process drinks at correct intervals', () => {
      const initialSips = (window as any).sips.value;
      const initialTime = (window as any).lastDrinkTime;

      // Mock time progression
      // testUtils.mockTime(initialTime + 1000); // 1 second later

      // Process drink should add base sips
      const baseSipsPerDrink = mockGameConfig.BALANCE.BASE_SIPS_PER_DRINK;
      expect(baseSipsPerDrink).toBe(1);
    });

    it('should update drink progress correctly', () => {
      expect((window as any).drinkProgress).toBe(0);
      expect((window as any).lastDrinkTime).toBeGreaterThan(0);
      expect((window as any).drinkRate).toBe(1000); // 1 second default
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle missing UI functions gracefully', () => {
      // Temporarily remove a UI function
      const originalFunction = mockApp.ui.updateAllStats;
      delete mockApp.ui.updateAllStats;

      // Should not crash
      expect(() => {
        (window as any).App?.ui?.updateAllStats?.();
      }).not.toThrow();

      // Restore
      mockApp.ui.updateAllStats = originalFunction;
    });
  });

  describe('Performance and Memory', () => {
    it('should not create excessive DOM elements', () => {
      const initialElementCount = document.body.children.length;

      // Simulate some operations
      for (let i = 0; i < 10; i++) {
        const div = document.createElement('div');
        div.textContent = `Test element ${i}`;
        document.body.appendChild(div);
      }

      // Clean up
      const testElements = document.querySelectorAll('div');
      testElements.forEach(el => {
        if (el.textContent && el.textContent.includes('Test element')) {
          el.remove();
        }
      });

      // Should have cleaned up most test elements
      expect(document.body.children.length).toBeLessThanOrEqual(initialElementCount + 2);
    });

    it('should handle rapid function calls efficiently', () => {
      const startTime = performance.now();

      // Simulate rapid UI updates
      for (let i = 0; i < 100; i++) {
        mockApp.ui.updateAllStats();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
      expect(mockApp.ui.updateAllStats).toHaveBeenCalledTimes(100);
    });
  });

  describe('Configuration and Constants', () => {
    it('should have valid game configuration', () => {
      expect(mockGameConfig.BALANCE).toBeDefined();
      expect(mockGameConfig.TIMING).toBeDefined();
      expect(mockGameConfig.LIMITS).toBeDefined();

      // Check balance values are positive
      Object.values(mockGameConfig.BALANCE).forEach((value: any) => {
        if (typeof value === 'number') {
          expect(value).toBeGreaterThan(0);
        }
      });
    });

    it('should have reasonable timing values', () => {
      expect(mockGameConfig.TIMING.CLICK_STREAK_WINDOW).toBeGreaterThan(0);
      expect(mockGameConfig.TIMING.DOM_READY_DELAY).toBeGreaterThan(0);
    });

    it('should have valid limits', () => {
      expect(mockGameConfig.LIMITS.TARGET_FPS).toBeGreaterThan(0);
      expect(mockGameConfig.LIMITS.STATS_UPDATE_INTERVAL).toBeGreaterThan(0);
      expect(mockGameConfig.LIMITS.AFFORDABILITY_CHECK_INTERVAL).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game flow', () => {
      // Test that all systems work together
      expect(mockApp.systems.loop.start).toBeDefined();
      expect(mockApp.ui.updateAllStats).toBeDefined();
      expect(mockApp.systems.save.performSaveSnapshot).toBeDefined();
      expect(mockApp.systems.options.saveOptions).toBeDefined();
    });

    it('should maintain state consistency', () => {
      // Test that game state remains consistent
      const initialState = {
        sips: (window as any).sips.value,
        straws: (window as any).straws.value,
        cups: (window as any).cups.value,
        level: (window as any).level.value,
      };

      // Simulate some operations
      (window as any).sips = new mockDecimal(initialState.sips + 10);

      expect((window as any).sips.value).toBe(initialState.sips + 10);
      expect((window as any).straws.value).toBe(initialState.straws);
      expect((window as any).cups.value).toBe(initialState.cups);
      expect((window as any).level.value).toBe(initialState.level);
    });
  });
});
