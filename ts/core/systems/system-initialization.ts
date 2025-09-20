// System Initialization Manager - Coordinates loading of all game systems
import { errorHandler } from '../error-handling/error-handler';
import { loadingScreen, LoadingScreenState } from '../../ui/loading-screen';

export interface SystemInitializer {
  name: string;
  description: string;
  initialize: () => Promise<void>;
  dependencies?: string[];
}

export class SystemInitializationManager {
  private initializers: Map<string, SystemInitializer> = new Map();
  private loadingOrder: string[] = [];
  private isInitializing = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.setupInitializers();
  }

  private setupInitializers(): void {
    // Error Handling System (must be first)
    this.addInitializer('error-handling', {
      name: 'Error Handling',
      description: 'Initializing error management system',
      initialize: async () => {
        // Error handling is already initialized when this runs
        await this.delay(100); // Simulate initialization time
      },
    });

    // Zustand Store
    this.addInitializer('store', {
      name: 'Game State',
      description: 'Setting up game state management',
      dependencies: ['error-handling'],
      initialize: async () => {
        // Store is already initialized when this runs
        await this.delay(200);
      },
    });

    // Event Bus
    this.addInitializer('event-bus', {
      name: 'Event System',
      description: 'Initializing event communication',
      dependencies: ['error-handling'],
      initialize: async () => {
        // Event bus is already initialized when this runs
        await this.delay(150);
      },
    });

    // Storage System
    this.addInitializer('storage', {
      name: 'Storage System',
      description: 'Setting up save/load functionality',
      dependencies: ['error-handling', 'store'],
      initialize: async () => {
        // Storage is already initialized when this runs
        await this.delay(300);
      },
    });

    // UI Systems
    this.addInitializer('ui', {
      name: 'User Interface',
      description: 'Loading UI components and displays',
      dependencies: ['error-handling', 'store', 'event-bus'],
      initialize: async () => {
        // UI systems are already initialized when this runs
        await this.delay(400);
      },
    });

    // Audio System
    this.addInitializer('audio', {
      name: 'Audio System',
      description: 'Initializing sound and music',
      dependencies: ['error-handling'],
      initialize: async () => {
        // Audio system is already initialized when this runs
        await this.delay(250);
      },
    });

    // Game Loop
    this.addInitializer('game-loop', {
      name: 'Game Engine',
      description: 'Starting main game loop',
      dependencies: ['error-handling', 'store', 'event-bus', 'ui'],
      initialize: async () => {
        // Game loop is already initialized when this runs
        await this.delay(200);
      },
    });

    // Save System
    this.addInitializer('save-system', {
      name: 'Save System',
      description: 'Loading save data and preferences',
      dependencies: ['error-handling', 'store', 'storage'],
      initialize: async () => {
        // Save system is already initialized when this runs
        await this.delay(350);
      },
    });

    // Performance Monitoring
    this.addInitializer('performance', {
      name: 'Performance',
      description: 'Setting up performance monitoring',
      dependencies: ['error-handling'],
      initialize: async () => {
        // Performance monitoring is already initialized when this runs
        await this.delay(100);
      },
    });
  }

  private addInitializer(id: string, initializer: SystemInitializer): void {
    this.initializers.set(id, initializer);
  }

  private calculateLoadingOrder(): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (id: string) => {
      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected: ${id}`);
      }
      if (visited.has(id)) return;

      visiting.add(id);
      const initializer = this.initializers.get(id);
      if (initializer?.dependencies) {
        for (const dep of initializer.dependencies) {
          visit(dep);
        }
      }
      visiting.delete(id);
      visited.add(id);
      order.push(id);
    };

    for (const id of this.initializers.keys()) {
      visit(id);
    }

    return order;
  }

  public async initializeAllSystems(): Promise<void> {
    if (this.isInitializing) {
      return this.initializationPromise || Promise.resolve();
    }

    this.isInitializing = true;
    this.loadingOrder = this.calculateLoadingOrder();

    try {
      // Create loading screen
      loadingScreen.create();

      // Initialize each system in order
      for (const systemId of this.loadingOrder) {
        await this.initializeSystem(systemId);
      }

      // Complete loading
      loadingScreen.complete();

      console.log('✅ All systems initialized successfully');
    } catch (error) {
      errorHandler.handleError(error, 'initializeAllSystems', { critical: true });
      throw error;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async initializeSystem(systemId: string): Promise<void> {
    try {
      const initializer = this.initializers.get(systemId);
      if (!initializer) {
        throw new Error(`Unknown system: ${systemId}`);
      }

      // Set current step
      loadingScreen.setCurrentStep(systemId);

      // Initialize with progress tracking
      await this.initializeWithProgress(initializer);

      // Mark as completed
      loadingScreen.updateStep(systemId, 100, true);

      console.log(`✅ ${initializer.name} initialized`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      loadingScreen.updateStep(systemId, 0, false, errorMessage);
      errorHandler.handleError(error, 'initializeSystem', { systemId });
      throw error;
    }
  }

  private async initializeWithProgress(initializer: SystemInitializer): Promise<void> {
    const steps = 10; // Number of progress steps
    const stepDuration = 50; // ms per step

    for (let i = 0; i < steps; i++) {
      try {
        // Update progress
        const progress = Math.round((i / steps) * 100);
        loadingScreen.updateStep(initializer.name.toLowerCase().replace(/\s+/g, '-'), progress);

        // Wait for step duration
        await this.delay(stepDuration);
      } catch (error) {
        errorHandler.handleError(error, 'initializeWithProgress', {
          system: initializer.name,
          step: i,
        });
      }
    }

    // Final initialization call
    await initializer.initialize();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getLoadingState(): LoadingScreenState {
    return loadingScreen.getState();
  }

  public isSystemInitialized(systemId: string): boolean {
    const state = this.getLoadingState();
    const step = state.steps.find(s => s.id === systemId);
    return step?.completed || false;
  }

  public getInitializationProgress(): number {
    const state = this.getLoadingState();
    return state.overallProgress;
  }

  public addCustomInitializer(id: string, initializer: SystemInitializer): void {
    this.initializers.set(id, initializer);
    // Recalculate loading order if already initialized
    if (this.isInitializing) {
      this.loadingOrder = this.calculateLoadingOrder();
    }
  }

  public removeInitializer(id: string): void {
    this.initializers.delete(id);
    // Recalculate loading order if already initialized
    if (this.isInitializing) {
      this.loadingOrder = this.calculateLoadingOrder();
    }
  }
}

// Export singleton instance
export const systemInitializationManager = new SystemInitializationManager();
