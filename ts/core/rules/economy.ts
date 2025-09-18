// Economy formulas for SPD and totals with direct Decimal support (TypeScript)
// Maximum performance with direct break_eternity.js operations

// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { pow, DecimalType } from '../numbers/simplified';

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
  // Validate inputs before creating Decimal objects
  const safeStraws = straws == null ? 0 : straws;
  const safeBaseSPD = baseSPD == null ? 2 : baseSPD;
  const safeWiderStrawsCount = widerStrawsCount == null ? 0 : widerStrawsCount;
  const safeWiderMultiplierPerLevel = widerMultiplierPerLevel == null ? 0 : widerMultiplierPerLevel;

  const baseValue = new Decimal(safeBaseSPD);
  const strawsCount = new Decimal(safeStraws);

  // Basic wider straws multiplier
  const upgradeMultiplier = new Decimal(1).add(
    new Decimal(safeWiderStrawsCount).mul(new Decimal(safeWiderMultiplierPerLevel))
  );

  // Calculate base production: baseSPD * straws * upgradeMultiplier
  let totalSPD = baseValue.mul(strawsCount).mul(upgradeMultiplier);

  // Milestone bonuses: Every 10 straws = 2x production
  const milestoneCount = new Decimal(strawsCount).div(10).floor();
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
  // Validate inputs before creating Decimal objects
  const safeCups = cups == null ? 0 : cups;
  const safeBaseSPD = baseSPD == null ? 5 : baseSPD;
  const safeBetterCupsCount = betterCupsCount == null ? 0 : betterCupsCount;
  const safeBetterMultiplierPerLevel = betterMultiplierPerLevel == null ? 0 : betterMultiplierPerLevel;

  const baseValue = new Decimal(safeBaseSPD);
  const cupsCount = new Decimal(safeCups);

  // Basic better cups multiplier
  const upgradeMultiplier = new Decimal(1).add(
    new Decimal(safeBetterCupsCount).mul(new Decimal(safeBetterMultiplierPerLevel))
  );

  // Calculate base production: baseSPD * cups * upgradeMultiplier
  let totalSPD = baseValue.mul(cupsCount).mul(upgradeMultiplier);

  // Milestone bonuses: Every 10 cups = 2x production
  const milestoneCount = new Decimal(cupsCount).div(10).floor();
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
    const synergyLevel = new Decimal(strawCount).add(cupCount).div(20).floor();
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
