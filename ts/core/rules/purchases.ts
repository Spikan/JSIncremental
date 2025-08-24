// Pure cost and stat calculation for purchases with LargeNumber support (TypeScript)

import { LargeNumber } from '../numbers/large-number';

export function nextStrawCost(
  strawCount: number | string | LargeNumber,
  baseCost: number | string | LargeNumber,
  scaling: number | string | LargeNumber
): LargeNumber {
  const base = new LargeNumber(baseCost);
  const scale = new LargeNumber(scaling);
  const count = new LargeNumber(strawCount);
  // count is small (player-owned items). Use safe exponent bound.
  {
    const nRaw = (count as any).toNumber?.();
    const n = (nRaw ?? Number(count as any)) || 0;
    const exp = Math.max(0, Math.min(n, 1_000_000));
    return base.multiply(scale.pow(exp));
  }
}

export function nextCupCost(
  cupCount: number | string | LargeNumber,
  baseCost: number | string | LargeNumber,
  scaling: number | string | LargeNumber
): LargeNumber {
  const base = new LargeNumber(baseCost);
  const scale = new LargeNumber(scaling);
  const count = new LargeNumber(cupCount);
  {
    const nRaw = (count as any).toNumber?.();
    const n = (nRaw ?? Number(count as any)) || 0;
    const exp = Math.max(0, Math.min(n, 1_000_000));
    return base.multiply(scale.pow(exp));
  }
}

// Legacy functions for backward compatibility
export function nextStrawCostLegacy(
  strawCount: number | string,
  baseCost: number | string,
  scaling: number | string
): number {
  return Math.floor(nextStrawCost(strawCount, baseCost, scaling).toNumber());
}

export function nextCupCostLegacy(
  cupCount: number | string,
  baseCost: number | string,
  scaling: number | string
): number {
  return Math.floor(nextCupCost(cupCount, baseCost, scaling).toNumber());
}
