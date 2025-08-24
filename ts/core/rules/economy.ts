// Economy formulas for SPD and totals (TypeScript)

export function computeStrawSPD(
  straws: number | string,
  baseSPD: number | string,
  widerStrawsCount: number | string,
  widerMultiplierPerLevel: number | string = 0
): number {
  void straws; // parameter kept for API compatibility
  const multiplier = 1 + Number(widerStrawsCount) * Number(widerMultiplierPerLevel);
  return Number(baseSPD) * multiplier;
}

export function computeCupSPD(
  cups: number | string,
  baseSPD: number | string,
  betterCupsCount: number | string,
  betterMultiplierPerLevel: number | string = 0
): number {
  void cups; // parameter kept for API compatibility
  const multiplier = 1 + Number(betterCupsCount) * Number(betterMultiplierPerLevel);
  return Number(baseSPD) * multiplier;
}

export function computeTotalSPD(
  straws: number | string,
  strawSPD: number | string,
  cups: number | string,
  cupSPD: number | string
): number {
  return Number(strawSPD) * Number(straws) + Number(cupSPD) * Number(cups);
}

export function computeTotalSipsPerDrink(
  baseSipsPerDrink: number | string,
  totalSPD: number | string
): number {
  return Number(baseSipsPerDrink) + Number(totalSPD);
}
