// Simple pub/sub event bus

export function createEventBus() {
    const listeners = new Map(); // event -> Set<fn>

    function on(event, handler) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(handler);
        return () => off(event, handler);
    }

    function off(event, handler) {
        const set = listeners.get(event);
        if (set) set.delete(handler);
    }

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


