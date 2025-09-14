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

    if (missing.length > 0) {
      console.log('⏳ Waiting for dependencies:', missing.join(', '));
      return false;
    }

    console.log('✅ All dependencies are ready');
    return true;
  }

  /**
   * Get the status of all dependencies
   */
  public getDependencyStatus(): DependencyStatus {
    return {
      UNLOCKS_SYSTEM: !!(window as any).App?.systems?.unlocks,
      DOM_READY: typeof document !== 'undefined' && document.readyState !== 'loading',
      GAME_CONFIG: !!this.getGameConfig() && Object.keys(this.getGameConfig()).length > 0,
      Decimal: typeof Decimal !== 'undefined',
      App: typeof (window as any).App !== 'undefined',
    };
  }

  /**
   * Get game configuration
   */
  public getGameConfig(): any {
    return (typeof window !== 'undefined' && (window as any).GAME_CONFIG) || {};
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
  public waitForDependencies(onGameReady: () => void): void {
    if (this.areDependenciesReady()) {
      console.log('🚀 All dependencies ready, initializing game...');
      onGameReady();
    } else {
      console.log('⏳ Dependencies not ready, retrying in 100ms...');
      setTimeout(() => this.waitForDependencies(onGameReady), 100);
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
   * Get game configuration values with fallbacks
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
      (window as any).App?.systems?.gameInit?.initSplashScreen?.();
    } catch (error) {
      console.warn('Failed to initialize splash screen:', error);
    }
  }
}

// Export singleton instance
export const bootstrapSystem = BootstrapSystem.getInstance();

// Legacy functions for backward compatibility
export function areDependenciesReady(): boolean {
  return bootstrapSystem.areDependenciesReady();
}

export function initializeGameWhenReady(onGameReady: () => void): void {
  return bootstrapSystem.initializeGameWhenReady(onGameReady);
}

export function waitForDependencies(onGameReady: () => void): void {
  return bootstrapSystem.waitForDependencies(onGameReady);
}

export function initSplashScreen(): void {
  return bootstrapSystem.initializeSplashScreen();
}
