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
		const w = /** @type {any} */(window);
		const payload = {
			sips: String(w.sips || 0),
			straws: (w.straws && typeof w.straws.toNumber === 'function') ? w.straws.toNumber() : Number(w.straws || 0),
			cups: (w.cups && typeof w.cups.toNumber === 'function') ? w.cups.toNumber() : Number(w.cups || 0),
			widerStraws: String(w.widerStraws || 0),
			betterCups: String(w.betterCups || 0),
			suctions: String(w.suctions || 0),
			criticalClicks: String(w.criticalClicks || 0),
			fasterDrinks: String(w.fasterDrinks || 0),
			totalSipsEarned: String(w.totalSipsEarned || 0),
			drinkRate: Number(w.drinkRate || 0),
			lastDrinkTime: Number(w.lastDrinkTime || 0),
			drinkProgress: Number(w.drinkProgress || 0),
			lastSaveTime: Date.now(),
			totalClicks: Number(w.totalClicks || 0),
			level: (w.level && typeof w.level.toNumber === 'function') ? w.level.toNumber() : Number(w.level || 1)
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


