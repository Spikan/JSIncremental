// Storage service (TypeScript) with schema-backed validation

import { validateGameOptions, validateGameSave } from '../core/validation/schemas.ts';
import { errorReporter, ErrorCategory, ErrorSeverity } from './error-overlay';
import { errorHandler } from '../core/error-handling/error-handler';

const STORAGE_PREFIX = 'game_';

function getKey(key: string): string {
  return STORAGE_PREFIX + key;
}

export type AnyRecord = Record<string, unknown>;

export type StorageAPI = {
  loadGame: () => AnyRecord | null;
  saveGame: (_data: AnyRecord) => boolean;
  deleteSave: () => boolean;
  setJSON: (_key: string, _value: unknown) => boolean;
  getJSON: (_key: string, _defaultValue?: unknown) => unknown;
  setBoolean: (_key: string, _value: boolean) => boolean;
  getBoolean: (_key: string, _defaultValue?: boolean) => boolean;
  remove: (_key: string) => boolean;
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
      const errorMessage = 'Error loading game';
      errorHandler.handleError(e, 'loadGame', { critical: true });

      // Report error with context
      errorReporter?.reportError({
        id: `storage_load_${Date.now()}`,
        message: errorMessage,
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.HIGH,
        context: {
          component: 'storage',
          operation: 'loadGame',
          timestamp: Date.now(),
          stackTrace: e instanceof Error ? e.stack : undefined,
        },
        originalError: e instanceof Error ? e : new Error(String(e)),
      });

      return null;
    }
  },

  saveGame: (data: AnyRecord) => {
    try {
      const validated = validateGameSave(data as any);
      if (!validated) {
        console.warn('Attempting to save invalid game data');

        // Report validation error
        errorReporter?.reportError({
          id: `storage_save_validation_${Date.now()}`,
          message: 'Attempting to save invalid game data',
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          context: {
            component: 'storage',
            operation: 'saveGame',
            timestamp: Date.now(),
            gameState: data,
          },
        });
      }
      localStorage.setItem(getKey('save'), JSON.stringify(data));
      return true;
    } catch (e) {
      const errorMessage = 'Error saving game';
      errorHandler.handleError(e, 'saveGame', { critical: true });

      // Report error with context
      errorReporter?.reportError({
        id: `storage_save_${Date.now()}`,
        message: errorMessage,
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.HIGH,
        context: {
          component: 'storage',
          operation: 'saveGame',
          timestamp: Date.now(),
          gameState: data,
          stackTrace: e instanceof Error ? e.stack : undefined,
        },
        originalError: e instanceof Error ? e : new Error(String(e)),
      });

      return false;
    }
  },

  deleteSave: () => {
    try {
      localStorage.removeItem(getKey('save'));
      return true;
    } catch (e) {
      const errorMessage = 'Error deleting save';
      errorHandler.handleError(e, 'deleteSave', { critical: true });

      // Report error with context
      errorReporter?.reportError({
        id: `storage_delete_${Date.now()}`,
        message: errorMessage,
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.MEDIUM,
        context: {
          component: 'storage',
          operation: 'deleteSave',
          timestamp: Date.now(),
          stackTrace: e instanceof Error ? e.stack : undefined,
        },
        originalError: e instanceof Error ? e : new Error(String(e)),
      });

      return false;
    }
  },

  setJSON: (key: string, value: unknown) => {
    try {
      localStorage.setItem(getKey(key), JSON.stringify(value));
      return true;
    } catch (e) {
      errorHandler.handleError(e, 'setJSON', { key });
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
      errorHandler.handleError(e, 'getJSON', { key });
      return defaultValue;
    }
  },

  setBoolean: (key: string, value: boolean) => {
    try {
      localStorage.setItem(getKey(key), value ? 'true' : 'false');
      return true;
    } catch (e) {
      errorHandler.handleError(e, 'setBoolean', { key });
      return false;
    }
  },

  getBoolean: (key: string, defaultValue: boolean = false) => {
    try {
      const saved = localStorage.getItem(getKey(key));
      if (saved === null) return defaultValue;
      return saved === 'true';
    } catch (e) {
      errorHandler.handleError(e, 'getBoolean', { key });
      return defaultValue;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(getKey(key));
      return true;
    } catch (e) {
      errorHandler.handleError(e, 'removeItem', { key });
      return false;
    }
  },
};

// Expose globally for legacy access
try {
  (window as any).storage = AppStorage;
} catch (error) {
  errorHandler.handleError(error, 'exposeStorageGlobally');
}
