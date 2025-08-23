// Centralized default state shape for the game. This is an internal mirror
// that we will gradually make authoritative as we migrate away from globals.

const defaultState = {
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
	sps: 0, // sips per drink (effective)
	strawSPD: 0,
	cupSPD: 0,

	// Drink system
	drinkRate: 0,
	drinkProgress: 0,
	lastDrinkTime: 0,

	// Session and persistence
	lastSaveTime: 0,
	sessionStartTime: 0,
	totalSipsEarned: 0,
	totalClicks: 0,
	highestSipsPerSecond: 0,

	// Click/crit systems (migrate from globals)
	criticalClickChance: 0,
	criticalClickMultiplier: 0,
	suctionClickBonus: 0,

	// Upgrade counters
	fasterDrinksUpCounter: 0,
	criticalClickUpCounter: 0,

	// Options
	options: {
		autosaveEnabled: true,
		autosaveInterval: 30, // seconds
		clickSoundsEnabled: true,
		musicEnabled: true,
		musicStreamPreferences: {
			preferred: 'local',
			fallbacks: []
		}
	},
};

// Make available globally
window.defaultState = defaultState;


