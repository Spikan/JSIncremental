import { describe, it, expect, vi, beforeEach, afterEach, fail } from 'vitest';

// Mock the production environment
const mockProductionEnvironment = () => {
  // Mock window object with production-like state
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'https://spikan.github.io',
      pathname: '/JSIncremental/',
    },
    writable: true,
  });

  // Mock GAME_CONFIG
  (window as any).GAME_CONFIG = {
    BAL: { BASE_SIPS_PER_DRINK: 1 },
    TIMING: { DEFAULT_DRINK_RATE: 5000 },
  };

  // Mock global variables
  (window as any).sips = 0;
  (window as any).sipsPerDrink = 1;
  (window as any).drinkRate = 5000;
  (window as any).lastDrinkTime = Date.now() - 5000;
  (window as any).spd = 0;
  (window as any).__lastAutosaveClockMs = 0;

  // Mock Decimal
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

describe('Production Environment Simulation', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset DOM
    document.body.innerHTML = `
      <div id="splashScreen" style="display: block;"></div>
      <div id="gameContent" style="display: none;"></div>
      <button id="sodaButton">Soda</button>
    `;

    // Mock production environment
    mockProductionEnvironment();

    // Mock console methods to track calls
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load ts/index.ts module without hanging', async () => {
    // This test simulates the production module loading
    const startTime = Date.now();

    try {
      // Import the main module (this is what happens in production)
      const module = await import('../ts/index.ts');

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time (not hang)
      expect(loadTime).toBeLessThan(5000);

      // Should not throw errors
      expect(module).toBeDefined();
    } catch (error) {
      fail(`Module loading failed: ${error}`);
    }
  });

  it('should initialize App object with all required systems', async () => {
    // Wait for module to load
    await import('../ts/index.ts');

    // Wait a bit for initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that App object exists and has required properties
    expect((window as any).App).toBeDefined();
    expect((window as any).App.state).toBeDefined();
    expect((window as any).App.systems).toBeDefined();
    expect((window as any).App.systems.loop).toBeDefined();
    expect((window as any).App.systems.drink).toBeDefined();
    expect((window as any).App.ui).toBeDefined();
  });

  it('should start game loop and keep it running', async () => {
    // Load module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 200));

    const App = (window as any).App;
    expect(App).toBeDefined();
    expect(App.systems.loop).toBeDefined();
    expect(App.systems.drink).toBeDefined();

    // Mock requestAnimationFrame to track calls
    let rafCallCount = 0;
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      // Simulate the callback being called
      setTimeout(callback, 16); // ~60fps
      return 1;
    });

    // Start the loop
    App.systems.loop.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for multiple frames
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should have called requestAnimationFrame multiple times
    expect(rafCallCount).toBeGreaterThan(3);

    // Restore original RAF
    window.requestAnimationFrame = originalRAF;
  });

  it('should process drinks when loop is running', async () => {
    // Load module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 200));

    const App = (window as any).App;
    const processDrinkSpy = vi.fn();

    // Start the loop with mocked processDrink
    App.systems.loop.start({
      updateDrinkProgress: vi.fn(),
      processDrink: processDrinkSpy,
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for multiple frames
    await new Promise(resolve => setTimeout(resolve, 100));

    // processDrink should have been called
    expect(processDrinkSpy).toHaveBeenCalled();
  });

  it('should handle drink system import timeout gracefully', async () => {
    // Mock a slow import that would timeout
    const originalImport = (global as any).import;
    let importCallCount = 0;

    (global as any).import = vi.fn((path: string) => {
      importCallCount++;
      if (path.includes('drink-system')) {
        // Simulate a hanging import
        return new Promise(() => {}); // Never resolves
      }
      return originalImport(path);
    });

    const startTime = Date.now();

    try {
      // This should not hang forever
      await Promise.race([
        import('../ts/index.ts'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 2000)),
      ]);

      fail('Should have timed out');
    } catch (error) {
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2500); // Should timeout quickly
      expect(error.message).toContain('Test timeout');
    }

    // Restore original import
    (global as any).import = originalImport;
  });

  it('should maintain game state during loop execution', async () => {
    // Load module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 200));

    const App = (window as any).App;

    // Set initial state
    App.state.setState({ sips: 100, drinkProgress: 0 });

    const updateDrinkProgressSpy = vi.fn();
    const processDrinkSpy = vi.fn();

    // Start the loop
    App.systems.loop.start({
      updateDrinkProgress: updateDrinkProgressSpy,
      processDrink: processDrinkSpy,
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for multiple frames
    await new Promise(resolve => setTimeout(resolve, 100));

    // Both functions should have been called
    expect(updateDrinkProgressSpy).toHaveBeenCalled();
    expect(processDrinkSpy).toHaveBeenCalled();

    // Game state should still be accessible
    const state = App.state.getState();
    expect(state).toBeDefined();
    expect(state.sips).toBe(100);
  });
});
