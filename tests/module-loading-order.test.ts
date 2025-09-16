import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Module Loading Order Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock production environment
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://spikan.github.io',
        pathname: '/JSIncremental/',
      },
      writable: true,
    });

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

  it('should load drink system before tryBoot', async () => {
    const loadOrder: string[] = [];

    // Track the order of system loading
    const originalImport = (global as any).import;
    (global as any).import = vi.fn((path: string) => {
      loadOrder.push(path);
      return originalImport(path);
    });

    // Load the module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check that drink system is loaded before tryBoot
    const drinkSystemIndex = loadOrder.findIndex(path => path.includes('drink-system'));
    const tryBootIndex = loadOrder.findIndex(path => path.includes('tryBoot'));

    // Drink system should be loaded before tryBoot
    expect(drinkSystemIndex).toBeGreaterThan(-1);
    expect(tryBootIndex).toBeGreaterThan(-1);
    expect(drinkSystemIndex).toBeLessThan(tryBootIndex);

    // Restore original import
    (global as any).import = originalImport;
  });

  it('should have processDrink available when loop starts', async () => {
    // Load the module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 300));

    const App = (window as any).App;
    expect(App).toBeDefined();
    expect(App.systems).toBeDefined();
    expect(App.systems.drink).toBeDefined();
    expect(App.systems.drink.processDrink).toBeDefined();
    expect(App.systems.loop).toBeDefined();

    // Mock requestAnimationFrame to track loop execution
    let rafCallCount = 0;
    let processDrinkCalled = false;

    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      // Simulate callback execution
      setTimeout(callback, 16);
      return rafCallCount;
    });

    // Start the loop
    App.systems.loop.start({
      updateDrinkProgress: vi.fn(),
      processDrink: () => {
        processDrinkCalled = true;
        // Verify processDrink function exists
        expect(App.systems.drink.processDrink).toBeDefined();
        expect(typeof App.systems.drink.processDrink).toBe('function');
      },
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for multiple frames
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should have called RAF and processDrink
    expect(rafCallCount).toBeGreaterThan(0);
    expect(processDrinkCalled).toBe(true);

    // Restore original RAF
    window.requestAnimationFrame = originalRAF;
  });

  it('should not have loop system start and immediately stop', async () => {
    // Load the module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 300));

    const App = (window as any).App;

    // Track loop start/stop calls
    let loopStartCalled = false;
    let loopStopCalled = false;

    const originalStart = App.systems.loop.start;
    const originalStop = App.systems.loop.stop;

    App.systems.loop.start = vi.fn((...args) => {
      loopStartCalled = true;
      return originalStart.apply(App.systems.loop, args);
    });

    App.systems.loop.stop = vi.fn(() => {
      loopStopCalled = true;
      return originalStop.apply(App.systems.loop);
    });

    // Mock requestAnimationFrame to prevent actual loop execution
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = vi.fn(callback => {
      // Don't call the callback to prevent loop from running
      return 1;
    });

    // Start the loop
    App.systems.loop.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Loop should have started but not stopped immediately
    expect(loopStartCalled).toBe(true);
    expect(loopStopCalled).toBe(false);

    // Restore originals
    window.requestAnimationFrame = originalRAF;
  });

  it('should handle missing processDrink function gracefully', async () => {
    // Load the module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 300));

    const App = (window as any).App;

    // Remove processDrink function to simulate the bug
    delete App.systems.drink.processDrink;

    // Mock requestAnimationFrame
    let rafCallCount = 0;
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      // Simulate callback execution
      setTimeout(callback, 16);
      return rafCallCount;
    });

    // Start the loop - should not crash
    expect(() => {
      App.systems.loop.start({
        updateDrinkProgress: vi.fn(),
        processDrink: vi.fn(),
        updateStats: vi.fn(),
        updateUI: vi.fn(),
      });
    }).not.toThrow();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should have called RAF (loop is running)
    expect(rafCallCount).toBeGreaterThan(0);

    // Restore original RAF
    window.requestAnimationFrame = originalRAF;
  });

  it('should verify all critical systems are loaded in correct order', async () => {
    const systemLoadOrder: string[] = [];

    // Track system loading
    const originalImport = (global as any).import;
    (global as any).import = vi.fn((path: string) => {
      if (path.includes('drink-system') || path.includes('loop-system')) {
        systemLoadOrder.push(path);
      }
      return originalImport(path);
    });

    // Load the module
    await import('../ts/index.ts');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check loading order
    expect(systemLoadOrder).toContain('drink-system');
    expect(systemLoadOrder).toContain('loop-system');

    // Drink system should be loaded before loop system
    const drinkIndex = systemLoadOrder.findIndex(path => path.includes('drink-system'));
    const loopIndex = systemLoadOrder.findIndex(path => path.includes('loop-system'));

    expect(drinkIndex).toBeLessThan(loopIndex);

    // Restore original import
    (global as any).import = originalImport;
  });
});
