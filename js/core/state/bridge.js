// Enhanced State Bridge
// Comprehensive bridge between legacy globals and modern state management

import { selectors } from './selectors.js';

export function createStateBridge(app) {
	// Cache for global variable references to avoid repeated lookups
	const globalCache = new Map();

	function getGlobal(key, defaultValue = undefined) {
		if (typeof window === 'undefined') return defaultValue;

		if (!globalCache.has(key)) {
			globalCache.set(key, window[key]);
		}
		return globalCache.get(key) !== undefined ? globalCache.get(key) : defaultValue;
	}

	function setGlobal(key, value) {
		if (typeof window === 'undefined') return;
		window[key] = value;
		globalCache.set(key, value);
	}

	// Convert Decimal objects to numbers safely
	function toNumber(value, defaultValue = 0) {
		if (value && typeof value.toNumber === 'function') {
			return value.toNumber();
		}
		const num = Number(value);
		return isNaN(num) ? defaultValue : num;
	}

	// Resource setters
	function setSips(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ sips: numericValue });
			setGlobal('sips', value); // Keep global in sync
		} catch (error) {
			console.warn('Failed to set sips:', error);
		}
	}

	function setStraws(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ straws: numericValue });
			setGlobal('straws', value);
		} catch (error) {
			console.warn('Failed to set straws:', error);
		}
	}

	function setCups(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ cups: numericValue });
			setGlobal('cups', value);
		} catch (error) {
			console.warn('Failed to set cups:', error);
		}
	}

	function setSuctions(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ suctions: numericValue });
			setGlobal('suctions', value);
		} catch (error) {
			console.warn('Failed to set suctions:', error);
		}
	}

	function setWiderStraws(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ widerStraws: numericValue });
			setGlobal('widerStraws', value);
		} catch (error) {
			console.warn('Failed to set widerStraws:', error);
		}
	}

	function setBetterCups(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ betterCups: numericValue });
			setGlobal('betterCups', value);
		} catch (error) {
			console.warn('Failed to set betterCups:', error);
		}
	}

	function setFasterDrinks(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ fasterDrinks: numericValue });
			setGlobal('fasterDrinks', value);
		} catch (error) {
			console.warn('Failed to set fasterDrinks:', error);
		}
	}

	function setCriticalClicks(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ criticalClicks: numericValue });
			setGlobal('criticalClicks', value);
		} catch (error) {
			console.warn('Failed to set criticalClicks:', error);
		}
	}

	function setLevel(value) {
		try {
			const numericValue = toNumber(value, 1);
			app.state.setState({ level: Math.max(1, numericValue) });
			setGlobal('level', value);
		} catch (error) {
			console.warn('Failed to set level:', error);
		}
	}

	// Drink system setters
	function setDrinkRate(value) {
		try {
			const numericValue = Math.max(0, toNumber(value, 0));
			app.state.setState({ drinkRate: numericValue });
			setGlobal('drinkRate', value);
		} catch (error) {
			console.warn('Failed to set drinkRate:', error);
		}
	}

	function setDrinkProgress(value) {
		try {
			const numericValue = Math.max(0, Math.min(100, toNumber(value, 0)));
			app.state.setState({ drinkProgress: numericValue });
			setGlobal('drinkProgress', value);
		} catch (error) {
			console.warn('Failed to set drinkProgress:', error);
		}
	}

	function setLastDrinkTime(value) {
		try {
			const numericValue = toNumber(value, 0);
			app.state.setState({ lastDrinkTime: numericValue });
			setGlobal('lastDrinkTime', value);
		} catch (error) {
			console.warn('Failed to set lastDrinkTime:', error);
		}
	}

	function setSps(value) {
		try {
			const numericValue = Math.max(0, toNumber(value, 0));
			app.state.setState({ sps: numericValue });
			setGlobal('sps', value);
		} catch (error) {
			console.warn('Failed to set sps:', error);
		}
	}

	// Statistics setters
	function setTotalClicks(value) {
		try {
			const numericValue = Math.max(0, toNumber(value, 0));
			app.state.setState({ totalClicks: numericValue });
			setGlobal('totalClicks', value);
		} catch (error) {
			console.warn('Failed to set totalClicks:', error);
		}
	}

	function setTotalSipsEarned(value) {
		try {
			const numericValue = Math.max(0, toNumber(value, 0));
			app.state.setState({ totalSipsEarned: numericValue });
			setGlobal('totalSipsEarned', value);
		} catch (error) {
			console.warn('Failed to set totalSipsEarned:', error);
		}
	}

	// Initialize bridge with current global values
	function init() {
		try {
			const seed = {};

			// Resource values
			const sips = getGlobal('sips');
			if (sips !== undefined) seed.sips = toNumber(sips, 0);

			const straws = getGlobal('straws');
			if (straws !== undefined) seed.straws = toNumber(straws, 0);

			const cups = getGlobal('cups');
			if (cups !== undefined) seed.cups = toNumber(cups, 0);

			const suctions = getGlobal('suctions');
			if (suctions !== undefined) seed.suctions = toNumber(suctions, 0);

			const widerStraws = getGlobal('widerStraws');
			if (widerStraws !== undefined) seed.widerStraws = toNumber(widerStraws, 0);

			const betterCups = getGlobal('betterCups');
			if (betterCups !== undefined) seed.betterCups = toNumber(betterCups, 0);

			const fasterDrinks = getGlobal('fasterDrinks');
			if (fasterDrinks !== undefined) seed.fasterDrinks = toNumber(fasterDrinks, 0);

			const criticalClicks = getGlobal('criticalClicks');
			if (criticalClicks !== undefined) seed.criticalClicks = toNumber(criticalClicks, 0);

			const level = getGlobal('level');
			if (level !== undefined) seed.level = Math.max(1, toNumber(level, 1));

			// Drink system values
			const drinkRate = getGlobal('drinkRate');
			if (drinkRate !== undefined) seed.drinkRate = Math.max(0, toNumber(drinkRate, 0));

			const drinkProgress = getGlobal('drinkProgress');
			if (drinkProgress !== undefined) seed.drinkProgress = Math.max(0, Math.min(100, toNumber(drinkProgress, 0)));

			const lastDrinkTime = getGlobal('lastDrinkTime');
			if (lastDrinkTime !== undefined) seed.lastDrinkTime = toNumber(lastDrinkTime, 0);

			const sps = getGlobal('sps');
			if (sps !== undefined) seed.sps = Math.max(0, toNumber(sps, 0));

			// Statistics
			const totalClicks = getGlobal('totalClicks');
			if (totalClicks !== undefined) seed.totalClicks = Math.max(0, toNumber(totalClicks, 0));

			const totalSipsEarned = getGlobal('totalSipsEarned');
			if (totalSipsEarned !== undefined) seed.totalSipsEarned = Math.max(0, toNumber(totalSipsEarned, 0));

			if (Object.keys(seed).length > 0) {
				app.state.setState(seed);
				console.log('🔄 State bridge initialized with', Object.keys(seed).length, 'values');
			}
		} catch (error) {
			console.warn('Failed to initialize state bridge:', error);
		}
	}

	// Sync state changes back to globals
	function syncToGlobals() {
		try {
			const state = app.state.getState();

			// Keep globals in sync with state
			setGlobal('sips', state.sips);
			setGlobal('straws', state.straws);
			setGlobal('cups', state.cups);
			setGlobal('suctions', state.suctions);
			setGlobal('widerStraws', state.widerStraws);
			setGlobal('betterCups', state.betterCups);
			setGlobal('fasterDrinks', state.fasterDrinks);
			setGlobal('criticalClicks', state.criticalClicks);
			setGlobal('level', state.level);
			setGlobal('drinkRate', state.drinkRate);
			setGlobal('drinkProgress', state.drinkProgress);
			setGlobal('lastDrinkTime', state.lastDrinkTime);
			setGlobal('sps', state.sps);
			setGlobal('totalClicks', state.totalClicks);
			setGlobal('totalSipsEarned', state.totalSipsEarned);
		} catch (error) {
			console.warn('Failed to sync state to globals:', error);
		}
	}

	// Set up automatic syncing
	function startAutoSync() {
		if (typeof window !== 'undefined') {
			// Sync on state changes
			app.state.subscribe(syncToGlobals);

			// Periodic sync as backup
			setInterval(syncToGlobals, 5000); // Every 5 seconds
		}
	}

	return {
		// Initialization
		init,
		startAutoSync,

		// Resource setters
		setSips,
		setStraws,
		setCups,
		setSuctions,
		setWiderStraws,
		setBetterCups,
		setFasterDrinks,
		setCriticalClicks,
		setLevel,

		// Drink system setters
		setDrinkRate,
		setDrinkProgress,
		setLastDrinkTime,
		setSps,

		// Statistics setters
		setTotalClicks,
		setTotalSipsEarned,

		// Utility methods
		syncToGlobals,
		getGlobal,
		setGlobal,
		toNumber,

		// Legacy compatibility
		setLastDrinkTime: setLastDrinkTime, // Alias for backward compatibility
	};
}


