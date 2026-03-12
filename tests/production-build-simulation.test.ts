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
  const gameInitModule = await import('../ts/core/systems/game-init');

  runtime = {
    indexModule,
    ...loopModule,
    ...drinkModule,
    ...storeModule,
    ...gameInitModule,
  };

  return runtime;
}

describe('Production Build Simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NODE_ENV = 'production';
    process.env.VITE_APP_ENV = 'production';

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
      TIMING: { DEFAULT_DRINK_RATE: 5000, CLICK_STREAK_WINDOW: 3000 },
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

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
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

  it('should simulate production build process', async () => {
    const startTime = Date.now();
    const loaded = await loadRuntime();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(10000);
    expect(loaded.indexModule).toBeDefined();
    expect(typeof loaded.start).toBe('function');
    expect(typeof loaded.useGameStore.getState).toBe('function');
    expect((globalThis as any).__zustandStore).toBe(loaded.useGameStore);
  });

  it('should complete runtime import without timing out in production mode', async () => {
    let importTimedOut = false;

    const loaded = await Promise.race([
      loadRuntime(),
      new Promise<never>((_, reject) =>
        setTimeout(() => {
          importTimedOut = true;
          reject(new Error('Import timeout detected'));
        }, 1000)
      ),
    ]);

    expect(importTimedOut).toBe(false);
    expect(loaded.indexModule).toBeDefined();
  });

  it('should verify game loop starts and runs continuously', async () => {
    const loaded = await loadRuntime();
    let rafCallCount = 0;
    const rafTimes: number[] = [];
    let lastRafTime = 0;

    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      const now = Date.now();
      if (lastRafTime > 0) {
        rafTimes.push(now - lastRafTime);
      }
      lastRafTime = now;
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
      processDrink: vi.fn(async () => {}),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    loaded.stop();

    expect(rafCallCount).toBeGreaterThan(5);
    const avgFrameTime = rafTimes.reduce((a, b) => a + b, 0) / rafTimes.length;
    expect(avgFrameTime).toBeLessThan(50);
  });

  it('should verify drink system processes correctly', async () => {
    const loaded = await loadRuntime();
    const processDrink = loaded.getProcessDrink();

    loaded.useGameStore.setState({
      sips: new (globalThis as any).Decimal(0),
      totalSipsEarned: new (globalThis as any).Decimal(0),
      straws: new (globalThis as any).Decimal(0),
      cups: new (globalThis as any).Decimal(0),
      widerStraws: new (globalThis as any).Decimal(0),
      betterCups: new (globalThis as any).Decimal(0),
      drinkProgress: 100,
      lastDrinkTime: Date.now() - 5000,
      drinkRate: 5000,
    });

    await processDrink();

    const finalState = loaded.useGameStore.getState();
    expect(finalState.sips.toNumber()).toBeGreaterThan(0);
    expect(finalState.totalSipsEarned.toNumber()).toBeGreaterThan(0);
  });

  it('should handle sparse production DOM gracefully', async () => {
    const loaded = await loadRuntime();

    expect(() => {
      loaded.startGameCore();
    }).not.toThrow();

    await new Promise(resolve => setTimeout(resolve, 50));
    loaded.stop();

    expect((window as any).__GAME_STARTED__).toBe(true);
  });
});
