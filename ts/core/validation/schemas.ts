// TypeScript port of validation schemas with a safe Zod fallback

import { toDecimal } from '../numbers/simplified';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const z: any =
  (typeof window !== 'undefined' && (window as any).Zod) ||
  (typeof globalThis !== 'undefined' && (globalThis as any).Zod) ||
  (() => {
    const chain: any = {
      parse: (data: any) => data,
      omit: () => chain,
      optional: () => chain,
      min: () => chain,
      max: () => chain,
      record: () => chain,
    };
    return {
      object: () => chain,
      number: () => chain,
      boolean: () => chain,
      string: () => chain,
      any: () => chain,
      record: () => chain,
    };
  })();

export type Unlock = { sips: number; clicks: number };
export const UnlockSchema = z.object({ sips: z.number().min(0), clicks: z.number().min(0) });

export type Unlocks = Record<
  | 'suction'
  | 'criticalClick'
  | 'fasterDrinks'
  | 'straws'
  | 'cups'
  | 'widerStraws'
  | 'betterCups'
  | 'levelUp'
  | 'shop'
  | 'stats'
  | 'god'
  | 'unlocks',
  Unlock
>;
export const UnlocksSchema = z.object({
  suction: UnlockSchema,
  criticalClick: UnlockSchema,
  fasterDrinks: UnlockSchema,
  straws: UnlockSchema,
  cups: UnlockSchema,
  widerStraws: UnlockSchema,
  betterCups: UnlockSchema,
  levelUp: UnlockSchema,
  shop: UnlockSchema,
  stats: UnlockSchema,
  god: UnlockSchema,
  unlocks: UnlockSchema,
});

export type Upgrade = {
  baseCost: number;
  scaling: number;
  baseSPD?: number;
  multiplierPerLevel?: number;
  upgradeBaseCost?: number;
};
export const UpgradeSchema = z.object({
  baseCost: z.number().min(0),
  scaling: z.number().min(1),
  baseSPD: z.number().min(0).optional(),
  multiplierPerLevel: z.number().min(0).optional(),
  upgradeBaseCost: z.number().min(0).optional(),
});

export type Upgrades = {
  straws: Upgrade;
  widerStraws: Upgrade;
  cups: Upgrade;
  betterCups: Upgrade;
  suction: Omit<Upgrade, 'baseSPD' | 'multiplierPerLevel'>;
  fasterDrinks: Omit<Upgrade, 'baseSPD' | 'multiplierPerLevel'>;
  criticalClick: Omit<Upgrade, 'baseSPD' | 'multiplierPerLevel'>;
};
export const UpgradesSchema = z.object({
  straws: UpgradeSchema,
  widerStraws: UpgradeSchema,
  cups: UpgradeSchema,
  betterCups: UpgradeSchema,
  suction: UpgradeSchema.omit({ baseSPD: true, multiplierPerLevel: true }),
  fasterDrinks: UpgradeSchema.omit({ baseSPD: true, multiplierPerLevel: true }),
  criticalClick: UpgradeSchema.omit({ baseSPD: true, multiplierPerLevel: true }),
});

export type GameSave = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sips: any;
  straws: number | string | any; // any to allow Decimal objects
  cups: number | string | any; // any to allow Decimal objects
  widerStraws: any;
  betterCups: any;
  suctions: any;
  criticalClicks: any;
  fasterDrinks: any;
  totalSipsEarned?: any;
  // SPD values for extreme value preservation
  spd?: any;
  strawSPD?: any;
  cupSPD?: any;
  drinkRate?: number;
  lastDrinkTime?: number;
  drinkProgress?: number;
  lastSaveTime?: number;
  totalPlayTime?: number;
  totalClicks?: number;
  totalSips?: any;
  level?: number | string | any; // any to allow Decimal objects
};
export const GameSaveSchema = z.object({
  sips: z.any(),
  straws: z
    .union([z.number().min(0), z.string()])
    .transform((val: number | string) => (typeof val === 'string' ? toDecimal(val) : val)),
  cups: z
    .union([z.number().min(0), z.string()])
    .transform((val: number | string) => (typeof val === 'string' ? toDecimal(val) : val)),
  widerStraws: z.any(),
  betterCups: z.any(),
  suctions: z.any(),
  criticalClicks: z.any(),
  fasterDrinks: z.any(),
  totalSipsEarned: z.any().optional(),
  // SPD values for extreme value preservation
  spd: z.any().optional(),
  strawSPD: z.any().optional(),
  cupSPD: z.any().optional(),
  drinkRate: z.number().min(0).optional(),
  lastDrinkTime: z.number().min(0).optional(),
  drinkProgress: z.number().min(0).optional(),
  lastSaveTime: z.number().optional(),
  totalPlayTime: z.number().optional(),
  totalClicks: z.number().min(0).optional(),
  totalSips: z.any().optional(),
  level: z
    .union([z.number().min(1), z.string()])
    .transform((val: number | string) => (typeof val === 'string' ? toDecimal(val) : val))
    .optional(),
});

export type GameOptions = {
  autosaveEnabled: boolean;
  autosaveInterval: number;
  clickSoundsEnabled: boolean;
  musicEnabled: boolean;
  musicStreamPreferences?: Record<string, boolean>;
  devToolsEnabled: boolean;
  secretsUnlocked: boolean;
  godTabEnabled: boolean;
};
export const GameOptionsSchema = z.object({
  autosaveEnabled: z.boolean(),
  autosaveInterval: z.number().min(1000).max(60000),
  clickSoundsEnabled: z.boolean(),
  musicEnabled: z.boolean(),
  musicStreamPreferences: z.record(z.string(), z.boolean()).optional(),
  devToolsEnabled: z.boolean(),
  secretsUnlocked: z.boolean(),
  godTabEnabled: z.boolean(),
});

export function validateUnlocks(data: any) {
  try {
    return UnlocksSchema.parse(data);
  } catch (error) {
    console.error('Invalid unlocks data:', error);
    return null;
  }
}
export function validateUpgrades(data: any) {
  try {
    return UpgradesSchema.parse(data);
  } catch (error) {
    console.error('Invalid upgrades data:', error);
    return null;
  }
}
export function validateGameSave(data: any) {
  try {
    return GameSaveSchema.parse(data);
  } catch (error) {
    console.error('Invalid game save data:', error);
    return null;
  }
}
export function validateGameOptions(data: any) {
  try {
    return GameOptionsSchema.parse(data);
  } catch (error) {
    console.error('Invalid game options data:', error);
    return null;
  }
}
