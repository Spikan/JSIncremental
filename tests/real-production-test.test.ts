import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function loadRealRuntime() {
  const indexModule = await import('../ts/index.ts');
  const storeModule = await import('../ts/core/state/zustand-store');
  const loopModule = await import('../ts/core/systems/loop-system');
  const drinkModule = await import('../ts/core/systems/drink-system');
  const clicksModule = await import('../ts/core/systems/clicks-system');
  const gameInitModule = await import('../ts/core/systems/game-init');

  return {
    indexModule,
    ...storeModule,
    ...loopModule,
    ...drinkModule,
    ...clicksModule,
    ...gameInitModule,
  };
}

describe('Real Production Build Test', () => {
  beforeEach(() => {
    vi.resetModules();
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

    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: vi.fn(
        callback => setTimeout(() => callback(performance.now()), 16) as unknown as number
      ),
    });

    Object.defineProperty(window, 'cancelAnimationFrame', {
      writable: true,
      value: vi.fn(handle => clearTimeout(handle)),
    });

    global.fetch = vi.fn().mockImplementation(url => {
      if (String(url).includes('word_bank.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['test', 'word', 'bank', 'data']),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as any;

    localStorage.clear();
    sessionStorage.clear();

    document.body.innerHTML = `
      <div id="splashScreen" style="display: block;"></div>
      <div id="gameContent" style="display: none;"></div>
      <button id="sodaButton">Soda</button>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should actually load the real ts/index.ts module without errors', async () => {
    const startTime = Date.now();
    const runtime = await loadRealRuntime();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(10000);
    expect(runtime.indexModule).toBeDefined();
  });

  it('should initialize the real store-backed runtime surface', async () => {
    const runtime = await loadRealRuntime();

    expect(runtime.useGameStore).toBeDefined();
    expect(typeof runtime.useGameStore.getState).toBe('function');
    expect(typeof runtime.useGameStore.setState).toBe('function');
    expect((globalThis as any).__zustandStore).toBe(runtime.useGameStore);
    expect(typeof (globalThis as any).startGame).toBe('function');
    expect(typeof (globalThis as any).initGame).toBe('function');

    const state = runtime.useGameStore.getState();
    expect(state).toBeDefined();
    expect(state.sips).toBeDefined();
    expect(state.actions).toBeDefined();
    expect(typeof state.actions.setState).toBe('function');
  });

  it('should run the real loop system continuously until stopped', async () => {
    const runtime = await loadRealRuntime();
    const originalRAF = window.requestAnimationFrame;
    const originalCancelRAF = window.cancelAnimationFrame;
    let rafCallCount = 0;

    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      return setTimeout(() => callback(performance.now()), 16) as unknown as number;
    });
    window.cancelAnimationFrame = vi.fn(handle => clearTimeout(handle));

    runtime.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(async () => {}),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    runtime.stop();

    expect(rafCallCount).toBeGreaterThan(3);

    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCancelRAF;
  });

  it('should process drinks with the real store and drink system', async () => {
    const runtime = await loadRealRuntime();
    const processDrink = runtime.getProcessDrink();

    runtime.useGameStore.setState({
      sips: new (globalThis as any).Decimal(0),
      totalSipsEarned: new (globalThis as any).Decimal(0),
      straws: new (globalThis as any).Decimal(0),
      cups: new (globalThis as any).Decimal(0),
      widerStraws: new (globalThis as any).Decimal(0),
      betterCups: new (globalThis as any).Decimal(0),
      drinkProgress: 0,
      lastDrinkTime: Date.now() - 5000,
      drinkRate: 5000,
    });

    await processDrink();

    const finalState = runtime.useGameStore.getState();
    expect(finalState.sips).toBeDefined();
    expect(finalState.sips.toNumber()).toBeGreaterThan(0);
    expect(finalState.totalSipsEarned.toNumber()).toBeGreaterThan(0);
  });

  it('should handle real soda clicks through the click system', async () => {
    const runtime = await loadRealRuntime();
    const handleSodaClick = runtime.handleSodaClickFactory({
      trackClick: runtime.trackClickFactory(),
    });

    runtime.useGameStore.setState({
      sips: new (globalThis as any).Decimal(0),
      totalClicks: 0,
      totalSipsEarned: new (globalThis as any).Decimal(0),
      suctionClickBonus: new (globalThis as any).Decimal(0),
    });

    await handleSodaClick(1);

    const finalState = runtime.useGameStore.getState();
    expect(finalState.sips.toNumber()).toBeGreaterThan(0);
    expect(Number(finalState.totalClicks)).toBeGreaterThan(0);
    expect(finalState.totalSipsEarned.toNumber()).toBeGreaterThan(0);
  });

  it('should expose a working startGame entrypoint', async () => {
    const runtime = await loadRealRuntime();

    runtime.stop();
    runtime.startGameCore();

    await new Promise(resolve => setTimeout(resolve, 50));

    expect((window as any).__GAME_STARTED__).toBe(true);
    expect(document.body.classList.contains('game-started')).toBe(true);
    expect((document.getElementById('gameContent') as HTMLElement).style.display).toBe('block');

    runtime.stop();
  });

  it('should keep real state updates accessible through the store', async () => {
    const runtime = await loadRealRuntime();

    runtime.useGameStore.getState().actions.setState({
      sips: new (globalThis as any).Decimal(100),
      drinkProgress: 50,
      lastDrinkTime: Date.now() - 2500,
      drinkRate: 5000,
    });

    const state = runtime.useGameStore.getState();
    expect(state.sips.toNumber()).toBe(100);
    expect(state.drinkProgress).toBe(50);
    expect(state.drinkRate).toBe(5000);
  });
});
