// Modern Button System - Unified button event handling and management (TypeScript)

import { mobileInputHandler } from './mobile-input';

type ButtonActionMeta = { func: (...args: any[]) => any; type: string; label: string };
type ButtonTypeMeta = {
  audio: 'purchase' | 'click';
  feedback: 'purchase' | 'levelup' | 'info';
  className: string;
};

const BUTTON_CONFIG: {
  types: Record<string, ButtonTypeMeta>;
  actions: Record<string, ButtonActionMeta>;
} = {
  types: {
    'shop-btn': { audio: 'purchase', feedback: 'purchase', className: 'shop-btn' },
    'clicking-upgrade-btn': {
      audio: 'purchase',
      feedback: 'purchase',
      className: 'clicking-upgrade-btn',
    },
    'drink-speed-upgrade-btn': {
      audio: 'purchase',
      feedback: 'purchase',
      className: 'drink-speed-upgrade-btn',
    },
    'level-up-btn': { audio: 'purchase', feedback: 'levelup', className: 'level-up-btn' },
    'save-btn': { audio: 'click', feedback: 'info', className: 'save-btn' },
    'sound-toggle-btn': { audio: 'click', feedback: 'info', className: 'sound-toggle-btn' },
    'dev-btn': { audio: 'click', feedback: 'info', className: 'dev-btn' },
    'chat-send-btn': { audio: 'click', feedback: 'info', className: 'chat-send-btn' },
    'splash-start-btn': { audio: 'click', feedback: 'info', className: 'splash-start-btn' },
    'settings-modal-btn': { audio: 'click', feedback: 'info', className: 'settings-modal-btn' },
  },
  actions: {
    buyStraw: {
      func: () => (window as any).App?.systems?.purchases?.execute?.buyStraw?.(),
      type: 'shop-btn',
      label: 'Buy Straw',
    },
    buyCup: {
      func: () => (window as any).App?.systems?.purchases?.execute?.buyCup?.(),
      type: 'shop-btn',
      label: 'Buy Cup',
    },
    buyWiderStraws: {
      func: () => (window as any).App?.systems?.purchases?.execute?.buyWiderStraws?.(),
      type: 'shop-btn',
      label: 'Buy Wider Straws',
    },
    buyBetterCups: {
      func: () => (window as any).App?.systems?.purchases?.execute?.buyBetterCups?.(),
      type: 'shop-btn',
      label: 'Buy Better Cups',
    },
    buySuction: {
      func: () => (window as any).App?.systems?.purchases?.execute?.buySuction?.(),
      type: 'clicking-upgrade-btn',
      label: 'Buy Suction',
    },
    buyFasterDrinks: {
      func: () => (window as any).App?.systems?.purchases?.execute?.buyFasterDrinks?.(),
      type: 'drink-speed-upgrade-btn',
      label: 'Buy Faster Drinks',
    },
    levelUp: {
      func: () => (window as any).App?.systems?.purchases?.execute?.levelUp?.(),
      type: 'level-up-btn',
      label: 'Level Up',
    },
    purchaseUnlock: {
      func: (featureName: string) =>
        (window as any).App?.systems?.unlocks?.purchaseUnlock?.(featureName),
      type: 'shop-btn',
      label: 'Purchase Unlock',
    },
    save: {
      func: () => {
        const sys = (window as any).App?.systems?.save;
        if (sys?.performSaveSnapshot) return sys.performSaveSnapshot();
      },
      type: 'save-btn',
      label: 'Save Game',
    },
    delete_save: {
      func: () => {
        const sys = (window as any).App?.systems?.save;
        if (sys?.deleteSave) return sys.deleteSave();
      },
      type: 'save-btn',
      label: 'Delete Save',
    },
    toggleButtonSounds: {
      func: () => {
        const audio = (window as any).App?.systems?.audio?.button;
        if (audio?.toggleButtonSounds) {
          audio.toggleButtonSounds();
          try {
            const button = document.querySelector('.sound-toggle-btn');
            if (button) {
              const icon = button.querySelector('i');
              if (icon) {
                icon.textContent = audio.buttonSoundsEnabled ? '🔊' : '🔇';
              }
            }
          } catch (error) {
            console.warn('Failed to update sound toggle icon:', error);
          }
        }
      },
      type: 'sound-toggle-btn',
      label: 'Toggle Button Sounds',
    },
    toggleDevTools: {
      func: () => {
        try {
          const w = window as any;
          const state = w.App?.state?.getState?.();
          if (state?.options) {
            const newValue = !state.options.devToolsEnabled;

            // Update the state
            w.App?.state?.setState?.({
              options: { ...state.options, devToolsEnabled: newValue },
            });

            // Save to storage
            w.App?.systems?.options?.saveOptions?.({ ...state.options, devToolsEnabled: newValue });

            // Update button text
            const button = document.querySelector('.dev-toggle-btn');
            if (button) {
              button.textContent = `🔧 Dev Tools ${newValue ? 'ON' : 'OFF'}`;
            }

            // Refresh navigation to show/hide dev tab
            const navManager = w.App?.ui?.navigationManager || (window as any).navigationManager;
            if (navManager?.refreshNavigation) {
              navManager.refreshNavigation();
            }
          }
        } catch (e) {
          console.warn('Failed to toggle dev tools:', e);
        }
      },
      type: 'dev-toggle-btn',
      label: 'Toggle Dev Tools',
    },
    toggleGodTab: {
      func: () => {
        try {
          const w = window as any;
          const state = w.App?.state?.getState?.();
          if (state?.options) {
            const newValue = !state.options.godTabEnabled;

            // Update the state
            w.App?.state?.setState?.({
              options: { ...state.options, godTabEnabled: newValue },
            });

            // Save to storage
            w.App?.systems?.options?.saveOptions?.({ ...state.options, godTabEnabled: newValue });

            // Update button text
            const button = document.querySelector('.god-toggle-btn');
            if (button) {
              button.textContent = `🙏 Talk to God ${newValue ? 'ON' : 'OFF'}`;
            }

            // Refresh navigation to show/hide god tab
            const navManager = w.App?.ui?.navigationManager || (window as any).navigationManager;
            if (navManager?.refreshNavigation) {
              navManager.refreshNavigation();
            }
          }
        } catch (e) {
          console.warn('Failed to toggle god tab:', e);
        }
      },
      type: 'god-toggle-btn',
      label: 'Toggle God Tab',
    },
    startGame: {
      func: () => {
        try {
          (window as any).App?.ui?.hideSplashScreen?.();
        } catch (error) {
          console.warn('Failed to start game:', error);
        }
      },
      type: 'splash-start-btn',
      label: 'Start Game',
    },
    sendChat: {
      func: () => {
        try {
          const chatInput = document.querySelector('#chatInput') as HTMLInputElement;
          if (chatInput && chatInput.value.trim()) {
            (window as any).sendMessage?.();
            // Clear input after sending instead of disabling button
            chatInput.value = '';
          }
        } catch (error) {
          // Error handling - logging removed for production
        }
      },
      type: 'chat-send-btn',
      label: 'Send Chat Message',
    },
    // Dev actions
    devUnlockAll: {
      func: () => (window as any).App?.systems?.dev?.unlockAll?.(),
      type: 'dev-btn',
      label: 'Unlock All',
    },
    devUnlockShop: {
      func: () => (window as any).App?.systems?.dev?.unlockShop?.(),
      type: 'dev-btn',
      label: 'Unlock Shop',
    },
    devUnlockUpgrades: {
      func: () => (window as any).App?.systems?.dev?.unlockUpgrades?.(),
      type: 'dev-btn',
      label: 'Unlock Upgrades',
    },
    devResetUnlocks: {
      func: () => (window as any).App?.systems?.dev?.resetUnlocks?.(),
      type: 'dev-btn',
      label: 'Reset Unlocks',
    },
    devAddTime: {
      func: (ms?: any) => (window as any).App?.systems?.dev?.addTime?.(Number(ms) || 0),
      type: 'dev-btn',
      label: 'Add Time',
    },
    devAddSips: {
      func: (amt?: any) => (window as any).App?.systems?.dev?.addSips?.(Number(amt) || 0),
      type: 'dev-btn',
      label: 'Add Sips',
    },
    // Debug Tools Actions
    devClearConsole: {
      func: () => (window as any).App?.systems?.dev?.clearConsole?.(),
      type: 'dev-btn',
      label: 'Clear Console',
    },
    devExportState: {
      func: () => (window as any).App?.systems?.dev?.exportState?.(),
      type: 'dev-btn',
      label: 'Export State',
    },
    devPerformanceTest: {
      func: () => (window as any).App?.systems?.dev?.performanceTest?.(),
      type: 'dev-btn',
      label: 'Performance Test',
    },

    devExportSave: {
      func: () => (window as any).App?.systems?.dev?.exportSave?.(),
      type: 'save-btn',
      label: 'Export Save',
    },
    // Large Number Testing Actions
    largeNumberTest: {
      func: (action?: string) => {
        switch (action) {
          case 'addExtremeResources':
            (window as any).addExtremeResources?.();
            break;
          case 'resetAllResources':
            (window as any).resetAllResources?.();
            break;
          default:
            // Unknown action - no logging for production
            break;
        }
      },
      type: 'dev-btn',
      label: 'Large Number Test',
    },
    devImportSave: {
      func: () => (window as any).App?.systems?.dev?.openImportDialog?.(),
      type: 'save-btn',
      label: 'Import Save',
    },
    // Settings Modal Actions
    openSettings: {
      func: () => {
        try {
          const modal = document.getElementById('settingsModal');
          if (modal) {
            modal.style.display = 'flex';
            // Add a small delay to ensure the display change is processed
            setTimeout(() => {
              modal.classList.add('settings-modal-open');
            }, 10);
          }
        } catch (error) {
          console.warn('Failed to open settings modal:', error);
        }
      },
      type: 'settings-modal-btn',
      label: 'Open Settings',
    },
    closeSettings: {
      func: () => {
        try {
          const modal = document.getElementById('settingsModal');
          if (modal) {
            modal.classList.add('settings-modal-closing');
            // Add a small delay before hiding to allow for close animation
            setTimeout(() => {
              modal.style.display = 'none';
              modal.classList.remove('settings-modal-open', 'settings-modal-closing');
            }, 300);
          }
        } catch (error) {
          console.warn('Failed to close settings modal:', error);
        }
      },
      type: 'settings-modal-btn',
      label: 'Close Settings',
    },
    switchSettingsTab: {
      func: (tabName: string) => {
        try {
          // Remove active class from all tabs and content
          const allTabs = document.querySelectorAll('.settings-tab-btn');
          const allContent = document.querySelectorAll('.settings-tab-content');

          allTabs.forEach(tab => tab.classList.remove('active'));
          allContent.forEach(content => content.classList.remove('active'));

          // Add active class to selected tab and content
          const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
          const selectedContent = document.getElementById(`${tabName}-tab`);

          if (selectedTab) selectedTab.classList.add('active');
          if (selectedContent) selectedContent.classList.add('active');
        } catch (error) {
          console.warn('Failed to switch settings tab:', error);
        }
      },
      type: 'settings-modal-btn',
      label: 'Switch Settings Tab',
    },
    sendGodMessage: {
      func: () => {
        try {
          const input = document.getElementById('godChatInput') as HTMLInputElement;
          const messagesContainer = document.getElementById('godChatMessages');

          if (!input || !messagesContainer) return;

          const message = input.value.trim();
          if (!message) return;

          // Add user message
          const userMessage = document.createElement('div');
          userMessage.className = 'god-message';
          userMessage.innerHTML = `
            <div class="god-avatar">👤</div>
            <div class="god-text">
              <div class="god-name">You</div>
              <div class="god-message-content">${message}</div>
            </div>
          `;
          messagesContainer.appendChild(userMessage);

          // Clear input
          input.value = '';

          // Scroll to bottom
          messagesContainer.scrollTop = messagesContainer.scrollHeight;

          // Use the proper God system from god.ts
          setTimeout(() => {
            try {
              // Import and use the proper God response system
              import('../god')
                .then(godModule => {
                  // Create a temporary container for the God response
                  const tempContainer = document.createElement('div');
                  tempContainer.id = 'chatMessages';
                  tempContainer.style.display = 'none';
                  document.body.appendChild(tempContainer);

                  // Use the proper God response system
                  godModule.getGodResponse(message);

                  // Extract the God's response from the temporary container
                  const godMessages = tempContainer.querySelectorAll('.god-message');
                  if (godMessages.length > 0) {
                    const lastGodMessage = godMessages[godMessages.length - 1];
                    const godResponse =
                      lastGodMessage?.querySelector('.message-text')?.textContent ||
                      'Divine wisdom flows...';

                    // Add the response to our modal
                    const godMessage = document.createElement('div');
                    godMessage.className = 'god-message';
                    godMessage.innerHTML = `
                      <div class="god-avatar">
                        <img src="images/TempleOS.jpg" alt="God" style="width: 100%; height: 100%; object-fit: cover">
                      </div>
                      <div class="god-text">
                        <div class="god-name">God</div>
                        <div class="god-message-content">${godResponse}</div>
                      </div>
                    `;
                    messagesContainer.appendChild(godMessage);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                  }

                  // Clean up temporary container
                  tempContainer.remove();
                })
                .catch(error => {
                  console.error('Failed to load God module - this needs to be fixed:', error);
                  // Show error message instead of fallback
                  const errorMessage = document.createElement('div');
                  errorMessage.className = 'god-message';
                  errorMessage.innerHTML = `
                    <div class="god-avatar">
                      <img src="images/TempleOS.jpg" alt="God" style="width: 100%; height: 100%; object-fit: cover">
                    </div>
                    <div class="god-text">
                      <div class="god-name">God</div>
                      <div class="god-message-content">The divine connection has been severed. Please refresh and try again.</div>
                    </div>
                  `;
                  messagesContainer.appendChild(errorMessage);
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                });
            } catch (error) {
              console.warn('Failed to get God response:', error);
            }
          }, 1000);
        } catch (error) {
          console.warn('Failed to send God message:', error);
        }
      },
      type: 'settings-modal-btn',
      label: 'Send God Message',
    },
  },
};

