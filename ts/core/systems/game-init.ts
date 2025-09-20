// Game Init System: splash and start logic (TypeScript)

import { useGameStore } from '../state/zustand-store';
import * as ui from '../../ui/index';
import { start as startLoop } from './loop-system';
import { processDrinkFactory } from './drink-system';
import { FEATURE_UNLOCKS as unlockSystem } from '../../feature-unlocks';
import { errorHandler } from '../error-handling/error-handler';

// Create the processDrink function using the factory
const processDrink = processDrinkFactory();

// Idempotent guards (module-local)
let __domReadyInitialized = false;

try {
  (window as any).__diag = Array.isArray((window as any).__diag) ? (window as any).__diag : [];
  (window as any).__diag.push({ type: 'module', module: 'game-init', stage: 'eval-start' });
} catch (error) {
  errorHandler.handleError(error, 'initializeDiagnostics');
}

export function initSplashScreen(): void {
  try {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (!splashScreen || !gameContent) {
      errorHandler.handleError(new Error('Splash screen elements not found'), 'initSplashScreen', {
        critical: true,
      });
      return;
    }

    // maybeStartLoop function removed - use proper loop system instead

    // Inline fallback system removed - use startGameCore() directly
  } catch (error) {
    errorHandler.handleError(error, 'initSplashScreen');
  }
}

export function startGameCore(): void {
  try {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (splashScreen && gameContent) {
      try {
        (window as any).__GAME_STARTED__ = true;
        document.body.classList?.add('game-started');
      } catch (error) {
        errorHandler.handleError(error, 'setGameStartedState');
      }
      // Robustly remove/disable splash overlay
      try {
        splashScreen.style.display = 'none';
        splashScreen.style.visibility = 'hidden';
        (splashScreen as HTMLElement).style.pointerEvents = 'none';
        if (splashScreen.parentNode) splashScreen.parentNode.removeChild(splashScreen);
      } catch (error) {
        errorHandler.handleError(error, 'hideSplashScreen');
      }
      // Force-show game content
      try {
        gameContent.style.display = 'block';
        (gameContent as HTMLElement).style.visibility = 'visible';
        (gameContent as HTMLElement).style.opacity = '1';
        gameContent.classList?.add('active');

        // DOM elements are already available, no reinitialization needed
        console.log('🔄 Game content is visible, DOM elements are ready');
      } catch (error) {
        errorHandler.handleError(error, 'showGameContent');
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
          // const w: any = window as any;
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
            processDrink: () => {
              try {
                processDrink();
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
                // Update individual header elements instead of the problematic updateTopInfoBar
                ui.updateTopSipCounter?.();
                ui.updateTopSipsPerDrink?.();
                ui.updateTopSipsPerSecond?.();
                ui.updateEnhancedProgressBars?.();
              } catch (error) {
                errorHandler.handleError(error, 'updateUI', {
                  context: 'game-init',
                  critical: true,
                });
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
    } else {
      errorHandler.handleError(
        new Error('Could not find splash or game elements'),
        'initSplashScreen',
        { critical: true }
      );
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
      const config: any = (window as any).GAME_CONFIG?.TIMING || {};
      const domReadyDelay: number = Number(config.DOM_READY_DELAY || 0);
      setTimeout(() => {
        try {
          initSplashScreen();
          try {
            // const defaults = { // Unused - modernized to store
            //   autosaveEnabled: true,
            //   autosaveInterval: 10,
            //   clickSoundsEnabled: true,
            //   musicEnabled: true,
            //   devToolsEnabled: false, // Hidden by default
            //   secretsUnlocked: false, // Konami code required
            //   godTabEnabled: false, // Hidden by default, unlocked via secrets
            // } as any;
            // Modernized - options handled by store
            // const loaded = defaults; // Unused - modernized to store
            // Modernized - state updates handled by store
            // Modernized - autosave status handled by store
          } catch (error) {
            errorHandler.handleError(error, 'initializeOptions', { context: 'game-init' });
          }
          try {
            // Modernized - play time updates handled by store
          } catch (error) {
            errorHandler.handleError(error, 'initializePlayTimeUpdates', { context: 'game-init' });
          }
        } catch (error) {
          errorHandler.handleError(error, 'splashScreenInitialization', { context: 'game-init' });
          const splashScreen = document.getElementById('splashScreen');
          const gameContent = document.getElementById('gameContent');
          if (splashScreen && gameContent) {
            splashScreen.style.display = 'none';
            gameContent.style.display = 'block';
            try {
              (window as any).initGame?.();
            } catch (error) {
              errorHandler.handleError(error, 'initializeGameFallback', { context: 'game-init' });
            }
          }
        }
      }, domReadyDelay);
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
