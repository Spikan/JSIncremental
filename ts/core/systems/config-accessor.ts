// Central accessor for upgrades data and balance config (TypeScript)

import { getUpgradesData } from '../../services/data-service';

export type UpgradesConfigTuple = { upgrades: any; config: any };

export function getUpgradesAndConfig(): UpgradesConfigTuple {
  const upgrades = getUpgradesData();
  const config = (window as any).GAME_CONFIG?.BALANCE || {};
  return { upgrades, config };
}
