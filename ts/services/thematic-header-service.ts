// Thematic Header Service: Immersive soda-themed header effects
// Provides particle systems, liquid animations, and sound-reactive effects

import { logger } from './logger';
import { performanceMonitor } from './performance';
import { BubbleParticleSystem } from './particle-systems/bubble-particle-system';
import { LiquidProgressAnimator } from './animations/liquid-progress-animator';
import { SoundReactiveEffects } from './effects/sound-reactive-effects';

export interface ThematicHeaderConfig {
  enabled: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  particleDensity: number;
  animationComplexity: number;
  effectIntensity: number;
  respectReducedMotion: boolean;
}

export interface BubbleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'currency' | 'ambient' | 'click' | 'celebration';
}

export class ThematicHeaderService {
  private static instance: ThematicHeaderService;
  private config: ThematicHeaderConfig;
  private bubbleSystem: BubbleParticleSystem | null = null;
  private liquidAnimator: LiquidProgressAnimator | null = null;
  private soundReactiveEffects: SoundReactiveEffects | null = null;
  private performanceMonitor: any;
  private isInitialized: boolean = false;
  private animationId: number | null = null;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private currentFPS: number = 60;

  constructor() {
    this.config = {
      enabled: true,
      performanceMode: 'high',
      particleDensity: 1.0,
      animationComplexity: 1.0,
      effectIntensity: 1.0,
      respectReducedMotion: true,
    };

    this.performanceMonitor = performanceMonitor;
    this.setupAccessibility();
  }

  public static getInstance(): ThematicHeaderService {
    if (!ThematicHeaderService.instance) {
      ThematicHeaderService.instance = new ThematicHeaderService();
    }
    return ThematicHeaderService.instance;
  }

  /**
   * Initialize the thematic header service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('ThematicHeaderService already initialized');
      return;
    }

    try {
      logger.info('Initializing ThematicHeaderService...');

      // Check if we should enable effects
      if (!this.shouldEnableEffects()) {
        logger.info('ThematicHeaderService disabled due to accessibility or performance settings');
        return;
      }

      // Initialize particle system
      await this.initializeParticleSystem();

      // Initialize liquid animator
      await this.initializeLiquidAnimator();

      // Initialize sound reactive effects
      await this.initializeSoundReactiveEffects();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Hook into existing systems
      this.hookIntoExistingSystems();

      this.isInitialized = true;
      logger.info('ThematicHeaderService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ThematicHeaderService:', error);
      throw error;
    }
  }

  /**
   * Check if effects should be enabled based on accessibility and performance
   */
  private shouldEnableEffects(): boolean {
    // Check reduced motion preference
    if (
      this.config.respectReducedMotion &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return false;
    }

    // Check if we're in a low-performance environment
    if (this.performanceMonitor) {
      const score = this.performanceMonitor.getPerformanceScore();
      if (score < 40) {
        return false;
      }
    }

    return this.config.enabled;
  }

  /**
   * Initialize the particle system
   */
  private async initializeParticleSystem(): Promise<void> {
    const canvas = document.getElementById('bubbleCanvas') as HTMLCanvasElement;
    if (!canvas) {
      logger.warn('Bubble canvas not found, particle system disabled');
      return;
    }

    this.bubbleSystem = new BubbleParticleSystem(canvas);
    this.bubbleSystem.setPerformanceMode(this.config.performanceMode);
    this.bubbleSystem.setDensity(this.config.particleDensity);
  }

  /**
   * Initialize the liquid animator
   */
  private async initializeLiquidAnimator(): Promise<void> {
    this.liquidAnimator = new LiquidProgressAnimator();
    this.liquidAnimator.setPerformanceMode(this.config.performanceMode);
    this.liquidAnimator.setComplexity(this.config.animationComplexity);
  }

  /**
   * Initialize sound reactive effects
   */
  private async initializeSoundReactiveEffects(): Promise<void> {
    const audioManager = (window as any).App?.systems?.audio;
    if (!audioManager) {
      logger.warn('Audio manager not found, sound reactive effects disabled');
      return;
    }

    this.soundReactiveEffects = new SoundReactiveEffects(
      audioManager,
      this.bubbleSystem,
      this.liquidAnimator
    );
    this.soundReactiveEffects.setEnabled(this.config.enabled);
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!this.performanceMonitor) return;

