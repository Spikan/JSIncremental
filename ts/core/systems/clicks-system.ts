// Clicks system: centralizes click tracking and streak logic with Decimal support (TypeScript)

import { toDecimal } from '../numbers/simplified';
import { useGameStore } from '../state/zustand-store';
import { EVENT_NAMES } from '../constants';
import { optimizedEventBus } from '../../services/optimized-event-bus';
import { errorHandler } from '../error-handling/error-handler';
import { hybridLevelSystem } from './hybrid-level-system';
import { showClickFeedback } from '../../ui/feedback';
import { getLastPointerPosition } from '../../services/pointer-tracker';

export type TrackClickArgs = {
  getApp?: () => any;
  getGameConfig?: () => any;
  getState?: () => any;
  setState?: (state: any) => void;
  getNow?: () => number;
};

export function trackClickFactory({
  getApp = () => null, // No longer using App object
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
        errorHandler.handleError(error, 'maintainLegacyClickTimesArray');
      }

      // Play audio if available
      try {
        const App = getApp();
        App?.systems?.audio?.button?.playButtonClickSound?.();
      } catch (error) {
        errorHandler.handleError(error, 'playButtonClickSound');
      }
    } catch (error) {
      errorHandler.handleError(error, 'trackClick', { critical: true });
      throw error;
    }
  };
}

export function handleSodaClickFactory({
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
    try {
      // Add momentum to 3D model if available
      try {
        const soda3DButton = getSoda3DButton();
        if (soda3DButton && typeof soda3DButton.addMomentum === 'function') {
          soda3DButton.addMomentum();
        }
      } catch (error) {
        errorHandler.handleError(error, 'addMomentumTo3DModel');
      }

      // Track click via system
      try {
        trackClick();
      } catch (error) {
        errorHandler.handleError(error, 'trackClickInSodaClickHandler');
      }

      const state = getState();

      // Calculate click value with Decimal support
      const suctionClickBonus = toDecimal(state.suctionClickBonus ?? 0);
      const multiplierValue = toDecimal(multiplier || 1);

      // Base click value (1 sip) + suction click bonus from store
      const baseClick = toDecimal(1);
      const baseClickValue = baseClick.add(suctionClickBonus).multiply(multiplierValue);

      // Apply level bonuses from hybrid level system
      const levelBonuses = hybridLevelSystem?.getCurrentLevelBonuses?.() || {
        sipMultiplier: 1.0,
        clickMultiplier: 1.0,
      };
      const totalClickValue = baseClickValue.mul(toDecimal(levelBonuses.clickMultiplier));

      // Add to sips with Decimal arithmetic
      const currentSips = toDecimal(getSips() || 0);
      const newSips = currentSips.add(totalClickValue);

      // Update state using the provided setSips function (which uses useGameStore.setState)
      setSips(newSips);

      // Show popup feedback
      try {
        // Use last pointer position if available; otherwise let UI pick container-based position
        const last = getLastPointerPosition();
        if (last) {
          showClickFeedback(totalClickValue, false, last.x, last.y);
        } else {
          showClickFeedback(totalClickValue, false, null as any, null as any);
        }
      } catch (error) {
        errorHandler.handleError(error, 'showClickFeedback', {
          totalClickValue: totalClickValue?.toString(),
        });
      }

      // Emit soda click and sync totals with Decimal support
      try {
        const last = getLastPointerPosition();
        optimizedEventBus.emit(EVENT_NAMES.CLICK.SODA, {
          // Preserve extreme values - keep as Decimal
          gained: totalClickValue,
          critical: false,
          clickX: last ? last.x : 0,
          clickY: last ? last.y : 0,
          timestamp: Date.now(),
        });
      } catch (error) {
        errorHandler.handleError(error, 'emitSodaClickEvent', {
          totalClickValue: totalClickValue?.toString(),
        });
      }
      try {
        const st = getState();
        const prevTotal = toDecimal(st.totalSipsEarned || 0);
        const newTotal = prevTotal.add(totalClickValue);
        // Update total sips earned via Zustand store
        useGameStore.setState({ totalSipsEarned: newTotal });
      } catch (error) {
        errorHandler.handleError(error, 'syncStateAndUpdateTotalSipsEarned', {
          totalClickValue: totalClickValue?.toString(),
        });
      }
    } catch (error) {
      errorHandler.handleError(error, 'handleSodaClick', { critical: true });
      throw error;
    }
  };
}

// No backward compatibility - use proper dependency injection
