// Economy formulas for SPD and totals with direct Decimal support (TypeScript)
// Maximum performance with direct break_eternity.js operations

// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { pow, DecimalType } from '../numbers/migration-utils';

// ===== Safe numeric helpers =====
function safeExponentFromDecimal(exponent: DecimalType, max: number = 1_000_000): number {
  try {
    // Preserve extreme values for exponents
    const n = exponent.toNumber();
    if (Number.isFinite(n)) return Math.max(0, Math.min(n, max));
  } catch {}
  try {
    const s = exponent.toString();
    if (typeof s === 'string') {
      // Parse scientific notation like 1.23e+456
      const m = s.match(/^[^eE]+e([+\-]?\d+)$/);
      if (m) {
        const approx = Number(m[1]);
        if (Number.isFinite(approx)) return Math.max(0, Math.min(approx, max));
      }
    }
  } catch {}
  return max;
}

function safeLog10FromDecimal(value: DecimalType): number {
  try {
    // Preserve extreme values
    const n = value.toNumber();
    if (Number.isFinite(n) && n > 0) return Math.log10(n);
  } catch {}
  try {
    const s = value.toString();
    if (typeof s === 'string') {
      // Parse scientific notation mantissa and exponent
      const m = s.match(/^([\d.]+)e([+\-]?\d+)$/i);
      if (m) {
        const mant = Number(m[1]);
        const exp = Number(m[2]);
        const mantLog = Number.isFinite(mant) && mant > 0 ? Math.log10(mant) : 0;
        return mantLog + (Number.isFinite(exp) ? exp : 0);
      }
    }
  } catch {}
  return 0;
}

// Configuration for large number scaling
const ECONOMY_CONFIG = {
  // Soft caps to prevent numbers from growing too rapidly
  strawSoftCap: new Decimal('1e100'),
  cupSoftCap: new Decimal('1e100'),
  totalSoftCap: new Decimal('1e150'),

  // Scaling factors for very large numbers
  largeNumberScaling: {
    strawMultiplier: new Decimal('0.95'), // Slight diminishing returns
    cupMultiplier: new Decimal('0.98'), // Even smaller diminishing returns
    exponentialBase: new Decimal('1.001'), // Very gentle exponential growth
  },

  // Advanced economy mechanics
  synergyBonus: new Decimal('1.1'), // Bonus when both straws and cups are high
  milestoneBonus: new Decimal('2.0'), // Bonus at certain thresholds
};

