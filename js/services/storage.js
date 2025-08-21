// Basic localStorage-backed persistence with versioning hook

const STORAGE_KEY = 'soda-clicker-pro.save';
const STORAGE_VERSION = 1;

export function loadGame() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        // Future: apply migrations based on parsed.__v
        return parsed;
    } catch (err) {
        console.warn('loadGame failed:', err);
        return null;
    }
}

export function saveGame(data) {
    try {
        if (data == null) return;
        const payload = { ...data, __v: STORAGE_VERSION, __ts: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
        console.warn('saveGame failed:', err);
    }
}

export function deleteSave() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.warn('deleteSave failed:', err);
    }
}

export function getStorageMeta() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return { version: parsed.__v, timestamp: parsed.__ts };
    } catch {
        return null;
    }
}

// Generic helpers for namespaced settings/preferences
export function setJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.warn('setJSON failed:', key, err);
    }
}

export function getJSON(key, defaultValue = null) {
    try {
        const raw = localStorage.getItem(key);
        if (raw == null) return defaultValue;
        return JSON.parse(raw);
    } catch (err) {
        console.warn('getJSON failed:', key, err);
        return defaultValue;
    }
}

export function setBoolean(key, value) {
    try {
        localStorage.setItem(key, value ? 'true' : 'false');
    } catch (err) {
        console.warn('setBoolean failed:', key, err);
    }
}

export function getBoolean(key, defaultValue = false) {
    try {
        const raw = localStorage.getItem(key);
        if (raw == null) return defaultValue;
        return raw === 'true';
    } catch (err) {
        console.warn('getBoolean failed:', key, err);
        return defaultValue;
    }
}

export function remove(key) {
    try {
        localStorage.removeItem(key);
    } catch (err) {
        console.warn('remove failed:', key, err);
    }
}


