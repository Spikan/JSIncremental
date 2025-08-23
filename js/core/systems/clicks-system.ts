// Clicks system: centralizes click tracking and streak logic (TypeScript)

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
    const nextCurrent = (now - prevLast) < clickStreakWindow ? prevCurrent + 1 : 1;
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
    } catch {}

    // Play audio if available
    try { w.App?.systems?.audio?.button?.playButtonClickSound?.(); } catch {}
  } catch {}
}


