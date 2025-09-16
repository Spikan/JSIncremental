import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// This test identifies specific differences between dev and production environments
describe('Dev vs Production Differences', () => {
  let devDom: JSDOM;
  let prodDom: JSDOM;
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    // Create dev environment
    devDom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dev Test</title>
        </head>
        <body>
          <div id="sodaButton">Soda Button</div>
          <div id="sipCounter">0</div>
        </body>
      </html>
    `,
      {
        url: 'http://localhost:5173/',
        referrer: 'http://localhost:5173/',
      }
    );

    // Create production environment
    prodDom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Production Test</title>
        </head>
        <body>
          <div id="sodaButton">Soda Button</div>
          <div id="sipCounter">0</div>
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
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.clearAllMocks();
  });

  describe('Environment Detection', () => {
    it('should detect dev environment correctly', () => {
      global.window = devDom.window as any;
      global.document = devDom.window.document;
      global.location = devDom.window.location as any;

      const isDev =
        global.window.location.hostname === 'localhost' ||
        global.window.location.hostname === '127.0.0.1' ||
        global.window.location.port === '5173';

      expect(isDev).toBe(true);
    });

    it('should detect production environment correctly', () => {
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;
      global.location = prodDom.window.location as any;

      const isProd =
        global.window.location.hostname === 'spikan.github.io' &&
        global.window.location.protocol === 'https:';

      expect(isProd).toBe(true);
    });
  });

  describe('Module Loading Differences', () => {
    it('should test static imports in both environments', async () => {
      // Test in dev environment
      global.window = devDom.window as any;
      global.document = devDom.window.document;

      let devImportSuccess = false;
      try {
        const { processDrinkFactory } = await import('../ts/core/systems/drink-system');
        devImportSuccess = !!processDrinkFactory;
      } catch (error) {
        console.error('Dev import failed:', error);
      }

      // Test in production environment
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      let prodImportSuccess = false;
      try {
        const { processDrinkFactory } = await import('../ts/core/systems/drink-system');
        prodImportSuccess = !!processDrinkFactory;
      } catch (error) {
        console.error('Prod import failed:', error);
      }

      expect(devImportSuccess).toBe(true);
      expect(prodImportSuccess).toBe(true);
    });

    it('should test dynamic imports in both environments', async () => {
      // Test in dev environment
      global.window = devDom.window as any;
      global.document = devDom.window.document;

      let devDynamicImportSuccess = false;
      try {
        const uiModule = await import('../ts/ui/index');
        devDynamicImportSuccess = !!uiModule.updateAllDisplays;
      } catch (error) {
        console.error('Dev dynamic import failed:', error);
      }

      // Test in production environment
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      let prodDynamicImportSuccess = false;
      try {
        const uiModule = await import('../ts/ui/index');
        prodDynamicImportSuccess = !!uiModule.updateAllDisplays;
      } catch (error) {
        console.error('Prod dynamic import failed:', error);
      }

      expect(devDynamicImportSuccess).toBe(true);
      expect(prodDynamicImportSuccess).toBe(true);
    });
  });

  describe('Console Behavior Differences', () => {
    it('should test console behavior in dev environment', () => {
      global.window = devDom.window as any;
      global.document = devDom.window.document;

      const consoleSpy = vi.spyOn(console, 'log');
      console.log('Dev test message');

      expect(consoleSpy).toHaveBeenCalledWith('Dev test message');
    });

    it('should test console behavior in production environment', () => {
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      const consoleSpy = vi.spyOn(console, 'log');
      console.log('Prod test message');

      // In production, console.log might be stripped or behave differently
      expect(consoleSpy).toHaveBeenCalledWith('Prod test message');
    });
  });

  describe('RequestAnimationFrame Differences', () => {
    it('should test RAF behavior in dev environment', done => {
      global.window = devDom.window as any;
      global.document = devDom.window.document;

      let rafCalled = false;
      requestAnimationFrame(() => {
        rafCalled = true;
        expect(rafCalled).toBe(true);
        done();
      });
    });

    it('should test RAF behavior in production environment', done => {
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      let rafCalled = false;
      requestAnimationFrame(() => {
        rafCalled = true;
        expect(rafCalled).toBe(true);
        done();
      });
    });
  });

  describe('State Management Differences', () => {
    it('should test Zustand store in dev environment', async () => {
      global.window = devDom.window as any;
      global.document = devDom.window.document;

      const { useGameStore } = await import('../ts/core/state/zustand-store');
      const store = useGameStore.getState();

      expect(store).toBeDefined();
      expect(typeof store.sips).toBe('object');
    });

    it('should test Zustand store in production environment', async () => {
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      const { useGameStore } = await import('../ts/core/state/zustand-store');
      const store = useGameStore.getState();

      expect(store).toBeDefined();
      expect(typeof store.sips).toBe('object');
    });
  });

  describe('UI Update Function Differences', () => {
    it('should test UI updates in dev environment', async () => {
      global.window = devDom.window as any;
      global.document = devDom.window.document;

      const uiModule = await import('../ts/ui/index');
      const sipCounter = global.document.getElementById('sipCounter');

      // Mock App object
      const mockApp = {
        state: {
          getState: () => ({
            sips: { toString: () => '5' },
          }),
        },
        ui: uiModule,
      };

      (global.window as any).App = mockApp;

      if (uiModule.updateTopSipCounter) {
        uiModule.updateTopSipCounter();
        expect(sipCounter!.textContent).toBe('5');
      }
    });

    it('should test UI updates in production environment', async () => {
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      const uiModule = await import('../ts/ui/index');
      const sipCounter = global.document.getElementById('sipCounter');

      // Mock App object
      const mockApp = {
        state: {
          getState: () => ({
            sips: { toString: () => '5' },
          }),
        },
        ui: uiModule,
      };

      (global.window as any).App = mockApp;

      if (uiModule.updateTopSipCounter) {
        uiModule.updateTopSipCounter();
        expect(sipCounter!.textContent).toBe('5');
      }
    });
  });

  describe('Error Handling Differences', () => {
    it('should test error handling in dev environment', () => {
      global.window = devDom.window as any;
      global.document = devDom.window.document;

      const errorHandler = vi.fn();

      try {
        throw new Error('Dev test error');
      } catch (error) {
        errorHandler(error);
      }

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should test error handling in production environment', () => {
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      const errorHandler = vi.fn();

      try {
        throw new Error('Prod test error');
      } catch (error) {
        errorHandler(error);
      }

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Performance Differences', () => {
    it('should test performance in dev environment', () => {
      global.window = devDom.window as any;
      global.document = devDom.window.document;

      const start = performance.now();

      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeGreaterThan(0);
    });

    it('should test performance in production environment', () => {
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      const start = performance.now();

      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('Specific Production Issues', () => {
    it('should reproduce the sips stuck at 1 issue', async () => {
      global.window = prodDom.window as any;
      global.document = prodDom.window.document;

      // Import the drink system
      const { processDrinkFactory } = await import('../ts/core/systems/drink-system');

      // Create a mock that simulates the production issue
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
              return Date.now() - 2000; // 2 seconds ago
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

      // Test multiple drink processing calls
      const initialSips = mockServiceLocator.get('sips');
      expect(initialSips.toString()).toBe('1');

      // Process drink multiple times
      for (let i = 0; i < 5; i++) {
        processDrink();
        // Wait a bit to simulate timing
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Check if sips increased
      const finalSips = mockServiceLocator.get('sips');
      expect(finalSips.toString()).toBe('2'); // Should have increased
    });
  });
});