// Enhanced accidental press prevention constants
const POINTER_SUPPRESS_MS = 300; // Reduced from 500ms for better responsiveness

const MOVEMENT_THRESHOLD = 15; // Increased from 8px for better tolerance

function markPointerHandled(element: HTMLElement): void {
  try {
    (element as any).__lastPointerTs = Date.now();
  } catch (error) {
    console.warn('Failed to mark pointer as handled:', error);
  }
}
function shouldSuppressClick(element: HTMLElement): boolean {
  try {
    const last = Number((element && (element as any).__lastPointerTs) || 0);
    return Date.now() - last < POINTER_SUPPRESS_MS;
  } catch (error) {
    console.warn('Failed to check pointer suppression:', error);
    return false;
  }
}

function handleButtonClick(event: Event, button: HTMLElement, actionName: string): void {
  event.preventDefault();
  event.stopPropagation();
  const action = BUTTON_CONFIG.actions[actionName];
  if (!action) return;
  const buttonType = BUTTON_CONFIG.types[action.type];
  if (!buttonType) return;

  try {
    const audio = (window as any).App?.systems?.audio?.button;
    if (audio) {
      if (buttonType.audio === 'purchase') {
        try {
          audio.playButtonPurchaseSound();
        } catch (error) {
          // Error handling - logging removed for production
        }
      } else {
        try {
          audio.playButtonClickSound();
        } catch (error) {
          // Error handling - logging removed for production
        }
      }
    }
  } catch (error) {
    console.warn('Failed to play button audio:', error);
  }
  try {
    button.classList.add('button-clicked');
    setTimeout(() => {
      try {
        button.classList.remove('button-clicked');
      } catch (error) {
        console.warn('Failed to remove button clicked class:', error);
      }
    }, 150);
  } catch (error) {
    console.warn('Failed to add button clicked visual feedback:', error);
  }
  try {
    if (action.func && typeof action.func === 'function') {
      // Special handling for dev actions to ensure dev system is loaded
      if (actionName.startsWith('dev')) {
        if (!(window as any).App?.systems?.dev) {
          console.error('❌ Dev system not loaded yet, cannot execute:', actionName);
          return;
        }
      }
      action.func();
      if (buttonType.feedback === 'levelup') {
        try {
          (window as any).App?.ui?.showLevelUpFeedback?.(0);
        } catch (error) {
          // Error handling - logging removed for production
        }
      }
    }
  } catch (error) {
    console.error(`Button action ${actionName} failed:`, error);
    // Don't let dev action errors crash the page
    if (actionName.startsWith('dev')) {
      console.error('❌ Dev action failed, but continuing...');
    } else {
      throw error; // Re-throw non-dev errors
    }
  }
}

