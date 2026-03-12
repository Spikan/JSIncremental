import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Production UI Update Issue Reproduction', () => {
  let dom: JSDOM;
  let originalWindow: typeof global.window;
  let originalDocument: typeof global.document;
  let originalNavigator: typeof global.navigator;
  let originalLocation: typeof global.location;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Production Test</title></head>
        <body>
          <div id="sodaButton">Soda Button</div>
          <div id="topSipValue">0</div>
          <div id="topSipsPerDrink">1</div>
          <div id="topSipsPerSecond">0</div>
          <div id="drinkProgressBar">
            <div id="drinkProgressFill" style="width: 0%"></div>
          </div>
          <div id="shopDiv"></div>
        </body>
      </html>
    `,
      {
        url: 'https://spikan.github.io/JSIncremental/',
        referrer: 'https://github.com/Spikan/JSIncremental',
      }
    );

    originalWindow = global.window;
    originalDocument = global.document;
    originalNavigator = global.navigator;
    originalLocation = global.location;

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

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(['test', 'word', 'bank']),
    }) as any;
  });

  afterEach(async () => {
    try {
      const { domQuery } = await import('../ts/services/dom-query');
      domQuery.clearCache();
      domQuery.clearTimeouts();
    } catch {}

    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
    global.location = originalLocation;
    vi.restoreAllMocks();
  });

  it('updates the production-facing top counters from the store-backed UI module', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const uiModule = await import('../ts/ui/index');
    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const { toDecimal } = await import('../ts/core/numbers/simplified');

    useGameStore.setState({
      sips: toDecimal(5),
      spd: toDecimal(2),
      drinkRate: 1000,
      drinkProgress: 75.5,
    });

    uiModule.updateTopSipCounter();
    uiModule.updateTopSipsPerDrink();
    uiModule.updateTopSipsPerSecond();
    uiModule.updateDrinkProgress();

    expect(document.getElementById('topSipValue')!.textContent).toBe('5.00');
    expect(document.getElementById('topSipsPerDrink')!.textContent).toBe('2.00');
    expect(document.getElementById('topSipsPerSecond')!.textContent).toBe('2.00');
    expect(document.getElementById('drinkProgressFill')!.style.width).toBe('75.5%');
  });

  it('updates all displays through the current coordinator entrypoint', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const uiModule = await import('../ts/ui/index');
    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const { toDecimal } = await import('../ts/core/numbers/simplified');

    useGameStore.setState({
      sips: toDecimal(10),
      spd: toDecimal(2),
      drinkRate: 1000,
      drinkProgress: 50,
      totalPlayTime: 0,
      totalSipsEarned: toDecimal(10),
      highestSipsPerSecond: toDecimal(2),
    });

    uiModule.updateAllDisplays();
    await new Promise(resolve => setTimeout(resolve, 25));

    expect(document.getElementById('topSipValue')!.textContent).toBe('10.00');
    expect(document.getElementById('topSipsPerDrink')!.textContent).toBe('2.00');
  });

  it('processes a drink through the current injected drink-system seam', async () => {
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    const { processDrinkFactory } = await import('../ts/core/systems/drink-system');

    const setState = vi.fn();
    const processDrink = processDrinkFactory({
      getNow: () => 2_000,
      getState: () => ({
        sips: toDecimal(0),
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

    await expect(processDrink()).resolves.toBeUndefined();
    expect(setState).toHaveBeenCalled();
  });

  it('handles state-access errors gracefully in updateTopSipCounter', async () => {
    const uiModule = await import('../ts/ui/index');
    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const getStateSpy = vi.spyOn(useGameStore, 'getState').mockImplementation(() => {
      throw new Error('State access error');
    });

    expect(() => uiModule.updateTopSipCounter()).not.toThrow();

    getStateSpy.mockRestore();
  });
});
