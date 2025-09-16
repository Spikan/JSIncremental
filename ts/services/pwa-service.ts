// PWA Service: Handles Progressive Web App functionality
import { logger } from './logger';

export interface PWAStatus {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isStandalone: boolean;
}

export class PWAService {
  private static instance: PWAService;
  private deferredPrompt: any = null;
  private status: PWAStatus = {
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    isStandalone: false,
  };

  private constructor() {
    this.initialize();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private initialize(): void {
    this.setupEventListeners();
    this.checkInstallStatus();
  }

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.onStatusChange();
      logger.info('🌐 PWA: Back online');
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.onStatusChange();
      logger.warn('📴 PWA: Gone offline');
    });

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.status.canInstall = true;
      this.onStatusChange();
      logger.info('📱 PWA: Install prompt available');
    });

    // PWA installed
    window.addEventListener('appinstalled', () => {
      this.status.isInstalled = true;
      this.status.canInstall = false;
      this.deferredPrompt = null;
      this.onStatusChange();
      logger.info('✅ PWA: App installed successfully');
    });
  }

  private checkInstallStatus(): void {
    // Check if running in standalone mode (installed)
    this.status.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    this.status.isInstalled = this.status.isStandalone;
    
    // Also check for other indicators of PWA installation
    if (!this.status.isStandalone) {
      // Check if running in fullscreen mode (another indicator of PWA)
      this.status.isStandalone = window.matchMedia('(display-mode: fullscreen)').matches;
      this.status.isInstalled = this.status.isStandalone;
    }
    
    // Check if the app was launched from home screen (iOS)
    if (!this.status.isStandalone && (window.navigator as any).standalone === true) {
      this.status.isStandalone = true;
      this.status.isInstalled = true;
    }
  }

  private onStatusChange(): void {
    // Update UI indicators
    this.updateOfflineIndicator();
    this.updateInstallButton();
  }

  private updateOfflineIndicator(): void {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      if (this.status.isOnline) {
        indicator.style.display = 'none';
      } else {
        indicator.style.display = 'block';
        indicator.textContent = '📴 Offline - Game continues with cached data';
      }
    }
  }

  private updateInstallButton(): void {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      if (this.status.canInstall && !this.status.isInstalled) {
        installButton.style.display = 'block';
      } else {
        installButton.style.display = 'none';
      }
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      logger.warn('PWA: Install prompt not available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        logger.info('PWA: User accepted install prompt');
        return true;
      } else {
        logger.info('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      logger.error('PWA: Error during install:', error);
      return false;
    }
  }

  public getStatus(): PWAStatus {
    return { ...this.status };
  }

  public isOffline(): boolean {
    return !this.status.isOnline;
  }

  public isInstalled(): boolean {
    return this.status.isInstalled;
  }

  public canInstall(): boolean {
    return this.status.canInstall;
  }

  /**
   * Check if the app meets PWA installation criteria
   */
  public checkInstallability(): boolean {
    // Check if service worker is registered
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    // Check if manifest is loaded
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      return false;
    }

    // Check if we have the required icons
    const hasIcons = document.querySelector('link[rel="icon"]') !== null;
    if (!hasIcons) {
      return false;
    }

    // Check if running over HTTPS (required for PWA)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      return false;
    }

    return true;
  }

  /**
   * Get detailed PWA status for debugging
   */
  public getDetailedStatus(): any {
    return {
      ...this.status,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasManifest: !!document.querySelector('link[rel="manifest"]'),
      hasIcons: !!document.querySelector('link[rel="icon"]'),
      isHttps: location.protocol === 'https:' || location.hostname === 'localhost',
      userAgent: navigator.userAgent,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 
                  window.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' : 'browser',
    };
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance();
