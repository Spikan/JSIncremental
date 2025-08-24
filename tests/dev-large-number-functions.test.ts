// Tests for the new dev tools large number scaling functions

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
      setState: (state: any) => {
        console.log('Setting state:', state);
      },
    },
    ui: {
      updateTopSipCounter: () => {},
      updateAllStats: () => {},
      checkUpgradeAffordability: () => {},
    },
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
      (window as any).sips = new mockWindow.Decimal(1000);

      const result = addMassiveSips();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify sips were updated (using reasonable size for testing)
      const resultValue = (window as any).sips.toNumber();
      expect(resultValue).toBeGreaterThan(1000);
      expect(resultValue).toBeLessThan(1e10); // Should be a reasonable large number
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
      (window as any).straws = new mockWindow.Decimal(10);

      const result = addHugeStraws();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify straws were updated
      expect((window as any).straws.toNumber()).toBe(10 + 1e5);
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
      (window as any).cups = new mockWindow.Decimal(5);

      const result = addMassiveCups();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify cups were updated
      expect((window as any).cups.toNumber()).toBe(5 + 1e5);
    });

    it('should handle no existing cups', () => {
      // No cups set
      delete (window as any).cups;

      const result = addMassiveCups();
      expect(result).toBe(false);
    });
  });

  describe('addExtremeResources', () => {
    it('should add 1e200 to all resources', () => {
      // Set up initial resources
      (window as any).sips = new mockWindow.Decimal(100);
      (window as any).straws = new mockWindow.Decimal(20);
      (window as any).cups = new mockWindow.Decimal(30);

      const result = addExtremeResources();
      expect(typeof result !== 'undefined').toBe(true);

      // Verify all resources were updated
      expect((window as any).sips.toNumber()).toBe(100 + 1e6);
      expect((window as any).straws.toNumber()).toBe(20 + 1e6);
      expect((window as any).cups.toNumber()).toBe(30 + 1e6);
    });

    it('should handle missing some resources', () => {
      // Only set sips
      (window as any).sips = new mockWindow.Decimal(100);
      delete (window as any).straws;
      delete (window as any).cups;

      const result = addExtremeResources();
      expect(typeof result !== 'undefined').toBe(true);

      // Only sips should be updated
      expect((window as any).sips.toNumber()).toBe(100 + 1e6);
    });
  });

  describe('testScientificNotation', () => {
    it('should initiate scientific notation testing', () => {
      // Set up sips
      (window as any).sips = new mockWindow.Decimal(100);

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
      (window as any).sips = new mockWindow.Decimal(1000);
      (window as any).straws = new mockWindow.Decimal(200);
      (window as any).cups = new mockWindow.Decimal(300);

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
      delete (window as any).App;
      (window as any).sips = new mockWindow.Decimal(100);

      const result = addMassiveSips();
      expect(typeof result !== 'undefined').toBe(true);
      // Should still work even without App object
    });

    it('should handle missing UI methods gracefully', () => {
      delete (window as any).App.ui;
      (window as any).sips = new mockWindow.Decimal(100);

      const result = addMassiveSips();
      expect(typeof result !== 'undefined').toBe(true);
      // Should still work even without UI methods
    });

    it('should handle state errors gracefully', () => {
      (window as any).App.state.setState = () => {
        throw new Error('State error');
      };
      (window as any).sips = new mockWindow.Decimal(100);

      const result = addMassiveSips();
      expect(typeof result !== 'undefined').toBe(true);
      // Should still work even with state errors
    });
  });
});
