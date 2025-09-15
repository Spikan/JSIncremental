// Offline Progression System Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateOfflineProgression,
  applyOfflineProgression,
  formatOfflineTime,
} from '../ts/core/systems/offline-progression';
import { Decimal } from './test-utils';

// Mock window and global objects
const mockWindow = {
  App: {
    state: {
      getState: vi.fn(),
      setState: vi.fn(),
    },
    ui: {
      updateTopSipsPerDrink: vi.fn(),
      updateTopSipsPerSecond: vi.fn(),
      updateAllStats: vi.fn(),
    },
  },
};

const mockState = {
  lastSaveTime: 0,
  drinkRate: 5000, // 5 seconds per drink
  spd: new Decimal(10), // 10 sips per drink
  totalSipsEarned: new Decimal(0),
};

// Mock globals
let mockSips = new Decimal(100);

beforeEach(() => {
  vi.clearAllMocks();

  // Reset mocks
  mockState.lastSaveTime = Date.now() - 60 * 60 * 1000; // 1 hour ago
  mockState.spd = new Decimal(10);
  mockSips = new Decimal(100);

  // Setup window mock
  (global as any).window = {
    ...mockWindow,
    sips: mockSips,
    lastSaveTime: mockState.lastSaveTime,
  };

  mockWindow.App.state.getState.mockReturnValue(mockState);
});

describe('Offline Progression System', () => {
  describe('calculateOfflineProgression', () => {
    it('should calculate offline earnings correctly', () => {
      // Setup: Player was away for 1 hour with 10 SPD and 5-second drink rate
      const now = Date.now();
      mockState.lastSaveTime = now - 60 * 60 * 1000; // 1 hour ago

      const result = calculateOfflineProgression();

      expect(result.wasActive).toBe(true);
      expect(result.timeAway).toBe(60 * 60 * 1000); // 1 hour in milliseconds

      // 1 hour = 3600 seconds, drink every 5 seconds = 720 drinks
      expect(result.drinksProcessed).toBe(720);

      // 720 drinks × 10 SPD = 7200 sips
      expect(result.sipsEarned).toBe('7200');
    });

    it('should respect minimum offline time', () => {
      // Setup: Player was away for only 30 seconds
      const now = Date.now();
      mockState.lastSaveTime = now - 30 * 1000; // 30 seconds ago

      const result = calculateOfflineProgression({ minOfflineMinutes: 1 });

      expect(result.wasActive).toBe(false);
      expect(result.sipsEarned).toBe('0');
      expect(result.drinksProcessed).toBe(0);
    });

    it('should cap offline time correctly', () => {
      // Setup: Player was away for 12 hours, but cap at 8 hours
      const now = Date.now();
      mockState.lastSaveTime = now - 12 * 60 * 60 * 1000; // 12 hours ago

      const result = calculateOfflineProgression({ maxOfflineHours: 8 });

      expect(result.wasActive).toBe(true);
      expect(result.timeAway).toBe(12 * 60 * 60 * 1000); // Full 12 hours
      expect(result.cappedAt).toBe(8 * 60 * 60 * 1000); // But capped at 8 hours

      // Should only calculate for 8 hours: 8 * 3600 / 5 = 5760 drinks
      expect(result.drinksProcessed).toBe(5760);

      // 5760 drinks × 10 SPD = 57600 sips
      expect(result.sipsEarned).toBe('57600');
    });

    it('should handle efficiency multiplier', () => {
      // Setup: Player was away for 1 hour with 50% efficiency
      const now = Date.now();
      mockState.lastSaveTime = now - 60 * 60 * 1000; // 1 hour ago

      const result = calculateOfflineProgression({ offlineEfficiency: 0.5 });

      expect(result.wasActive).toBe(true);
      expect(result.drinksProcessed).toBe(720); // Same number of drinks

      // But only 50% efficiency: 720 × 10 × 0.5 = 3600 sips
      expect(result.sipsEarned).toBe('3600');
    });

    it('should handle zero SPD gracefully', () => {
      mockState.spd = new Decimal(0);

      const now = Date.now();
      mockState.lastSaveTime = now - 60 * 60 * 1000; // 1 hour ago

      const result = calculateOfflineProgression();

      expect(result.wasActive).toBe(true);
      expect(result.drinksProcessed).toBe(720);
      expect(result.sipsEarned).toBe('0'); // 0 SPD = 0 sips
    });
  });

  describe('applyOfflineProgression', () => {
    it('should apply offline earnings to game state', () => {
      const offlineResult = {
        timeAway: 60 * 60 * 1000,
        sipsEarned: '1000',
        drinksProcessed: 100,
        cappedAt: 8 * 60 * 60 * 1000,
        wasActive: true,
      };

      const success = applyOfflineProgression(offlineResult);

      expect(success).toBe(true);

      // Should update sips: 100 + 1000 = 1100
      expect((global as any).window.sips.toString()).toBe('1100');

      // Should update state
      expect(mockWindow.App.state.setState).toHaveBeenCalledWith({
        sips: expect.any(Decimal),
        totalSipsEarned: expect.any(Decimal),
        lastSaveTime: expect.any(Number),
      });

      // Should update UI
      expect(mockWindow.App.ui.updateTopSipsPerDrink).toHaveBeenCalled();
      expect(mockWindow.App.ui.updateTopSipsPerSecond).toHaveBeenCalled();
      expect(mockWindow.App.ui.updateAllStats).toHaveBeenCalled();
    });

    it('should not apply inactive offline progression', () => {
      const offlineResult = {
        timeAway: 30 * 1000,
        sipsEarned: '0',
        drinksProcessed: 0,
        cappedAt: 8 * 60 * 60 * 1000,
        wasActive: false,
      };

      const success = applyOfflineProgression(offlineResult);

      expect(success).toBe(false);
      expect(mockWindow.App.state.setState).not.toHaveBeenCalled();
    });
  });

  describe('formatOfflineTime', () => {
    it('should format time correctly', () => {
      expect(formatOfflineTime(45 * 1000)).toBe('45s');
      expect(formatOfflineTime(2 * 60 * 1000 + 30 * 1000)).toBe('2m 30s');
      expect(formatOfflineTime(1 * 60 * 60 * 1000 + 15 * 60 * 1000)).toBe('1h 15m');
      expect(formatOfflineTime(3 * 60 * 60 * 1000)).toBe('3h 0m');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle realistic game scenario', () => {
      // Realistic scenario: Player has some upgrades, was away for 2 hours
      mockState.spd = new Decimal(25.5); // Some upgrades
      mockState.drinkRate = 3000; // Faster drinks from upgrades

      const now = Date.now();
      mockState.lastSaveTime = now - 2 * 60 * 60 * 1000; // 2 hours ago

      const result = calculateOfflineProgression();

      expect(result.wasActive).toBe(true);

      // 2 hours = 7200 seconds, drink every 3 seconds = 2400 drinks
      expect(result.drinksProcessed).toBe(2400);

      // 2400 drinks × 25.5 SPD = 61200 sips
      expect(result.sipsEarned).toBe('61200');

      // Apply the earnings
      const success = applyOfflineProgression(result);
      expect(success).toBe(true);
    });
  });
});
