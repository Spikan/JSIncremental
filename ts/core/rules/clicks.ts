// Pure helpers for click outcomes with LargeNumber support (TypeScript)

import { LargeNumber } from '../numbers/large-number';

export function computeClick({
  baseClick,
  suctionBonus,
  criticalChance,
  criticalMultiplier,
}: {
  baseClick: number | string | LargeNumber;
  suctionBonus: number | string | LargeNumber;
  criticalChance: number;
  criticalMultiplier: number | string | LargeNumber;
}): { gained: LargeNumber; critical: boolean } {
  const base = new LargeNumber(baseClick);
  const bonus = new LargeNumber(suctionBonus);
  const mult = new LargeNumber(criticalMultiplier);
  const isCritical = Math.random() < criticalChance;

  // Calculate gained sips: (base + bonus) * (critical ? multiplier : 1)
  const basePlusBonus = base.add(bonus);
  const effectiveMultiplier = isCritical ? mult : new LargeNumber(1);
  const gained = basePlusBonus.multiply(effectiveMultiplier);

  return { gained, critical: isCritical };
}

// Legacy function for backward compatibility
export function computeClickLegacy({
  baseClick,
  suctionBonus,
  criticalChance,
  criticalMultiplier,
}: {
  baseClick: number | string;
  suctionBonus: number | string;
  criticalChance: number;
  criticalMultiplier: number | string;
}): { gained: string; critical: boolean } {
  const result = computeClick({
    baseClick,
    suctionBonus,
    criticalChance,
    criticalMultiplier,
  });

  return {
    gained: result.gained.toString(),
    critical: result.critical,
  };
}
