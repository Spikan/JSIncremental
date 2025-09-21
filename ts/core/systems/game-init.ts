// Game Init System: splash and start logic (TypeScript)

import { useGameStore } from '../state/zustand-store';
import * as ui from '../../ui/index';
import { start as startLoop } from './loop-system';
import { getProcessDrink } from './drink-system';
import { FEATURE_UNLOCKS as unlockSystem } from '../../feature-unlocks';
import { errorHandler } from '../error-handling/error-handler';

// Lazily resolve processDrink to avoid TDZ with circular deps on Pages
const processDrink = getProcessDrink();

// Idempotent guards (module-local)
let __domReadyInitialized = false;

try {
  (window as any).__diag = Array.isArray((window as any).__diag) ? (window as any).__diag : [];
  (window as any).__diag.push({ type: 'module', module: 'game-init', stage: 'eval-start' });
} catch (error) {
  errorHandler.handleError(error, 'initializeDiagnostics');
}

export function initSplashScreen(): void {
  // No-op: legacy splash screen removed in favor of modern loading screen
}

export function startGameCore(): void {
  try {
    // Mark game started and ensure content is visible (if present)
    try {
      (window as any).__GAME_STARTED__ = true;
      document.body.classList?.add('game-started');
      const gameContent = document.getElementById('gameContent');
      if (gameContent) {
        gameContent.style.display = 'block';
        (gameContent as HTMLElement).style.visibility = 'visible';
        (gameContent as HTMLElement).style.opacity = '1';
        gameContent.classList?.add('active');
      }
    } catch (error) {
      errorHandler.handleError(error, 'setGameStartedState');
    }

    // Initialize game
    try {
      (window as any).initGame?.();
    } catch (error) {
      errorHandler.handleError(error, 'initGame', { critical: true });
    }

    // Start loop via system (authoritative)
    try {
      const restart = (): void => {
        const loopStart = startLoop;
        if (!loopStart) return void setTimeout(restart, 100);
        loopStart({
          updateDrinkProgress: () => {
            try {
              const st = useGameStore.getState();
              const now = Date.now();
              const last = Number(st.lastDrinkTime ?? 0);
              const rate = Number(st.drinkRate ?? 1000);
              const pct = Math.min(((now - last) / Math.max(rate, 1)) * 100, 100);
              useGameStore.setState({ drinkProgress: pct });
              ui.updateDrinkProgress?.(pct, rate);
            } catch (error) {
              errorHandler.handleError(error, 'updateDrinkProgress', { critical: true });
            }
          },
          processDrink: async () => {
            try {
              await processDrink();
            } catch (error) {
              errorHandler.handleError(error, 'processDrink', { critical: true });
            }
          },
          updateStats: () => {
            try {
              ui.updatePlayTime?.();
              ui.updateLastSaveTime?.();
              ui.updateAllStats?.();
              ui.checkUpgradeAffordability?.();
              unlockSystem?.checkAllUnlocks?.();
            } catch (error) {
              errorHandler.handleError(error, 'updateStats', { critical: true });
            }
          },
          updateUI: () => {
            try {
              ui.updateTopSipCounter?.();
              ui.updateTopSipsPerDrink?.();
              ui.updateTopSipsPerSecond?.();
              ui.updateEnhancedProgressBars?.();
            } catch (error) {
              errorHandler.handleError(error, 'updateUI', { context: 'game-init', critical: true });
            }
          },
          updatePlayTime: () => {
            try {
              ui.updatePlayTime?.();
            } catch (error) {
              errorHandler.handleError(error, 'updatePlayTime', { context: 'game-init' });
            }
          },
          updateLastSaveTime: () => {
            try {
              ui.updateLastSaveTime?.();
            } catch (error) {
              errorHandler.handleError(error, 'updateLastSaveTime', { context: 'game-init' });
            }
          },
        });
      };
      restart();
    } catch (error) {
      errorHandler.handleError(error, 'startGameLoop', { critical: true });
    }
  } catch (error) {
    errorHandler.handleError(error, 'startGameCore', { critical: true });
  }
}

// Initialize splash and basic options when DOM is ready
export function initOnDomReady(): void {
  try {
    const boot = () => {
      if (__domReadyInitialized) return;
      __domReadyInitialized = true;
      try {
        (window as any).loadWordBank?.();
      } catch (error) {
        errorHandler.handleError(error, 'loadWordBank', { context: 'game-init' });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  } catch (error) {
    errorHandler.handleError(error, 'initializeOnDOMReady', {
      context: 'game-init',
      critical: true,
    });
  }
}

// Best-effort wiring to global App if available (helps when import timing is odd on Pages)
try {
  // const w: any = window as any;
  // App object construction - this is the only place where App.* should be used
  // Game init system access modernized - using direct import
  const { gameInitSystem } = require('./game-init');
  if (gameInitSystem) {
    Object.assign(gameInitSystem, {
      initSplashScreen,
      startGameCore,
      initOnDomReady,
    });
    try {
      // Diagnostic logging removed - no longer needed
    } catch (error) {
      errorHandler.handleError(error, 'pushDiagnosticInfo', { context: 'game-init' });
    }
  }
} catch (error) {
  errorHandler.handleError(error, 'wireGameInitToGlobalApp', { critical: true });
}

try {
  (window as any).__diag &&
    (window as any).__diag.push({ type: 'module', module: 'game-init', stage: 'eval-end' });
} catch (error) {
  errorHandler.handleError(error, 'pushFinalDiagnosticInfo');
}
