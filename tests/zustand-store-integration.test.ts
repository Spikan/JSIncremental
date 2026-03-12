import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Zustand Store Integration Test', () => {
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
        <head>
          <title>Production Test</title>
        </head>
        <body>
          <div id="sodaButton">Soda Button</div>
          <div id="shopTab">Shop Tab</div>
          <div id="topSipValue">0</div>
          <div id="topSipsPerDrink">1</div>
          <div id="topSipsPerSecond">0</div>
          <div id="drinkProgressBar">
            <div id="drinkProgressFill" style="width: 0%"></div>
          </div>
        </body>
      </html>
    `,
      {
        url: 'https://spikan.github.io/JSIncremental/',
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

    (globalThis as any).GAME_CONFIG = {
      BALANCE: {
        BASE_SIPS_PER_DRINK: 1,
      },
    };
  });

  afterEach(async () => {
    try {
      const { domQuery } = await import('../ts/services/dom-query');
      domQuery.clearCache();
      domQuery.clearTimeouts();
    } catch {
      // Cleanup is best-effort when tests reset modules aggressively.
    }

    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
    global.location = originalLocation;
    vi.clearAllMocks();
  });

  it('updates top-level displays from a properly initialized Zustand store', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    const uiModule = await import('../ts/ui/index');

    useGameStore.setState({
      sips: toDecimal(10),
      spd: toDecimal(2),
      level: 1,
      drinkRate: 1000,
      drinkProgress: 75.5,
      lastDrinkTime: Date.now() - 2000,
      totalClicks: 0,
      totalSipsEarned: toDecimal(10),
      highestSipsPerSecond: toDecimal(0),
      suctionClickBonus: 0,
      options: {
        autosaveEnabled: true,
        autosaveInterval: 30,
        clickSoundsEnabled: true,
        musicEnabled: true,
        devToolsEnabled: false,
        secretsUnlocked: false,
        godTabEnabled: false,
      },
    });

    uiModule.updateTopSipCounter();
    uiModule.updateTopSipsPerDrink();
    uiModule.updateDrinkProgress();

    expect(global.document.getElementById('topSipValue')!.textContent).toBe('10.00');
    expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('2.00');
    expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('75.5%');
  });

  it('writes progress to the modern soda-button overlay when those features are enabled', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = true;
    config.UI.ENABLE_3D_SODA_BUTTON = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const uiModule = await import('../ts/ui/index');

    uiModule.updateDrinkProgress(64.12, 1000);

    const sodaButton = global.document.getElementById('sodaButton') as HTMLElement & {
      __sodaProgress?: { update: (value: number) => void };
    };

    expect(sodaButton.__sodaProgress).toBeTruthy();
    expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('0%');
    expect(sodaButton.querySelector('.soda-progress-label')?.textContent).toBe('FILL 64%');
  });

  it('synchronizes DOM reads after store state changes', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    const uiModule = await import('../ts/ui/index');

    useGameStore.setState({
      sips: toDecimal(0),
      spd: toDecimal(1),
      drinkRate: 1000,
      drinkProgress: 0,
      lastDrinkTime: Date.now() - 2000,
      totalSipsEarned: toDecimal(0),
      highestSipsPerSecond: toDecimal(0),
    });

    uiModule.updateTopSipCounter();
    expect(global.document.getElementById('topSipValue')!.textContent).toBe('0.00');

    useGameStore.setState({
      sips: toDecimal(5),
      spd: toDecimal(2),
      drinkProgress: 50,
      totalSipsEarned: toDecimal(5),
    });

    uiModule.updateTopSipCounter();
    uiModule.updateTopSipsPerDrink();
    uiModule.updateDrinkProgress();

    expect(global.document.getElementById('topSipValue')!.textContent).toBe('5.00');
    expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('2.00');
    expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('50%');
  });

  it('keeps the UI consistent after a real drink cycle', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    const { processDrink } = await import('../ts/core/systems/drink-system');
    const uiModule = await import('../ts/ui/index');

    useGameStore.setState({
      sips: toDecimal(0),
      spd: toDecimal(0),
      level: 1,
      straws: 1,
      cups: 0,
      widerStraws: 0,
      betterCups: 0,
      drinkRate: 1000,
      drinkProgress: 0,
      lastDrinkTime: 0,
      totalClicks: 0,
      totalSipsEarned: toDecimal(0),
      highestSipsPerSecond: toDecimal(0),
      suctionClickBonus: 0,
    });

    await processDrink();
    uiModule.updateTopSipCounter();
    uiModule.updateTopSipsPerDrink();

    expect(global.document.getElementById('topSipValue')!.textContent).toBe('3.00');
    expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('3.00');
  });
});
