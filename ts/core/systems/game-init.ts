// Game Init System: splash and start logic (TypeScript)

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

    function startGame(): void {
      try {
        const splash = document.getElementById('splashScreen');
        const game = document.getElementById('gameContent');
        if (splash && game) {
          splash.style.display = 'none';
          game.style.display = 'block';
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
  } catch {}
}

export function startGameCore(): void {
  try {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (splashScreen && gameContent) {
      splashScreen.style.display = 'none';
      gameContent.style.display = 'block';
      try {
        (window as any).initGame?.();
      } catch (error) {
        console.error('Game init failed, but showing game anyway:', error);
      }
      // Start loop via system (authoritative)
      try {
        const restart = () => {
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
