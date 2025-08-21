import { validateGameSave, validateGameOptions } from '../core/validation/schemas.js';

const STORAGE_PREFIX = 'game_';

function getKey(key) {
    return STORAGE_PREFIX + key;
}

export const storage = {
    loadGame: () => {
        try {
            const saved = localStorage.getItem(getKey('save'));
            if (!saved) return null;
            
            const parsed = JSON.parse(saved);
            const validated = validateGameSave(parsed);
            
            if (validated) {
                return validated;
            } else {
                console.warn('Invalid save data detected, attempting recovery...');
                // Return parsed data anyway for backward compatibility
                return parsed;
            }
        } catch (e) {
            console.error('Error loading game:', e);
            return null;
        }
    },
    
    saveGame: (data) => {
        try {
            // Validate before saving
            const validated = validateGameSave(data);
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
    
    setJSON: (key, value) => {
        try {
            localStorage.setItem(getKey(key), JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error setting JSON for ${key}:`, e);
            return false;
        }
    },
    
    getJSON: (key, defaultValue = null) => {
        try {
            const saved = localStorage.getItem(getKey(key));
            if (!saved) return defaultValue;
            
            const parsed = JSON.parse(saved);
            
            // Validate specific keys
            if (key === 'options') {
                const validated = validateGameOptions(parsed);
                return validated || parsed; // Return parsed for backward compatibility
            }
            
            return parsed;
        } catch (e) {
            console.error(`Error getting JSON for ${key}:`, e);
            return defaultValue;
        }
    },
    
    setBoolean: (key, value) => {
        try {
            localStorage.setItem(getKey(key), value ? 'true' : 'false');
            return true;
        } catch (e) {
            console.error(`Error setting boolean for ${key}:`, e);
            return false;
        }
    },
    
    getBoolean: (key, defaultValue = false) => {
        try {
            const saved = localStorage.getItem(getKey(key));
            if (saved === null) return defaultValue;
            return saved === 'true';
        } catch (e) {
            console.error(`Error getting boolean for ${key}:`, e);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(getKey(key));
            return true;
        } catch (e) {
            console.error(`Error removing item for ${key}:`, e);
            return false;
        }
    }
};


