import {
  computeCupSPD,
  computeStrawSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
} from '../rules/economy.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';
import { LargeNumber } from '../numbers/large-number';
import { toLargeNumber } from '../numbers/migration-utils';

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
  straws: number | LargeNumber;
  cups: number | LargeNumber;
  widerStraws: number | LargeNumber;
  betterCups: number | LargeNumber;
  base?: {
    strawBaseSPD?: number | LargeNumber;
    cupBaseSPD?: number | LargeNumber;
    baseSipsPerDrink?: number | LargeNumber
  };
  multipliers?: {
    widerStrawsPerLevel?: number | LargeNumber;
    betterCupsPerLevel?: number | LargeNumber
  };
}): { strawSPD: LargeNumber; cupSPD: LargeNumber; sipsPerDrink: LargeNumber } {
  const { upgrades, config } = getConfig();

  // Convert all values to LargeNumber for consistent calculations
  const strawBaseSPD = toLargeNumber(
    base.strawBaseSPD ?? upgrades?.straws?.baseSPD ?? config.STRAW_BASE_SPD ?? 0.6
  );
  const cupBaseSPD = toLargeNumber(
    base.cupBaseSPD ?? upgrades?.cups?.baseSPD ?? config.CUP_BASE_SPD ?? 1.2
  );
  const baseSipsPerDrink = toLargeNumber(
    base.baseSipsPerDrink ?? config.BASE_SIPS_PER_DRINK ?? 1
  );

  const widerStrawsPerLevel = toLargeNumber(
    multipliers.widerStrawsPerLevel ??
    upgrades?.widerStraws?.multiplierPerLevel ??
    config.WIDER_STRAWS_MULTIPLIER ??
    0.5
  );
  const betterCupsPerLevel = toLargeNumber(
    multipliers.betterCupsPerLevel ??
    upgrades?.betterCups?.multiplierPerLevel ??
    config.BETTER_CUPS_MULTIPLIER ??
    0.4
  );

  // Use LargeNumber versions of all inputs
  const strawsLarge = toLargeNumber(straws);
  const cupsLarge = toLargeNumber(cups);
  const widerStrawsLarge = toLargeNumber(widerStraws);
  const betterCupsLarge = toLargeNumber(betterCups);

  // Calculate production values with LargeNumber support
  const strawSPD = computeStrawSPD(strawsLarge, strawBaseSPD, widerStrawsLarge, widerStrawsPerLevel);
  const cupSPD = computeCupSPD(cupsLarge, cupBaseSPD, betterCupsLarge, betterCupsPerLevel);
  const totalSPD = computeTotalSPD(strawsLarge, strawSPD, cupsLarge, cupSPD);
  const sipsPerDrink = computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD);

  return { strawSPD, cupSPD, sipsPerDrink };
}
