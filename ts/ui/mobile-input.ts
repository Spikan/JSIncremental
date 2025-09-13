// Mobile Input Handling System
// Handles mobile-specific touch and input optimizations

export interface TouchValidationConfig {
  movementThreshold: number; // Pixels of movement allowed before canceling
  timeThreshold: number; // Minimum time touch must be held (ms)
  scrollThreshold: number; // Pixels of scroll movement allowed
  pressureThreshold?: number; // Minimum touch pressure (if supported)
  multiTouchThreshold: number; // Maximum number of touches allowed
}

export class MobileInputHandler {
  private static instance: MobileInputHandler;
  private isInitialized = false;
  private eventListeners: Array<{ element: Element; type: string; handler: EventListener }> = [];
  private touchValidationConfig: TouchValidationConfig = {
    movementThreshold: 15, // Allow moderate movement
    timeThreshold: 30, // Quick touches allowed
    scrollThreshold: 25, // Allow scrolling
    multiTouchThreshold: 1, // Only single touch allowed
  };

  public static getInstance(): MobileInputHandler {
    if (!MobileInputHandler.instance) {
      MobileInputHandler.instance = new MobileInputHandler();
    }
    return MobileInputHandler.instance;
  }

  /**
   * Initialize mobile input handling
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    if (!this.isMobileDevice()) {
      return;
    }

    this.setupTouchHandling();
    this.setupContextMenuPrevention();
    this.isInitialized = true;
  }

  /**
   * Check if the current device is mobile
   */
  private isMobileDevice(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  }

  /**
   * Setup touch handling optimizations
   */
  private setupTouchHandling(): void {
    const sodaButton = this.getSodaButton();
    if (!sodaButton) {
      console.warn('Soda button not found, will retry...');
      setTimeout(() => this.setupTouchHandling(), 100);
      return;
    }

    try {
      if (this.hasStyleProperty(sodaButton)) {
        (sodaButton as HTMLElement).style.touchAction = 'pan-y';
        (sodaButton.style as any).webkitTouchCallout = 'none';
        (sodaButton.style as any).webkitUserSelect = 'none';
        sodaButton.style.userSelect = 'none';
      }
      console.log('✅ Touch handling configured');
    } catch (error) {
      console.warn('Failed to set mobile touch styles:', error);
    }
  }

  /**
   * Setup context menu prevention
   */
  private setupContextMenuPrevention(): void {
    const sodaButton = this.getSodaButton();
    if (!sodaButton) {
      setTimeout(() => this.setupContextMenuPrevention(), 100);
      return;
    }

    try {
      if (this.hasEventListenerSupport(sodaButton)) {
        const contextMenuHandler = (e: Event) => {
          e.preventDefault();
        };

        sodaButton.addEventListener('contextmenu', contextMenuHandler);

        // Track event listener for cleanup
        this.eventListeners.push({
          element: sodaButton,
          type: 'contextmenu',
          handler: contextMenuHandler,
        });
      }
    } catch (error) {
      console.warn('Failed to add context menu handler:', error);
    }
  }

  /**
   * Check if a touch event should be considered valid for button activation
   * This is a helper function that can be used by the button system
   */
  public validateTouchForButton(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number,
    touchCount: number,
    scrollDelta: number = 0
  ): boolean {
    const deltaY = Math.abs(endY - startY);

    return (
      Math.abs(endX - startX) <= this.touchValidationConfig.movementThreshold &&
      deltaY <= this.touchValidationConfig.movementThreshold &&
      duration >= this.touchValidationConfig.timeThreshold &&
      touchCount <= this.touchValidationConfig.multiTouchThreshold &&
      scrollDelta <= this.touchValidationConfig.scrollThreshold
    );
  }

  /**
   * Check if a touch should be considered a scroll vs a tap
   * Returns true if it's likely a scroll, false if it's likely a tap
   */
  public isLikelyScroll(
    _startX: number,
    startY: number,
    _endX: number,
    endY: number,
    scrollDelta: number
  ): boolean {
    const deltaY = Math.abs(endY - startY);

    // If there's significant vertical movement or scrolling, it's likely a scroll
    return (
      deltaY > this.touchValidationConfig.movementThreshold ||
      scrollDelta > this.touchValidationConfig.scrollThreshold
    );
  }

  /**
   * Get recommended thresholds for different use cases
   */
  public getRecommendedThresholds(
    useCase: 'strict' | 'balanced' | 'lenient' | 'gaming' | 'accessibility'
  ): TouchValidationConfig {
    const presets = {
      strict: {
        movementThreshold: 8,
        timeThreshold: 100,
        scrollThreshold: 10,
        multiTouchThreshold: 1,
      },
      balanced: {
        movementThreshold: 15,
        timeThreshold: 30,
        scrollThreshold: 25,
        multiTouchThreshold: 1,
      },
      lenient: {
        movementThreshold: 25,
        timeThreshold: 20,
        scrollThreshold: 40,
        multiTouchThreshold: 2,
      },
      gaming: {
        movementThreshold: 30,
        timeThreshold: 15,
        scrollThreshold: 50,
        multiTouchThreshold: 1,
      },
      accessibility: {
        movementThreshold: 35,
        timeThreshold: 200,
        scrollThreshold: 60,
        multiTouchThreshold: 1,
      },
    };

    return presets[useCase] || presets.balanced;
  }

  /**
   * Update touch validation configuration
   */
  public updateTouchValidation(config: Partial<TouchValidationConfig>): void {
    this.touchValidationConfig = { ...this.touchValidationConfig, ...config };
    console.log('Touch validation config updated:', this.touchValidationConfig);
  }

  /**
   * Get current touch validation configuration
   */
  public getTouchValidationConfig(): TouchValidationConfig {
    return { ...this.touchValidationConfig };
  }

  /**
   * Get the soda button element
   */
  private getSodaButton(): Element | null {
    if (typeof window === 'undefined' || typeof DOM_CACHE === 'undefined') {
      return document.getElementById('sodaButton');
    }

    return DOM_CACHE['sodaButton'] || document.getElementById('sodaButton');
  }

  /**
   * Check if element has style property
   */
  private hasStyleProperty(element: Element): element is HTMLElement {
    return 'style' in element;
  }

  /**
   * Check if element supports event listeners
   */
  private hasEventListenerSupport(element: Element): boolean {
    return 'addEventListener' in element;
  }

  /**
   * Cleanup all event listeners
   */
  public cleanup(): void {
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventListeners.length = 0;
    this.isInitialized = false;
  }

  /**
   * Reinitialize mobile handling (useful after DOM changes)
   */
  public reinitialize(): void {
    this.cleanup();
    this.initialize();
  }

  /**
   * Check if mobile optimizations are active
   */
  public isActive(): boolean {
    return this.isInitialized && this.isMobileDevice();
  }
}

// Export singleton instance
export const mobileInputHandler = MobileInputHandler.getInstance();

// Register cleanup with subscription manager
if (typeof window !== 'undefined') {
  import('./subscription-manager').then(({ default: subscriptionManager }) => {
    subscriptionManager.register(
      'mobile-input-handler',
      () => {
        mobileInputHandler.cleanup();
      },
      'Mobile Input Handler Event Listeners'
    );
  });
}

// Legacy function for backward compatibility
export function setupMobileTouchHandling(): void {
  mobileInputHandler.initialize();
}
