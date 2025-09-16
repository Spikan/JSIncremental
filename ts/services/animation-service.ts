// Enhanced Animation Service with Framer Motion Integration
// Provides smooth, performant animations for idle game feedback and interactions

import { animate } from 'framer-motion';
import { logger } from './logger';
// timerManager import removed - no longer needed after fallback removal

// Animation configuration types
export interface AnimationConfig {
  duration?: number;
  ease?: string | number[];
  delay?: number;
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  onComplete?: () => void;
  onUpdate?: (value: any) => void;
}

export interface ClickFeedbackConfig extends AnimationConfig {
  isCritical?: boolean;
  startX: number;
  startY: number;
  value: string | number;
  color?: string;
  fontSize?: string;
}

export interface NumberCounterConfig extends AnimationConfig {
  from: number | string;
  to: number | string;
  element: HTMLElement;
  formatFn?: (value: number) => string;
}

export interface PurchaseAnimationConfig extends AnimationConfig {
  element: HTMLElement;
  type: 'success' | 'error' | 'milestone';
  intensity?: 'low' | 'medium' | 'high';
}

class AnimationService {
  private activeAnimations = new Map<string, () => void>();
  private animationCounter = 0;
  private isPerformanceMode = false;

  constructor() {
    this.detectPerformanceMode();
    this.setupCleanup();
  }

