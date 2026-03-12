/**
 * Visual Feedback System
 * Handles click animations, purchase feedback, and other visual effects
 */

export class VisualFeedbackSystem {
  private static instance: VisualFeedbackSystem;
  private stylesInstalled = false;

  public static getInstance(): VisualFeedbackSystem {
    if (!VisualFeedbackSystem.instance) {
      VisualFeedbackSystem.instance = new VisualFeedbackSystem();
    }
    return VisualFeedbackSystem.instance;
  }

  private ensureStylesInstalled(): void {
    if (this.stylesInstalled || typeof document === 'undefined') return;
    if (!document.head || typeof document.createElement !== 'function') return;
    if (typeof document.querySelector === 'function' && document.querySelector('#visual-feedback-styles')) {
      this.stylesInstalled = true;
      return;
    }

    const style = document.createElement('style');
    if (!style) return;

    style.id = 'visual-feedback-styles';
    style.textContent = `
      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateY(-50px);
        }
      }

      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }

      @keyframes pulse {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0.3;
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0;
        }
      }
    `;

    if (typeof document.head.appendChild === 'function') {
      document.head.appendChild(style);
      this.stylesInstalled = true;
    }
  }

  /**
   * Add click feedback animation to an element
   */
  public addClickFeedback(element: HTMLElement): void {
    if (!element) return;

    // Remove any existing click feedback
    element.classList.remove('click-feedback');

    // Force reflow to ensure the class removal is processed
    element.offsetHeight;

    // Add the animation class
    element.classList.add('click-feedback');

    // Remove the class after animation completes
    setTimeout(() => {
      element.classList.remove('click-feedback');
    }, 100);
  }

  /**
   * Add purchase success animation to an element
   */
  public addPurchaseSuccess(element: HTMLElement): void {
    if (!element) return;

    // Remove any existing purchase success animation
    element.classList.remove('purchase-success');

    // Force reflow
    element.offsetHeight;

    // Add the animation class
    element.classList.add('purchase-success');

    // Remove the class after animation completes
    setTimeout(() => {
      element.classList.remove('purchase-success');
    }, 500);
  }

  /**
   * Add level up feedback animation to an element
   */
  public addLevelUpFeedback(element: HTMLElement): void {
    if (!element) return;

    // Remove any existing level up feedback
    element.classList.remove('level-up-feedback');

    // Force reflow
    element.offsetHeight;

    // Add the animation class
    element.classList.add('level-up-feedback');

    // Remove the class after animation completes
    setTimeout(() => {
      element.classList.remove('level-up-feedback');
    }, 1000);
  }

  /**
   * Add loading state to a button
   */
  public addLoadingState(element: HTMLElement): void {
    if (!element) return;

    element.classList.add('btn-loading');
    element.setAttribute('disabled', 'true');
  }

  /**
   * Remove loading state from a button
   */
  public removeLoadingState(element: HTMLElement): void {
    if (!element) return;

    element.classList.remove('btn-loading');
    element.removeAttribute('disabled');
  }

  /**
   * Show floating text feedback
   */
  public showFloatingText(
    text: string,
    x: number,
    y: number,
    color: string = '#00d97f',
    duration: number = 2000
  ): void {
    if (typeof document === 'undefined' || !document.body) return;
    if (typeof document.createElement !== 'function') return;
    this.ensureStylesInstalled();

    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: ${color};
      font-weight: 700;
      font-size: 1.2rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      z-index: 1000;
      animation: floatUp 2s ease-out forwards;
    `;

    if (typeof document.body.appendChild !== 'function') return;
    document.body.appendChild(floatingText);

    // Remove after animation completes
    setTimeout(() => {
      if (floatingText.parentNode) {
        floatingText.parentNode.removeChild(floatingText);
      }
    }, duration);
  }

  /**
   * Add ripple effect to an element
   */
  public addRippleEffect(element: HTMLElement, event: MouseEvent): void {
    if (!element) return;
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;
    if (typeof element.appendChild !== 'function') return;
    this.ensureStylesInstalled();

    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    // Ensure the element has relative positioning
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    element.appendChild(ripple);

    // Remove after animation completes
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  /**
   * Add pulse effect to an element
   */
  public addPulseEffect(element: HTMLElement, color: string = '#00d97f'): void {
    if (!element) return;
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;
    if (typeof element.appendChild !== 'function') return;
    this.ensureStylesInstalled();

    const pulse = document.createElement('div');
    pulse.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      background: ${color};
      border-radius: inherit;
      transform: translate(-50%, -50%) scale(0);
      animation: pulse 0.6s ease-out;
      pointer-events: none;
      opacity: 0.3;
    `;

    // Ensure the element has relative positioning
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    element.appendChild(pulse);

    // Remove after animation completes
    setTimeout(() => {
      if (pulse.parentNode) {
        pulse.parentNode.removeChild(pulse);
      }
    }, 600);
  }
}

// Global instance
export const visualFeedback = VisualFeedbackSystem.getInstance();
