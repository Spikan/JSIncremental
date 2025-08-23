// Autosave counter progression helper (TypeScript)

export type AutosaveArgs = { enabled: boolean; counter: number; intervalSec: number; drinkRateMs: number };
export type AutosaveResult = { nextCounter: number; shouldSave: boolean };
export type AutosaveClockArgs = { enabled: boolean; lastSavedMs: number; nowMs: number; intervalSec: number };
export type AutosaveClockResult = { nextLastSavedMs: number; shouldSave: boolean };

export function computeAutosaveCounter({ enabled, counter, intervalSec, drinkRateMs }: AutosaveArgs): AutosaveResult {
  if (!enabled) return { nextCounter: 0, shouldSave: false };
  const drinksPerSecond = 1000 / Number(drinkRateMs || 1000);
  const drinksForAutosave = Math.ceil(Number(intervalSec || 10) * drinksPerSecond);
  const next = Number(counter || 0) + 1;
  if (next >= drinksForAutosave) return { nextCounter: 1, shouldSave: true };
  return { nextCounter: next, shouldSave: false };
}

// Wall-clock autosave helper: triggers based on elapsed real time, independent of drink timing
export function shouldAutosaveClock({ enabled, lastSavedMs, nowMs, intervalSec }: AutosaveClockArgs): AutosaveClockResult {
  if (!enabled) return { nextLastSavedMs: Number(lastSavedMs || 0), shouldSave: false };
  const now = Number(nowMs || Date.now());
  const last = Number(lastSavedMs || 0);
  if (last <= 0) return { nextLastSavedMs: now, shouldSave: false };
  const intervalMs = Math.max(0, Number(intervalSec || 10) * 1000);
  if (now - last >= intervalMs) return { nextLastSavedMs: now, shouldSave: true };
  return { nextLastSavedMs: last, shouldSave: false };
}


