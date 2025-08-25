// Pure cost and stat calculation for purchases with Decimal support (TypeScript)

// DecimalOps removed - no longer using toSafeNumber
// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { DecimalType } from '../numbers/decimal-utils';

export function nextStrawCost(
  strawCount: number | string | DecimalType,
  baseCost: number | string | DecimalType,
  scaling: number | string | DecimalType
): DecimalType {
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
  cupCount: number | string | DecimalType,
  baseCost: number | string | DecimalType,
  scaling: number | string | DecimalType
): DecimalType {
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
  // Preserve extreme values - direct toNumber
  return Math.floor(nextStrawCost(strawCount, baseCost, scaling).toNumber());
}

export function nextCupCostLegacy(
  cupCount: number | string,
  baseCost: number | string,
  scaling: number | string
): number {
  // Preserve extreme values - direct toNumber
  return Math.floor(nextCupCost(cupCount, baseCost, scaling).toNumber());
}
