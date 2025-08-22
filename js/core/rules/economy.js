// @ts-check
// Economy formulas for SPD and totals (pure)

/**
 * Compute straw SPD given count and multipliers.
 * @param {number|string} straws
 * @param {number|string} baseSPD
 * @param {number|string} widerStrawsCount
 * @param {number|string} [widerMultiplierPerLevel=0]
 * @returns {number}
 */
export function computeStrawSPD(straws, baseSPD, widerStrawsCount, widerMultiplierPerLevel = 0) {
    const multiplier = 1 + (Number(widerStrawsCount) * Number(widerMultiplierPerLevel));
    return Number(baseSPD) * multiplier;
}

/**
 * Compute cup SPD given count and multipliers.
 * @param {number|string} cups
 * @param {number|string} baseSPD
 * @param {number|string} betterCupsCount
 * @param {number|string} [betterMultiplierPerLevel=0]
 * @returns {number}
 */
export function computeCupSPD(cups, baseSPD, betterCupsCount, betterMultiplierPerLevel = 0) {
    const multiplier = 1 + (Number(betterCupsCount) * Number(betterMultiplierPerLevel));
    return Number(baseSPD) * multiplier;
}

/**
 * Compute total SPD from units and per-unit SPDs.
 * @param {number|string} straws
 * @param {number|string} strawSPD
 * @param {number|string} cups
 * @param {number|string} cupSPD
 * @returns {number}
 */
export function computeTotalSPD(straws, strawSPD, cups, cupSPD) {
    return (Number(strawSPD) * Number(straws)) + (Number(cupSPD) * Number(cups));
}

/**
 * Compute total sips per drink as base plus passive production.
 * @param {number|string} baseSipsPerDrink
 * @param {number|string} totalSPD
 * @returns {number}
 */
export function computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD) {
    return Number(baseSipsPerDrink) + Number(totalSPD);
}


