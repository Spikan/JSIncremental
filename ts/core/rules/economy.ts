// Economy formulas for SPD and totals with direct Decimal support (TypeScript)
// Maximum performance with direct break_eternity.js operations

// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { pow, DecimalType } from '../numbers/migration-utils';

// ===== Safe numeric helpers =====
// No artificial numeric helpers needed - break_eternity.js handles all scaling naturally

// safeLog10FromDecimal removed - break_eternity.js handles all scaling naturally

// No artificial configuration needed - break_eternity.js handles all scaling naturally

export function computeStrawSPD(
  straws: number | string | DecimalType,
  baseSPD: number | string | DecimalType,
  widerStrawsCount: number | string | DecimalType,
  widerMultiplierPerLevel: number | string | DecimalType = 0
): DecimalType {
  const baseValue = new Decimal(baseSPD);
  const strawsCount = new Decimal(straws);

  // Basic wider straws multiplier
  const upgradeMultiplier = new Decimal(1).add(
    new Decimal(widerStrawsCount).mul(new Decimal(widerMultiplierPerLevel))
  );

  // Calculate base production: baseSPD * straws * upgradeMultiplier
  let totalSPD = baseValue.mul(strawsCount).mul(upgradeMultiplier);

  // Milestone bonuses: Every 10 straws = 2x production
  const milestoneCount = strawsCount.div(10).floor();
  if (milestoneCount.gt(0)) {
    const milestoneMultiplier = new Decimal(2).pow(milestoneCount);
    totalSPD = totalSPD.mul(milestoneMultiplier);
  }

  // Exponential scaling: Each straw gets more powerful
  if (strawsCount.gt(0)) {
    const exponentialBonus = new Decimal(1.1).pow(strawsCount.div(10).floor());
    totalSPD = totalSPD.mul(exponentialBonus);
  }

  return totalSPD;
}

export function computeCupSPD(
  cups: number | string | DecimalType,
  baseSPD: number | string | DecimalType,
  betterCupsCount: number | string | DecimalType,
  betterMultiplierPerLevel: number | string | DecimalType = 0
): DecimalType {
  const baseValue = new Decimal(baseSPD);
  const cupsCount = new Decimal(cups);

  // Basic better cups multiplier
  const upgradeMultiplier = new Decimal(1).add(
    new Decimal(betterCupsCount).mul(new Decimal(betterMultiplierPerLevel))
  );

  // Calculate base production: baseSPD * cups * upgradeMultiplier
  let totalSPD = baseValue.mul(cupsCount).mul(upgradeMultiplier);

  // Milestone bonuses: Every 10 cups = 2x production
  const milestoneCount = cupsCount.div(10).floor();
  if (milestoneCount.gt(0)) {
    const milestoneMultiplier = new Decimal(2).pow(milestoneCount);
    totalSPD = totalSPD.mul(milestoneMultiplier);
  }

  // Exponential scaling: Each cup gets more powerful
  if (cupsCount.gt(0)) {
    const exponentialBonus = new Decimal(1.15).pow(cupsCount.div(10).floor());
    totalSPD = totalSPD.mul(exponentialBonus);
  }

  return totalSPD;
}

export function computeTotalSPD(
  straws: number | string | DecimalType,
  strawSPD: number | string | DecimalType,
  cups: number | string | DecimalType,
  cupSPD: number | string | DecimalType
): DecimalType {
  const strawCount = new Decimal(straws);
  const cupCount = new Decimal(cups);
  const strawValue = new Decimal(strawSPD);
  const cupValue = new Decimal(cupSPD);

  // Calculate individual contributions
  const strawContribution = strawValue.mul(strawCount);
  const cupContribution = cupValue.mul(cupCount);

  // Synergy bonuses: Buildings work better together
  let synergyMultiplier = new Decimal(1);

  // If you have both straws and cups, get synergy bonus
  if (strawCount.gt(0) && cupCount.gt(0)) {
    const synergyLevel = strawCount.add(cupCount).div(20).floor();
    if (synergyLevel.gt(0)) {
      synergyMultiplier = new Decimal(1.5).pow(synergyLevel);
    }
  }

  // Calculate total before scaling
  let totalSPD = strawContribution.add(cupContribution).mul(synergyMultiplier);

  // Global milestone bonuses: Every 100 total buildings = 3x production
  const totalBuildings = strawCount.add(cupCount);
  const globalMilestoneCount = totalBuildings.div(100).floor();
  if (globalMilestoneCount.gt(0)) {
    const globalMilestoneMultiplier = new Decimal(3).pow(globalMilestoneCount);
    totalSPD = totalSPD.mul(globalMilestoneMultiplier);
  }

  return totalSPD;
}

export function computeTotalSipsPerDrink(
  baseSipsPerDrink: number | string | DecimalType,
  totalSPD: number | string | DecimalType
): DecimalType {
  const base = new Decimal(baseSipsPerDrink);
  const spd = new Decimal(totalSPD);

  // Calculate total sips per drink
  let totalSips = base.add(spd);

  // NO artificial diminishing returns - break_eternity.js handles all scaling naturally

  return totalSips;
}

