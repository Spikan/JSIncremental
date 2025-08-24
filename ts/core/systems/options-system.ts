// Options system: persist/load game options via App.storage (TypeScript)

const OPTIONS_KEY = 'gameOptions';

export type GameOptions = {
  autosaveEnabled: boolean;
  autosaveInterval: number; // ms
  clickSoundsEnabled: boolean;
  musicEnabled: boolean;
  musicStreamPreferences?: any;
};

export function loadOptions(defaults: GameOptions): GameOptions {
  try {
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    const stored = w.App?.storage?.getJSON?.(OPTIONS_KEY, null);
    if (stored && typeof stored === 'object') return { ...defaults, ...stored } as GameOptions;
    return { ...defaults } as GameOptions;
  } catch {
    return { ...defaults } as GameOptions;
  }
}

export function saveOptions(options: GameOptions): boolean {
  try {
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    w.App?.storage?.setJSON?.(OPTIONS_KEY, options);
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
