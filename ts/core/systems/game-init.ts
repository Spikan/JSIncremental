// Game Init System: splash and start logic (TypeScript)

export function initSplashScreen(): void {
  try {
    console.log('🚀 initSplashScreen CALLED - JavaScript event handlers being set up...');

    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');

    if (!splashScreen || !gameContent) {
      console.error('❌ Splash screen elements not found!', {
        splashScreen: !!splashScreen,
        gameContent: !!gameContent,
      });
      return;
    }

    console.log('✅ Splash screen elements found');

    // Debug: Log splash screen state
    console.log('🔍 Splash screen debug info:', {
      display: splashScreen.style.display,
      visibility: splashScreen.style.visibility,
      opacity: splashScreen.style.opacity,
      zIndex: splashScreen.style.zIndex,
      position: splashScreen.style.position,
      width: splashScreen.style.width,
      height: splashScreen.style.height,
      pointerEvents: splashScreen.style.pointerEvents,
      className: splashScreen.className,
      offsetTop: splashScreen.offsetTop,
      offsetLeft: splashScreen.offsetLeft,
      offsetWidth: splashScreen.offsetWidth,
      offsetHeight: splashScreen.offsetHeight,
    });

    function maybeStartLoop(): void {
      try {
        const w: any = window as any;
        const loopStart = w.App?.systems?.loop?.start;
        if (!loopStart) {
          console.log('⏳ Loop system not ready, retrying...');
          setTimeout(maybeStartLoop, 100);
          return;
        }
        console.log('✅ Starting game loop...');
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
              console.warn('Error updating drink progress:', error);
            }
          },
          processDrink: () => {
            try {
              w.App?.systems?.drink?.processDrink?.();
            } catch (error) {
              console.warn('Error processing drink:', error);
            }
          },
          updateStats: () => {
            try {
              w.App?.ui?.updatePlayTime?.();
              w.App?.ui?.updateLastSaveTime?.();
              w.App?.ui?.updateAllStats?.();
              w.App?.ui?.updatePurchasedCounts?.();
              w.App?.ui?.checkUpgradeAffordability?.();
              w.App?.systems?.unlocks?.checkAllUnlocks?.();
            } catch (error) {
              console.warn('Error updating stats:', error);
            }
          },
          updatePlayTime: () => {
            try {
              w.App?.ui?.updatePlayTime?.();
            } catch (error) {
              console.warn('Error updating play time:', error);
            }
          },
          updateLastSaveTime: () => {
            try {
              w.App?.ui?.updateLastSaveTime?.();
            } catch (error) {
              console.warn('Error updating last save time:', error);
            }
          },
        });
      } catch (error) {
        console.error('Error starting loop:', error);
      }
    }

    function startGame(): void {
      try {
        console.log('🚀 Starting game...');

        const splash = document.getElementById('splashScreen');
        const game = document.getElementById('gameContent');

        if (splash && game) {
          console.log('✅ Hiding splash screen and showing game...');
          splash.style.display = 'none';
          game.style.display = 'block';

          try {
            console.log('🔧 Calling initGame...');
            (window as any).initGame?.();
          } catch (error) {
            console.error('❌ Game init failed, but showing game anyway:', error);
          }

          // Start loop via system (authoritative)
          try {
            console.log('🔧 Starting game loop...');
            maybeStartLoop();
          } catch (error) {
            console.error('❌ Failed to start game loop:', error);
          }
        } else {
          console.error('❌ Could not find splash or game elements');
        }
      } catch (error) {
        console.error('❌ Error in startGame:', error);
      }
    }

    // Expose startGame globally
    (window as any).startGame = startGame;
    console.log('✅ startGame function exposed globally');

    // Setup splash screen handlers with proper timing
    function setupSplashScreenHandlers() {
      // Check if startGame function is available
      if (typeof startGame !== 'function') {
        console.log('⏳ startGame function not available yet, will retry...');
        return false;
      }

      // Ensure the explicit START button triggers start regardless of other handlers
      try {
        const startBtn = document.querySelector('.splash-start-btn');
        if (startBtn) {
          console.log('✅ Found start button, adding click handler...');
          startBtn.addEventListener('click', (e: Event) => {
            const mouseEvent = e as MouseEvent;
            console.log('🔘 Start button clicked at:', mouseEvent.clientX, mouseEvent.clientY);
            console.log('🔘 Event target:', e.target);
            console.log('🔘 Event currentTarget:', e.currentTarget);
            e.preventDefault();
            e.stopPropagation();
            startGame();
          });
        } else {
          console.warn('⚠️ Start button not found');
        }
      } catch (error) {
        console.error('❌ Error setting up start button handler:', error);
      }

      // Add click handler to splash screen
      try {
        console.log('✅ Adding splash screen click handler...');
        if (splashScreen) {
          // Add handler for debugging
          const debugHandler = (e: Event) => {
            const mouseEvent = e as MouseEvent;
            console.log(
              '🔘 DEBUG: Splash screen clicked at:',
              mouseEvent.clientX,
              mouseEvent.clientY
            );
            console.log('🔘 DEBUG: Event target:', e.target);
            console.log('🔘 DEBUG: Event currentTarget:', e.currentTarget);
            console.log('🔘 DEBUG: Event type:', e.type);
            console.log('🔘 DEBUG: Splash screen style.display:', splashScreen.style.display);
          };
          splashScreen.addEventListener('click', debugHandler);

          // Add the actual game start handler
          splashScreen.addEventListener('click', (e: Event) => {
            console.log('🔘 Splash screen clicked - starting game...');
            e.preventDefault();
            e.stopPropagation();
            startGame();
          });
        }
      } catch (error) {
        console.error('❌ Error setting up splash screen click handler:', error);
      }

      // Add keyboard handlers
      try {
        console.log('✅ Adding keyboard handlers...');
        document.addEventListener('keydown', (event: KeyboardEvent) => {
          if (splashScreen && splashScreen.style.display !== 'none') {
            if (event.code === 'Space' || event.code === 'Enter') {
              console.log('🔘 Keyboard shortcut pressed:', event.code);
              event.preventDefault();
              startGame();
            }
          }
        });
      } catch (error) {
        console.error('❌ Error setting up keyboard handlers:', error);
      }

      return true;
    }

    // Try to setup handlers immediately
    if (!setupSplashScreenHandlers()) {
      // If not ready, retry
      let retryCount = 0;
      const maxRetries = 30; // Max 3 seconds (30 * 100ms)
      const retryInterval = () => {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.warn('⚠️ Failed to setup splash screen handlers after max retries');
          return;
        }

        if (!setupSplashScreenHandlers()) {
          setTimeout(retryInterval, 100);
        }
      };
      setTimeout(retryInterval, 100);
    }

    console.log('✅ Splash screen initialization complete');

    // Test the event handlers
    setTimeout(() => {
      console.log('🧪 Testing event handlers...');
      const testEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 500,
        clientY: 300,
      });
      splashScreen.dispatchEvent(testEvent);
      console.log('🧪 Test event dispatched');
    }, 1000);
  } catch (error) {
    console.error('❌ Error in initSplashScreen:', error);
  }
}

