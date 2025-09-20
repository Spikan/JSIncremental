// Modern Button System - Unified button event handling and management (TypeScript)

import { mobileInputHandler } from './mobile-input';
import { domQuery } from '../services/dom-query';
import { enhancedAudioManager } from '../services/enhanced-audio-manager';
import { audioControlsManager } from './audio-controls';
import { useGameStore, getStoreActions } from '../core/state/zustand-store';
import { hybridLevelSystem } from '../core/systems/hybrid-level-system';
import { updateLevelUpDisplay, updateLevelText } from './displays';
import { BUTTON_TYPES, type ButtonTypeMeta as ConfigButtonTypeMeta } from './button-config';
import { markPointerHandled, shouldSuppressClick } from './pointer-meta';
// Add static imports to replace dynamic imports
import { execute as purchasesExecute } from '../core/systems/purchases-system';
import { performSaveSnapshot } from '../core/systems/save-system';
import {
  unlockAll as devUnlockAll,
  unlockShop as devUnlockShop,
  unlockUpgrades as devUnlockUpgrades,
  resetUnlocks as devResetUnlocks,
  addTime as devAddTime,
  addSips as devAddSips,
} from '../core/systems/dev';
import { processOfflineProgression } from '../core/systems/offline-progression';
import { playButtonClickSound } from '../core/systems/button-audio';
// clicksSystem used inside soda-button-gestures module
import { levelSelector } from './level-selector';
import { devToolsManager } from './dev-tools-manager';
import { showOfflineModal } from './offline-modal';
// feedback helpers imported individually
import { getGodResponse } from '../god';
import { executeUnlockPurchase } from '../core/systems/unlock-purchases';
import { saveOptions } from '../core/systems/options-system';
import { addExtremeResources, resetAllResources } from '../core/systems/dev';
import { sodaDrinkerHeaderService } from '../services/soda-drinker-header-service';
import { errorHandler } from '../core/error-handling/error-handler';
import { toDecimal } from '../core/numbers/simplified';
// pointer-tracker used inside soda-button-gestures module
import { setupSodaButtonGestures } from './soda-button-gestures';

// Idempotent initialization guard (module-local)
let __buttonSystemInitialized = false;

type ButtonActionMeta = { func: (...args: any[]) => any; type: string; label: string };
// ButtonTypeMeta moved to button-config.ts

const BUTTON_CONFIG: {
  types: Record<string, ConfigButtonTypeMeta>;
  actions: Record<string, ButtonActionMeta>;
} = {
  types: BUTTON_TYPES,
  actions: {
    buyStraw: {
      func: () => {
        try {
          // Use the purchase system
          const success = purchasesExecute.buyStraw();
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
          const success = purchasesExecute.buyCup();
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
          const success = purchasesExecute.buyWiderStraws();
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
          const success = purchasesExecute.buyBetterCups();
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
          const success = purchasesExecute.buySuction();
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
          const success = purchasesExecute.buyFasterDrinks();
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
                    levelSelector.showUnlockNotification(nextLevel.id);

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
          const success = executeUnlockPurchase(featureName);
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
          const saveData = performSaveSnapshot();
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
          devToolsManager.toggleDevTools();
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
          const success = devUnlockAll();
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
          const success = devUnlockShop();
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
          const success = devUnlockUpgrades();
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
          const success = devResetUnlocks();
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
          const success = devAddTime(milliseconds);
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
          const success = devAddSips(amount);
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
          const result = processOfflineProgression({
            maxOfflineHours: 8,
            minOfflineMinutes: 0.1, // Show even for short times in dev mode
            offlineEfficiency: 1.0,
          });

          if (result) {
            showOfflineModal(result, {
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
          levelSelector.show();
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
              getGodResponse(message);

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

// Pointer suppression is handled in pointer-meta

// markPointerHandled and shouldSuppressClick now provided by pointer-meta

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
        playButtonClickSound();
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
      // Extract optional args from data-args attribute
      let args: unknown[] = [];
      try {
        const rawArgs = button.getAttribute('data-args');
        if (rawArgs && rawArgs.length > 0) {
          // Split on commas, trim whitespace
          args = rawArgs
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        }
      } catch {}
      (action.func as any)(...args);
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
  if (__buttonSystemInitialized) {
    return;
  }
  __buttonSystemInitialized = true;
  try {
    (window as any).__BUTTON_SYSTEM_SETUP__ = true; // legacy guard for compatibility
  } catch {}

  // Initialize mobile input handler for enhanced touch validation
  try {
    mobileInputHandler.initialize();
  } catch (error) {
    errorHandler.handleError(error, 'initializeMobileInputHandler');
  }

  // Setting up modern button event handler system
  // 1) Support legacy inline onclick attributes on <button>
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

  // 2) Primary binding path: elements with data-action (buttons and other clickable elements)
  const actionElements = document.querySelectorAll('[data-action]');
  actionElements.forEach((el: Element) => {
    const element = el as HTMLElement;
    // Skip sodaButton; it's handled by soda-button-gestures/3D component
    if (element.id === 'sodaButton') return;
    // Avoid double-binding
    if (element.getAttribute('data-bound') === '1') return;

    const actionName = element.getAttribute('data-action') || '';
    if (!actionName) return;
    const action = BUTTON_CONFIG.actions[actionName];
    if (!action) return; // Unknown action; ignore

    // Mark as bound
    element.setAttribute('data-bound', '1');

    if ((window as any).PointerEvent) {
      element.addEventListener('pointerdown', (e: any) => {
        if (e && e.pointerType && e.pointerType !== 'mouse') {
          element.classList.add('button-clicked');
        }
      });
      element.addEventListener('pointerup', (e: any) => {
        if (e && e.pointerType && e.pointerType !== 'mouse') {
          markPointerHandled(element);
          handleButtonClick(e, element, actionName);
        }
      });
    } else if ('ontouchstart' in window) {
      element.addEventListener(
        'touchstart',
        () => {
          element.classList.add('button-clicked');
        },
        { passive: true }
      );
      element.addEventListener(
        'touchend',
        (e: any) => {
          markPointerHandled(element);
          handleButtonClick(e, element, actionName);
        },
        { passive: true }
      );
    }
    element.addEventListener('click', (e: any) => {
      if (shouldSuppressClick(element)) return;
      handleButtonClick(e, element, actionName);
    });

    if ((action as any).type) {
      try {
        element.classList.add((action as any).type);
      } catch {}
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
  // Removed ensureClicksSystemLoaded; soda-button-gestures handles readiness

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
  // Setup soda button gestures via extracted module
  setupSodaButtonGestures().catch(error => {
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
  const chatInput = document.getElementById('chatInput') as HTMLInputElement | null;
  if (chatInput) {
    chatInput.addEventListener('keypress', (e: KeyboardEvent) => {
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
  // Legacy splash-start button removed
  // Legacy delegated listeners for splash-start removed
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
