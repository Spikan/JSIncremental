// Bridge that mirrors selected legacy globals into App.state
// Non-authoritative for now; used to gradually migrate code to selectors

function createStateBridge(app) {
	function setDrinkRate(value) {
		try { app.state.setState({ drinkRate: Number(value) || 0 }); } catch {}
	}

	function setDrinkProgress(value) {
		try { app.state.setState({ drinkProgress: Number(value) || 0 }); } catch {}
	}

	function setLastDrinkTime(value) {
		try { app.state.setState({ lastDrinkTime: Number(value) || 0 }); } catch {}
	}

	function setLevel(value) {
		const numeric = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 1;
		try { app.state.setState({ level: numeric }); } catch {}
	}

	// Enhanced synchronization functions for all game resources
	function syncSips(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ sips: numericValue });
		} catch {}
	}

	function syncStraws(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ straws: numericValue });
		} catch {}
	}

	function syncCups(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ cups: numericValue });
		} catch {}
	}

	function syncSuctions(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ suctions: numericValue });
		} catch {}
	}

	function syncWiderStraws(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ widerStraws: numericValue });
		} catch {}
	}

	function syncBetterCups(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ betterCups: numericValue });
		} catch {}
	}

	function syncFasterDrinks(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ fasterDrinks: numericValue });
		} catch {}
	}

	function syncCriticalClicks(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ criticalClicks: numericValue });
		} catch {}
	}

	function syncSps(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ sps: numericValue });
		} catch {}
	}

	function syncStrawSPD(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ strawSPD: numericValue });
		} catch {}
	}

	function syncCupSPD(value) {
		try {
			const numericValue = (value && typeof value.toNumber === 'function') ? value.toNumber() : Number(value) || 0;
			app.state.setState({ cupSPD: numericValue });
		} catch {}
	}

	function init() {
		// Seed from legacy globals if present
		try {
			const seed = {};
			if (typeof window !== 'undefined') {
				if (typeof window.drinkRate !== 'undefined') seed.drinkRate = Number(window.drinkRate) || 0;
				if (typeof window.drinkProgress !== 'undefined') seed.drinkProgress = Number(window.drinkProgress) || 0;
				if (typeof window.lastDrinkTime !== 'undefined') seed.lastDrinkTime = Number(window.lastDrinkTime) || 0;
				if (typeof window.level !== 'undefined') seed.level = (typeof window.level?.toNumber === 'function') ? window.level.toNumber() : Number(window.level) || 1;
				if (typeof window.sips !== 'undefined') seed.sips = (typeof window.sips?.toNumber === 'function') ? window.sips.toNumber() : Number(window.sips) || 0;
				if (typeof window.straws !== 'undefined') seed.straws = (typeof window.straws?.toNumber === 'function') ? window.straws.toNumber() : Number(window.straws) || 0;
				if (typeof window.cups !== 'undefined') seed.cups = (typeof window.cups?.toNumber === 'function') ? window.cups.toNumber() : Number(window.cups) || 0;
				if (typeof window.suctions !== 'undefined') seed.suctions = (typeof window.suctions?.toNumber === 'function') ? window.suctions.toNumber() : Number(window.suctions) || 0;
				if (typeof window.widerStraws !== 'undefined') seed.widerStraws = (typeof window.widerStraws?.toNumber === 'function') ? window.widerStraws.toNumber() : Number(window.widerStraws) || 0;
				if (typeof window.betterCups !== 'undefined') seed.betterCups = (typeof window.betterCups?.toNumber === 'function') ? window.betterCups.toNumber() : Number(window.betterCups) || 0;
				if (typeof window.fasterDrinks !== 'undefined') seed.fasterDrinks = (typeof window.fasterDrinks?.toNumber === 'function') ? window.fasterDrinks.toNumber() : Number(window.fasterDrinks) || 0;
				if (typeof window.criticalClicks !== 'undefined') seed.criticalClicks = (typeof window.criticalClicks?.toNumber === 'function') ? window.criticalClicks.toNumber() : Number(window.criticalClicks) || 0;
				if (typeof window.sps !== 'undefined') seed.sps = (typeof window.sps?.toNumber === 'function') ? window.sps.toNumber() : Number(window.sps) || 0;
			}
			if (Object.keys(seed).length) app.state.setState(seed);
		} catch {}
	}

	// Auto-sync function to keep state in sync
	function autoSync() {
		if (typeof window === 'undefined') return;

		try {
			// Sync all game resources from globals to state
			if (typeof window.sips !== 'undefined') syncSips(window.sips);
			if (typeof window.straws !== 'undefined') syncStraws(window.straws);
			if (typeof window.cups !== 'undefined') syncCups(window.cups);
			if (typeof window.suctions !== 'undefined') syncSuctions(window.suctions);
			if (typeof window.widerStraws !== 'undefined') syncWiderStraws(window.widerStraws);
			if (typeof window.betterCups !== 'undefined') syncBetterCups(window.betterCups);
			if (typeof window.fasterDrinks !== 'undefined') syncFasterDrinks(window.fasterDrinks);
			if (typeof window.criticalClicks !== 'undefined') syncCriticalClicks(window.criticalClicks);
			if (typeof window.sps !== 'undefined') syncSps(window.sps);
			if (typeof window.drinkRate !== 'undefined') setDrinkRate(window.drinkRate);
			if (typeof window.drinkProgress !== 'undefined') setDrinkProgress(window.drinkProgress);
			if (typeof window.lastDrinkTime !== 'undefined') setLastDrinkTime(window.lastDrinkTime);
			if (typeof window.level !== 'undefined') setLevel(window.level);
		} catch (error) {
			console.warn('State bridge auto-sync failed:', error);
		}
	}

	return {
		init,
		setDrinkRate,
		setDrinkProgress,
		setLastDrinkTime,
		setLevel,
		syncSips,
		syncStraws,
		syncCups,
		syncSuctions,
		syncWiderStraws,
		syncBetterCups,
		syncFasterDrinks,
		syncCriticalClicks,
		syncSps,
		syncStrawSPD,
		syncCupSPD,
		autoSync,
	};
}

// Make available globally
window.createStateBridge = createStateBridge;


