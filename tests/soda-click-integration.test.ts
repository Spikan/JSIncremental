import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handleSodaClickFactory, trackClickFactory } from '../ts/core/systems/clicks-system';
import { useGameStore } from '../ts/core/state/zustand-store';
import { showClickFeedback } from '../ts/ui/feedback';

// Mock Decimal for tests
beforeEach(() => {
  (globalThis as any).Decimal = class MockDecimal {
    private value: number;

    constructor(value: number | string) {
      this.value = typeof value === 'string' ? parseFloat(value) : value;
    }

    add(other: any) {
      const otherValue =
        other instanceof MockDecimal
          ? other.value
          : typeof other === 'string'
            ? parseFloat(other)
            : other;
      return new MockDecimal(this.value + otherValue);
    }

    mul(other: any) {
      const otherValue =
        other instanceof MockDecimal
          ? other.value
          : typeof other === 'string'
            ? parseFloat(other)
            : other;
      return new MockDecimal(this.value * otherValue);
    }

    toString() {
      return String(this.value);
    }

    toNumber() {
      return this.value;
    }
  };
});

// Mock DOM elements
beforeEach(() => {
  // Mock document.getElementById
  global.document.getElementById = vi.fn((id: string) => {
    if (id === 'sodaButton') {
      return {
        parentNode: {
          getBoundingClientRect: () => ({ left: 100, top: 100, width: 200, height: 200 }),
        },
      } as any;
    }
    return null;
  });

  // Mock document.createElement and appendChild
  const mockElement = {
    className: '',
    textContent: '',
    style: { cssText: '' },
    setAttribute: vi.fn(),
    parentNode: null,
  };

  global.document.createElement = vi.fn(() => mockElement as any);

  // Properly mock document.body
  Object.defineProperty(global.document, 'body', {
    value: {
      appendChild: vi.fn(),
    },
    writable: true,
  });
});

// Mock showClickFeedback to avoid DOM manipulation
vi.mock('../ts/ui/feedback', () => ({
  showClickFeedback: vi.fn(),
}));

// Mock hybrid level system
vi.mock('../ts/core/systems/hybrid-level-system', () => ({
  hybridLevelSystem: {
    getCurrentLevelBonuses: () => ({
      sipMultiplier: 1.0,
      clickMultiplier: 1.0,
    }),
  },
}));

// Mock event bus
vi.mock('../ts/services/optimized-event-bus', () => ({
  optimizedEventBus: {
    emit: vi.fn(),
  },
}));

describe('Soda Click Integration Tests', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      sips: 0,
      totalClicks: 0,
      totalSipsEarned: 0,
      suctionClickBonus: 0,
      level: 1,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should increase sips when soda button is clicked', async () => {
    // Get initial state
    const initialState = useGameStore.getState();
    const initialSips = initialState.sips;

    // Create trackClick function
    const trackClick = trackClickFactory();

    // Create handleSodaClick function
    const handleSodaClick = handleSodaClickFactory({ trackClick });

    // Execute soda click
    await handleSodaClick(1.0);

    // Check that sips increased
    const newState = useGameStore.getState();
    expect(newState.sips.toString()).toBe('1'); // Base click value of 1
    expect(parseFloat(newState.sips.toString())).toBeGreaterThan(
      parseFloat(initialSips.toString())
    );
  });

  it('should show click feedback when soda button is clicked', async () => {
    const trackClick = trackClickFactory();
    const handleSodaClick = handleSodaClickFactory({ trackClick });

    await handleSodaClick(1.0);

    // Check that showClickFeedback was called
    expect(showClickFeedback).toHaveBeenCalledWith(
      expect.any(Object), // totalClickValue (Decimal object)
      false, // isCritical
      0, // clickX
      0 // clickY
    );
  });

  it('should track click statistics', async () => {
    const trackClick = trackClickFactory();
    const handleSodaClick = handleSodaClickFactory({ trackClick });

    const initialState = useGameStore.getState();
    const initialClicks = initialState.totalClicks;

    await handleSodaClick(1.0);

    const newState = useGameStore.getState();
    expect(newState.totalClicks).toBe(initialClicks + 1);
  });

  it('should apply suction bonus to click value', async () => {
    // Set up suction bonus
    useGameStore.setState({ suctionClickBonus: 5 });

    const trackClick = trackClickFactory();
    const handleSodaClick = handleSodaClickFactory({ trackClick });

    await handleSodaClick(1.0);

    const newState = useGameStore.getState();
    // Should be base click (1) + suction bonus (5) = 6
    expect(newState.sips.toString()).toBe('6');
  });

  it('should apply level bonuses to click value', async () => {
    // Mock level bonuses
    const mockHybridLevelSystem = {
      getCurrentLevelBonuses: () => ({
        sipMultiplier: 1.0,
        clickMultiplier: 2.0, // 2x multiplier
      }),
    };

    // Re-mock with different multiplier
    vi.doMock('../ts/core/systems/hybrid-level-system', () => ({
      hybridLevelSystem: mockHybridLevelSystem,
    }));

    const trackClick = trackClickFactory();
    const handleSodaClick = handleSodaClickFactory({ trackClick });

    await handleSodaClick(1.0);

    const newState = useGameStore.getState();
    // Should be base click (1) * level multiplier (2) = 2
    expect(newState.sips.toString()).toBe('2');
  });

  it('should update total sips earned', async () => {
    const trackClick = trackClickFactory();
    const handleSodaClick = handleSodaClickFactory({ trackClick });

    const initialState = useGameStore.getState();
    const initialTotal = initialState.totalSipsEarned;

    await handleSodaClick(1.0);

    const newState = useGameStore.getState();
    expect(parseFloat(newState.totalSipsEarned.toString())).toBeGreaterThan(
      parseFloat(initialTotal.toString())
    );
  });

  it('should handle multiple clicks correctly', async () => {
    const trackClick = trackClickFactory();
    const handleSodaClick = handleSodaClickFactory({ trackClick });

    // Click multiple times
    await handleSodaClick(1.0);
    await handleSodaClick(1.0);
    await handleSodaClick(1.0);

    const newState = useGameStore.getState();
    expect(newState.sips.toString()).toBe('3'); // 3 clicks = 3 sips
    expect(newState.totalClicks).toBe(3);
  });

  it('should handle click multiplier parameter', async () => {
    const trackClick = trackClickFactory();
    const handleSodaClick = handleSodaClickFactory({ trackClick });

    await handleSodaClick(2.5); // 2.5x multiplier

    const newState = useGameStore.getState();
    expect(newState.sips.toString()).toBe('2.5'); // 1 * 2.5 = 2.5
  });
});
