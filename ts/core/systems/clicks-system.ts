// Clicks system: centralizes click tracking and streak logic with Decimal support (TypeScript)

// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { toDecimal } from '../numbers/migration-utils';

export function trackClick() {
  try {
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    const TIMING = w.GAME_CONFIG?.TIMING || {};
    const state = w.App?.state?.getState?.() || {};

    // Total clicks
    const nextTotal = Number(state.totalClicks || 0) + 1;
    w.App?.state?.setState?.({ totalClicks: nextTotal });
    w.totalClicks = nextTotal;

    // Streaks
    const clickStreakWindow: number = Number(TIMING.CLICK_STREAK_WINDOW || 3000);
    const now = Date.now();
    const prevLast = Number(state.lastClickTime ?? w.lastClickTime ?? 0);
    const prevCurrent = Number(state.currentClickStreak || 0);
    const prevBest = Number(state.bestClickStreak || 0);
    const nextCurrent = now - prevLast < clickStreakWindow ? prevCurrent + 1 : 1;
    const nextBest = Math.max(prevBest, nextCurrent);

    w.App?.state?.setState?.({
      currentClickStreak: nextCurrent,
      bestClickStreak: nextBest,
      lastClickTime: now,
    });
    w.lastClickTime = now;

    // Maintain legacy arrays within limit
    try {
      const LIMITS = w.GAME_CONFIG?.LIMITS || {};
      const maxClickTimes: number = Number(LIMITS.MAX_CLICK_TIMES || 100);
      w.clickTimes = w.clickTimes || [];
      w.clickTimes.push(now);
      if (w.clickTimes.length > maxClickTimes) w.clickTimes.shift();
    } catch (error) {
      console.warn('Failed to maintain legacy click times array:', error);
    }

    // Play audio if available
    try {
      w.App?.systems?.audio?.button?.playButtonClickSound?.();
    } catch (error) {
      console.warn('Failed to play button click sound:', error);
    }
  } catch (error) {
    console.warn('Failed to track click:', error);
  }
}

export async function handleSodaClick(multiplier: number = 1) {
  console.log('🍹 handleSodaClick called with multiplier:', multiplier);
  try {
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    // Track click via system
    try {
      trackClick();
    } catch (error) {
      console.warn('Failed to track click in soda click handler:', error);
    }

    const state = w.App?.state?.getState?.() || {};

    // Calculate click value with Decimal support
    const suctionValue = toDecimal(
      state.suctions ?? w.suctions?.toNumber?.() ?? Number(w.suctions) ?? 0
    );
    const multiplierValue = toDecimal(multiplier || 1);

    // Base click value (1 sip) + suction bonus (0.3 per suction level)
    const baseClick = new Decimal(1);
    const suctionBonus = suctionValue.multiply(new Decimal(0.3));
    const totalClickValue = baseClick.add(suctionBonus).multiply(multiplierValue);

    // Add to sips with Decimal arithmetic
    const currentSips = toDecimal(w.sips || 0);
    w.sips = currentSips.add(totalClickValue);

    // Update state keeping Decimal
    console.log(
      '🍹 Before state update - sips:',
      w.sips,
      'state sips:',
      w.App?.state?.getState?.()?.sips
    );
    try {
      if (w.App?.state?.actions?.setSips) {
        console.log('🍹 Calling setSips with:', w.sips);
        w.App.state.actions.setSips(w.sips);
        console.log('🍹 After state update - state sips:', w.App?.state?.getState?.()?.sips);
      } else {
        console.warn(
          '🍹 setSips action not available via App.state.actions, trying direct store access...'
        );
        // Try direct store access as fallback
        try {
          const { storeActions } = await import('../state/zustand-store.ts');
          if (storeActions?.setSips) {
            console.log('🍹 Calling setSips via storeActions with:', w.sips);
            storeActions.setSips(w.sips);
            console.log(
              '🍹 After state update via storeActions - state sips:',
              w.App?.state?.getState?.()?.sips
            );
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

    // Critical check using state-first with Decimal support
    const criticalChance = Number(state.criticalClickChance ?? w.criticalClickChance ?? 0);
    if (Math.random() < criticalChance) {
      const criticalMultiplier = toDecimal(
        state.criticalClickMultiplier ?? w.criticalClickMultiplier ?? 5
      );

      // Calculate critical bonus: totalClickValue * (criticalMultiplier - 1)
      const criticalBonus = totalClickValue.multiply(criticalMultiplier.subtract(new Decimal(1)));

      // Add critical bonus to sips
      const currentSips = toDecimal(w.sips || 0);
      w.sips = currentSips.add(criticalBonus);

      // Update state keeping Decimal
      try {
        w.App?.state?.actions?.setSips?.(w.sips);
      } catch (error) {
        console.warn('Failed to set sips in state after critical click:', error);
      }
      try {
        w.App?.events?.emit?.(w.App?.EVENT_NAMES?.CLICK?.CRITICAL, {
          // Preserve extreme values - use safe conversion
          bonus: criticalBonus,
        });
      } catch (error) {
        console.warn('Failed to emit critical click event:', error);
      }
    }

    // Emit soda click and sync totals with Decimal support
    try {
      console.log('DEBUG: Emitting CLICK.SODA event with data:', {
        // Preserve extreme values - keep as Decimal
        value: totalClickValue,
        // Preserve extreme values - keep as Decimal
        gained: totalClickValue,
        eventName: w.App?.EVENT_NAMES?.CLICK?.SODA,
        hasEventSystem: !!w.App?.events,
        hasEmit: typeof w.App?.events?.emit === 'function',
      });
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.CLICK?.SODA, {
        // Preserve extreme values - keep as Decimal
        value: totalClickValue,
        // Preserve extreme values - keep as Decimal
        gained: totalClickValue,
      });
      console.log('🍹 CLICK.SODA event emitted successfully');
    } catch (error) {
      console.warn('Failed to emit soda click event:', error);
    }
    try {
      w.App?.stateBridge?.autoSync?.();
      const st = w.App?.state?.getState?.() || {};
      const prevTotal = toDecimal(st.totalSipsEarned || 0);
      const newTotal = prevTotal.add(totalClickValue);
      w.App?.state?.actions?.setTotalSipsEarned?.(newTotal);
    } catch (error) {
      console.warn('Failed to sync state and update total sips earned:', error);
    }
  } catch (error) {
    console.warn('Failed to handle soda click:', error);
  }
}