function setupUnifiedButtonSystem(): void {
  // Initialize mobile input handler for enhanced touch validation
  try {
    mobileInputHandler.initialize();
  } catch (error) {
    console.warn('Failed to initialize mobile input handler:', error);
  }

  // Setting up modern button event handler system
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach((button: any) => {
    const onclick = button.getAttribute('onclick');
    if (onclick) {
      const actionMatch = onclick.match(/(\w+)\(/);
      if (actionMatch) {
        const actionName = actionMatch[1];
        const action = BUTTON_CONFIG.actions[actionName];
        if (action) {
          button.removeAttribute('onclick');
          if ((window as any).PointerEvent) {
            // Visual feedback on press, action on release
            button.addEventListener('pointerdown', (e: any) => {
              if (e && e.pointerType && e.pointerType !== 'mouse') {
                // Just visual feedback on press
                button.classList.add('button-clicked');
              }
            });
            button.addEventListener('pointerup', (e: any) => {
              if (e && e.pointerType && e.pointerType !== 'mouse') {
                markPointerHandled(button);
                handleButtonClick(e, button, actionName);
              }
            });
          } else if ('ontouchstart' in window) {
            // Visual feedback on touch start, action on touch end
            button.addEventListener(
              'touchstart',
              (_e: any) => {
                // Just visual feedback on touch start
                button.classList.add('button-clicked');
              },
              { passive: true }
            );
            button.addEventListener(
              'touchend',
              (e: any) => {
                markPointerHandled(button);
                handleButtonClick(e, button, actionName);
              },
              { passive: true }
            );
          }
          button.addEventListener('click', (e: any) => {
            if (shouldSuppressClick(button)) return;
            handleButtonClick(e, button, actionName);
          });
          if (action.type) {
            try {
              button.classList.add(action.type);
            } catch (error) {
              // Error handling - logging removed for production
            }
          }
          // Button configured successfully
        }
      }
    }
  });

  // Add specific handler for settings modal content to prevent closing on content click
  const settingsModalContent = document.querySelector('.settings-modal-content');
  if (settingsModalContent) {
    settingsModalContent.addEventListener('click', (e: Event) => {
      e.stopPropagation();
    });
  }
  setupSpecialButtonHandlers();
  // Button system setup complete
}

function setupSpecialButtonHandlers(): void {
  // First ensure clicks system is loaded
  function ensureClicksSystemLoaded(): Promise<void> {
    return new Promise(resolve => {
      const checkClicksSystem = () => {
        // Check if we're in a test environment and window is not available
        if (typeof window === 'undefined') {
          resolve();
          return;
        }

        const hasClicksSystem = (window as any).App?.systems?.clicks?.handleSodaClick;
        const hasDomCache = (window as any).DOM_CACHE;
        const isDomCacheReady =
          hasDomCache && (window as any).DOM_CACHE.isReady
            ? (window as any).DOM_CACHE.isReady()
            : !!hasDomCache;

        if (hasClicksSystem && isDomCacheReady) {
          resolve();
        } else {
          setTimeout(checkClicksSystem, 100);
        }
      };
      checkClicksSystem();
    });
  }

  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((button: any) => {
    if (!button || !button.addEventListener) return;
    button.addEventListener('click', (_e: any) => {
      const action = button.getAttribute('data-action');
      if (action && action.startsWith('switchTab:')) {
        const tabName = action.split(':')[1];
        try {
          (window as any).App?.ui?.switchTab?.(tabName, _e);
        } catch (error) {
          // Error handling - logging removed for production
        }
      }
    });
  });
  // Setup soda button with clicks system check
  const setupSodaButton = async () => {
    await ensureClicksSystemLoaded();
    const sodaDomCacheBtn = (window as any).DOM_CACHE?.sodaButton;
    const sodaButton = sodaDomCacheBtn || document.getElementById('sodaButton');

    console.log('🔍 SODA BUTTON SEARCH:', {
      fromDomCache: !!sodaDomCacheBtn,
      fromDocument: !!document.getElementById('sodaButton'),
      finalButton: !!sodaButton,
      buttonId: sodaButton?.id,
      timestamp: Date.now(),
    });
    if (sodaButton && (sodaButton as any).addEventListener) {
      if ((window as any).PointerEvent) {
        let active = false;
        let moved = false;
        let sx = 0;
        let sy = 0;
        const reset = () => {
          active = false;
          moved = false;
          // Clear stored scroll position
          if (sodaButton) {
            (sodaButton as any).__touchStartScrollY = undefined;
          }
        };
        sodaButton.addEventListener('pointerdown', (e: any) => {
          if (!e || e.pointerType === 'mouse') return;
          active = true;
          moved = false;
          sx = e.clientX || 0;
          sy = e.clientY || 0;

          // Store scroll position for scroll detection
          (sodaButton as any).__touchStartScrollY = window.scrollY;

          // Visual feedback on press
          try {
            (sodaButton as any).classList.add('soda-clicked');
          } catch (error) {
            console.warn('Failed to add visual feedback:', error);
          }
        });
        sodaButton.addEventListener('pointermove', (e: any) => {
          if (!active || !e || e.pointerType === 'mouse') return;
          const dx = (e.clientX || 0) - sx;
          const dy = (e.clientY || 0) - sy;
          if (Math.abs(dx) > MOVEMENT_THRESHOLD || Math.abs(dy) > MOVEMENT_THRESHOLD) moved = true;
        });
        sodaButton.addEventListener('pointerup', (e: any) => {
          if (!active || !e || e.pointerType === 'mouse') {
            reset();
            return;
          }

          // Check if this was likely a scroll vs a tap
          const scrollDelta = Math.abs(
            window.scrollY - (sodaButton.__touchStartScrollY || window.scrollY)
          );
          const isScroll =
            mobileInputHandler.isActive() &&
            mobileInputHandler.isLikelyScroll(
              sx,
              sy,
              e.clientX || sx,
              e.clientY || sy,
              scrollDelta
            );

          if (!moved && !isScroll) {
            markPointerHandled(sodaButton);

            // Remove visual feedback (was added on press)
            try {
              (sodaButton as any).classList.remove('soda-clicked');
            } catch (error) {
              console.warn('Failed to remove visual feedback:', error);
            }
            try {
              // Call handleSodaClick

              // Try multiple ways to call the function
              const handleSodaClick = (window as any).App?.systems?.clicks?.handleSodaClick;
              if (typeof handleSodaClick === 'function') {
                // Call function directly
                handleSodaClick(1); // Only pass multiplier, no event
              } else {
                // Try fallback
                // Try fallback: call the function from the clicks-system module directly
                try {
                  // Use dynamic import without await (synchronous fallback)
                  import('../core/systems/clicks-system.ts')
                    .then(module => {
                      const fallbackFunc = module.handleSodaClick;
                      // Using fallback import
                      fallbackFunc(1);
                    })
                    .catch(fallbackError => {
                      console.error('DEBUG: Fallback also failed:', fallbackError);
                    });
                } catch (fallbackError) {
                  console.error('DEBUG: Fallback also failed:', fallbackError);
                }
              }
            } catch (error) {
              // Error handling - logging removed for production
            }
          }
          reset();
        });
        sodaButton.addEventListener('pointercancel', reset);
      } else if ('ontouchstart' in window) {
        let active = false;
        let moved = false;
        let sx = 0;
        let sy = 0;
        const reset = () => {
          active = false;
          moved = false;
          // Clear stored scroll position
          if (sodaButton) {
            (sodaButton as any).__touchStartScrollY = undefined;
          }
        };
        sodaButton.addEventListener(
          'touchstart',
          (e: any) => {
            if (!e || !e.touches || !e.touches[0]) return;
            active = true;
            moved = false;
            sx = e.touches[0].clientX || 0;
            sy = e.touches[0].clientY || 0;

            // Store scroll position for scroll detection
            (sodaButton as any).__touchStartScrollY =
              typeof window !== 'undefined' ? window.scrollY : 0;

            // Visual feedback on touch start
            try {
              (sodaButton as any).classList.add('soda-clicked');
            } catch (error) {
              console.warn('Failed to add visual feedback:', error);
            }
          },
          { passive: true }
        );
        sodaButton.addEventListener(
          'touchmove',
          (e: any) => {
            if (!active || !e || !e.touches || !e.touches[0]) return;
            const dx = (e.touches[0].clientX || 0) - sx;
            const dy = (e.touches[0].clientY || 0) - sy;
            if (Math.abs(dx) > MOVEMENT_THRESHOLD || Math.abs(dy) > MOVEMENT_THRESHOLD)
              moved = true;
          },
          { passive: true }
        );
        sodaButton.addEventListener('touchend', (e: any) => {
          if (!active) {
            reset();
            return;
          }
          // Check if this was likely a scroll vs a tap
          const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
          const scrollDelta = Math.abs(
            currentScrollY - (sodaButton.__touchStartScrollY || currentScrollY)
          );
          const isScroll =
            mobileInputHandler.isActive() &&
            mobileInputHandler.isLikelyScroll(
              sx,
              sy,
              e.changedTouches[0]?.clientX || sx,
              e.changedTouches[0]?.clientY || sy,
              scrollDelta
            );

          if (!moved && !isScroll) {
            markPointerHandled(sodaButton);

            // Remove visual feedback (was added on touch start)
            try {
              (sodaButton as any).classList.remove('soda-clicked');
            } catch (error) {
              console.warn('Failed to remove visual feedback:', error);
            }
            try {
              // Call handleSodaClick

              // Try multiple ways to call the function
              const handleSodaClick = (window as any).App?.systems?.clicks?.handleSodaClick;
              if (typeof handleSodaClick === 'function') {
                // Call function directly
                handleSodaClick(1); // Only pass multiplier, no event
              } else {
                // Try fallback
                // Try fallback: call the function from the clicks-system module directly
                try {
                  // Use dynamic import without await (synchronous fallback)
                  import('../core/systems/clicks-system.ts')
                    .then(module => {
                      const fallbackFunc = module.handleSodaClick;
                      // Using fallback import
                      fallbackFunc(1);
                    })
                    .catch(fallbackError => {
                      console.error('DEBUG: Fallback also failed:', fallbackError);
                    });
                } catch (fallbackError) {
                  console.error('DEBUG: Fallback also failed:', fallbackError);
                }
              }
            } catch (error) {
              // Error handling - logging removed for production
            }
          }
          reset();
        });
        sodaButton.addEventListener('touchcancel', reset);
      }

      // Standard click event handler
      sodaButton.addEventListener('click', (e: any) => {
        console.log('🔥 SODA BUTTON STANDARD CLICK EVENT FIRED!', {
          shouldSuppress: shouldSuppressClick(sodaButton),
          buttonId: e?.target?.id,
          timestamp: Date.now(),
          eventType: e?.type,
        });

        if (shouldSuppressClick(sodaButton)) {
          console.log('🔥 Soda button click suppressed');
          return;
        }
        try {
          (sodaButton as any).classList.add('soda-clicked');
          setTimeout(() => {
            try {
              (sodaButton as any).classList.remove('soda-clicked');
            } catch (error) {
              // Error handling - logging removed for production
            }
          }, 140);
        } catch (error) {
          // Error handling - logging removed for production
        }
        try {
          // Button click handling

          // Try multiple ways to call the function
          const handleSodaClick = (window as any).App?.systems?.clicks?.handleSodaClick;
          if (typeof handleSodaClick === 'function') {
            // Calling handleSodaClick function directly
            handleSodaClick(1).catch((error: any) => {
              console.warn('Failed to handle soda click:', error);
            }); // Only pass multiplier, no event
          } else {
            // handleSodaClick not available, trying fallback
            // Try fallback: call the function from the clicks-system module directly
            try {
              // Use dynamic import without await (synchronous fallback)
              import('../core/systems/clicks-system.ts')
                .then(module => {
                  const fallbackFunc = module.handleSodaClick;
                  // Using fallback import
                  fallbackFunc(1);
                })
                .catch(fallbackError => {
                  console.warn('Fallback also failed:', fallbackError);
                });
            } catch (fallbackError) {
              console.warn('Fallback also failed:', fallbackError);
            }
          }
        } catch (error) {
          // Error handling - logging removed for production
        }
      });
    }
    console.log('🚀 SODA BUTTON SETUP COMPLETE:', {
      buttonFound: !!sodaButton,
      buttonId: sodaButton?.id,
      hasAddEventListener: typeof sodaButton?.addEventListener === 'function',
      timestamp: Date.now(),
    });
  };

  // Call the async setup function
  setupSodaButton().catch(error => {
    console.warn('Failed to setup soda button:', error);
  });

  // Debug function to check soda button setup
  (window as any).debugSodaButtonSetup = () => {
    console.log('=== SODA BUTTON DEBUG ===');
    const sodaButton = document.getElementById('sodaButton');
    console.log('Soda button element:', sodaButton);
    console.log(
      'Soda button event listeners:',
      sodaButton ? 'Check browser dev tools' : 'Not found'
    );

    const handleSodaClick = (window as any).App?.systems?.clicks?.handleSodaClick;
    console.log('handleSodaClick available:', typeof handleSodaClick === 'function');

    console.log(
      'DOM cache ready:',
      !!(window as any).DOM_CACHE?.isReady && (window as any).DOM_CACHE.isReady()
    );
    console.log('=== END SODA BUTTON DEBUG ===');
  };
  const chatInput = document.getElementById('chatInput') as any;
  if (chatInput) {
    chatInput.addEventListener('keypress', (e: any) => {
      if (e.key === 'Enter' && (window as any).sendMessage) {
        (window as any).sendMessage();
      }
    });
  }
  const splashStartBtn =
    typeof document !== 'undefined' && (document as any).querySelector
      ? (document as any).querySelector('.splash-start-btn')
      : null;
  if (splashStartBtn && (splashStartBtn as any).addEventListener) {
    if ((window as any).PointerEvent) {
      (splashStartBtn as any).addEventListener('pointerdown', (e: any) => {
        if (e && e.pointerType && e.pointerType === 'mouse') return;
        markPointerHandled(splashStartBtn);
        e.preventDefault();
        e.stopPropagation();
        try {
          (window as any).startGame?.();
        } catch (error) {
          // Error handling - logging removed for production
        }
      });
    } else if ('ontouchstart' in window) {
      (splashStartBtn as any).addEventListener(
        'touchstart',
        (e: any) => {
          markPointerHandled(splashStartBtn);
          e.preventDefault();
          e.stopPropagation();
          try {
            (window as any).startGame?.();
          } catch (error) {
            // Error handling - logging removed for production
          }
        },
        { passive: true }
      );
    }
    (splashStartBtn as any).addEventListener('click', (e: any) => {
      if (shouldSuppressClick(splashStartBtn)) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        (window as any).startGame?.();
      } catch (error) {
        // Error handling - logging removed for production
      }
    });
  }
  if (document && (document as any).body && (document as any).body.addEventListener) {
    if ((window as any).PointerEvent) {
      (document as any).body.addEventListener(
        'pointerdown',
        (e: any) => {
          const target = e.target as any;
          if (!(target instanceof HTMLElement)) return;
          const el = (target as HTMLElement).closest('[data-action]') as HTMLElement | null;
          if (!el) return;
          if (e && e.pointerType && e.pointerType === 'mouse') return;
          const action = el.getAttribute('data-action');
          if (!action) return;
          const [fnName, argStr] = action.includes(':') ? action.split(':') : [action, ''];
          if (!fnName || fnName === 'sodaClick') return;
          const argsAttr = el.getAttribute('data-args') || argStr;
          let args: any[] = [];
          if (argsAttr) {
            const maybeNum = Number(argsAttr);
            args = Number.isNaN(maybeNum) ? [argsAttr] : [maybeNum];
          }
          const purchaseActions = new Set([
            'buyStraw',
            'buyCup',
            'buyWiderStraws',
            'buyBetterCups',
            'buySuction',
            'buyFasterDrinks',
            'purchaseUnlock',
          ]);
          const isPurchase = purchaseActions.has(fnName);
          if (isPurchase) {
            const buttonEl =
              el.closest && el.closest('button') ? (el.closest('button') as any) : (el as any);
            const disabled = !!(
              buttonEl &&
              (buttonEl.disabled ||
                buttonEl.classList?.contains('disabled') ||
                buttonEl.classList?.contains('unaffordable'))
            );
            if (disabled) return;
          }
          const buttonEl =
            el.closest && el.closest('button') ? (el.closest('button') as any) : (el as any);
          if (buttonEl) markPointerHandled(buttonEl);
          const meta = (BUTTON_CONFIG.actions as any)[fnName];
          // Handle tab switch explicitly (play sound always)
          if (fnName === 'switchTab') {
            e.preventDefault();
            e.stopPropagation();
            try {
              (window as any).App?.systems?.audio?.button?.playTabSwitchSound?.();
            } catch (error) {
              // Error handling - logging removed for production
            }
            (window as any).App?.ui?.switchTab?.(args[0], e);
            return;
          }
          if (meta || (isPurchase && (window as any).App?.systems?.purchases?.execute?.[fnName])) {
            e.preventDefault();
            e.stopPropagation();
            try {
              let success = true;
              if (meta && typeof meta.func === 'function') {
                const ret = meta.func(...args);
                success = typeof ret === 'undefined' ? true : !!ret;
                try {
                  if (fnName === 'toggleButtonSounds') {
                    (window as any).App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.();
                  }
                } catch (error) {
                  // Error handling - logging removed for production
                }
                try {
                  const btnType = meta.type;
                  const audio = (window as any).App?.systems?.audio?.button;
                  if (audio && fnName !== 'sodaClick' && fnName !== 'switchTab') {
                    if (
                      btnType === 'shop-btn' ||
                      btnType === 'clicking-upgrade-btn' ||
                      btnType === 'drink-speed-upgrade-btn' ||
                      btnType === 'level-up-btn'
                    ) {
                      if (success) audio.playButtonPurchaseSound?.();
                    } else {
                      audio.playButtonClickSound?.();
                    }
                  }
                } catch (error) {
                  // Error handling - logging removed for production
                }
              } else {
                if (fnName === 'purchaseUnlock' && args.length > 0) {
                  // Handle unlock purchase with feature name argument
                  const featureName = args[0];
                  success = !!(window as any).App?.systems?.unlocks?.purchaseUnlock?.(featureName);
                } else if (
                  isPurchase &&
                  (window as any).App?.systems?.purchases?.execute?.[fnName]
                ) {
                  success = !!(window as any).App.systems.purchases.execute[fnName]();
                }
                try {
                  const meta = BUTTON_CONFIG.actions[fnName];
                  const btnType = meta && meta.type;
                  if ((window as any).App?.systems?.audio?.button && fnName !== 'sodaClick') {
                    if (
                      btnType === 'shop-btn' ||
                      btnType === 'clicking-upgrade-btn' ||
                      btnType === 'drink-speed-upgrade-btn' ||
                      btnType === 'level-up-btn'
                    ) {
                      if (success)
                        (window as any).App.systems.audio.button.playButtonPurchaseSound?.();
                    } else {
                      (window as any).App.systems.audio.button.playButtonClickSound?.();
                    }
                  }
                } catch (error) {
                  // Error handling - logging removed for production
                }
              }
              if (
                isPurchase &&
                typeof (window as any).App?.ui?.showPurchaseFeedback === 'function' &&
                success
              ) {
                let costValue: number | undefined;
                try {
                  const costSpan = el.querySelector('.cost-number') as HTMLElement | null;
                  if (costSpan) {
                    costValue = Number(costSpan.textContent);
                  } else {
                    const match = (el.textContent || '').replace(/[,]/g, '').match(/\d+(?:\.\d+)?/);
                    costValue = match ? Number(match[0]) : undefined;
                  }
                } catch (error) {
                  // Error handling - logging removed for production
                }
                const rect = el.getBoundingClientRect();
                const cx = typeof e.clientX === 'number' ? e.clientX : rect.left + rect.width / 2;
                const cy = typeof e.clientY === 'number' ? e.clientY : rect.top + rect.height / 2;
                if (typeof costValue === 'number' && !Number.isNaN(costValue)) {
                  (window as any).App.ui.showPurchaseFeedback(fnName, costValue, cx, cy);
                }
              }
            } catch (err) {
              console.warn('action failed', fnName, err);
            }
          }
        },
        { capture: true }
      );
    }
    (document as any).body.addEventListener(
      'click',
      (e: any) => {
        const target = e.target as any;
        if (!(target instanceof HTMLElement)) return;
        const el = (target as HTMLElement).closest('[data-action]') as HTMLElement | null;
        if (!el) return;
        const buttonEl =
          el.closest && el.closest('button') ? (el.closest('button') as any) : (el as any);
        if (buttonEl && shouldSuppressClick(buttonEl)) return;
        const action = el.getAttribute('data-action');
        console.log(`[DEBUG] Button click detected, data-action:`, action);
        if (!action) return;
        const [fnName, argStr] = action.includes(':') ? action.split(':') : [action, ''];
        console.log(`[DEBUG] Parsed fnName: ${fnName}, argStr: ${argStr}`);
        if (!fnName) return;
        const argsAttr = el.getAttribute('data-args') || argStr;
        let args: any[] = [];
        if (argsAttr) {
          // For purchaseUnlock, always treat as string
          if (fnName === 'purchaseUnlock') {
            args = [argsAttr];
          } else {
            const maybeNum = Number(argsAttr);
            args = Number.isNaN(maybeNum) ? [argsAttr] : [maybeNum];
          }
        }
        const purchaseActions = new Set([
          'buyStraw',
          'buyCup',
          'buyWiderStraws',
          'buyBetterCups',
          'buySuction',
          'buyFasterDrinks',
          'buyFriends',
          'upgradeFriends',
          'purchaseUnlock',
        ]);
        const isPurchase = purchaseActions.has(fnName);
        if (isPurchase) {
          const disabled = !!(
            buttonEl &&
            (buttonEl.disabled ||
              buttonEl.classList?.contains('disabled') ||
              buttonEl.classList?.contains('unaffordable'))
          );
          if (disabled) return;
        }
        const meta = (BUTTON_CONFIG.actions as any)[fnName];
        // Handle tab switch explicitly (play sound always)
        if (fnName === 'switchTab') {
          e.preventDefault();
          e.stopPropagation();
          try {
            (window as any).App?.systems?.audio?.button?.playTabSwitchSound?.();
          } catch (error) {
            // Error handling - logging removed for production
          }
          (window as any).App?.ui?.switchTab?.(args[0], e);
          return;
        }
        if (meta || (isPurchase && (window as any).App?.systems?.purchases?.execute?.[fnName])) {
          e.preventDefault();
          e.stopPropagation();
          try {
            let success = true;
            if (meta && typeof meta.func === 'function') {
              const ret = meta.func(...args);
              success = typeof ret === 'undefined' ? true : !!ret;
              try {
                if (fnName === 'toggleButtonSounds') {
                  (window as any).App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.();
                }
              } catch (error) {
                // Error handling - logging removed for production
              }
              try {
                const btnType = meta.type;
                const audio = (window as any).App?.systems?.audio?.button;
                if (audio && fnName !== 'sodaClick' && fnName !== 'switchTab') {
                  if (
                    btnType === 'shop-btn' ||
                    btnType === 'clicking-upgrade-btn' ||
                    btnType === 'drink-speed-upgrade-btn' ||
                    btnType === 'level-up-btn'
                  ) {
                    if (success) audio.playButtonPurchaseSound?.();
                  } else {
                    audio.playButtonClickSound?.();
                  }
                }
              } catch (error) {
                // Error handling - logging removed for production
              }
            } else {
              if (fnName === 'purchaseUnlock' && args.length > 0) {
                // Handle unlock purchase with feature name argument
                const featureName = args[0];
                success = !!(window as any).App?.systems?.unlocks?.purchaseUnlock?.(featureName);
              } else if (isPurchase && (window as any).App?.systems?.purchases?.execute?.[fnName]) {
                success = !!(window as any).App.systems.purchases.execute[fnName]();
              }
              try {
                const meta = BUTTON_CONFIG.actions[fnName];
                const btnType = meta && meta.type;
                if ((window as any).App?.systems?.audio?.button && fnName !== 'sodaClick') {
                  if (
                    btnType === 'shop-btn' ||
                    btnType === 'clicking-upgrade-btn' ||
                    btnType === 'drink-speed-upgrade-btn' ||
                    btnType === 'level-up-btn'
                  ) {
                    if (success)
                      (window as any).App.systems.audio.button.playButtonPurchaseSound?.();
                  } else {
                    (window as any).App.systems.audio.button.playButtonClickSound?.();
                  }
                }
              } catch (error) {
                // Error handling - logging removed for production
              }
            }
            if (
              isPurchase &&
              typeof (window as any).App?.ui?.showPurchaseFeedback === 'function' &&
              success
            ) {
              let costValue: number | undefined;
              try {
                const costSpan = el.querySelector('.cost-number') as HTMLElement | null;
                if (costSpan) {
                  costValue = Number(costSpan.textContent);
                } else {
                  const match = (el.textContent || '').replace(/[,]/g, '').match(/\d+(?:\.\d+)?/);
                  costValue = match ? Number(match[0]) : undefined;
                }
              } catch (error) {
                // Error handling - logging removed for production
              }
              const cx =
                typeof e.clientX === 'number'
                  ? e.clientX
                  : el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2;
              const cy =
                typeof e.clientY === 'number'
                  ? e.clientY
                  : el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;
              if (typeof costValue === 'number' && !Number.isNaN(costValue)) {
                (window as any).App.ui.showPurchaseFeedback(fnName, costValue, cx, cy);
              }
            }
          } catch (err) {
            console.warn('action failed', fnName, err);
          }
        }
      },
      { capture: true }
    );
  }
  if (document && (document as any).body && (document as any).body.addEventListener) {
    if ((window as any).PointerEvent) {
      (document as any).body.addEventListener(
        'pointerdown',
        (e: any) => {
          const target = e.target as any;
          if (!(target instanceof HTMLElement)) return;
          const startEl = (target as HTMLElement).closest(
            '.splash-start-btn'
          ) as HTMLElement | null;
          if (!startEl) return;
          if (e && e.pointerType && e.pointerType === 'mouse') return;
          markPointerHandled(startEl);
          e.preventDefault();
          e.stopPropagation();
          try {
            (window as any).startGame?.();
          } catch (err) {
            console.warn('startGame failed', err);
          }
        },
        { capture: true }
      );
    }
    (document as any).body.addEventListener(
      'click',
      (e: any) => {
        const target = e.target as any;
        if (!(target instanceof HTMLElement)) return;
        const startEl = (target as HTMLElement).closest('.splash-start-btn') as HTMLElement | null;
        if (!startEl) return;
        if (shouldSuppressClick(startEl)) return;
        e.preventDefault();
        e.stopPropagation();
        try {
          (window as any).startGame?.();
        } catch (err) {
          console.warn('startGame failed', err);
        }
      },
      { capture: true }
    );
  }
  if (document && (document as any).body && (document as any).body.addEventListener) {
    (document as any).body.addEventListener(
      'change',
      (e: any) => {
        const target = e.target as any;
        if (!(target instanceof HTMLElement)) return;
        const action = target.getAttribute('data-action');
        if (!action) return;
        const [fnName] = action.split(':');
        try {
          if (fnName === 'toggleAutosave') {
            const checked = !!(target as HTMLInputElement).checked;
            const prev = (window as any).App?.state?.getState?.()?.options || {};
            (window as any).App?.state?.setState?.({
              options: { ...prev, autosaveEnabled: checked },
            });
            (window as any).App?.systems?.options?.saveOptions?.({
              autosaveEnabled: checked,
              autosaveInterval: Number(prev.autosaveInterval || 10),
            });
            (window as any).App?.ui?.updateAutosaveStatus?.();
          } else if (fnName === 'changeAutosaveInterval') {
            const value = Number((target as HTMLSelectElement).value || 10);
            const prev = (window as any).App?.state?.getState?.()?.options || {};
            (window as any).App?.state?.setState?.({
              options: { ...prev, autosaveInterval: value },
            });
            (window as any).App?.systems?.options?.saveOptions?.({
              autosaveEnabled: !!prev.autosaveEnabled,
              autosaveInterval: value,
            });
            (window as any).App?.ui?.updateAutosaveStatus?.();
          }
        } catch (err) {
          console.warn('change action failed', fnName, err);
        }
      },
      { capture: true }
    );
  }
}