  /**
   * Detect if we should use performance mode (reduced animations)
   */
  private detectPerformanceMode(): void {
    try {
      // Check for low-end devices or battery saver mode
      if (typeof navigator !== 'undefined') {
        const connection = (navigator as any).connection;
        if (connection && connection.saveData) {
          this.isPerformanceMode = true;
          logger.info('Animation service: Performance mode enabled (save data)');
        }
      }

      // Check for reduced motion preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.isPerformanceMode = true;
          logger.info('Animation service: Performance mode enabled (reduced motion preference)');
        }
      }
    } catch (error) {
      logger.warn('Failed to detect performance mode:', error);
    }
  }

  /**
   * Setup cleanup for page unload
   */
  private setupCleanup(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  /**
   * Generate unique animation ID
   */
  private generateAnimationId(): string {
    return `anim_${++this.animationCounter}_${Date.now()}`;
  }

  /**
   * Enhanced click feedback with Framer Motion
   * Replaces the manual requestAnimationFrame system
   */
  public showClickFeedback(config: ClickFeedbackConfig): string {
    const animId = this.generateAnimationId();

    try {
      // Create feedback element
      const feedback = document.createElement('div');
      feedback.textContent = `+${this.formatValue(config.value)}`;
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      feedback.setAttribute(
        'aria-label',
        config.isCritical
          ? `Critical hit! Gained ${this.formatValue(config.value)} sips`
          : `Gained ${this.formatValue(config.value)} sips`
      );

      // Apply base styles
      const isMobile = this.isMobileDevice();
      const fontSize = config.fontSize || (config.isCritical ? '1.4em' : '1.2em');
      const color = config.color || (config.isCritical ? '#ff6b35' : '#4CAF50');

      feedback.style.cssText = `
        position: fixed;
        left: ${config.startX}px;
        top: ${config.startY}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: ${isMobile ? '9999' : '1000'};
        font-weight: bold;
        font-size: ${fontSize};
        color: ${color};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        white-space: nowrap;
        text-align: center;
        will-change: transform, opacity;
        ${isMobile ? 'touch-action: none; -webkit-touch-callout: none;' : ''}
      `;

      document.body.appendChild(feedback);

      // Animation configuration
      const duration = this.isPerformanceMode
        ? 1000
        : config.duration || (config.isCritical ? 2500 : 2000);
      const moveDistance = config.isCritical ? 80 : 60;

      // Critical hits get more dramatic animations
      const scaleKeyframes = config.isCritical ? [1, 1.3, 1.1, 0.9] : [1, 1.1, 0.95];

      const opacityKeyframes = config.isCritical ? [0, 1, 1, 0.8, 0] : [0, 1, 1, 0];

      // Framer Motion animation sequence
      const animationControls = animate(
        feedback,
        {
          y: [0, -moveDistance],
          scale: scaleKeyframes,
          opacity: opacityKeyframes,
          rotateZ: config.isCritical ? [0, 2, -1, 0] : [0, 1, 0], // Subtle rotation for critical
        },
        {
          duration: duration / 1000, // Framer Motion uses seconds
          ease: config.isCritical ? [0.25, 0.46, 0.45, 0.94] : 'easeOut',
          onComplete: () => {
            if (feedback.parentNode) {
              feedback.parentNode.removeChild(feedback);
            }
            this.activeAnimations.delete(animId);
            config.onComplete?.();
          },
          ...(config.onUpdate && { onUpdate: config.onUpdate }),
        }
      );

      // Store animation for cleanup
      this.activeAnimations.set(animId, () => animationControls.stop());

      logger.debug(`Started click feedback animation: ${animId}`);
      return animId;
    } catch (error) {
      logger.error('Failed to create click feedback animation:', error);
      throw error; // Fail fast instead of using fallback
    }
  }

  /**
   * Animated number counter for smooth value transitions
   * Perfect for sips counter, production values, etc.
   */
  public animateNumber(config: NumberCounterConfig): string {
    const animId = this.generateAnimationId();

    try {
      const fromValue = typeof config.from === 'string' ? parseFloat(config.from) : config.from;
      const toValue = typeof config.to === 'string' ? parseFloat(config.to) : config.to;

      // Skip animation for very small changes in performance mode
      if (this.isPerformanceMode && Math.abs(toValue - fromValue) < 10) {
        config.element.textContent = config.formatFn?.(toValue) || toValue.toString();
        config.onComplete?.();
        return animId;
      }

      const animationControls = animate(fromValue, toValue, {
        duration: config.duration || 0.8,
        ease: 'easeOut',
        onUpdate: latest => {
          const formatted = config.formatFn?.(latest) || Math.floor(latest).toString();
          config.element.textContent = formatted;
          config.onUpdate?.(latest);
        },
        onComplete: () => {
          const finalFormatted = config.formatFn?.(toValue) || toValue.toString();
          config.element.textContent = finalFormatted;
          this.activeAnimations.delete(animId);
          config.onComplete?.();
        },
      });

      this.activeAnimations.set(animId, () => animationControls.stop());
      return animId;
    } catch (error) {
      logger.error('Failed to create number animation:', error);
      // Fallback to immediate update
      const finalValue = typeof config.to === 'string' ? parseFloat(config.to) : config.to;
      config.element.textContent = config.formatFn?.(finalValue) || finalValue.toString();
      config.onComplete?.();
      return animId;
    }
  }

  /**
   * Purchase success/error animations
   * Enhances button feedback for purchases
   */
  public animatePurchase(config: PurchaseAnimationConfig): string {
    const animId = this.generateAnimationId();

    try {
      const element = config.element;
      const originalTransform = element.style.transform || '';

      // Different animations based on type
      let animationSequence: any;

      switch (config.type) {
        case 'success':
          animationSequence = {
            scale: [1, 1.05, 0.98, 1.02, 1],
            backgroundColor: ['', '#4CAF50', ''],
          };
          break;

        case 'error':
          animationSequence = {
            x: [0, -10, 10, -5, 5, 0],
            backgroundColor: ['', '#f44336', ''],
          };
          break;

        case 'milestone':
          animationSequence = {
            scale: [1, 1.1, 1.05, 1.15, 1],
            rotateZ: [0, 2, -1, 1, 0],
            backgroundColor: ['', '#ff9800', ''],
          };
          break;
      }

      const duration = this.isPerformanceMode ? 0.3 : config.duration || 0.6;

      const animationControls = animate(element, animationSequence, {
        duration,
        ease: 'easeOut',
        onComplete: () => {
          // Reset styles
          element.style.transform = originalTransform;
          element.style.backgroundColor = '';
          this.activeAnimations.delete(animId);
          config.onComplete?.();
        },
        ...(config.onUpdate && { onUpdate: config.onUpdate }),
      });

      this.activeAnimations.set(animId, () => animationControls.stop());
      return animId;
    } catch (error) {
      logger.error('Failed to create purchase animation:', error);
      config.onComplete?.();
      return animId;
    }
  }

  /**
   * Milestone celebration animation
   * Big, satisfying animations for achievements
   */
  public celebrateMilestone(
    message: string,
    x: number,
    y: number,
    type: 'straw' | 'cup' | 'level' | 'achievement' = 'achievement'
  ): string {
    const animId = this.generateAnimationId();

    try {
      const celebration = document.createElement('div');
      celebration.innerHTML = `
        <div class="milestone-content">
          <div class="milestone-icon">${this.getMilestoneIcon(type)}</div>
          <div class="milestone-text">${message}</div>
        </div>
      `;

      const colors = {
        straw: '#4CAF50',
        cup: '#2196F3',
        level: '#FF9800',
        achievement: '#9C27B0',
      };

      celebration.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 10000;
        color: ${colors[type]};
        font-weight: bold;
        text-align: center;
        font-size: 1.5em;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
        will-change: transform, opacity;
      `;

      document.body.appendChild(celebration);

      // Dramatic celebration animation
      const animationControls = animate(
        celebration,
        {
          scale: [0, 1.2, 1.1, 1.3, 1],
          opacity: [0, 1, 1, 1, 0],
          y: [0, -20, -40, -60, -80],
          rotateZ: [0, 5, -3, 2, 0],
        },
        {
          duration: this.isPerformanceMode ? 2 : 3,
          ease: [0.25, 0.46, 0.45, 0.94],
          onComplete: () => {
            if (celebration.parentNode) {
              celebration.parentNode.removeChild(celebration);
            }
            this.activeAnimations.delete(animId);
          },
        }
      );

      this.activeAnimations.set(animId, () => animationControls.stop());
      return animId;
    } catch (error) {
      logger.error('Failed to create milestone celebration:', error);
      return animId;
    }
  }

  /**
   * Stop specific animation
   */
  public stopAnimation(animationId: string): void {
    const stopFn = this.activeAnimations.get(animationId);
    if (stopFn) {
      stopFn();
      this.activeAnimations.delete(animationId);
      logger.debug(`Stopped animation: ${animationId}`);
    }
  }

  /**
   * Stop all animations (useful for performance or cleanup)
   */
  public stopAllAnimations(): void {
    for (const [, stopFn] of this.activeAnimations) {
      stopFn();
    }
    this.activeAnimations.clear();
    logger.debug('Stopped all animations');
  }

  /**
   * Get active animation count (useful for performance monitoring)
   */
  public getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }

  /**
   * Toggle performance mode
   */
  public setPerformanceMode(enabled: boolean): void {
    this.isPerformanceMode = enabled;
    logger.info(`Animation service: Performance mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Cleanup all animations and resources
   */
  public cleanup(): void {
    this.stopAllAnimations();
    logger.debug('Animation service cleaned up');
  }

  // Private helper methods

  private isMobileDevice(): boolean {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }

  private formatValue(value: string | number): string {
    if (typeof value === 'string') return value;
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return Math.floor(value).toString();
  }

  private getMilestoneIcon(type: string): string {
    const icons = {
      straw: '🥤',
      cup: '☕',
      level: '🎉',
      achievement: '🏆',
    };
    return icons[type as keyof typeof icons] || '✨';
  }

  // Fallback system removed - fail fast instead
}

// Create singleton instance
export const animationService = new AnimationService();

// Legacy window access removed - use proper imports

// Types are exported via interface declarations above
