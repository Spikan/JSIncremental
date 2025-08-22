// @ts-check
// Options system: persist/load game options via App.storage

const OPTIONS_KEY = 'gameOptions';

/**
 * @param {{ autosaveEnabled: boolean; autosaveInterval: number; clickSoundsEnabled: boolean; musicEnabled: boolean; musicStreamPreferences?: any }} defaults
 */
export function loadOptions(defaults) {
	try {
		const stored = window.App?.storage?.getJSON?.(OPTIONS_KEY, null);
		if (stored && typeof stored === 'object') return { ...defaults, ...stored };
		return { ...defaults };
	} catch {
		return { ...defaults };
	}
}

/**
 * @param {{ autosaveEnabled: boolean; autosaveInterval: number; clickSoundsEnabled: boolean; musicEnabled: boolean; musicStreamPreferences?: any }} options
 */
export function saveOptions(options) {
	try {
		window.App?.storage?.setJSON?.(OPTIONS_KEY, options);
		return true;
	} catch {
		try {
			localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
			return true;
		} catch {
			return false;
		}
	}
}


