// Enhanced Feedback System with Framer Motion Integration
// Replaces manual animation loops with smooth, performant animations

import {
  animationService,
  ClickFeedbackConfig,
  PurchaseAnimationConfig,
} from '../services/animation-service';
import { logger } from '../services/logger';
import { domQuery } from '../services/dom-query';
import { formatNumber } from './utils';

// Enhanced click feedback that integrates with your existing system
export function showEnhancedClickFeedback(
  sipsGained: number | any, // Accept both numbers and Decimal objects
  isCritical: boolean = false,
  clickX: number | null = null,
  clickY: number | null = null
): void {
  try {
    // Use provided coordinates or find soda button position
    let finalX: number, finalY: number;

    if (clickX !== null && clickY !== null) {
      // Use exact click coordinates
      finalX = clickX;
      finalY = clickY;
    } else {
      // Find soda button and calculate position
      const sodaButton = domQuery.getById('sodaButton');
      if (!sodaButton) {
        logger.warn('Soda button not found for click feedback');
        return;
      }

      const rect = sodaButton.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Add some randomization like your original system
      const rangeX = 100;
      const rangeY = 80;
      const randomX = (Math.random() - 0.5) * rangeX;
      const randomY = (Math.random() - 0.5) * rangeY;

      finalX = centerX + randomX;
      finalY = centerY + randomY;
    }

    // Apply viewport bounds checking (maintaining your existing logic)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;
    const estimatedWidth = isCritical ? 200 : 150;
    const estimatedHeight = 40;

    finalX = Math.max(padding, Math.min(viewportWidth - estimatedWidth - padding, finalX));
    finalY = Math.max(padding, Math.min(viewportHeight - estimatedHeight - padding, finalY));

    // Create enhanced animation config
    const config: ClickFeedbackConfig = {
      startX: finalX,
      startY: finalY,
      value: formatNumber(sipsGained),
      isCritical,
      duration: isCritical ? 2500 : 2000,
      onComplete: () => {
        logger.debug(`Click feedback animation completed for ${formatNumber(sipsGained)} sips`);
      },
    };

    // Use animation service for smooth motion
    animationService.showClickFeedback(config);
  } catch (error) {
    logger.error('Failed to show enhanced click feedback:', error);
    // Fallback to original system if needed
    fallbackToOriginalFeedback(sipsGained, isCritical, clickX, clickY);
  }
}

// Enhanced purchase feedback with button animations
export function showEnhancedPurchaseFeedback(
  itemName: string,
  _cost: number,
  clickX: number | null = null,
  clickY: number | null = null,
  success: boolean = true
): void {
  try {
    // Show floating text feedback
    let feedbackX: number, feedbackY: number;

    if (clickX !== null && clickY !== null) {
      feedbackX = clickX;
      feedbackY = clickY;
    } else {
      // Find the purchase button or use shop area
      const shopArea = domQuery.getById('shopTab') || document.querySelector('.game-sidebar');
      if (shopArea) {
        const rect = shopArea.getBoundingClientRect();
        feedbackX = rect.left + rect.width / 2 + 100; // Offset to the right
        feedbackY = rect.top + rect.height / 2;
      } else {
        feedbackX = window.innerWidth * 0.75;
        feedbackY = window.innerHeight * 0.5;
      }
    }

    // Show floating purchase feedback
    const config: ClickFeedbackConfig = {
      startX: feedbackX,
      startY: feedbackY,
      value: success ? `${itemName}` : 'Not enough sips!',
      isCritical: false,
      duration: 1500,
      color: success ? '#4CAF50' : '#f44336',
      fontSize: '1.1em',
    };

    animationService.showClickFeedback(config);

    // Also animate the purchase button if we can find it
    if (success) {
      const purchaseButton = findPurchaseButton(itemName);
      if (purchaseButton) {
        const buttonConfig: PurchaseAnimationConfig = {
          element: purchaseButton,
          type: 'success',
          duration: 0.6,
        };
        animationService.animatePurchase(buttonConfig);
      }
    }
  } catch (error) {
    logger.error('Failed to show enhanced purchase feedback:', error);
  }
}

// Enhanced level up feedback with celebration
export function showEnhancedLevelUpFeedback(bonus: number): void {
  try {
    // Find level indicator for positioning
    const levelIndicator =
      domQuery.getById('levelNumber') || document.querySelector('.level-indicator');
    let celebrationX: number, celebrationY: number;

    if (levelIndicator) {
      const rect = levelIndicator.getBoundingClientRect();
      celebrationX = rect.left + rect.width / 2;
      celebrationY = rect.top + rect.height / 2;
    } else {
      celebrationX = window.innerWidth * 0.5;
      celebrationY = window.innerHeight * 0.3;
    }

    // Show milestone celebration
    const message = `LEVEL UP!<br/>+${formatNumber(bonus)} sips bonus!`;
    animationService.celebrateMilestone(message, celebrationX, celebrationY, 'level');

    // Also animate the level indicator if found
    if (levelIndicator) {
      const config: PurchaseAnimationConfig = {
        element: levelIndicator,
        type: 'milestone',
        duration: 1.0,
        intensity: 'high',
      };
      animationService.animatePurchase(config);
    }
  } catch (error) {
    logger.error('Failed to show enhanced level up feedback:', error);
  }
}