function initButtonSystem(): void {
  function tryInitialize() {
    const appReady = typeof window !== 'undefined' && !!(window as any).App;
    if (appReady) {
      setupUnifiedButtonSystem();
    } else {
      setTimeout(tryInitialize, 200);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(tryInitialize, 100);
    });
  } else {
    setTimeout(tryInitialize, 100);
  }
}

/**
 * Configure touch sensitivity for accidental press prevention
 * @param config Configuration object for touch validation
 */
export function configureTouchSensitivity(config: {
  movementThreshold?: number;
  timeThreshold?: number;
  scrollThreshold?: number;
  multiTouchThreshold?: number;
}): void {
  try {
    mobileInputHandler.updateTouchValidation(config);
    console.log('Touch sensitivity configured:', config);
  } catch (error) {
    console.warn('Failed to configure touch sensitivity:', error);
  }
}

/**
 * Get current touch sensitivity configuration
 */
export function getTouchSensitivityConfig() {
  try {
    return mobileInputHandler.getTouchValidationConfig();
  } catch (error) {
    console.warn('Failed to get touch sensitivity config:', error);
    return null;
  }
}

export {
  BUTTON_CONFIG,
  handleButtonClick,
  setupUnifiedButtonSystem,
  setupSpecialButtonHandlers,
  initButtonSystem,
};
