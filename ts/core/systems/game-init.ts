// Game Init System: splash and start logic (TypeScript)
try {
  (window as any).__diag = Array.isArray((window as any).__diag) ? (window as any).__diag : [];
  (window as any).__diag.push({ type: 'module', module: 'game-init', stage: 'eval-start' });
} catch {}

export function initSplashScreen(): void {
  try {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (!splashScreen || !gameContent) {
      console.error('Splash screen elements not found!');
      return;
    }

    function maybeStartLoop(): void {
      try {
        const w: any = window as any;
        const loopStart = w.App?.systems?.loop?.start;
        if (!loopStart) {
          setTimeout(maybeStartLoop, 100);
          return;
        }
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
            } catch {}
          },
          processDrink: () => {
            try {
              w.App?.systems?.drink?.processDrink?.();
            } catch {}
          },
          updateStats: () => {
            try {
              w.App?.ui?.updatePlayTime?.();
              w.App?.ui?.updateLastSaveTime?.();
              w.App?.ui?.updateAllStats?.();
              w.App?.ui?.updatePurchasedCounts?.();
              w.App?.ui?.checkUpgradeAffordability?.();
              w.App?.systems?.unlocks?.checkAllUnlocks?.();
            } catch {}
          },
          updateUI: () => {
            try {
              w.App?.ui?.updateTopInfoBar?.();
              w.App?.ui?.updateEnhancedProgressBars?.();
            } catch {}
          },
          updatePlayTime: () => {
            try {
              w.App?.ui?.updatePlayTime?.();
            } catch {}
          },
          updateLastSaveTime: () => {
            try {
              w.App?.ui?.updateLastSaveTime?.();
            } catch {}
          },
        });
      } catch {}
    }

    let started = false;
    function startGame(): void {
      try {
        if (started) return;
        const splash = document.getElementById('splashScreen');
        const game = document.getElementById('gameContent');
        if (splash && game) {
          started = true;
          try {
            (window as any).__GAME_STARTED__ = true;
            document.body.classList?.add('game-started');
          } catch {}
          // Make splash removal robust against CSS overrides
          try {
            splash.style.display = 'none';
            splash.style.visibility = 'hidden';
            splash.style.pointerEvents = 'none';
            // Remove from DOM to prevent any reflow bringing it back
            if (splash.parentNode) splash.parentNode.removeChild(splash);
          } catch {}
          try {
            game.style.display = 'block';
            (game as HTMLElement).style.visibility = 'visible';
            (game as HTMLElement).style.opacity = '1';
            game.classList?.add('active');
          } catch {}
          try {
            (window as any).initGame?.();
          } catch (error) {
            console.error('Game init failed, but showing game anyway:', error);
          }
          // Start loop via system (authoritative)
          try {
            maybeStartLoop();
          } catch {}
        } else {
          console.error('Could not find splash or game elements');
        }
      } catch {}
    }

    (window as any).startGame = startGame;

    // Ensure the explicit START button triggers start regardless of other handlers
    try {
      const startBtn = document.querySelector('.splash-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          startGame();
        });
      }
    } catch {}

    splashScreen.addEventListener('click', (e: Event) => {
      // Click anywhere on the splash should start the game
      e.preventDefault();
      e.stopPropagation();
      startGame();
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (splashScreen.style.display !== 'none') {
        if (event.code === 'Space' || event.code === 'Enter') {
          event.preventDefault();
          startGame();
        }
      }
    });

    // Global fallbacks: capture any interaction to start the game if splash is visible
    try {
      const startIfSplashVisible = (e: Event) => {
        try {
          if (!splashScreen) return;
          const visible = splashScreen.style.display !== 'none';
          if (visible) {
            e?.preventDefault?.();
            e?.stopPropagation?.();
            startGame();
          }
        } catch {}
      };
      window.addEventListener('pointerdown', startIfSplashVisible, { capture: true } as any);
      document.addEventListener('click', startIfSplashVisible, { capture: true } as any);
      document.addEventListener(
        'touchstart',
        startIfSplashVisible as any,
        {
          capture: true,
          passive: true,
        } as any
      );
    } catch {}

    // Timed fallback: auto-start after a short delay if still on splash
    try {
      setTimeout(() => {
        try {
          if (splashScreen && splashScreen.style.display !== 'none') {
            startGame();
          }
        } catch {}
      }, 3000);
    } catch {}
  } catch {}
}

export function startGameCore(): void {
  try {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (splashScreen && gameContent) {
      try {
        (window as any).__GAME_STARTED__ = true;
        document.body.classList?.add('game-started');
      } catch {}
      // Robustly remove/disable splash overlay
      try {
        splashScreen.style.display = 'none';
        splashScreen.style.visibility = 'hidden';
        (splashScreen as HTMLElement).style.pointerEvents = 'none';
        if (splashScreen.parentNode) splashScreen.parentNode.removeChild(splashScreen);
      } catch {}
      // Force-show game content
      try {
        gameContent.style.display = 'block';
        (gameContent as HTMLElement).style.visibility = 'visible';
        (gameContent as HTMLElement).style.opacity = '1';
        gameContent.classList?.add('active');
      } catch {}
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
              } catch {}
            },
            processDrink: () => {
              try {
                w.App?.systems?.drink?.processDrink?.();
              } catch {}
            },
            updateStats: () => {
              try {
                w.App?.ui?.updatePlayTime?.();
                w.App?.ui?.updateLastSaveTime?.();
                w.App?.ui?.updateAllStats?.();
                w.App?.ui?.checkUpgradeAffordability?.();
                w.App?.systems?.unlocks?.checkAllUnlocks?.();
              } catch {}
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
              } catch {}
            },
            updateLastSaveTime: () => {
              try {
                w.App?.ui?.updateLastSaveTime?.();
              } catch {}
            },
          });
        };
        restart();
      } catch {}
    } else {
      console.error('Could not find splash or game elements');
    }
  } catch {}
}

// Initialize splash and basic options when DOM is ready
export function initOnDomReady(): void {
  try {
    const boot = () => {
      try {
        (window as any).loadWordBank?.();
      } catch {}
      const config: any = (window as any).GAME_CONFIG?.TIMING || {};
      const domReadyDelay: number = Number(config.DOM_READY_DELAY || 0);
      setTimeout(() => {
        try {
          initSplashScreen();
          try {
            const defaults = {
              autosaveEnabled: true,
              autosaveInterval: 10,
              clickSoundsEnabled: true,
              musicEnabled: true,
              devToolsEnabled: false, // Hidden by default
              secretsUnlocked: false, // Konami code required
              godTabEnabled: false, // Hidden by default, unlocked via secrets
            } as any;
            const loaded =
              (window as any).App?.systems?.options?.loadOptions?.(defaults) || defaults;
            (window as any).App?.state?.setState?.({ options: loaded });
            (window as any).App?.ui?.updateAutosaveStatus?.();
          } catch {}
          try {
            (window as any).App?.ui?.updatePlayTime?.();
          } catch {}
        } catch (error) {
          console.error('Error during splash screen initialization:', error);
          const splashScreen = document.getElementById('splashScreen');
          const gameContent = document.getElementById('gameContent');
          if (splashScreen && gameContent) {
            splashScreen.style.display = 'none';
            gameContent.style.display = 'block';
            try {
              (window as any).initGame?.();
            } catch {}
          }
        }
      }, domReadyDelay);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  } catch {}
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
    } catch {}
  }
} catch {}

try {
  (window as any).__diag &&
    (window as any).__diag.push({ type: 'module', module: 'game-init', stage: 'eval-end' });
} catch {}
