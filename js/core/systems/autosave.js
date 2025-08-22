// @ts-check
// Autosave counter progression helper
// Inputs are primitives; returns next counter and whether to perform a save
/**
 * @param {{ enabled: boolean; counter: number; intervalSec: number; drinkRateMs: number }} args
 */
export function computeAutosaveCounter({ enabled, counter, intervalSec, drinkRateMs }) {
	if (!enabled) return { nextCounter: 0, shouldSave: false };
	const drinksPerSecond = 1000 / Number(drinkRateMs || 1000);
	const drinksForAutosave = Math.ceil(Number(intervalSec || 10) * drinksPerSecond);
	const next = Number(counter || 0) + 1;
	if (next >= drinksForAutosave) return { nextCounter: 1, shouldSave: true };
	return { nextCounter: next, shouldSave: false };
}


