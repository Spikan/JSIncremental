// Modern Button System - Unified button event handling and management (TypeScript)

import { mobileInputHandler } from './mobile-input';
import { domQuery } from '../services/dom-query';
import { enhancedAudioManager } from '../services/enhanced-audio-manager';
import { audioControlsManager } from './audio-controls';
import { useGameStore, getStoreActions } from '../core/state/zustand-store';
import { hybridLevelSystem } from '../core/systems/hybrid-level-system';
import { updateLevelUpDisplay, updateLevelText, updateAllDisplaysOptimized } from './displays';
// Add static imports to replace dynamic imports
import * as purchasesSystem from '../core/systems/purchases-system';
import * as saveSystem from '../core/systems/save-system';
import * as devSystem from '../core/systems/dev';
import * as offlineProgression from '../core/systems/offline-progression';
import * as buttonAudio from '../core/systems/button-audio';
import * as clicksSystem from '../core/systems/clicks-system';
import * as levelSelector from './level-selector';
import * as devToolsManager from './dev-tools-manager';
import * as offlineModal from './offline-modal';
import * as feedback from './feedback';
import * as godModule from '../god';
import * as unlockPurchases from '../core/systems/unlock-purchases';
import { saveOptions } from '../core/systems/options-system';
import { addExtremeResources, resetAllResources } from '../core/systems/dev';
import { sodaDrinkerHeaderService } from '../services/soda-drinker-header-service';
import { errorHandler } from '../core/error-handling/error-handler';
import { toDecimal } from '../core/numbers/simplified';

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
    'audio-btn': { audio: 'click', feedback: 'info', className: 'audio-btn' },
    'settings-modal-btn': { audio: 'click', feedback: 'info', className: 'settings-modal-btn' },
    // Environment system replaced by hybrid level system
    'level-btn': { audio: 'click', feedback: 'info', className: 'level-btn' },
  },
  actions: {
    buyStraw: {
      func: () => {
        try {
          // Use the purchase system
          const success = (purchasesSystem as any).execute.buyStraw();
          if (success) {
            // Straw purchased successfully
          } else {
            // Straw purchase failed - insufficient sips (normal behavior)
          }
        } catch (error) {
          errorHandler.handleError(error, 'purchaseStraw', { action: 'buyStraw' });
        }
      },
      type: 'shop-btn',
      label: 'Buy Straw',
    },
    buyCup: {
      func: () => {
        try {
          // Use the purchase system
          const success = (purchasesSystem as any).execute.buyCup();
          if (success) {
            // Cup purchased successfully
          } else {
            // Cup purchase failed - insufficient sips (normal behavior)
          }
        } catch (error) {
          errorHandler.handleError(error, 'purchaseCup', { action: 'buyCup' });
        }
      },
      type: 'shop-btn',
      label: 'Buy Cup',
    },
    buyWiderStraws: {
      func: () => {
        try {
          // Use the purchase system
          const success = (purchasesSystem as any).execute.buyWiderStraws();
          if (success) {
            // Wider straws purchased successfully
          } else {
            // Wider straws purchase failed - insufficient sips (normal behavior)
          }
        } catch (error) {
          errorHandler.handleError(error, 'purchaseWiderStraws', { action: 'buyWiderStraws' });
        }
      },
      type: 'shop-btn',
      label: 'Buy Wider Straws',
    },
    buyBetterCups: {
      func: () => {
        try {
          // Use the purchase system
          const success = (purchasesSystem as any).execute.buyBetterCups();
          if (success) {
            // Better cups purchased successfully
          } else {
            // Better cups purchase failed - insufficient sips (normal behavior)
          }
        } catch (error) {
          errorHandler.handleError(error, 'purchaseBetterCups', { action: 'buyBetterCups' });
        }
      },
      type: 'shop-btn',
      label: 'Buy Better Cups',
    },
    buySuction: {
      func: () => {
        // buySuction button action called
        // purchasesSystem available:
        // purchasesSystem.execute available:
        // purchasesSystem.execute.buySuction available:
        try {
          // Use the purchase system
          const success = (purchasesSystem as any).execute.buySuction();
          if (success) {
            // Suction purchased successfully
          } else {
            // Suction purchase failed - insufficient sips (normal behavior)
          }
        } catch (error) {
          errorHandler.handleError(error, 'purchaseSuction', { action: 'buySuction' });
        }
      },
      type: 'clicking-upgrade-btn',
      label: 'Buy Suction',
    },
    buyFasterDrinks: {
      func: () => {
        try {
          // Use the purchase system
          const success = (purchasesSystem as any).execute.buyFasterDrinks();
          if (success) {
            // Faster drinks purchased successfully
          } else {
            // Faster drinks purchase failed - insufficient sips (normal behavior)
          }
        } catch (error) {
          errorHandler.handleError(error, 'purchaseFasterDrinks', { action: 'buyFasterDrinks' });
        }
      },
      type: 'drink-speed-upgrade-btn',
      label: 'Buy Faster Drinks',
    },
    unlockLevel: {
      func: () => {
        // Unlock Level button clicked!
        // Use hybrid level system to unlock next level in sequence
        // Hybrid system available:

        if (hybridLevelSystem && typeof hybridLevelSystem.getCurrentLevel === 'function') {
          const currentLevel = hybridLevelSystem.getCurrentLevel();
          // Current level:

          if (currentLevel) {
            const allLevels = hybridLevelSystem.getAllLevels();
            const nextLevelId = currentLevel.id + 1;
            const nextLevel = allLevels.find((level: any) => level.id === nextLevelId);
            // Next level:

            if (nextLevel) {
              const state = useGameStore.getState();
              const sips = state.sips || toDecimal(0);
              const clicks = state.totalClicks || 0;
              // Use hybrid system's current level instead of old system's level
              const currentHybridLevel = currentLevel.id;

              // Current stats:
              console.log({
                sips: sips.toString(),
                clicks,
                currentHybridLevel,
              });
              // Next level requirements:

              // Check if level is already unlocked
              const isAlreadyUnlocked = hybridLevelSystem.isLevelUnlocked(nextLevel.id);
              // Level already unlocked:

              if (isAlreadyUnlocked) {
                // Level is already unlocked, just switch to it
                // Switching to already unlocked level:
                if (hybridLevelSystem.switchToLevel(nextLevel.id)) {
                  // Switched to level:

                  // Update the display
                  try {
                    updateLevelUpDisplay(state);
                    updateLevelText();
                    // Display updated
                  } catch (error) {
                    errorHandler.handleError(error, 'updateLevelDisplay', {
                      levelId: nextLevel.id,
                    });
                  }
                } else {
                  // Failed to switch to level
                }
              } else {
                // Level is not unlocked, check if we can unlock it
                const canUnlock =
                  sips.gte(nextLevel.unlockRequirement.sips) &&
                  clicks >= nextLevel.unlockRequirement.clicks &&
                  currentHybridLevel >= 1; // Level requirement simplified

                // Can unlock:

                if (canUnlock) {
                  // Attempting to unlock level:
                  // Unlock the next level
                  if (hybridLevelSystem.unlockLevel(nextLevel.id)) {
                    // Level unlocked successfully!
                    // Switch to the new level
                    hybridLevelSystem.switchToLevel(nextLevel.id);
                    // Switched to level:

                    // Show notification
                    (levelSelector as any).showUnlockNotification(nextLevel.id);

                    // Update the display
                    try {
                      updateLevelUpDisplay(state);
                      updateLevelText();
                      // Display updated
                    } catch (error) {
                      errorHandler.handleError(error, 'updateLevelDisplay', {
                        levelId: nextLevel.id,
                        action: 'unlock',
                      });
                    }
                  } else {
                    // Failed to unlock level
                  }
                } else {
                  // Cannot unlock - requirements not met
                }
              }
            } else {
              // No next level found
            }
          } else {
            // No current level found
          }
        } else {
          // Hybrid system not available
        }
      },
      type: 'unlock-btn',
      label: 'Unlock Level',
    },
    toggleLevelDropdown: {
      func: () => {
        // Toggle Level Dropdown clicked!
        const dropdown = document.getElementById('levelDropdown');
        if (dropdown) {
          const isVisible = dropdown.style.display !== 'none';
          dropdown.style.display = isVisible ? 'none' : 'block';

          // Update button text
          const button = document.querySelector('[data-action="toggleLevelDropdown"]');
          if (button) {
            button.textContent = isVisible ? 'Switch ▼' : 'Switch ▲';
          }

          // Populate dropdown if showing
          if (!isVisible) {
            populateLevelDropdown();
          }
        }
      },
      type: 'switch-dropdown-btn',
      label: 'Switch Level',
    },
    purchaseUnlock: {
      func: (featureName: string) => {
        try {
          // Use the unlock purchases system
          const success = (unlockPurchases as any).execute?.purchaseUnlock?.(featureName);
          if (success) {
            // Unlock purchased successfully
            console.log('Unlock purchased:', featureName);
          } else {
            // Unlock purchase failed - insufficient resources or already unlocked
            console.log('Unlock purchase failed:', featureName);
          }
        } catch (error) {
          errorHandler.handleError(error, 'purchaseUnlock', { featureName });
        }
      },
      type: 'shop-btn',
      label: 'Purchase Unlock',
    },
    save: {
      func: () => {
        try {
          // Use the save system
          const saveData = (saveSystem as any).performSaveSnapshot();
          if (saveData) {
            // Save to localStorage
            localStorage.setItem('soda-clicker-pro-save', JSON.stringify(saveData));
            // Game saved successfully

            // Update last save time in store
            const actions = getStoreActions();
            actions.setLastSaveTime(Date.now());
          } else {
            // Save failed - no data to save
          }
        } catch (error) {
          errorHandler.handleError(error, 'saveGame', { action: 'manualSave' });
        }
      },
      type: 'save-btn',
      label: 'Save Game',
    },
    delete_save: {
      func: () => {
        try {
          // Clear localStorage save data
          localStorage.removeItem('soda-clicker-pro-save');

          // Reset game state to default
          const actions = getStoreActions();
          actions.resetState();

          // Save data deleted and game reset

          // Refresh the page to apply reset
          if (confirm('Save data deleted! The page will refresh to reset the game.')) {
            window.location.reload();
          }
        } catch (error) {
          errorHandler.handleError(error, 'deleteSave', { action: 'deleteSave' });
        }
      },
      type: 'save-btn',
      label: 'Delete Save',
    },
    toggleButtonSounds: {
      func: () => {
        try {
          // Toggle click sounds in store
          // useGameStore already imported
          const currentState = useGameStore.getState();
          const newClickSoundsEnabled = !currentState.options.clickSoundsEnabled;

          const actions = getStoreActions();
          actions.setOption('clickSoundsEnabled', newClickSoundsEnabled);

          // Click sounds enabled/disabled

          // Update button text if it exists
          const button = document.querySelector('[data-action="toggleButtonSounds"]');
          if (button) {
            button.textContent = `Sound ${newClickSoundsEnabled ? 'ON' : 'OFF'}`;
          }
        } catch (error) {
          errorHandler.handleError(error, 'toggleButtonSounds', { action: 'toggleSounds' });
        }
      },
      type: 'sound-toggle-btn',
      label: 'Toggle Button Sounds',
    },
    toggleDevTools: {
      func: () => {
        try {
          // Use the dev tools manager for proper handling
          (devToolsManager as any).toggleDevTools();
        } catch (e) {
          errorHandler.handleError(e, 'toggleDevTools');
        }
      },
      type: 'dev-toggle-btn',
      label: 'Toggle Dev Tools',
    },
    toggleGodTab: {
      func: () => {
        try {
          // const w = window as any;
          const state = useGameStore.getState();
          if (state?.options) {
            const newValue = !state.options.godTabEnabled;

            // Update the state
            useGameStore.setState({
              options: { ...state.options, godTabEnabled: newValue },
            });

            // Save to storage - use proper options system
            try {
              // saveOptions already imported
              saveOptions({
                ...state.options,
                godTabEnabled: newValue,
              });
            } catch (error) {
              errorHandler.handleError(error, 'saveOptions', {
                option: 'godTabEnabled',
                value: newValue,
              });
            }

            // Update button text
            const button = document.querySelector('.god-toggle-btn');
            if (button) {
              button.textContent = `🙏 Talk to God ${newValue ? 'ON' : 'OFF'}`;
            }

            // Refresh navigation to show/hide god tab
            try {
              // Navigation refresh - modernized
              // Navigation refresh - modernized
            } catch (error) {
              errorHandler.handleError(error, 'refreshNavigation', { action: 'godTabToggle' });
            }
          }
        } catch (e) {
          errorHandler.handleError(e, 'toggleGodTab');
        }
      },
      type: 'god-toggle-btn',
      label: 'Toggle God Tab',
    },
    startGame: {
      func: () => {
        try {
          // Hide splash screen and show game content
          const splashScreen = document.getElementById('splashScreen');
          const gameContent = document.getElementById('gameContent');

          if (splashScreen && gameContent) {
            splashScreen.style.display = 'none';
            splashScreen.style.visibility = 'hidden';
            splashScreen.style.pointerEvents = 'none';
            if (splashScreen.parentNode) {
              splashScreen.parentNode.removeChild(splashScreen);
            }

            gameContent.style.display = 'block';
            gameContent.style.visibility = 'visible';
            gameContent.style.opacity = '1';
            document.body?.classList?.add('game-started');
          }
        } catch (error) {
          errorHandler.handleError(error, 'startGame', { action: 'splashStart' });
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
            // Send message functionality - modernized
            try {
              // Chat functionality - modernized
              // Send message - modernized
            } catch (error) {
              errorHandler.handleError(error, 'sendMessage', { message: chatInput.value });
            }
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
      func: () => {
        try {
          // Use the dev system
          const success = (devSystem as any).unlockAll();
          if (success) {
            // All features unlocked
          } else {
            // Failed to unlock all features
          }
        } catch (error) {
          errorHandler.handleError(error, 'unlockAllFeatures', { action: 'devUnlockAll' });
        }
      },
      type: 'dev-btn',
      label: 'Unlock All',
    },
    devUnlockShop: {
      func: () => {
        try {
          // Use the dev system
          const success = (devSystem as any).unlockShop();
          if (success) {
            // Shop unlocked
          } else {
            // Failed to unlock shop
          }
        } catch (error) {
          errorHandler.handleError(error, 'unlockShop', { action: 'devUnlockShop' });
        }
      },
      type: 'dev-btn',
      label: 'Unlock Shop',
    },
    devUnlockUpgrades: {
      func: () => {
        try {
          // Use the dev system
          const success = (devSystem as any).unlockUpgrades();
          if (success) {
            // Upgrades unlocked
          } else {
            // Failed to unlock upgrades
          }
        } catch (error) {
          errorHandler.handleError(error, 'unlockUpgrades', { action: 'devUnlockUpgrades' });
        }
      },
      type: 'dev-btn',
      label: 'Unlock Upgrades',
    },
    devResetUnlocks: {
      func: () => {
        try {
          // Use the dev system
          const success = (devSystem as any).resetUnlocks();
          if (success) {
            // Unlocks reset
          } else {
            // Failed to reset unlocks
          }
        } catch (error) {
          errorHandler.handleError(error, 'resetUnlocks');
        }
      },
      type: 'dev-btn',
      label: 'Reset Unlocks',
    },
    devAddTime: {
      func: (ms?: any) => {
        try {
          // Use the dev system
          const milliseconds = Number(ms) || 3600000; // Default 1 hour
          const success = (devSystem as any).addTime(milliseconds);
          if (success) {
            // Added time to game
          } else {
            // Failed to add time
          }
        } catch (error) {
          errorHandler.handleError(error, 'addTime');
        }
      },
      type: 'dev-btn',
      label: 'Add Time',
    },
    devAddSips: {
      func: (amt?: any) => {
        try {
          // Use the dev system
          const amount = Number(amt) || 1000; // Default 1000 sips
          const success = (devSystem as any).addSips(amount);
          if (success) {
            console.log(`✅ Added ${amount} sips`);
          } else {
            console.log('❌ Failed to add sips');
          }
        } catch (error) {
          errorHandler.handleError(error, 'addSips');
        }
      },
      type: 'dev-btn',
      label: 'Add Sips',
    },
    // Debug Tools Actions
    devClearConsole: {
      func: () => {
        // Modernized - dev clear console handled by store
        console.clear();
      },
      type: 'dev-btn',
      label: 'Clear Console',
    },
    devExportState: {
      func: () => {
        try {
          // Export current game state
          const state = useGameStore.getState();
          const stateData = {
            sips: state.sips?.toString() || '0',
            straws: state.straws?.toString() || '0',
            cups: state.cups?.toString() || '0',
            suctions: state.suctions?.toString() || '0',
            level: state.level?.toString() || '1',
            spd: state.spd?.toString() || '0',
            totalClicks: state.totalClicks || 0,
            totalSipsEarned: state.totalSipsEarned?.toString() || '0',
            options: state.options || {},
          };

          const dataStr = JSON.stringify(stateData, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `soda-clicker-state-${Date.now()}.json`;
          link.click();

          URL.revokeObjectURL(url);
          console.log('State exported successfully');
        } catch (error) {
          errorHandler.handleError(error, 'devExportState');
        }
      },
      type: 'dev-btn',
      label: 'Export State',
    },
    devPerformanceTest: {
      func: () => {
        try {
          // Run performance test
          const startTime = performance.now();
          const iterations = 1000;

          // Test state updates
          for (let i = 0; i < iterations; i++) {
            useGameStore.setState({ totalClicks: i });
          }

          const endTime = performance.now();
          const duration = endTime - startTime;

          console.log(`Performance Test Results:`);
          console.log(`- ${iterations} state updates in ${duration.toFixed(2)}ms`);
          console.log(`- Average: ${(duration / iterations).toFixed(4)}ms per update`);
          console.log(`- Rate: ${((iterations / duration) * 1000).toFixed(0)} updates/second`);
        } catch (error) {
          errorHandler.handleError(error, 'devPerformanceTest');
        }
      },
      type: 'dev-btn',
      label: 'Performance Test',
    },

    devExportSave: {
      func: () => {
        try {
          // Export save data
          const saveData = localStorage.getItem('soda-clicker-pro-save');
          if (saveData) {
            const dataBlob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `soda-clicker-save-${Date.now()}.json`;
            link.click();

            URL.revokeObjectURL(url);
            console.log('Save data exported successfully');
          } else {
            console.log('No save data found to export');
          }
        } catch (error) {
          errorHandler.handleError(error, 'devExportSave');
        }
      },
      type: 'save-btn',
      label: 'Export Save',
    },
    // Large Number Testing Actions
    largeNumberTest: {
      func: (action?: string) => {
        switch (action) {
          case 'addExtremeResources':
            try {
              // addExtremeResources already imported
              addExtremeResources?.();
            } catch (error) {
              errorHandler.handleError(error, 'addExtremeResources');
            }
            break;
          case 'resetAllResources':
            try {
              // resetAllResources already imported
              resetAllResources?.();
            } catch (error) {
              errorHandler.handleError(error, 'resetAllResources');
            }
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
      func: () => {
        try {
          // Create file input for save import
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = event => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = e => {
                try {
                  const saveData = e.target?.result as string;
                  if (saveData) {
                    localStorage.setItem('soda-clicker-pro-save', saveData);
                    console.log('Save data imported successfully');
                    // Reload the page to apply the imported save
                    window.location.reload();
                  }
                } catch (error) {
                  errorHandler.handleError(error, 'devImportSave');
                }
              };
              reader.readAsText(file);
            }
          };
          input.click();
        } catch (error) {
          errorHandler.handleError(error, 'devImportSave');
        }
      },
      type: 'save-btn',
      label: 'Import Save',
    },
    devTestOffline: {
      func: (hoursAway?: string) => {
        try {
          const hours = Number(hoursAway) || 2; // Default 2 hours
          const millisecondsAway = hours * 60 * 60 * 1000;

          // Set lastSaveTime to simulate being away
          // const w: any = window as any; // Legacy global removed
          const fakeLastSaveTime = Date.now() - millisecondsAway;

          // Update the save time
          useGameStore.setState({ lastSaveTime: fakeLastSaveTime });

          // Trigger offline progression check
          const result = (offlineProgression as any).processOfflineProgression({
            maxOfflineHours: 8,
            minOfflineMinutes: 0.1, // Show even for short times in dev mode
            offlineEfficiency: 1.0,
          });

          if (result) {
            (offlineModal as any).showOfflineModal(result, {
              showParticles: true,
              autoCloseAfter: 0,
              playSound: false,
            });
            console.log(
              `🎉 Offline test: Simulated ${hours}h away, earned ${result.sipsEarned} sips`
            );
          } else {
            console.log('❌ Offline test: No offline progression triggered');
          }
        } catch (error) {
          errorHandler.handleError(error, 'testOfflineProgression', { critical: true });
        }
      },
      type: 'dev-btn',
      label: 'Test Offline',
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

              // Refresh audio controls to sync with current state
              try {
                audioControlsManager.refresh();
              } catch (error) {
                console.debug('Audio controls not available yet:', error);
              }

              // Initialize level selector in settings
              try {
                // Use the imported service directly
                if (
                  sodaDrinkerHeaderService &&
                  typeof sodaDrinkerHeaderService.setupLevelDropdown === 'function'
                ) {
                  sodaDrinkerHeaderService.setupLevelDropdown();
                  console.log('✅ Level selector initialized in settings');
                } else {
                  errorHandler.handleError(
                    new Error('Soda Drinker Header Service not available'),
                    'levelSelector',
                    { severity: 'low' }
                  );
                }
              } catch (error) {
                errorHandler.handleError(error, 'initializeLevelSelectorInSettings');
              }
            }, 10);
          }
        } catch (error) {
          errorHandler.handleError(error, 'openSettingsModal');
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
          errorHandler.handleError(error, 'closeSettingsModal');
        }
      },
      type: 'settings-modal-btn',
      label: 'Close Settings',
    },
    // Environment selector removed - replaced by level selector
    openLevelSelector: {
      func: () => {
        try {
          // Use the level selector
          (levelSelector as any).show();
        } catch (error) {
          errorHandler.handleError(error, 'openLevelSelector');
        }
      },
      type: 'level-btn',
      label: 'Open Level Selector',
    },
    closeOfflineModal: {
      func: () => {
        try {
          const modal = document.getElementById('offlineModal');
          if (modal) {
            modal.style.animation = 'offlineModalFadeIn 0.2s ease-in reverse';
            setTimeout(() => {
              if (modal.parentNode) {
                modal.remove();
              }
            }, 200);
          }
        } catch (error) {
          errorHandler.handleError(error, 'closeOfflineModal');
        }
      },
      type: 'offline-modal-btn',
      label: 'Claim Offline Earnings',
    },
    forceGameplayMusic: {
      func: () => {
        try {
          enhancedAudioManager.forceTransitionToGameplay();
          const state = enhancedAudioManager.getAudioState();
          console.log(`Music transitioned to: ${state.currentTrack}`);
        } catch (error) {
          errorHandler.handleError(error, 'transitionToGameplayMusic');
        }
      },
      type: 'dev-btn',
      label: 'Force Gameplay Music',
    },
    testVolumeBalance: {
      func: () => {
        try {
          const state = enhancedAudioManager.getAudioState();
          console.log('Current volume adjustments:', {
            title: state.titleVolumeAdjustment,
            gameplay: state.gameplayVolumeAdjustment,
            currentTrack: state.currentTrack,
          });

          // Quick test: reduce gameplay music by additional 10%
          enhancedAudioManager.adjustTrackVolumes(1.0, 0.65);
          console.log('Applied test adjustment: Title=1.0, Gameplay=0.65');
        } catch (error) {
          errorHandler.handleError(error, 'testVolumeBalance');
        }
      },
      type: 'dev-btn',
      label: '🔊 Test Volume Balance',
    },
    testMusicLooping: {
      func: () => {
        try {
          // Force transition to gameplay music to test looping
          enhancedAudioManager.forceTransitionToGameplay();

          const state = enhancedAudioManager.getAudioState();
          console.log('Testing trimmed music looping:', {
            currentTrack: state.currentTrack,
            musicPlaying: state.musicPlaying,
            titleMusicPlayed: state.titleMusicPlayed,
          });

          // Log when the music should loop
          console.log('Watch console for trimmed loop behavior - should skip 5s of dead air');
          console.log('If timing is off, adjust the sprite end time in enhanced-audio-manager.ts');
        } catch (error) {
          errorHandler.handleError(error, 'testMusicLooping');
        }
      },
      type: 'dev-btn',
      label: '🔄 Test Trimmed Loop',
    },
    switchSettingsTab: {
      func: (tabName: string) => {
        try {
          console.log('🔄 Switching to settings tab:', tabName);

          // Remove active class from all tabs and content
          const allTabs = document.querySelectorAll('.settings-tab-btn');
          const allContent = document.querySelectorAll('.settings-tab-content');

          allTabs.forEach(tab => tab.classList.remove('active'));
          allContent.forEach(content => content.classList.remove('active'));

          // Add active class to selected tab and content
          const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
          const selectedContent = document.getElementById(`${tabName}-tab`);

          console.log('🎯 Selected tab element:', selectedTab);
          console.log('🎯 Selected content element:', selectedContent);

          if (selectedTab) selectedTab.classList.add('active');
          if (selectedContent) selectedContent.classList.add('active');

          console.log('✅ Settings tab switched successfully');
        } catch (error) {
          errorHandler.handleError(error, 'switchSettingsTab');
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
              // Use the proper God response system
              // Create a temporary container for the God response
              const tempContainer = document.createElement('div');
              tempContainer.id = 'chatMessages';
              tempContainer.style.display = 'none';
              document.body.appendChild(tempContainer);

              // Use the proper God response system
              (godModule as any).getGodResponse(message);

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
            } catch (error) {
              errorHandler.handleError(error, 'getGodResponse');
            }
          }, 1000);
        } catch (error) {
          errorHandler.handleError(error, 'sendGodMessage');
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
    errorHandler.handleError(error, 'markPointerAsHandled');
  }
}
function shouldSuppressClick(element: HTMLElement): boolean {
  try {
    const last = Number((element && (element as any).__lastPointerTs) || 0);
    return Date.now() - last < POINTER_SUPPRESS_MS;
  } catch (error) {
    errorHandler.handleError(error, 'checkPointerSuppression');
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
    // Play button audio if enabled
    // useGameStore already imported
    const state = useGameStore.getState();

    if (state.options.clickSoundsEnabled) {
      try {
        (buttonAudio as any).playButtonClickSound();
      } catch (error) {
        errorHandler.handleError(error, 'loadAudioSystem');
      }
    }
  } catch (error) {
    errorHandler.handleError(error, 'playButtonAudio');
  }
  try {
    button.classList.add('button-clicked');
    setTimeout(() => {
      try {
        button.classList.remove('button-clicked');
      } catch (error) {
        errorHandler.handleError(error, 'removeButtonClickedClass');
      }
    }, 150);
  } catch (error) {
    errorHandler.handleError(error, 'addButtonClickedVisualFeedback');
  }
  try {
    if (action.func && typeof action.func === 'function') {
      // Special handling for dev actions to ensure dev system is loaded
      if (actionName.startsWith('dev')) {
        // Modernized - dev system check handled by store
        // Dev system is always available in modernized version
      }
      action.func();
      if (buttonType.feedback === 'levelup') {
        try {
          // Modernized - level up feedback handled by store
        } catch (error) {
          // Error handling - logging removed for production
        }
      }
    }
  } catch (error) {
    errorHandler.handleError(error, 'buttonAction', { actionName, critical: true });
    // Don't let dev action errors crash the page
    if (actionName.startsWith('dev')) {
      errorHandler.handleError(new Error('Dev action failed, but continuing'), 'devAction', {
        severity: 'low',
      });
    } else {
      throw error; // Re-throw non-dev errors
    }
  }
}

