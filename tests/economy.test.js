import { describe, it, expect } from 'vitest';
import { computeStrawSPD, computeCupSPD, computeTotalSPD, computeTotalSipsPerDrink } from '../js/core/rules/economy';

describe('economy rules', () => {
  it('computes SPD with multipliers', () => {
    expect(computeStrawSPD(10, 0.6, 2, 0.2)).toBeCloseTo(0.6 * (1 + 0.4), 6);
    expect(computeCupSPD(5, 1.2, 1, 0.3)).toBeCloseTo(1.2 * (1 + 0.3), 6);
  });

  it('computes totals', () => {
    const totalSPD = computeTotalSPD(10, 1, 5, 2);
    expect(totalSPD).toBe(10 * 1 + 5 * 2);
    expect(computeTotalSipsPerDrink(1, totalSPD)).toBe(1 + totalSPD);
  });
});


