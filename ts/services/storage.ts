// Storage service (TypeScript) with schema-backed validation

import { validateGameOptions, validateGameSave } from '../core/validation/schemas.ts';

const STORAGE_PREFIX = 'game_';

function getKey(key: string): string {
  return STORAGE_PREFIX + key;
}

export type AnyRecord = Record<string, unknown>;

export type StorageAPI = {
  loadGame: () => AnyRecord | null;
  saveGame: (data: AnyRecord) => boolean;
  deleteSave: () => boolean;
  setJSON: (key: string, value: unknown) => boolean;
  getJSON: (key: string, defaultValue?: unknown) => unknown;
  setBoolean: (key: string, value: boolean) => boolean;
  getBoolean: (key: string, defaultValue?: boolean) => boolean;
  remove: (key: string) => boolean;
};

export const AppStorage: StorageAPI = {
  loadGame: () => {
    try {
      const saved = localStorage.getItem(getKey('save'));
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const validated = validateGameSave(parsed as any);
      return validated || parsed;
    } catch (e) {
      console.error('Error loading game:', e);
      return null;
    }
  },

  saveGame: (data: AnyRecord) => {
    try {
      const validated = validateGameSave(data as any);
      if (!validated) {
        console.warn('Attempting to save invalid game data');
      }
      localStorage.setItem(getKey('save'), JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving game:', e);
      return false;
    }
  },

  deleteSave: () => {
    try {
      localStorage.removeItem(getKey('save'));
      return true;
    } catch (e) {
      console.error('Error deleting save:', e);
      return false;
    }
  },

  setJSON: (key: string, value: unknown) => {
    try {
      localStorage.setItem(getKey(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error setting JSON for ${key}:`, e);
      return false;
    }
  },

  getJSON: (key: string, defaultValue: unknown = null) => {
    try {
      const saved = localStorage.getItem(getKey(key));
      if (!saved) return defaultValue;
      const parsed = JSON.parse(saved);
      if (key === 'options') {
        const validated = validateGameOptions(parsed as any);
        return validated || parsed;
      }
      return parsed;
    } catch (e) {
      console.error(`Error getting JSON for ${key}:`, e);
      return defaultValue;
    }
  },

  setBoolean: (key: string, value: boolean) => {
    try {
      localStorage.setItem(getKey(key), value ? 'true' : 'false');
      return true;
    } catch (e) {
      console.error(`Error setting boolean for ${key}:`, e);
      return false;
    }
  },

  getBoolean: (key: string, defaultValue: boolean = false) => {
    try {
      const saved = localStorage.getItem(getKey(key));
      if (saved === null) return defaultValue;
      return saved === 'true';
    } catch (e) {
      console.error(`Error getting boolean for ${key}:`, e);
      return defaultValue;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(getKey(key));
      return true;
    } catch (e) {
      console.error(`Error removing item for ${key}:`, e);
      return false;
    }
  },
};

// Expose globally for legacy access
try {
  (window as any).storage = AppStorage;
} catch {}
