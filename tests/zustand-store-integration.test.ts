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

    // Import the UI module
    const uiModule = await import('../ts/ui/index');

    // Test updateTopSipCounter
    if (uiModule.updateTopSipCounter) {
      const topSipValue = global.document.getElementById('topSipValue');
      expect(topSipValue).toBeTruthy();

      uiModule.updateTopSipCounter();
      expect(topSipValue!.textContent).toBe('10.00');
    }

    // Test updateTopSipsPerDrink
    if (uiModule.updateTopSipsPerDrink) {
      const topSipsPerDrink = global.document.getElementById('topSipsPerDrink');
      expect(topSipsPerDrink).toBeTruthy();

      uiModule.updateTopSipsPerDrink();
      expect(topSipsPerDrink!.textContent).toBe('2.00');
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

    // Import the UI module and domQuery
    const uiModule = await import('../ts/ui/index');
    const { domQuery } = await import('../ts/services/dom-query');

    // Test the exact UI update calls from production
    console.log('Calling updateTopSipCounter...');
    if (uiModule.updateTopSipCounter) {
      console.log(
        '🔧 Before updateTopSipCounter - element textContent:',
        domQuery.getById('topSipValue')?.textContent
      );
      uiModule.updateTopSipCounter();
      const topSipValue = domQuery.getById('topSipValue');
      console.log('🔧 After updateTopSipCounter - element textContent:', topSipValue?.textContent);

      // Check if there are multiple elements with the same ID
      const allTopSipElements = global.document.querySelectorAll('#topSipValue');
      console.log('🔧 Number of elements with ID topSipValue:', allTopSipElements.length);
      allTopSipElements.forEach((el, index) => {
        console.log(`🔧 Element ${index}:`, el.textContent);
        console.log(`🔧 Element ${index} isSameNode:`, el === topSipValue);
      });

      // Check if the element we got is the same as the one the function updated
      console.log('🔧 topSipValue element reference:', topSipValue);
      console.log('🔧 topSipValue === allTopSipElements[0]:', topSipValue === allTopSipElements[0]);

      expect(topSipValue!.textContent).toBe('1.00');
    }

    console.log('Calling updateTopSipsPerDrink...');
    if (uiModule.updateTopSipsPerDrink) {
      const topSipsPerDrink = domQuery.getById('topSipsPerDrink');
      uiModule.updateTopSipsPerDrink();
      expect(topSipsPerDrink!.textContent).toBe('1.00');
    }

    console.log('Calling updateDrinkProgress...');
    if (uiModule.updateDrinkProgress) {
      const drinkProgressFill = domQuery.getById('drinkProgressFill');
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

    // Import domQuery for consistent element access
    const { domQuery } = await import('../ts/services/dom-query');

    // Test initial state
    if (uiModule.updateTopSipCounter) {
      console.log(
        '🔧 Before updateTopSipCounter - element textContent:',
        domQuery.getById('topSipValue')?.textContent
      );
      uiModule.updateTopSipCounter();
      const topSipValue = domQuery.getById('topSipValue');
      console.log('🔧 After updateTopSipCounter - element textContent:', topSipValue?.textContent);
      expect(topSipValue!.textContent).toBe('0.00');
    }

    // Update state with real Decimal objects
    useGameStore.setState({
      sips: toDecimal(5),
      spd: toDecimal(2),
      level: 1,
      drinkRate: 1000,
      drinkProgress: 50.0,
      totalClicks: 0,
      totalSipsEarned: toDecimal(5),
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

    // Test updated state
    if (uiModule.updateTopSipCounter) {
      console.log(
        '🔧 Before updateTopSipCounter - element textContent:',
        domQuery.getById('topSipValue')?.textContent
      );
      uiModule.updateTopSipCounter();
      const topSipValue = domQuery.getById('topSipValue');
      console.log('🔧 After updateTopSipCounter - element textContent:', topSipValue?.textContent);
      expect(topSipValue!.textContent).toBe('5.00');
    }

    if (uiModule.updateTopSipsPerDrink) {
      uiModule.updateTopSipsPerDrink();
      expect(domQuery.getById('topSipsPerDrink')!.textContent).toBe('2.00');
    }

    if (uiModule.updateDrinkProgress) {
      uiModule.updateDrinkProgress();
      expect(domQuery.getById('drinkProgressFill')!.style.width).toBe('50%');
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

    // Import the modernized drink system
    const { processDrink } = await import('../ts/core/systems/drink-system');

    // Test the complete flow
    console.log('Testing complete flow...');

    // Process drink
    processDrink();

    // Import domQuery for consistent element access
    const { domQuery } = await import('../ts/services/dom-query');

    // Update UI
    if (uiModule.updateTopSipCounter) {
      console.log(
        '🔧 Before updateTopSipCounter - element textContent:',
        domQuery.getById('topSipValue')?.textContent
      );
      uiModule.updateTopSipCounter();
      const topSipValue = domQuery.getById('topSipValue');
      console.log('🔧 After updateTopSipCounter - element textContent:', topSipValue?.textContent);
      expect(topSipValue!.textContent).toBe('1.00');
    }

    console.log('Complete flow test passed');
  });
});
