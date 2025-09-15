// Liquid Progress Animator: Soda-themed liquid progress bars and animations
// Provides smooth liquid filling effects with CSS custom properties and animations

import { logger } from '../logger';

export interface LiquidProgressConfig {
  performanceMode: 'high' | 'medium' | 'low';
  animationComplexity: number;
  waveSpeed: number;
  rippleIntensity: number;
  shimmerSpeed: number;
}

export interface LiquidShader {
  element: HTMLElement;
  progress: number;
  waveOffset: number;
  rippleX: number;
  rippleY: number;
  rippleIntensity: number;
  lastUpdate: number;
}

export class LiquidProgressAnimator {
  private progressElements: Map<string, HTMLElement> = new Map();
  private liquidShaders: Map<string, LiquidShader> = new Map();
  private animationId: number | null = null;
  private isActive: boolean = false;
  private config: LiquidProgressConfig;
  private lastUpdateTime: number = 0;

  constructor() {
    this.config = {
      performanceMode: 'high',
      animationComplexity: 1.0,
      waveSpeed: 1.0,
      rippleIntensity: 1.0,
      shimmerSpeed: 1.0,
    };

    this.setupLiquidShaders();
  }

  /**
   * Setup CSS custom properties and keyframes for liquid effects
   */
  private setupLiquidShaders(): void {
    // Check if styles already exist
    if (document.getElementById('liquid-progress-styles')) return;

    const style = document.createElement('style');
    style.id = 'liquid-progress-styles';
    style.textContent = `
      /* Liquid Progress Bar Base Styles */
      .liquid-progress-bar {
        --liquid-progress: 0%;
        --liquid-wave-offset: 0px;
        --liquid-ripple-intensity: 0;
        --liquid-ripple-x: 50%;
        --liquid-ripple-y: 50%;
        --liquid-shimmer-offset: 0px;
        position: relative;
        overflow: hidden;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid var(--liquid-primary, #00d97f);
      }

      .liquid-fill {
        height: 100%;
        background: linear-gradient(90deg, 
          var(--liquid-primary, #00d97f) 0%,
          var(--liquid-secondary, #00b366) 50%,
          var(--liquid-accent, #00ff88) 100%
        );
        width: var(--liquid-progress);
        transition: width 0.5s ease;
        position: relative;
        overflow: hidden;
      }

      /* Liquid Shimmer Effect */
      .liquid-fill::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, 
          transparent 0%,
          rgba(255, 255, 255, 0.3) 50%,
          transparent 100%
        );
        animation: liquidShimmer 2s ease-in-out infinite;
        transform: translateX(var(--liquid-shimmer-offset));
      }

      /* Liquid Ripple Effect */
      .liquid-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at var(--liquid-ripple-x) var(--liquid-ripple-y), 
          rgba(255, 255, 255, var(--liquid-ripple-intensity)) 0%,
          transparent 70%
        );
        transition: all 0.3s ease;
        pointer-events: none;
      }

      /* Liquid Wave Effect */
      .liquid-fill {
        background-image: 
          linear-gradient(90deg, 
            var(--liquid-primary, #00d97f) 0%,
            var(--liquid-secondary, #00b366) 50%,
            var(--liquid-accent, #00ff88) 100%
          ),
          radial-gradient(circle at 30% 20%, 
            rgba(255, 255, 255, 0.2) 0%,
            transparent 50%
          );
        background-size: 100% 100%, 200% 200%;
        background-position: 0% 0%, var(--liquid-wave-offset) 0%;
        animation: liquidFlow 3s ease-in-out infinite;
      }

      /* Keyframe Animations */
      @keyframes liquidShimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      @keyframes liquidFlow {
        0%, 100% { 
          background-position: 0% 0%, 0% 0%;
          filter: hue-rotate(0deg);
        }
        25% { 
          background-position: 0% 0%, 25% 0%;
          filter: hue-rotate(5deg);
        }
        50% { 
          background-position: 0% 0%, 50% 0%;
          filter: hue-rotate(10deg);
        }
        75% { 
          background-position: 0% 0%, 75% 0%;
          filter: hue-rotate(5deg);
        }
      }

      /* Performance Mode Adjustments */
      .liquid-progress-bar.performance-low {
        --liquid-wave-offset: 0px;
      }

      .liquid-progress-bar.performance-low .liquid-fill {
        animation: none;
      }

      .liquid-progress-bar.performance-low .liquid-fill::before {
        animation: none;
      }

      .liquid-progress-bar.performance-medium .liquid-fill {
        animation-duration: 4s;
      }

      .liquid-progress-bar.performance-medium .liquid-fill::before {
        animation-duration: 3s;
      }

      /* Thematic Header Specific Styles */
      .thematic-header .liquid-progress-bar {
        height: 8px;
        border-radius: 4px;
        box-shadow: 
          inset 0 1px 2px rgba(0, 0, 0, 0.3),
          0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .thematic-header .liquid-fill {
        border-radius: 3px;
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          0 1px 2px rgba(0, 0, 0, 0.2);
      }

      /* Mobile Optimizations */
      @media (max-width: 768px) {
        .thematic-header .liquid-progress-bar {
          height: 6px;
        }
        
        .liquid-progress-bar.performance-low {
          --liquid-wave-offset: 0px;
        }
      }

      /* Reduced Motion Support */
      @media (prefers-reduced-motion: reduce) {
        .liquid-fill {
          animation: none;
        }
        
        .liquid-fill::before {
          animation: none;
        }
        
        .liquid-progress-bar {
          --liquid-wave-offset: 0px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Register a progress element for liquid effects
   */
  public registerProgressElement(elementId: string, element: HTMLElement): void {
    this.progressElements.set(elementId, element);
    element.classList.add('liquid-progress-bar');

    // Create liquid shader for this element
    const shader: LiquidShader = {
      element: element,
      progress: 0,
      waveOffset: 0,
      rippleX: 50,
      rippleY: 50,
      rippleIntensity: 0,
      lastUpdate: 0,
    };

    this.liquidShaders.set(elementId, shader);

    logger.info(`Registered liquid progress element: ${elementId}`);
  }

  /**
   * Update progress for a specific element
   */
  public updateProgress(elementId: string, progress: number): void {
    const element = this.progressElements.get(elementId);
    const shader = this.liquidShaders.get(elementId);

    if (!element || !shader) {
      logger.warn(`Progress element not found: ${elementId}`);
      return;
    }

    const clampedProgress = Math.max(0, Math.min(100, progress));
    const previousProgress = shader.progress;

    // Update progress
    shader.progress = clampedProgress;
    element.style.setProperty('--liquid-progress', `${clampedProgress}%`);

    // Add ripple effect for significant progress changes
    if (Math.abs(clampedProgress - previousProgress) > 10) {
      this.addRippleEffect(elementId, 50, 50, 0.6);
    }

    // Add celebration effect for reaching 100%
    if (clampedProgress >= 100 && previousProgress < 100) {
      this.addCelebrationEffect(elementId);
    }
  }

  /**
   * Add ripple effect to a progress bar
   */
  public addRippleEffect(elementId: string, x: number, y: number, intensity: number = 0.6): void {
    const element = this.progressElements.get(elementId);
    const shader = this.liquidShaders.get(elementId);

    if (!element || !shader) return;

    shader.rippleX = x;
    shader.rippleY = y;
    shader.rippleIntensity = intensity;

    element.style.setProperty('--liquid-ripple-x', `${x}%`);
    element.style.setProperty('--liquid-ripple-y', `${y}%`);
    element.style.setProperty('--liquid-ripple-intensity', intensity.toString());

    // Fade out ripple effect
    setTimeout(() => {
      element.style.setProperty('--liquid-ripple-intensity', '0');
      shader.rippleIntensity = 0;
    }, 300);
  }

  /**
   * Add celebration effect for completing progress
   */
  private addCelebrationEffect(elementId: string): void {
    const element = this.progressElements.get(elementId);
    if (!element) return;

    // Add celebration class for special effects
    element.classList.add('celebration');

    // Remove celebration class after animation
    setTimeout(() => {
      element.classList.remove('celebration');
    }, 1000);
  }

  /**
   * Intensify liquid flow animation
   */
  public intensifyFlow(intensity: number): void {
    this.config.waveSpeed = 1.0 + intensity * 0.5;
    this.config.shimmerSpeed = 1.0 + intensity * 0.3;

    // Apply intensity to all elements
    this.liquidShaders.forEach(shader => {
      shader.element.style.setProperty('--liquid-wave-speed', this.config.waveSpeed.toString());
      shader.element.style.setProperty(
        '--liquid-shimmer-speed',
        this.config.shimmerSpeed.toString()
      );
    });
  }

  /**
   * Start liquid flow animation
   */
  public start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.lastUpdateTime = Date.now();
    this.animateLiquidFlow();

    logger.info('LiquidProgressAnimator started');
  }

  /**
   * Stop liquid flow animation
   */
  public stop(): void {
    this.isActive = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    logger.info('LiquidProgressAnimator stopped');
  }

  /**
   * Main animation loop for liquid effects
   */
  private animateLiquidFlow(): void {
    if (!this.isActive) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    // Update wave offset for all elements
    this.liquidShaders.forEach(shader => {
      if (this.config.performanceMode !== 'low') {
        shader.waveOffset += deltaTime * 0.001 * this.config.waveSpeed;
        shader.element.style.setProperty('--liquid-wave-offset', `${shader.waveOffset}px`);
      }

      // Update shimmer offset
      if (this.config.performanceMode === 'high') {
        const shimmerOffset = (currentTime * 0.001 * this.config.shimmerSpeed) % 200;
        shader.element.style.setProperty('--liquid-shimmer-offset', `${shimmerOffset}px`);
      }
    });

    this.animationId = requestAnimationFrame(() => this.animateLiquidFlow());
  }

  /**
   * Set performance mode
   */
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode;

    // Update all elements with performance class
    this.progressElements.forEach(element => {
      element.className = element.className.replace(/performance-\w+/g, '');
      element.classList.add(`performance-${mode}`);
    });

    // Adjust animation complexity
    switch (mode) {
      case 'high':
        this.config.animationComplexity = 1.0;
        this.config.waveSpeed = 1.0;
        this.config.shimmerSpeed = 1.0;
        break;
      case 'medium':
        this.config.animationComplexity = 0.7;
        this.config.waveSpeed = 0.7;
        this.config.shimmerSpeed = 0.7;
        break;
      case 'low':
        this.config.animationComplexity = 0.3;
        this.config.waveSpeed = 0.3;
        this.config.shimmerSpeed = 0.3;
        break;
    }
  }

  /**
   * Set animation complexity
   */
  public setComplexity(complexity: number): void {
    this.config.animationComplexity = Math.max(0, Math.min(1, complexity));
    this.config.waveSpeed = 0.5 + this.config.animationComplexity * 0.5;
    this.config.shimmerSpeed = 0.5 + this.config.animationComplexity * 0.5;
  }

  /**
   * Get current configuration
   */
  public getConfig(): LiquidProgressConfig {
    return { ...this.config };
  }

  /**
   * Get status of all progress elements
   */
  public getStatus(): {
    active: boolean;
    elementCount: number;
    performanceMode: string;
    animationComplexity: number;
  } {
    return {
      active: this.isActive,
      elementCount: this.progressElements.size,
      performanceMode: this.config.performanceMode,
      animationComplexity: this.config.animationComplexity,
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stop();
    this.progressElements.clear();
    this.liquidShaders.clear();

    // Remove custom styles
    const style = document.getElementById('liquid-progress-styles');
    if (style) {
      style.remove();
    }
  }
}
