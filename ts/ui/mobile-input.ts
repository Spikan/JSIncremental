// Mobile Input Handling System
// Handles mobile-specific touch and input optimizations

export class MobileInputHandler {
  private static instance: MobileInputHandler;
  private isInitialized = false;

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
      console.log('Mobile input handler already initialized');
      return;
    }

    if (!this.isMobileDevice()) {
      console.log('Not a mobile device, skipping mobile input setup');
      return;
    }

    console.log('Setting up mobile input optimizations...');
    this.setupTouchHandling();
    this.setupContextMenuPrevention();
    this.isInitialized = true;
    console.log('✅ Mobile input handler initialized');
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
        sodaButton.addEventListener('contextmenu', (e: Event) => {
          e.preventDefault();
        });
      }
      console.log('✅ Context menu prevention configured');
    } catch (error) {
      console.warn('Failed to add context menu handler:', error);
    }
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
   * Reinitialize mobile handling (useful after DOM changes)
   */
  public reinitialize(): void {
    console.log('Reinitializing mobile input handler...');
    this.isInitialized = false;
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

// Legacy function for backward compatibility
export function setupMobileTouchHandling(): void {
  mobileInputHandler.initialize();
}
