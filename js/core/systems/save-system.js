// @ts-check
// Save system: queueing and performing saves via App.storage

/**
 * @param {{ now: number; lastOp: number; minIntervalMs: number; schedule: (ms:number)=>void; perform: ()=>void }} args
 */
export function queueSave({ now, lastOp, minIntervalMs, schedule, perform }) {
	const elapsed = Number(now) - Number(lastOp || 0);
	if (elapsed < Number(minIntervalMs)) {
		const delay = Number(minIntervalMs) - elapsed;
		schedule(Math.max(0, delay));
		return { queued: true };
	}
	perform();
	return { queued: false };
}

/**
 * @returns {any}
 */
export function performSaveSnapshot() {
	try {
		const payload = {
			sips: String(window.sips || 0),
			straws: (window.straws && typeof window.straws.toNumber === 'function') ? window.straws.toNumber() : Number(window.straws || 0),
			cups: (window.cups && typeof window.cups.toNumber === 'function') ? window.cups.toNumber() : Number(window.cups || 0),
			widerStraws: String(window.widerStraws || 0),
			betterCups: String(window.betterCups || 0),
			suctions: String(window.suctions || 0),
			criticalClicks: String(window.criticalClicks || 0),
			fasterDrinks: String(window.fasterDrinks || 0),
			totalSipsEarned: String(window.totalSipsEarned || 0),
			drinkRate: Number(window.drinkRate || 0),
			lastDrinkTime: Number(window.lastDrinkTime || 0),
			drinkProgress: Number(window.drinkProgress || 0),
			lastSaveTime: Date.now(),
			totalClicks: Number(window.totalClicks || 0),
			level: (window.level && typeof window.level.toNumber === 'function') ? window.level.toNumber() : Number(window.level || 1)
		};


		window.App?.storage?.saveGame?.(payload);
		window.App?.events?.emit?.(window.App?.EVENT_NAMES?.GAME?.SAVED, payload);
		return payload;
	} catch (e) {
		console.warn('performSaveSnapshot failed', e);
		return null;
	}
}

export function deleteSave() {
	try {
		window.App?.storage?.deleteSave?.();
		window.App?.events?.emit?.(window.App?.EVENT_NAMES?.GAME?.DELETED, {});
		return true;
	} catch (e) {
		console.warn('deleteSave failed', e);
		return false;
	}
}


