import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

async function setupEnvironment(url: string) {
  vi.resetModules();

  const dom = new JSDOM(
    `
    <!DOCTYPE html>
    <html>
      <body>
        <div id="sodaButton">Soda Button</div>
        <div id="topSipValue">0</div>
        <div id="topSipsPerDrink">0</div>
        <div id="drinkProgressBar"><div id="drinkProgressFill" style="width: 0%"></div></div>
      </body>
    </html>
  `,
    { url }
  );

  global.window = dom.window as any;
  global.document = dom.window.document as any;
  global.navigator = dom.window.navigator as any;
  global.location = dom.window.location as any;

  (window as any).__TEST_ENV__ = true;

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

  const raf = vi.fn(
    (callback: FrameRequestCallback) =>
      setTimeout(() => callback(performance.now()), 16) as unknown as number
  );
  const caf = vi.fn((handle: number) => clearTimeout(handle));
  Object.defineProperty(window, 'requestAnimationFrame', { writable: true, value: raf });
  Object.defineProperty(window, 'cancelAnimationFrame', { writable: true, value: caf });
  (globalThis as any).requestAnimationFrame = raf;
  (globalThis as any).cancelAnimationFrame = caf;

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ words: ['test', 'word', 'bank'] }),
  }) as any;

  const { config } = await import('../ts/config');
  config.UI.FOUNTAIN_SODA_PROGRESS = false;
  config.UI.SODA_BUTTON_PROGRESS = false;
  config.UI.USE_THREE_SODA_BUTTON = false;

  return dom;
}

describe('Dev vs Production Differences', () => {
  let originalWindow: any;
  let originalDocument: any;
  let originalNavigator: any;
  let originalLocation: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    originalNavigator = global.navigator;
    originalLocation = global.location;
  });

  afterEach(async () => {
    try {
      const { domQuery } = await import('../ts/services/dom-query');
      domQuery.clearCache();
      domQuery.clearTimeouts();
    } catch {
      // Cleanup is best-effort in these environment-switch tests.
    }
    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
    global.location = originalLocation;
    vi.restoreAllMocks();
  });

  it('detects development and production URLs correctly', async () => {
    const devDom = await setupEnvironment('http://localhost:5173/');
    expect(devDom.window.location.hostname).toBe('localhost');

    const prodDom = await setupEnvironment('https://spikan.github.io/JSIncremental/');
    expect(prodDom.window.location.hostname).toBe('spikan.github.io');
    expect(prodDom.window.location.protocol).toBe('https:');
  });

  it('loads the same core modules in both environments', async () => {
    await setupEnvironment('http://localhost:5173/');
    const devDrink = await import('../ts/core/systems/drink-system');
    const devUI = await import('../ts/ui/index');

    await setupEnvironment('https://spikan.github.io/JSIncremental/');
    const prodDrink = await import('../ts/core/systems/drink-system');
    const prodUI = await import('../ts/ui/index');

    expect(typeof devDrink.processDrinkFactory).toBe('function');
    expect(typeof prodDrink.processDrinkFactory).toBe('function');
    expect(typeof devUI.updateAllDisplays).toBe('function');
    expect(typeof prodUI.updateAllDisplays).toBe('function');
  });

  it('updates the current UI contract consistently in both environments', async () => {
    const { toDecimal } = await import('../ts/core/numbers/simplified');

    for (const url of ['http://localhost:5173/', 'https://spikan.github.io/JSIncremental/']) {
      await setupEnvironment(url);
      const { useGameStore } = await import('../ts/core/state/zustand-store');
      const uiModule = await import('../ts/ui/index');

      useGameStore.setState({
        sips: toDecimal(5),
        spd: toDecimal(2),
        drinkProgress: 75.5,
        drinkRate: 1000,
      });

      uiModule.updateTopSipCounter();
      uiModule.updateDrinkProgress();

      expect(document.getElementById('topSipValue')!.textContent).toBe('5.00');
      expect(document.getElementById('drinkProgressFill')!.style.width).toBe('75.5%');
    }
  });

  it('runs requestAnimationFrame in both environments without deprecated done callbacks', async () => {
    const devDom = await setupEnvironment('http://localhost:5173/');
    await new Promise<void>(resolve => {
      devDom.window.requestAnimationFrame(() => resolve());
    });

    const prodDom = await setupEnvironment('https://spikan.github.io/JSIncremental/');
    await new Promise<void>(resolve => {
      prodDom.window.requestAnimationFrame(() => resolve());
    });
  });

  it('uses the same store shape in both environments', async () => {
    await setupEnvironment('http://localhost:5173/');
    const devStore = (await import('../ts/core/state/zustand-store')).useGameStore.getState();

    await setupEnvironment('https://spikan.github.io/JSIncremental/');
    const prodStore = (await import('../ts/core/state/zustand-store')).useGameStore.getState();

    expect(devStore.sips).toBeDefined();
    expect(prodStore.sips).toBeDefined();
    expect(['object', 'string', 'number']).toContain(typeof devStore.sips);
    expect(['object', 'string', 'number']).toContain(typeof prodStore.sips);
    expect(typeof devStore.actions.setState).toBe('function');
    expect(typeof prodStore.actions.setState).toBe('function');
  });

  it('reproduces the old drink-path symptom using the current injected processDrink seam', async () => {
    await setupEnvironment('https://spikan.github.io/JSIncremental/');
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    const { processDrinkFactory } = await import('../ts/core/systems/drink-system');

    const setState = vi.fn();
    const processDrink = processDrinkFactory({
      getNow: () => 2_000,
      getState: () => ({
        sips: toDecimal(1),
        totalSipsEarned: toDecimal(0),
        highestSipsPerSecond: toDecimal(0),
        straws: 1,
        cups: 0,
        widerStraws: 0,
        betterCups: 0,
        drinkRate: 1000,
        lastDrinkTime: 0,
      }),
      setState,
    });

    await processDrink();

    expect(setState).toHaveBeenCalledWith(
      expect.objectContaining({
        sips: expect.objectContaining({ toString: expect.any(Function) }),
      })
    );
  });
});
