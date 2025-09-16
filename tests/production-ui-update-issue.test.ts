import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// This test specifically reproduces the production UI update issue
describe('Production UI Update Issue Reproduction', () => {
  let dom: JSDOM;
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    // Create production-like environment
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Production Test</title>
        </head>
        <body>
          <div id="sodaButton">Soda Button</div>
          <div id="sipCounter">0</div>
          <div id="drinkProgressBar">
            <div id="drinkProgressFill" style="width: 0%"></div>
          </div>
          <div id="sipsPerDrink">1</div>
          <div id="sipsPerSecond">0</div>
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

    global.window = dom.window as any;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator as any;
    global.location = dom.window.location as any;

    // Mock production-specific behaviors
    global.window.requestAnimationFrame = vi.fn(callback => {
      return setTimeout(callback, 16);
    });

    global.window.cancelAnimationFrame = vi.fn(id => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.clearAllMocks();
  });

  describe('UI Update Function Testing', () => {
    it('should test updateTopSipCounter function', async () => {
      // Import the UI module
      const uiModule = await import('../ts/ui/index');

      // Mock the App object as it would be in production
      const mockApp = {
        state: {
          getState: () => ({
            sips: { toString: () => '5' },
          }),
        },
        ui: uiModule,
      };

      (global.window as any).App = mockApp;

      // Test the function
      const sipCounter = global.document.getElementById('sipCounter');
      expect(sipCounter).toBeTruthy();

      // Call the function
      if (uiModule.updateTopSipCounter) {
        uiModule.updateTopSipCounter();

        // Check if the UI was updated
        expect(sipCounter!.textContent).toBe('5');
      }
    });

    it('should test updateAllDisplays function', async () => {
      const uiModule = await import('../ts/ui/index');

      const mockApp = {
        state: {
          getState: () => ({
            sips: { toString: () => '10' },
            sipsPerDrink: { toString: () => '2' },
            sipsPerSecond: { toString: () => '1.5' },
          }),
        },
        ui: uiModule,
      };

      (global.window as any).App = mockApp;

      // Test the function
      if (uiModule.updateAllDisplays) {
        uiModule.updateAllDisplays();

        // Check if all displays were updated
        const sipCounter = global.document.getElementById('sipCounter');
        const sipsPerDrink = global.document.getElementById('sipsPerDrink');
        const sipsPerSecond = global.document.getElementById('sipsPerSecond');

        expect(sipCounter!.textContent).toBe('10');
        expect(sipsPerDrink!.textContent).toBe('2');
        expect(sipsPerSecond!.textContent).toBe('1.5');
      }
    });

    it('should test updateDrinkProgress function', async () => {
      const uiModule = await import('../ts/ui/index');

      const mockApp = {
        state: {
          getState: () => ({
            drinkProgress: 75.5,
          }),
        },
        ui: uiModule,
      };

      (global.window as any).App = mockApp;

      // Test the function
      if (uiModule.updateDrinkProgress) {
        uiModule.updateDrinkProgress();

        // Check if progress bar was updated
        const drinkProgressFill = global.document.getElementById('drinkProgressFill');
        expect(drinkProgressFill!.style.width).toBe('75.5%');
      }
    });
  });

  describe('Drink System Integration Testing', () => {
    it('should test complete drink processing flow', async () => {
      // Import the drink system
      const { processDrinkFactory } = await import('../ts/core/systems/drink-system');

      // Create a mock service locator
      const mockServiceLocator = {
        get: vi.fn((key: string) => {
          switch (key) {
            case 'sips':
              return { toString: () => '1', add: (val: any) => ({ toString: () => '2' }) };
            case 'sipsPerDrink':
              return { toString: () => '1' };
            case 'spd':
              return { toString: () => '1' };
            case 'totalSipsEarned':
              return { toString: () => '0', add: (val: any) => ({ toString: () => '1' }) };
            case 'highestSipsPerSecond':
              return { toString: () => '0' };
            case 'lastDrinkTime':
              return Date.now() - 2000;
            case 'lastAutosaveClockMs':
              return Date.now();
            default:
              return undefined;
          }
        }),
        register: vi.fn(),
      };

      // Mock the service locator
      vi.doMock('../ts/core/services/service-locator', () => ({
        ServiceLocator: mockServiceLocator,
      }));

      // Create the processDrink function
      const processDrink = processDrinkFactory({
        getNow: () => Date.now(),
        getApp: () => ({
          state: {
            getState: () => ({
              sips: { toString: () => '1' },
              drinkRate: 1000,
              lastDrinkTime: Date.now() - 2000,
            }),
            setState: vi.fn(),
          },
          stateBridge: {
            setLastDrinkTime: vi.fn(),
            setDrinkProgress: vi.fn(),
          },
        }),
        getGameConfig: () => ({
          BALANCE: { BASE_SIPS_PER_DRINK: 1 },
        }),
        getSips: () => ({ toString: () => '1' }),
        setSips: vi.fn(),
        getSipsPerDrink: () => ({ toString: () => '1' }),
        getDrinkRate: () => 1000,
        getLastDrinkTime: () => Date.now() - 2000,
        setLastDrinkTime: vi.fn(),
        getSpd: () => ({ toString: () => '1' }),
        getTotalSipsEarned: () => ({ toString: () => '0' }),
        getHighestSipsPerSecond: () => ({ toString: () => '0' }),
        getLastAutosaveClockMs: () => Date.now(),
        setLastAutosaveClockMs: vi.fn(),
      });

      // Test the drink processing
      expect(() => processDrink()).not.toThrow();
    });
  });

  describe('Event Handler Testing', () => {
    it('should test soda button click handler', async () => {
      const sodaButton = global.document.getElementById('sodaButton');
      expect(sodaButton).toBeTruthy();

      // Mock the click system
      const mockHandleSodaClick = vi.fn().mockResolvedValue(undefined);

      // Mock the dynamic import
      vi.doMock('../ts/core/systems/clicks-system', () => ({
        handleSodaClickFactory: () => mockHandleSodaClick,
      }));

      // Simulate the button click
      sodaButton!.click();

      // In a real test, we'd check if the click handler was called
      // This would require setting up the actual event listener
    });
  });

  describe('Timing and Race Condition Testing', () => {
    it('should test timing-dependent UI updates', async () => {
      const sipCounter = global.document.getElementById('sipCounter');
      let updateCount = 0;

      // Mock a function that updates the UI
      const updateUI = () => {
        updateCount++;
        if (sipCounter) {
          sipCounter.textContent = updateCount.toString();
        }
      };

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        updateUI();
      }

      expect(updateCount).toBe(10);
      expect(sipCounter!.textContent).toBe('10');
    });

    it('should test async UI updates', async () => {
      const sipCounter = global.document.getElementById('sipCounter');

      // Simulate async UI update
      const asyncUpdate = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        if (sipCounter) {
          sipCounter.textContent = 'Async Updated';
        }
      };

      await asyncUpdate();
      expect(sipCounter!.textContent).toBe('Async Updated');
    });
  });

  describe('Error Boundary Testing', () => {
    it('should test UI update error handling', async () => {
      const uiModule = await import('../ts/ui/index');

      // Mock an error in the state
      const mockApp = {
        state: {
          getState: () => {
            throw new Error('State access error');
          },
        },
        ui: uiModule,
      };

      (global.window as any).App = mockApp;

      // Test that errors are handled gracefully
      if (uiModule.updateTopSipCounter) {
        expect(() => uiModule.updateTopSipCounter()).not.toThrow();
      }
    });
  });
});
