// Friends system: automatic clicking with thematic naming
// Friends bring their own straws and help you drink soda automatically!

import { handleSodaClick } from './clicks-system';

export type FriendsConfig = {
  baseInterval: number; // Base interval between auto-clicks (ms)
  efficiency: number; // Efficiency compared to manual clicks (0-1)
  suctionBonus: number; // Bonus from suction levels
  maxLevels: number; // Maximum friend levels
};

export type FriendsState = {
  friends: number;
  friendsUpCounter: number;
  suctions: number;
  lastAutoClick: number;
  autoClickInterval: number;
};

export class FriendsSystem {
  private config: FriendsConfig;
  private state: FriendsState;
  private intervalId: number | null = null;

  constructor(config: FriendsConfig) {
    this.config = config;
    this.state = {
      friends: 0,
      friendsUpCounter: 0,
      suctions: 0,
      lastAutoClick: 0,
      autoClickInterval: config.baseInterval,
    };
  }

  updateState(newState: Partial<FriendsState>): void {
    this.state = { ...this.state, ...newState };
    this.updateInterval();
  }

  private updateInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.state.friends <= 0) return;

    // Calculate interval based on friends count and upgrades
    const baseInterval = this.config.baseInterval;
    const friendsCount = this.state.friends;
    const upgrades = this.state.friendsUpCounter;

    // Each friend reduces interval by 5%, upgrades by 2%
    const intervalReduction = Math.min(0.95, friendsCount * 0.05 + upgrades * 0.02);
    const newInterval = Math.max(100, baseInterval * (1 - intervalReduction));

    this.state.autoClickInterval = newInterval;

    // Start auto-clicking
    this.intervalId = window.setInterval(() => {
      this.performAutoClick();
    }, newInterval);
  }

  private performAutoClick(): void {
    if (this.state.friends <= 0) return;

    try {
      const w: any = (typeof window !== 'undefined' ? window : {}) as any;

      // Calculate click multiplier based on friends and suction
      const friendsCount = Number(this.state.friends);
      const suctions = Number(this.state.suctions);
      const upgrades = Number(this.state.friendsUpCounter);

      // Base efficiency from config
      let multiplier = this.config.efficiency;

      // Friends provide base multiplier (each friend adds 0.1 efficiency)
      multiplier += friendsCount * 0.1;

      // Suction bonus (each suction level adds 0.05 efficiency)
      multiplier += suctions * 0.05;

      // Upgrades provide additional efficiency
      multiplier += upgrades * 0.02;

      // Cap efficiency at 1.0 (100% of manual clicks)
      multiplier = Math.min(1.0, multiplier);

      // Perform the auto-click
      handleSodaClick(multiplier);

      // Update last auto-click time
      this.state.lastAutoClick = Date.now();

      // Emit event for UI updates
      try {
        w.App?.events?.emit?.('friendsAutoClick', {
          friends: friendsCount,
          multiplier: multiplier,
          interval: this.state.autoClickInterval,
        });
      } catch (error) {
        console.warn('Failed to emit friends auto-click event:', error);
      }
    } catch (error) {
      console.warn('Failed to perform friends auto-click:', error);
    }
  }

  getStats(): {
    friends: number;
    efficiency: number;
    interval: number;
    clicksPerSecond: number;
  } {
    const friendsCount = Number(this.state.friends);
    const suctions = Number(this.state.suctions);
    const upgrades = Number(this.state.friendsUpCounter);

    let efficiency = this.config.efficiency;
    efficiency += friendsCount * 0.1;
    efficiency += suctions * 0.05;
    efficiency += upgrades * 0.02;
    efficiency = Math.min(1.0, efficiency);

    const interval = this.state.autoClickInterval;
    const clicksPerSecond = friendsCount > 0 ? 1000 / interval : 0;

    return {
      friends: friendsCount,
      efficiency: efficiency,
      interval: interval,
      clicksPerSecond: clicksPerSecond,
    };
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Global friends system instance
let friendsSystem: FriendsSystem | null = null;

export function initializeFriendsSystem(): FriendsSystem {
  if (friendsSystem) {
    return friendsSystem;
  }

  const config: FriendsConfig = {
    baseInterval: 1000, // 1 second base interval
    efficiency: 0.8, // 80% efficiency
    suctionBonus: 0.05, // 5% bonus per suction level
    maxLevels: 100, // Max 100 friend levels
  };

  friendsSystem = new FriendsSystem(config);
  return friendsSystem;
}

export function getFriendsSystem(): FriendsSystem | null {
  return friendsSystem;
}

export function updateFriendsSystemState(state: Partial<FriendsState>): void {
  if (friendsSystem) {
    friendsSystem.updateState(state);
  }
}

export function getFriendsStats(): ReturnType<FriendsSystem['getStats']> | null {
  if (friendsSystem) {
    return friendsSystem.getStats();
  }
  return null;
}

export function destroyFriendsSystem(): void {
  if (friendsSystem) {
    friendsSystem.destroy();
    friendsSystem = null;
  }
}
