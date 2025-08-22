// @ts-check
// Pure cost and stat calculation for purchases

/**
 * Next straw cost using exponential scaling.
 * @param {number|string} strawCount
 * @param {number|string} baseCost
 * @param {number|string} scaling
 * @returns {number}
 */
export function nextStrawCost(strawCount, baseCost, scaling) {
    return Math.floor(Number(baseCost) * Math.pow(Number(scaling), Number(strawCount)));
}

/**
 * Next cup cost using exponential scaling.
 * @param {number|string} cupCount
 * @param {number|string} baseCost
 * @param {number|string} scaling
 * @returns {number}
 */
export function nextCupCost(cupCount, baseCost, scaling) {
    return Math.floor(Number(baseCost) * Math.pow(Number(scaling), Number(cupCount)));
}


