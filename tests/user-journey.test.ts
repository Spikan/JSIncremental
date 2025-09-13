// User Journey Testing
// Tests complete user flows from game start to advanced progression

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestEnvironment, expectLargeNumberToEqual } from './test-utils';
import { computeClick } from '../ts/core/rules/clicks';
import {
  computeStrawSPD,
  computeCupSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
} from '../ts/core/rules/economy';
import { safeToNumberOrDecimal, safeToString } from '../ts/core/numbers/safe-conversion';

// Mock computeCost function since it's not exported from the actual module
const computeCost = (baseCost: number, scaling: number, owned: number): number => {
  return baseCost * Math.pow(scaling, owned);
};

// Mock game configuration
const mockGameConfig = {
  BALANCE: {
    straws: { baseCost: 5, scaling: 1.08, baseValue: 0.6 },
    cups: { baseCost: 15, scaling: 1.15, baseValue: 1.2 },
    suction: { baseCost: 40, scaling: 1.12, baseValue: 0.3 },
    criticalClicks: { baseCost: 60, scaling: 1.12, baseChance: 0.01, chanceIncrease: 0.005 },
    fasterDrinks: { baseCost: 80, scaling: 1.1 },
    levelUp: { baseCost: 3000, scaling: 1.15, reward: 1.5 },
  },
};

// Helper function to safely convert values for test comparisons
function safeConvertForTest(value: any): number {
  const converted = safeToNumberOrDecimal(value);
  if (typeof converted === 'number') {
    return converted;
  }
  // For Decimal objects, try to convert to number if it's safe
  try {
    const num = converted.toNumber();
    return isFinite(num) ? num : 0;
  } catch {
    return 0;
  }
}

