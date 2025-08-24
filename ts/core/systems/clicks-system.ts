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
    } catch {}

    // Play audio if available
    try {
      w.App?.systems?.audio?.button?.playButtonClickSound?.();
    } catch {}
  } catch {}
}

export function handleSodaClick(multiplier: number = 1) {
  try {
    const w: any = (typeof window !== 'undefined' ? window : {}) as any;
    // Track click via system
    try {
      trackClick();
    } catch {}

    const state = w.App?.state?.getState?.() || {};
    const suctionValue = Number(
      state.suctions ?? w.suctions?.toNumber?.() ?? Number(w.suctions) ?? 0
    );
    const totalClickValueNum = (1 + suctionValue * 0.3) * Number(multiplier || 1);

    // Add to sips and mirror to state (use Decimal if available, numerically safe)
    try {
      const toNum = (v: any) =>
        v && typeof v.toNumber === 'function' ? v.toNumber() : Number(v || 0);
      const current = toNum(w.sips);
      const next = current + totalClickValueNum;
      w.sips = w.Decimal ? new w.Decimal(next) : next;
      w.App?.state?.setState?.({ sips: next });
    } catch {
      w.sips = Number(w.sips || 0) + totalClickValueNum;
      try {
        w.App?.state?.setState?.({ sips: Number(w.sips) });
      } catch {}
    }
    try {
      const toNum = (v: any) =>
        v && typeof v.toNumber === 'function' ? v.toNumber() : Number(v || 0);
      w.App?.state?.setState?.({ sips: toNum(w.sips) });
    } catch {}

    // Critical check using state-first
    const criticalChance = Number(state.criticalClickChance ?? w.criticalClickChance ?? 0);
    if (Math.random() < criticalChance) {
      const criticalMultiplier = Number(
        state.criticalClickMultiplier ?? w.criticalClickMultiplier ?? 5
      );
      const criticalBonusNum = totalClickValueNum * (criticalMultiplier - 1);
      try {
        const toNum = (v: any) =>
          v && typeof v.toNumber === 'function' ? v.toNumber() : Number(v || 0);
        const current = toNum(w.sips);
        const next = current + criticalBonusNum;
        w.sips = w.Decimal ? new w.Decimal(next) : next;
        w.App?.state?.setState?.({ sips: next });
      } catch {
        w.sips = Number(w.sips || 0) + criticalBonusNum;
        try {
          w.App?.state?.setState?.({ sips: Number(w.sips) });
        } catch {}
      }
      try {
        w.App?.events?.emit?.(w.App?.EVENT_NAMES?.CLICK?.CRITICAL, { bonus: criticalBonusNum });
      } catch {}
    }

    // Emit soda click and sync totals
    try {
      w.App?.events?.emit?.(w.App?.EVENT_NAMES?.CLICK?.SODA, {
        value: totalClickValueNum,
        gained: totalClickValueNum,
      });
    } catch {}
    try {
      w.App?.stateBridge?.autoSync?.();
      const st = w.App?.state?.getState?.() || {};
      const prevTotal = Number(st.totalSipsEarned || 0);
      w.App?.state?.setState?.({ totalSipsEarned: prevTotal + totalClickValueNum });
    } catch {}
  } catch {}
}
