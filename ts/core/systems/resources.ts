import {
  computeCupSPD,
  computeStrawSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
} from '../rules/economy.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';
import { Decimal } from '../numbers/large-number';
import { toDecimal } from '../numbers/migration-utils';

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
  straws: number | Decimal;
  cups: number | Decimal;
  widerStraws: number | Decimal;
  betterCups: number | Decimal;
  base?: {
    strawBaseSPD?: number | Decimal;
    cupBaseSPD?: number | Decimal;
    baseSipsPerDrink?: number | Decimal;
  };
  multipliers?: {
    widerStrawsPerLevel?: number | Decimal;
    betterCupsPerLevel?: number | Decimal;
  };
}): { strawSPD: Decimal; cupSPD: Decimal; sipsPerDrink: Decimal } {
  const { upgrades, config } = getConfig();

  // Convert all values to Decimal for consistent calculations
  const strawBaseSPD = toDecimal(
    base.strawBaseSPD ?? upgrades?.straws?.baseSPD ?? config.STRAW_BASE_SPD ?? 0.6
  );
  const cupBaseSPD = toDecimal(
    base.cupBaseSPD ?? upgrades?.cups?.baseSPD ?? config.CUP_BASE_SPD ?? 1.2
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
