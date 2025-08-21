import { describe, it, expect, vi } from 'vitest';
import { computeClick } from '../js/core/rules/clicks.js';

describe('computeClick', () => {
  it('adds suction bonus to base', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1); // no critical
    const res = computeClick({ baseClick: 1, suctionBonus: 0.3, criticalChance: 0, criticalMultiplier: 5 });
    expect(Number(res.gained)).toBeCloseTo(1.3, 6);
    expect(res.critical).toBe(false);
  });

  it('applies critical multiplier when rng < chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // force critical
    const res = computeClick({ baseClick: 1, suctionBonus: 0, criticalChance: 0.5, criticalMultiplier: 5 });
    expect(Number(res.gained)).toBeCloseTo(5, 6);
    expect(res.critical).toBe(true);
  });
});


