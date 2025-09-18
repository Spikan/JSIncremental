// Modern Button System - Unified button event handling and management (TypeScript)

import { mobileInputHandler } from './mobile-input';
import { domQuery } from '../services/dom-query';
import { enhancedAudioManager } from '../services/enhanced-audio-manager';
import { audioControlsManager } from './audio-controls';
import { useGameStore } from '../core/state/zustand-store';
import { hybridLevelSystem } from '../core/systems/hybrid-level-system';
import { updateLevelUpDisplay, updateLevelText } from './displays';
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
            console.log('✅ Straw purchased successfully');
          } else {
            console.log('❌ Straw purchase failed - insufficient sips');
          }
        } catch (error) {
          console.warn('Failed to purchase straw:', error);
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
            console.log('✅ Cup purchased successfully');
          } else {
            console.log('❌ Cup purchase failed - insufficient sips');
          }
        } catch (error) {
          console.warn('Failed to purchase cup:', error);
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
            console.log('✅ Wider straws purchased successfully');
          } else {
            console.log('❌ Wider straws purchase failed - insufficient sips');
          }
        } catch (error) {
          console.warn('Failed to purchase wider straws:', error);
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
            console.log('✅ Better cups purchased successfully');
          } else {
            console.log('❌ Better cups purchase failed - insufficient sips');
          }
        } catch (error) {
          console.warn('Failed to purchase better cups:', error);
        }
      },
      type: 'shop-btn',
      label: 'Buy Better Cups',
    },
    buySuction: {
      func: () => {
        console.log('🔧 buySuction button action called!');
        console.log('🔧 purchasesSystem available:', !!purchasesSystem);
        console.log('🔧 purchasesSystem.execute available:', !!(purchasesSystem as any)?.execute);
        console.log(
          '🔧 purchasesSystem.execute.buySuction available:',
          !!(purchasesSystem as any)?.execute?.buySuction
        );
        try {
          // Use the purchase system
          const success = (purchasesSystem as any).execute.buySuction();
          if (success) {
            console.log('✅ Suction purchased successfully');
          } else {
            console.log('❌ Suction purchase failed - insufficient sips');
          }
        } catch (error) {
          console.warn('Failed to purchase suction:', error);
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
            console.log('✅ Faster drinks purchased successfully');
          } else {
            console.log('❌ Faster drinks purchase failed - insufficient sips');
          }
        } catch (error) {
          console.warn('Failed to purchase faster drinks:', error);
        }
      },
      type: 'drink-speed-upgrade-btn',
      label: 'Buy Faster Drinks',
    },
    unlockLevel: {
      func: () => {
        console.log('🎮 Unlock Level button clicked!');
        // Use hybrid level system to unlock next level in sequence
        console.log('🔍 Hybrid system available:', !!hybridLevelSystem);

        if (hybridLevelSystem && typeof hybridLevelSystem.getCurrentLevel === 'function') {
          const currentLevel = hybridLevelSystem.getCurrentLevel();
          console.log('📍 Current level:', currentLevel);

          if (currentLevel) {
            const allLevels = hybridLevelSystem.getAllLevels();
            const nextLevelId = currentLevel.id + 1;
            const nextLevel = allLevels.find((level: any) => level.id === nextLevelId);
            console.log('🎯 Next level:', nextLevel);

            if (nextLevel) {
              const state = useGameStore.getState();
              const sips = state.sips || new Decimal(0);
              const clicks = state.totalClicks || 0;
              // Use hybrid system's current level instead of old system's level
              const currentHybridLevel = currentLevel.id;

              console.log('📊 Current stats:', {
                sips: sips.toString(),
                clicks,
                currentHybridLevel,
              });
              console.log('📋 Next level requirements:', nextLevel.unlockRequirement);

              // Check if level is already unlocked
              const isAlreadyUnlocked = hybridLevelSystem.isLevelUnlocked(nextLevel.id);
              console.log('🔍 Level already unlocked:', isAlreadyUnlocked);

              if (isAlreadyUnlocked) {
                // Level is already unlocked, just switch to it
                console.log('🔄 Switching to already unlocked level:', nextLevel.id);
                if (hybridLevelSystem.switchToLevel(nextLevel.id)) {
                  console.log('✅ Switched to level:', nextLevel.id);

                  // Update the display
                  try {
                    updateLevelUpDisplay(state);
                    updateLevelText();
                    console.log('🔄 Display updated');
                  } catch (error) {
                    console.warn('Failed to update level display:', error);
                  }
                } else {
                  console.log('❌ Failed to switch to level');
                }
              } else {
                // Level is not unlocked, check if we can unlock it
                const canUnlock =
                  sips.gte(nextLevel.unlockRequirement.sips) &&
                  clicks >= nextLevel.unlockRequirement.clicks &&
                  currentHybridLevel >= 1; // Level requirement simplified

                console.log('✅ Can unlock:', canUnlock);

                if (canUnlock) {
                  console.log('🔓 Attempting to unlock level:', nextLevel.id);
                  // Unlock the next level
                  if (hybridLevelSystem.unlockLevel(nextLevel.id)) {
                    console.log('✅ Level unlocked successfully!');
                    // Switch to the new level
                    hybridLevelSystem.switchToLevel(nextLevel.id);
                    console.log('🔄 Switched to level:', nextLevel.id);

                    // Show notification
                    (levelSelector as any).showUnlockNotification(nextLevel.id);

                    // Update the display
                    try {
                      updateLevelUpDisplay(state);
                      updateLevelText();
                      console.log('🔄 Display updated');
                    } catch (error) {
                      console.warn('Failed to update level display:', error);
                    }
                  } else {
                    console.log('❌ Failed to unlock level');
                  }
                } else {
                  console.log('❌ Cannot unlock - requirements not met');
                }
              }
            } else {
              console.log('❌ No next level found');
            }
          } else {
            console.log('❌ No current level found');
          }
        } else {
          console.log('❌ Hybrid system not available');
        }
      },
      type: 'unlock-btn',
      label: 'Unlock Level',
    },
    toggleLevelDropdown: {
      func: () => {
        console.log('🎮 Toggle Level Dropdown clicked!');
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
      func: (featureName: string) =>
        // Modernized - unlock purchase handled by store
        console.log('Unlock purchase modernized:', featureName),
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
            console.log('✅ Game saved successfully');

            // Update last save time in store
            useGameStore.getState().actions.setLastSaveTime(Date.now());
          } else {
            console.log('❌ Save failed - no data to save');
          }
        } catch (error) {
          console.warn('Failed to save game:', error);
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
          const { useGameStore } = require('../core/state/zustand-store');
          useGameStore.getState().actions.resetState();

          console.log('✅ Save data deleted and game reset');

          // Refresh the page to apply reset
          if (confirm('Save data deleted! The page will refresh to reset the game.')) {
            window.location.reload();
          }
        } catch (error) {
          console.warn('Failed to delete save:', error);
        }
      },
      type: 'save-btn',
      label: 'Delete Save',
    },
    toggleButtonSounds: {
      func: () => {
        try {
          // Toggle click sounds in store
          const { useGameStore } = require('../core/state/zustand-store');
          const currentState = useGameStore.getState();
          const newClickSoundsEnabled = !currentState.options.clickSoundsEnabled;

          useGameStore.getState().actions.setOption('clickSoundsEnabled', newClickSoundsEnabled);

          console.log(`✅ Click sounds ${newClickSoundsEnabled ? 'enabled' : 'disabled'}`);

          // Update button text if it exists
          const button = document.querySelector('[data-action="toggleButtonSounds"]');
          if (button) {
            button.textContent = `Sound ${newClickSoundsEnabled ? 'ON' : 'OFF'}`;
          }
        } catch (error) {
          console.warn('Failed to toggle button sounds:', error);
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
          // Modernized - splash screen handled by store
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
      func: () => {
        try {
          // Use the dev system
          const success = (devSystem as any).unlockAll();
          if (success) {
            console.log('✅ All features unlocked');
          } else {
            console.log('❌ Failed to unlock all features');
          }
        } catch (error) {
          console.warn('Failed to unlock all features:', error);
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
            console.log('✅ Shop unlocked');
          } else {
            console.log('❌ Failed to unlock shop');
          }
        } catch (error) {
          console.warn('Failed to unlock shop:', error);
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
            console.log('✅ Upgrades unlocked');
          } else {
            console.log('❌ Failed to unlock upgrades');
          }
        } catch (error) {
          console.warn('Failed to unlock upgrades:', error);
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
            console.log('✅ Unlocks reset');
          } else {
            console.log('❌ Failed to reset unlocks');
          }
        } catch (error) {
          console.warn('Failed to reset unlocks:', error);
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
            console.log(`✅ Added ${milliseconds}ms to game time`);
          } else {
            console.log('❌ Failed to add time');
          }
        } catch (error) {
          console.warn('Failed to add time:', error);
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
          console.warn('Failed to add sips:', error);
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
        // Modernized - dev export state handled by store
        console.log('Dev export state - modernized');
      },
      type: 'dev-btn',
      label: 'Export State',
    },
    devPerformanceTest: {
      func: () => {
        // Modernized - dev performance test handled by store
        console.log('Dev performance test - modernized');
      },
      type: 'dev-btn',
      label: 'Performance Test',
    },

    devExportSave: {
      func: () => {
        // Modernized - dev export save handled by store
        console.log('Dev export save - modernized');
      },
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
      func: () => {
        // Modernized - dev import dialog handled by store
        console.log('Dev import dialog - modernized');
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
          const w: any = window as any;
          const fakeLastSaveTime = Date.now() - millisecondsAway;

          // Update the save time
          w.lastSaveTime = fakeLastSaveTime;
          w.App?.state?.setState?.({ lastSaveTime: fakeLastSaveTime });

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
          console.error('Failed to test offline progression:', error);
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
                const sodaDrinkerHeaderService = (window as any).sodaDrinkerHeaderService;
                if (
                  sodaDrinkerHeaderService &&
                  typeof sodaDrinkerHeaderService.setupLevelDropdown === 'function'
                ) {
                  sodaDrinkerHeaderService.setupLevelDropdown();
                  console.log('✅ Level selector initialized in settings');
                } else {
                  console.warn('❌ Soda Drinker Header Service not available for level selector');
                }
              } catch (error) {
                console.warn('Failed to initialize level selector in settings:', error);
              }
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
    // Environment selector removed - replaced by level selector
    openLevelSelector: {
      func: () => {
        try {
          // Use the level selector
          (levelSelector as any).show();
        } catch (error) {
          console.warn('Failed to open level selector:', error);
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
          console.warn('Failed to close offline modal:', error);
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
          console.warn('Failed to transition to gameplay music:', error);
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
          console.warn('Failed to test volume balance:', error);
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
          console.warn('Failed to test music looping:', error);
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
    // Play button audio if enabled
    const { useGameStore } = require('../core/state/zustand-store');
    const state = useGameStore.getState();

    if (state.options.clickSoundsEnabled) {
      try {
        (buttonAudio as any).playButtonClickSound();
      } catch (error) {
        console.warn('Failed to load audio system:', error);
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

  // Add performance mode change handler for 3D model
  const modelPerformanceSelect = document.getElementById(
    'modelPerformanceMode'
  ) as HTMLSelectElement;
  if (modelPerformanceSelect) {
    modelPerformanceSelect.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const mode = target.value as 'low' | 'medium' | 'high';

      // Update 3D model performance mode
      const soda3DButton = (window as any).soda3DButton;
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
  // Button system setup complete
}

function setupSpecialButtonHandlers(): void {
  // First ensure clicks system is loaded
  function ensureClicksSystemLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max

      const checkClicksSystem = () => {
        attempts++;
        // Only log every 10th attempt to reduce spam
        if (attempts % 10 === 1 || attempts <= 3) {
          console.warn(`🔄 CHECKING CLICKS SYSTEM (attempt ${attempts}/${maxAttempts}):`, {
            hasClicks: true, // Modernized - clicks always available
            sodaButtonExists: domQuery.exists('#sodaButton'),
            timestamp: Date.now(),
          });
        }

        // Check if we're in a test environment and window is not available
        if (typeof window === 'undefined') {
          console.warn('⚠️ Window undefined, resolving...');
          resolve();
          return;
        }

        // Modernized - clicks system handled by store
        const hasClicksSystem = true;
        const isDomReady = domQuery.exists('#sodaButton'); // Only need soda button for soda button setup

        if (hasClicksSystem && isDomReady) {
          console.warn('✅ CLICKS SYSTEM AND DOM READY!');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.warn('❌ TIMEOUT: Clicks system or DOM not ready after 5 seconds');
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
      console.warn('⚠️ CLICKS SYSTEM NOT READY, SETTING UP BUTTON ANYWAY');
      // Continue with button setup even if clicks system isn't ready
      // The button will work once the system loads
    }
    const sodaDomCacheBtn = domQuery.getById('sodaButton');
    const sodaButton = sodaDomCacheBtn || document.getElementById('sodaButton');

    // Only log if button not found
    if (!sodaButton) {
      console.warn('❌ SODA BUTTON NOT FOUND!');
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
              console.warn('Failed to remove visual feedback:', error);
            }
            try {
              // Call handleSodaClick
              const handleSodaClick = (clicksSystem as any).handleSodaClickFactory();
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
              console.warn('Failed to remove visual feedback:', error);
            }
            try {
              // Call handleSodaClick
              const handleSodaClick = (clicksSystem as any).handleSodaClickFactory();
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
          console.log('🔧 Soda button clicked!');
          try {
            const handleSodaClick = (clicksSystem as any).handleSodaClickFactory();
            await handleSodaClick(1.0); // Default multiplier of 1.0

            // Trigger UI update after click
            if (window.App?.ui?.updateAllDisplays) {
              window.App.ui.updateAllDisplays();
            } else {
              console.warn('🔧 updateAllDisplays not available');
            }
          } catch (error) {
            console.warn('Failed to load click system:', error);
          }
        } catch (error) {
          console.error('Soda click handler error:', error);
        }
      });
    }
    // Soda button setup complete
  };

  // Call the async setup function
  setupSodaButton().catch(error => {
    console.warn('❌ FAILED TO SETUP SODA BUTTON:', error);
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

    // Modernized - soda click handled by store
    console.log('handleSodaClick available: true (via clicks-system)');

    console.log(
      'DOM elements ready:',
      domQuery.exists('#sodaButton') && domQuery.exists('#shopTab')
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
          console.log(`[DEBUG] Looking up button action for fnName:`, fnName);
          console.log(`[DEBUG] BUTTON_CONFIG.actions[fnName]:`, meta);

          // Handle tab switch explicitly (play sound always)
          if (fnName === 'switchTab') {
            e.preventDefault();
            e.stopPropagation();
            try {
              // Modernized - audio handled by store
            } catch (error) {
              // Error handling - logging removed for production
            }
            // Modernized - tab switching handled by store
            return;
          }
          // Modernized - purchase system handled by store
          if (meta || (isPurchase && false)) {
            e.preventDefault();
            e.stopPropagation();
            try {
              let success = true;
              if (meta && typeof meta.func === 'function') {
                const ret = meta.func(...args);
                success = typeof ret === 'undefined' ? true : !!ret;
                try {
                  if (fnName === 'toggleButtonSounds') {
                    // Modernized - audio button handled by store
                  }
                } catch (error) {
                  // Error handling - logging removed for production
                }
                try {
                  // Modernized - audio handled by store
                  // TODO: Implement audio functionality through store
                  // Audio feedback will be handled by the store system
                } catch (error) {
                  // Error handling - logging removed for production
                }
              } else {
                if (fnName === 'purchaseUnlock' && args.length > 0) {
                  // Handle unlock purchase with feature name argument
                  // Modernized - unlock purchase handled by store
                  success = false;
                } else if (isPurchase) {
                  // Modernized - purchase system handled by store
                  success = false;
                }
                try {
                  // Modernized - audio system handled by store
                  // Audio feedback will be handled by the store system
                } catch (error) {
                  // Error handling - logging removed for production
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
                    console.warn('Failed to show purchase feedback:', error);
                  }
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
        console.log(`[DEBUG] Button element:`, el);
        console.log(`[DEBUG] Button classes:`, el.className);
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
            // Modernized - audio handled by store
          } catch (error) {
            // Error handling - logging removed for production
          }
          // Modernized - tab switching handled by store
          return;
        }
        // Modernized - purchase system handled by store
        if (meta || (isPurchase && false)) {
          e.preventDefault();
          e.stopPropagation();
          try {
            let success = true;
            if (meta && typeof meta.func === 'function') {
              const ret = meta.func(...args);
              success = typeof ret === 'undefined' ? true : !!ret;
              try {
                if (fnName === 'toggleButtonSounds') {
                  // Modernized - audio button handled by store
                }
              } catch (error) {
                // Error handling - logging removed for production
              }
              try {
                // Modernized - audio handled by store
                // TODO: Implement audio functionality through store
                // Audio feedback will be handled by the store system
              } catch (error) {
                // Error handling - logging removed for production
              }
            } else {
              if (fnName === 'purchaseUnlock' && args.length > 0) {
                // Handle unlock purchase with feature name argument
                // Modernized - unlock purchase handled by store
                success = false;
                // Modernized - purchase system handled by store
              } else if (isPurchase) {
                success = false;
              }
              try {
                // Modernized - audio system handled by store
                // Audio feedback will be handled by the store system
              } catch (error) {
                // Error handling - logging removed for production
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
              const cx =
                typeof e.clientX === 'number'
                  ? e.clientX
                  : el!.getBoundingClientRect().left + el!.getBoundingClientRect().width / 2;
              const cy =
                typeof e.clientY === 'number'
                  ? e.clientY
                  : el!.getBoundingClientRect().top + el!.getBoundingClientRect().height / 2;
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
      // Test if suction button exists
      const suctionButton = document.querySelector('[data-action="buySuction"]');
      console.log('🔧 Suction button found:', !!suctionButton);
      if (suctionButton) {
        console.log('🔧 Suction button element:', suctionButton);
        console.log('🔧 Suction button classes:', suctionButton.className);
      }

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

// Level Dropdown Functions
export function populateLevelDropdown(): void {
  const dropdown = document.getElementById('levelDropdown');
  if (!dropdown) return;

  const hybridSystem = (window as any).App?.systems?.hybridLevel;
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
  const hybridSystem = (window as any).App?.systems?.hybridLevel;
  if (!hybridSystem) return;

  console.log('🔄 Switching to level:', levelId);

  if (hybridSystem.switchToLevel(levelId)) {
    console.log('✅ Switched to level:', levelId);

    // Update UI
    try {
      (window as any).App?.ui?.updateLevelText?.();
      (window as any).App?.ui?.updateLevelNumber?.();
      (window as any).App?.ui?.updateAllDisplaysAnimated?.();
    } catch (error) {
      console.warn('Failed to update UI:', error);
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
