// Game Performance Benchmarks
// Tests performance characteristics of core game systems

import { bench, describe } from 'vitest';
import { computeClick } from '../ts/core/rules/clicks';
import {
  computeStrawSPD,
  computeCupSPD,
  computeTotalSPD,
  computeTotalSipsPerDrink,
} from '../ts/core/rules/economy';
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
  },
};

// Benchmark tests require --bench flag to run
// Commenting out until proper benchmark setup
/*
describe('Game Performance Benchmarks', () => {
  // Set up global config for benchmarks
  global.GAME_CONFIG = mockGameConfig;

  describe('Click Computation Performance', () => {
    bench('single click computation', () => {
      computeClick({
        baseClick: 1,
        suctionBonus: 0.5,
        criticalChance: 0.05,
        criticalMultiplier: 5,
      });
    });

    bench('rapid clicking (1000 clicks)', () => {
      for (let i = 0; i < 1000; i++) {
        computeClick({
          baseClick: 1,
          suctionBonus: i * 0.001, // Increasing suction
          criticalChance: 0.05,
          criticalMultiplier: 5,
        });
      }
    });

    bench('high probability critical hits', () => {
      for (let i = 0; i < 100; i++) {
        computeClick({
          baseClick: 1,
          suctionBonus: 0,
          criticalChance: 0.9, // Very high critical chance
          criticalMultiplier: 10,
        });
      }
    });
  });

  describe('Production Calculation Performance', () => {
    bench('small-scale production', () => {
      computeStrawSPD(10, 0.6, 5, 1.2);
      computeCupSPD(5, 1.2, 3, 1.1);
      computeTotalSPD(10, 6, 5, 6.6);
      computeTotalSipsPerDrink(1, 12.6);
    });

    bench('medium-scale production', () => {
      computeStrawSPD(100, 0.6, 25, 1.5);
      computeCupSPD(50, 1.2, 20, 1.4);
      computeTotalSPD(100, 90, 50, 98);
      computeTotalSipsPerDrink(1, 188);
    });

    bench('large-scale production', () => {
      computeStrawSPD(10000, 0.6, 500, 2.0);
      computeCupSPD(5000, 1.2, 300, 1.8);
      computeTotalSPD(10000, 12000, 5000, 12600);
      computeTotalSipsPerDrink(1, 24600);
    });

    bench('extreme-scale production', () => {
      computeStrawSPD(100000, 0.6, 1000, 3.0);
      computeCupSPD(50000, 1.2, 500, 2.5);
      computeTotalSPD(100000, 180000, 50000, 162500);
      computeTotalSipsPerDrink(1, 342500);
    });
  });

  describe('Purchase Calculation Performance', () => {
    bench('early game purchases (first 50)', () => {
      for (let i = 0; i < 50; i++) {
        computeCost(5, 1.08, i); // Straw costs
        computeCost(15, 1.15, Math.floor(i / 2)); // Cup costs
      }
    });

    bench('mid-game purchases (50-200)', () => {
      for (let i = 50; i < 200; i++) {
        computeCost(5, 1.08, i);
        computeCost(15, 1.15, i);
        computeCost(40, 1.12, Math.floor(i / 3));
      }
    });

    bench('late-game purchases (200-500)', () => {
      for (let i = 200; i < 500; i++) {
        computeCost(5, 1.08, i);
        computeCost(15, 1.15, i);
        computeCost(40, 1.12, Math.floor(i / 2));
        computeCost(100, 1.1, Math.floor(i / 4));
      }
    });
  });

  describe('Complex Game State Performance', () => {
    const createGameState = (scale: number) => ({
      sips: 1000 * scale,
      straws: 100 * scale,
      cups: 50 * scale,
      suctions: 20 * scale,
      strawUpgrades: 10 * scale,
      cupUpgrades: 8 * scale,
      level: 1 + scale,
    });

    bench('small game state operations', () => {
      const state = createGameState(1);

      for (let i = 0; i < 100; i++) {
        const strawSPD = computeStrawSPD(state.straws, 0.6, state.strawUpgrades, 1.1);
        const cupSPD = computeCupSPD(state.cups, 1.2, state.cupUpgrades, 1.2);
        const totalSPD = computeTotalSPD(state.straws, strawSPD, state.cups, cupSPD);
        const sipsPerDrink = computeTotalSipsPerDrink(1, totalSPD);

        // Simulate some state updates
        state.sips += sipsPerDrink;
      }
    });

    bench('medium game state operations', () => {
      const state = createGameState(10);

      for (let i = 0; i < 100; i++) {
        const strawSPD = computeStrawSPD(state.straws, 0.6, state.strawUpgrades, 1.1);
        const cupSPD = computeCupSPD(state.cups, 1.2, state.cupUpgrades, 1.2);
        const totalSPD = computeTotalSPD(state.straws, strawSPD, state.cups, cupSPD);
        const sipsPerDrink = computeTotalSipsPerDrink(1, totalSPD);

        state.sips += sipsPerDrink;
      }
    });

    bench('large game state operations', () => {
      const state = createGameState(100);

      for (let i = 0; i < 100; i++) {
        const strawSPD = computeStrawSPD(state.straws, 0.6, state.strawUpgrades, 1.1);
        const cupSPD = computeCupSPD(state.cups, 1.2, state.cupUpgrades, 1.2);
        const totalSPD = computeTotalSPD(state.straws, strawSPD, state.cups, cupSPD);
        const sipsPerDrink = computeTotalSipsPerDrink(1, totalSPD);

        state.sips += sipsPerDrink;
      }
    });
  });

  describe('Memory Usage Benchmarks', () => {
    bench('object creation and destruction', () => {
      const objects: Array<{
        id: number;
        sips: number;
        timestamp: number;
        critical: boolean;
      }> = [];

      for (let i = 0; i < 10000; i++) {
        objects.push({
          id: i,
          sips: Math.random() * 1000,
          timestamp: Date.now(),
          critical: Math.random() < 0.05,
        });
      }

      // Simulate processing
      objects.forEach(obj => {
        if (obj.critical) {
          obj.sips *= 5;
        }
      });

      // Clear memory
      objects.length = 0;
    });

    bench('array operations', () => {
      const array: Array<{
        index: number;
        value: number;
        metadata: { created: number; type: string };
      }> = [];

      // Fill array
      for (let i = 0; i < 50000; i++) {
        array.push({
          index: i,
          value: Math.sin(i) * Math.cos(i),
          metadata: { created: Date.now(), type: 'benchmark' },
        });
      }

      // Process array
      const processed = array.map(item => ({
        ...item,
        processedValue: item.value * 2,
      }));

      // Filter and sort
      const filtered = processed.filter(item => item.processedValue > 0);
      const sorted = filtered.sort((a, b) => b.processedValue - a.processedValue);

      // Take first 1000
      const result = sorted.slice(0, 1000);

      // Benchmark measures the performance of operations
    });

    bench('string operations', () => {
      let result = '';

      for (let i = 0; i < 10000; i++) {
        result += `item-${i}-with-value-${Math.random()}-`;
      }

      // Process the string
      const parts = result.split('-');
      const numbers = parts.filter(p => !isNaN(Number(p)));
      const sum = numbers.reduce((acc, num) => acc + Number(num), 0);

      // Benchmark measures string processing performance
    });
  });

  describe('Algorithm Complexity Benchmarks', () => {
    bench('linear search performance', () => {
      const array = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        value: Math.random(),
      }));

      // Linear search
      for (let i = 0; i < 100; i++) {
        const targetId = Math.floor(Math.random() * array.length);
        const found = array.find(item => item.id === targetId);
        // Benchmark measures search performance
      }
    });

    bench('sorting performance', () => {
      for (let size = 100; size <= 1000; size += 100) {
        const array = Array.from({ length: size }, () => Math.random());

        // Sort the array
        array.sort((a, b) => a - b);

        // Benchmark measures sorting performance
      }
    });

    bench('mathematical computation intensity', () => {
      const iterations = 100000;

      let result = 0;

      for (let i = 0; i < iterations; i++) {
        // Complex mathematical operations
        result += Math.sin(i) * Math.cos(i) + Math.sqrt(i + 1) + Math.log(i + 2);
        result = Math.abs(result) % 10000; // Prevent overflow
      }

      // Benchmark measures mathematical computation performance
    });
  });

  describe('Real-World Load Testing', () => {
    bench('simulated user session (5 minutes)', () => {
      let gameState = {
        sips: 100,
        straws: 5,
        cups: 2,
        suctions: 1,
        level: 1,
        totalClicks: 0,
      };

      // Simulate 5 minutes of gameplay (300 seconds)
      const totalTime = 300;
      const timeStep = 1; // 1 second

      for (let time = 0; time < totalTime; time += timeStep) {
        // Calculate production
        const strawSPD = computeStrawSPD(gameState.straws, 0.6, 0, 1);
        const cupSPD = computeCupSPD(gameState.cups, 1.2, 0, 1);
        const totalSPD = computeTotalSPD(gameState.straws, strawSPD, gameState.cups, cupSPD);

        // Add production
        gameState.sips += totalSPD;

        // Simulate occasional clicking (every 2 seconds)
        if (time % 2 === 0) {
          const clickResult = computeClick({
            baseClick: 1,
            suctionBonus: gameState.suctions * 0.3,
            criticalChance: 0.05,
            criticalMultiplier: 5,
          });

          gameState.sips += Number(clickResult.gained);
          gameState.totalClicks++;
        }

        // Try to purchase upgrades occasionally
        if (time % 10 === 0) {
          // Every 10 seconds
          // Try to buy straw
          const strawCost = computeCost(5, 1.08, gameState.straws);
          if (gameState.sips >= strawCost && gameState.straws < 20) {
            gameState.sips -= strawCost;
            gameState.straws++;
          }

          // Try to buy cup
          const cupCost = computeCost(15, 1.15, gameState.cups);
          if (gameState.sips >= cupCost && gameState.cups < 10) {
            gameState.sips -= cupCost;
            gameState.cups++;
          }
        }
      }

      // Benchmark measures user session simulation performance
    });

    bench('concurrent operations simulation', () => {
      // Simulate multiple operations happening simultaneously
      const operations: Array<{
        type: string;
        timestamp: number;
        data: { sips: number; item: string };
      }> = [];

      // Generate 1000 random operations
      for (let i = 0; i < 1000; i++) {
        operations.push({
          type: ['click', 'purchase', 'production', 'upgrade'][Math.floor(Math.random() * 4)],
          timestamp: i,
          data: {
            sips: Math.random() * 100,
            item: Math.random() > 0.5 ? 'straw' : 'cup',
          },
        });
      }

      // Process all operations
      let totalSips = 0;
      let totalPurchases = 0;
      let totalClicks = 0;

      operations.forEach(op => {
        switch (op.type) {
          case 'click':
            totalClicks++;
            totalSips += op.data.sips;
            break;
          case 'purchase':
            totalPurchases++;
            totalSips -= op.data.sips; // Cost
            break;
          case 'production':
            totalSips += op.data.sips;
            break;
          case 'upgrade':
            // Upgrade logic
            break;
        }
      });

      // Benchmark measures concurrent operation processing performance
    });
  });
});
*/
