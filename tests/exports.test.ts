import { describe, it, expect } from 'vitest';

// Import public modules to assert they load and have expected exports
import * as Constants from '../ts/core/constants.ts';
import * as Clicks from '../ts/core/rules/clicks';
import * as Purchases from '../ts/core/rules/purchases';
import * as Economy from '../ts/core/rules/economy';
import * as Resources from '../ts/core/systems/resources';
import * as EventBus from '../ts/services/event-bus.ts';

// Extend existing global types
declare global {
  interface Window {
    App?: any;
    GAME_CONFIG?: any;
    DOM_CACHE?: any;
    FEATURE_UNLOCKS?: any;
  }
}

describe('Module exports sanity', () => {
  it('constants exports EVENT_NAMES', () => {
    expect(typeof Constants.EVENT_NAMES).toBe('object');
  });

  it('clicks exports computeClick', () => {
    expect(typeof Clicks.computeClick).toBe('function');
  });

  it('purchases exports nextStrawCost and nextCupCost', () => {
    expect(typeof Purchases.nextStrawCost).toBe('function');
    expect(typeof Purchases.nextCupCost).toBe('function');
  });

  it('economy exports core functions', () => {
    expect(typeof Economy.computeStrawSPD).toBe('function');
    expect(typeof Economy.computeCupSPD).toBe('function');
    expect(typeof Economy.computeTotalSPD).toBe('function');
  });

  it('resources exports recalcProduction', () => {
    expect(typeof Resources.recalcProduction).toBe('function');
  });

  it('event-bus exports bus', () => {
    expect(typeof EventBus.bus).toBe('object');
    expect(typeof EventBus.createEventBus).toBe('function');
  });
});