// Advanced economy functions for very large numbers

/**
 * Calculate prestige bonus based on total sips earned
 */
export function computePrestigeBonus(
  _totalSipsEarned: number | string | DecimalType, // eslint-disable-line @typescript-eslint/no-unused-vars
  prestigeLevel: number | string | DecimalType = 0
): DecimalType {
  const prestige = new Decimal(prestigeLevel);

  // NO artificial prestige bonuses - break_eternity.js handles all scaling naturally

  // Only prestige level bonus remains
  const prestigeMultiplier = new Decimal('1').add(prestige.mul(new Decimal('0.5')));

  return prestigeMultiplier;
}

/**
 * Calculate golden straw multiplier for very large straw counts
 */
export function computeGoldenStrawMultiplier(
  _straws: number | string | DecimalType, // unused - artificial caps removed
  goldenStrawCount: number | string | DecimalType = 0
): DecimalType {
  const goldenCount = new Decimal(goldenStrawCount);

  // Base multiplier from golden straws
  let multiplier = new Decimal('1').add(goldenCount.mul(new Decimal('0.1')));

  // NO artificial golden straw bonuses - break_eternity.js handles all scaling naturally

  return multiplier;
}

/**
 * Calculate efficiency bonus for optimized production
 */
export function computeEfficiencyBonus(
  _totalSPD: number | string | DecimalType, // eslint-disable-line @typescript-eslint/no-unused-vars
  optimizationLevel: number | string | DecimalType = 0
): DecimalType {
  const optimization = new Decimal(optimizationLevel);

  // Base efficiency bonus
  const baseBonus = optimization.mul(new Decimal('0.05'));

  // NO artificial SPD bonuses - break_eternity.js handles all scaling naturally

  return new Decimal('1').add(baseBonus);
}

/**
 * Calculate breakthrough multiplier for milestone achievements
 */
export function computeBreakthroughMultiplier(
  _totalSipsEarned: number | string | DecimalType, // eslint-disable-line @typescript-eslint/no-unused-vars
  breakthroughLevel: number | string | DecimalType = 0
): DecimalType {
  const breakthrough = new Decimal(breakthroughLevel);

  // Breakthroughs provide exponential bonuses - use Decimal directly
  const breakthroughBonus = pow(new Decimal('1.5'), breakthrough);

  // NO artificial sip scaling - break_eternity.js handles all scaling naturally

  return breakthroughBonus;
}

/**
 * Calculate inflation rate for very large economies
 */
export function computeInflationRate(
  _totalSipsEarned: number | string | DecimalType, // unused - artificial caps removed
  _totalPurchases: number | string | DecimalType = 0 // unused - artificial caps removed
): DecimalType {
  // NO artificial inflation rates - break_eternity.js handles all scaling naturally
  const inflationRate = new Decimal('1');

  // NO artificial inflation scaling - break_eternity.js handles all scaling naturally

  return inflationRate;
}

/**
 * Calculate interest rate for sip savings (banking system)
 */
export function computeInterestRate(
  _sipsInBank: number | string | DecimalType, // unused - artificial caps removed
  bankLevel: number | string | DecimalType = 0
): DecimalType {
  const level = new Decimal(bankLevel);

  // Base interest rate from bank level
  const baseRate = new Decimal('0.001').mul(level);

  // NO artificial deposit bonuses - break_eternity.js handles all scaling naturally

  return baseRate;
}

// Legacy functions for backward compatibility
export function computeStrawSPDLegacy(
  _straws: number | string, // unused - function signature changed
  baseSPD: number | string,
  widerStrawsCount: number | string,
  widerMultiplierPerLevel: number | string = 0
): DecimalType {
  // Return Decimal directly - no JavaScript number conversion
  return computeStrawSPD(baseSPD, widerStrawsCount, widerMultiplierPerLevel);
}

export function computeCupSPDLegacy(
  _cups: number | string, // unused - function signature changed
  baseSPD: number | string,
  betterCupsCount: number | string,
  betterMultiplierPerLevel: number | string = 0
): DecimalType {
  // Return Decimal directly - no JavaScript number conversion
  return computeCupSPD(baseSPD, betterCupsCount, betterMultiplierPerLevel);
}

export function computeTotalSPDLegacy(
  straws: number | string,
  strawSPD: number | string,
  cups: number | string,
  cupSPD: number | string
): DecimalType {
  // Return Decimal directly - no JavaScript number conversion
  return computeTotalSPD(straws, strawSPD, cups, cupSPD);
}

export function computeTotalSipsPerDrinkLegacy(
  baseSipsPerDrink: number | string,
  totalSPD: number | string
): DecimalType {
  // Return Decimal directly - no JavaScript number conversion
  return computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD);
}
