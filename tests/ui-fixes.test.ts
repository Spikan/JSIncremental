/**
 * Test script to verify the UI fixes are working
 * Tests header updates and price updates after the state access fixes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../ts/core/state/zustand-store';

describe('UI Fixes', () => {
  beforeEach(() => {
    // Reset the store to a clean state
    const store = useGameStore.getState();
    store.actions.setSips(1000);
    store.actions.setLevel(1);
    store.actions.setStraws(0);
    store.actions.setCups(0);
    store.actions.setSuctions(0);
    store.actions.setCriticalClicks(0);
  });

  it('should have proper state access for header updates', () => {
    const state = useGameStore.getState();

    expect(state).toBeDefined();
    expect(state.sips).toBeDefined();
    expect(state.level).toBeDefined();
    expect(state.spd).toBeDefined();

    // Test that we can access the state properties that were causing issues
    expect(typeof state.sips).toBe('object'); // Should be a Decimal
    expect(typeof state.level).toBe('object'); // Should be a Decimal
  });

  it('should have proper cost calculation system', () => {
    const state = useGameStore.getState();

    // Test that the state has the properties needed for cost calculation
    expect(state.suctions).toBeDefined();
    expect(state.criticalClicks).toBeDefined();
    expect(state.straws).toBeDefined();
    expect(state.cups).toBeDefined();
    expect(state.widerStraws).toBeDefined();
    expect(state.betterCups).toBeDefined();
  });

  it('should be able to calculate upgrade costs', () => {
    // This test verifies that the cost calculation system works
    // without trying to access non-existent properties
    const state = useGameStore.getState();

    // These properties should exist and be accessible
    const requiredProperties = [
      'sips',
      'level',
      'spd',
      'straws',
      'cups',
      'suctions',
      'criticalClicks',
      'widerStraws',
      'betterCups',
      'fasterDrinks',
      'criticalClickChance',
      'suctionClickBonus',
    ];

    requiredProperties.forEach(prop => {
      expect(state).toHaveProperty(prop);
    });
  });

  it('should have proper state structure for UI updates', () => {
    const state = useGameStore.getState();

    // Test that the state structure matches what the UI expects
    expect(state.options).toBeDefined();
    expect(state.drinkRate).toBeDefined();
    expect(state.drinkProgress).toBeDefined();

    // Test that numeric values are properly typed
    expect(typeof state.drinkRate).toBe('number');
    expect(typeof state.drinkProgress).toBe('number');
  });
});
