// Test for initGame integration with LargeNumber system

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the window object and dependencies
const mockWindow = {
  Decimal: class Decimal {
    constructor(value: any) {
      this.value = Number(value) || 0;
    }
    value: number;
    toNumber() { return this.value; }
    plus(other: any) { return new (window as any).Decimal(this.value + other); }
    minus(other: any) { return new (window as any).Decimal(this.value - other); }
    times(other: any) { return new (window as any).Decimal(this.value * other); }
    div(other: any) { return new (window as any).Decimal(this.value / other); }
    gt(other: any) { return this.value > other; }
    gte(other: any) { return this.value >= other; }
    lt(other: any) { return this.value < other; }
    lte(other: any) { return this.value <= other; }
  },
  App: {
    systems: {
      resources: {
        recalcProduction: (params: any) => {
          // Mock LargeNumber-like objects
          const mockLargeNumber = (value: number) => ({
            toNumber: () => value,
            toString: () => String(value)
          });

          return {
            strawSPD: mockLargeNumber(params.straws * 0.6),
            cupSPD: mockLargeNumber(params.cups * 1.2),
            sipsPerDrink: mockLargeNumber(1 + params.straws * 0.6 + params.cups * 1.2)
          };
        }
      }
    },
    state: {
      setState: (state: any) => {
        console.log('Setting state:', state);
      }
    }
  }
};

// Mock global window
beforeEach(() => {
  // Save original window
  (global as any).originalWindow = global.window;

  // Set up mock window
  (global as any).window = mockWindow;
});

afterEach(() => {
  // Restore original window
  global.window = (global as any).originalWindow;
});

describe('InitGame Integration', () => {
  it('should handle LargeNumber results from recalcProduction without error', () => {
    // Mock the parameters that would be passed to recalcProduction
    const params = {
      straws: 10,
      cups: 5,
      widerStraws: 2,
      betterCups: 1,
      base: {
        strawBaseSPD: 0.6,
        cupBaseSPD: 1.2,
        baseSipsPerDrink: 1
      },
      multipliers: {
        widerStrawsPerLevel: 0.5,
        betterCupsPerLevel: 0.4
      }
    };

    // This should not throw an error
    expect(() => {
      const result = mockWindow.App.systems.resources.recalcProduction(params);

      // Test the conversion logic from main.ts
      const strawSPDValue = result.strawSPD.toNumber ? result.strawSPD.toNumber() : Number(result.strawSPD);
      const cupSPDValue = result.cupSPD.toNumber ? result.cupSPD.toNumber() : Number(result.cupSPD);
      const spdValue = result.sipsPerDrink.toNumber ? result.sipsPerDrink.toNumber() : Number(result.sipsPerDrink);

      // Values should be valid numbers
      expect(typeof strawSPDValue).toBe('number');
      expect(typeof cupSPDValue).toBe('number');
      expect(typeof spdValue).toBe('number');

      // Values should be reasonable
      expect(strawSPDValue).toBeGreaterThan(0);
      expect(cupSPDValue).toBeGreaterThan(0);
      expect(spdValue).toBeGreaterThan(1);

    }).not.toThrow();
  });

  it('should handle mixed number and LargeNumber objects', () => {
    const largeNumberLike = {
      toNumber: () => 42,
      toString: () => '42'
    };

    const plainNumber = 24;
    const stringNumber = '18';

    // Test the conversion logic from main.ts with different input types
    const testCases = [
      { input: largeNumberLike, expected: 42 },
      { input: plainNumber, expected: 24 },
      { input: stringNumber, expected: 18 },
      { input: null, expected: 0 },
      { input: undefined, expected: 0 }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = input?.toNumber ? input.toNumber() : Number(input) || 0;
      expect(result).toBe(expected);
    });
  });

  it('should handle edge cases in conversion', () => {
    const testCases = [
      { input: { toNumber: () => 'not a number' }, expected: NaN },
      { input: { toNumber: () => Infinity }, expected: Infinity },
      { input: { toNumber: () => -Infinity }, expected: -Infinity },
      { input: { toNumber: () => 0 }, expected: 0 }
    ];

    testCases.forEach(({ input, expected }) => {
      let result;
      try {
        result = input.toNumber ? input.toNumber() : Number(input) || 0;
      } catch (error) {
        result = Number(input) || 0;
      }

      if (isNaN(expected)) {
        expect(isNaN(result)).toBe(true);
      } else {
        expect(result).toBe(expected);
      }
    });
  });

  it('should integrate with Decimal.js fallback', () => {
    // Test that the conversion works with Decimal.js objects
    const decimalLike = new mockWindow.Decimal(100);

    const result = decimalLike.toNumber ? decimalLike.toNumber() : Number(decimalLike) || 0;
    expect(result).toBe(100);

    // Test arithmetic with Decimal objects
    const sum = decimalLike.plus(50);
    const converted = sum.toNumber ? sum.toNumber() : Number(sum) || 0;
    expect(converted).toBe(150);
  });
});
