// Central accessor for upgrades data and balance config (TypeScript)

export type UpgradesConfigTuple = { upgrades: any; config: any };

export function getUpgradesAndConfig(): UpgradesConfigTuple {
  const w = (typeof window !== 'undefined' ? (window as any) : {}) as any;
  const upgrades = w.App?.data?.upgrades || {};
  const config = w.GAME_CONFIG?.BALANCE || {};
  return { upgrades, config };
}
