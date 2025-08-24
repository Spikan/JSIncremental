// Tests for enhanced economy functions with very large numbers

import { describe, it, expect } from 'vitest';
import { LargeNumber } from '../ts/core/numbers/large-number';
import {
  computeStrawSPD,
  computeCupSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
  computePrestigeBonus,
  computeGoldenStrawMultiplier,
  computeEfficiencyBonus,
  computeBreakthroughMultiplier,
  computeInflationRate,
  computeInterestRate
} from '../ts/core/rules/economy';

describe('Enhanced Economy Functions', () => {
  describe('Very Large Number Handling', () => {
    it('should handle extremely large straw SPD values', () => {
      const result = computeStrawSPD(
        '1e100',
        '1e50',
        10,
        0.1
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1e50);
    });

    it('should handle extremely large cup SPD values', () => {
      const result = computeCupSPD(
        '1e100',
        '1e50',
        10,
        0.1
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1e50);
    });

    it('should handle very large total SPD with synergy', () => {
      const result = computeTotalSPD(
        '1e100',
        '1e50',
        '1e100',
        '1e50'
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1e100);
    });

    it('should handle very large sips per drink with diminishing returns', () => {
      const result = computeTotalSipsPerDrink(
        1,
        '1e100'
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1);
    });
  });

  describe('Advanced Economy Mechanics', () => {
    it('should calculate prestige bonus for very large sip counts', () => {
      const result = computePrestigeBonus(
        '1e100',
        10
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should calculate golden straw multiplier for large straw counts', () => {
      const result = computeGoldenStrawMultiplier(
        '1e30',
        100
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should calculate efficiency bonus for high SPD', () => {
      const result = computeEfficiencyBonus(
        '1e50',
        50
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should calculate breakthrough multiplier', () => {
      const result = computeBreakthroughMultiplier(
        '1e200',
        20
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should calculate inflation rate for large economies', () => {
      const result = computeInflationRate(
        '1e50',
        5000
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(0);
    });

    it('should calculate interest rate for large bank deposits', () => {
      const result = computeInterestRate(
        '1e20',
        25
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Scaling and Balance', () => {
    it('should handle very large base SPD values', () => {
      // Test with large but manageable values
      const strawSPD = computeStrawSPD(
        '1',
        '1e50', // Large but not extreme
        0,
        0
      );

      // Should still be finite and reasonable
      expect(isFinite(strawSPD.toNumber())).toBe(true);
      expect(strawSPD.toNumber()).toBeGreaterThan(0);
    });

    it('should handle very large SPD values without issues', () => {
      const sipsPerDrink1 = computeTotalSipsPerDrink(1, '1e40');
      const sipsPerDrink2 = computeTotalSipsPerDrink(1, '1e70');

      // Both should be valid LargeNumber instances
      expect(sipsPerDrink1).toBeInstanceOf(LargeNumber);
      expect(sipsPerDrink2).toBeInstanceOf(LargeNumber);

      // Both should be finite and greater than base
      expect(isFinite(sipsPerDrink1.toNumber())).toBe(true);
      expect(isFinite(sipsPerDrink2.toNumber())).toBe(true);
      expect(sipsPerDrink1.toNumber()).toBeGreaterThan(1);
      expect(sipsPerDrink2.toNumber()).toBeGreaterThan(1);
    });

    it('should provide reasonable bonuses for milestone achievements', () => {
      const normalBonus = computeStrawSPD('100', '1', 0, 0);
      const milestoneBonus = computeStrawSPD('1e15', '1', 0, 0);

      // Milestone bonus should be significantly higher but not insane
      const ratio = milestoneBonus.toNumber() / normalBonus.toNumber();
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(100);
    });
  });

  describe('Mixed Type Support', () => {
    it('should work with mixed number and LargeNumber inputs', () => {
      const result = computeTotalSPD(
        1000,           // number
        new LargeNumber('1.5'), // LargeNumber
        '500',          // string
        2.0             // number
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(0);
    });

    it('should handle string representations of large numbers', () => {
      const result = computeStrawSPD(
        '1e50',
        '1e25',
        5,
        0.2
      );

      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1e25);
    });

    it('should handle zero and negative values gracefully', () => {
      const result1 = computeStrawSPD(0, 1, 0, 0);
      const result2 = computeStrawSPD(-100, 1, 0, 0);

      expect(result1.toNumber()).toBe(1); // Base SPD with no straws
      expect(result2.toNumber()).toBe(1); // Negative values should be treated as 0
    });
  });

  describe('Performance with Large Numbers', () => {
    it('should handle calculations efficiently with very large numbers', () => {
      const startTime = performance.now();

      // Perform multiple calculations with very large numbers
      for (let i = 0; i < 100; i++) {
        computeTotalSPD(
          `1e${100 + i}`,
          `1e${50 + i}`,
          `1e${100 + i}`,
          `1e${50 + i}`
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000); // Less than 1 second for 100 calculations
    });

    it('should handle repeated operations without errors', () => {
      let result = new LargeNumber(1);

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        result = result.add(new LargeNumber('1e10'));
      }

      // Should still be a valid LargeNumber with reasonable magnitude
      expect(result).toBeInstanceOf(LargeNumber);
      expect(result.toNumber()).toBeGreaterThan(1e11);
      expect(result.toNumber()).toBeLessThan(1e13);
    });
  });
});
