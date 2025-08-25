// Pure helpers for click outcomes with Decimal support (TypeScript)

import { Decimal } from '../numbers/large-number';

export function computeClick({
  baseClick,
  suctionBonus,
  criticalChance,
  criticalMultiplier,
}: {
  baseClick: number | string | Decimal;
  suctionBonus: number | string | Decimal;
  criticalChance: number;
  criticalMultiplier: number | string | Decimal;
}): { gained: Decimal; critical: boolean } {
  const base = new Decimal(baseClick);
  const bonus = new Decimal(suctionBonus);
  const mult = new Decimal(criticalMultiplier);
  const isCritical = Math.random() < criticalChance;

  // Calculate gained sips: (base + bonus) * (critical ? multiplier : 1)
  const basePlusBonus = base.add(bonus);
  const effectiveMultiplier = isCritical ? mult : new Decimal(1);
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
