// Pure helpers for click outcomes with Decimal support (TypeScript)

// Direct Decimal access - no wrapper needed
import { DecimalType } from '../numbers/simplified';

export function computeClick({
  baseClick,
  suctionBonus,
  criticalChance,
  criticalMultiplier,
}: {
  baseClick: number | string | DecimalType;
  suctionBonus: number | string | DecimalType;
  criticalChance: number;
  criticalMultiplier: number | string | DecimalType;
}): { gained: DecimalType; critical: boolean } {
  const base: DecimalType = new Decimal(baseClick);
  const bonus: DecimalType = new Decimal(suctionBonus);
  const mult: DecimalType = new Decimal(criticalMultiplier);
  const isCritical = Math.random() < criticalChance;

  // Calculate gained sips: (base + bonus) * (critical ? multiplier : 1)
  const basePlusBonus = base.add(bonus);
  const effectiveMultiplier = isCritical ? mult : (new Decimal(1) as DecimalType);
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
