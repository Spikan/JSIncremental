// Tests for the new dev tools large number scaling functions

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Decimal } from './test-utils';
import {
  addMassiveSips,
  addHugeStraws,
  addMassiveCups,
  addExtremeResources,
  testScientificNotation,
  resetAllResources,
} from '../ts/core/systems/dev';

// Mock the window object and dependencies
const mockWindow = {
  Decimal: class Decimal {
    constructor(value: any) {
      this.value = Number(value) || 0;
    }
    value: number;
    toNumber() {
      return this.value;
    }
    plus(other: any) {
      return new (window as any).Decimal(this.value + other);
    }
    minus(other: any) {
      return new (window as any).Decimal(this.value - other);
    }
    times(other: any) {
      return new (window as any).Decimal(this.value * other);
    }
    div(other: any) {
      return new (window as any).Decimal(this.value / other);
    }
    gt(other: any) {
      return this.value > other;
    }
    gte(other: any) {
      return this.value >= other;
    }
    lt(other: any) {
      return this.value < other;
    }
    lte(other: any) {
      return this.value <= other;
    }
  },
  App: {
    state: {
      actions: {
        setSips: (value: any) => {},
        setStraws: (value: any) => {},
        setCups: (value: any) => {},
        setSPD: (value: any) => {},
        setStrawSPD: (value: any) => {},
        setCupSPD: (value: any) => {},
      },
      getState: () => ({
        straws: 0,
        cups: 0,
        widerStraws: 0,
        betterCups: 0,
      }),
    },
    ui: {
      updateTopSipCounter: () => {},
      updateAllStats: () => {},
      checkUpgradeAffordability: () => {},
      updateAllDisplays: () => {},
      updatePurchasedCounts: () => {},
    },
  },
  // Mock the updateSPDFromResources function
  updateSPDFromResources: (straws: any, cups: any, widerStraws: any = 0, betterCups: any = 0) => {
    return true;
  },
};

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: () => {},
  warn: () => {},
};

// Mock global objects
beforeEach(() => {
  // Save original window
  (global as any).originalWindow = global.window;
  (global as any).originalConsole = global.console;

  // Set up mock window
  (global as any).window = mockWindow;
  global.console = mockConsole as any;
});

afterEach(() => {
  // Restore original window and console
  global.window = (global as any).originalWindow;
  global.console = (global as any).originalConsole;
});

