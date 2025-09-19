// Data service: loads and provides access to game data (TypeScript)

import upgradesData from '../../data/upgrades.json';
import unlocksData from '../../data/unlocks.json';

export interface UpgradesData {
  [key: string]: {
    baseCost: number;
    scaling: number;
    baseSPD?: number;
    multiplierPerLevel?: number;
  };
}

export interface UnlocksData {
  [key: string]: {
    cost: number;
    description: string;
    unlockedBy?: string;
  };
}

export const gameData = {
  upgrades: upgradesData as UpgradesData,
  unlocks: unlocksData as any, // unlocks.json has different structure than expected
};

export function getUpgradesData(): UpgradesData {
  return gameData.upgrades;
}

export function getUnlocksData(): UnlocksData {
  return gameData.unlocks;
}