// Enhanced milestone feedback for achievements
export function showEnhancedMilestoneFeedback(
  message: string,
  type: 'straw' | 'cup' | 'global' | 'achievement' = 'global',
  x?: number,
  y?: number
): void {
  try {
    let celebrationX: number, celebrationY: number;

    if (x !== undefined && y !== undefined) {
      celebrationX = x;
      celebrationY = y;
    } else {
      // Center screen for major milestones
      celebrationX = window.innerWidth * 0.5;
      celebrationY = window.innerHeight * 0.4;
    }

    // Map your existing types to animation service types
    const animationType = type === 'global' ? 'achievement' : type;
    animationService.celebrateMilestone(message, celebrationX, celebrationY, animationType);
  } catch (error) {
    logger.error('Failed to show enhanced milestone feedback:', error);
  }
}

// Animated number counter for smooth value transitions
export function animateNumberDisplay(
  element: HTMLElement,
  fromValue: number | string,
  toValue: number | string,
  formatFn?: (value: number) => string
): void {
  try {
    animationService.animateNumber({
      element,
      from: fromValue,
      to: toValue,
      duration: 0.8,
      formatFn: formatFn || (val => Math.floor(val).toString()),
      onComplete: () => {
        logger.debug('Number animation completed');
      },
    });
  } catch (error) {
    logger.error('Failed to animate number display:', error);
    // Fallback to immediate update
    const finalValue = typeof toValue === 'string' ? parseFloat(toValue) : toValue;
    element.textContent = formatFn?.(finalValue) || finalValue.toString();
  }
}

// Button hover and interaction animations
export function enhanceButtonInteractions(): void {
  try {
    // Find all upgrade buttons and enhance them
    const upgradeButtons = document.querySelectorAll(
      '[data-action^="buy"], [data-action^="upgrade"]'
    );

    upgradeButtons.forEach(button => {
      const element = button as HTMLElement;

      // Add hover effects
      element.addEventListener('mouseenter', () => {
        if (!(element as any).disabled) {
          animationService.animatePurchase({
            element,
            type: 'success',
            duration: 0.2,
            intensity: 'low',
          });
        }
      });

      // Add click effects
      element.addEventListener('click', () => {
        if (!(element as any).disabled) {
          animationService.animatePurchase({
            element,
            type: 'success',
            duration: 0.4,
          });
        }
      });
    });

    logger.debug('Enhanced button interactions for all upgrade buttons');
  } catch (error) {
    logger.error('Failed to enhance button interactions:', error);
  }
}

// Performance monitoring and optimization
export function getAnimationPerformanceStats(): {
  activeAnimations: number;
  performanceMode: boolean;
} {
  return {
    activeAnimations: animationService.getActiveAnimationCount(),
    performanceMode: false, // We'll add this to animation service if needed
  };
}

// Cleanup function for page unload or tab switching
export function cleanupEnhancedAnimations(): void {
  animationService.cleanup();
}

// Private helper functions

function findPurchaseButton(itemName: string): HTMLElement | null {
  // Try to find the specific purchase button
  const possibleSelectors = [
    `[data-action="buy${itemName}"]`,
    `[data-action="buy${itemName.toLowerCase()}"]`,
    `[data-action="upgrade${itemName}"]`,
    `[data-action="upgrade${itemName.toLowerCase()}"]`,
  ];

  for (const selector of possibleSelectors) {
    const button = document.querySelector(selector) as HTMLElement;
    if (button) return button;
  }

  return null;
}

function fallbackToOriginalFeedback(
  sipsGained: any,
  isCritical: boolean,
  clickX: number | null,
  clickY: number | null
): void {
  logger.warn('Using fallback to original feedback system');

  // Import and use your existing feedback system as fallback
  try {
    import('./feedback').then(({ showClickFeedback }) => {
      showClickFeedback(sipsGained, isCritical, clickX, clickY);
    });
  } catch (error) {
    logger.error('Fallback feedback system also failed:', error);
  }
}

// Export performance controls
export const animationControls = {
  stopAll: () => animationService.stopAllAnimations(),
  getActiveCount: () => animationService.getActiveAnimationCount(),
  setPerformanceMode: (enabled: boolean) => animationService.setPerformanceMode(enabled),
};
