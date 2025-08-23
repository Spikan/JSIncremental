// @ts-check
// Import Zod from CDN or global (UMD exposes as window.Zod). Provide a safe fallback for non-browser/tests.
const z = (typeof window !== 'undefined' && /** @type any */(window).Zod) || (typeof globalThis !== 'undefined' && /** @type any */(globalThis).Zod) || (() => {
    // Minimal chainable stub so consumers don't crash when Zod isn't present (tests can mock window.Zod)
    /** @type {any} */
    const chain = {
        /** @param {any} data */
        parse: (data) => data,
        omit: () => chain,
        optional: () => chain,
        min: () => chain,
        max: () => chain,
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

// Schema for unlock conditions
/** @typedef {{ sips: number; clicks: number }} Unlock */
export const UnlockSchema = z.object({
  sips: z.number().min(0),
  clicks: z.number().min(0)
});

/** @typedef {{ [k in 'suction'|'criticalClick'|'fasterDrinks'|'straws'|'cups'|'widerStraws'|'betterCups'|'levelUp'|'shop'|'stats'|'god'|'unlocks']: Unlock }} Unlocks */
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
  unlocks: UnlockSchema
});

// Schema for upgrade definitions
/** @typedef {{ baseCost: number; scaling: number; baseSPD?: number; multiplierPerLevel?: number; upgradeBaseCost?: number }} Upgrade */
export const UpgradeSchema = z.object({
  baseCost: z.number().min(0),
  scaling: z.number().min(1),
  baseSPD: z.number().min(0).optional(),
  multiplierPerLevel: z.number().min(0).optional(),
  upgradeBaseCost: z.number().min(0).optional()
});

/** @typedef {{ straws: Upgrade; widerStraws: Upgrade; cups: Upgrade; betterCups: Upgrade; suction: Omit<Upgrade, 'baseSPD'|'multiplierPerLevel'>; fasterDrinks: Omit<Upgrade, 'baseSPD'|'multiplierPerLevel'>; criticalClick: Omit<Upgrade, 'baseSPD'|'multiplierPerLevel'> }} Upgrades */
export const UpgradesSchema = z.object({
  straws: UpgradeSchema,
  widerStraws: UpgradeSchema,
  cups: UpgradeSchema,
  betterCups: UpgradeSchema,
  suction: UpgradeSchema.omit({ baseSPD: true, multiplierPerLevel: true }),
  fasterDrinks: UpgradeSchema.omit({ baseSPD: true, multiplierPerLevel: true }),
  criticalClick: UpgradeSchema.omit({ baseSPD: true, multiplierPerLevel: true })
});

// Schema for game save data (partial - we'll expand this)
/** @typedef {{ sips: any; straws: number; cups: number; widerStraws: any; betterCups: any; suctions: any; criticalClicks: any; fasterDrinks: any; totalSipsEarned?: any; drinkRate?: number; lastDrinkTime?: number; drinkProgress?: number; lastSaveTime?: number; totalPlayTime?: number; totalClicks?: number; totalSips?: any; level?: number }} GameSave */
export const GameSaveSchema = z.object({
  sips: z.any(), // Decimal.js object
  straws: z.number().min(0),
  cups: z.number().min(0),
  widerStraws: z.any(), // Decimal.js object
  betterCups: z.any(), // Decimal.js object
  suctions: z.any(), // Decimal.js object
  criticalClicks: z.any(), // Decimal.js object
  fasterDrinks: z.any(), // Decimal.js object
  totalSipsEarned: z.any().optional(), // Decimal.js object
  drinkRate: z.number().min(0).optional(),
  lastDrinkTime: z.number().min(0).optional(),
  drinkProgress: z.number().min(0).optional(),
  lastSaveTime: z.number().optional(),
  totalPlayTime: z.number().optional(),
  totalClicks: z.number().min(0).optional(),
  totalSips: z.any().optional(), // Decimal.js object
  level: z.number().min(1).optional()
});

// Schema for game options
/** @typedef {{ autosaveEnabled: boolean; autosaveInterval: number; clickSoundsEnabled: boolean; musicEnabled: boolean; musicStreamPreferences?: Record<string, boolean> }} GameOptions */
export const GameOptionsSchema = z.object({
  autosaveEnabled: z.boolean(),
  autosaveInterval: z.number().min(1000).max(60000),
  clickSoundsEnabled: z.boolean(),
  musicEnabled: z.boolean(),
  musicStreamPreferences: z.record(z.string(), z.boolean()).optional()
});

// Validation helper functions
/** @param {any} data */
export function validateUnlocks(data) {
  try {
    return UnlocksSchema.parse(data);
  } catch (error) {
    console.error('Invalid unlocks data:', error);
    return null;
  }
}

/** @param {any} data */
export function validateUpgrades(data) {
  try {
    return UpgradesSchema.parse(data);
  } catch (error) {
    console.error('Invalid upgrades data:', error);
    return null;
  }
}

/** @param {any} data */
export function validateGameSave(data) {
  try {
    return GameSaveSchema.parse(data);
  } catch (error) {
    console.error('Invalid game save data:', error);
    return null;
  }
}

/** @param {any} data */
export function validateGameOptions(data) {
  try {
    return GameOptionsSchema.parse(data);
  } catch (error) {
    console.error('Invalid game options data:', error);
    return null;
  }
}
