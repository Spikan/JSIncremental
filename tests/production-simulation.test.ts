import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function loadRuntime() {
  const storeModule = await import('../ts/core/state/zustand-store');
  const loopModule = await import('../ts/core/systems/loop-system');
  const drinkModule = await import('../ts/core/systems/drink-system');
  const gameInitModule = await import('../ts/core/systems/game-init');
  const uiModule = await import('../ts/ui/index');

  return {
    ...storeModule,
    ...loopModule,
    ...drinkModule,
    ...gameInitModule,
    ...uiModule,
  };
}

describe('Production Environment Simulation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    (window as any).__TEST_ENV__ = true;
    (window as any).GAME_CONFIG = {
      BAL: { BASE_SIPS_PER_DRINK: 1 },
      TIMING: { DEFAULT_DRINK_RATE: 5000, CLICK_STREAK_WINDOW: 3000 },
    };
    (window as any).Decimal = (globalThis as any).Decimal;

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
      value: vi.fn(() => 1),
    });

    Object.defineProperty(window, 'cancelAnimationFrame', {
      writable: true,
      value: vi.fn(),
    });

    (globalThis as any).requestAnimationFrame = window.requestAnimationFrame;
    (globalThis as any).cancelAnimationFrame = window.cancelAnimationFrame;

    document.body.innerHTML = `
      <div id="gameContent" style="display: none;"></div>
      <button id="sodaButton">Soda</button>
      <div id="topSipValue">0</div>
      <div id="topSipsPerDrink">0</div>
      <div id="topSipsPerSecond">0</div>
      <div id="drinkProgressBar"><div id="drinkProgressFill" style="width: 0%"></div></div>
    `;
  });

  afterEach(async () => {
    try {
      const loopModule = await import('../ts/core/systems/loop-system');
      loopModule.stop();
    } catch {
      // Loop cleanup is best-effort for production simulation tests.
    }
    vi.restoreAllMocks();
  });

  it('loads the production-facing runtime modules without errors', async () => {
    const runtime = await loadRuntime();

    expect(runtime.useGameStore).toBeDefined();
    expect(typeof runtime.start).toBe('function');
    expect(typeof runtime.stop).toBe('function');
    expect(typeof runtime.getProcessDrink).toBe('function');
    expect(typeof runtime.startGameCore).toBe('function');
    expect(typeof runtime.updateTopSipCounter).toBe('function');
  });

  it('runs the loop continuously until stopped', async () => {
    const runtime = await loadRuntime();
    let rafCallCount = 0;

    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      return setTimeout(() => callback(performance.now()), 16) as unknown as number;
    });
    window.cancelAnimationFrame = vi.fn(handle => clearTimeout(handle));
    (globalThis as any).requestAnimationFrame = window.requestAnimationFrame;
    (globalThis as any).cancelAnimationFrame = window.cancelAnimationFrame;

    runtime.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(async () => {}),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    runtime.stop();

    expect(rafCallCount).toBeGreaterThan(3);
  });

  it('processes drinks through the real store-backed drink system', async () => {
    const runtime = await loadRuntime();
    const processDrink = runtime.getProcessDrink();

    runtime.useGameStore.setState({
      sips: new (globalThis as any).Decimal(0),
      totalSipsEarned: new (globalThis as any).Decimal(0),
      highestSipsPerSecond: new (globalThis as any).Decimal(0),
      straws: new (globalThis as any).Decimal(1),
      cups: new (globalThis as any).Decimal(0),
      widerStraws: new (globalThis as any).Decimal(0),
      betterCups: new (globalThis as any).Decimal(0),
      drinkProgress: 0,
      lastDrinkTime: Date.now() - 5000,
      drinkRate: 5000,
    });

    await processDrink();

    const finalState = runtime.useGameStore.getState();
    expect(finalState.sips.toNumber()).toBeGreaterThan(0);
    expect(finalState.totalSipsEarned.toNumber()).toBeGreaterThan(0);
  });

  it('starts the game through the public game-init entrypoint', async () => {
    const runtime = await loadRuntime();

    runtime.stop();
    runtime.startGameCore();

    await new Promise(resolve => setTimeout(resolve, 50));

    expect((window as any).__GAME_STARTED__).toBe(true);
    expect(document.body.classList.contains('game-started')).toBe(true);
    expect((document.getElementById('gameContent') as HTMLElement).style.display).toBe('block');

    runtime.stop();
  });

  it('keeps state mutations accessible through the real store', async () => {
    const runtime = await loadRuntime();

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
