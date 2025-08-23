// UI Display Updates
// Handles all display updates for game stats, costs, and progress indicators

// Import consolidated utilities
import { updateCostDisplay, updateButtonState, formatNumber } from './utils.js';

// Update the top sips per drink display
export function updateTopSipsPerDrink() {
	if (typeof window === 'undefined') return;
	const topSipsPerDrinkElement = window.DOM_CACHE?.topSipsPerDrink;
	try {
		const state = window.App?.state?.getState?.();
		if (topSipsPerDrinkElement && state) {
			const sps = Number(state.sps || 0);
			topSipsPerDrinkElement.innerHTML = formatNumber(sps);
		}
	} catch {}
}

// Update the top total sips per second display (passive production only)
export function updateTopSipsPerSecond() {
	if (typeof window === 'undefined') return;
	const topSipsPerSecondElement = window.DOM_CACHE?.topSipsPerSecond;
	try {
		const state = window.App?.state?.getState?.();
		if (topSipsPerSecondElement && state) {
			const sipsPerDrink = Number(state.sps || 0);
			const drinkRateMs = Number(state.drinkRate || 0) || 1000;
			const drinkRateSeconds = drinkRateMs / 1000;
			const sipsPerSecond = sipsPerDrink / drinkRateSeconds;
			topSipsPerSecondElement.innerHTML = formatNumber(sipsPerSecond);
		}
	} catch {}
}

// Update the critical click chance display
export function updateCriticalClickDisplay() {
	if (typeof window === 'undefined') return;
	const criticalClickChanceCompact = document.getElementById('criticalClickChanceCompact');
	if (criticalClickChanceCompact) {
		try {
			const chance = Number(window.App?.state?.getState?.()?.criticalClickChance ?? NaN);
			if (!Number.isNaN(chance)) {
				criticalClickChanceCompact.textContent = `${(chance * 100).toFixed(1)}%`;
			}
		} catch {}
	}
}

// Update drink speed display
export function updateDrinkSpeedDisplay() {
	if (typeof window === 'undefined') return;
	const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
	try {
		const state = window.App?.state?.getState?.();
		if (currentDrinkSpeedCompact && state) {
			const drinkRateSeconds = Number(state.drinkRate || 0) / 1000;
			currentDrinkSpeedCompact.textContent = drinkRateSeconds.toFixed(2) + 's';
		}
	} catch {}
}

// Update autosave status display
export function updateAutosaveStatus() {
	if (typeof window === 'undefined') return;
	const status = document.getElementById('autosaveStatus');
	try {
		const opts = window.App?.state?.getState?.()?.options;
		if (status && opts) {
			if (opts.autosaveEnabled) {
				status.textContent = `Autosave: ON (${opts.autosaveInterval}s)`;
				status.className = 'autosave-on';
			} else {
				status.textContent = 'Autosave: OFF';
				status.className = 'autosave-off';
			}
		}
	} catch {}
}

// Update drink progress bar
export function updateDrinkProgress(progress, drinkRate) {
	if (typeof window === 'undefined') return;
	let currentProgress = typeof progress === 'number' ? progress : undefined;
	let currentDrinkRate = typeof drinkRate === 'number' ? drinkRate : undefined;
	try {
		const state = window.App?.state?.getState?.();
		if (state) {
			if (currentProgress == null) currentProgress = Number(state.drinkProgress || 0);
			if (currentDrinkRate == null) currentDrinkRate = Number(state.drinkRate || 0);
		}
	} catch {}

	// Get elements from DOM cache or fallback to direct DOM access
	const progressFill = window.DOM_CACHE?.progressFill || document.getElementById('drinkProgressFill');
	const countdown = window.DOM_CACHE?.countdown || document.getElementById('drinkCountdown');

	console.log('🎨 DOM elements found:', {
		progressFill: !!progressFill,
		countdown: !!countdown,
		progressFillElement: progressFill,
		countdownElement: countdown
	});

	// Update progress bar fill
	if (progressFill && typeof currentProgress === 'number') {
		const clampedProgress = Math.min(Math.max(currentProgress, 0), 100);
		progressFill.style.width = `${clampedProgress}%`;

		// Add visual feedback when progress is complete
		if (clampedProgress >= 100) {
			progressFill.classList.add('progress-complete');
		} else {
			progressFill.classList.remove('progress-complete');
		}
	}

	// Update countdown timer
	if (countdown && currentDrinkRate && typeof currentProgress === 'number') {
		const remainingTime = Math.max(0, currentDrinkRate - (currentProgress / 100 * currentDrinkRate));
		const remainingSeconds = (remainingTime / 1000).toFixed(1);
		countdown.textContent = `${remainingSeconds}s`;

		// Add visual feedback for countdown
		if (remainingTime <= 1000) { // Less than 1 second
			countdown.classList.add('countdown-warning');
		} else {
			countdown.classList.remove('countdown-warning');
		}
	}
}

// Update the top current sips counter
export function updateTopSipCounter() {
	if (typeof window === 'undefined') return;
	const topSipElement = window.DOM_CACHE?.topSipValue || document.getElementById('topSipValue');
	if (topSipElement) {
		try {
			const sipsNum = Number(window.App?.state?.getState?.()?.sips || 0);
			topSipElement.textContent = formatNumber(sipsNum);
		} catch {}
	}
}

// Update the displayed level number
export function updateLevelNumber() {
	if (typeof window === 'undefined') return;
	const levelEl = window.DOM_CACHE?.levelNumber;
	if (levelEl) {
		try {
			const level = Number(window.App?.state?.getState?.()?.level || 1);
			levelEl.innerHTML = String(level);
		} catch {}
	}
}

// Update the level text banner/label
export function updateLevelText() {
	if (typeof window === 'undefined') return;
	const levelTextEl = window.DOM_CACHE?.levelText;
	if (levelTextEl) {
		try {
			const level = Number(window.App?.state?.getState?.()?.level || 1);
			const levelText = getLevelText(level);
			levelTextEl.innerHTML = levelText;
		} catch {}
	}
}

// Update drink rate display
export function updateDrinkRate() {
	if (typeof window === 'undefined') return;
	const drinkRateElement = document.getElementById('drinkRate');
	try {
		const state = window.App?.state?.getState?.();
		if (drinkRateElement && state) {
			const drinkRateSeconds = Number(state.drinkRate || 0) / 1000;
			drinkRateElement.textContent = drinkRateSeconds.toFixed(2) + 's';
		}
	} catch {}
}

// Update compact drink speed displays
export function updateCompactDrinkSpeedDisplays() {
	if (typeof window === 'undefined') return;
	
	// Update compact drink speed display elements
	const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
	try {
		const state = window.App?.state?.getState?.();
		if (currentDrinkSpeedCompact && state) {
			const drinkRateSeconds = Number(state.drinkRate || 0) / 1000;
			currentDrinkSpeedCompact.textContent = drinkRateSeconds.toFixed(2) + 's';
		}
	} catch {}
	
	// Update other compact displays if they exist
	const compactDisplays = document.querySelectorAll('[id*="Compact"]');
	compactDisplays.forEach(display => {
		try {
			const state = window.App?.state?.getState?.();
			if (display.id.includes('DrinkSpeed') && state) {
				const drinkRateSeconds = Number(state.drinkRate || 0) / 1000;
				display.textContent = drinkRateSeconds.toFixed(2) + 's';
			}
		} catch {}
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