    // Monitor performance every 5 seconds
    setInterval(() => {
      this.checkPerformanceAndAdjust();
    }, 5000);

    // Monitor frame rate
    this.startFrameRateMonitoring();
  }

  /**
   * Start frame rate monitoring
   */
  private startFrameRateMonitoring(): void {
    const measureFrameRate = (currentTime: number) => {
      this.frameCount++;

      if (currentTime - this.lastFrameTime >= 1000) {
        this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));

        // Adjust performance mode based on FPS
        if (this.currentFPS < 30) {
          this.setPerformanceMode('low');
        } else if (this.currentFPS < 45) {
          this.setPerformanceMode('medium');
        } else if (this.currentFPS >= 55) {
          this.setPerformanceMode('high');
        }

        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }

      this.animationId = requestAnimationFrame(measureFrameRate);
    };

    this.animationId = requestAnimationFrame(measureFrameRate);
  }

  /**
   * Check performance and adjust settings accordingly
   */
  private checkPerformanceAndAdjust(): void {
    if (!this.performanceMonitor) return;

    const score = this.performanceMonitor.getPerformanceScore();
    const memoryUsage = this.performanceMonitor.getMemoryUsage();

    // Adjust based on performance score
    if (score < 60) {
      this.setPerformanceMode('low');
    } else if (score < 80) {
      this.setPerformanceMode('medium');
    } else {
      this.setPerformanceMode('high');
    }

    // Adjust based on memory usage
    if (memoryUsage) {
      const usedMB = memoryUsage.usedJSHeapSize / 1024 / 1024;
      if (usedMB > 150) {
        this.setPerformanceMode('low');
      } else if (usedMB > 100) {
        this.setPerformanceMode('medium');
      }
    }
  }

  /**
   * Setup accessibility features
   */
  private setupAccessibility(): void {
    // Listen for changes in motion preference
    if (window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      motionQuery.addEventListener('change', e => {
        this.config.respectReducedMotion = true;
        this.setEnabled(!e.matches);
        logger.info('Motion preference changed, effects:', !e.matches);
      });
    }
  }

  /**
   * Hook into existing game systems
   */
  private hookIntoExistingSystems(): void {
    // Hook into display updates
    this.hookIntoDisplayUpdates();

    // Hook into click handlers
    this.hookIntoClickHandlers();

    // Hook into purchase handlers
    this.hookIntoPurchaseHandlers();
  }

  /**
   * Hook into existing display update system
   */
  private hookIntoDisplayUpdates(): void {
    const originalUpdateDrinkProgress = (window as any).App?.ui?.updateDrinkProgress;
    if (originalUpdateDrinkProgress) {
      (window as any).App.ui.updateDrinkProgress = (progress: number, drinkRate: number) => {
        // Call original function
        originalUpdateDrinkProgress(progress, drinkRate);

        // Update thematic effects
        if (this.liquidAnimator) {
          this.liquidAnimator.updateProgress('drinkProgressBar', progress);
        }
      };
    }
  }

  /**
   * Hook into existing click handlers
   */
  private hookIntoClickHandlers(): void {
    const originalHandleSodaClick = (window as any).App?.systems?.clicks?.handleSodaClick;
    if (originalHandleSodaClick) {
      (window as any).App.systems.clicks.handleSodaClick = (multiplier: number) => {
        // Call original function
        const result = originalHandleSodaClick(multiplier);

        // Add thematic effects
        this.onSodaClick(multiplier);

        return result;
      };
    }
  }

  /**
   * Hook into existing purchase handlers
   */
  private hookIntoPurchaseHandlers(): void {
    const purchaseSystem = (window as any).App?.systems?.purchases?.execute;
    if (purchaseSystem) {
      // Wrap all purchase functions
      const purchaseFunctions = [
        'buyStraw',
        'buyCup',
        'buyWiderStraws',
        'buyBetterCups',
        'buySuction',
        'buyFasterDrinks',
      ];

      purchaseFunctions.forEach(funcName => {
        const originalFunc = purchaseSystem[funcName];
        if (originalFunc) {
          purchaseSystem[funcName] = (...args: any[]) => {
            const result = originalFunc(...args);

            // Add celebration effects on successful purchase
            if (result) {
              this.onPurchase(funcName);
            }

            return result;
          };
        }
      });
    }
  }

  /**
   * Handle soda click effects
   */
  private onSodaClick(multiplier: number): void {
    if (!this.config.enabled || !this.bubbleSystem) return;

    // Spawn currency bubbles
    this.bubbleSystem.spawnCurrencyBubble(
      window.innerWidth / 2,
      window.innerHeight / 2,
      `+${multiplier}`
    );

    // Add liquid ripple effect
    if (this.liquidAnimator) {
      this.liquidAnimator.addRippleEffect('drinkProgressBar', 50, 50);
    }
  }

  /**
   * Handle purchase effects
   */
  private onPurchase(purchaseType: string): void {
    if (!this.config.enabled || !this.bubbleSystem) return;

    // Spawn celebration bubbles
    this.bubbleSystem.spawnCelebrationBubble(
      Math.random() * window.innerWidth,
      Math.random() * 100 + 50,
      purchaseType
    );

    // Intensify liquid flow
    if (this.liquidAnimator) {
      this.liquidAnimator.intensifyFlow(0.8);
    }
  }

  /**
   * Set performance mode
   */
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode;

    // Update particle system
    if (this.bubbleSystem) {
      this.bubbleSystem.setPerformanceMode(mode);
    }

    // Update liquid animator
    if (this.liquidAnimator) {
      this.liquidAnimator.setPerformanceMode(mode);
    }

    // Update header class for CSS adjustments
    const header = document.getElementById('thematicHeader');
    if (header) {
      header.className = `thematic-header performance-${mode}`;
    }

    logger.info(`Performance mode set to: ${mode}`);
  }

  /**
   * Set enabled state
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;

    if (enabled && this.isInitialized) {
      this.start();
    } else {
      this.stop();
    }

    logger.info(`ThematicHeaderService enabled: ${enabled}`);
  }

  /**
   * Start all effects
   */
  public start(): void {
    if (!this.isInitialized) {
      logger.warn('ThematicHeaderService not initialized, cannot start');
      return;
    }

    if (this.bubbleSystem) {
      this.bubbleSystem.start();
    }

    if (this.liquidAnimator) {
      this.liquidAnimator.start();
    }

    if (this.soundReactiveEffects) {
      this.soundReactiveEffects.setEnabled(true);
    }
  }

  /**
   * Stop all effects
   */
  public stop(): void {
    if (this.bubbleSystem) {
      this.bubbleSystem.stop();
    }

    if (this.liquidAnimator) {
      this.liquidAnimator.stop();
    }

    if (this.soundReactiveEffects) {
      this.soundReactiveEffects.setEnabled(false);
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): ThematicHeaderConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ThematicHeaderConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Apply changes
    if (newConfig.performanceMode) {
      this.setPerformanceMode(newConfig.performanceMode);
    }

    if (newConfig.enabled !== undefined) {
      this.setEnabled(newConfig.enabled);
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    fps: number;
    particleCount: number;
    memoryUsage: number | null;
  } {
    const memoryUsage = this.performanceMonitor?.getMemoryUsage();

    return {
      fps: this.currentFPS,
      particleCount: this.bubbleSystem?.getParticleCount() || 0,
      memoryUsage: memoryUsage ? memoryUsage.usedJSHeapSize / 1024 / 1024 : null,
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stop();
    this.isInitialized = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    logger.info('ThematicHeaderService cleaned up');
  }
}

// Export singleton instance
export const thematicHeaderService = ThematicHeaderService.getInstance();

// Export for legacy window access
if (typeof window !== 'undefined') {
  (window as any).thematicHeaderService = thematicHeaderService;
}
