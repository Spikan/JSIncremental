import {
  computeCupSPD,
  computeStrawSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
} from '../rules/economy.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';
// Direct Decimal access - no wrapper needed
import { toDecimal, DecimalType } from '../numbers/simplified';

function getConfig(): { upgrades: any; config: any } {
  const result = getUpgradesAndConfig();
  console.log('🍹 getConfig result:', result);
  return result;
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
  console.log('🍹 recalcProduction config values:', {
    baseStrawBaseSPD: base?.strawBaseSPD,
    upgradesStrawsBaseSPD: upgrades?.straws?.baseSPD,
    configStrawBaseSPD: config.STRAW_BASE_SPD,
    finalStrawBaseSPD: config.STRAW_BASE_SPD ?? 2.0,
  });

  const strawBaseSPD = toDecimal(
    base?.strawBaseSPD ?? upgrades?.straws?.baseSPD ?? config.STRAW_BASE_SPD ?? 2.0
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
  console.log('🔍 recalcProduction inputs:', { straws, cups, widerStraws, betterCups });
  const strawsLarge = toDecimal(straws);
  const cupsLarge = toDecimal(cups);
  const widerStrawsLarge = toDecimal(widerStraws);
  const betterCupsLarge = toDecimal(betterCups);
  console.log('🔍 Decimal conversions:', {
    strawsLarge: strawsLarge.toString(),
    cupsLarge: cupsLarge.toString(),
    widerStrawsLarge: widerStrawsLarge.toString(),
    betterCupsLarge: betterCupsLarge.toString(),
  });

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