export function computeStrawSPD(
  straws: number | string | DecimalType,
  baseSPD: number | string | DecimalType,
  widerStrawsCount: number | string | DecimalType,
  widerMultiplierPerLevel: number | string | DecimalType = 0
): DecimalType {
  const strawCount = new Decimal(straws);
  const baseValue = new Decimal(baseSPD);

  // Basic wider straws multiplier
  const upgradeMultiplier = new Decimal(1).add(
    new Decimal(widerStrawsCount).mul(new Decimal(widerMultiplierPerLevel))
  );

  // Calculate base production
  let totalSPD = baseValue.mul(upgradeMultiplier);

  // Apply scaling for very large numbers
  if (totalSPD.gte(ECONOMY_CONFIG.strawSoftCap)) {
    const excess = totalSPD.sub(ECONOMY_CONFIG.strawSoftCap);
    const exp = safeExponentFromDecimal(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = ECONOMY_CONFIG.strawSoftCap.add(
      excess.mul(ECONOMY_CONFIG.largeNumberScaling.strawMultiplier).mul(scaledExcess)
    );
  }

  // Add milestone bonuses for significant straw counts
  if (strawCount.gte(new Decimal('1e10'))) {
    totalSPD = totalSPD.mul(ECONOMY_CONFIG.milestoneBonus);
  }

  return totalSPD;
}

export function computeCupSPD(
  cups: number | string | DecimalType,
  baseSPD: number | string | DecimalType,
  betterCupsCount: number | string | DecimalType,
  betterMultiplierPerLevel: number | string | DecimalType = 0
): DecimalType {
  const cupCount = new Decimal(cups);
  const baseValue = new Decimal(baseSPD);

  // Basic better cups multiplier
  const upgradeMultiplier = new Decimal(1).add(
    new Decimal(betterCupsCount).mul(new Decimal(betterMultiplierPerLevel))
  );

  // Calculate base production
  let totalSPD = baseValue.mul(upgradeMultiplier);

  // Apply scaling for very large numbers
  if (totalSPD.gte(ECONOMY_CONFIG.cupSoftCap)) {
    const excess = totalSPD.sub(ECONOMY_CONFIG.cupSoftCap);
    const exp = safeExponentFromDecimal(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = ECONOMY_CONFIG.cupSoftCap.add(
      excess.mul(ECONOMY_CONFIG.largeNumberScaling.cupMultiplier).mul(scaledExcess)
    );
  }

  // Add milestone bonuses for significant cup counts
  if (cupCount.gte(new Decimal('1e10'))) {
    totalSPD = totalSPD.mul(ECONOMY_CONFIG.milestoneBonus);
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

  // Add synergy bonus when both straws and cups are significant
  let synergyMultiplier = new Decimal(1);
  if (strawCount.gte(new Decimal('100')) && cupCount.gte(new Decimal('100'))) {
    const strawRatio = strawCount.div(new Decimal('100'));
    const cupRatio = cupCount.div(new Decimal('100'));
    const synergyRatio = strawRatio.mul(cupRatio);
    const exp = safeExponentFromDecimal(synergyRatio);
    synergyMultiplier = synergyMultiplier.add(
      ECONOMY_CONFIG.synergyBonus.mul(pow(new Decimal('0.999'), exp))
    );
  }

  // Calculate total before scaling
  let totalSPD = strawContribution.add(cupContribution).mul(synergyMultiplier);

  // Apply soft cap for extremely large totals
  if (totalSPD.gte(ECONOMY_CONFIG.totalSoftCap)) {
    const excess = totalSPD.sub(ECONOMY_CONFIG.totalSoftCap);
    const exp = safeExponentFromDecimal(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = ECONOMY_CONFIG.totalSoftCap.add(excess.mul(new Decimal('0.9')).mul(scaledExcess));
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

  // For extremely high SPD values, add diminishing returns
  if (spd.gte(new Decimal('1e50'))) {
    const excessSPD = spd.sub(new Decimal('1e50'));
    const exp = safeExponentFromDecimal(excessSPD);
    const diminishingFactor = pow(new Decimal('0.9999'), exp);
    totalSips = base.add(new Decimal('1e50')).add(excessSPD.mul(diminishingFactor));
  }

  return totalSips;
}

// Advanced economy functions for very large numbers

/**
 * Calculate prestige bonus based on total sips earned
 */
export function computePrestigeBonus(
  totalSipsEarned: number | string | DecimalType,
  prestigeLevel: number | string | DecimalType = 0
): DecimalType {
  const totalSips = new Decimal(totalSipsEarned);
  const prestige = new Decimal(prestigeLevel);

  // Base prestige bonus scales logarithmically with total sips
  const log = safeLog10FromDecimal(totalSips);
  const baseBonus = new Decimal('1.1').add(log > 0 ? new Decimal(log / 10) : new Decimal(0));

  // Additional bonus from prestige level
  const prestigeMultiplier = new Decimal('1').add(prestige.mul(new Decimal('0.5')));

  return baseBonus.mul(prestigeMultiplier);
}

/**
 * Calculate golden straw multiplier for very large straw counts
 */
export function computeGoldenStrawMultiplier(
  straws: number | string | DecimalType,
  goldenStrawCount: number | string | DecimalType = 0
): DecimalType {
  const strawCount = new Decimal(straws);
  const goldenCount = new Decimal(goldenStrawCount);

  // Base multiplier from golden straws
  let multiplier = new Decimal('1').add(goldenCount.mul(new Decimal('0.1')));

  // Bonus multiplier for very large straw counts
  if (strawCount.gte(new Decimal('1e20'))) {
    const log = safeLog10FromDecimal(strawCount);
    const bonusMultiplier = new Decimal('2').add(new Decimal(log / 10));
    multiplier = multiplier.mul(bonusMultiplier);
  }

  return multiplier;
}

/**
 * Calculate efficiency bonus for optimized production
 */
export function computeEfficiencyBonus(
  totalSPD: number | string | DecimalType,
  optimizationLevel: number | string | DecimalType = 0
): DecimalType {
  const spd = new Decimal(totalSPD);
  const optimization = new Decimal(optimizationLevel);

  // Base efficiency bonus
  const baseBonus = optimization.mul(new Decimal('0.05'));

  // Additional bonus for high SPD
  let spdBonus = new Decimal(1);
  if (spd.gte(new Decimal('1e30'))) {
    const log = safeLog10FromDecimal(spd);
    spdBonus = new Decimal('1.5').add(new Decimal(log / 20));
  }

  return new Decimal('1').add(baseBonus).mul(spdBonus);
}

/**
 * Calculate breakthrough multiplier for milestone achievements
 */
export function computeBreakthroughMultiplier(
  totalSipsEarned: number | string | DecimalType,
  breakthroughLevel: number | string | DecimalType = 0
): DecimalType {
  const totalSips = new Decimal(totalSipsEarned);
  const breakthrough = new Decimal(breakthroughLevel);

  // Breakthroughs provide exponential bonuses
  const breakthroughBonus = pow(new Decimal('1.5'), safeExponentFromDecimal(breakthrough));

  // Additional scaling based on total sips
  let sipScaling = new Decimal(1);
  if (totalSips.gte(new Decimal('1e100'))) {
    const log = safeLog10FromDecimal(totalSips);
    sipScaling = new Decimal('2').add(new Decimal(log / 50));
  }

  return breakthroughBonus.mul(sipScaling);
}

/**
 * Calculate inflation rate for very large economies
 */
export function computeInflationRate(
  totalSipsEarned: number | string | DecimalType,
  totalPurchases: number | string | DecimalType = 0
): DecimalType {
  const totalSips = new Decimal(totalSipsEarned);
  const purchases = new Decimal(totalPurchases);

  // Base inflation rate scales with total economy size
  let inflationRate = new Decimal('1');

  if (totalSips.gte(new Decimal('1e20'))) {
    const log = safeLog10FromDecimal(totalSips);
    inflationRate = inflationRate.add(new Decimal(log / 100));
  }

  // Additional inflation from frequent purchases
  if (purchases.gte(new Decimal('1000'))) {
    const log = safeLog10FromDecimal(purchases);
    inflationRate = inflationRate.mul(new Decimal('1').add(new Decimal(log / 100)));
  }

  return inflationRate;
}

/**
 * Calculate interest rate for sip savings (banking system)
 */
export function computeInterestRate(
  sipsInBank: number | string | DecimalType,
  bankLevel: number | string | DecimalType = 0
): DecimalType {
  const bankSips = new Decimal(sipsInBank);
  const level = new Decimal(bankLevel);

  // Base interest rate from bank level
  const baseRate = new Decimal('0.001').mul(level);

  // Bonus rate for large deposits
  let depositBonus = new Decimal(0);
  if (bankSips.gte(new Decimal('1e10'))) {
    const log = safeLog10FromDecimal(bankSips);
    depositBonus = new Decimal(log / 1000);
  }

  return baseRate.add(depositBonus);
}

// Legacy functions for backward compatibility
export function computeStrawSPDLegacy(
  straws: number | string,
  baseSPD: number | string,
  widerStrawsCount: number | string,
  widerMultiplierPerLevel: number | string = 0
): number {
  // Preserve extreme values - direct toNumber
  return computeStrawSPD(straws, baseSPD, widerStrawsCount, widerMultiplierPerLevel).toNumber();
}

export function computeCupSPDLegacy(
  cups: number | string,
  baseSPD: number | string,
  betterCupsCount: number | string,
  betterMultiplierPerLevel: number | string = 0
): number {
  // Preserve extreme values - direct toNumber
  return computeCupSPD(cups, baseSPD, betterCupsCount, betterMultiplierPerLevel).toNumber();
}

export function computeTotalSPDLegacy(
  straws: number | string,
  strawSPD: number | string,
  cups: number | string,
  cupSPD: number | string
): number {
  // Preserve extreme values - direct toNumber
  return computeTotalSPD(straws, strawSPD, cups, cupSPD).toNumber();
}

export function computeTotalSipsPerDrinkLegacy(
  baseSipsPerDrink: number | string,
  totalSPD: number | string
): number {
  // Preserve extreme values - direct toNumber
  return computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD).toNumber();
}
