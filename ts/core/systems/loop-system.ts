// Loop system: centralizes requestAnimationFrame game loop (TypeScript)

let rafId: number | null = null;

type StartArgs = {
  updateDrinkProgress?: () => void;
  processDrink?: () => void;
  updateStats?: () => void;
  updatePlayTime?: () => void;
  updateLastSaveTime?: () => void;
  updateUI?: () => void;
  getNow?: () => number;
};

export function start({
  updateDrinkProgress,
  processDrink,
  updateStats,
  updatePlayTime,
  updateLastSaveTime,
  updateUI,
  getNow = () => Date.now(),
}: StartArgs) {
  try {
    stop();
  } catch (error) {
    console.warn('Failed to stop previous loop:', error);
  }
  let lastStatsUpdate = 0;

  function tick() {
    try {
      if (updateDrinkProgress) updateDrinkProgress();
    } catch (error) {
      console.warn('Failed to update drink progress in loop:', error);
    }
    try {
      if (processDrink) processDrink();
    } catch (error) {
      console.warn('Failed to process drink in loop:', error);
    }
    try {
      if (updateUI) updateUI();
    } catch (error) {
      console.warn('Failed to update UI in loop:', error);
    }
    const now = getNow();
    if (now - lastStatsUpdate >= 1000) {
      lastStatsUpdate = now;
      try {
        if (updateStats) updateStats();
      } catch (error) {
        console.warn('Failed to update stats in loop:', error);
      }
      // Validate extreme values periodically for monitoring
      // Note: Removed circular import to prevent hanging in production
      // Extreme value validation will be handled by the purchases system directly
      try {
        if (updatePlayTime) updatePlayTime();
      } catch (error) {
        console.warn('Failed to update play time in loop:', error);
      }
      try {
        if (updateLastSaveTime) updateLastSaveTime();
      } catch (error) {
        console.warn('Failed to update last save time in loop:', error);
      }
      // Maintain authoritative totalPlayTime in App.state
      try {
        // Modernized - state handled by store
        // const st = null; // Unused - modernized to store
        // Modernized - state updates handled by store
      } catch (error) {
        console.warn('Failed to update total play time in loop:', error);
      }
    }
    rafId = requestAnimationFrame(tick) as unknown as number;
  }

  if (updateDrinkProgress) runOnceSafely(updateDrinkProgress);
  if (processDrink) runOnceSafely(processDrink);
  lastStatsUpdate = getNow();
  if (updateStats) runOnceSafely(updateStats);
  if (updatePlayTime) runOnceSafely(updatePlayTime);
  if (updateLastSaveTime) runOnceSafely(updateLastSaveTime);
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
    if (fn) fn();
  } catch (error) {
    console.warn('Failed to run function safely:', error);
  }
}
