// Dev Tools Manager: Handle dev tools tab visibility and functionality
import { logger } from '../services/logger';

export class DevToolsManager {
  private static instance: DevToolsManager;

  public static getInstance(): DevToolsManager {
    if (!DevToolsManager.instance) {
      DevToolsManager.instance = new DevToolsManager();
    }
    return DevToolsManager.instance;
  }

  /**
   * Initialize dev tools tab visibility based on current settings
   */
  public initializeDevToolsVisibility(): void {
    try {
      const w: any = window as any;
      const state = w.App?.state?.getState?.();
      const devToolsEnabled = state?.options?.devToolsEnabled ?? false;

      this.updateDevToolsVisibility(devToolsEnabled);
      this.updateDevToolsToggleButton(devToolsEnabled);

      logger.debug('Dev tools visibility initialized:', devToolsEnabled ? 'ON' : 'OFF');
    } catch (error) {
      logger.warn('Failed to initialize dev tools visibility:', error);
    }
  }

  /**
   * Update dev tools tab visibility
   */
  public updateDevToolsVisibility(enabled: boolean): void {
    try {
      // Show/hide the dev tools tab button
      const devTabButton = document.querySelector('.dev-tab');
      if (devTabButton) {
        if (enabled) {
          devTabButton.classList.add('visible');
          (devTabButton as HTMLElement).style.display = 'flex';
        } else {
          devTabButton.classList.remove('visible');
          (devTabButton as HTMLElement).style.display = 'none';
        }
      }

      // If dev tools are being disabled and the dev tab is currently active, switch to settings tab
      if (!enabled) {
        const devTabContent = document.getElementById('dev-tab');
        if (devTabContent && devTabContent.classList.contains('active')) {
          this.switchToSettingsTab();
        }
      }

      logger.debug('Dev tools tab visibility updated:', enabled ? 'visible' : 'hidden');
    } catch (error) {
      logger.warn('Failed to update dev tools visibility:', error);
    }
  }

  /**
   * Update the dev tools toggle button text
   */
  public updateDevToolsToggleButton(enabled: boolean): void {
    try {
      const button = document.querySelector('#devToolsToggle, .dev-toggle-btn');
      if (button) {
        button.textContent = `🔧 Dev Tools ${enabled ? 'ON' : 'OFF'}`;
      }
    } catch (error) {
      logger.warn('Failed to update dev tools toggle button:', error);
    }
  }

  /**
   * Switch to the settings tab (fallback when dev tab is disabled)
   */
  private switchToSettingsTab(): void {
    try {
      // Remove active class from all tabs
      const allTabButtons = document.querySelectorAll('.settings-tab-btn');
      const allTabContents = document.querySelectorAll('.settings-tab-content');

      allTabButtons.forEach(btn => btn.classList.remove('active'));
      allTabContents.forEach(content => content.classList.remove('active'));

      // Activate settings tab
      const settingsTabButton = document.querySelector('.settings-tab-btn[data-tab="settings"]');
      const settingsTabContent = document.getElementById('settings-tab');

      if (settingsTabButton) {
        settingsTabButton.classList.add('active');
      }

      if (settingsTabContent) {
        settingsTabContent.classList.add('active');
      }

      logger.debug('Switched to settings tab');
    } catch (error) {
      logger.warn('Failed to switch to settings tab:', error);
    }
  }

  /**
   * Toggle dev tools on/off
   */
  public toggleDevTools(): void {
    try {
      const w: any = window as any;
      const state = w.App?.state?.getState?.();

      if (state?.options) {
        const newValue = !state.options.devToolsEnabled;

        // Update the state
        w.App?.state?.setState?.({
          options: { ...state.options, devToolsEnabled: newValue },
        });

        // Save to storage
        w.App?.systems?.options?.saveOptions?.({
          ...state.options,
          devToolsEnabled: newValue,
        });

        // Update visibility and button
        this.updateDevToolsVisibility(newValue);
        this.updateDevToolsToggleButton(newValue);

        logger.info('Dev tools toggled:', newValue ? 'ON' : 'OFF');
      }
    } catch (error) {
      logger.error('Failed to toggle dev tools:', error);
    }
  }

  /**
   * Check if dev tools are currently enabled
   */
  public isDevToolsEnabled(): boolean {
    try {
      const w: any = window as any;
      const state = w.App?.state?.getState?.();
      return state?.options?.devToolsEnabled ?? false;
    } catch (error) {
      logger.warn('Failed to check dev tools status:', error);
      return false;
    }
  }

  /**
   * Initialize dev tools manager on page load
   */
  public initialize(): void {
    try {
      // Initialize visibility on load
      this.initializeDevToolsVisibility();

      // Set up periodic checks to ensure consistency
      setInterval(() => {
        const currentState = this.isDevToolsEnabled();
        this.updateDevToolsToggleButton(currentState);
      }, 5000);

      logger.info('Dev tools manager initialized');
    } catch (error) {
      logger.error('Failed to initialize dev tools manager:', error);
    }
  }
}

// Export singleton instance
export const devToolsManager = DevToolsManager.getInstance();
