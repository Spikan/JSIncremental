import { computeStrawSPD, computeCupSPD, computeTotalSPD, computeTotalSipsPerDrink } from '../rules/economy.js';

// Centralized production recalculation
// All inputs are numbers; outputs are numbers for easy wrapping in Decimal by callers
export function recalcProduction({
    straws,
    cups,
    widerStraws,
    betterCups,
    base,
    multipliers,
}) {
    const strawSPD = computeStrawSPD(straws, base.strawBaseSPD, widerStraws, multipliers.widerStrawsPerLevel);
    const cupSPD = computeCupSPD(cups, base.cupBaseSPD, betterCups, multipliers.betterCupsPerLevel);
    const totalSPD = computeTotalSPD(straws, strawSPD, cups, cupSPD);
    const sipsPerDrink = computeTotalSipsPerDrink(base.baseSipsPerDrink, totalSPD);
    return { strawSPD, cupSPD, sipsPerDrink };
}


