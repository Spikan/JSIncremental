// Thematic Header Initialization: Setup and integration for the immersive header
// This file handles the initialization and integration of the thematic header system

import { thematicHeaderService } from '../services/thematic-header-service';
import { logger } from '../services/logger';

export class ThematicHeaderInitializer {
  private isInitialized: boolean = false;
  private initAttempts: number = 0;
  private maxInitAttempts: number = 10;

  constructor() {
    this.setupInitialization();
  }

  /**
   * Setup the initialization process
   */
  private setupInitialization(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeWithDelay();
      });
    } else {
      this.initializeWithDelay();
    }
  }

  /**
   * Initialize with a small delay to ensure all systems are loaded
   */
  private initializeWithDelay(): void {
    setTimeout(() => {
      this.attemptInitialization();
    }, 1000);
  }

  /**
   * Attempt to initialize the thematic header
   */
  private async attemptInitialization(): Promise<void> {
    if (this.isInitialized) {
      logger.info('ThematicHeaderInitializer already initialized');
      return;
    }

    this.initAttempts++;

    try {
      // Check if required elements exist
      if (!this.checkRequiredElements()) {
        if (this.initAttempts < this.maxInitAttempts) {
          logger.warn(
            `ThematicHeaderInitializer: Required elements not found, retrying in 500ms (attempt ${this.initAttempts}/${this.maxInitAttempts})`
          );
          setTimeout(() => this.attemptInitialization(), 500);
          return;
        } else {
          logger.error('ThematicHeaderInitializer: Max initialization attempts reached, giving up');
          return;
        }
      }

      // Check if App is available
      if (!this.checkAppAvailability()) {
        if (this.initAttempts < this.maxInitAttempts) {
          logger.warn(
            `ThematicHeaderInitializer: App not available, retrying in 500ms (attempt ${this.initAttempts}/${this.maxInitAttempts})`
          );
          setTimeout(() => this.attemptInitialization(), 500);
          return;
        } else {
          logger.error('ThematicHeaderInitializer: App not available after max attempts');
          return;
        }
      }

      // Initialize the thematic header service
      await thematicHeaderService.initialize();

      // Register progress elements
      this.registerProgressElements();

      // Setup event listeners
      this.setupEventListeners();

      // Start the service
      thematicHeaderService.start();

      this.isInitialized = true;
      logger.info('ThematicHeaderInitializer initialized successfully');
    } catch (error) {
      logger.error('ThematicHeaderInitializer initialization failed:', error);

      if (this.initAttempts < this.maxInitAttempts) {
        logger.warn(
          `ThematicHeaderInitializer: Retrying in 1s (attempt ${this.initAttempts}/${this.maxInitAttempts})`
        );
        setTimeout(() => this.attemptInitialization(), 1000);
      } else {
        logger.error('ThematicHeaderInitializer: Max initialization attempts reached, giving up');
      }
    }
  }

  /**
   * Check if all required elements exist
   */
  private checkRequiredElements(): boolean {
    const requiredElements = [
      'thematicHeader',
      'bubbleCanvas',
      'topSipValue',
      'currentLevelName',
      'drinkProgressBar',
    ];

    for (const elementId of requiredElements) {
      if (!document.getElementById(elementId)) {
        logger.warn(`ThematicHeaderInitializer: Required element not found: ${elementId}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Check if App is available
   */
  private checkAppAvailability(): boolean {
    // Modernized - App object handled by store
    const app = null;
    if (!app) {
      logger.warn('ThematicHeaderInitializer: App not available');
      return false;
    }

    // Check for required App systems
    const requiredSystems = ['state', 'systems'];
    for (const system of requiredSystems) {
      if (!app[system]) {
        logger.warn(`ThematicHeaderInitializer: App.${system} not available`);
        return false;
      }
    }

    return true;
  }

  /**
   * Register progress elements with the liquid animator
   */
  private registerProgressElements(): void {
    try {
      // Register drink progress bar
      const drinkProgressBar = document.getElementById('drinkProgressBar');
      if (drinkProgressBar) {
        // This will be handled by the thematic header service
        logger.info('ThematicHeaderInitializer: Drink progress bar registered');
      }

      // Register level progress bar
      const levelProgressFill = document.getElementById('levelProgressFill');
      if (levelProgressFill) {
        // This will be handled by the thematic header service
        logger.info('ThematicHeaderInitializer: Level progress bar registered');
      }
    } catch (error) {
      logger.error('ThematicHeaderInitializer: Failed to register progress elements:', error);
    }
  }

  /**
   * Setup event listeners for the thematic header
   */
  private setupEventListeners(): void {
    try {
      // Listen for performance recommendations
      window.addEventListener('thematic-performance-recommendation', (event: any) => {
        const { mode } = event.detail;
        thematicHeaderService.setPerformanceMode(mode);
        logger.info(`ThematicHeaderInitializer: Performance mode changed to ${mode}`);
      });

      // Listen for mobile optimization recommendations
      window.addEventListener('thematic-mobile-recommendation', (event: any) => {
        const { mode } = event.detail;
        thematicHeaderService.setPerformanceMode(mode);
        logger.info(`ThematicHeaderInitializer: Mobile optimization applied: ${mode}`);
      });

      // Listen for window resize to update canvas
      window.addEventListener('resize', () => {
        this.handleResize();
      });

      // Listen for visibility change to pause/resume effects
      document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange();
      });

      logger.info('ThematicHeaderInitializer: Event listeners setup complete');
    } catch (error) {
      logger.error('ThematicHeaderInitializer: Failed to setup event listeners:', error);
    }
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    try {
      // The bubble system will handle its own resize
      logger.debug('ThematicHeaderInitializer: Window resized, effects will auto-adjust');
    } catch (error) {
      logger.error('ThematicHeaderInitializer: Failed to handle resize:', error);
    }
  }

  /**
   * Handle visibility change
   */
  private handleVisibilityChange(): void {
    try {
      if (document.hidden) {
        // Pause effects when tab is not visible
        thematicHeaderService.stop();
        logger.debug('ThematicHeaderInitializer: Tab hidden, effects paused');
      } else {
        // Resume effects when tab becomes visible
        thematicHeaderService.start();
        logger.debug('ThematicHeaderInitializer: Tab visible, effects resumed');
      }
    } catch (error) {
      logger.error('ThematicHeaderInitializer: Failed to handle visibility change:', error);
    }
  }

  /**
   * Get initialization status
   */
  public getStatus(): {
    initialized: boolean;
    attempts: number;
    maxAttempts: number;
  } {
    return {
      initialized: this.isInitialized,
      attempts: this.initAttempts,
      maxAttempts: this.maxInitAttempts,
    };
  }

  /**
   * Force reinitialization
   */
  public async reinitialize(): Promise<void> {
    logger.info('ThematicHeaderInitializer: Force reinitialization requested');
    this.isInitialized = false;
    this.initAttempts = 0;
    await this.attemptInitialization();
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    try {
      thematicHeaderService.cleanup();
      this.isInitialized = false;
      logger.info('ThematicHeaderInitializer: Cleanup complete');
    } catch (error) {
      logger.error('ThematicHeaderInitializer: Cleanup failed:', error);
    }
  }
}

// Create and export singleton instance
export const thematicHeaderInitializer = new ThematicHeaderInitializer();

// Legacy window access removed - use proper imports
