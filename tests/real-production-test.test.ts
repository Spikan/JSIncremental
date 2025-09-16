import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Real Production Build Test', () => {
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

    // Use real Decimal from break_eternity.js
    (window as any).Decimal = (globalThis as any).Decimal;

    // Mock missing browser APIs
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock fetch for word bank loading
    global.fetch = vi.fn().mockImplementation(url => {
      if (url.includes('word_bank.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['test', 'word', 'bank', 'data']),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Reset DOM
    document.body.innerHTML = `
      <div id="splashScreen" style="display: block;"></div>
      <div id="gameContent" style="display: none;"></div>
      <button id="sodaButton">Soda</button>
    `;

    // Don't mock console - we want to see real logs
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should actually load the real ts/index.ts module without errors', async () => {
    const startTime = Date.now();

    try {
      // This loads the REAL module, not a mock
      const module = await import('../ts/index.ts');

      const loadTime = Date.now() - startTime;
      console.log(`Real module loaded in ${loadTime}ms`);

      // Should load within reasonable time
      expect(loadTime).toBeLessThan(10000);

      // Should not throw errors
      expect(module).toBeDefined();
    } catch (error) {
      console.error('Real module loading failed:', error);
      throw error;
    }
  });

  it('should actually initialize the real App object', async () => {
    // Load the real module
    await import('../ts/index.ts');

    // Wait for real initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check that the REAL App object exists
    expect((window as any).App).toBeDefined();
    expect((window as any).App.state).toBeDefined();
    expect((window as any).App.systems).toBeDefined();
    expect((window as any).App.systems.loop).toBeDefined();
    expect((window as any).App.systems.drink).toBeDefined();
    expect((window as any).App.ui).toBeDefined();

    // Check that the real loop system has the right methods
    expect(typeof (window as any).App.systems.loop.start).toBe('function');
    expect(typeof (window as any).App.systems.loop.stop).toBe('function');

    // Check that the real drink system has processDrink
    expect(typeof (window as any).App.systems.drink.processDrink).toBe('function');
  });

  it('should actually start the real game loop and keep it running', async () => {
    // Load the real module
    await import('../ts/index.ts');

    // Wait for real initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    const App = (window as any).App;
    expect(App).toBeDefined();

    // Track real requestAnimationFrame calls
    let rafCallCount = 0;
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = vi.fn(callback => {
      rafCallCount++;
      // Actually call the callback to test real loop
      setTimeout(callback, 16);
      return rafCallCount;
    });

    // Start the REAL loop
    App.systems.loop.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for multiple real frames
    await new Promise(resolve => setTimeout(resolve, 200));

    // Should have called requestAnimationFrame multiple times
    expect(rafCallCount).toBeGreaterThan(3);

    // Restore original RAF
    window.requestAnimationFrame = originalRAF;
  });

  it('should actually process drinks with the real drink system', async () => {
    // Load the real module
    await import('../ts/index.ts');

    // Wait for real initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    const App = (window as any).App;

    // Set up real initial state
    App.state.setState({
      sips: 0,
      drinkProgress: 0,
      lastDrinkTime: Date.now() - 5000,
      drinkRate: 5000,
    });

    let processDrinkCallCount = 0;
    let updateDrinkProgressCallCount = 0;

    // Start the REAL loop with real functions
    App.systems.loop.start({
      updateDrinkProgress: () => {
        updateDrinkProgressCallCount++;
        // Real progress update
        const state = App.state.getState();
        const now = Date.now();
        const progress = Math.min(((now - state.lastDrinkTime) / state.drinkRate) * 100, 100);
        App.state.setState({ drinkProgress: progress });
      },
      processDrink: () => {
        processDrinkCallCount++;
        // Call the REAL processDrink function
        App.systems.drink.processDrink();
      },
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for real processing
    await new Promise(resolve => setTimeout(resolve, 200));

    // Both functions should have been called
    expect(updateDrinkProgressCallCount).toBeGreaterThan(0);
    expect(processDrinkCallCount).toBeGreaterThan(0);

    // Check that sips actually increased (real drink processing)
    const finalState = App.state.getState();
    console.log('Final state sips:', finalState.sips, typeof finalState.sips);
    expect(finalState.sips).toBeDefined();
    // sips might be a Decimal object, so check if it has a value
    if (finalState.sips && typeof finalState.sips === 'object' && finalState.sips.toNumber) {
      expect(finalState.sips.toNumber()).toBeGreaterThan(0);
    } else {
      expect(Number(finalState.sips)).toBeGreaterThan(0);
    }
  });

  it('should actually handle real soda button clicks', async () => {
    // Load the real module
    await import('../ts/index.ts');

    // Wait for real initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    const App = (window as any).App;
    const sodaButton = document.getElementById('sodaButton');
    expect(sodaButton).toBeDefined();

    // Get initial sips count
    const initialState = App.state.getState();
    const initialSips = initialState.sips || 0;

    // Simulate real click
    sodaButton?.click();

    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that sips actually increased
    const finalState = App.state.getState();
    console.log(
      'Initial sips:',
      initialSips,
      'Final sips:',
      finalState.sips,
      typeof finalState.sips
    );
    expect(finalState.sips).toBeDefined();
    // sips might be a Decimal object, so check if it has a value
    if (finalState.sips && typeof finalState.sips === 'object' && finalState.sips.toNumber) {
      expect(finalState.sips.toNumber()).toBeGreaterThan(initialSips);
    } else {
      expect(Number(finalState.sips)).toBeGreaterThan(initialSips);
    }
  });

  it('should actually run the real game loop continuously', async () => {
    // Load the real module
    await import('../ts/index.ts');

    // Wait for real initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    const App = (window as any).App;

    // Track real loop execution
    let tickCount = 0;
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = vi.fn(callback => {
      tickCount++;
      // Actually call the callback
      setTimeout(callback, 16);
      return tickCount;
    });

    // Start the REAL loop
    App.systems.loop.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for multiple real ticks
    await new Promise(resolve => setTimeout(resolve, 300));

    // Should have executed multiple ticks
    expect(tickCount).toBeGreaterThan(10);

    // Restore original RAF
    window.requestAnimationFrame = originalRAF;
  });

  it('should actually work with real game state updates', async () => {
    // Load the real module
    await import('../ts/index.ts');

    // Wait for real initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    const App = (window as any).App;

    // Set real initial state
    App.state.setState({
      sips: 100,
      drinkProgress: 50,
      lastDrinkTime: Date.now() - 2500,
      drinkRate: 5000,
    });

    // Start the REAL loop
    App.systems.loop.start({
      updateDrinkProgress: vi.fn(),
      processDrink: vi.fn(),
      updateStats: vi.fn(),
      updateUI: vi.fn(),
    });

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check that real state is accessible and updated
    const state = App.state.getState();
    expect(state).toBeDefined();
    expect(state.sips).toBe(100);
    expect(state.drinkProgress).toBeDefined();
  });
});
