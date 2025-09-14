// Mobile Input Handling System
// Handles mobile-specific touch and input optimizations

import subscriptionManager from './subscription-manager';
import { domQuery } from '../services/dom-query';

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
    this.setupMoreOptionsModal();
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
      // Touch handling configured
    } catch (error) {
      console.warn('Failed to set mobile touch styles:', error);
    }

    // Apply ultra-compact header on mobile
    this.applyUltraCompactHeader();
  }

  /**
   * Apply ultra-compact header styling on mobile devices
   */
  private applyUltraCompactHeader(): void {
    try {
      const gameHeader = document.querySelector('.game-header');
      if (gameHeader && this.isMobileDevice()) {
        // Add ultra-compact class for maximum space savings
        gameHeader.classList.add('ultra-compact');
        console.log('Applied ultra-compact header for mobile');
      }
    } catch (error) {
      console.warn('Failed to apply ultra-compact header:', error);
    }
  }

  /**
   * Setup the "More Options" modal functionality
   */
  private setupMoreOptionsModal(): void {
    const moreOptionsModal = document.getElementById('moreOptionsModal');
    const closeButton = document.querySelector('.close-more-options');
    const moreTab = document.querySelector('[data-action="showMoreOptions"]');

    if (!moreOptionsModal) {
      console.warn('More options modal not found');
      return;
    }

    // Show modal when "More" tab is clicked
    if (moreTab) {
      moreTab.addEventListener('click', event => {
        event.preventDefault();
        this.showMoreOptionsModal();
      });
    }

    // Close modal when close button is clicked
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hideMoreOptionsModal();
      });
    }

    // Close modal when backdrop is clicked
    moreOptionsModal.addEventListener('click', event => {
      if (event.target === moreOptionsModal) {
        this.hideMoreOptionsModal();
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && moreOptionsModal.style.display !== 'none') {
        this.hideMoreOptionsModal();
      }
    });

    // Setup more option buttons
    this.setupMoreOptionButtons();
  }

  /**
   * Setup more option buttons
   */
  private setupMoreOptionButtons(): void {
    const moreOptionButtons = document.querySelectorAll('.more-option-btn');

    moreOptionButtons.forEach((button: Element) => {
      const btn = button as HTMLElement;

      btn.addEventListener('click', event => {
        event.preventDefault();
        const action = btn.getAttribute('data-action');

        if (action && action.startsWith('switchTab:')) {
          const tabName = action.split(':')[1];
          if (tabName) {
            this.switchToTab(tabName);
          }
        }
      });
    });
  }

  /**
   * Show the more options modal
   */
  private showMoreOptionsModal(): void {
    const moreOptionsModal = document.getElementById('moreOptionsModal');
    if (!moreOptionsModal) return;

    moreOptionsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Focus management
    const firstButton = moreOptionsModal.querySelector('.more-option-btn') as HTMLElement;
    if (firstButton) {
      firstButton.focus();
    }

    // Add haptic feedback
    this.triggerHapticFeedback();
  }

  /**
   * Hide the more options modal
   */
  private hideMoreOptionsModal(): void {
    const moreOptionsModal = document.getElementById('moreOptionsModal');
    if (!moreOptionsModal) return;

    moreOptionsModal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling

    // Return focus to the More tab
    const moreTab = document.querySelector('[data-action="showMoreOptions"]') as HTMLElement;
    if (moreTab) {
      moreTab.focus();
    }
  }

  /**
   * Switch to a specific tab
   */
  private switchToTab(tabName: string): void {
    // Update tab content visibility
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    const selectedTab = document.getElementById(`${tabName}Tab`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }

    // Update mobile tab items
    const mobileTabItems = document.querySelectorAll('.mobile-tab-item');
    mobileTabItems.forEach(item => item.classList.remove('active'));

    // Activate the correct tab
    const targetTab = document.querySelector(`[data-action="switchTab:${tabName}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // Close more options modal
    this.hideMoreOptionsModal();

    // Add haptic feedback
    this.triggerHapticFeedback();

    console.log(`Switched to tab: ${tabName}`);
  }

  /**
   * Trigger haptic feedback if available
   */
  private triggerHapticFeedback(): void {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(50); // Short vibration
      }
    } catch (error) {
      // Haptic feedback is not critical
      console.debug('Haptic feedback not available:', error);
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
   * Simplified touch validation - if it's a touch, it's valid
   */
  public validateTouchForButton(
    _startX: number,
    _startY: number,
    _endX: number,
    _endY: number,
    _duration: number,
    _touchCount: number,
    _scrollDelta: number = 0
  ): boolean {
    // Simplified: accept all touches for better user experience
    return true;
  }

  /**
   * Simplified scroll detection - only check for significant vertical movement
   */
  public isLikelyScroll(
    _startX: number,
    startY: number,
    _endX: number,
    endY: number,
    scrollDelta: number
  ): boolean {
    const deltaY = Math.abs(endY - startY);
    // Simplified: only consider it a scroll if there's significant vertical movement
    return deltaY > 50 || scrollDelta > 30;
  }

  /**
   * Get recommended thresholds - simplified for better UX
   */
  public getRecommendedThresholds(
    _useCase: 'strict' | 'balanced' | 'lenient' | 'gaming' | 'accessibility'
  ): TouchValidationConfig {
    // Simplified: return balanced settings for all use cases
    return {
      movementThreshold: 20,
      timeThreshold: 50,
      scrollThreshold: 30,
      multiTouchThreshold: 1,
    };
  }

  /**
   * Update touch validation configuration
   */
  public updateTouchValidation(config: Partial<TouchValidationConfig>): void {
    this.touchValidationConfig = { ...this.touchValidationConfig, ...config };
    // Touch validation config updated
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
    if (typeof window === 'undefined') {
      return document.getElementById('sodaButton');
    }

    return domQuery.getById('sodaButton') || document.getElementById('sodaButton');
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
  subscriptionManager.register(
    'mobile-input-handler',
    () => {
      mobileInputHandler.cleanup();
    },
    'Mobile Input Handler Event Listeners'
  );
}

// Legacy function for backward compatibility
export function setupMobileTouchHandling(): void {
  mobileInputHandler.initialize();
}
