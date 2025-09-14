// Centralized default state shape for the game (TypeScript)
// Enhanced for Decimal support

// Direct Decimal access - no wrapper needed
import { NumericValue } from '../numbers/migration-utils';

export type GameOptions = {
  autosaveEnabled: boolean;
  autosaveInterval: number; // seconds
  clickSoundsEnabled: boolean;
  musicEnabled: boolean;
  musicStreamPreferences?: {
    preferred: string;
    fallbacks: string[];
  };
  devToolsEnabled: boolean;
  secretsUnlocked: boolean;
  godTabEnabled: boolean;
};

export type GameState = {
  // Core resources (now support Decimal for unlimited scaling)
  sips: NumericValue;
  straws: NumericValue;
  cups: NumericValue;
  suctions: NumericValue;
  widerStraws: NumericValue;
  betterCups: NumericValue;
  fasterDrinks: NumericValue;
  level: NumericValue;

  // Production stats (support Decimal for high production rates)
  spd: NumericValue; // sips per drink (effective) - renamed from sps for clarity
  strawSPD: NumericValue;
  cupSPD: NumericValue;

  // Drink system (time-based values remain as numbers)
  drinkRate: number;
  drinkProgress: number;
  lastDrinkTime: number;

  // Session and persistence (time-based values remain as numbers)
  lastSaveTime: number;
  lastClickTime: number;
  sessionStartTime: number;
  totalPlayTime: number;
  totalSipsEarned: NumericValue;
  totalClicks: NumericValue;
  highestSipsPerSecond: NumericValue;
  currentClickStreak: number;
  bestClickStreak: number;

  // Click systems (migrate from globals)
  suctionClickBonus: NumericValue;

  // Options
  options: GameOptions;
};

export const defaultState: GameState = {
  // Core resources (using Decimal for unlimited scaling)
  sips: new Decimal(0),
  straws: new Decimal(0),
  cups: new Decimal(0),
  suctions: new Decimal(0),
  widerStraws: new Decimal(0),
  betterCups: new Decimal(0),
  fasterDrinks: new Decimal(0),
  level: new Decimal(1),

  // Production stats (using Decimal for high production rates)
  spd: new Decimal(0), // sips per drink (renamed from sps for clarity)
  strawSPD: new Decimal(0),
  cupSPD: new Decimal(0),

  // Drink system (time-based values remain as numbers)
  drinkRate: 0,
  drinkProgress: 0,
  lastDrinkTime: 0,

  // Session and persistence (time-based values remain as numbers)
  lastSaveTime: 0,
  lastClickTime: 0,
  sessionStartTime: 0,
  totalPlayTime: 0,
  totalSipsEarned: new Decimal(0),
  totalClicks: new Decimal(0),
  highestSipsPerSecond: new Decimal(0),
  currentClickStreak: 0,
  bestClickStreak: 0,

  // Click systems
  suctionClickBonus: new Decimal(0),

  // Options
  options: {
    autosaveEnabled: true,
    autosaveInterval: 30,
    clickSoundsEnabled: true,
    musicEnabled: true,
    musicStreamPreferences: {
      preferred: 'local',
      fallbacks: [],
    },
    devToolsEnabled: false, // Hidden by default
    secretsUnlocked: false, // Konami code required
    godTabEnabled: false, // Hidden by default, unlocked via secrets
  },
};
