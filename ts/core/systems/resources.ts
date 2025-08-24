import {
  computeCupSPD,
  computeStrawSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
} from '../rules/economy.ts';
import { getUpgradesAndConfig } from './config-accessor.ts';

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
  straws: number;
  cups: number;
  widerStraws: number;
  betterCups: number;
  base?: { strawBaseSPD?: number; cupBaseSPD?: number; baseSipsPerDrink?: number };
  multipliers?: { widerStrawsPerLevel?: number; betterCupsPerLevel?: number };
}): { strawSPD: number; cupSPD: number; sipsPerDrink: number } {
  const { upgrades, config } = getConfig();

  const strawBaseSPD =
    base.strawBaseSPD ?? upgrades?.straws?.baseSPD ?? config.STRAW_BASE_SPD ?? 0.6;
  const cupBaseSPD = base.cupBaseSPD ?? upgrades?.cups?.baseSPD ?? config.CUP_BASE_SPD ?? 1.2;
  const baseSipsPerDrink = base.baseSipsPerDrink ?? config.BASE_SIPS_PER_DRINK ?? 1;

  const widerStrawsPerLevel =
    multipliers.widerStrawsPerLevel ??
    upgrades?.widerStraws?.multiplierPerLevel ??
    config.WIDER_STRAWS_MULTIPLIER ??
    0.5;
  const betterCupsPerLevel =
    multipliers.betterCupsPerLevel ??
    upgrades?.betterCups?.multiplierPerLevel ??
    config.BETTER_CUPS_MULTIPLIER ??
    0.4;

  const strawSPD = computeStrawSPD(straws, strawBaseSPD, widerStraws, widerStrawsPerLevel);
  const cupSPD = computeCupSPD(cups, cupBaseSPD, betterCups, betterCupsPerLevel);
  const totalSPD = computeTotalSPD(straws, strawSPD, cups, cupSPD);
  const sipsPerDrink = computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD);
  return { strawSPD, cupSPD, sipsPerDrink };
}
