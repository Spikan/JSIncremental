// UI Display Updates
// Handles all display updates for game stats, costs, and progress indicators

// Import consolidated utilities
import { updateCostDisplay, updateButtonState, formatNumber } from './utils.js';

// Update the top sips per drink display
export function updateTopSipsPerDrink() {
	if (typeof window === 'undefined') return;
	const topSipsPerDrinkElement = window.DOM_CACHE?.topSipsPerDrink;
	if (topSipsPerDrinkElement && window.sps) {
		topSipsPerDrinkElement.innerHTML = formatNumber(window.sps);
	}
}

// Update the top total sips per second display (passive production only)
export function updateTopSipsPerSecond() {
	if (typeof window === 'undefined') return;
	const topSipsPerSecondElement = window.DOM_CACHE?.topSipsPerSecond;
	if (topSipsPerSecondElement && window.sps && window.drinkRate && typeof window.sps.div === 'function') {
		const drinkRateSeconds = window.drinkRate / 1000;
		const sipsPerSecond = window.sps.div(drinkRateSeconds);
		topSipsPerSecondElement.innerHTML = formatNumber(sipsPerSecond);
	}
}

// Update the critical click chance display
export function updateCriticalClickDisplay() {
	if (typeof window === 'undefined') return;
	const criticalClickChanceCompact = document.getElementById('criticalClickChanceCompact');
	if (criticalClickChanceCompact && window.criticalClickChance) {
		const percentage = window.criticalClickChance.times(100).toFixed(1);
		criticalClickChanceCompact.textContent = `${percentage}%`;
	}
}

// Update drink speed display
export function updateDrinkSpeedDisplay() {
	if (typeof window === 'undefined') return;
	// Update compact drink speed display elements
	const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
	if (currentDrinkSpeedCompact && window.drinkRate) {
		const drinkRateSeconds = window.drinkRate / 1000;
		currentDrinkSpeedCompact.textContent = drinkRateSeconds.toFixed(2) + 's';
	}
}

// Update autosave status display
export function updateAutosaveStatus() {
	if (typeof window === 'undefined') return;
	const status = document.getElementById('autosaveStatus');
	if (status && window.autosaveEnabled !== undefined && window.autosaveInterval !== undefined) {
		if (window.autosaveEnabled) {
			status.textContent = `Autosave: ON (${window.autosaveInterval}s)`;
			status.className = 'autosave-on';
		} else {
			status.textContent = 'Autosave: OFF';
			status.className = 'autosave-off';
		}
	}
}

// Update drink progress bar
export function updateDrinkProgress(progress, drinkRate) {
	if (typeof window === 'undefined') return;
	const progressFill = window.DOM_CACHE?.progressFill;
	const countdown = window.DOM_CACHE?.countdown;
	
	if (progressFill && typeof progress === 'number') {
		progressFill.style.width = `${Math.min(progress, 100)}%`;
	}
	
	if (countdown && drinkRate) {
		const remainingTime = Math.max(0, drinkRate - (progress / 100 * drinkRate));
		const remainingSeconds = (remainingTime / 1000).toFixed(1);
		countdown.textContent = `${remainingSeconds}s`;
	}
}

// Update the top current sips counter
export function updateTopSipCounter() {
	if (typeof window === 'undefined') return;
	const topSipElement = window.DOM_CACHE?.topSipValue || document.getElementById('topSipValue');
	if (topSipElement) {
		const value = (window.sips != null) ? window.sips : 0;
		topSipElement.textContent = formatNumber(value);
	}
}

// Update the displayed level number
export function updateLevelNumber() {
	if (typeof window === 'undefined') return;
	const levelEl = window.DOM_CACHE?.levelNumber;
	if (levelEl && window.level != null) {
		const val = typeof window.level?.toNumber === 'function' ? window.level.toNumber() : window.level;
		levelEl.innerHTML = String(val);
	}
}

// Update the level text banner/label
export function updateLevelText() {
	if (typeof window === 'undefined') return;
	const levelTextEl = window.DOM_CACHE?.levelText;
	if (levelTextEl && window.level != null) {
		const level = typeof window.level?.toNumber === 'function' ? window.level.toNumber() : window.level;
		const levelText = getLevelText(level);
		levelTextEl.innerHTML = levelText;
	}
}

// Update drink rate display
export function updateDrinkRate() {
	if (typeof window === 'undefined') return;
	const drinkRateElement = document.getElementById('drinkRate');
	if (drinkRateElement && window.drinkRate) {
		const drinkRateSeconds = window.drinkRate / 1000;
		drinkRateElement.textContent = drinkRateSeconds.toFixed(2) + 's';
	}
}

// Update compact drink speed displays
export function updateCompactDrinkSpeedDisplays() {
	if (typeof window === 'undefined') return;
	
	// Update compact drink speed display elements
	const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
	if (currentDrinkSpeedCompact && window.drinkRate) {
		const drinkRateSeconds = window.drinkRate / 1000;
		currentDrinkSpeedCompact.textContent = drinkRateSeconds.toFixed(2) + 's';
	}
	
	// Update other compact displays if they exist
	const compactDisplays = document.querySelectorAll('[id*="Compact"]');
	compactDisplays.forEach(display => {
		if (display.id.includes('DrinkSpeed') && window.drinkRate) {
			const drinkRateSeconds = window.drinkRate / 1000;
			display.textContent = drinkRateSeconds.toFixed(2) + 's';
		}
	});
}

// Helper function to get level text based on level number
function getLevelText(level) {
	const levelTexts = [
		'On a Blue Background',
		'With a Straw',
		'In a Cup',
		'With Suction',
		'Faster Drinking',
		'Critical Hits',
		'Advanced Upgrades',
		'Master Soda Drinker',
		'Soda Legend',
		'Ultimate Soda Master'
	];
	
	const index = Math.min(Math.floor(level - 1), levelTexts.length - 1);
	return levelTexts[index] || levelTexts[levelTexts.length - 1];
}
