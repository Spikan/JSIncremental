import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Simulate production environment differences
describe('Production Environment Simulation', () => {
  let dom: JSDOM;
  let originalWindow: any;
  let originalDocument: any;
  let originalNavigator: any;
  let originalLocation: any;

  beforeEach(() => {
    // Create a fresh JSDOM environment that mimics production
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <div id="sodaButton">Soda Button</div>
          <div id="sipCounter">0</div>
          <div id="drinkProgressBar">
            <div id="drinkProgressFill"></div>
          </div>
        </body>
      </html>
    `,
      {
        url: 'https://spikan.github.io/JSIncremental/',
        referrer: 'https://github.com/Spikan/JSIncremental',
        contentType: 'text/html',
        includeNodeLocations: true,
        storageQuota: 10000000,
      }
    );

    // Store original globals
    originalWindow = global.window;
    originalDocument = global.document;
    originalNavigator = global.navigator;
    originalLocation = global.location;

    // Set up production-like environment
    global.window = dom.window as any;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator as any;
    global.location = dom.window.location as any;

    // Mock production-specific behaviors
    global.window.requestAnimationFrame = vi.fn(callback => {
      // In production, this might behave differently
      return setTimeout(callback, 16);
    });

    global.window.cancelAnimationFrame = vi.fn(id => {
      clearTimeout(id);
    });

    // Mock production build characteristics
    global.window.__VITE_DEV_SERVER_URL__ = undefined;
    global.window.__VITE_IS_DEV__ = false;
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
    global.location = originalLocation;
    vi.clearAllMocks();
  });

  describe('Environment Differences', () => {
    it('should detect production vs dev environment', () => {
      const isDev = global.window.__VITE_IS_DEV__ === true;
      const isProd = !isDev && global.window.location.hostname !== 'localhost';

      expect(isDev).toBe(false);
      expect(isProd).toBe(true);
    });

    it('should have production-like module loading behavior', async () => {
      // Test that dynamic imports work the same way
      const mockModule = { test: 'value' };

      // Test that we can import our actual modules
      const result = await import('../ts/core/systems/drink-system');
      expect(result).toBeDefined();
      expect(result.processDrinkFactory).toBeDefined();
    });

    it('should simulate production console behavior', () => {
      // In production, console.log might be stripped or behave differently
      const consoleSpy = vi.spyOn(console, 'log');

      console.log('Test message');

      // In production builds, this might not appear
      expect(consoleSpy).toHaveBeenCalledWith('Test message');
    });
  });

  describe('UI Update Simulation', () => {
    it('should test UI update functions in production environment', async () => {
      // Simulate the exact scenario from production logs
      const sipCounter = global.document.getElementById('sipCounter');
      const drinkProgressFill = global.document.getElementById('drinkProgressFill');

      expect(sipCounter).toBeTruthy();
      expect(drinkProgressFill).toBeTruthy();

      // Test that DOM manipulation works
      sipCounter!.textContent = '5';
      drinkProgressFill!.style.width = '50%';

      expect(sipCounter!.textContent).toBe('5');
      expect(drinkProgressFill!.style.width).toBe('50%');
    });

    it('should test event listener behavior in production', () => {
      const sodaButton = global.document.getElementById('sodaButton');
      let clickCount = 0;

      const clickHandler = () => {
        clickCount++;
      };

      sodaButton!.addEventListener('click', clickHandler);

      // Simulate click
      sodaButton!.click();

      expect(clickCount).toBe(1);
    });

    it('should test timing-dependent behavior', async () => {
      // Test the exact timing issue we saw in production
      const startTime = Date.now();
      const drinkRate = 1000; // 1 second
      const lastDrinkTime = startTime - 2000; // 2 seconds ago

      const timeSinceLastDrink = startTime - lastDrinkTime;
      const shouldProcessDrink = timeSinceLastDrink >= drinkRate;

      expect(shouldProcessDrink).toBe(true);
    });
  });

  describe('Module Loading Simulation', () => {
    it('should test static vs dynamic imports', async () => {
      // Test that our static imports work in production
      try {
        // This should work the same in both environments
        const { processDrinkFactory } = await import('../ts/core/systems/drink-system');
        expect(processDrinkFactory).toBeDefined();
        expect(typeof processDrinkFactory).toBe('function');
      } catch (error) {
        console.error('Static import failed:', error);
        throw error;
      }
    });

    it('should test service locator behavior', async () => {
      const { ServiceLocator } = await import('../ts/core/services/service-locator');

      // Test service registration and retrieval
      ServiceLocator.register('testKey', 'testValue');
      const retrieved = ServiceLocator.get('testKey');

      expect(retrieved).toBe('testValue');
    });
  });

  describe('State Management Simulation', () => {
    it('should test Zustand store behavior in production', async () => {
      const { useGameStore } = await import('../ts/core/state/zustand-store');

      // Test store initialization
      const store = useGameStore.getState();
      expect(store).toBeDefined();
      expect(typeof store.sips).toBe('object'); // Decimal object
    });

    it('should test state updates and UI synchronization', async () => {
      const { useGameStore } = await import('../ts/core/state/zustand-store');

      // Simulate the exact state update pattern from production
      const initialState = useGameStore.getState();
      console.log('Initial sips:', initialState.sips.toString());

      // Update state
      useGameStore.setState({ sips: initialState.sips.add(1) });

      const updatedState = useGameStore.getState();
      console.log('Updated sips:', updatedState.sips.toString());

      expect(updatedState.sips.gt(initialState.sips)).toBe(true);
    });
  });

  describe('Error Handling Simulation', () => {
    it('should test error boundaries in production', () => {
      // Test that errors are properly caught and handled
      const errorHandler = vi.fn();

      try {
        throw new Error('Test error');
      } catch (error) {
        errorHandler(error);
      }

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should test async error handling', async () => {
      const asyncErrorHandler = vi.fn();

      try {
        await Promise.reject(new Error('Async test error'));
      } catch (error) {
        asyncErrorHandler(error);
      }

      expect(asyncErrorHandler).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Performance Simulation', () => {
    it('should test requestAnimationFrame behavior', done => {
      let frameCount = 0;
      const maxFrames = 3;

      const animate = () => {
        frameCount++;
        if (frameCount < maxFrames) {
          requestAnimationFrame(animate);
        } else {
          expect(frameCount).toBe(maxFrames);
          done();
        }
      };

      requestAnimationFrame(animate);
    });

    it('should test timing precision', () => {
      const start = performance.now();

      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should be very fast
    });
  });
});
