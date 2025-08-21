import { computeStrawSPD, computeCupSPD, computeTotalSPD, computeTotalSipsPerDrink } from '../rules/economy.js';

// Centralized production recalculation
// All inputs are numbers; outputs are numbers for easy wrapping in Decimal by callers
// base and multipliers are optional; when omitted, values are sourced from App.data.upgrades or GAME_CONFIG
export function recalcProduction({
    straws,
    cups,
    widerStraws,
    betterCups,
    base = {},
    multipliers = {},
}) {
    const up = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};

    const strawBaseSPD = base.strawBaseSPD ?? up?.straws?.baseSPD ?? config.STRAW_BASE_SPD ?? 0;
    const cupBaseSPD = base.cupBaseSPD ?? up?.cups?.baseSPD ?? config.CUP_BASE_SPD ?? 0;
    const baseSipsPerDrink = base.baseSipsPerDrink ?? config.BASE_SIPS_PER_DRINK ?? 0;

    const widerStrawsPerLevel = multipliers.widerStrawsPerLevel ?? up?.widerStraws?.multiplierPerLevel ?? config.WIDER_STRAWS_MULTIPLIER ?? 0;
    const betterCupsPerLevel = multipliers.betterCupsPerLevel ?? up?.betterCups?.multiplierPerLevel ?? config.BETTER_CUPS_MULTIPLIER ?? 0;

    const strawSPD = computeStrawSPD(straws, strawBaseSPD, widerStraws, widerStrawsPerLevel);
    const cupSPD = computeCupSPD(cups, cupBaseSPD, betterCups, betterCupsPerLevel);
    const totalSPD = computeTotalSPD(straws, strawSPD, cups, cupSPD);
    const sipsPerDrink = computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD);
    return { strawSPD, cupSPD, sipsPerDrink };
}


