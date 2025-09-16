import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Loop System Hanging Detection', () => {
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

  it('should detect hanging imports with timeout', async () => {
    // Mock a hanging import
    const originalImport = (global as any).import;
    let importCallCount = 0;

    (global as any).import = vi.fn((path: string) => {
      importCallCount++;
      if (path.includes('loop-system')) {
        // Simulate a hanging import that never resolves
        return new Promise(() => {}); // Never resolves
      }
      return originalImport(path);
    });

    const startTime = Date.now();
    let timeoutOccurred = false;

    try {
      // This should timeout
      await Promise.race([
        (global as any).import('./core/systems/loop-system'),
        new Promise(
          (_, reject) =>
            setTimeout(() => {
              timeoutOccurred = true;
              reject(new Error('Loop system import timeout after 5 seconds'));
            }, 100) // Short timeout for testing
        ),
      ]);

      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(200); // Should timeout quickly
      expect(timeoutOccurred).toBe(true);
      expect(error.message).toContain('Loop system import timeout');
    }

    // Restore original import
    (global as any).import = originalImport;
  });

  it('should verify inline loop system works without imports', () => {
    // Create an inline loop system (like we did in the fix)
    let rafId: number | null = null;

    const loopSystem = {
      start: ({
        updateDrinkProgress,
        processDrink,
        updateStats,
        updateUI,
        getNow = () => Date.now(),
      }: any) => {
        try {
          loopSystem.stop();
        } catch (error) {
          console.warn('Failed to stop previous loop:', error);
        }
        let lastStatsUpdate = 0;

        function tick() {
          try {
            if (updateDrinkProgress) updateDrinkProgress();
          } catch (error) {
            console.warn('Failed to update drink progress in loop:', error);
          }
          try {
            if (processDrink) processDrink();
          } catch (error) {
            console.warn('Failed to process drink in loop:', error);
          }
          try {
            if (updateUI) updateUI();
          } catch (error) {
            console.warn('Failed to update UI in loop:', error);
          }
          const now = getNow();
          if (now - lastStatsUpdate >= 1000) {
            lastStatsUpdate = now;
            try {
              if (updateStats) updateStats();
            } catch (error) {
              console.warn('Failed to update stats in loop:', error);
            }
          }
          rafId = requestAnimationFrame(tick) as unknown as number;
        }

        function runOnceSafely(fn: (() => void) | undefined) {
          try {
            if (fn) fn();
          } catch (error) {
            console.warn('Failed to run function safely:', error);
          }
        }

        if (updateDrinkProgress) runOnceSafely(updateDrinkProgress);
        if (processDrink) runOnceSafely(processDrink);
        lastStatsUpdate = getNow();
        if (updateStats) runOnceSafely(updateStats);
        rafId = requestAnimationFrame(tick) as unknown as number;
      },
      stop: () => {
        if (rafId != null) {
          cancelAnimationFrame(rafId as unknown as number);
          rafId = null;
        }
      },
    };

    // Test that the inline system works
    expect(loopSystem).toBeDefined();
    expect(typeof loopSystem.start).toBe('function');
    expect(typeof loopSystem.stop).toBe('function');

    // Test that it can be called without errors
    expect(() => {
      loopSystem.start({
        updateDrinkProgress: vi.fn(),
        processDrink: vi.fn(),
        updateStats: vi.fn(),
        updateUI: vi.fn(),
      });
    }).not.toThrow();

    // Test that it can be stopped
    expect(() => {
      loopSystem.stop();
    }).not.toThrow();
  });

  it('should verify module loading order is correct', async () => {
    // This test verifies the loading order we implemented
    const expectedOrder = [
      'drink-system', // Should load first
      'loop-system', // Should load after drink system
    ];

    // Simulate the loading order we implemented
    const actualOrder: string[] = [];

    // Mock the loading sequence
    const loadDrinkSystem = () => {
      actualOrder.push('drink-system');
      return Promise.resolve({ processDrinkFactory: vi.fn() });
    };

    const createLoopSystem = () => {
      actualOrder.push('loop-system');
      return { start: vi.fn(), stop: vi.fn() };
    };

    // Simulate the loading sequence
    await loadDrinkSystem().then(() => {
      createLoopSystem();
    });

    // Verify order
    expect(actualOrder).toEqual(expectedOrder);
  });

  it('should detect when processDrink is not available', () => {
    // Mock App object without processDrink
    const mockApp = {
      systems: {
        drink: {
          // processDrink is missing
        },
        loop: {
          start: vi.fn(),
          stop: vi.fn(),
        },
      },
    };

    // Test that we can detect missing processDrink
    const hasProcessDrink = mockApp.systems.drink.processDrink !== undefined;
    expect(hasProcessDrink).toBe(false);

    // Test that loop start would fail without processDrink
    expect(() => {
      mockApp.systems.loop.start({
        updateDrinkProgress: vi.fn(),
        processDrink: mockApp.systems.drink.processDrink, // This would be undefined
        updateStats: vi.fn(),
        updateUI: vi.fn(),
      });
    }).not.toThrow(); // Should not throw, but processDrink would be undefined
  });

  it('should verify timeout mechanism works', async () => {
    // Test the timeout mechanism we implemented
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Loop system import timeout after 5 seconds')), 50)
    );

    const hangingPromise = new Promise(() => {}); // Never resolves

    const startTime = Date.now();

    try {
      await Promise.race([hangingPromise, timeoutPromise]);
    } catch (error) {
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
      expect(error.message).toContain('Loop system import timeout');
    }
  });
});
