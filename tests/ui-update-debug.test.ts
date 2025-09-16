import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Focused test to debug the UI update issue
describe('UI Update Debug', () => {
  let dom: JSDOM;
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    // Create a minimal DOM environment
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="sipCounter">0</div>
          <div id="drinkProgressFill" style="width: 0%"></div>
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

  it('should test basic DOM manipulation', () => {
    const sipCounter = global.document.getElementById('sipCounter');
    const drinkProgressFill = global.document.getElementById('drinkProgressFill');

    expect(sipCounter).toBeTruthy();
    expect(drinkProgressFill).toBeTruthy();

    // Test basic DOM updates
    sipCounter!.textContent = '5';
    drinkProgressFill!.style.width = '50%';

    expect(sipCounter!.textContent).toBe('5');
    expect(drinkProgressFill!.style.width).toBe('50%');
  });

  it('should test UI update functions', async () => {
    // Import the UI module
    const uiModule = await import('../ts/ui/index');

    // Mock the App object
    const mockApp = {
      state: {
        getState: () => ({
          sips: { toString: () => '10' },
          drinkProgress: 75.5,
        }),
      },
      ui: uiModule,
    };

    (global.window as any).App = mockApp;

    // Test updateTopSipCounter
    if (uiModule.updateTopSipCounter) {
      const sipCounter = global.document.getElementById('sipCounter');
      uiModule.updateTopSipCounter();
      expect(sipCounter!.textContent).toBe('10');
    }

    // Test updateDrinkProgress
    if (uiModule.updateDrinkProgress) {
      const drinkProgressFill = global.document.getElementById('drinkProgressFill');
      uiModule.updateDrinkProgress();
      expect(drinkProgressFill!.style.width).toBe('75.5%');
    }
  });

  it('should test drink system integration', async () => {
    // Import the drink system
    const { processDrinkFactory } = await import('../ts/core/systems/drink-system');

    // Create a simple mock
    const mockSetSips = vi.fn();
    const mockSetLastDrinkTime = vi.fn();

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
      setSips: mockSetSips,
      getSipsPerDrink: () => ({ toString: () => '1' }),
      getDrinkRate: () => 1000,
      getLastDrinkTime: () => Date.now() - 2000,
      setLastDrinkTime: mockSetLastDrinkTime,
      getSpd: () => ({ toString: () => '1' }),
      getTotalSipsEarned: () => ({ toString: () => '0' }),
      getHighestSipsPerSecond: () => ({ toString: () => '0' }),
      getLastAutosaveClockMs: () => Date.now(),
      setLastAutosaveClockMs: vi.fn(),
    });

    // Test drink processing
    expect(() => processDrink()).not.toThrow();

    // Check if setSips was called
    expect(mockSetSips).toHaveBeenCalled();
    expect(mockSetLastDrinkTime).toHaveBeenCalled();
  });

  it('should test the complete flow', async () => {
    // This test simulates the exact flow from the production logs

    // 1. Set up the environment
    const sipCounter = global.document.getElementById('sipCounter');
    const drinkProgressFill = global.document.getElementById('drinkProgressFill');

    // 2. Import modules
    const uiModule = await import('../ts/ui/index');
    const { processDrinkFactory } = await import('../ts/core/systems/drink-system');

    // 3. Create the drink system
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

    // 4. Mock the App object
    const mockApp = {
      state: {
        getState: () => ({
          sips: { toString: () => '5' },
          drinkProgress: 50.0,
        }),
      },
      ui: uiModule,
    };

    (global.window as any).App = mockApp;

    // 5. Test the complete flow
    console.log('Testing complete flow...');

    // Process drink
    processDrink();

    // Update UI
    if (uiModule.updateTopSipCounter) {
      uiModule.updateTopSipCounter();
      expect(sipCounter!.textContent).toBe('5');
    }

    if (uiModule.updateDrinkProgress) {
      uiModule.updateDrinkProgress();
      expect(drinkProgressFill!.style.width).toBe('50%');
    }

    console.log('Complete flow test passed');
  });
});
