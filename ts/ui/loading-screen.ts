// Loading Screen Component - Replaces splash screen with comprehensive loading feedback
import { errorHandler } from '../core/error-handling/error-handler';

export interface LoadingStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  error?: string;
  progress: number; // 0-100 for this step
}

export interface LoadingScreenState {
  overallProgress: number; // 0-100
  currentStep: string;
  steps: LoadingStep[];
  isComplete: boolean;
  hasErrors: boolean;
  startTime: number;
}

export class LoadingScreen {
  private container: HTMLElement | null = null;
  private state: LoadingScreenState;
  private updateCallback?: (state: LoadingScreenState) => void;

  constructor() {
    this.state = {
      overallProgress: 0,
      currentStep: '',
      steps: this.initializeSteps(),
      isComplete: false,
      hasErrors: false,
      startTime: Date.now(),
    };
  }

  private initializeSteps(): LoadingStep[] {
    return [
      {
        id: 'error-handling',
        name: 'Error Handling',
        description: 'Initializing error management system',
        completed: false,
        progress: 0,
      },
      {
        id: 'store',
        name: 'Game State',
        description: 'Setting up game state management',
        completed: false,
        progress: 0,
      },
      {
        id: 'event-bus',
        name: 'Event System',
        description: 'Initializing event communication',
        completed: false,
        progress: 0,
      },
      {
        id: 'storage',
        name: 'Storage System',
        description: 'Setting up save/load functionality',
        completed: false,
        progress: 0,
      },
      {
        id: 'ui',
        name: 'User Interface',
        description: 'Loading UI components and displays',
        completed: false,
        progress: 0,
      },
      {
        id: 'audio',
        name: 'Audio System',
        description: 'Initializing sound and music',
        completed: false,
        progress: 0,
      },
      {
        id: 'game-loop',
        name: 'Game Engine',
        description: 'Starting main game loop',
        completed: false,
        progress: 0,
      },
      {
        id: 'save-system',
        name: 'Save System',
        description: 'Loading save data and preferences',
        completed: false,
        progress: 0,
      },
      {
        id: 'performance',
        name: 'Performance',
        description: 'Setting up performance monitoring',
        completed: false,
        progress: 0,
      },
    ];
  }

  public create(): HTMLElement {
    try {
      // Remove existing splash screen if it exists
      const existingSplash = document.getElementById('splashScreen');
      if (existingSplash) {
        existingSplash.remove();
      }

      // Create loading screen container
      this.container = document.createElement('div');
      this.container.id = 'loadingScreen';
      this.container.className = 'loading-screen';
      this.container.innerHTML = this.getHTML();

      // Add to document
      document.body.appendChild(this.container);

      // Add CSS styles
      this.addStyles();

      return this.container;
    } catch (error) {
      errorHandler.handleError(error, 'createLoadingScreen', { critical: true });
      throw error;
    }
  }

  private getHTML(): string {
    return `
      <div class="loading-overlay">
        <div class="loading-content">
          <!-- Header -->
          <div class="loading-header">
            <h1 class="loading-title">SODA CLICKER PRO</h1>
            <h2 class="loading-subtitle">Loading Game Systems...</h2>
          </div>

          <!-- Progress Section -->
          <div class="loading-progress-section">
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" id="overallProgressFill"></div>
              </div>
              <div class="progress-text">
                <span id="progressPercentage">0%</span>
                <span id="progressStep">Initializing...</span>
              </div>
            </div>
          </div>

          <!-- Steps List -->
          <div class="loading-steps">
            <div class="steps-title">System Status</div>
            <div class="steps-list" id="stepsList">
              ${this.state.steps.map(step => this.getStepHTML(step)).join('')}
            </div>
          </div>

          <!-- Error Display -->
          <div class="loading-errors" id="loadingErrors" style="display: none;">
            <div class="error-title">⚠️ Initialization Issues</div>
            <div class="error-list" id="errorList"></div>
          </div>

          <!-- Loading Animation -->
          <div class="loading-animation">
            <div class="soda-bottle">
              <div class="bottle-body"></div>
              <div class="bottle-neck"></div>
              <div class="bottle-cap"></div>
            </div>
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <!-- Footer -->
          <div class="loading-footer">
            <p class="loading-version">v1.0 - Inspired by Soda Drinker Pro</p>
            <p class="loading-time" id="loadingTime">Loading...</p>
          </div>
        </div>
      </div>
    `;
  }

