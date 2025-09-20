// Central accessor for upgrades data and balance config (TypeScript)

import { getUpgradesData } from '../../services/data-service';

export type UpgradesConfigTuple = { upgrades: any; config: any };

export function getUpgradesAndConfig(): UpgradesConfigTuple {
  const upgrades = getUpgradesData();
  // Try multiple ways to access the config
  const gameConfig = (window as any).GAME_CONFIG;
  const config = gameConfig?.BALANCE || gameConfig || {};
  return { upgrades, config };
}
