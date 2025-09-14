/**
 * Konami Code System
 * Detects the famous ↑↑↓↓←→←→BA sequence
 */

// The Konami Code sequence
const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

class KonamiCodeDetector {
  private sequence: string[] = [];
  private isActive: boolean = false;

  constructor() {
    this.initializeDetection();
  }

  private initializeDetection(): void {
    document.addEventListener('keydown', event => {
      this.handleKeyPress(event.code);
    });
  }

  private handleKeyPress(keyCode: string): void {
    // Add the key to our sequence
    this.sequence.push(keyCode);

    // Keep only the last 10 keys (length of Konami code)
    if (this.sequence.length > KONAMI_SEQUENCE.length) {
      this.sequence = this.sequence.slice(-KONAMI_SEQUENCE.length);
    }

    // Check if we have the complete sequence
    if (this.sequence.length === KONAMI_SEQUENCE.length) {
      const matches = this.sequence.every((key, index) => key === KONAMI_SEQUENCE[index]);

      if (matches && !this.isActive) {
        this.onKonamiCodeEntered();
      }
    }
  }

  private onKonamiCodeEntered(): void {
    console.log('🎮 KONAMI CODE ACTIVATED! ↑↑↓↓←→←→BA');
    this.isActive = true;

    try {
      // Unlock secrets in the game state
      const w = window as any;
      const state = w.App?.state?.getState?.();
      if (state?.options) {
        const newOptions = {
          ...state.options,
          secretsUnlocked: true,
          godTabEnabled: true, // Also enable god tab immediately
        };

        // Update state
        w.App?.state?.setState?.({ options: newOptions });

        // Save to storage
        w.App?.systems?.options?.saveOptions?.(newOptions);

        // Show celebration message
        this.showSecretUnlockedMessage();

        // Update UI
        this.updateSecretsUI();

        // Refresh navigation to show god tab
        const navManager = w.App?.ui?.navigationManager || (window as any).navigationManager;
        if (navManager?.refreshNavigation) {
          navManager.refreshNavigation();
        }
      }
    } catch (error) {
      console.warn('Failed to unlock secrets:', error);
    }
  }

  private showSecretUnlockedMessage(): void {
    // Create a fancy notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
      color: white;
      padding: 2rem;
      border-radius: 15px;
      font-size: 1.5rem;
      font-weight: bold;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: secretUnlock 3s ease-out forwards;
    `;

    notification.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">🎮</div>
      <div>SECRETS UNLOCKED!</div>
      <div style="font-size: 1rem; margin-top: 0.5rem; opacity: 0.8;">
        ↑↑↓↓←→←→BA
      </div>
      <div style="font-size: 1rem; margin-top: 0.5rem;">
        Check the Options menu!
      </div>
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes secretUnlock {
        0% { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(0.5); 
        }
        20% { 
          opacity: 1; 
          transform: translate(-50%, -50%) scale(1.1); 
        }
        100% { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(1); 
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 3000);
  }

  private updateSecretsUI(): void {
    // Update the secrets section if it exists
    const secretsSection = document.querySelector('.secrets-section');
    if (secretsSection) {
      secretsSection.classList.remove('hidden');
    }

    // Update god toggle button if it exists
    const godToggleBtn = document.querySelector('.god-toggle-btn');
    if (godToggleBtn) {
      godToggleBtn.textContent = '🙏 Talk to God ON';
    }
  }

  public isSecretsUnlocked(): boolean {
    try {
      const w = window as any;
      const state = w.App?.state?.getState?.();
      return state?.options?.secretsUnlocked ?? false;
    } catch {
      return false;
    }
  }

  public reset(): void {
    this.sequence = [];
    this.isActive = false;
  }
}

// Global instance
export const konamiCodeDetector = new KonamiCodeDetector();

// Make it accessible for debugging
(window as any).konamiCodeDetector = konamiCodeDetector;
