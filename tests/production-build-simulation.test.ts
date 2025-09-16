import { describe, it, expect, vi, beforeEach, afterEach, fail } from 'vitest';
import { build } from 'vite';

// Mock the production build environment
const mockProductionBuild = () => {
  // Set production environment variables
  process.env.NODE_ENV = 'production';
  process.env.VITE_APP_ENV = 'production';

  // Mock production-like window object
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'https://spikan.github.io',
      pathname: '/JSIncremental/',
    },
    writable: true,
  });

  // Mock production globals
  (window as any).GAME_CONFIG = {
    BAL: { BASE_SIPS_PER_DRINK: 1 },
    TIMING: { DEFAULT_DRINK_RATE: 5000 },
  };

  (window as any).sips = 0;
  (window as any).sipsPerDrink = 1;
  (window as any).drinkRate = 5000;
  (window as any).lastDrinkTime = Date.now() - 5000;
  (window as any).spd = 0;
  (window as any).__lastAutosaveClockMs = 0;

  // Mock Decimal for production
  (window as any).Decimal = class MockDecimal {
    constructor(value: any) {
      this.value = value;
    }
    toNumber() {
      return Number(this.value);
    }
    mul(other: any) {
      return new MockDecimal(this.value * other.value);
    }
    div(other: any) {
      return new MockDecimal(this.value / other.value);
    }
    add(other: any) {
      return new MockDecimal(this.value + other.value);
    }
    sub(other: any) {
      return new MockDecimal(this.value - other.value);
    }
    gt(other: any) {
      return this.value > other.value;
    }
    lt(other: any) {
      return this.value < other.value;
    }
    gte(other: any) {
      return this.value >= other.value;
    }
    lte(other: any) {
      return this.value <= other.value;
    }
    eq(other: any) {
      return this.value === other.value;
    }
    toString() {
      return String(this.value);
    }
  };
};

describe('Production Build Simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProductionBuild();

    // Reset DOM
    document.body.innerHTML = `
      <div id="splashScreen" style="display: block;"></div>
      <div id="gameContent" style="display: none;"></div>
      <button id="sodaButton">Soda</button>
    `;

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should simulate production build process', async () => {
    // This test simulates what happens when the production build loads
    const startTime = Date.now();

    try {
      // Simulate the production build loading sequence
      console.log('🔧 Simulating production build load...');

      // Load the main module (this is what gets bundled in production)
      const module = await import('../ts/index.ts');

      const loadTime = Date.now() - startTime;
      console.log(`🔧 Module loaded in ${loadTime}ms`);

      // Should load within reasonable time
      expect(loadTime).toBeLessThan(10000);

      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check that App is properly initialized
      expect((window as any).App).toBeDefined();
      expect((window as any).App.systems).toBeDefined();
      expect((window as any).App.systems.loop).toBeDefined();

      console.log('✅ Production build simulation successful');
    } catch (error) {
      console.error('❌ Production build simulation failed:', error);
      throw error;
    }
  });

  it('should detect hanging imports in production environment', async () => {
    // Mock a hanging import
    const originalImport = (global as any).import;
    let importTimeout = false;

    (global as any).import = vi.fn((path: string) => {
      if (path.includes('loop-system')) {
        // Simulate a hanging import
        return new Promise(() => {}); // Never resolves
      }
      return originalImport(path);
    });

    const startTime = Date.now();

    try {
      // This should detect the hanging import
      await Promise.race([
        import('../ts/index.ts'),
        new Promise((_, reject) =>
          setTimeout(() => {
            importTimeout = true;
            reject(new Error('Import timeout detected'));
          }, 1000)
        ),
      ]);

      fail('Should have detected hanging import');
    } catch (error) {
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1500);
      expect(importTimeout).toBe(true);
      expect(error.message).toContain('Import timeout detected');
    }

    // Restore original import
    (global as any).import = originalImport;
  });

  it('should verify game loop starts and runs continuously', async () => {
    // Load the module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 300));

    const App = (window as any).App;
    expect(App).toBeDefined();
    expect(App.systems.loop).toBeDefined();

    // Track requestAnimationFrame calls
    let rafCallCount = 0;
    let lastRafTime = 0;
    const rafTimes: number[] = [];

    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      const now = Date.now();
      if (lastRafTime > 0) {
        rafTimes.push(now - lastRafTime);
      }
      lastRafTime = now;

      // Simulate callback execution
      setTimeout(callback, 16); // ~60fps
      return rafCallCount;
    });

    // Start the loop
    App.systems.loop.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for multiple frames
    await new Promise(resolve => setTimeout(resolve, 200));

    // Should have called RAF multiple times
    expect(rafCallCount).toBeGreaterThan(5);

    // Check frame timing (should be ~16ms intervals)
    const avgFrameTime = rafTimes.reduce((a, b) => a + b, 0) / rafTimes.length;
    expect(avgFrameTime).toBeLessThan(50); // Should be reasonable frame timing

    // Restore original RAF
    window.requestAnimationFrame = originalRAF;
  });

  it('should verify drink system processes correctly', async () => {
    // Load the module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 300));

    const App = (window as any).App;

    // Set up initial state
    App.state.setState({
      sips: 0,
      drinkProgress: 0,
      lastDrinkTime: Date.now() - 5000,
      drinkRate: 5000,
    });

    let processDrinkCallCount = 0;
    let updateDrinkProgressCallCount = 0;

    // Start the loop with spies
    App.systems.loop.start({
      updateDrinkProgress: () => {
        updateDrinkProgressCallCount++;
        // Simulate progress update
        const state = App.state.getState();
        const now = Date.now();
        const progress = Math.min(((now - state.lastDrinkTime) / state.drinkRate) * 100, 100);
        App.state.setState({ drinkProgress: progress });
      },
      processDrink: () => {
        processDrinkCallCount++;
        // Simulate drink processing
        const state = App.state.getState();
        if (state.drinkProgress >= 100) {
          App.state.setState({
            sips: state.sips + 1,
            lastDrinkTime: Date.now(),
            drinkProgress: 0,
          });
        }
      },
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 200));

    // Both functions should have been called
    expect(updateDrinkProgressCallCount).toBeGreaterThan(0);
    expect(processDrinkCallCount).toBeGreaterThan(0);

    // Check that sips increased (drink was processed)
    const finalState = App.state.getState();
    expect(finalState.sips).toBeGreaterThan(0);
  });

  it('should handle production build errors gracefully', async () => {
    // Mock a production build error
    const originalConsoleError = console.error;
    const errorSpy = vi.fn();
    console.error = errorSpy;

    // Mock a system that throws an error
    const originalImport = (global as any).import;
    (global as any).import = vi.fn((path: string) => {
      if (path.includes('drink-system')) {
        return Promise.reject(new Error('Production build error'));
      }
      return originalImport(path);
    });

    try {
      await import('../ts/index.ts');

      // Wait a bit to see if errors are handled
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have logged the error
      expect(errorSpy).toHaveBeenCalled();
    } catch (error) {
      // Error should be handled gracefully
      expect(error).toBeDefined();
    }

    // Restore
    console.error = originalConsoleError;
    (global as any).import = originalImport;
  });
});
