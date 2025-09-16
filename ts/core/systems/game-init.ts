// Game Init System: splash and start logic (TypeScript)
try {
  (window as any).__diag = Array.isArray((window as any).__diag) ? (window as any).__diag : [];
  (window as any).__diag.push({ type: 'module', module: 'game-init', stage: 'eval-start' });
} catch (error) {
  console.error('Failed to initialize diagnostics:', error);
}

export function initSplashScreen(): void {
  try {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (!splashScreen || !gameContent) {
      console.error('Splash screen elements not found!');
      return;
    }

    // maybeStartLoop function removed - use proper loop system instead

    // Inline fallback system removed - use startGameCore() directly
  } catch (error) {
    console.error('Failed to initialize splash screen:', error);
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
        console.error('Failed to set game started state:', error);
      }
      // Robustly remove/disable splash overlay
      try {
        splashScreen.style.display = 'none';
        splashScreen.style.visibility = 'hidden';
        (splashScreen as HTMLElement).style.pointerEvents = 'none';
        if (splashScreen.parentNode) splashScreen.parentNode.removeChild(splashScreen);
      } catch (error) {
        console.error('Failed to hide splash screen:', error);
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
        console.error('Failed to show game content:', error);
      }
      // Initialize game
      try {
        (window as any).initGame?.();
      } catch (error) {
        console.error('Game init failed, but showing game anyway:', error);
      }
      // Start loop via system (authoritative)
      try {
        const restart = (): void => {
          const w: any = window as any;
          const loopStart = w.App?.systems?.loop?.start;
          if (!loopStart) return void setTimeout(restart, 100);
          loopStart({
            updateDrinkProgress: () => {
              try {
                const st = w.App?.state?.getState?.() || {};
                const now = Date.now();
                const last = Number(st.lastDrinkTime ?? w.lastDrinkTime ?? 0);
                const rate = Number(st.drinkRate ?? w.drinkRate ?? 1000);
                const pct = Math.min(((now - last) / Math.max(rate, 1)) * 100, 100);
                w.App?.state?.setState?.({ drinkProgress: pct });
                w.App?.ui?.updateDrinkProgress?.(pct, rate);
              } catch (error) {
                console.error('Failed to update drink progress:', error);
              }
            },
            processDrink: () => {
              try {
                w.App?.systems?.drink?.processDrink?.();
              } catch (error) {
                console.error('Failed to process drink:', error);
              }
            },
            updateStats: () => {
              try {
                w.App?.ui?.updatePlayTime?.();
                w.App?.ui?.updateLastSaveTime?.();
                w.App?.ui?.updateAllStats?.();
                w.App?.ui?.checkUpgradeAffordability?.();
                w.App?.systems?.unlocks?.checkAllUnlocks?.();
              } catch (error) {
                console.error('Failed to update stats:', error);
              }
            },
            updateUI: () => {
              try {
                // Update individual header elements instead of the problematic updateTopInfoBar
                w.App?.ui?.updateTopSipCounter?.();
                w.App?.ui?.updateTopSipsPerDrink?.();
                w.App?.ui?.updateTopSipsPerSecond?.();
                w.App?.ui?.updateEnhancedProgressBars?.();
              } catch (error) {
                console.error('❌ updateUI error (game-init):', error);
              }
            },
            updatePlayTime: () => {
              try {
                w.App?.ui?.updatePlayTime?.();
              } catch (error) {
                console.error('Failed to update play time:', error);
              }
            },
            updateLastSaveTime: () => {
              try {
                w.App?.ui?.updateLastSaveTime?.();
              } catch (error) {
                console.error('Failed to update last save time:', error);
              }
            },
          });
        };
        restart();
      } catch (error) {
        console.error('Failed to start game loop:', error);
      }
    } else {
      console.error('Could not find splash or game elements');
    }
  } catch (error) {
    console.error('Failed to start game core:', error);
  }
}

// Initialize splash and basic options when DOM is ready
export function initOnDomReady(): void {
  try {
    const boot = () => {
      try {
        (window as any).loadWordBank?.();
      } catch (error) {
        console.error('Failed to load word bank:', error);
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
            console.error('Failed to initialize options:', error);
          }
          try {
            // Modernized - play time updates handled by store
          } catch (error) {
            console.error('Failed to initialize play time updates:', error);
          }
        } catch (error) {
          console.error('Error during splash screen initialization:', error);
          const splashScreen = document.getElementById('splashScreen');
          const gameContent = document.getElementById('gameContent');
          if (splashScreen && gameContent) {
            splashScreen.style.display = 'none';
            gameContent.style.display = 'block';
            try {
              (window as any).initGame?.();
            } catch (error) {
              console.error('Failed to initialize game in fallback:', error);
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
    console.error('Failed to initialize on DOM ready:', error);
  }
}

// Best-effort wiring to global App if available (helps when import timing is odd on Pages)
try {
  const w: any = window as any;
  if (w.App && w.App.systems && w.App.systems.gameInit) {
    Object.assign(w.App.systems.gameInit, {
      initSplashScreen,
      startGameCore,
      initOnDomReady,
    });
    try {
      (w.__diag || []).push({ type: 'wire', module: 'game-init', method: 'direct-assign' });
    } catch (error) {
      console.error('Failed to push diagnostic info:', error);
    }
  }
} catch (error) {
  console.error('Failed to wire game init to global App:', error);
}

try {
  (window as any).__diag &&
    (window as any).__diag.push({ type: 'module', module: 'game-init', stage: 'eval-end' });
} catch (error) {
  console.error('Failed to push final diagnostic info:', error);
}