  private getStepHTML(step: LoadingStep): string {
    const statusIcon = step.completed ? '✅' : step.error ? '❌' : '⏳';
    const statusClass = step.completed ? 'completed' : step.error ? 'error' : 'pending';

    return `
      <div class="step-item ${statusClass}" data-step="${step.id}">
        <div class="step-icon">${statusIcon}</div>
        <div class="step-content">
          <div class="step-name">${step.name}</div>
          <div class="step-description">${step.description}</div>
          ${step.error ? `<div class="step-error">${step.error}</div>` : ''}
        </div>
        <div class="step-progress">
          <div class="step-progress-bar">
            <div class="step-progress-fill" style="width: ${step.progress}%"></div>
          </div>
          <span class="step-progress-text">${step.progress}%</span>
        </div>
      </div>
    `;
  }

  private addStyles(): void {
    if (document.getElementById('loadingScreenStyles')) return;

    const style = document.createElement('style');
    style.id = 'loadingScreenStyles';
    style.textContent = `
      .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Arial', sans-serif;
        color: #ffffff;
      }

      .loading-overlay {
        width: 100%;
        max-width: 600px;
        padding: 2rem;
        text-align: center;
      }

      .loading-header {
        margin-bottom: 2rem;
      }

      .loading-title {
        font-size: 3rem;
        font-weight: bold;
        margin: 0 0 0.5rem 0;
        background: linear-gradient(45deg, #00d4ff, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
      }

      .loading-subtitle {
        font-size: 1.2rem;
        margin: 0;
        color: #cccccc;
        font-weight: normal;
      }

      .loading-progress-section {
        margin-bottom: 2rem;
      }

      .progress-container {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 1rem;
        backdrop-filter: blur(10px);
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00d4ff, #ff6b6b);
        border-radius: 4px;
        transition: width 0.3s ease;
        width: 0%;
      }

      .progress-text {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: #cccccc;
      }

      .loading-steps {
        margin-bottom: 2rem;
        text-align: left;
      }

      .steps-title {
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 1rem;
        color: #ffffff;
        text-align: center;
      }

      .steps-list {
        max-height: 300px;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 1rem;
      }

      .step-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        transition: all 0.3s ease;
        border-left: 3px solid transparent;
      }

      .step-item.completed {
        border-left-color: #00d4ff;
        background: rgba(0, 212, 255, 0.1);
      }

      .step-item.error {
        border-left-color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
      }

      .step-item.pending {
        border-left-color: #ffa500;
      }

      .step-icon {
        font-size: 1.2rem;
        margin-right: 0.75rem;
        min-width: 1.5rem;
      }

      .step-content {
        flex: 1;
        margin-right: 0.75rem;
      }

      .step-name {
        font-weight: bold;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }

      .step-description {
        font-size: 0.8rem;
        color: #cccccc;
        margin-bottom: 0.25rem;
      }

      .step-error {
        font-size: 0.75rem;
        color: #ff6b6b;
        font-style: italic;
      }

      .step-progress {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        min-width: 60px;
      }

      .step-progress-bar {
        width: 50px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 0.25rem;
      }

      .step-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00d4ff, #ff6b6b);
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .step-progress-text {
        font-size: 0.7rem;
        color: #cccccc;
      }

      .loading-errors {
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid #ff6b6b;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 2rem;
        text-align: left;
      }

      .error-title {
        font-weight: bold;
        color: #ff6b6b;
        margin-bottom: 0.5rem;
      }

      .error-list {
        font-size: 0.9rem;
        color: #ffcccc;
      }

      .loading-animation {
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .soda-bottle {
        width: 60px;
        height: 80px;
        position: relative;
        margin-bottom: 1rem;
        animation: float 2s ease-in-out infinite;
      }

      .bottle-body {
        width: 40px;
        height: 50px;
        background: linear-gradient(45deg, #00d4ff, #0099cc);
        border-radius: 20px 20px 5px 5px;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      .bottle-neck {
        width: 15px;
        height: 20px;
        background: linear-gradient(45deg, #00d4ff, #0099cc);
        border-radius: 7px 7px 0 0;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      .bottle-cap {
        width: 20px;
        height: 8px;
        background: #ff6b6b;
        border-radius: 10px 10px 0 0;
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      .loading-dots {
        display: flex;
        gap: 0.5rem;
      }

      .loading-dots span {
        width: 8px;
        height: 8px;
        background: #00d4ff;
        border-radius: 50%;
        animation: pulse 1.5s ease-in-out infinite;
      }

      .loading-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .loading-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }

      .loading-footer {
        color: #cccccc;
        font-size: 0.9rem;
      }

      .loading-version {
        margin: 0 0 0.5rem 0;
      }

      .loading-time {
        margin: 0;
        font-size: 0.8rem;
        color: #999999;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .loading-overlay {
          padding: 1rem;
        }
        
        .loading-title {
          font-size: 2rem;
        }
        
        .steps-list {
          max-height: 200px;
        }
        
        .step-item {
          padding: 0.5rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  public updateStep(
    stepId: string,
    progress: number,
    completed: boolean = false,
    error?: string
  ): void {
    try {
      const step = this.state.steps.find(s => s.id === stepId);
      if (!step) return;

      step.progress = Math.min(100, Math.max(0, progress));
      step.completed = completed;
      if (error) {
        step.error = error;
        this.state.hasErrors = true;
      }

      this.updateOverallProgress();
      this.updateDisplay();
    } catch (error) {
      errorHandler.handleError(error, 'updateLoadingStep', { stepId, progress, completed });
    }
  }

  public setCurrentStep(stepId: string): void {
    try {
      this.state.currentStep = stepId;
      this.updateDisplay();
    } catch (error) {
      errorHandler.handleError(error, 'setCurrentLoadingStep', { stepId });
    }
  }

  public complete(): void {
    try {
      this.state.isComplete = true;
      this.state.overallProgress = 100;
      this.updateDisplay();

      // Show game content and hide loading screen
      this.showGameContent();

      // Fade out after a short delay
      setTimeout(() => {
        this.hide();
      }, 1000);
    } catch (error) {
      errorHandler.handleError(error, 'completeLoadingScreen');
    }
  }

  private showGameContent(): void {
    try {
      const gameContent = document.getElementById('gameContent');
      if (gameContent) {
        gameContent.style.display = 'block';
        gameContent.style.visibility = 'visible';
        gameContent.style.opacity = '1';
        gameContent.classList.add('active');

        // Add game-started class to body
        document.body.classList.add('game-started');

        console.log('✅ Game content shown after loading completion');
      } else {
        console.warn('⚠️ Game content element not found');
      }
    } catch (error) {
      errorHandler.handleError(error, 'showGameContent');
    }
  }

  public hide(): void {
    try {
      if (this.container) {
        this.container.style.opacity = '0';
        this.container.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
          if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
          }
        }, 500);
      }
    } catch (error) {
      errorHandler.handleError(error, 'hideLoadingScreen');
    }
  }

  private updateOverallProgress(): void {
    const totalSteps = this.state.steps.length;
    const completedSteps = this.state.steps.filter(s => s.completed).length;
    const currentStep = this.state.steps.find(s => s.id === this.state.currentStep);

    let progress = (completedSteps / totalSteps) * 100;

    if (currentStep && !currentStep.completed) {
      progress += (currentStep.progress / 100) * (1 / totalSteps) * 100;
    }

    this.state.overallProgress = Math.min(100, Math.max(0, progress));
  }

  private updateDisplay(): void {
    try {
      if (!this.container) return;

      // Update overall progress
      const progressFill = this.container.querySelector('#overallProgressFill') as HTMLElement;
      const progressPercentage = this.container.querySelector('#progressPercentage') as HTMLElement;
      const progressStep = this.container.querySelector('#progressStep') as HTMLElement;

      if (progressFill) {
        progressFill.style.width = `${this.state.overallProgress}%`;
      }

      if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(this.state.overallProgress)}%`;
      }

