import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('UI Update Debug', () => {
  let dom: JSDOM;
  let originalWindow: typeof global.window;
  let originalDocument: typeof global.document;
  let originalNavigator: typeof global.navigator;
  let originalLocation: typeof global.location;

  beforeEach(() => {
    vi.resetModules();

    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="sodaButton">Soda Button</div>
          <div id="drinkProgressBar">
            <div id="drinkProgressFill" style="width: 0%"></div>
          </div>
          <div id="topSipValue">0</div>
          <div id="topSipsPerDrink">0</div>
        </body>
      </html>
    `,
      { url: 'https://spikan.github.io/JSIncremental/' }
    );

    originalWindow = global.window;
    originalDocument = global.document;
    originalNavigator = global.navigator;
    originalLocation = global.location;

    global.window = dom.window as any;
    global.document = dom.window.document as any;
    global.navigator = dom.window.navigator as any;
    global.location = dom.window.location as any;
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
    vi.clearAllMocks();
  });

  it('updates the current top-level UI elements from store state', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const { toDecimal } = await import('../ts/core/numbers/simplified');
    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const uiModule = await import('../ts/ui/index');

    useGameStore.setState({
      sips: toDecimal(10),
      spd: toDecimal(2),
      drinkProgress: 75.5,
      drinkRate: 1000,
    });

    uiModule.updateTopSipCounter();
    uiModule.updateTopSipsPerDrink();
    uiModule.updateDrinkProgress();

    expect(global.document.getElementById('topSipValue')!.textContent).toBe('10.00');
    expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('2.00');
    expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('75.5%');
  });

  it('processDrinkFactory updates store-shaped state through the injected setter', async () => {
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    const { processDrinkFactory } = await import('../ts/core/systems/drink-system');

    const mockSetState = vi.fn();
    const processDrink = processDrinkFactory({
      getNow: () => 2000,
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
      setState: mockSetState,
    });

    await processDrink();

    expect(mockSetState).toHaveBeenCalledWith(
      expect.objectContaining({
        spd: expect.objectContaining({ toString: expect.any(Function) }),
      })
    );
    expect(mockSetState).toHaveBeenCalledWith(
      expect.objectContaining({
        sips: expect.objectContaining({ toString: expect.any(Function) }),
        totalSipsEarned: expect.objectContaining({ toString: expect.any(Function) }),
        lastDrinkTime: 2000,
        drinkProgress: 0,
      })
    );
  });

  it('keeps the UI in sync after a real drink cycle with the current store contract', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const { toDecimal } = await import('../ts/core/numbers/simplified');
    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const { processDrink } = await import('../ts/core/systems/drink-system');
    const uiModule = await import('../ts/ui/index');

    useGameStore.setState({
      sips: toDecimal(0),
      spd: toDecimal(0),
      totalSipsEarned: toDecimal(0),
      highestSipsPerSecond: toDecimal(0),
      straws: 1,
      cups: 0,
      widerStraws: 0,
      betterCups: 0,
      drinkRate: 1000,
      drinkProgress: 50,
      lastDrinkTime: 0,
    });

    await processDrink();
    uiModule.updateTopSipCounter();
    uiModule.updateTopSipsPerDrink();

    expect(global.document.getElementById('topSipValue')!.textContent).toBe('3.00');
    expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('3.00');
  });
});
