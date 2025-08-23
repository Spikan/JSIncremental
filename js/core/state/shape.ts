// Centralized default state shape for the game (TypeScript)

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
	// Core resources
	sips: number;
	straws: number;
	cups: number;
	suctions: number;
	widerStraws: number;
	betterCups: number;
	fasterDrinks: number;
	criticalClicks: number;
	level: number;

	// Production stats
	sps: number; // sips per drink (effective)
	strawSPD: number;
	cupSPD: number;

	// Drink system
	drinkRate: number;
	drinkProgress: number;
	lastDrinkTime: number;

	// Session and persistence
	lastSaveTime: number;
	sessionStartTime: number;
	totalPlayTime: number;
	totalSipsEarned: number;
	totalClicks: number;
	highestSipsPerSecond: number;
	currentClickStreak: number;
	bestClickStreak: number;

	// Click/crit systems (migrate from globals)
	criticalClickChance: number;
	criticalClickMultiplier: number;
	suctionClickBonus: number;

	// Upgrade counters
	fasterDrinksUpCounter: number;
	criticalClickUpCounter: number;

	// Options
	options: GameOptions;
};

export const defaultState: GameState = {
	// Core resources
	sips: 0,
	straws: 0,
	cups: 0,
	suctions: 0,
	widerStraws: 0,
	betterCups: 0,
	fasterDrinks: 0,
	criticalClicks: 0,
	level: 1,

	// Production stats
	sps: 0,
	strawSPD: 0,
	cupSPD: 0,

	// Drink system
	drinkRate: 0,
	drinkProgress: 0,
	lastDrinkTime: 0,

	// Session and persistence
	lastSaveTime: 0,
	sessionStartTime: 0,
	totalPlayTime: 0,
	totalSipsEarned: 0,
	totalClicks: 0,
	highestSipsPerSecond: 0,
	currentClickStreak: 0,
	bestClickStreak: 0,

	// Click/crit systems
	criticalClickChance: 0,
	criticalClickMultiplier: 0,
	suctionClickBonus: 0,

	// Upgrade counters
	fasterDrinksUpCounter: 0,
	criticalClickUpCounter: 0,

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


