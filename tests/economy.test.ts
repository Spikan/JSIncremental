import { describe, it, expect } from 'vitest';
import { expectLargeNumberToEqual } from './test-utils';
import {
  computeStrawSPD,
  computeCupSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
} from '../ts/core/rules/economy';

declare global {
  interface Window {
    App?: any;
    Decimal?: any;
    localStorage?: Storage;
    fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  }
  interface Document {
    getElementById?: (id: string) => HTMLElement | null;
    querySelector?: (selectors: string) => Element | null;
    addEventListener?: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) => void;
  }
  interface Console {
    log?: (...data: any[]) => void;
    warn?: (...data: any[]) => void;
    error?: (...data: any[]) => void;
  }
}

describe('economy rules', () => {
  it('computes SPD with multipliers', () => {
    // Test with 10 straws: base(10 * 0.6) * upgrade(1 + 0.4) * milestone(2^1) * exponential(1.1^1)
    // = 6 * 1.4 * 2 * 1.1 = 18.48
    expect(computeStrawSPD(10, 0.6, 2, 0.2).toNumber()).toBeCloseTo(18.48, 2);

    // Test with 5 cups: base(5 * 1.2) * upgrade(1 + 0.3) * milestone(1) * exponential(1)
    // = 6 * 1.3 * 1 * 1 = 7.8 (no milestone/exponential bonus for 5 cups)
    expect(computeCupSPD(5, 1.2, 1, 0.3).toNumber()).toBeCloseTo(7.8, 2);
  });

  it('computes totals', () => {
    const totalSPD = computeTotalSPD(10, 1, 5, 2);
    expectLargeNumberToEqual(totalSPD, 10 * 1 + 5 * 2);
    expectLargeNumberToEqual(computeTotalSipsPerDrink(1, totalSPD), 1 + totalSPD.toNumber());
  });
});