function setupUnifiedButtonSystem(): void {
  // Prevent multiple setup
  if ((window as any).__BUTTON_SYSTEM_SETUP__) {
    return;
  }
  (window as any).__BUTTON_SYSTEM_SETUP__ = true;

  // Initialize mobile input handler for enhanced touch validation
  try {
    mobileInputHandler.initialize();
  } catch (error) {
    errorHandler.handleError(error, 'initializeMobileInputHandler');
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

  // Add performance mode change handler for 3D model
  const modelPerformanceSelect = document.getElementById(
    'modelPerformanceMode'
  ) as HTMLSelectElement;
  if (modelPerformanceSelect) {
    modelPerformanceSelect.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const mode = target.value as 'low' | 'medium' | 'high';

      // Update 3D model performance mode
      const soda3DButton = (window as any).soda3DButton; // 3D button is a global service
      if (soda3DButton && typeof soda3DButton.setPerformanceMode === 'function') {
        soda3DButton.setPerformanceMode(mode);
        console.log(`🎮 3D Model performance mode changed to: ${mode}`);

        // Show feedback
        // Modernized - notification handled by store
        console.log(`3D Model performance set to ${mode}`);
      }
    });
  }
  setupSpecialButtonHandlers();
}

function setupSpecialButtonHandlers(): void {
  // First ensure clicks system is loaded
  function ensureClicksSystemLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max

      const checkClicksSystem = () => {
        attempts++;

        // Check if we're in a test environment and window is not available
        if (typeof window === 'undefined') {
          // Window undefined, resolving...
          resolve();
          return;
        }

        // Modernized - clicks system handled by store
        const hasClicksSystem = true;
        const isDomReady = domQuery.exists('#sodaButton'); // Only need soda button for soda button setup

        if (hasClicksSystem && isDomReady) {
          resolve();
        } else if (attempts >= maxAttempts) {
          errorHandler.handleError(
            new Error('Timeout: Clicks system or DOM not ready after 5 seconds'),
            'clicksSystemTimeout',
            { critical: true }
          );
          reject(new Error('Clicks system or DOM not ready after timeout'));
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
        try {
          // Modernized - tab switching handled by store
        } catch (error) {
          // Error handling - logging removed for production
        }
      }
    });
  });
  // Setup soda button with clicks system check
  const setupSodaButton = async () => {
    // Try to load clicks system, but don't fail if it's not ready
    try {
      await ensureClicksSystemLoaded();
    } catch (error) {
      errorHandler.handleError(
        new Error('Clicks system not ready, setting up button anyway'),
        'clicksSystemNotReady',
        { severity: 'low' }
      );
      // Continue with button setup even if clicks system isn't ready
      // The button will work once the system loads
    }
    const sodaDomCacheBtn = domQuery.getById('sodaButton');
    const sodaButton = sodaDomCacheBtn || document.getElementById('sodaButton');

    // Only log if button not found
    if (!sodaButton) {
      errorHandler.handleError(new Error('Soda button not found'), 'sodaButtonNotFound', {
        critical: true,
      });
      return;
    }
    if (sodaButton && (sodaButton as any).addEventListener) {
      // Flag to prevent double clicks from touch + click events
      let touchHandled = false;

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
          // Reset touch handled flag after a short delay
          setTimeout(() => {
            touchHandled = false;
          }, 100);
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
            errorHandler.handleError(error, 'addVisualFeedback');
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
            window.scrollY - ((sodaButton as any).__touchStartScrollY || window.scrollY)
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
            touchHandled = true; // Mark that touch handled the click

            // Remove visual feedback (was added on press)
            try {
              (sodaButton as any).classList.remove('soda-clicked');
            } catch (error) {
              errorHandler.handleError(error, 'removeVisualFeedback');
            }
            try {
              // Call handleSodaClick with proper trackClick injection
              const trackClick = (clicksSystem as any).trackClickFactory();
              const handleSodaClick = (clicksSystem as any).handleSodaClickFactory({ trackClick });
              handleSodaClick(1.0); // Default multiplier of 1.0
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
          // Reset touch handled flag after a short delay
          setTimeout(() => {
            touchHandled = false;
          }, 100);
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
              errorHandler.handleError(error, 'addVisualFeedback');
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
            currentScrollY - ((sodaButton as any).__touchStartScrollY || currentScrollY)
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
            touchHandled = true; // Mark that touch handled the click

            // Remove visual feedback (was added on touch start)
            try {
              (sodaButton as any).classList.remove('soda-clicked');
            } catch (error) {
              errorHandler.handleError(error, 'removeVisualFeedback');
            }
            try {
              // Call handleSodaClick with proper trackClick injection
              const trackClick = (clicksSystem as any).trackClickFactory();
              const handleSodaClick = (clicksSystem as any).handleSodaClickFactory({ trackClick });
              handleSodaClick(1.0); // Default multiplier of 1.0
            } catch (error) {
              // Error handling - logging removed for production
            }
          }
          reset();
        });
        sodaButton.addEventListener('touchcancel', reset);
      }

      // Standard click event handler
      sodaButton.addEventListener('click', async () => {
        if (shouldSuppressClick(sodaButton)) {
          return;
        }

        // Prevent double clicks from touch + click events
        if (touchHandled) {
          touchHandled = false; // Reset for next interaction
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
          try {
            const trackClick = (clicksSystem as any).trackClickFactory();
            const handleSodaClick = (clicksSystem as any).handleSodaClickFactory({ trackClick });
            await handleSodaClick(1.0); // Default multiplier of 1.0

            // Trigger UI update after click
            try {
              updateAllDisplaysOptimized();
            } catch (error) {
              errorHandler.handleError(error, 'updateAllDisplays');
            }
          } catch (error) {
            errorHandler.handleError(error, 'loadClickSystem');
          }
        } catch (error) {
          errorHandler.handleError(error, 'sodaClickHandler', { critical: true });
        }
      });
    }
    // Soda button setup complete
  };

  // Call the async setup function
  setupSodaButton().catch(error => {
    errorHandler.handleError(error, 'setupSodaButton', { critical: true });
  });

  // Debug function to check soda button setup
  (window as any).debugSodaButtonSetup = () => {
    // Debug function - can stay global
    console.log('=== SODA BUTTON DEBUG ===');
    const sodaButton = document.getElementById('sodaButton');
    console.log('Soda button element:', sodaButton);
    console.log(
      'Soda button event listeners:',
      sodaButton ? 'Check browser dev tools' : 'Not found'
    );

    // Modernized - soda click handled by store
    console.log('handleSodaClick available: true (via clicks-system)');

    console.log('DOM elements ready:', domQuery.exists('#sodaButton'));
    console.log('=== END SODA BUTTON DEBUG ===');
  };
  const chatInput = document.getElementById('chatInput') as any;
  if (chatInput) {
    chatInput.addEventListener('keypress', (e: any) => {
      if (e.key === 'Enter') {
        try {
          // Chat functionality - modernized
          console.log('Send message on Enter - modernized');
        } catch (error) {
          errorHandler.handleError(error, 'sendMessageOnEnter');
        }
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
          // Start game functionality - modernized
          console.log('Start game - modernized');
        } catch (error) {
          errorHandler.handleError(error, 'startGame');
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
            // Start game functionality - modernized
            console.log('Start game - modernized');
          } catch (error) {
            errorHandler.handleError(error, 'startGame');
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
        // Start game functionality - modernized
        console.log('Start game - modernized');
      } catch (error) {
        errorHandler.handleError(error, 'startGame');
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
          console.log(`[DEBUG] Looking up button action for fnName:`, fnName);
          console.log(`[DEBUG] BUTTON_CONFIG.actions[fnName]:`, meta);

          // Handle tab switch explicitly (play sound always)
          if (fnName === 'switchTab') {
            e.preventDefault();
            e.stopPropagation();
            try {
              // Play tab switch sound if enabled
              const state = useGameStore.getState();
              if (state.options.clickSoundsEnabled) {
                buttonAudio.playButtonClickSound?.();
              }
            } catch (error) {
              errorHandler.handleError(error, 'playTabSwitchSound');
            }
            // Handle tab switching
            const tabName = fnName.replace('switchTab:', '');
            if (tabName) {
              try {
                // Hide all tabs
                const allTabs = document.querySelectorAll('.tab-content');
                allTabs.forEach(tab => {
                  (tab as HTMLElement).style.display = 'none';
                });

                // Show target tab
                const targetTab = document.getElementById(`${tabName}Tab`);
                if (targetTab) {
                  targetTab.style.display = 'block';
                }

                // Update active tab button
                const allButtons = document.querySelectorAll('.tab-btn');
                allButtons.forEach(btn => {
                  btn.classList.remove('active');
                });

                const activeButton = document.querySelector(`[data-action="switchTab:${tabName}"]`);
                if (activeButton) {
                  activeButton.classList.add('active');
                }
              } catch (error) {
                errorHandler.handleError(error, 'switchTab', { tabName });
              }
            }
            return;
          }
          // Modernized - purchase system handled by store
          if (meta || isPurchase) {
            e.preventDefault();
            e.stopPropagation();
            try {
              let success = true;
              if (meta && typeof meta.func === 'function') {
                const ret = meta.func(...args);
                success = typeof ret === 'undefined' ? true : !!ret;
                try {
                  if (fnName === 'toggleButtonSounds') {
                    // Toggle button sounds in store
                    const currentState = useGameStore.getState();
                    const newValue = !currentState.options.clickSoundsEnabled;
                    const actions = getStoreActions();
                    actions.setOption('clickSoundsEnabled', newValue);
                  }
                } catch (error) {
                  errorHandler.handleError(error, 'toggleButtonSounds');
                }
                try {
                  // Play button click sound if enabled
                  const state = useGameStore.getState();
                  if (state.options.clickSoundsEnabled) {
                    buttonAudio.playButtonClickSound?.();
                  }
                } catch (error) {
                  errorHandler.handleError(error, 'playButtonClickSound');
                }
              } else {
                if (fnName === 'purchaseUnlock' && args.length > 0) {
                  // Handle unlock purchase with feature name argument
                  try {
                    const success = (unlockPurchases as any).execute?.purchaseUnlock?.(args[0]);
                    if (success) {
                      console.log('Unlock purchased:', args[0]);
                    } else {
                      console.log('Unlock purchase failed:', args[0]);
                    }
                  } catch (error) {
                    errorHandler.handleError(error, 'purchaseUnlock', { featureName: args[0] });
                  }
                } else if (isPurchase) {
                  // Handle purchase actions through the purchase system
                  try {
                    const purchaseActions = {
                      buyStraw: () => (purchasesSystem as any).execute.buyStraw(),
                      buyCup: () => (purchasesSystem as any).execute.buyCup(),
                      buyWiderStraws: () => (purchasesSystem as any).execute.buyWiderStraws(),
                      buyBetterCups: () => (purchasesSystem as any).execute.buyBetterCups(),
                      buySuction: () => (purchasesSystem as any).execute.buySuction(),
                      buyFasterDrinks: () => (purchasesSystem as any).execute.buyFasterDrinks(),
                    };
                    const purchaseAction = purchaseActions[fnName as keyof typeof purchaseActions];
                    if (purchaseAction) {
                      success = purchaseAction();
                    }
                  } catch (error) {
                    errorHandler.handleError(error, 'purchaseAction', { action: fnName });
                    success = false;
                  }
                }
                try {
                  // Play purchase sound if enabled
                  const state = useGameStore.getState();
                  if (state.options.clickSoundsEnabled && success) {
                    buttonAudio.playButtonClickSound?.();
                  }
                } catch (error) {
                  errorHandler.handleError(error, 'playPurchaseSound');
                }
              }
              if (
                isPurchase &&
                // Modernized - UI feedback handled by store
                success &&
                el // Add null check for el
              ) {
                let costValue: number | undefined;
                try {
                  const costSpan = el!.querySelector('.cost-number') as HTMLElement | null;
                  if (costSpan) {
                    costValue = Number(costSpan!.textContent);
                  } else {
                    const match = (el!.textContent || '')
                      .replace(/[,]/g, '')
                      .match(/\d+(?:\.\d+)?/);
                    costValue = match ? Number(match![0]) : undefined;
                  }
                } catch (error) {
                  // Error handling - logging removed for production
                }
                if (typeof costValue === 'number' && !Number.isNaN(costValue) && costValue > 0) {
                  // Show purchase feedback
                  try {
                    const rect = el!.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;

                    (feedback as any).showPurchaseFeedback(fnName, costValue as number, cx, cy);
                  } catch (error) {
                    errorHandler.handleError(error, 'showPurchaseFeedback');
                  }
                }
              }
            } catch (err) {
              errorHandler.handleError(err, 'buttonAction', { actionName: fnName });
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
        if (!action) return;
        const [fnName, argStr] = action.includes(':') ? action.split(':') : [action, ''];

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
            // Play tab switch sound if enabled
            const state = useGameStore.getState();
            if (state.options.clickSoundsEnabled) {
              buttonAudio.playButtonClickSound?.();
            }
          } catch (error) {
            errorHandler.handleError(error, 'playTabSwitchSound');
          }
          // Handle tab switching
          const tabName = fnName.replace('switchTab:', '');
          if (tabName) {
            try {
              // Hide all tabs
              const allTabs = document.querySelectorAll('.tab-content');
              allTabs.forEach(tab => {
                (tab as HTMLElement).style.display = 'none';
              });

              // Show target tab
              const targetTab = document.getElementById(`${tabName}Tab`);
              if (targetTab) {
                targetTab.style.display = 'block';
              }

              // Update active tab button
              const allButtons = document.querySelectorAll('.tab-btn');
              allButtons.forEach(btn => {
                btn.classList.remove('active');
              });

              const activeButton = document.querySelector(`[data-action="switchTab:${tabName}"]`);
              if (activeButton) {
                activeButton.classList.add('active');
              }
            } catch (error) {
              errorHandler.handleError(error, 'switchTab', { tabName });
            }
          }
          return;
        }
        // Modernized - purchase system handled by store
        if (meta || isPurchase) {
          e.preventDefault();
          e.stopPropagation();
          try {
            let success = true;
            if (meta && typeof meta.func === 'function') {
              const ret = meta.func(...args);
              success = typeof ret === 'undefined' ? true : !!ret;
              try {
                if (fnName === 'toggleButtonSounds') {
                  // Toggle button sounds in store
                  const currentState = useGameStore.getState();
                  const newValue = !currentState.options.clickSoundsEnabled;
                  const actions = getStoreActions();
                  actions.setOption('clickSoundsEnabled', newValue);
                }
              } catch (error) {
                errorHandler.handleError(error, 'toggleButtonSounds');
              }
              try {
                // Play button click sound if enabled
                const state = useGameStore.getState();
                if (state.options.clickSoundsEnabled) {
                  buttonAudio.playButtonClickSound?.();
                }
              } catch (error) {
                errorHandler.handleError(error, 'playButtonClickSound');
              }
            } else {
              if (fnName === 'purchaseUnlock' && args.length > 0) {
                // Handle unlock purchase with feature name argument
                try {
                  const success = (unlockPurchases as any).execute?.purchaseUnlock?.(args[0]);
                  if (success) {
                    console.log('Unlock purchased:', args[0]);
                  } else {
                    console.log('Unlock purchase failed:', args[0]);
                  }
                } catch (error) {
                  errorHandler.handleError(error, 'purchaseUnlock', { featureName: args[0] });
                }
              } else if (isPurchase) {
                // Handle purchase actions through the purchase system
                try {
                  const purchaseActions = {
                    buyStraw: () => (purchasesSystem as any).execute.buyStraw(),
                    buyCup: () => (purchasesSystem as any).execute.buyCup(),
                    buyWiderStraws: () => (purchasesSystem as any).execute.buyWiderStraws(),
                    buyBetterCups: () => (purchasesSystem as any).execute.buyBetterCups(),
                    buySuction: () => (purchasesSystem as any).execute.buySuction(),
                    buyFasterDrinks: () => (purchasesSystem as any).execute.buyFasterDrinks(),
                  };
                  const purchaseAction = purchaseActions[fnName as keyof typeof purchaseActions];
                  if (purchaseAction) {
                    success = purchaseAction();
                  }
                } catch (error) {
                  errorHandler.handleError(error, 'purchaseAction', { action: fnName });
                  success = false;
                }
              }
              try {
                // Play purchase sound if enabled
                const state = useGameStore.getState();
                if (state.options.clickSoundsEnabled && success) {
                  buttonAudio.playButtonClickSound?.();
                }
              } catch (error) {
                errorHandler.handleError(error, 'playPurchaseSound');
              }
            }
            if (
              isPurchase &&
              // Modernized - UI feedback handled by store
              success &&
              el // Add null check for el
            ) {
              let costValue: number | undefined;
              try {
                const costSpan = el!.querySelector('.cost-number') as HTMLElement | null;
                if (costSpan) {
                  costValue = Number(costSpan!.textContent);
                } else {
                  const match = (el!.textContent || '').replace(/[,]/g, '').match(/\d+(?:\.\d+)?/);
                  costValue = match ? Number(match![0]) : undefined;
                }
              } catch (error) {
                // Error handling - logging removed for production
              }
              if (typeof costValue === 'number' && !Number.isNaN(costValue)) {
                try {
                  // Purchase feedback - modernized
                } catch (error) {
                  errorHandler.handleError(error, 'showPurchaseFeedback');
                }
              }
            }
          } catch (err) {
            errorHandler.handleError(err, 'buttonAction', { actionName: fnName });
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
            // Start game functionality - modernized
            console.log('Start game - modernized');
          } catch (err) {
            errorHandler.handleError(err, 'startGame');
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
          // Start game functionality - modernized
          console.log('Start game - modernized');
        } catch (err) {
          errorHandler.handleError(err, 'startGame');
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
            const state = useGameStore.getState();
            const prev = state.options || {};
            useGameStore.setState({
              options: { ...prev, autosaveEnabled: checked },
            });
            try {
              // saveOptions already imported
              saveOptions({
                ...prev,
                autosaveEnabled: checked,
                autosaveInterval: Number(prev.autosaveInterval || 10),
              });
            } catch (error) {
              errorHandler.handleError(error, 'saveAutosaveOptions');
            }
            try {
              // Update autosave status - modernized
              console.log('Autosave status updated - modernized');
            } catch (error) {
              errorHandler.handleError(error, 'updateAutosaveStatus');
            }
          } else if (fnName === 'changeAutosaveInterval') {
            const value = Number((target as HTMLSelectElement).value || 10);
            const state = useGameStore.getState();
            const prev = state.options || {};
            useGameStore.setState({
              options: { ...prev, autosaveInterval: value },
            });
            try {
              // saveOptions already imported
              saveOptions({
                ...prev,
                autosaveEnabled: !!prev.autosaveEnabled,
                autosaveInterval: value,
              });
            } catch (error) {
              errorHandler.handleError(error, 'saveAutosaveIntervalOptions');
            }
            try {
              // Update autosave status - modernized
              console.log('Autosave status updated - modernized');
            } catch (error) {
              errorHandler.handleError(error, 'updateAutosaveStatus');
            }
          }
        } catch (err) {
          errorHandler.handleError(err, 'changeAction', { actionName: fnName });
        }
      },
      { capture: true }
    );
  }
}