      if (progressStep) {
        const currentStep = this.state.steps.find(s => s.id === this.state.currentStep);
        progressStep.textContent = currentStep ? currentStep.name : 'Initializing...';
      }

      // Update steps list
      const stepsList = this.container.querySelector('#stepsList') as HTMLElement;
      if (stepsList) {
        stepsList.innerHTML = this.state.steps.map(step => this.getStepHTML(step)).join('');
      }

      // Update errors display
      const errorsContainer = this.container.querySelector('#loadingErrors') as HTMLElement;
      const errorList = this.container.querySelector('#errorList') as HTMLElement;

      if (this.state.hasErrors && errorsContainer && errorList) {
        const errorSteps = this.state.steps.filter(s => s.error);
        errorList.innerHTML = errorSteps
          .map(step => `<div class="error-item">${step.name}: ${step.error}</div>`)
          .join('');
        errorsContainer.style.display = 'block';
      }

      // Update loading time
      const loadingTime = this.container.querySelector('#loadingTime') as HTMLElement;
      if (loadingTime) {
        const elapsed = Date.now() - this.state.startTime;
        const seconds = Math.floor(elapsed / 1000);
        loadingTime.textContent = `Loading time: ${seconds}s`;
      }

      // Call update callback if provided
      if (this.updateCallback) {
        this.updateCallback(this.state);
      }
    } catch (error) {
      errorHandler.handleError(error, 'updateLoadingDisplay');
    }
  }

  public onUpdate(callback: (state: LoadingScreenState) => void): void {
    this.updateCallback = callback;
  }

  public getState(): LoadingScreenState {
    return { ...this.state };
  }
}

// Export singleton instance
export const loadingScreen = new LoadingScreen();
