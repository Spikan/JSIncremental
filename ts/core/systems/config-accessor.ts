// Central accessor for upgrades data and balance config (TypeScript)

export type UpgradesConfigTuple = { upgrades: any; config: any };

export function getUpgradesAndConfig(): UpgradesConfigTuple {
  // Lazily resolve to avoid TDZ across chunks during module evaluation
  let upgrades: any = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../../services/data-service');
    upgrades = mod?.gameData?.upgrades ?? mod?.getUpgradesData?.() ?? {};
  } catch {
    upgrades = {};
  }
  // Try multiple ways to access the config
  const gameConfig = (window as any).GAME_CONFIG;
  const config = gameConfig?.BALANCE || gameConfig || {};
  return { upgrades, config };
}
