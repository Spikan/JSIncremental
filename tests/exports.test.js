import { describe, it, expect } from 'vitest';

// Import public modules to assert they load and have expected exports
import * as Constants from '../js/core/constants.js';
import * as Clicks from '../js/core/rules/clicks.js';
import * as Purchases from '../js/core/rules/purchases';
import * as Economy from '../js/core/rules/economy.js';
import * as Resources from '../js/core/systems/resources.js';
import * as EventBus from '../js/services/event-bus.js';

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
