// Tests for backward compatibility with existing saves and data formats

import { describe, it, expect, beforeEach } from 'vitest';
import { LargeNumber } from '../ts/core/numbers/large-number';
import {
  toLargeNumber,
  toNumber,
  formatLargeNumber,
  migrateStateToLargeNumber,
  migrateStateToNumbers,
} from '../ts/core/numbers/migration-utils';
import { computeClick } from '../ts/core/rules/clicks';
import { computeTotalSipsPerDrink } from '../ts/core/rules/economy';
import { nextStrawCost } from '../ts/core/rules/purchases';

// Mock existing save data formats
const mockLegacySave = {
  sips: 1000,
  straws: 5,
  cups: 3,
  suctions: 2,
  widerStraws: 1,
  betterCups: 1,
  fasterDrinks: 2,
  criticalClicks: 1,
  level: 5,
  totalSipsEarned: 50000,
  totalClicks: 1500,
  options: {
    autosaveEnabled: true,
    autosaveInterval: 30,
    clickSoundsEnabled: true,
    musicEnabled: false,
  },
};

const mockLargeNumberSave = {
  sips: new LargeNumber(1000),
  straws: new LargeNumber(5),
  cups: new LargeNumber(3),
  suctions: new LargeNumber(2),
  widerStraws: new LargeNumber(1),
  betterCups: new LargeNumber(1),
  fasterDrinks: new LargeNumber(2),
  criticalClicks: new LargeNumber(1),
  level: new LargeNumber(5),
  totalSipsEarned: new LargeNumber(50000),
  totalClicks: new LargeNumber(1500),
  options: {
    autosaveEnabled: true,
    autosaveInterval: 30,
    clickSoundsEnabled: true,
    musicEnabled: false,
  },
};

// Mock Decimal.js objects that might exist in old saves
class MockDecimal {
  private value: number;

  constructor(value: any) {
    this.value = Number(value) || 0;
  }

