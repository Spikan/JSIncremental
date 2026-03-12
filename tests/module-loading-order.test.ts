import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let runtime: Awaited<ReturnType<typeof loadRuntime>> | null = null;
let animationHandles: ReturnType<typeof setTimeout>[] = [];

function installAnimationFrameMocks() {
  Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: vi.fn(callback => {
      const handle = setTimeout(() => {
        animationHandles = animationHandles.filter(activeHandle => activeHandle !== handle);
        callback(performance.now());
      }, 16);
      animationHandles.push(handle);
      return handle as unknown as number;
    }),
  });

  Object.defineProperty(window, 'cancelAnimationFrame', {
    writable: true,
    value: vi.fn(handle => {
      clearTimeout(handle);
      animationHandles = animationHandles.filter(activeHandle => activeHandle !== handle);
    }),
  });

  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    writable: true,
    value: window.requestAnimationFrame,
  });

  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    writable: true,
    value: window.cancelAnimationFrame,
  });
}

function clearAnimationFrameMocks() {
  animationHandles.forEach(handle => clearTimeout(handle));
  animationHandles = [];

  Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: () => 0,
  });

  Object.defineProperty(window, 'cancelAnimationFrame', {
    writable: true,
    value: () => {},
  });

  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    writable: true,
    value: window.requestAnimationFrame,
  });

  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    writable: true,
    value: window.cancelAnimationFrame,
  });
}

async function loadRuntime() {
  vi.resetModules();

  const indexModule = await import('../ts/index.ts');
  const loopModule = await import('../ts/core/systems/loop-system');
  const drinkModule = await import('../ts/core/systems/drink-system');
  const storeModule = await import('../ts/core/state/zustand-store');

  runtime = {
    indexModule,
    ...loopModule,
    ...drinkModule,
    ...storeModule,
  };

  return runtime;
}

describe('Module Loading Order Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://spikan.github.io',
        pathname: '/JSIncremental/',
      },
      writable: true,
    });

    (window as any).__TEST_ENV__ = true;
    (window as any).GAME_CONFIG = {
      BAL: { BASE_SIPS_PER_DRINK: 1 },
      TIMING: { DEFAULT_DRINK_RATE: 5000 },
    };
    (window as any).__lastAutosaveClockMs = 0;
    (window as any).Decimal = (globalThis as any).Decimal;
    (globalThis as any).__zustandStore = undefined;
    (globalThis as any).startGame = undefined;
    (globalThis as any).initGame = undefined;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    installAnimationFrameMocks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ words: ['test', 'word', 'bank'] }),
    }) as any;

    document.body.innerHTML = `
      <div id="splashScreen" style="display: block;"></div>
      <div id="gameContent" style="display: none;"></div>
      <button id="sodaButton">Soda</button>
    `;
  });

  afterEach(() => {
    runtime?.stop?.();
    runtime = null;
    clearAnimationFrameMocks();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    clearAnimationFrameMocks();
    Object.defineProperty(globalThis, 'document', {
      writable: true,
      value: {
        body: { innerHTML: '', classList: { contains: () => false } },
        getElementById: () => null,
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {},
      },
    });
  });

  it('should load core runtime modules without hanging', async () => {
    const startTime = Date.now();
    const loaded = await loadRuntime();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(10000);
    expect(loaded.indexModule).toBeDefined();
    expect(typeof loaded.start).toBe('function');
    expect(typeof loaded.stop).toBe('function');
    expect(typeof loaded.getProcessDrink).toBe('function');
    expect(typeof loaded.useGameStore.getState).toBe('function');
  });

  it('should have processDrink available when loop starts', async () => {
    const loaded = await loadRuntime();
    const processDrink = loaded.getProcessDrink();
    let rafCallCount = 0;
    let processDrinkCalled = false;

    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      const handle = setTimeout(() => {
        animationHandles = animationHandles.filter(activeHandle => activeHandle !== handle);
        callback(performance.now());
      }, 16);
      animationHandles.push(handle);
      return handle as unknown as number;
    });
    globalThis.requestAnimationFrame = window.requestAnimationFrame;

    loaded.start({
      updateDrinkProgress: vi.fn(),
      processDrink: async () => {
        processDrinkCalled = true;
        await processDrink();
      },
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    loaded.stop();

    expect(typeof processDrink).toBe('function');
    expect(rafCallCount).toBeGreaterThan(0);
    expect(processDrinkCalled).toBe(true);
  });

  it('should not have loop system start and immediately stop', async () => {
    const loaded = await loadRuntime();
    const cancelSpy = vi.fn();
    let rafCallCount = 0;

    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      const handle = setTimeout(() => {
        animationHandles = animationHandles.filter(activeHandle => activeHandle !== handle);
        callback(performance.now());
      }, 16);
      animationHandles.push(handle);
      return handle as unknown as number;
    });
    window.cancelAnimationFrame = vi.fn(handle => {
      cancelSpy(handle);
      clearTimeout(handle);
      animationHandles = animationHandles.filter(activeHandle => activeHandle !== handle);
    });
    globalThis.requestAnimationFrame = window.requestAnimationFrame;
    globalThis.cancelAnimationFrame = window.cancelAnimationFrame;

    loaded.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(async () => {}),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(rafCallCount).toBeGreaterThan(0);
    expect(cancelSpy).not.toHaveBeenCalled();

    loaded.stop();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should handle missing processDrink function gracefully', async () => {
    const loaded = await loadRuntime();
    let rafCallCount = 0;

    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      const handle = setTimeout(() => {
        animationHandles = animationHandles.filter(activeHandle => activeHandle !== handle);
        callback(performance.now());
      }, 16);
      animationHandles.push(handle);
      return handle as unknown as number;
    });
    globalThis.requestAnimationFrame = window.requestAnimationFrame;

    expect(() => {
      loaded.start({
        updateDrinkProgress: vi.fn(),
        updateStats: vi.fn(),
        updateUI: vi.fn(),
      });
    }).not.toThrow();

    await new Promise(resolve => setTimeout(resolve, 50));
    loaded.stop();

    expect(rafCallCount).toBeGreaterThan(0);
  });

  it('should expose all critical systems through the current runtime contract', async () => {
    const loaded = await loadRuntime();

    expect(typeof loaded.start).toBe('function');
    expect(typeof loaded.stop).toBe('function');
    expect(typeof loaded.getProcessDrink()).toBe('function');
    expect(typeof loaded.useGameStore.getState().actions.setState).toBe('function');
    expect((globalThis as any).__zustandStore).toBe(loaded.useGameStore);
    expect(typeof (globalThis as any).startGame).toBe('function');
    expect(typeof (globalThis as any).initGame).toBe('function');
  });
});
