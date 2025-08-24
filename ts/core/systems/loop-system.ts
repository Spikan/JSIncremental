// Loop system: centralizes requestAnimationFrame game loop (TypeScript)

let rafId: number | null = null;

type StartArgs = {
  updateDrinkProgress?: () => void;
  processDrink?: () => void;
  updateStats?: () => void;
  updatePlayTime?: () => void;
  updateLastSaveTime?: () => void;
  getNow?: () => number;
};

export function start({
  updateDrinkProgress,
  processDrink,
  updateStats,
  updatePlayTime,
  updateLastSaveTime,
  getNow = () => Date.now(),
}: StartArgs) {
  try {
    stop();
  } catch {}
  let lastStatsUpdate = 0;

  function tick() {
    try {
      updateDrinkProgress && updateDrinkProgress();
    } catch {}
    try {
      processDrink && processDrink();
    } catch {}
    const now = getNow();
    if (now - lastStatsUpdate >= 1000) {
      lastStatsUpdate = now;
      try {
        updateStats && updateStats();
      } catch {}
      try {
        updatePlayTime && updatePlayTime();
      } catch {}
      try {
        updateLastSaveTime && updateLastSaveTime();
      } catch {}
      // Maintain authoritative totalPlayTime in App.state
      try {
        const st = (window as any).App?.state?.getState?.();
        if (st) {
          const prev = Number(st.totalPlayTime || 0);
          (window as any).App?.state?.setState?.({ totalPlayTime: prev + 1000 });
        }
      } catch {}
    }
    rafId = requestAnimationFrame(tick) as unknown as number;
  }

  runOnceSafely(updateDrinkProgress);
  runOnceSafely(processDrink);
  lastStatsUpdate = getNow();
  runOnceSafely(updateStats);
  runOnceSafely(updatePlayTime);
  runOnceSafely(updateLastSaveTime);
  rafId = requestAnimationFrame(tick) as unknown as number;
}

export function stop() {
  if (rafId != null) {
    cancelAnimationFrame(rafId as unknown as number);
    rafId = null;
  }
}

function runOnceSafely(fn: (() => void) | undefined) {
  try {
    fn && fn();
  } catch {}
}
