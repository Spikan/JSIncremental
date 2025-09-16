import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Test that properly sets up the Zustand store to reproduce the production issue
describe('Zustand Store Integration Test', () => {
  let dom: JSDOM;
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    // Create the exact DOM structure from production
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

    global.window = dom.window as any;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator as any;
    global.location = dom.window.location as any;

    // Set up GAME_CONFIG for the drink system
    (globalThis as any).GAME_CONFIG = {
      BALANCE: {
        BASE_SIPS_PER_DRINK: 1,
      },
    };
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.clearAllMocks();
  });

  it('should test UI updates with properly initialized Zustand store', async () => {
    // Import the Zustand store
    const { useGameStore } = await import('../ts/core/state/zustand-store');

    // Set up the store with test data using real Decimal objects
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    useGameStore.setState({
      sips: toDecimal(10),
      spd: toDecimal(2),
      level: 1,
      drinkRate: 1000,
      drinkProgress: 75.5,
      lastDrinkTime: Date.now() - 2000, // Set to 2 seconds ago so drinks can process immediately
      totalClicks: 0,
      totalSipsEarned: toDecimal(10),
      highestSipsPerSecond: toDecimal(0),
      suctionClickBonus: 0,
      lastAutosaveClockMs: Date.now(),
      options: {
        autosaveEnabled: true,
        autosaveInterval: 30,
      },
    });

    // Import the UI module
    const uiModule = await import('../ts/ui/index');

    // Test updateTopSipCounter
    if (uiModule.updateTopSipCounter) {
      const topSipValue = global.document.getElementById('topSipValue');
      expect(topSipValue).toBeTruthy();

      uiModule.updateTopSipCounter();
      expect(topSipValue!.textContent).toBe('10');
    }

    // Test updateTopSipsPerDrink
    if (uiModule.updateTopSipsPerDrink) {
      const topSipsPerDrink = global.document.getElementById('topSipsPerDrink');
      expect(topSipsPerDrink).toBeTruthy();

      uiModule.updateTopSipsPerDrink();
      expect(topSipsPerDrink!.textContent).toBe('2');
    }

    // Test updateDrinkProgress
    if (uiModule.updateDrinkProgress) {
      const drinkProgressFill = global.document.getElementById('drinkProgressFill');
      expect(drinkProgressFill).toBeTruthy();

      uiModule.updateDrinkProgress();
      expect(drinkProgressFill!.style.width).toBe('75.5%');
    }
  });

  it('should test the exact production scenario with Zustand store', async () => {
    // This test simulates the exact scenario from the production logs
    console.log('Testing exact production scenario with Zustand store...');

    // Import the Zustand store
    const { useGameStore } = await import('../ts/core/state/zustand-store');

    // Set up the store with the exact state from production logs using real Decimal objects
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    useGameStore.setState({
      sips: toDecimal(1), // This was stuck at 1 in production
      spd: toDecimal(1),
      level: 1,
      drinkRate: 1000,
      drinkProgress: 64.12,
      lastDrinkTime: Date.now() - 2000, // Set to 2 seconds ago so drinks can process immediately
      totalClicks: 0,
      totalSipsEarned: toDecimal(1),
      highestSipsPerSecond: toDecimal(0),
      suctionClickBonus: 0,
      lastAutosaveClockMs: Date.now(),
      options: {
        autosaveEnabled: true,
        autosaveInterval: 30,
      },
    });

    // Import the UI module
    const uiModule = await import('../ts/ui/index');

    // Test the exact UI update calls from production
    console.log('Calling updateTopSipCounter...');
    if (uiModule.updateTopSipCounter) {
      const topSipValue = global.document.getElementById('topSipValue');
      uiModule.updateTopSipCounter();
      expect(topSipValue!.textContent).toBe('1');
    }

    console.log('Calling updateTopSipsPerDrink...');
    if (uiModule.updateTopSipsPerDrink) {
      const topSipsPerDrink = global.document.getElementById('topSipsPerDrink');
      uiModule.updateTopSipsPerDrink();
      expect(topSipsPerDrink!.textContent).toBe('1');
    }

    console.log('Calling updateDrinkProgress...');
    if (uiModule.updateDrinkProgress) {
      const drinkProgressFill = global.document.getElementById('drinkProgressFill');
      uiModule.updateDrinkProgress();
      expect(drinkProgressFill!.style.width).toBe('64.12%');
    }

    console.log('Production scenario test completed');
  });

  it('should test state updates and UI synchronization', async () => {
    // Import the Zustand store
    const { useGameStore } = await import('../ts/core/state/zustand-store');

    // Import the UI module
    const uiModule = await import('../ts/ui/index');

    // Start with initial state using real Decimal objects
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    useGameStore.setState({
      sips: toDecimal(0),
      spd: toDecimal(1),
      level: 1,
      drinkRate: 1000,
      drinkProgress: 0,
      lastDrinkTime: Date.now() - 2000, // Set to 2 seconds ago so drinks can process immediately
      totalClicks: 0,
      totalSipsEarned: toDecimal(0),
      highestSipsPerSecond: toDecimal(0),
      suctionClickBonus: 0,
      lastAutosaveClockMs: Date.now(),
      options: {
        autosaveEnabled: true,
        autosaveInterval: 30,
      },
    });

    // Test initial state
    if (uiModule.updateTopSipCounter) {
      uiModule.updateTopSipCounter();
      expect(global.document.getElementById('topSipValue')!.textContent).toBe('0');
    }

    // Update state
    useGameStore.setState({
      sips: { toString: () => '5' },
      spd: { toString: () => '2' },
      level: 1,
      drinkRate: 1000,
      drinkProgress: 50.0,
      totalClicks: 0,
      totalSipsEarned: { toString: () => '5' },
      suctionClickBonus: 0,
      options: {
        autosaveEnabled: true,
        autosaveInterval: 30,
      },
    });

    // Test updated state
    if (uiModule.updateTopSipCounter) {
      uiModule.updateTopSipCounter();
      expect(global.document.getElementById('topSipValue')!.textContent).toBe('5');
    }

    if (uiModule.updateTopSipsPerDrink) {
      uiModule.updateTopSipsPerDrink();
      expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('2');
    }

    if (uiModule.updateDrinkProgress) {
      uiModule.updateDrinkProgress();
      expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('50%');
    }
  });

  it('should test the complete flow with drink system and UI updates', async () => {
    // This test simulates the complete flow from the production logs

    // Import modules
    const { useGameStore } = await import('../ts/core/state/zustand-store');
    const uiModule = await import('../ts/ui/index');

    // Set up initial state using real Decimal objects
    const { toDecimal } = await import('../ts/core/numbers/simplified');
    useGameStore.setState({
      sips: toDecimal(0),
      spd: toDecimal(1),
      level: 1,
      drinkRate: 1000,
      drinkProgress: 0,
      lastDrinkTime: Date.now() - 2000, // Set to 2 seconds ago so drinks can process immediately
      totalClicks: 0,
      totalSipsEarned: toDecimal(0),
      highestSipsPerSecond: toDecimal(0),
      suctionClickBonus: 0,
      lastAutosaveClockMs: Date.now(),
      options: {
        autosaveEnabled: true,
        autosaveInterval: 30,
      },
    });

    // Import the modernized drink system
    const { processDrink } = await import('../ts/core/systems/drink-system');

    // Test the complete flow
    console.log('Testing complete flow...');

    // Process drink
    processDrink();

    // Update UI
    if (uiModule.updateTopSipCounter) {
      uiModule.updateTopSipCounter();
      expect(global.document.getElementById('topSipValue')!.textContent).toBe('1');
    }

    console.log('Complete flow test passed');
  });
});
