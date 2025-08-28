// Tests for enhanced economy functions with very large numbers

import { describe, it, expect } from 'vitest';
import { Decimal } from './test-utils';
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
  computeInterestRate,
} from '../ts/core/rules/economy';

// Alias for backward compatibility
const LargeNumber = Decimal;

describe('Enhanced Economy Functions', () => {
  describe('Very Large Number Handling', () => {
    it('should handle extremely large straw SPD values', () => {
      const result = computeStrawSPD('1e100', '1e50', 10, 0.1);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1e50);
    });

    it('should handle extremely large cup SPD values', () => {
      const result = computeCupSPD('1e100', '1e50', 10, 0.1);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1e50);
    });

    it('should handle very large total SPD with synergy', () => {
      const result = computeTotalSPD('1e100', '1e50', '1e100', '1e50');

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1e100);
    });

    it('should handle very large sips per drink with diminishing returns', () => {
      const result = computeTotalSipsPerDrink(1, '1e100');

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1);
    });
  });

  describe('Advanced Economy Mechanics', () => {
    it('should calculate prestige bonus for very large sip counts', () => {
      const result = computePrestigeBonus('1e100', 10);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should calculate golden straw multiplier for large straw counts', () => {
      const result = computeGoldenStrawMultiplier('1e30', 100);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should calculate efficiency bonus for high SPD', () => {
      const result = computeEfficiencyBonus('1e50', 50);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should calculate breakthrough multiplier', () => {
      const result = computeBreakthroughMultiplier('1e200', 20);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1);
    });

    it('should calculate inflation rate for large economies', () => {
      const result = computeInflationRate('1e50', 5000);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(0);
    });

    it('should calculate interest rate for large bank deposits', () => {
      const result = computeInterestRate('1e20', 25);

      expect(result).toBeInstanceOf(Decimal);
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

      expect(strawSPD).toBeInstanceOf(Decimal);
      expect(strawSPD.toNumber()).toBeGreaterThan(0);
    });

    it('should handle very large cup SPD values', () => {
      const cupSPD = computeCupSPD(
        '1',
        '1e50', // Large but not extreme
        0,
        0
      );

      expect(cupSPD).toBeInstanceOf(Decimal);
      expect(cupSPD.toNumber()).toBeGreaterThan(0);
    });

    it('should handle very large total SPD values', () => {
      const totalSPD = computeTotalSPD(
        '1e50', // Large but not extreme
        '1e50', // Large but not extreme
        '1e50', // Large but not extreme
        '1e50' // Large but not extreme
      );

      expect(totalSPD).toBeInstanceOf(Decimal);
      expect(totalSPD.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Mixed Type Support', () => {
    it('should handle string representations of large numbers', () => {
      const result = computeStrawSPD('1e50', '1e25', 5, 0.2);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1e25);
    });

    it('should handle mixed string and number inputs', () => {
      const result = computeCupSPD(1000, '1e30', 2, 0.1);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1000);
    });

    it('should handle very large string inputs', () => {
      const result = computeTotalSPD('1e100', '1e50', '1e75', '1e25');

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(1e50);
    });
  });

  describe('Performance with Large Numbers', () => {
    it('should handle repeated operations without errors', () => {
      let result = new Decimal(1);

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        result = result.multiply(new Decimal(1.1));
        result = result.add(new Decimal(1e20));
        result = result.divide(new Decimal(1.1));
      }

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(0);
    });

    it('should handle very large exponents efficiently', () => {
      const base = new Decimal(1.1);
      const result = base.pow(1000);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero inputs gracefully', () => {
      const result = computeStrawSPD(0, 0, 0, 0);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBe(0);
    });

    it('should handle negative inputs gracefully', () => {
      const result = computeStrawSPD(-100, -50, -10, -0.1);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeLessThan(0);
    });

    it('should handle extremely small inputs', () => {
      const result = computeStrawSPD('1e-100', '1e-50', 0, 0);

      expect(result).toBeInstanceOf(Decimal);
      expect(result.toNumber()).toBeGreaterThanOrEqual(0);
    });
  });
});
