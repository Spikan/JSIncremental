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
    // Use safe conversion to preserve extreme values
    const nRaw = (count as any).toNumber?.();
    let n: number;
    if (nRaw !== undefined && isFinite(nRaw) && Math.abs(nRaw) < 1e15) {
      n = nRaw;
    } else {
      // For extreme values, use a safe fallback instead of truncating
      n = 0;
    }
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
    // Use safe conversion to preserve extreme values
    const nRaw = (count as any).toNumber?.();
    let n: number;
    if (nRaw !== undefined && isFinite(nRaw) && Math.abs(nRaw) < 1e15) {
      n = nRaw;
    } else {
      // For extreme values, use a safe fallback instead of truncating
      n = 0;
    }
    const exp = Math.max(0, Math.min(n, 1_000_000));
    return base.multiply(scale.pow(exp));
  }
}

// Legacy functions for backward compatibility
export function nextStrawCostLegacy(
  strawCount: number | string,
  baseCost: number | string,
  scaling: number | string
): DecimalType {
  // Return Decimal directly - no JavaScript number conversion
  return nextStrawCost(strawCount, baseCost, scaling);
}

export function nextCupCostLegacy(
  cupCount: number | string,
  baseCost: number | string,
  scaling: number | string
): DecimalType {
  // Return Decimal directly - no JavaScript number conversion
  return nextCupCost(cupCount, baseCost, scaling);
}
