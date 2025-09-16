import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Test that reproduces the exact production DOM structure
describe('Production DOM Elements Test', () => {
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
          <!-- These are the elements that the UI functions are looking for -->
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
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.clearAllMocks();
  });

  it('should test UI update functions with correct DOM elements', async () => {
    // Import the UI module
    const uiModule = await import('../ts/ui/index');

    // Mock the App object with the exact structure from production
    const mockApp = {
      state: {
        getState: () => ({
          sips: { toString: () => '10' },
          sipsPerDrink: { toString: () => '2' },
          sipsPerSecond: { toString: () => '1.5' },
          drinkProgress: 75.5,
        }),
      },
      ui: uiModule,
    };

    (global.window as any).App = mockApp;

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

    // Test updateTopSipsPerSecond
    if (uiModule.updateTopSipsPerSecond) {
      const topSipsPerSecond = global.document.getElementById('topSipsPerSecond');
      expect(topSipsPerSecond).toBeTruthy();

      uiModule.updateTopSipsPerSecond();
      expect(topSipsPerSecond!.textContent).toBe('1.5');
    }

    // Test updateDrinkProgress
    if (uiModule.updateDrinkProgress) {
      const drinkProgressFill = global.document.getElementById('drinkProgressFill');
      expect(drinkProgressFill).toBeTruthy();

      uiModule.updateDrinkProgress();
      expect(drinkProgressFill!.style.width).toBe('75.5%');
    }
  });

  it('should test the complete UI update flow', async () => {
    const uiModule = await import('../ts/ui/index');

    // Mock the App object
    const mockApp = {
      state: {
        getState: () => ({
          sips: { toString: () => '25' },
          sipsPerDrink: { toString: () => '3' },
          sipsPerSecond: { toString: () => '2.5' },
          drinkProgress: 60.0,
        }),
      },
      ui: uiModule,
    };

    (global.window as any).App = mockApp;

    // Test updateAllDisplays
    if (uiModule.updateAllDisplays) {
      uiModule.updateAllDisplays();

      // Check all elements were updated
      expect(global.document.getElementById('topSipValue')!.textContent).toBe('25');
      expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('3');
      expect(global.document.getElementById('topSipsPerSecond')!.textContent).toBe('2.5');
      expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('60%');
    }
  });

  it('should test the exact production scenario', async () => {
    // This test simulates the exact scenario from the production logs
    console.log('Testing exact production scenario...');

    const uiModule = await import('../ts/ui/index');

    // Mock the App object with the exact state from production logs
    const mockApp = {
      state: {
        getState: () => ({
          sips: { toString: () => '1' }, // This was stuck at 1 in production
          sipsPerDrink: { toString: () => '1' },
          sipsPerSecond: { toString: () => '0' },
          drinkProgress: 64.12,
        }),
      },
      ui: uiModule,
    };

    (global.window as any).App = mockApp;

    // Test the exact UI update calls from production
    console.log('Calling updateTopSipCounter...');
    if (uiModule.updateTopSipCounter) {
      uiModule.updateTopSipCounter();
      expect(global.document.getElementById('topSipValue')!.textContent).toBe('1');
    }

    console.log('Calling updateTopSipsPerDrink...');
    if (uiModule.updateTopSipsPerDrink) {
      uiModule.updateTopSipsPerDrink();
      expect(global.document.getElementById('topSipsPerDrink')!.textContent).toBe('1');
    }

    console.log('Calling updateTopSipsPerSecond...');
    if (uiModule.updateTopSipsPerSecond) {
      uiModule.updateTopSipsPerSecond();
      expect(global.document.getElementById('topSipsPerSecond')!.textContent).toBe('0');
    }

    console.log('Calling updateAllDisplays...');
    if (uiModule.updateAllDisplays) {
      uiModule.updateAllDisplays();
    }

    console.log('Calling updateDrinkProgress...');
    if (uiModule.updateDrinkProgress) {
      uiModule.updateDrinkProgress();
      expect(global.document.getElementById('drinkProgressFill')!.style.width).toBe('64.12%');
    }

    console.log('Production scenario test completed');
  });
});
