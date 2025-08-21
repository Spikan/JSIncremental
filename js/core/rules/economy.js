// Economy formulas for SPD and totals (pure)

export function computeStrawSPD(straws, baseSPD, widerStrawsCount, widerMultiplierPerLevel = 0) {
    const multiplier = 1 + (Number(widerStrawsCount) * Number(widerMultiplierPerLevel));
    return Number(baseSPD) * multiplier;
}

export function computeCupSPD(cups, baseSPD, betterCupsCount, betterMultiplierPerLevel = 0) {
    const multiplier = 1 + (Number(betterCupsCount) * Number(betterMultiplierPerLevel));
    return Number(baseSPD) * multiplier;
}

export function computeTotalSPD(straws, strawSPD, cups, cupSPD) {
    return (Number(strawSPD) * Number(straws)) + (Number(cupSPD) * Number(cups));
}

export function computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD) {
    return Number(baseSipsPerDrink) + Number(totalSPD);
}


