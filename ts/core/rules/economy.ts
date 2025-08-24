// Economy formulas for SPD and totals with LargeNumber support (TypeScript)
// Enhanced for very large numbers with scaling and balance considerations

import { LargeNumber } from '../numbers/large-number';
import { pow } from '../numbers/migration-utils';

// ===== Safe numeric helpers =====
function safeExponentFromLarge(exponent: LargeNumber, max: number = 1_000_000): number {
  try {
    const n = (exponent as any).toNumber?.();
    if (Number.isFinite(n)) return Math.max(0, Math.min(n, max));
  } catch {}
  try {
    const s = (exponent as any).toString?.() as string;
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

function safeLog10FromLarge(value: LargeNumber): number {
  try {
    const n = (value as any).toNumber?.();
    if (Number.isFinite(n) && n > 0) return Math.log10(n);
  } catch {}
  try {
    const s = (value as any).toString?.() as string;
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
  strawSoftCap: new LargeNumber('1e100'),
  cupSoftCap: new LargeNumber('1e100'),
  totalSoftCap: new LargeNumber('1e150'),

  // Scaling factors for very large numbers
  largeNumberScaling: {
    strawMultiplier: new LargeNumber('0.95'), // Slight diminishing returns
    cupMultiplier: new LargeNumber('0.98'), // Even smaller diminishing returns
    exponentialBase: new LargeNumber('1.001'), // Very gentle exponential growth
  },

  // Advanced economy mechanics
  synergyBonus: new LargeNumber('1.1'), // Bonus when both straws and cups are high
  milestoneBonus: new LargeNumber('2.0'), // Bonus at certain thresholds
};

export function computeStrawSPD(
  straws: number | string | LargeNumber,
  baseSPD: number | string | LargeNumber,
  widerStrawsCount: number | string | LargeNumber,
  widerMultiplierPerLevel: number | string | LargeNumber = 0
): LargeNumber {
  const strawCount = new LargeNumber(straws);
  const baseValue = new LargeNumber(baseSPD);

  // Basic wider straws multiplier
  const upgradeMultiplier = new LargeNumber(1).add(
    new LargeNumber(widerStrawsCount).multiply(new LargeNumber(widerMultiplierPerLevel))
  );

  // Calculate base production
  let totalSPD = baseValue.multiply(upgradeMultiplier);

  // Apply scaling for very large numbers
  if (totalSPD.gte(ECONOMY_CONFIG.strawSoftCap)) {
    const excess = totalSPD.subtract(ECONOMY_CONFIG.strawSoftCap);
    const exp = safeExponentFromLarge(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = ECONOMY_CONFIG.strawSoftCap.add(
      excess.multiply(ECONOMY_CONFIG.largeNumberScaling.strawMultiplier).multiply(scaledExcess)
    );
  }

  // Add milestone bonuses for significant straw counts
  if (strawCount.gte(new LargeNumber('1e10'))) {
    totalSPD = totalSPD.multiply(ECONOMY_CONFIG.milestoneBonus);
  }

  return totalSPD;
}

export function computeCupSPD(
  cups: number | string | LargeNumber,
  baseSPD: number | string | LargeNumber,
  betterCupsCount: number | string | LargeNumber,
  betterMultiplierPerLevel: number | string | LargeNumber = 0
): LargeNumber {
  const cupCount = new LargeNumber(cups);
  const baseValue = new LargeNumber(baseSPD);

  // Basic better cups multiplier
  const upgradeMultiplier = new LargeNumber(1).add(
    new LargeNumber(betterCupsCount).multiply(new LargeNumber(betterMultiplierPerLevel))
  );

  // Calculate base production
  let totalSPD = baseValue.multiply(upgradeMultiplier);

  // Apply scaling for very large numbers
  if (totalSPD.gte(ECONOMY_CONFIG.cupSoftCap)) {
    const excess = totalSPD.subtract(ECONOMY_CONFIG.cupSoftCap);
    const exp = safeExponentFromLarge(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = ECONOMY_CONFIG.cupSoftCap.add(
      excess.multiply(ECONOMY_CONFIG.largeNumberScaling.cupMultiplier).multiply(scaledExcess)
    );
  }

  // Add milestone bonuses for significant cup counts
  if (cupCount.gte(new LargeNumber('1e10'))) {
    totalSPD = totalSPD.multiply(ECONOMY_CONFIG.milestoneBonus);
  }

  return totalSPD;
}

export function computeTotalSPD(
  straws: number | string | LargeNumber,
  strawSPD: number | string | LargeNumber,
  cups: number | string | LargeNumber,
  cupSPD: number | string | LargeNumber
): LargeNumber {
  const strawCount = new LargeNumber(straws);
  const cupCount = new LargeNumber(cups);
  const strawValue = new LargeNumber(strawSPD);
  const cupValue = new LargeNumber(cupSPD);

  // Calculate individual contributions
  const strawContribution = strawValue.multiply(strawCount);
  const cupContribution = cupValue.multiply(cupCount);

  // Add synergy bonus when both straws and cups are significant
  let synergyMultiplier = new LargeNumber(1);
  if (strawCount.gte(new LargeNumber('100')) && cupCount.gte(new LargeNumber('100'))) {
    const strawRatio = strawCount.divide(new LargeNumber('100'));
    const cupRatio = cupCount.divide(new LargeNumber('100'));
    const synergyRatio = strawRatio.multiply(cupRatio);
    const exp = safeExponentFromLarge(synergyRatio);
    synergyMultiplier = synergyMultiplier.add(
      ECONOMY_CONFIG.synergyBonus.multiply(pow(new LargeNumber('0.999'), exp))
    );
  }

  // Calculate total before scaling
  let totalSPD = strawContribution.add(cupContribution).multiply(synergyMultiplier);

  // Apply soft cap for extremely large totals
  if (totalSPD.gte(ECONOMY_CONFIG.totalSoftCap)) {
    const excess = totalSPD.subtract(ECONOMY_CONFIG.totalSoftCap);
    const exp = safeExponentFromLarge(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = ECONOMY_CONFIG.totalSoftCap.add(
      excess.multiply(new LargeNumber('0.9')).multiply(scaledExcess)
    );
  }

  return totalSPD;
}

export function computeTotalSipsPerDrink(
  baseSipsPerDrink: number | string | LargeNumber,
  totalSPD: number | string | LargeNumber
): LargeNumber {
  const base = new LargeNumber(baseSipsPerDrink);
  const spd = new LargeNumber(totalSPD);

  // Calculate total sips per drink
  let totalSips = base.add(spd);

  // For extremely high SPD values, add diminishing returns
  if (spd.gte(new LargeNumber('1e50'))) {
    const excessSPD = spd.subtract(new LargeNumber('1e50'));
    const exp = safeExponentFromLarge(excessSPD);
    const diminishingFactor = pow(new LargeNumber('0.9999'), exp);
    totalSips = base.add(new LargeNumber('1e50')).add(excessSPD.multiply(diminishingFactor));
  }

  return totalSips;
}

// Advanced economy functions for very large numbers

/**
 * Calculate prestige bonus based on total sips earned
 */
export function computePrestigeBonus(
  totalSipsEarned: number | string | LargeNumber,
  prestigeLevel: number | string | LargeNumber = 0
): LargeNumber {
  const totalSips = new LargeNumber(totalSipsEarned);
  const prestige = new LargeNumber(prestigeLevel);

  // Base prestige bonus scales logarithmically with total sips
  const log = safeLog10FromLarge(totalSips);
  const baseBonus = new LargeNumber('1.1').add(
    log > 0 ? new LargeNumber(log / 10) : new LargeNumber(0)
  );

  // Additional bonus from prestige level
  const prestigeMultiplier = new LargeNumber('1').add(prestige.multiply(new LargeNumber('0.5')));

  return baseBonus.multiply(prestigeMultiplier);
}

/**
 * Calculate golden straw multiplier for very large straw counts
 */
export function computeGoldenStrawMultiplier(
  straws: number | string | LargeNumber,
  goldenStrawCount: number | string | LargeNumber = 0
): LargeNumber {
  const strawCount = new LargeNumber(straws);
  const goldenCount = new LargeNumber(goldenStrawCount);

  // Base multiplier from golden straws
  let multiplier = new LargeNumber('1').add(goldenCount.multiply(new LargeNumber('0.1')));

  // Bonus multiplier for very large straw counts
  if (strawCount.gte(new LargeNumber('1e20'))) {
    const log = safeLog10FromLarge(strawCount);
    const bonusMultiplier = new LargeNumber('2').add(new LargeNumber(log / 10));
    multiplier = multiplier.multiply(bonusMultiplier);
  }

  return multiplier;
}

/**
 * Calculate efficiency bonus for optimized production
 */
export function computeEfficiencyBonus(
  totalSPD: number | string | LargeNumber,
  optimizationLevel: number | string | LargeNumber = 0
): LargeNumber {
  const spd = new LargeNumber(totalSPD);
  const optimization = new LargeNumber(optimizationLevel);

  // Base efficiency bonus
  const baseBonus = optimization.multiply(new LargeNumber('0.05'));

  // Additional bonus for high SPD
  let spdBonus = new LargeNumber(1);
  if (spd.gte(new LargeNumber('1e30'))) {
    const log = safeLog10FromLarge(spd);
    spdBonus = new LargeNumber('1.5').add(new LargeNumber(log / 20));
  }

  return new LargeNumber('1').add(baseBonus).multiply(spdBonus);
}

/**
 * Calculate breakthrough multiplier for milestone achievements
 */
export function computeBreakthroughMultiplier(
  totalSipsEarned: number | string | LargeNumber,
  breakthroughLevel: number | string | LargeNumber = 0
): LargeNumber {
  const totalSips = new LargeNumber(totalSipsEarned);
  const breakthrough = new LargeNumber(breakthroughLevel);

  // Breakthroughs provide exponential bonuses
  const breakthroughBonus = pow(new LargeNumber('1.5'), safeExponentFromLarge(breakthrough));

  // Additional scaling based on total sips
  let sipScaling = new LargeNumber(1);
  if (totalSips.gte(new LargeNumber('1e100'))) {
    const log = safeLog10FromLarge(totalSips);
    sipScaling = new LargeNumber('2').add(new LargeNumber(log / 50));
  }

  return breakthroughBonus.multiply(sipScaling);
}

/**
 * Calculate inflation rate for very large economies
 */
export function computeInflationRate(
  totalSipsEarned: number | string | LargeNumber,
  totalPurchases: number | string | LargeNumber = 0
): LargeNumber {
  const totalSips = new LargeNumber(totalSipsEarned);
  const purchases = new LargeNumber(totalPurchases);

  // Base inflation rate scales with total economy size
  let inflationRate = new LargeNumber('1');

  if (totalSips.gte(new LargeNumber('1e20'))) {
    const log = safeLog10FromLarge(totalSips);
    inflationRate = inflationRate.add(new LargeNumber(log / 100));
  }

  // Additional inflation from frequent purchases
  if (purchases.gte(new LargeNumber('1000'))) {
    const log = safeLog10FromLarge(purchases);
    inflationRate = inflationRate.multiply(new LargeNumber('1').add(new LargeNumber(log / 100)));
  }

  return inflationRate;
}

/**
 * Calculate interest rate for sip savings (banking system)
 */
export function computeInterestRate(
  sipsInBank: number | string | LargeNumber,
  bankLevel: number | string | LargeNumber = 0
): LargeNumber {
  const bankSips = new LargeNumber(sipsInBank);
  const level = new LargeNumber(bankLevel);

  // Base interest rate from bank level
  const baseRate = new LargeNumber('0.001').multiply(level);

  // Bonus rate for large deposits
  let depositBonus = new LargeNumber(0);
  if (bankSips.gte(new LargeNumber('1e10'))) {
    const log = safeLog10FromLarge(bankSips);
    depositBonus = new LargeNumber(log / 1000);
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
  return computeStrawSPD(straws, baseSPD, widerStrawsCount, widerMultiplierPerLevel).toNumber();
}

export function computeCupSPDLegacy(
  cups: number | string,
  baseSPD: number | string,
  betterCupsCount: number | string,
  betterMultiplierPerLevel: number | string = 0
): number {
  return computeCupSPD(cups, baseSPD, betterCupsCount, betterMultiplierPerLevel).toNumber();
}

export function computeTotalSPDLegacy(
  straws: number | string,
  strawSPD: number | string,
  cups: number | string,
  cupSPD: number | string
): number {
  return computeTotalSPD(straws, strawSPD, cups, cupSPD).toNumber();
}

export function computeTotalSipsPerDrinkLegacy(
  baseSipsPerDrink: number | string,
  totalSPD: number | string
): number {
  return computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD).toNumber();
}