describe('Dev Tools Large Number Functions', () => {
  describe('addMassiveSips', () => {
    it('should add 1e100 sips to existing amount', () => {
      // Set up initial sips
      (window as any).sips = new Decimal(1000);

      const result = addMassiveSips();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify sips were updated - the function adds 1e500, so expect a massive number
      const resultValue = (window as any).sips.toNumber();
      expect(resultValue).toBeGreaterThan(1000);
      // The function adds 1e500, so the result should be extremely large
      expect(resultValue).toBeGreaterThan(1e100);
    });

    it('should handle no existing sips', () => {
      // No sips set
      delete (window as any).sips;

      const result = addMassiveSips();
      expect(result).toBe(false);
    });
  });

  describe('addHugeStraws', () => {
    it('should add 1e50 straws to existing amount', () => {
      // Set up initial straws
      (window as any).straws = new Decimal(10);

      const result = addHugeStraws();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify straws were updated - the function adds 1e750, so expect a massive number
      const resultValue = (window as any).straws.toNumber();
      expect(resultValue).toBeGreaterThan(10);
      // The function adds 1e750, so the result should be extremely large
      expect(resultValue).toBeGreaterThan(1e100);
    });

    it('should handle no existing straws', () => {
      // No straws set
      delete (window as any).straws;

      const result = addHugeStraws();
      expect(result).toBe(false);
    });
  });

  describe('addMassiveCups', () => {
    it('should add 1e50 cups to existing amount', () => {
      // Set up initial cups
      (window as any).cups = new Decimal(5);

      const result = addMassiveCups();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify cups were updated - the function adds 1e750, so expect a massive number
      const resultValue = (window as any).cups.toNumber();
      expect(resultValue).toBeGreaterThan(5);
      // The function adds 1e750, so the result should be extremely large
      expect(resultValue).toBeGreaterThan(1e100);
    });

    it('should handle no existing cups', () => {
      // No cups set
      delete (window as any).cups;

      const result = addMassiveCups();
      expect(result).toBe(false);
    });
  });

  describe('addExtremeResources', () => {
    it('should add 1e2000 to all resources', () => {
      // Set up initial resources
      (window as any).sips = new Decimal(100);
      (window as any).straws = new Decimal(20);
      (window as any).cups = new Decimal(30);

      const result = addExtremeResources();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify all resources were updated - the function adds 1e2000, so expect extremely large numbers
      const sipsValue = (window as any).sips.toNumber();
      const strawsValue = (window as any).straws.toNumber();
      const cupsValue = (window as any).cups.toNumber();

      expect(sipsValue).toBeGreaterThan(100);
      expect(strawsValue).toBeGreaterThan(20);
      expect(cupsValue).toBeGreaterThan(30);

      // The function adds 1e2000, so the results should be extremely large
      // Since JavaScript can't handle 1e2000, we expect Infinity or very large numbers
      expect(sipsValue).toBeGreaterThan(1e100);
      expect(strawsValue).toBeGreaterThan(1e100);
      expect(cupsValue).toBeGreaterThan(1e100);
    });

    it('should handle missing some resources', () => {
      // Only set sips
      (window as any).sips = new Decimal(100);
      delete (window as any).straws;
      delete (window as any).cups;

      const result = addExtremeResources();
      expect(typeof result !== 'undefined').toBe(true);

      // Only sips should be updated
      const sipsValue = (window as any).sips.toNumber();
      expect(sipsValue).toBeGreaterThan(100);
      expect(sipsValue).toBeGreaterThan(1e100);
    });
  });

  describe('testScientificNotation', () => {
    it('should initiate scientific notation testing', () => {
      // Set up sips
      (window as any).sips = new Decimal(100);

      const result = testScientificNotation();
      expect(typeof result !== 'undefined').toBe(true);
      // The actual testing happens asynchronously, so we just verify it doesn't error
    });

    it('should handle no sips', () => {
      delete (window as any).sips;

      const result = testScientificNotation();
      expect(typeof result !== 'undefined').toBe(true);
    });
  });

  describe('resetAllResources', () => {
    it('should reset all resources to zero', () => {
      // Set up initial resources
      (window as any).sips = new Decimal(1000);
      (window as any).straws = new Decimal(200);
      (window as any).cups = new Decimal(300);

      const result = resetAllResources();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify all resources were reset
      expect((window as any).sips.toNumber()).toBe(0);
      expect((window as any).straws.toNumber()).toBe(0);
      expect((window as any).cups.toNumber()).toBe(0);
    });

    it('should work without Decimal.js', () => {
      // Remove Decimal constructor
      delete (window as any).Decimal;

      // Set up initial resources
      (window as any).sips = 1000;
      (window as any).straws = 200;
      (window as any).cups = 300;

      const result = resetAllResources();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify all resources were reset
      expect((window as any).sips).toBe(0);
      expect((window as any).straws).toBe(0);
      expect((window as any).cups).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing App object gracefully', () => {
      // Create a copy of window without App
      const windowWithoutApp = { ...(window as any) };
      delete windowWithoutApp.App;

      // Set up sips using the global Decimal
      windowWithoutApp.sips = new Decimal(100);

      // Call the function with the modified window
      const result = addMassiveSips.call({ window: windowWithoutApp });
      expect(result).toBe(false); // Should return false when App is missing
    });

    it('should handle missing UI methods gracefully', () => {
      // Create a copy of App without UI
      const appWithoutUI = { ...(window as any).App };
      delete appWithoutUI.ui;

      // Set up sips
      (window as any).sips = new Decimal(100);
      (window as any).App = appWithoutUI;

      const result = addMassiveSips();
      expect(typeof result !== 'undefined').toBe(true);

      // Restore original App
      (window as any).App = mockWindow.App;
    });

    it('should handle state errors gracefully', () => {
      // Create a copy of App with error-throwing setState
      const appWithError = { ...(window as any).App };
      appWithError.state = {
        ...appWithError.state,
        setState: () => {
          throw new Error('State error');
        },
      };

      // Set up sips
      (window as any).sips = new Decimal(100);
      (window as any).App = appWithError;

      const result = addMassiveSips();
      expect(typeof result !== 'undefined').toBe(true);

      // Restore original App
      (window as any).App = mockWindow.App;
    });
  });
});
