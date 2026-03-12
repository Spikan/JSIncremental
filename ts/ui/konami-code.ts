/**
 * Konami Code System
 * Detects the famous ↑↑↓↓←→←→BA sequence
 */

import { useGameStore } from '../core/state/zustand-store';
import { errorHandler } from '../core/error-handling/error-handler';
import { saveOptions } from '../core/systems/options-system';
import { sidebarNavigation } from './sidebar-navigation';

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
  private listenersRegistered: boolean = false;

  constructor() {
    this.initializeWhenReady();
    // Check if secrets are already unlocked on page load
    this.checkAndUnlockGodTab();
  }

  private initializeWhenReady(): void {
    if (typeof document === 'undefined') return;

    if (document.readyState === 'loading' && typeof document.addEventListener === 'function') {
      document.addEventListener('DOMContentLoaded', () => this.initializeDetection(), {
        once: true,
      });
      return;
    }

    this.initializeDetection();
  }

  private initializeDetection(): void {
    if (this.listenersRegistered || typeof document === 'undefined') return;
    if (typeof document.addEventListener !== 'function') return;

    document.addEventListener('keydown', event => {
      this.handleKeyPress(event.code);
    });
    this.listenersRegistered = true;
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
      const state = useGameStore.getState();
      if (state?.options) {
        const newOptions = {
          ...state.options,
          secretsUnlocked: true,
          godTabEnabled: true, // Also enable god tab immediately
        };

        // Update state
        useGameStore.setState({ options: newOptions });

        // Save to storage
        // Options system access modernized - using direct import
        saveOptions?.(newOptions);

        // Show celebration message
        this.showSecretUnlockedMessage();

        // Update UI
        this.updateSecretsUI();

        // Unlock God tab in settings modal
        this.unlockGodTab();

        // Refresh navigation to show god tab
        if (typeof (sidebarNavigation as any)?.forceInitialize === 'function') {
          (sidebarNavigation as any).forceInitialize();
        }
      }
    } catch (error) {
      errorHandler.handleError(error, 'unlockSecrets');
    }
  }

  private showSecretUnlockedMessage(): void {
    if (typeof document === 'undefined' || !document.head || !document.body) return;
    if (typeof document.createElement !== 'function') return;
    if (
      typeof document.head.appendChild !== 'function' ||
      typeof document.body.appendChild !== 'function'
    ) {
      return;
    }

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
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return;

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

  private unlockGodTab(): void {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return;

    // Show the God tab in settings modal
    const godTab = document.querySelector('.god-tab') as HTMLElement;
    if (godTab) {
      godTab.classList.add('unlocked');
      godTab.style.display = 'flex';
    }

    // Update modal title to indicate secrets unlocked
    const modalTitle = document.querySelector('.settings-modal-title');
    if (modalTitle) {
      modalTitle.innerHTML = `
        <span class="settings-icon">⚙️</span>
        Settings & Statistics
        <span style="font-size: 0.8rem; color: #ff6b35; margin-left: 0.5rem;">🔓</span>
      `;
    }
  }

  public isSecretsUnlocked(): boolean {
    try {
      const state = useGameStore.getState();
      return state?.options?.secretsUnlocked ?? false;
    } catch {
      return false;
    }
  }

  public reset(): void {
    this.sequence = [];
    this.isActive = false;
  }

  public checkAndUnlockGodTab(): void {
    if (this.isSecretsUnlocked()) {
      this.unlockGodTab();
    }
  }
}

// Global instance
export const konamiCodeDetector = new KonamiCodeDetector();

// Make it accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).konamiCodeDetector = konamiCodeDetector;
}
