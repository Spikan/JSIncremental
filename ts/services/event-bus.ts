// Typed pub/sub event bus (TypeScript)

export type EventMap = Record<string, unknown>;

export type EventBus<E extends EventMap = Record<string, unknown>> = {
  on: <K extends keyof E & string>(_event: K, _handler: (_payload: E[K]) => void) => () => void;
  off: <K extends keyof E & string>(_event: K, _handler: (_payload: E[K]) => void) => void;
  emit: <K extends keyof E & string>(_event: K, _payload?: E[K]) => void;
};

export function createEventBus<E extends EventMap = Record<string, unknown>>(): EventBus<E> {
  const listeners = new Map<string, Set<Function>>();

  function on<K extends keyof E & string>(event: K, _handler: (_payload: E[K]) => void) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(_handler as any);
    return () => off(event, _handler);
  }

  function off<K extends keyof E & string>(event: K, _handler: (_payload: E[K]) => void) {
    const set = listeners.get(event);
    if (set) set.delete(_handler as any);
  }

  function emit<K extends keyof E & string>(_event: K, _payload?: E[K]) {
    const set = listeners.get(_event);
    if (!set) return;
    for (const handler of Array.from(set)) {
      try {
        (handler as any)(_payload);
      } catch (e) {
        console.warn('bus handler error', e);
      }
    }
  }

  return { on, off, emit } as EventBus<E>;
}

export const bus = createEventBus();

try {
  (window as any).createEventBus = createEventBus;
} catch (error) {
  console.warn('Failed to expose createEventBus globally:', error);
}
try {
  (window as any).eventBus = bus;
} catch (error) {
  console.warn('Failed to expose eventBus globally:', error);
}
try {
  (window as any).bus = bus;
} catch (error) {
  console.warn('Failed to expose bus globally:', error);
}
