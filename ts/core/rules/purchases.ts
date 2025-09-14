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

  // Improved scaling: More reasonable progression
  // Every 10 straws, cost increases by 10x instead of continuous scaling
  const milestoneCount = count.div(10).floor();
  const withinMilestone = count.mod(10);

  // Base cost for this milestone
  const milestoneCost = base.multiply(new Decimal(10).pow(milestoneCount));

  // Linear scaling within milestone (much more affordable)
  const withinMilestoneCost = base.multiply(scale.pow(withinMilestone.toNumber() || 0));

  return milestoneCost.multiply(withinMilestoneCost).div(base);
}

export function nextCupCost(
  cupCount: number | string | DecimalType,
  baseCost: number | string | DecimalType,
  scaling: number | string | DecimalType
): DecimalType {
  const base = new Decimal(baseCost);
  const scale = new Decimal(scaling);
  const count = new Decimal(cupCount);

  // Improved scaling: More reasonable progression
  // Every 10 cups, cost increases by 10x instead of continuous scaling
  const milestoneCount = count.div(10).floor();
  const withinMilestone = count.mod(10);

  // Base cost for this milestone
  const milestoneCost = base.multiply(new Decimal(10).pow(milestoneCount));

  // Linear scaling within milestone (much more affordable)
  const withinMilestoneCost = base.multiply(scale.pow(withinMilestone.toNumber() || 0));

  return milestoneCost.multiply(withinMilestoneCost).div(base);
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
