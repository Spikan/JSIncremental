// Economy formulas for SPD and totals with direct Decimal support (TypeScript)
// Maximum performance with direct break_eternity.js operations

import { DecimalOps, Decimal } from '../numbers/large-number';
import { pow } from '../numbers/migration-utils';

// ===== Safe numeric helpers =====
function safeExponentFromDecimal(exponent: Decimal, max: number = 1_000_000): number {
  try {
    const n = DecimalOps.toSafeNumber(exponent);
    if (Number.isFinite(n)) return Math.max(0, Math.min(n, max));
  } catch {}
  try {
    const s = DecimalOps.toString(exponent);
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

function safeLog10FromDecimal(value: Decimal): number {
  try {
    const n = DecimalOps.toSafeNumber(value);
    if (Number.isFinite(n) && n > 0) return Math.log10(n);
  } catch {}
  try {
    const s = DecimalOps.toString(value);
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
  strawSoftCap: DecimalOps.create('1e100'),
  cupSoftCap: DecimalOps.create('1e100'),
  totalSoftCap: DecimalOps.create('1e150'),

  // Scaling factors for very large numbers
  largeNumberScaling: {
    strawMultiplier: DecimalOps.create('0.95'), // Slight diminishing returns
    cupMultiplier: DecimalOps.create('0.98'), // Even smaller diminishing returns
    exponentialBase: DecimalOps.create('1.001'), // Very gentle exponential growth
  },

  // Advanced economy mechanics
  synergyBonus: DecimalOps.create('1.1'), // Bonus when both straws and cups are high
  milestoneBonus: DecimalOps.create('2.0'), // Bonus at certain thresholds
};

export function computeStrawSPD(
  straws: number | string | Decimal,
  baseSPD: number | string | Decimal,
  widerStrawsCount: number | string | Decimal,
  widerMultiplierPerLevel: number | string | Decimal = 0
): Decimal {
  const strawCount = DecimalOps.create(straws);
  const baseValue = DecimalOps.create(baseSPD);

  // Basic wider straws multiplier
  const upgradeMultiplier = DecimalOps.add(
    DecimalOps.create(1),
    DecimalOps.multiply(
      DecimalOps.create(widerStrawsCount),
      DecimalOps.create(widerMultiplierPerLevel)
    )
  );

  // Calculate base production
  let totalSPD = DecimalOps.multiply(baseValue, upgradeMultiplier);

  // Apply scaling for very large numbers
  if (DecimalOps.greaterThanOrEqual(totalSPD, ECONOMY_CONFIG.strawSoftCap)) {
    const excess = DecimalOps.subtract(totalSPD, ECONOMY_CONFIG.strawSoftCap);
    const exp = safeExponentFromDecimal(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = DecimalOps.add(
      ECONOMY_CONFIG.strawSoftCap,
      DecimalOps.multiply(
        DecimalOps.multiply(excess, ECONOMY_CONFIG.largeNumberScaling.strawMultiplier),
        scaledExcess
      )
    );
  }

  // Add milestone bonuses for significant straw counts
  if (DecimalOps.greaterThanOrEqual(strawCount, DecimalOps.create('1e10'))) {
    totalSPD = DecimalOps.multiply(totalSPD, ECONOMY_CONFIG.milestoneBonus);
  }

  return totalSPD;
}

export function computeCupSPD(
  cups: number | string | Decimal,
  baseSPD: number | string | Decimal,
  betterCupsCount: number | string | Decimal,
  betterMultiplierPerLevel: number | string | Decimal = 0
): Decimal {
  const cupCount = DecimalOps.create(cups);
  const baseValue = DecimalOps.create(baseSPD);

  // Basic better cups multiplier
  const upgradeMultiplier = DecimalOps.add(
    DecimalOps.create(1),
    DecimalOps.multiply(
      DecimalOps.create(betterCupsCount),
      DecimalOps.create(betterMultiplierPerLevel)
    )
  );

  // Calculate base production
  let totalSPD = DecimalOps.multiply(baseValue, upgradeMultiplier);

  // Apply scaling for very large numbers
  if (DecimalOps.greaterThanOrEqual(totalSPD, ECONOMY_CONFIG.cupSoftCap)) {
    const excess = DecimalOps.subtract(totalSPD, ECONOMY_CONFIG.cupSoftCap);
    const exp = safeExponentFromDecimal(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = DecimalOps.add(
      ECONOMY_CONFIG.cupSoftCap,
      DecimalOps.multiply(
        DecimalOps.multiply(excess, ECONOMY_CONFIG.largeNumberScaling.cupMultiplier),
        scaledExcess
      )
    );
  }

  // Add milestone bonuses for significant cup counts
  if (DecimalOps.greaterThanOrEqual(cupCount, DecimalOps.create('1e10'))) {
    totalSPD = DecimalOps.multiply(totalSPD, ECONOMY_CONFIG.milestoneBonus);
  }

  return totalSPD;
}

export function computeTotalSPD(
  straws: number | string | Decimal,
  strawSPD: number | string | Decimal,
  cups: number | string | Decimal,
  cupSPD: number | string | Decimal
): Decimal {
  const strawCount = DecimalOps.create(straws);
  const cupCount = DecimalOps.create(cups);
  const strawValue = DecimalOps.create(strawSPD);
  const cupValue = DecimalOps.create(cupSPD);

  // Calculate individual contributions
  const strawContribution = DecimalOps.multiply(strawValue, strawCount);
  const cupContribution = DecimalOps.multiply(cupValue, cupCount);

  // Add synergy bonus when both straws and cups are significant
  let synergyMultiplier = DecimalOps.create(1);
  if (DecimalOps.greaterThanOrEqual(strawCount, DecimalOps.create('100')) &&
      DecimalOps.greaterThanOrEqual(cupCount, DecimalOps.create('100'))) {
    const strawRatio = DecimalOps.divide(strawCount, DecimalOps.create('100'));
    const cupRatio = DecimalOps.divide(cupCount, DecimalOps.create('100'));
    const synergyRatio = DecimalOps.multiply(strawRatio, cupRatio);
    const exp = safeExponentFromDecimal(synergyRatio);
    synergyMultiplier = DecimalOps.add(
      synergyMultiplier,
      DecimalOps.multiply(
        ECONOMY_CONFIG.synergyBonus,
        pow(DecimalOps.create('0.999'), exp)
      )
    );
  }

  // Calculate total before scaling
  let totalSPD = DecimalOps.multiply(
    DecimalOps.add(strawContribution, cupContribution),
    synergyMultiplier
  );

  // Apply soft cap for extremely large totals
  if (DecimalOps.greaterThanOrEqual(totalSPD, ECONOMY_CONFIG.totalSoftCap)) {
    const excess = DecimalOps.subtract(totalSPD, ECONOMY_CONFIG.totalSoftCap);
    const exp = safeExponentFromDecimal(excess);
    const scaledExcess = pow(ECONOMY_CONFIG.largeNumberScaling.exponentialBase, exp);
    totalSPD = DecimalOps.add(
      ECONOMY_CONFIG.totalSoftCap,
      DecimalOps.multiply(
        DecimalOps.multiply(excess, DecimalOps.create('0.9')),
        scaledExcess
      )
    );
  }

  return totalSPD;
}

export function computeTotalSipsPerDrink(
  baseSipsPerDrink: number | string | Decimal,
  totalSPD: number | string | Decimal
): Decimal {
  const base = DecimalOps.create(baseSipsPerDrink);
  const spd = DecimalOps.create(totalSPD);

  // Calculate total sips per drink
  let totalSips = DecimalOps.add(base, spd);

  // For extremely high SPD values, add diminishing returns
  if (DecimalOps.greaterThanOrEqual(spd, DecimalOps.create('1e50'))) {
    const excessSPD = DecimalOps.subtract(spd, DecimalOps.create('1e50'));
    const exp = safeExponentFromDecimal(excessSPD);
    const diminishingFactor = pow(DecimalOps.create('0.9999'), exp);
    totalSips = DecimalOps.add(
      DecimalOps.add(base, DecimalOps.create('1e50')),
      DecimalOps.multiply(excessSPD, diminishingFactor)
    );
  }

  return totalSips;
}

// Advanced economy functions for very large numbers

/**
 * Calculate prestige bonus based on total sips earned
 */
export function computePrestigeBonus(
  totalSipsEarned: number | string | Decimal,
  prestigeLevel: number | string | Decimal = 0
): Decimal {
  const totalSips = DecimalOps.create(totalSipsEarned);
  const prestige = DecimalOps.create(prestigeLevel);

  // Base prestige bonus scales logarithmically with total sips
  const log = safeLog10FromDecimal(totalSips);
  const baseBonus = DecimalOps.add(
    DecimalOps.create('1.1'),
    log > 0 ? DecimalOps.create(log / 10) : DecimalOps.create(0)
  );

  // Additional bonus from prestige level
  const prestigeMultiplier = DecimalOps.add(
    DecimalOps.create('1'),
    DecimalOps.multiply(prestige, DecimalOps.create('0.5'))
  );

  return DecimalOps.multiply(baseBonus, prestigeMultiplier);
}

/**
 * Calculate golden straw multiplier for very large straw counts
 */
export function computeGoldenStrawMultiplier(
  straws: number | string | Decimal,
  goldenStrawCount: number | string | Decimal = 0
): Decimal {
  const strawCount = DecimalOps.create(straws);
  const goldenCount = DecimalOps.create(goldenStrawCount);

  // Base multiplier from golden straws
  let multiplier = DecimalOps.add(
    DecimalOps.create('1'),
    DecimalOps.multiply(goldenCount, DecimalOps.create('0.1'))
  );

  // Bonus multiplier for very large straw counts
  if (DecimalOps.greaterThanOrEqual(strawCount, DecimalOps.create('1e20'))) {
    const log = safeLog10FromDecimal(strawCount);
    const bonusMultiplier = DecimalOps.add(
      DecimalOps.create('2'),
      DecimalOps.create(log / 10)
    );
    multiplier = DecimalOps.multiply(multiplier, bonusMultiplier);
  }

  return multiplier;
}

/**
 * Calculate efficiency bonus for optimized production
 */
export function computeEfficiencyBonus(
  totalSPD: number | string | Decimal,
  optimizationLevel: number | string | Decimal = 0
): Decimal {
  const spd = DecimalOps.create(totalSPD);
  const optimization = DecimalOps.create(optimizationLevel);

  // Base efficiency bonus
  const baseBonus = DecimalOps.multiply(optimization, DecimalOps.create('0.05'));

  // Additional bonus for high SPD
  let spdBonus = DecimalOps.create(1);
  if (DecimalOps.greaterThanOrEqual(spd, DecimalOps.create('1e30'))) {
    const log = safeLog10FromDecimal(spd);
    spdBonus = DecimalOps.add(
      DecimalOps.create('1.5'),
      DecimalOps.create(log / 20)
    );
  }

  return DecimalOps.multiply(
    DecimalOps.add(DecimalOps.create('1'), baseBonus),
    spdBonus
  );
}

/**
 * Calculate breakthrough multiplier for milestone achievements
 */
export function computeBreakthroughMultiplier(
  totalSipsEarned: number | string | Decimal,
  breakthroughLevel: number | string | Decimal = 0
): Decimal {
  const totalSips = DecimalOps.create(totalSipsEarned);
  const breakthrough = DecimalOps.create(breakthroughLevel);

  // Breakthroughs provide exponential bonuses
  const breakthroughBonus = pow(DecimalOps.create('1.5'), safeExponentFromDecimal(breakthrough));

  // Additional scaling based on total sips
  let sipScaling = DecimalOps.create(1);
  if (DecimalOps.greaterThanOrEqual(totalSips, DecimalOps.create('1e100'))) {
    const log = safeLog10FromDecimal(totalSips);
    sipScaling = DecimalOps.add(
      DecimalOps.create('2'),
      DecimalOps.create(log / 50)
    );
  }

  return DecimalOps.multiply(breakthroughBonus, sipScaling);
}

/**
 * Calculate inflation rate for very large economies
 */
export function computeInflationRate(
  totalSipsEarned: number | string | Decimal,
  totalPurchases: number | string | Decimal = 0
): Decimal {
  const totalSips = DecimalOps.create(totalSipsEarned);
  const purchases = DecimalOps.create(totalPurchases);

  // Base inflation rate scales with total economy size
  let inflationRate = DecimalOps.create('1');

  if (DecimalOps.greaterThanOrEqual(totalSips, DecimalOps.create('1e20'))) {
    const log = safeLog10FromDecimal(totalSips);
    inflationRate = DecimalOps.add(inflationRate, DecimalOps.create(log / 100));
  }

  // Additional inflation from frequent purchases
  if (DecimalOps.greaterThanOrEqual(purchases, DecimalOps.create('1000'))) {
    const log = safeLog10FromDecimal(purchases);
    inflationRate = DecimalOps.multiply(
      inflationRate,
      DecimalOps.add(DecimalOps.create('1'), DecimalOps.create(log / 100))
    );
  }

  return inflationRate;
}

/**
 * Calculate interest rate for sip savings (banking system)
 */
export function computeInterestRate(
  sipsInBank: number | string | Decimal,
  bankLevel: number | string | Decimal = 0
): Decimal {
  const bankSips = DecimalOps.create(sipsInBank);
  const level = DecimalOps.create(bankLevel);

  // Base interest rate from bank level
  const baseRate = DecimalOps.multiply(DecimalOps.create('0.001'), level);

  // Bonus rate for large deposits
  let depositBonus = DecimalOps.create(0);
  if (DecimalOps.greaterThanOrEqual(bankSips, DecimalOps.create('1e10'))) {
    const log = safeLog10FromDecimal(bankSips);
    depositBonus = DecimalOps.create(log / 1000);
  }

  return DecimalOps.add(baseRate, depositBonus);
}

// Legacy functions for backward compatibility
export function computeStrawSPDLegacy(
  straws: number | string,
  baseSPD: number | string,
  widerStrawsCount: number | string,
  widerMultiplierPerLevel: number | string = 0
): number {
  return DecimalOps.toSafeNumber(computeStrawSPD(straws, baseSPD, widerStrawsCount, widerMultiplierPerLevel));
}

export function computeCupSPDLegacy(
  cups: number | string,
  baseSPD: number | string,
  betterCupsCount: number | string,
  betterMultiplierPerLevel: number | string = 0
): number {
  return DecimalOps.toSafeNumber(computeCupSPD(cups, baseSPD, betterCupsCount, betterMultiplierPerLevel));
}

export function computeTotalSPDLegacy(
  straws: number | string,
  strawSPD: number | string,
  cups: number | string,
  cupSPD: number | string
): number {
  return DecimalOps.toSafeNumber(computeTotalSPD(straws, strawSPD, cups, cupSPD));
}

export function computeTotalSipsPerDrinkLegacy(
  baseSipsPerDrink: number | string,
  totalSPD: number | string
): number {
  return DecimalOps.toSafeNumber(computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD));
}