export function startGameCore(): void {
  try {
    console.log('🚀 startGameCore called...');

    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');

    if (splashScreen && gameContent) {
      console.log('✅ Hiding splash and showing game...');
      splashScreen.style.display = 'none';
      gameContent.style.display = 'block';

      try {
        console.log('🔧 Calling initGame...');
        (window as any).initGame?.();
      } catch (error) {
        console.error('❌ Game init failed, but showing game anyway:', error);
      }

      // Start loop via system (authoritative)
      try {
        const restart = () => {
          const w: any = window as any;
          const loopStart = w.App?.systems?.loop?.start;
          if (!loopStart) {
            console.log('⏳ Loop system not ready, retrying...');
            return void setTimeout(restart, 100);
          }
          console.log('✅ Starting game loop...');
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
                console.warn('Error updating drink progress:', error);
              }
            },
            processDrink: () => {
              try {
                w.App?.systems?.drink?.processDrink?.();
              } catch (error) {
                console.warn('Error processing drink:', error);
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
                console.warn('Error updating stats:', error);
              }
            },
            updatePlayTime: () => {
              try {
                w.App?.ui?.updatePlayTime?.();
              } catch (error) {
                console.warn('Error updating play time:', error);
              }
            },
            updateLastSaveTime: () => {
              try {
                w.App?.ui?.updateLastSaveTime?.();
              } catch (error) {
                console.warn('Error updating last save time:', error);
              }
            },
          });
        };
        restart();
      } catch (error) {
        console.error('❌ Failed to start game loop:', error);
      }
    } else {
      console.error('❌ Could not find splash or game elements');
    }
  } catch (error) {
    console.error('❌ Error in startGameCore:', error);
  }
}

// Initialize splash and basic options when DOM is ready
export function initOnDomReady(): void {
  try {
    console.log('🎯 initOnDomReady CALLED - This should appear if function is working...');

    const boot = () => {
      try {
        console.log('🔧 Loading word bank...');
        (window as any).loadWordBank?.();
      } catch (error) {
        console.warn('⚠️ Failed to load word bank:', error);
      }

      const config: any = (window as any).GAME_CONFIG?.TIMING || {};
      const domReadyDelay: number = Number(config.DOM_READY_DELAY || 0);

      console.log(`⏳ Waiting ${domReadyDelay}ms before initializing splash...`);

      setTimeout(() => {
        try {
          console.log('🔧 Initializing splash screen...');
          initSplashScreen();

          try {
            console.log('🔧 Loading options...');
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
          } catch (error) {
            console.warn('⚠️ Failed to load options:', error);
          }

          try {
            console.log('🔧 Updating play time...');
            (window as any).App?.ui?.updatePlayTime?.();
          } catch (error) {
            console.warn('⚠️ Failed to update play time:', error);
          }

          console.log('✅ DOM ready initialization complete');
        } catch (error) {
          console.error('❌ Error during splash screen initialization:', error);

          // Fallback: force show game if splash fails
          const splashScreen = document.getElementById('splashScreen');
          const gameContent = document.getElementById('gameContent');
          if (splashScreen && gameContent) {
            console.log('🔄 Fallback: forcing game display...');
            splashScreen.style.display = 'none';
            gameContent.style.display = 'block';
            try {
              (window as any).initGame?.();
            } catch (initError) {
              console.error('❌ Fallback initGame also failed:', initError);
            }
          }
        }
      }, domReadyDelay);
    };

    if (document.readyState === 'loading') {
      console.log('⏳ DOM still loading, waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      console.log('✅ DOM already ready, booting immediately...');
      boot();
    }
  } catch (error) {
    console.error('❌ Error in initOnDomReady:', error);
  }
}
