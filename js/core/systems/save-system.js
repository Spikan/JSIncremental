// Save system: queueing and performing saves via App.storage

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

export function performSaveSnapshot() {
	try {
		const payload = {
			sips: String(window.sips),
			straws: Number(window.straws || 0),
			cups: Number(window.cups || 0),
			widerStraws: String(window.widerStraws || 0),
			betterCups: String(window.betterCups || 0),
			suctions: String(window.suctions || 0),
			criticalClicks: String(window.criticalClicks || 0),
			fasterDrinks: String(window.fasterDrinks || 0),
			lastSaveTime: Date.now(),
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


