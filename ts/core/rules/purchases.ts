// Pure cost and stat calculation for purchases with Decimal support (TypeScript)

import { DecimalOps, Decimal } from '../numbers/large-number';

export function nextStrawCost(
  strawCount: number | string | Decimal,
  baseCost: number | string | Decimal,
  scaling: number | string | Decimal
): Decimal {
  const base = new Decimal(baseCost);
  const scale = new Decimal(scaling);
  const count = new Decimal(strawCount);
  // count is small (player-owned items). Use safe exponent bound.
  {
    const nRaw = (count as any).toNumber?.();
    const n = (nRaw ?? Number(count as any)) || 0;
    const exp = Math.max(0, Math.min(n, 1_000_000));
    return base.multiply(scale.pow(exp));
  }
}

export function nextCupCost(
  cupCount: number | string | Decimal,
  baseCost: number | string | Decimal,
  scaling: number | string | Decimal
): Decimal {
  const base = new Decimal(baseCost);
  const scale = new Decimal(scaling);
  const count = new Decimal(cupCount);
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
  return Math.floor(DecimalOps.toSafeNumber(nextStrawCost(strawCount, baseCost, scaling)));
}

export function nextCupCostLegacy(
  cupCount: number | string,
  baseCost: number | string,
  scaling: number | string
): number {
  return Math.floor(DecimalOps.toSafeNumber(nextCupCost(cupCount, baseCost, scaling)));
}