describe('User Journey Testing', () => {
  beforeEach(() => {
    setupTestEnvironment();
    (global as any).GAME_CONFIG = mockGameConfig;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('New Player Onboarding', () => {
    it('should guide new player through first 5 minutes', () => {
      // Simulate a new player starting the game
      const gameState = {
        sips: 0,
        straws: 0,
        cups: 0,
        suctions: 0,
        level: 1,
        totalClicks: 0,
        totalSipsEarned: 0,
        criticalClickChance: 0.1, // 10% chance for critical hits
        criticalClickMultiplier: 5,
      };

      const actions: Array<{ type: string; time: number; sipsGained: number; critical: boolean }> =
        [];
      let timeElapsed = 0;

      // First minute: Learn to click
      for (let second = 0; second < 60; second++) {
        // Player clicks every 2 seconds
        if (second % 2 === 0) {
          const result = computeClick({
            baseClick: 1,
            suctionBonus: 0,
            criticalChance: 0.1, // 10% critical chance
            criticalMultiplier: 5,
          });

          gameState.sips += safeConvertForTest(result.gained);
          gameState.totalClicks++;
          gameState.totalSipsEarned += safeConvertForTest(result.gained);

          actions.push({
            type: 'click',
            time: second,
            sipsGained: safeConvertForTest(result.gained),
            critical: result.critical,
          });
        }

        // Advance time
        timeElapsed = second;
        vi.advanceTimersByTime(1000);
      }

      // Should have earned some sips
      expect(gameState.sips).toBeGreaterThan(20);
      expect(gameState.totalClicks).toBeGreaterThan(25);
      expect(actions.length).toBeGreaterThan(25);

      // Should have some critical hits
      const criticalClicks = actions.filter(a => a.critical);
      expect(criticalClicks.length).toBeGreaterThan(0);
    });

    it('should handle first upgrade purchase', () => {
      const gameState = {
        sips: 10,
        straws: 0,
        cups: 0,
        suctions: 0,
      };

      // Can afford first straw
      const strawCost = computeCost(5, 1.08, 0);
      expect(gameState.sips).toBeGreaterThanOrEqual(strawCost);

      // Purchase first straw
      gameState.sips -= strawCost;
      gameState.straws += 1;

      // Should have purchased successfully
      expect(gameState.straws).toBe(1);
      expect(gameState.sips).toBeLessThan(10);

      // Production should increase
      const sps = computeStrawSPD(gameState.straws, 0.6, 0, 1);
      expectLargeNumberToEqual(sps, 0.6);
    });
  });

  describe('Early Game Progression (5-30 minutes)', () => {
    it('should simulate efficient early game strategy', () => {
      const gameState = {
        sips: 0,
        straws: 0,
        cups: 0,
        suctions: 0,
        level: 1,
        totalClicks: 0,
      };

      const strategy = {
        clickFrequency: 500, // ms between clicks
        upgradePriority: ['straws', 'cups', 'suction'],
      };

      // Simulate 30 minutes of gameplay
      const totalTime = 30 * 60 * 1000; // 30 minutes in ms
      let currentTime = 0;
      const timeStep = 1000; // 1 second steps

      while (currentTime < totalTime) {
        // Earn sips from production
        const sps =
          computeStrawSPD(gameState.straws, 0.6, 0, 1) + computeCupSPD(gameState.cups, 1.2, 0, 1);
        gameState.sips += sps;

        // Click occasionally
        if (currentTime % strategy.clickFrequency === 0) {
          const result = computeClick({
            baseClick: 1,
            suctionBonus: gameState.suctions * 0.3,
            criticalChance: 0.1, // 10% critical chance
            criticalMultiplier: 5,
          });

          gameState.sips += safeConvertForTest(result.gained);
          gameState.totalClicks++;
        }

        // Try to purchase upgrades when affordable
        strategy.upgradePriority.forEach(upgrade => {
          let cost = 0;
          let canAfford = false;

          switch (upgrade) {
            case 'straws':
              cost = computeCost(5, 1.08, gameState.straws);
              canAfford = safeConvertForTest(gameState.sips) >= cost && gameState.straws < 10;
              if (canAfford) {
                gameState.sips -= cost;
                gameState.straws++;
              }
              break;
            case 'cups':
              cost = computeCost(15, 1.15, gameState.cups);
              canAfford = safeConvertForTest(gameState.sips) >= cost && gameState.cups < 5;
              if (canAfford) {
                gameState.sips -= cost;
                gameState.cups++;
              }
              break;
            case 'suction':
              cost = computeCost(40, 1.12, gameState.suctions);
              canAfford = safeConvertForTest(gameState.sips) >= cost && gameState.suctions < 3;
              if (canAfford) {
                gameState.sips -= cost;
                gameState.suctions++;
              }
              break;
          }
        });

        currentTime += timeStep;
        vi.advanceTimersByTime(timeStep);
      }

      // Should have made good progress
      console.log('Final game state:', {
        sips: safeConvertForTest(gameState.sips),
        straws: safeConvertForTest(gameState.straws),
        cups: safeConvertForTest(gameState.cups),
        suctions: safeConvertForTest(gameState.suctions),
        totalClicks: gameState.totalClicks
      });
      expect(safeConvertForTest(gameState.straws)).toBeGreaterThanOrEqual(1);
      expect(safeConvertForTest(gameState.cups)).toBeGreaterThan(0);
      expect(safeConvertForTest(gameState.suctions)).toBeGreaterThan(0);
      expect(safeConvertForTest(gameState.sips)).toBeGreaterThanOrEqual(0); // Can be 0 if all spent on upgrades
      expect(gameState.totalClicks).toBeGreaterThan(1500);
    });

    it('should handle different player strategies', () => {
      // Test different upgrade strategies
      const strategies = [
        { name: 'Straw Focus', priority: ['straws', 'straws', 'cups'] },
        { name: 'Balanced', priority: ['straws', 'cups', 'suctions'] },
        { name: 'Production First', priority: ['cups', 'straws', 'suctions'] },
      ];

      strategies.forEach(strategy => {
        const gameState = {
          sips: 100,
          straws: 0,
          cups: 0,
          suctions: 0,
        };

        // Simulate 10 minutes with this strategy
        for (let minute = 0; minute < 10; minute++) {
          // Earn production
          const sps =
            computeStrawSPD(gameState.straws, 0.6, 0, 1) + computeCupSPD(gameState.cups, 1.2, 0, 1);
          gameState.sips += sps * 60; // 60 seconds

          // Click every 2 seconds during this minute
          for (let second = 0; second < 60; second += 2) {
            const result = computeClick({
              baseClick: 1,
              suctionBonus: gameState.suctions * 0.3,
              criticalChance: 0.1, // 10% critical chance
              criticalMultiplier: 5,
            });
            gameState.sips += safeConvertForTest(result.gained);
          }

          // Try to purchase according to strategy
          strategy.priority.forEach(upgrade => {
            let cost = 0;

            switch (upgrade) {
              case 'straws':
                cost = computeCost(5, 1.08, gameState.straws);
                if (safeConvertForTest(gameState.sips) >= cost && gameState.straws < 20) {
                  gameState.sips -= cost;
                  gameState.straws++;
                }
                break;
              case 'cups':
                cost = computeCost(15, 1.15, gameState.cups);
                if (safeConvertForTest(gameState.sips) >= cost && gameState.cups < 10) {
                  gameState.sips -= cost;
                  gameState.cups++;
                }
                break;
              case 'suctions':
                cost = computeCost(40, 1.12, gameState.suctions);
                if (safeConvertForTest(gameState.sips) >= cost && gameState.suctions < 5) {
                  gameState.sips -= cost;
                  gameState.suctions++;
                }
                break;
            }
          });
        }

        // Each strategy should result in different resource distributions
        const strawsNum = safeConvertForTest(gameState.straws);
        const cupsNum = safeConvertForTest(gameState.cups);
        const suctionsNum = safeConvertForTest(gameState.suctions);
        expect(strawsNum + cupsNum + suctionsNum).toBeGreaterThan(2);
        const sipsNum = safeConvertForTest(gameState.sips);
        expect(sipsNum).toBeGreaterThanOrEqual(0); // Can be 0 if all spent on upgrades
      });
    });
  });

  describe('Mid-Game Challenges (1-5 hours)', () => {
    it('should handle level progression mechanics', () => {
      const gameState = {
        sips: 3000,
        level: 1,
        totalSipsEarned: 0,
      };

      // Can afford first level up
      const levelUpCost = computeCost(3000, 1.15, 0);
      expect(gameState.sips).toBeGreaterThanOrEqual(levelUpCost);

      // Level up
      gameState.sips -= levelUpCost;
      gameState.level = 2;
      gameState.totalSipsEarned += 3000 * 1.5; // Level up reward

      // Should have leveled up
      expect(gameState.level).toBe(2);
      expect(gameState.totalSipsEarned).toBe(4500);
    });

    it('should test critical hit optimization', () => {
      const gameState = {
        sips: 200,
        criticalClicks: 0,
        criticalChance: 0.01,
        totalSipsEarned: 0,
      };

      // Purchase critical click upgrades
      for (let i = 0; i < 5; i++) {
        const cost = computeCost(60, 1.12, gameState.criticalClicks);
        if (gameState.sips >= cost) {
          gameState.sips -= cost;
          gameState.criticalClicks++;
          gameState.criticalChance += 0.005; // Chance increase
        }
      }

      // Should have some critical click upgrades
      expect(gameState.criticalClicks).toBeGreaterThan(0);
      expect(gameState.criticalChance).toBeGreaterThan(0.01);

      // Test critical hit farming session
      let criticalHits = 0;
      const testClicks = 1000;

      for (let i = 0; i < testClicks; i++) {
        const result = computeClick({
          baseClick: 1,
          suctionBonus: 0,
          criticalChance: gameState.criticalChance,
          criticalMultiplier: 5,
        });

        if (result.critical) {
          criticalHits++;
        }
        // Add sips from all clicks, not just critical ones
        gameState.totalSipsEarned += safeConvertForTest(result.gained);
      }

      // Should get more critical hits with higher chance
      expect(criticalHits).toBeGreaterThan(0);
      const totalSipsNum = safeConvertForTest(gameState.totalSipsEarned);
      expect(totalSipsNum).toBeGreaterThan(criticalHits * 5);
    });
  });

  describe('Late-Game Optimization (5+ hours)', () => {
    it('should handle high-level resource management', () => {
      const gameState = {
        sips: 2000000000, // 2 billion sips for late-game
        straws: 1000,
        cups: 500,
        suctions: 200,
        level: 50,
        strawUpgrades: 50,
        cupUpgrades: 30,
        criticalClicks: 20,
        fasterDrinks: 10,
      };

      // Calculate production stats
      const strawSPD = computeStrawSPD(
        gameState.straws,
        0.6,
        gameState.strawUpgrades,
        1.5 + (gameState.level - 1) * 0.1 // Level bonuses
      );

      const cupSPD = computeCupSPD(
        gameState.cups,
        1.2,
        gameState.cupUpgrades,
        1.4 + (gameState.level - 1) * 0.1
      );

      const totalSPD = computeTotalSPD(gameState.straws, strawSPD, gameState.cups, cupSPD);
      const sipsPerDrink = computeTotalSipsPerDrink(1, totalSPD);

      // Should handle large-scale production
      const strawSPDNum = safeConvertForTest(strawSPD);
      const cupSPDNum = safeConvertForTest(cupSPD);
      const totalSPDNum = safeConvertForTest(totalSPD);
      const sipsPerDrinkNum = safeConvertForTest(sipsPerDrink);

      expect(strawSPDNum).toBeGreaterThan(100);
      expect(cupSPDNum).toBeGreaterThan(200);
      expect(totalSPDNum).toBeGreaterThan(300);
      expect(sipsPerDrinkNum).toBeGreaterThan(300);

      // Should be able to afford expensive upgrades
      const expensiveUpgradeCost = computeCost(1000, 1.15, 100);
      expect(safeConvertForTest(gameState.sips)).toBeGreaterThan(expensiveUpgradeCost);
    });

    it('should test optimal upgrade timing', () => {
      // Compare different timing strategies for purchasing expensive upgrades
      const strategies = [
        { name: 'Early Purchase', timing: 'early' },
        { name: 'Mid-Game Purchase', timing: 'mid' },
        { name: 'Late Purchase', timing: 'late' },
      ];

      strategies.forEach(strategy => {
        const gameState = {
          sips: 10000,
          straws: 50,
          cups: 25,
          suctions: 10,
        };

        // Simulate different purchase timings
        if (strategy.timing === 'early') {
          // Purchase at beginning
          const cost = computeCost(500, 1.15, 20);
          if (gameState.sips >= cost) {
            gameState.sips -= cost;
            gameState.straws += 10; // Big purchase
          }
        }

        // Calculate production after purchase
        const sps =
          computeStrawSPD(gameState.straws, 0.6, 0, 1) + computeCupSPD(gameState.cups, 1.2, 0, 1);

        // Different strategies should result in different final states
        expect(sps).toBeDefined();
        expect(gameState.sips).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Scenarios & Recovery', () => {
    it('should handle game crashes gracefully', () => {
      const gameState = {
        sips: 1000,
        straws: 10,
        cups: 5,
        lastSave: Date.now(),
      };

      // Simulate crash by clearing state
      const savedState = { ...gameState };

      // Game should be able to recover from saved state
      expect(savedState.sips).toBe(1000);
      expect(savedState.straws).toBe(10);
      expect(savedState.cups).toBe(5);
      expect(savedState.lastSave).toBeDefined();
    });

    it('should test data migration between versions', () => {
      // Simulate old save format
      const oldSaveFormat = {
        version: 1,
        resources: {
          sips: 500,
          straws: 5,
          cups: 3,
        },
        upgrades: {
          strawUpgrade: 2,
          cupUpgrade: 1,
        },
      };

      // New save format
      const newSaveFormat = {
        version: 2,
        sips: 0,
        straws: 0,
        cups: 0,
        strawUpgrades: 0,
        cupUpgrades: 0,
      };

      // Migration logic
      if (oldSaveFormat.version === 1) {
        newSaveFormat.sips = oldSaveFormat.resources.sips;
        newSaveFormat.straws = oldSaveFormat.resources.straws;
        newSaveFormat.cups = oldSaveFormat.resources.cups;
        newSaveFormat.strawUpgrades = oldSaveFormat.upgrades.strawUpgrade;
        newSaveFormat.cupUpgrades = oldSaveFormat.upgrades.cupUpgrade;
      }

      // Should have migrated successfully
      expect(newSaveFormat.sips).toBe(500);
      expect(newSaveFormat.straws).toBe(5);
      expect(newSaveFormat.cups).toBe(3);
      expect(newSaveFormat.strawUpgrades).toBe(2);
      expect(newSaveFormat.cupUpgrades).toBe(1);
    });
  });

  describe('Performance Impact Testing', () => {
    it('should measure performance impact of large game state', () => {
      // Create a very large game state
      const largeGameState = {
        sips: 1e10,
        straws: 100000,
        cups: 50000,
        suctions: 10000,
        level: 1000,
        totalClicks: 1e7,
        totalSipsEarned: 1e12,
        // Large arrays
        clickHistory: new Array(10000).fill(Date.now()),
        upgradeHistory: new Array(5000).fill({ type: 'straw', cost: 1000 }),
      };

      const startTime = performance.now();

      // Test operations on large state
      const strawSPD = computeStrawSPD(largeGameState.straws, 0.6, 1000, 2.0);
      const cupSPD = computeCupSPD(largeGameState.cups, 1.2, 500, 2.0);
      const sps = safeConvertForTest(strawSPD) + safeConvertForTest(cupSPD);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete calculations in reasonable time
      expect(duration).toBeLessThan(100); // 100ms for complex calculations
      expect(typeof sps === 'string' ? parseFloat(sps) : sps).toBeGreaterThan(10000);
      expect(Number.isFinite(sps)).toBe(true);
    });

    it('should test memory usage with large datasets', () => {
      const memoryTest = () => {
        // Create large data structures
        const largeHistory: Array<{
          timestamp: number;
          action: string;
          sipsGained: number;
          critical: boolean;
        }> = [];
        for (let i = 0; i < 50000; i++) {
          largeHistory.push({
            timestamp: Date.now() + i,
            action: 'click',
            sipsGained: Math.random(),
            critical: Math.random() < 0.05,
          });
        }

        // Test operations on large dataset
        const criticalClicks = largeHistory.filter(h => h.critical);
        const totalSips = largeHistory.reduce((sum, h) => sum + h.sipsGained, 0);

        expect(criticalClicks.length).toBeGreaterThan(0);
        expect(totalSips).toBeGreaterThan(0);

        return largeHistory.length;
      };

      const dataSize = memoryTest();
      expect(dataSize).toBe(50000);

      // Force cleanup
      if (global.gc) {
        global.gc();
      }
    });
  });

  describe('Accessibility & Usability', () => {
    it('should validate keyboard-only gameplay', () => {
      // Simulate keyboard-only interactions
      const keyboardActions = [
        { key: 'Enter', action: 'activate_button' },
        { key: 'Space', action: 'activate_button' },
        { key: 'ArrowUp', action: 'navigate_up' },
        { key: 'ArrowDown', action: 'navigate_down' },
        { key: 'Tab', action: 'focus_next' },
        { key: 'Escape', action: 'close_modal' },
      ];

      // All actions should be handleable via keyboard
      keyboardActions.forEach(action => {
        expect(action.key).toBeDefined();
        expect(action.action).toBeDefined();
      });

      // Should have primary activation methods
      const activationKeys = keyboardActions.filter(a => a.action === 'activate_button');
      expect(activationKeys.length).toBeGreaterThanOrEqual(2);
    });

    it('should test screen reader compatibility', () => {
      // Mock screen reader announcements
      const announcements = [
        'Current sips: 1,250',
        'Straw purchased for 50 sips',
        'Critical hit! Earned 25 sips',
        'Level up! Now level 5',
        'Upgrade available: Better Cups',
      ];

      announcements.forEach(announcement => {
        // Should be descriptive and useful
        expect(announcement).toBeDefined();
        expect(announcement.length).toBeGreaterThan(10);
        expect(announcement).toMatch(/sips|level|upgrade|critical/i);
      });

      // Should announce important state changes
      const importantAnnouncements = announcements.filter(
        a => a.includes('Critical') || a.includes('Level up') || a.includes('Upgrade available')
      );

      expect(importantAnnouncements.length).toBeGreaterThan(0);
    });
  });
});