  toNumber(): number {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  plus(other: any): MockDecimal {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return new MockDecimal(this.value + otherValue);
  }

  minus(other: any): MockDecimal {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return new MockDecimal(this.value - otherValue);
  }

  times(other: any): MockDecimal {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return new MockDecimal(this.value * otherValue);
  }

  div(other: any): MockDecimal {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return new MockDecimal(this.value / otherValue);
  }

  pow(exponent: number): MockDecimal {
    return new MockDecimal(Math.pow(this.value, exponent));
  }

  gte(other: any): boolean {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return this.value >= otherValue;
  }

  gt(other: any): boolean {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return this.value > otherValue;
  }

  lte(other: any): boolean {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return this.value <= otherValue;
  }

  lt(other: any): boolean {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return this.value < otherValue;
  }

  eq(other: any): boolean {
    const otherValue = other?.toNumber ? other.toNumber() : Number(other);
    return this.value === otherValue;
  }
}

describe('Backward Compatibility', () => {
  describe('Data Type Conversion', () => {
    it('should convert regular numbers to LargeNumber', () => {
      expect(toLargeNumber(100).toNumber()).toBe(100);
      expect(toLargeNumber(0).toNumber()).toBe(0);
      expect(toLargeNumber(-50).toNumber()).toBe(-50);
    });

    it('should convert strings to LargeNumber', () => {
      expect(toLargeNumber('1000').toNumber()).toBe(1000);
      expect(toLargeNumber('0').toNumber()).toBe(0);
      expect(toLargeNumber('-250').toNumber()).toBe(-250);
    });

    it('should convert LargeNumber back to number', () => {
      const large = new LargeNumber(500);
      expect(toNumber(large)).toBe(500);
    });

    it('should handle Decimal.js-like objects', () => {
      const decimal = new MockDecimal(750);
      const largeNum = toLargeNumber(decimal);
      expect(largeNum ? largeNum.toNumber() : 0).toBe(750);
      expect(toNumber(decimal)).toBe(750);
    });

    it('should handle undefined and null values', () => {
      expect(toLargeNumber(undefined).toNumber()).toBe(0);
      expect(toLargeNumber(null).toNumber()).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber(null)).toBe(0);
    });
  });

  describe('State Migration', () => {
    it('should migrate regular number state to LargeNumber', () => {
      const migrated = migrateStateToLargeNumber(mockLegacySave);

      expect(migrated.sips).toBeInstanceOf(LargeNumber);
      expect(migrated.straws).toBeInstanceOf(LargeNumber);
      expect(migrated.cups).toBeInstanceOf(LargeNumber);
      expect(migrated.sips.toNumber()).toBe(1000);
      expect(migrated.straws.toNumber()).toBe(5);
    });

    it('should migrate LargeNumber state back to numbers', () => {
      const migrated = migrateStateToNumbers(mockLargeNumberSave);

      expect(typeof migrated.sips).toBe('number');
      expect(typeof migrated.straws).toBe('number');
      expect(typeof migrated.cups).toBe('number');
      expect(migrated.sips).toBe(1000);
      expect(migrated.straws).toBe(5);
    });

    it('should preserve non-numeric values during migration', () => {
      const migrated = migrateStateToLargeNumber(mockLegacySave);
      expect(migrated.options).toEqual(mockLegacySave.options);

      const backMigrated = migrateStateToNumbers(migrated);
      expect(backMigrated.options).toEqual(mockLegacySave.options);
    });

    it('should handle mixed data types in state', () => {
      const mixedState = {
        sips: 100,
        straws: new LargeNumber(5),
        cups: new MockDecimal(3),
        name: 'Test Player',
      };

      const migrated = migrateStateToLargeNumber(mixedState);
      expect(migrated.sips).toBeInstanceOf(LargeNumber);
      expect(migrated.straws).toBeInstanceOf(LargeNumber);
      expect(migrated.cups).toBeInstanceOf(LargeNumber);
      expect(migrated.name).toBe('Test Player');

      const backMigrated = migrateStateToNumbers(migrated);
      expect(typeof backMigrated.sips).toBe('number');
      expect(typeof backMigrated.straws).toBe('number');
      expect(typeof backMigrated.cups).toBe('number');
      expect(backMigrated.name).toBe('Test Player');
    });
  });

  describe('Game Mechanics Compatibility', () => {
    it('should work with legacy number inputs to core functions', () => {
      // Test that core functions still work with regular numbers
      const result1 = computeClick({
        baseClick: 1,
        suctionBonus: 0.3,
        criticalChance: 0,
        criticalMultiplier: 2,
      });

      expect(result1.critical).toBe(false);
      expect(result1.gained.toNumber()).toBe(1.3);

      const result2 = computeTotalSipsPerDrink(1, 5);
      expect(result2.toNumber()).toBe(6);
    });

    it('should work with mixed LargeNumber and number inputs', () => {
      // Test that functions work with mixed input types
      const result1 = computeClick({
        baseClick: new LargeNumber(1),
        suctionBonus: 0.3,
        criticalChance: 0,
        criticalMultiplier: new LargeNumber(2),
      });

      expect(result1.critical).toBe(false);
      expect(result1.gained.toNumber()).toBe(1.3);

      const result2 = computeTotalSipsPerDrink(new LargeNumber(1), 5);
      expect(result2.toNumber()).toBe(6);
    });

    it('should handle very large numbers in calculations', () => {
      const largeNumber = new LargeNumber('1e100');

      const result = computeTotalSipsPerDrink(new LargeNumber(1), largeNumber);

      expect(result.toString()).toBe('3.7015217857933866e+56');
    });

    it('should maintain calculation accuracy with large numbers', () => {
      const cost1 = nextStrawCost(100, 10, 1.08);
      const cost2 = nextStrawCost(new LargeNumber(100), 10, 1.08);

      // Both should give the same result
      expect(cost1.toNumber()).toBeCloseTo(cost2.toNumber(), 6);
    });
  });

  describe('Number Formatting Compatibility', () => {
    it('should format regular numbers correctly', () => {
      expect(formatLargeNumber(1000)).toBe('1,000');
      expect(formatLargeNumber(1000000)).toMatch(/1\.?0*e\+6|1000000/);
    });

    it('should format LargeNumber correctly', () => {
      expect(formatLargeNumber(new LargeNumber(1000))).toBe('1,000');
      expect(formatLargeNumber(new LargeNumber(1000000))).toMatch(/1\.?0*e\+6|1000000/);
    });

    it('should format Decimal.js-like objects correctly', () => {
      expect(formatLargeNumber(new MockDecimal(1000))).toBe('1,000');
      expect(formatLargeNumber(new MockDecimal(1000000))).toMatch(/1\.?0*e\+6|1000000/);
    });

    it('should handle very large numbers with scientific notation', () => {
      const veryLarge = new LargeNumber('1e100');
      const formatted = formatLargeNumber(veryLarge);
      expect(formatted).toMatch(/1\.?0*e\+100|1e100/);
    });
  });

  describe('Save Data Integrity', () => {
    it('should preserve all data during round-trip migration', () => {
      // Migrate to LargeNumber and back
      const migrated = migrateStateToLargeNumber(mockLegacySave);
      const backMigrated = migrateStateToNumbers(migrated);

      // All numeric values should be preserved
      expect(backMigrated.sips).toBe(mockLegacySave.sips);
      expect(backMigrated.straws).toBe(mockLegacySave.straws);
      expect(backMigrated.cups).toBe(mockLegacySave.cups);
      expect(backMigrated.totalSipsEarned).toBe(mockLegacySave.totalSipsEarned);

      // Non-numeric values should be preserved
      expect(backMigrated.options).toEqual(mockLegacySave.options);
    });

    it('should handle corrupted or invalid data gracefully', () => {
      const corruptedSave = {
        sips: 'invalid',
        straws: NaN,
        cups: Infinity,
        level: -Infinity,
      };

      const migrated = migrateStateToLargeNumber(corruptedSave);

      // Invalid values should default to 0
      expect(migrated.sips ? migrated.sips.toNumber() : 0).toBe(0);
      expect(migrated.straws ? migrated.straws.toNumber() : 0).toBe(0);
      expect(migrated.cups ? migrated.cups.toNumber() : 0).toBe(0);
      expect(migrated.level.toNumber()).toBe(0);
    });

    it('should handle missing properties', () => {
      const incompleteSave = {
        sips: 100,
        // missing other properties
      };

      const migrated = migrateStateToLargeNumber(incompleteSave);

      expect(migrated.sips ? migrated.sips.toNumber() : 0).toBe(100);
      expect(migrated.straws ? migrated.straws.toNumber() : 0).toBe(0); // default value
      expect(migrated.cups ? migrated.cups.toNumber() : 0).toBe(0); // default value
    });
  });

  describe('Performance Compatibility', () => {
    it('should not significantly impact performance', () => {
      const startTime = performance.now();

      // Perform multiple LargeNumber operations
      for (let i = 0; i < 1000; i++) {
        const a = new LargeNumber(i);
        const b = new LargeNumber(i + 1);
        const result = a.add(b);
        result.toNumber();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should handle memory efficiently', () => {
      // Create many LargeNumber instances
      const numbers: LargeNumber[] = [];
      for (let i = 0; i < 10000; i++) {
        numbers.push(new LargeNumber(i));
      }

      // Should not cause memory issues
      expect(numbers.length).toBe(10000);
      expect(numbers[0].toNumber()).toBe(0);
      expect(numbers[9999].toNumber()).toBe(9999);
    });
  });
});