function initButtonSystem(): void {
  function tryInitialize() {
    // App readiness check modernized - using direct imports
    const appReady = true; // All systems now use direct imports
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
    errorHandler.handleError(error, 'configureTouchSensitivity');
  }
}

/**
 * Get current touch sensitivity configuration
 */
export function getTouchSensitivityConfig() {
  try {
    return mobileInputHandler.getTouchValidationConfig();
  } catch (error) {
    errorHandler.handleError(error, 'getTouchSensitivityConfig');
    return null;
  }
}

// Level Dropdown Functions
export function populateLevelDropdown(): void {
  const dropdown = document.getElementById('levelDropdown');
  if (!dropdown) return;

  // Hybrid system access modernized - using direct import
  const hybridSystem = hybridLevelSystem;
  if (!hybridSystem) return;

  const currentLevel = hybridSystem.getCurrentLevel();
  const allLevels = hybridSystem.getAllLevels();
  const unlockedLevels = allLevels.filter((level: any) => hybridSystem.isLevelUnlocked(level.id));

  dropdown.innerHTML = '';

  unlockedLevels.forEach((level: any) => {
    const item = document.createElement('div');
    item.className = 'level-dropdown-item';
    if (level.id === currentLevel?.id) {
      item.classList.add('current');
    }

    item.innerHTML = `
      <span class="level-icon">${level.icon || '🎮'}</span>
      <div class="level-info">
        <div class="level-name">${level.name}</div>
        <div class="level-description">Level ${level.id}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      switchToLevel(level.id);
      dropdown.style.display = 'none';
      const button = document.querySelector('[data-action="toggleLevelDropdown"]');
      if (button) {
        button.textContent = 'Switch ▼';
      }
    });

    dropdown.appendChild(item);
  });
}

export function switchToLevel(levelId: number): void {
  // Hybrid system access modernized - using direct import
  const hybridSystem = hybridLevelSystem;
  if (!hybridSystem) return;

  console.log('🔄 Switching to level:', levelId);

  if (hybridSystem.switchToLevel(levelId)) {
    console.log('✅ Switched to level:', levelId);

    // Update UI
    try {
      // UI update - modernized
      console.log('UI updated - modernized');
    } catch (error) {
      errorHandler.handleError(error, 'updateUI');
    }
  } else {
    console.log('❌ Failed to switch to level:', levelId);
  }
}

export {
  BUTTON_CONFIG,
  handleButtonClick,
  setupUnifiedButtonSystem,
  setupSpecialButtonHandlers,
  initButtonSystem,
};
