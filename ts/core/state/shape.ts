// Centralized default state shape for the game (TypeScript)
// Enhanced for LargeNumber support

import { LargeNumber } from '../numbers/large-number';
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
};

export type GameState = {
  // Core resources (now support LargeNumber for unlimited scaling)
  sips: NumericValue;
  straws: NumericValue;
  cups: NumericValue;
  suctions: NumericValue;
  widerStraws: NumericValue;
  betterCups: NumericValue;
  fasterDrinks: NumericValue;
  criticalClicks: NumericValue;
  level: NumericValue;

  // Production stats (support LargeNumber for high production rates)
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

  // Click/crit systems (migrate from globals)
  criticalClickChance: number;
  criticalClickMultiplier: NumericValue;
  suctionClickBonus: NumericValue;

  // Upgrade counters
  fasterDrinksUpCounter: NumericValue;
  criticalClickUpCounter: NumericValue;

  // Options
  options: GameOptions;
};

export const defaultState: GameState = {
  // Core resources (using LargeNumber for unlimited scaling)
  sips: new LargeNumber(0),
  straws: new LargeNumber(0),
  cups: new LargeNumber(0),
  suctions: new LargeNumber(0),
  widerStraws: new LargeNumber(0),
  betterCups: new LargeNumber(0),
  fasterDrinks: new LargeNumber(0),
  criticalClicks: new LargeNumber(0),
  level: new LargeNumber(1),

  // Production stats (using LargeNumber for high production rates)
  spd: new LargeNumber(0), // sips per drink (renamed from sps for clarity)
  strawSPD: new LargeNumber(0),
  cupSPD: new LargeNumber(0),

  // Drink system (time-based values remain as numbers)
  drinkRate: 0,
  drinkProgress: 0,
  lastDrinkTime: 0,

  // Session and persistence (time-based values remain as numbers)
  lastSaveTime: 0,
  lastClickTime: 0,
  sessionStartTime: 0,
  totalPlayTime: 0,
  totalSipsEarned: new LargeNumber(0),
  totalClicks: new LargeNumber(0),
  highestSipsPerSecond: new LargeNumber(0),
  currentClickStreak: 0,
  bestClickStreak: 0,

  // Click/crit systems
  criticalClickChance: 0,
  criticalClickMultiplier: new LargeNumber(0),
  suctionClickBonus: new LargeNumber(0),

  // Upgrade counters
  fasterDrinksUpCounter: new LargeNumber(0),
  criticalClickUpCounter: new LargeNumber(0),

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
  },
};
