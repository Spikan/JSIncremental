// Enhanced Display System with Animated Number Counters
// Provides smooth transitions for number changes using Framer Motion

import { animateNumberDisplay } from './enhanced-feedback';
import { formatNumber } from './utils';
import { getDisplayData } from '../core/state/zustand-store';
import { domQuery } from '../services/dom-query';
import { hybridLevelSystem } from '../core/systems/hybrid-level-system';
import { logger } from '../services/logger';
import { safeToNumberOrDecimal } from '../core/numbers/simplified';
import { updateLevelUpDisplay } from './displays';

// Store previous values to detect changes
interface DisplayState {
  sips?: string;
  spd?: string;
  level?: string;
  totalClicks?: string;
  drinkRate?: number;
}

class EnhancedDisplayManager {
  private previousState: DisplayState = {};
  private animationEnabled = true;
  private animationDuration = 0.8;

  constructor() {
    this.detectAnimationPreferences();
  }

  private detectAnimationPreferences(): void {
    try {
      // Respect user's reduced motion preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.animationEnabled = false;
          this.animationDuration = 0.1;
          logger.info('Enhanced displays: Reduced motion mode enabled');
        }
      }

      // Check for performance mode
      if (typeof navigator !== 'undefined') {
        const connection = (navigator as any).connection;
        if (connection && connection.saveData) {
          this.animationEnabled = false;
          logger.info('Enhanced displays: Animation disabled for data saving');
        }
      }
    } catch (error) {
      logger.warn('Failed to detect animation preferences:', error);
    }
  }

  /**
   * Enhanced sips counter with smooth number transitions
   */
  public updateTopSipCounterAnimated(): void {
    try {
      const topSipValue = domQuery.getById('topSipValue');
      if (!topSipValue) return;

      const displayData = getDisplayData();
      if (!displayData?.sips) return;

      const currentSips = displayData.sips.toString();
      const previousSips = this.previousState.sips;

      // Only animate if value changed and animation is enabled
      if (this.animationEnabled && previousSips && previousSips !== currentSips) {
        const fromValue = parseFloat(previousSips) || 0;
        const toValue = parseFloat(currentSips) || 0;

        // Skip animation for very small changes
        if (Math.abs(toValue - fromValue) > 1) {
          animateNumberDisplay(topSipValue, fromValue, toValue, value => formatNumber(value));
        } else {
          topSipValue.textContent = formatNumber(currentSips);
        }
      } else {
        // First load or animation disabled - immediate update
        topSipValue.textContent = formatNumber(currentSips);
      }

      this.previousState.sips = currentSips;
    } catch (error) {
      logger.error('Failed to update animated sips counter:', error);
    }
  }

  /**
   * Enhanced SPD display with smooth transitions
   */
  public updateSipsPerDrinkAnimated(): void {
    try {
      const spdElement = domQuery.getById('topSipsPerDrink');
      if (!spdElement) return;

      const displayData = getDisplayData();
      if (!displayData?.spd) return;

      const currentSPD = displayData.spd.toString();
      const previousSPD = this.previousState.spd;

      if (this.animationEnabled && previousSPD && previousSPD !== currentSPD) {
        const fromValue = parseFloat(previousSPD) || 0;
        const toValue = parseFloat(currentSPD) || 0;

        if (Math.abs(toValue - fromValue) > 0.1) {
          animateNumberDisplay(spdElement, fromValue, toValue, value => formatNumber(value));
        } else {
          spdElement.textContent = formatNumber(currentSPD);
        }
      } else {
        spdElement.textContent = formatNumber(currentSPD);
      }

      this.previousState.spd = currentSPD;
    } catch (error) {
      logger.error('Failed to update animated SPD display:', error);
    }
  }

  /**
   * Enhanced level display with celebration on level up
   */
  public updateLevelDisplayAnimated(): void {
    try {
      const levelElement = domQuery.getById('levelNumber');
      if (!levelElement) return;

      // Use hybrid level system as single source of truth
      const hybridSystem = hybridLevelSystem;
      if (hybridSystem && typeof hybridSystem.getCurrentLevelId === 'function') {
        const currentLevel = hybridSystem.getCurrentLevelId().toString();
        const previousLevel = this.previousState.level;

        // Check for level up
        if (previousLevel && currentLevel !== previousLevel) {
          const prevLevelNum = parseInt(previousLevel) || 1;
          const currLevelNum = parseInt(currentLevel) || 1;

          if (currLevelNum > prevLevelNum) {
            // Level up detected! Show celebration
            this.celebrateLevelUp(currLevelNum);
          }

          // Animate the level change
          if (this.animationEnabled) {
            animateNumberDisplay(levelElement, prevLevelNum, currLevelNum, value =>
              Math.floor(value).toString()
            );
          } else {
            levelElement.textContent = currentLevel;
          }
        } else {
          levelElement.textContent = currentLevel;
        }

        this.previousState.level = currentLevel;
      } else {
        // Hybrid system not available - fail fast instead of fallback
        throw new Error('Hybrid level system not available - cannot update level display');
      }
    } catch (error) {
      logger.error('Failed to update animated level display:', error);
    }
  }

  /**
   * Enhanced click counter with smooth increments
   */
  public updateClickCounterAnimated(): void {
    try {
      const clickElement = domQuery.getById('totalClicks');
      if (!clickElement) return;

      const displayData = getDisplayData();
      if (!displayData?.totalClicks) return;

      const currentClicks = displayData.totalClicks.toString();
      const previousClicks = this.previousState.totalClicks;

      if (this.animationEnabled && previousClicks && previousClicks !== currentClicks) {
        const fromValue = parseFloat(previousClicks) || 0;
        const toValue = parseFloat(currentClicks) || 0;

        // Only animate if clicks increased
        if (toValue > fromValue) {
          animateNumberDisplay(clickElement, fromValue, toValue, value =>
            Math.floor(value).toLocaleString()
          );
        } else {
          clickElement.textContent = Math.floor(parseFloat(currentClicks)).toLocaleString();
        }
      } else {
        clickElement.textContent = Math.floor(parseFloat(currentClicks)).toLocaleString();
      }

      this.previousState.totalClicks = currentClicks;
    } catch (error) {
      logger.error('Failed to update animated click counter:', error);
    }
  }

  /**
   * Enhanced drink speed display with smooth rate changes
   */
  public updateDrinkSpeedAnimated(): void {
    try {
      const speedElement = domQuery.getById('currentDrinkSpeed');
      if (!speedElement) return;

      const displayData = getDisplayData();
      if (!displayData?.drinkRate) return;

      const currentRate = safeToNumberOrDecimal(displayData.drinkRate);
      const rateMs = typeof currentRate === 'number' ? currentRate : currentRate.toNumber();
      const previousRate = this.previousState.drinkRate;

      if (this.animationEnabled && previousRate && Math.abs(rateMs - previousRate) > 50) {
        // Animate the rate change
        animateNumberDisplay(
          speedElement,
          previousRate / 1000,
          rateMs / 1000,
          value => `${value.toFixed(2)}s`
        );
      } else {
        speedElement.textContent = `${(rateMs / 1000).toFixed(2)}s`;
      }

      this.previousState.drinkRate = rateMs;
    } catch (error) {
      logger.error('Failed to update animated drink speed display:', error);
    }
  }

  /**
   * Update all animated displays at once
   */
  public updateAllDisplaysAnimated(): void {
    // Use requestAnimationFrame to batch updates
    requestAnimationFrame(() => {
      this.updateTopSipCounterAnimated();
      this.updateSipsPerDrinkAnimated();
      this.updateLevelDisplayAnimated();
      this.updateClickCounterAnimated();
      this.updateDrinkSpeedAnimated();

      // Update hybrid level system display
      this.updateHybridLevelDisplay();
    });
  }

  /**
   * Update hybrid level system display
   */
  private updateHybridLevelDisplay(): void {
    try {
      const displayData = getDisplayData();
      if (displayData) {
        updateLevelUpDisplay(displayData);
      }
    } catch (error) {
      logger.warn('Failed to update hybrid level display:', error);
    }
  }

  /**
   * Celebrate level up with enhanced animation
   */
  private celebrateLevelUp(newLevel: number): void {
    try {
      // Import and trigger level up celebration
      import('./enhanced-feedback').then(({ showEnhancedLevelUpFeedback }) => {
        // Calculate bonus (your existing logic)
        const bonus = newLevel * 1000; // Adjust based on your game logic
        showEnhancedLevelUpFeedback(bonus);
      });

      logger.info(`Level up celebrated: ${newLevel}`);
    } catch (error) {
      logger.error('Failed to celebrate level up:', error);
    }
  }

  /**
   * Enable or disable animations
   */
  public setAnimationEnabled(enabled: boolean): void {
    this.animationEnabled = enabled;
    logger.info(`Enhanced displays: Animation ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set animation duration
   */
  public setAnimationDuration(duration: number): void {
    this.animationDuration = Math.max(0.1, Math.min(2.0, duration));
    logger.info(`Enhanced displays: Animation duration set to ${this.animationDuration}s`);
  }

  /**
   * Reset all stored state (useful for game resets)
   */
  public resetState(): void {
    this.previousState = {};
    logger.debug('Enhanced displays: State reset');
  }

  /**
   * Get performance stats
   */
  public getStats(): {
    animationEnabled: boolean;
    animationDuration: number;
    trackedElements: number;
  } {
    return {
      animationEnabled: this.animationEnabled,
      animationDuration: this.animationDuration,
      trackedElements: Object.keys(this.previousState).length,
    };
  }
}

// Create singleton instance
export const enhancedDisplayManager = new EnhancedDisplayManager();

// Export convenience functions
export const updateTopSipCounterAnimated = () =>
  enhancedDisplayManager.updateTopSipCounterAnimated();
export const updateSipsPerDrinkAnimated = () => enhancedDisplayManager.updateSipsPerDrinkAnimated();
export const updateLevelDisplayAnimated = () => enhancedDisplayManager.updateLevelDisplayAnimated();
export const updateClickCounterAnimated = () => enhancedDisplayManager.updateClickCounterAnimated();
export const updateDrinkSpeedAnimated = () => enhancedDisplayManager.updateDrinkSpeedAnimated();
export const updateAllDisplaysAnimated = () => enhancedDisplayManager.updateAllDisplaysAnimated();

// Export configuration functions
export const setDisplayAnimationEnabled = (enabled: boolean) =>
  enhancedDisplayManager.setAnimationEnabled(enabled);
export const setDisplayAnimationDuration = (duration: number) =>
  enhancedDisplayManager.setAnimationDuration(duration);
export const resetDisplayState = () => enhancedDisplayManager.resetState();
export const getDisplayStats = () => enhancedDisplayManager.getStats();

// Legacy window access removed - use proper imports
