import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_eternity.js';
import { performSaveSnapshot } from '../ts/core/systems/save-system';
import { saveGameLoader } from '../ts/core/systems/save-game-loader';
import { useGameStore } from '../ts/core/state/zustand-store';

describe('save-game-loader regression', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      sips: new Decimal(0),
      straws: new Decimal(0),
      cups: new Decimal(0),
      suctions: new Decimal(0),
      widerStraws: new Decimal(0),
      betterCups: new Decimal(0),
      fasterDrinks: new Decimal(0),
      spd: new Decimal(1),
      strawSPD: new Decimal(0),
      cupSPD: new Decimal(0),
      totalClicks: 0,
      totalSipsEarned: new Decimal(0),
      sessionStartTime: 0,
      lastSaveTime: 0,
      totalPlayTime: 0,
      drinkRate: 0,
      lastDrinkTime: 0,
      drinkProgress: 0,
    });
  });

  it('restores persisted timing and progress fields after save/load cycle', () => {
    const mockedNow = 1700000000000;
    vi.spyOn(Date, 'now').mockReturnValue(mockedNow);

    useGameStore.setState({
      sips: new Decimal(123),
      straws: new Decimal(2),
      cups: new Decimal(3),
      suctions: new Decimal(4),
      widerStraws: new Decimal(5),
      betterCups: new Decimal(6),
      fasterDrinks: new Decimal(7),
      spd: new Decimal(8),
      strawSPD: new Decimal(9),
      cupSPD: new Decimal(10),
      totalClicks: 321,
      totalSipsEarned: new Decimal('987654321'),
      sessionStartTime: 1600000000000,
      totalPlayTime: 123456,
      drinkRate: 750,
      lastDrinkTime: 1699999999000,
      drinkProgress: 42,
      suctionClickBonus: new Decimal(3),
    });

    const snapshot = performSaveSnapshot();
    expect(snapshot).toBeTruthy();

    useGameStore.setState({
      lastSaveTime: 0,
      totalSipsEarned: new Decimal(0),
      sessionStartTime: 0,
      totalPlayTime: 0,
      drinkRate: 0,
      lastDrinkTime: 0,
      drinkProgress: 0,
      totalClicks: 0,
    });

    saveGameLoader.loadGameState(snapshot);

    const loadedState = useGameStore.getState();
    expect(loadedState.lastSaveTime).toBe(mockedNow);
    expect(loadedState.totalSipsEarned.toString()).toBe('987654321');
    expect(loadedState.sessionStartTime).toBe(1600000000000);
    expect(loadedState.totalPlayTime).toBe(123456);
    expect(loadedState.drinkRate).toBe(750);
    expect(loadedState.lastDrinkTime).toBe(1699999999000);
    expect(loadedState.drinkProgress).toBe(42);
  });
});
