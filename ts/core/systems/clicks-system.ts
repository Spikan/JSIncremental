// Clicks system: centralizes click tracking and streak logic with Decimal support (TypeScript)

import { toDecimal } from '../numbers/simplified';
import { useGameStore, getStoreActions } from '../state/zustand-store';

export type TrackClickArgs = {
  getApp?: () => any;
  getGameConfig?: () => any;
  getState?: () => any;
  setState?: (state: any) => void;
  getNow?: () => number;
};

export function trackClickFactory({
  getApp = () => (globalThis as any).App,
  getGameConfig = () => (globalThis as any).GAME_CONFIG,
  getState = () => useGameStore.getState(),
  setState = (state: any) => useGameStore.setState(state),
  getNow = () => Date.now(),
}: TrackClickArgs = {}) {
  return function trackClick() {
    try {
      const GAME_CONFIG = getGameConfig();
      const TIMING = GAME_CONFIG?.TIMING || {};
      const state = getState();

      // Total clicks
      const nextTotal = Number(state.totalClicks || 0) + 1;
      setState({ totalClicks: nextTotal });

      // Streaks
      const clickStreakWindow: number = Number(TIMING.CLICK_STREAK_WINDOW || 3000);
      const now = getNow();
      const prevLast = Number(state.lastClickTime ?? 0);
      const prevCurrent = Number(state.currentClickStreak || 0);
      const prevBest = Number(state.bestClickStreak || 0);
      const nextCurrent = now - prevLast < clickStreakWindow ? prevCurrent + 1 : 1;
      const nextBest = Math.max(prevBest, nextCurrent);

      setState({
        currentClickStreak: nextCurrent,
        bestClickStreak: nextBest,
        lastClickTime: now,
      });

      // Maintain legacy arrays within limit
      try {
        // Note: Legacy clickTimes array is not maintained in this refactored version
        // This was causing global state pollution
        // const LIMITS = GAME_CONFIG?.LIMITS || {};
        // const maxClickTimes: number = Number(LIMITS.MAX_CLICK_TIMES || 100);
      } catch (error) {
        console.warn('Failed to maintain legacy click times array:', error);
      }

      // Play audio if available
      try {
        const App = getApp();
        App?.systems?.audio?.button?.playButtonClickSound?.();
      } catch (error) {
        console.warn('Failed to play button click sound:', error);
      }
    } catch (error) {
      console.error('❌ Failed to track click:', error);
      throw error;
    }
  };
}

export function handleSodaClickFactory({
  getApp = () => (globalThis as any).App,
  getState = () => useGameStore.getState(),
  getSips = () => useGameStore.getState().sips,
  setSips = (value: any) => useGameStore.setState({ sips: value }),
  getSoda3DButton = () => (globalThis as any).soda3DButton,
  trackClick = () => {}, // Will be injected
}: TrackClickArgs & {
  getSips?: () => any;
  setSips?: (value: any) => void;
  getSoda3DButton?: () => any;
  trackClick?: () => void;
} = {}) {
  return async function handleSodaClick(multiplier: number = 1) {
    console.log('🔧 handleSodaClick called with multiplier:', multiplier);
    try {
      // Add momentum to 3D model if available
      try {
        const soda3DButton = getSoda3DButton();
        if (soda3DButton && typeof soda3DButton.addMomentum === 'function') {
          soda3DButton.addMomentum();
        }
      } catch (error) {
        console.warn('Failed to add momentum to 3D model:', error);
      }

      // Track click via system
      try {
        trackClick();
      } catch (error) {
        console.warn('Failed to track click in soda click handler:', error);
      }

      const state = getState();

      // Calculate click value with Decimal support
      const suctionClickBonus = toDecimal(state.suctionClickBonus ?? 0);
      const multiplierValue = toDecimal(multiplier || 1);

      console.log('🔧 handleSodaClick: Click calculation:', {
        stateSuctionClickBonus: state.suctionClickBonus?.toString(),
        suctionClickBonus: suctionClickBonus.toString(),
        multiplier: multiplierValue.toString(),
      });

      // Base click value (1 sip) + suction click bonus from store
      const baseClick = toDecimal(1);
      const baseClickValue = baseClick.add(suctionClickBonus).multiply(multiplierValue);

      console.log('🔧 handleSodaClick: Base click value:', {
        baseClick: baseClick.toString(),
        totalBaseClickValue: baseClickValue.toString(),
      });

      // Apply level bonuses from hybrid level system
      const App = getApp();
      const levelBonuses = App?.systems?.hybridLevel?.getCurrentLevelBonuses?.() || {
        sipMultiplier: 1.0,
        clickMultiplier: 1.0,
      };
      const totalClickValue = baseClickValue.mul(toDecimal(levelBonuses.clickMultiplier));

      // Add to sips with Decimal arithmetic
      const currentSips = toDecimal(getSips() || 0);
      const newSips = currentSips.add(totalClickValue);
      setSips(newSips);

      // Update state keeping Decimal
      try {
        if (App?.state?.actions?.setSips) {
          App.state.actions.setSips(newSips);
        } else {
          console.warn(
            '🍹 setSips action not available via App.state.actions, trying direct store access...'
          );
          // Try direct store access as fallback
          try {
            const storeActions = getStoreActions();
            if (storeActions?.setSips) {
              storeActions.setSips(newSips);
            } else {
              console.warn('🍹 setSips action not available via storeActions either!');
            }
          } catch (storeError) {
            console.warn('🍹 Failed to import storeActions:', storeError);
          }
        }
      } catch (error) {
        console.warn('Failed to set sips in state:', error);
      }

      // Emit soda click and sync totals with Decimal support
      try {
        App?.events?.emit?.(App?.EVENT_NAMES?.CLICK?.SODA, {
          // Preserve extreme values - keep as Decimal
          value: totalClickValue,
          // Preserve extreme values - keep as Decimal
          gained: totalClickValue,
        });
      } catch (error) {
        console.warn('Failed to emit soda click event:', error);
      }
      try {
        App?.stateBridge?.autoSync?.();
        const st = getState();
        const prevTotal = toDecimal(st.totalSipsEarned || 0);
        const newTotal = prevTotal.add(totalClickValue);
        App?.state?.actions?.setTotalSipsEarned?.(newTotal);
      } catch (error) {
        console.warn('Failed to sync state and update total sips earned:', error);
      }
    } catch (error) {
      console.error('❌ Failed to handle soda click:', error);
      throw error;
    }
  };
}

// No backward compatibility - use proper dependency injection
