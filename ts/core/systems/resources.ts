import {
  computeCupSPD,
  computeStrawSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
} from '../rules/economy.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';
// Direct Decimal access - no wrapper needed
import { toDecimal } from '../numbers/migration-utils';
import { DecimalType } from '../numbers/decimal-utils';

function getConfig(): { upgrades: any; config: any } {
  return getUpgradesAndConfig();
}

export function recalcProduction({
  straws,
  cups,
  widerStraws,
  betterCups,
  base = {},
  multipliers = {},
}: {
  straws: number | DecimalType;
  cups: number | DecimalType;
  widerStraws: number | DecimalType;
  betterCups: number | DecimalType;
  base?: {
    strawBaseSPD?: number | DecimalType;
    cupBaseSPD?: number | DecimalType;
    baseSipsPerDrink?: number | DecimalType;
  };
  multipliers?: {
    widerStrawsPerLevel?: number | DecimalType;
    betterCupsPerLevel?: number | DecimalType;
  };
}): { strawSPD: DecimalType; cupSPD: DecimalType; sipsPerDrink: DecimalType } {
  const { upgrades, config } = getConfig();

  // Convert all values to Decimal for consistent calculations
  const strawBaseSPD = toDecimal(
    base.strawBaseSPD ?? upgrades?.straws?.baseSPD ?? config.STRAW_BASE_SPD ?? 2.0
  );
  const cupBaseSPD = toDecimal(
    base.cupBaseSPD ?? upgrades?.cups?.baseSPD ?? config.CUP_BASE_SPD ?? 5.0
  );
  const baseSipsPerDrink = toDecimal(base.baseSipsPerDrink ?? config.BASE_SIPS_PER_DRINK ?? 1);

  const widerStrawsPerLevel = toDecimal(
    multipliers.widerStrawsPerLevel ??
      upgrades?.widerStraws?.multiplierPerLevel ??
      config.WIDER_STRAWS_MULTIPLIER ??
      0.5
  );
  const betterCupsPerLevel = toDecimal(
    multipliers.betterCupsPerLevel ??
      upgrades?.betterCups?.multiplierPerLevel ??
      config.BETTER_CUPS_MULTIPLIER ??
      0.4
  );

  // Use Decimal versions of all inputs
  const strawsLarge = toDecimal(straws);
  const cupsLarge = toDecimal(cups);
  const widerStrawsLarge = toDecimal(widerStraws);
  const betterCupsLarge = toDecimal(betterCups);

  // Calculate production values with Decimal support
  const strawSPD = computeStrawSPD(
    strawsLarge,
    strawBaseSPD,
    widerStrawsLarge,
    widerStrawsPerLevel
  );
  const cupSPD = computeCupSPD(cupsLarge, cupBaseSPD, betterCupsLarge, betterCupsPerLevel);
  const totalSPD = computeTotalSPD(strawsLarge, strawSPD, cupsLarge, cupSPD);
  const sipsPerDrink = computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD);

  return { strawSPD, cupSPD, sipsPerDrink };
}
