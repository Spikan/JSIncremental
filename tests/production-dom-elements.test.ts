import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import Decimal from 'break_eternity.js';

const { mockStore } = vi.hoisted(() => ({
  mockStore: {
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

vi.mock('../ts/services/dom-query', () => ({
  domQuery: {
    getById: (id: string) => document.getElementById(id),
    exists: (selector: string) => document.querySelector(selector) !== null,
  },
}));

vi.mock('../ts/services/ui-batcher', () => ({
  uiBatcher: {
    schedule: (_key: string, callback: () => void) => callback(),
  },
}));

vi.mock('../ts/ui/fountain-progress', () => ({
  isFountainEnabled: () => false,
  createFountainProgress: vi.fn(),
}));

vi.mock('../ts/ui/soda-button-progress', () => ({
  isSodaButtonProgressEnabled: () => false,
  createSodaButtonProgress: vi.fn(),
}));

vi.mock('../ts/ui/soda-3d-three', () => ({
  isThreeSodaEnabled: () => false,
  createThreeSodaButton: vi.fn(),
}));

vi.mock('../ts/core/state/zustand-store', () => ({
  useGameStore: mockStore,
  getDisplayData: () => {
    const state = mockStore.getState();
    return {
      sips: state.sips,
      spd: state.spd,
      level: state.level,
      drinkRate: state.drinkRate,
      drinkProgress: state.drinkProgress,
      totalClicks: state.totalClicks,
      totalSipsEarned: state.totalSipsEarned,
      suctionClickBonus: state.suctionClickBonus,
      options: state.options,
    };
  },
  getGameData: () => {
    const state = mockStore.getState();
    return {
      sips: state.sips,
      spd: state.spd,
      level: state.level,
      drinkRate: state.drinkRate,
      drinkProgress: state.drinkProgress,
      lastDrinkTime: state.lastDrinkTime ?? 0,
    };
  },
  getOptionsData: () => mockStore.getState().options,
  getCostCalculationData: () => {
    const state = mockStore.getState();
    return {
      straws: state.straws ?? new Decimal(0),
      cups: state.cups ?? new Decimal(0),
      suctions: state.suctions ?? new Decimal(0),
      widerStraws: state.widerStraws ?? new Decimal(0),
      betterCups: state.betterCups ?? new Decimal(0),
      fasterDrinks: state.fasterDrinks ?? new Decimal(0),
      level: state.level ?? new Decimal(1),
    };
  },
}));

describe('Production DOM Elements Test', () => {
  let dom: JSDOM;
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    vi.resetModules();
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
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
      { url: 'https://spikan.github.io/JSIncremental/' }
    );

    originalWindow = global.window;
    originalDocument = global.document;

    global.window = dom.window as any;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator as any;
    global.location = dom.window.location as any;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should test UI update functions with current formatting and DOM elements', async () => {
    mockStore.getState.mockReturnValue({
      sips: new Decimal(10),
      spd: new Decimal(2),
      drinkRate: 1000,
      drinkProgress: 75.5,
      level: new Decimal(1),
      totalClicks: 0,
      totalSipsEarned: new Decimal(0),
      suctionClickBonus: new Decimal(0),
      options: { autosaveEnabled: true, autosaveInterval: 30 },
    });

    const uiModule = await import('../ts/ui/index');

    uiModule.updateTopSipCounter();
    expect(global.document.getElementById('topSipValue')!.textContent).toBe('10.00');

    uiModule.updateTopSipsPerDrink();
    expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('2.00');

    uiModule.updateTopSipsPerSecond();
    expect(global.document.getElementById('topSipsPerSecond')!.textContent).toBe('2.00');

    uiModule.updateDrinkProgress();
    expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('75.5%');
  });

  it('should test the complete UI update flow with store-backed data', async () => {
    mockStore.getState.mockReturnValue({
      sips: new Decimal(25),
      spd: new Decimal(3),
      drinkRate: 1200,
      drinkProgress: 60.0,
      level: new Decimal(1),
      totalClicks: 0,
      totalSipsEarned: new Decimal(0),
      suctionClickBonus: new Decimal(0),
      options: { autosaveEnabled: true, autosaveInterval: 30 },
    });

    const uiModule = await import('../ts/ui/index');
    uiModule.updateAllDisplays();

    expect(global.document.getElementById('topSipValue')!.textContent).toBe('25.00');
    expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('3.00');
    expect(global.document.getElementById('topSipsPerSecond')!.textContent).toBe('2.50');
    expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('0%');
  });

  it('should test the exact production scenario against current display formatting', async () => {
    mockStore.getState.mockReturnValue({
      sips: new Decimal(1),
      spd: new Decimal(1),
      drinkRate: 5000,
      drinkProgress: 64.12,
      level: new Decimal(1),
      totalClicks: 0,
      totalSipsEarned: new Decimal(0),
      suctionClickBonus: new Decimal(0),
      options: { autosaveEnabled: true, autosaveInterval: 30 },
    });

    const uiModule = await import('../ts/ui/index');

    uiModule.updateTopSipCounter();
    expect(global.document.getElementById('topSipValue')!.textContent).toBe('1.00');

    uiModule.updateTopSipsPerDrink();
    expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('1.00');

    uiModule.updateTopSipsPerSecond();
    expect(global.document.getElementById('topSipsPerSecond')!.textContent).toBe('0.20');

    uiModule.updateAllDisplays();
    uiModule.updateDrinkProgress();
    expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('64.12%');
  });
});
