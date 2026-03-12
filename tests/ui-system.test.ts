import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('UI System', () => {
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
        <head><title>UI Test</title></head>
        <body>
          <button id="sodaButton">Soda</button>
          <div id="topSipValue">0</div>
          <div id="topSipsPerDrink">0</div>
          <div id="topSipsPerSecond">0</div>
          <div id="playTime">0s</div>
          <div id="lastSaveTime">never</div>
          <div id="drinkProgressBar"><div id="drinkProgressFill" style="width: 0%"></div></div>
          <button id="buyStraw"><span class="cost"></span></button>
          <div id="strawCost"></div>
          <div id="shopDiv"></div>
          <div id="levelUpDiv"></div>
          <div id="straws">0</div>
          <div id="cups">0</div>
          <div id="widerStraws">0</div>
          <div id="betterCups">0</div>
          <div id="totalPlayTime">0s</div>
          <div id="sessionTime">0s</div>
          <div id="totalClicks">0</div>
          <div id="criticalClicksStats">0</div>
          <div id="clickStreak">0</div>
          <div id="bestClickStreak">0</div>
          <div id="totalSipsEarned">0</div>
          <div id="highestSipsPerSecond">0</div>
          <div id="currentLevel">1</div>
          <div id="totalUpgrades">0</div>
          <div id="fasterDrinksOwned">0</div>
          <div id="strawSPD">0</div>
          <div id="cupSPD">0</div>
          <div id="widerStrawsSPD">0</div>
          <div id="betterCupsSPD">0</div>
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

    (window as any).__TEST_ENV__ = true;
    (window as any).__UI_WIRED__ = false;

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
    } catch {
      // Cleanup is best-effort when modules are reset between tests.
    }

    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
    global.location = originalLocation;
    vi.restoreAllMocks();
  });

  it('exports the expected UI modules and functions', async () => {
    const ui = await import('../ts/ui/index.ts');

    expect(ui.displays).toBeDefined();
    expect(ui.stats).toBeDefined();
    expect(ui.feedback).toBeDefined();
    expect(ui.affordability).toBeDefined();
    expect(typeof ui.updateCostDisplay).toBe('function');
    expect(typeof ui.updateButtonState).toBe('function');
    expect(typeof ui.updateTopSipsPerDrink).toBe('function');
    expect(typeof ui.showClickFeedback).toBe('function');
    expect(typeof ui.checkUpgradeAffordability).toBe('function');
    expect(typeof ui.initializeUI).toBe('function');
  });

  it('updates display and stats elements from store state', async () => {
    const { config } = await import('../ts/config');
    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    const ui = await import('../ts/ui/index.ts');
    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const { toDecimal } = await import('../ts/core/numbers/simplified');

    useGameStore.setState({
      sips: toDecimal(10),
      spd: toDecimal(2),
      highestSipsPerSecond: toDecimal(3),
      totalSipsEarned: toDecimal(50),
      totalPlayTime: 65000,
      totalClicks: 12,
      drinkRate: 1000,
      drinkProgress: 40,
      lastSaveTime: Date.now() - 10_000,
      straws: toDecimal(1),
      cups: toDecimal(0),
      widerStraws: toDecimal(0),
      betterCups: toDecimal(0),
      fasterDrinks: toDecimal(0),
      level: 1,
    });

    ui.updateTopSipCounter();
    ui.updateTopSipsPerDrink();
    ui.updateDrinkProgress();
    ui.updatePlayTime();
    ui.updateAllStats();

    expect(document.getElementById('topSipValue')!.textContent).toBe('10.00');
    expect(document.getElementById('topSipsPerDrink')!.textContent).toBe('2.00');
    expect(document.getElementById('drinkProgressFill')!.style.width).toBe('40%');
    expect(document.getElementById('playTime')!.textContent).toBe('1m 5s');
    expect(document.getElementById('totalSipsEarned')!.textContent).toBe('50.00');
    expect(document.getElementById('highestSipsPerSecond')!.textContent).toBe('3.00');
    expect(document.getElementById('totalClicks')!.textContent).toBe('12.00');
  });

  it('updates affordability displays and button state using the current DOM contract', async () => {
    const ui = await import('../ts/ui/index.ts');
    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const { toDecimal } = await import('../ts/core/numbers/simplified');

    useGameStore.setState({
      sips: toDecimal(1000),
      straws: toDecimal(0),
      cups: toDecimal(0),
      suctions: toDecimal(0),
      fasterDrinks: toDecimal(0),
      widerStraws: toDecimal(0),
      betterCups: toDecimal(0),
      level: 1,
    });

    ui.updateButtonState('buyStraw', true, 25);
    ui.checkUpgradeAffordability();

    const button = document.getElementById('buyStraw') as HTMLButtonElement;
    const costDisplay = document.getElementById('strawCost') as HTMLElement;

    expect(button.disabled).toBe(false);
    expect(button.classList.contains('affordable')).toBe(true);
    expect(costDisplay.textContent).not.toBe('');
  });

  it('renders click and purchase feedback into the document body', async () => {
    const ui = await import('../ts/ui/index.ts');

    ui.showClickFeedback(100, false);
    ui.showPurchaseFeedback('Test Item', 50);

    expect(document.querySelectorAll('.click-feedback').length).toBe(1);
    expect(document.querySelectorAll('.purchase-feedback').length).toBe(1);
    expect(document.body.textContent).toContain('Test Item');
  });

  it('initializes without throwing and exposes safe display update entrypoints', async () => {
    const ui = await import('../ts/ui/index.ts');
    const { config } = await import('../ts/config');

    config.UI.FOUNTAIN_SODA_PROGRESS = false;
    config.UI.SODA_BUTTON_PROGRESS = false;
    config.UI.USE_THREE_SODA_BUTTON = false;

    expect(() => ui.updateAllDisplays()).not.toThrow();
    expect(() => ui.performBatchUIUpdate()).not.toThrow();
    ui.initializeErrorBoundaries();
    expect(typeof (window as any).safeUpdateAllDisplays).toBe('function');
  });
});
