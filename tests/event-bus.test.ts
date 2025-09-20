import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from '../ts/services/event-bus';

describe('event-bus', () => {
  it('calls subscribed handlers with payload', () => {
    const bus = createEventBus<{ hello: string }>();
    const handler = vi.fn();
    bus.on('hello', handler);
    bus.emit('hello', 'world');
    expect(handler).toHaveBeenCalledWith('world');
  });

  it('reports handler errors without throwing to other handlers', () => {
    const bus = createEventBus<{ evt: number }>();
    const good = vi.fn();
    const bad = vi.fn(() => {
      throw new Error('boom');
    });
    bus.on('evt', bad);
    bus.on('evt', good);
    // Should not throw
    expect(() => bus.emit('evt', 1)).not.toThrow();
    expect(good).toHaveBeenCalledWith(1);
  });
});


