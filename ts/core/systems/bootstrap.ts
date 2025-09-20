// Lifecycle orchestrator: single DOMContentLoaded entrypoint

import { initOnDomReady } from './game-init';
import { initButtonSystem } from '../../ui/buttons';
import { errorHandler } from '../error-handling/error-handler';

let initialized = false;

export function initializeAppOnce(): void {
  if (initialized) return;
  initialized = true;
  try {
    initOnDomReady();
  } catch (error) {
    errorHandler.handleError(error, 'initOnDomReady');
  }
  try {
    initButtonSystem();
  } catch (error) {
    errorHandler.handleError(error, 'initButtonSystem');
  }
}

export function installDomReadyBootstrap(): void {
  if (typeof document === 'undefined') return;
  const boot = () => initializeAppOnce();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true } as any);
  } else {
    boot();
  }
}

// Bootstrap System
// Handles dependency checking and game initialization coordination

interface DependencyStatus {
  UNLOCKS_SYSTEM: boolean;
  DOM_READY: boolean;
  GAME_CONFIG: boolean;
  Decimal: boolean;
  App: boolean;
}

export class BootstrapSystem {
  private static instance: BootstrapSystem;

  public static getInstance(): BootstrapSystem {
    if (!BootstrapSystem.instance) {
      BootstrapSystem.instance = new BootstrapSystem();
    }
    return BootstrapSystem.instance;
  }

  /**
   * Check if all dependencies are ready
   */
  public areDependenciesReady(): boolean {
    const dependencies = this.getDependencyStatus();

    const missing = Object.entries(dependencies)
      .filter(([, ok]) => !ok)
      .map(([k]) => k);

    // Only block on critical dependencies, not all of them
    const criticalDependencies = ['DOM_READY', 'Decimal'];
    const criticalMissing = missing.filter(dep => criticalDependencies.includes(dep));

    if (criticalMissing.length > 0) {
      console.log('⏳ Waiting for critical dependencies:', criticalMissing.join(', '));
      return false;
    }

    if (missing.length > 0) {
      console.log(
        '⚠️ Some non-critical dependencies missing:',
        missing.join(', '),
        '- proceeding anyway'
      );
    }

    console.log('✅ Critical dependencies are ready');
    return true;
  }

  /**
   * Get the status of all dependencies
   */
  public getDependencyStatus(): DependencyStatus {
    return {
      UNLOCKS_SYSTEM: true, // Modernized - always available
      DOM_READY: typeof document !== 'undefined' && document.readyState !== 'loading',
      GAME_CONFIG: !!this.getGameConfig() && Object.keys(this.getGameConfig()).length > 0,
      Decimal: typeof Decimal !== 'undefined',
      App: true, // Modernized - always available
    };
  }

  /**
   * Get game configuration
   */
  public getGameConfig(): any {
    // GAME_CONFIG must be available - fail fast if not
    if (typeof window === 'undefined' || !(window as any).GAME_CONFIG) {
      throw new Error('GAME_CONFIG not available - configuration must be loaded before bootstrap');
    }
    return (window as any).GAME_CONFIG;
  }

  /**
   * Initialize game when ready
   */
  public initializeGameWhenReady(onGameReady: () => void): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ DOM ready, checking dependencies...');
        this.waitForDependencies(onGameReady);
      });
    } else {
      console.log('✅ DOM already ready, checking dependencies...');
      this.waitForDependencies(onGameReady);
    }
  }

  /**
   * Wait for dependencies to be ready
   */
  public waitForDependencies(onGameReady: () => void, maxRetries = 50): void {
    const retryCount = (window as any).__bootstrapRetryCount || 0;

    if (this.areDependenciesReady()) {
      console.log('🚀 All dependencies ready, initializing game...');
      onGameReady();
    } else if (retryCount < maxRetries) {
      console.log(
        `⏳ Dependencies not ready, retrying in 100ms... (${retryCount + 1}/${maxRetries})`
      );
      (window as any).__bootstrapRetryCount = retryCount + 1;
      setTimeout(() => this.waitForDependencies(onGameReady, maxRetries), 100);
    } else {
      console.warn('⚠️ Max retries reached, initializing game anyway with available dependencies');
      onGameReady();
    }
  }

  /**
   * Get missing dependencies list
   */
  public getMissingDependencies(): string[] {
    const dependencies = this.getDependencyStatus();
    return Object.entries(dependencies)
      .filter(([, ok]) => !ok)
      .map(([k]) => k);
  }

  /**
   * Check if a specific dependency is ready
   */
  public isDependencyReady(dependencyName: keyof DependencyStatus): boolean {
    const status = this.getDependencyStatus();
    return status[dependencyName];
  }

  /**
   * Wait for a specific dependency
   */
  public async waitForDependency(
    dependencyName: keyof DependencyStatus,
    timeout = 10000
  ): Promise<boolean> {
    const startTime = Date.now();

    return new Promise(resolve => {
      const checkDependency = () => {
        if (this.isDependencyReady(dependencyName)) {
          resolve(true);
          return;
        }

        if (Date.now() - startTime > timeout) {
          console.warn(`Timeout waiting for dependency: ${dependencyName}`);
          resolve(false);
          return;
        }

        setTimeout(checkDependency, 100);
      };

      checkDependency();
    });
  }

  /**
   * Get game configuration values
   */
  public getGameConfigValue<T>(path: string, defaultValue: T): T {
    const config = this.getGameConfig();
    const keys = path.split('.');
    let value: any = config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Initialize splash screen
   */
  public initializeSplashScreen(): void {
    try {
      // Modernized - splash screen handled by store
    } catch (error) {
      errorHandler.handleError(error, 'initializeSplashScreen');
    }
  }
}

// Export singleton instance
export const bootstrapSystem = BootstrapSystem.getInstance();

// Legacy wrapper functions removed - use bootstrapSystem directly

export function initSplashScreen(): void {
  return bootstrapSystem.initializeSplashScreen();
}
