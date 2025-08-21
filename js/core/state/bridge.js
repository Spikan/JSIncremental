// Bridge that mirrors selected legacy globals into App.state
// Non-authoritative for now; used to gradually migrate code to selectors

export function createStateBridge(app) {
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

	function init() {
		// Seed from legacy globals if present
		try {
			const seed = {};
			if (typeof window !== 'undefined') {
				if (typeof window.drinkRate !== 'undefined') seed.drinkRate = Number(window.drinkRate) || 0;
				if (typeof window.drinkProgress !== 'undefined') seed.drinkProgress = Number(window.drinkProgress) || 0;
				if (typeof window.lastDrinkTime !== 'undefined') seed.lastDrinkTime = Number(window.lastDrinkTime) || 0;
				if (typeof window.level !== 'undefined') seed.level = (typeof window.level?.toNumber === 'function') ? window.level.toNumber() : Number(window.level) || 1;
			}
			if (Object.keys(seed).length) app.state.setState(seed);
		} catch {}
	}

	return {
		init,
		setDrinkRate,
		setDrinkProgress,
		setLastDrinkTime,
		setLevel,
	};
}


