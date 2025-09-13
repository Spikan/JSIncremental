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
    expect(computeStrawSPD(10, 0.6, 2, 0.2)).toBeCloseTo(10 * 0.6 * (1 + 0.4), 6);
    expect(computeCupSPD(5, 1.2, 1, 0.3)).toBeCloseTo(5 * 1.2 * (1 + 0.3), 6);
  });

  it('computes totals', () => {
    const totalSPD = computeTotalSPD(10, 1, 5, 2);
    expectLargeNumberToEqual(totalSPD, 10 * 1 + 5 * 2);
    expectLargeNumberToEqual(computeTotalSipsPerDrink(1, totalSPD), 1 + totalSPD.toNumber());
  });
});
