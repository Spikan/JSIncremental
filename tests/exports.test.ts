import { describe, it, expect } from 'vitest';

// Import public modules to assert they load and have expected exports
import * as Constants from '../js/core/constants.ts';
import * as Clicks from '../js/core/rules/clicks';
import * as Purchases from '../js/core/rules/purchases';
import * as Economy from '../js/core/rules/economy';
import * as Resources from '../js/core/systems/resources';
import * as EventBus from '../js/services/event-bus.ts';



declare global {
  var window: {
    App?: any;
    Decimal?: any;
    localStorage?: Storage;
    fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  };
  var document: {
    getElementById?: (id: string) => HTMLElement | null;
    querySelector?: (selectors: string) => Element | null;
    addEventListener?: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  };
  var console: {
    log?: (...data: any[]) => void;
    warn?: (...data: any[]) => void;
    error?: (...data: any[]) => void;
  };
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
