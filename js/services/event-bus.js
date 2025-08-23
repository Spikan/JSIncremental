// @ts-check
// Simple pub/sub event bus

/**
 * @template {Record<string, any>} [E=Record<string, any>]
 * @returns {{ on: (event: keyof E & string, handler: (payload: E[keyof E]) => void) => () => void; off: (event: keyof E & string, handler: (payload: E[keyof E]) => void) => void; emit: (event: keyof E & string, payload?: E[keyof E]) => void }}
 */
export function createEventBus() {
    /** @type {Map<string, Set<Function>>} */
    const listeners = new Map(); // event -> Set<fn>

    /** @param {string} event @param {(payload:any)=>void} handler */
    function on(event, handler) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        const set = listeners.get(event);
        if (set) set.add(handler);
        return () => off(event, handler);
    }

    /** @param {string} event @param {(payload:any)=>void} handler */
    function off(event, handler) {
        const set = listeners.get(event);
        if (set) set.delete(handler);
    }

    /** @param {string} event @param {any} [payload] */
    function emit(event, payload) {
        const set = listeners.get(event);
        if (!set) return;
        for (const handler of Array.from(set)) {
            try { handler(payload); } catch (e) { console.warn('bus handler error', e); }
        }
    }

    return { on, off, emit };
}

export const bus = createEventBus();

// Make available globally
try { (/** @type {any} */(window)).createEventBus = createEventBus; } catch {}
try { (/** @type {any} */(window)).eventBus = bus; } catch {}
try { (/** @type {any} */(window)).bus = bus; } catch {}


