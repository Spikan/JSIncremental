// @ts-check
// Loop system: centralizes requestAnimationFrame game loop

/** @type {number | null} */
let rafId = null;

/**
 * @param {{
 *  updateDrinkProgress?: () => void;
 *  processDrink?: () => void;
 *  updateStats?: () => void;
 *  updatePlayTime?: () => void;
 *  updateLastSaveTime?: () => void;
 *  getNow?: () => number;
 * }} args
 */
export function start({
	updateDrinkProgress,
	processDrink,
	updateStats,
	updatePlayTime,
	updateLastSaveTime,
	getNow = () => Date.now(),
}) {
	try { stop(); } catch {}
	let lastStatsUpdate = 0;

	function tick() {
		try { updateDrinkProgress && updateDrinkProgress(); } catch {}
		try { processDrink && processDrink(); } catch {}
		const now = getNow();
		if (now - lastStatsUpdate >= 1000) {
			lastStatsUpdate = now;
			try { updateStats && updateStats(); } catch {}
			try { updatePlayTime && updatePlayTime(); } catch {}
			try { updateLastSaveTime && updateLastSaveTime(); } catch {}
			// Maintain authoritative totalPlayTime in App.state
			try {
				const st = window.App?.state?.getState?.();
				if (st) {
					const prev = Number(st.totalPlayTime || 0);
					window.App?.state?.setState?.({ totalPlayTime: prev + 1000 });
				}
			} catch {}
		}
		rafId = requestAnimationFrame(tick);
	}

	runOnceSafely(updateDrinkProgress);
	runOnceSafely(processDrink);
	lastStatsUpdate = getNow();
	runOnceSafely(updateStats);
	runOnceSafely(updatePlayTime);
	runOnceSafely(updateLastSaveTime);
	rafId = requestAnimationFrame(tick);
}

export function stop() {
	if (rafId != null) {
		cancelAnimationFrame(rafId);
		rafId = null;
	}
}

/** @param {(() => void) | undefined} fn */
function runOnceSafely(fn) {
	try { fn && fn(); } catch {}
}


