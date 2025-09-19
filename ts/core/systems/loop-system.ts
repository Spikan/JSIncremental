// Loop system: centralizes requestAnimationFrame game loop (TypeScript)

import { errorHandler } from '../error-handling/error-handler';

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
    errorHandler.handleError(error, 'stopPreviousLoop');
  }
  let lastStatsUpdate = 0;

  function tick() {
    try {
      if (updateDrinkProgress) updateDrinkProgress();
    } catch (error) {
      errorHandler.handleError(error, 'updateDrinkProgressInLoop');
    }
    try {
      if (processDrink) processDrink();
    } catch (error) {
      errorHandler.handleError(error, 'processDrinkInLoop');
    }
    try {
      if (updateUI) updateUI();
    } catch (error) {
      errorHandler.handleError(error, 'updateUIInLoop');
    }
    const now = getNow();
    if (now - lastStatsUpdate >= 1000) {
      lastStatsUpdate = now;
      try {
        if (updateStats) updateStats();
      } catch (error) {
        errorHandler.handleError(error, 'updateStatsInLoop');
      }
      // Validate extreme values periodically for monitoring
      // Note: Removed circular import to prevent hanging in production
      // Extreme value validation will be handled by the purchases system directly
      try {
        if (updatePlayTime) updatePlayTime();
      } catch (error) {
        errorHandler.handleError(error, 'updatePlayTimeInLoop');
      }
      try {
        if (updateLastSaveTime) updateLastSaveTime();
      } catch (error) {
        errorHandler.handleError(error, 'updateLastSaveTimeInLoop');
      }
      // Maintain authoritative totalPlayTime in App.state
      try {
        // Modernized - state handled by store
        // const st = null; // Unused - modernized to store
        // Modernized - state updates handled by store
      } catch (error) {
        errorHandler.handleError(error, 'updateTotalPlayTimeInLoop');
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
    errorHandler.handleError(error, 'runFunctionSafely', { functionName: fn?.name || 'unknown' });
  }
}
