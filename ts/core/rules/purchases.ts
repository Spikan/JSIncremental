// Pure cost and stat calculation for purchases (TypeScript)

export function nextStrawCost(
  strawCount: number | string,
  baseCost: number | string,
  scaling: number | string
): number {
  return Math.floor(Number(baseCost) * Math.pow(Number(scaling), Number(strawCount)));
}

export function nextCupCost(
  cupCount: number | string,
  baseCost: number | string,
  scaling: number | string
): number {
  return Math.floor(Number(baseCost) * Math.pow(Number(scaling), Number(cupCount)));
}


