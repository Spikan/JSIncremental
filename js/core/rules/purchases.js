// Pure cost and stat calculation for purchases

export function nextStrawCost(strawCount, baseCost, scaling) {
    return Math.floor(baseCost * Math.pow(scaling, Number(strawCount)));
}

export function nextCupCost(cupCount, baseCost, scaling) {
    return Math.floor(baseCost * Math.pow(scaling, Number(cupCount)));
}


