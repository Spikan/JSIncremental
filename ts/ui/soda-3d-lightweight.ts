// Lightweight 3D Soda Button using Model Viewer (No Three.js)
// Bundle size: ~100KB vs 1.5MB Three.js (93% reduction)

// ModelViewerElement will be available globally from the CDN script
declare global {
  interface ModelViewerElement extends HTMLElement {
    src: string;
    alt: string;
    autoRotate: boolean;
    cameraControls: boolean;
    interactionPrompt: string;
    shadowIntensity: number;
    environmentImage: string;
    skyboxImage: string;
    cameraOrbit: string;
    fieldOfView: string;
    addEventListener(
      type:
        | 'load'
        | 'error'
        | 'progress'
        | 'model-visibility'
        | 'camera-change'
        | 'mouseenter'
        | 'mouseleave'
        | 'click'
        | 'touchstart'
        | 'touchend',
      listener: (event: any) => void
    ): void;
  }
}

interface Soda3DConfig {
  containerSelector: string;
  modelPath: string;
  size: number;
  width?: number;
  height?: number;
  rotationSpeed: number;
  hoverSpeedMultiplier: number;
  clickAnimationDuration: number;
}

export class Soda3DButton {
  private modelViewer!: ModelViewerElement;
  private container: HTMLElement | null = null;
  private isLoaded = false;
  private clickAnimationDuration: number;
  private clickHandlers: (() => void)[] = [];
  private rotationAngle = 0;
  private rotationSpeed = 0.5; // degrees per frame
  private animationId: number | null = null;

  constructor(private config: Soda3DConfig) {
    this.clickAnimationDuration = config.clickAnimationDuration;

    // Initialize the 3D model
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      console.log('🔄 Starting 3D model initialization...');
      console.log('📍 Looking for container:', this.config.containerSelector);

      this.container = document.querySelector(this.config.containerSelector);
      if (!this.container) {
        console.error('❌ Container not found:', this.config.containerSelector);
        this.showFallback();
        return;
      }

      console.log('✅ Container found, waiting for model-viewer...');

      // Wait for model-viewer to be available
      await this.waitForModelViewer();

      console.log('✅ model-viewer web component is available');

      // Clear existing content (fallback image)
      this.container.innerHTML = '';

      // Set container for model-viewer - simple setup
      this.container.style.position = 'relative';
      this.container.style.width = '200px';
      this.container.style.height = '400px';
      this.container.style.overflow = 'hidden';

      // Create model-viewer element
      this.modelViewer = document.createElement('model-viewer') as ModelViewerElement;

      this.setupModelViewer();

      // Add to container
      this.container.appendChild(this.modelViewer);

      // Set up event listeners
      this.setupEventListeners();
      console.log('✅ Event listeners set up');

      // Load the model
      await this.loadModel();
      console.log('✅ Model loading initiated');
    } catch (error) {
      console.error('❌ Failed to initialize 3D model:', error);
      console.log('🔄 Falling back to CSS 3D effect...');
      this.showFallback();
    }
  }

  private async waitForModelViewer(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // 3 seconds max wait

      console.log('⏳ Waiting for model-viewer web component...');

      const checkModelViewer = () => {
        attempts++;

        // Check if the web component is defined
        if (customElements.get('model-viewer')) {
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          reject(new Error('model-viewer web component not available after timeout'));
          return;
        }

        setTimeout(checkModelViewer, 100);
      };

      checkModelViewer();
    });
  }

  private setupModelViewer() {
    // Set model-viewer attributes - basic setup
    this.modelViewer.src = this.config.modelPath;
    this.modelViewer.alt = '3D Soda Model';
    this.modelViewer.style.width = '200px';
    this.modelViewer.style.height = '400px';
    this.modelViewer.style.display = 'block';

    // Basic model-viewer setup - minimal attributes
    // this.modelViewer.setAttribute('auto-rotate', ''); // Disabled - using custom rotation
    // this.modelViewer.setAttribute('camera-controls', ''); // Disabled - users shouldn't move camera
    this.modelViewer.setAttribute('interaction-prompt', 'none');

    // Use model-viewer defaults - let it auto-fit the model
    this.modelViewer.setAttribute('bounds', 'tight');
    this.modelViewer.setAttribute('loading', 'eager');
    this.modelViewer.setAttribute('reveal', 'auto');

    // Start custom rotation
    this.startRotation();
    // Remove all custom camera settings to use defaults
  }

  private setupEventListeners() {
    // Basic event listeners
    this.modelViewer.addEventListener('load', () => {
      this.isLoaded = true;
      console.log('✅ 3D model loaded successfully');
    });

    this.modelViewer.addEventListener('error', (event: any) => {
      console.error('❌ Failed to load 3D model:', event.detail);
      this.showFallback();
    });

    // Click events
    this.modelViewer.addEventListener('click', () => {
      this.handleClick();
    });

    // Hover effects - speed up rotation on hover
    this.modelViewer.addEventListener('mouseenter', () => {
      this.setRotationSpeed(3.0); // Much faster on hover
    });

    this.modelViewer.addEventListener('mouseleave', () => {
      this.setRotationSpeed(0.5); // Normal speed when not hovering
    });
  }

  private async loadModel() {
    try {
      console.log('🔄 Starting model load process...');
      console.log('📍 Model path:', this.config.modelPath);
      console.log('🔍 Model viewer element:', this.modelViewer);

      // Test if model file exists
      const response = await fetch(this.config.modelPath);
      if (!response.ok) {
        throw new Error(`Model file not found: ${response.status}`);
      }

      console.log('🌐 Model file found, size:', response.headers.get('content-length'), 'bytes');

      // Set the model source
      this.modelViewer.src = this.config.modelPath;
      console.log('🎯 Model source set, waiting for load event...');
      console.log('🔍 Model viewer src after setting:', this.modelViewer.src);

      // Don't wait for the model to load - let the event handlers deal with it
      // The model-viewer will trigger 'load' or 'error' events
    } catch (error) {
      console.error('❌ Failed to load model file:', error);
      this.showFallback();
    }
  }

  private async handleClick() {
    if (!this.isLoaded) return;

    // Click animation
    // Scale down slightly
    this.modelViewer.style.transform = 'scale(0.95)';
    this.modelViewer.style.transition = `transform ${this.clickAnimationDuration}ms ease`;

    // Reset after animation
    setTimeout(() => {
      this.modelViewer.style.transform = 'scale(1)';
      setTimeout(() => {
        this.modelViewer.style.transition = '';
      }, this.clickAnimationDuration);
    }, this.clickAnimationDuration / 2);

    // Call the game's soda click handler
    try {
      const { handleSodaClick } = await import('../core/systems/clicks-system');
      await handleSodaClick(1);
      console.log('🍺 3D Soda clicked - game logic triggered!');
    } catch (error) {
      console.error('❌ Failed to trigger soda click in game:', error);
    }

    // Trigger additional click handlers
    this.clickHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.warn('Click handler error:', error);
      }
    });
  }

  private showFallback() {
    if (!this.container) return;

    console.error('❌ 3D model failed to load - no fallback available');

    // Clear container first
    this.container.innerHTML = '';

    // Show error message instead of CSS fallback
    const errorDiv = document.createElement('div');
    errorDiv.style.width = `${this.config.width || this.config.size}px`;
    errorDiv.style.height = `${this.config.height || this.config.size}px`;
    errorDiv.style.display = 'flex';
    errorDiv.style.alignItems = 'center';
    errorDiv.style.justifyContent = 'center';
    errorDiv.style.backgroundColor = '#f8d7da';
    errorDiv.style.color = '#721c24';
    errorDiv.style.border = '2px solid #f5c6cb';
    errorDiv.style.borderRadius = '10px';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.padding = '20px';
    errorDiv.style.fontSize = '14px';
    errorDiv.innerHTML = '3D Model<br>Failed to Load';

    // Add error message to container
    this.container.appendChild(errorDiv);
    console.log('❌ 3D model error displayed');
  }

  // Public API methods
  addClickHandler(handler: () => void) {
    this.clickHandlers.push(handler);
  }

  removeClickHandler(handler: () => void) {
    const index = this.clickHandlers.indexOf(handler);
    if (index > -1) {
      this.clickHandlers.splice(index, 1);
    }
  }

  startSpinning() {
    if (this.isLoaded && this.modelViewer) {
      this.modelViewer.setAttribute('auto-rotate', '');
    }
  }

  stopSpinning() {
    if (this.isLoaded && this.modelViewer) {
      this.modelViewer.removeAttribute('auto-rotate');
    }
  }

  // Get current state
  get isModelLoaded(): boolean {
    return this.isLoaded;
  }

  get isCurrentlySpinning(): boolean {
    return this.isLoaded && this.modelViewer && this.modelViewer.autoRotate;
  }

  private startRotation() {
    const animate = () => {
      this.rotationAngle += this.rotationSpeed;
      if (this.rotationAngle >= 360) {
        this.rotationAngle -= 360;
      }

      // Update camera orbit with our custom rotation
      this.modelViewer.setAttribute('camera-orbit', `${this.rotationAngle}deg 75deg auto`);

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  private setRotationSpeed(speed: number) {
    this.rotationSpeed = speed;
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Export default configuration
export const defaultSoda3DConfig: Soda3DConfig = {
  containerSelector: '#sodaButton',
  modelPath: '/res/Soda.glb', // Use direct path instead of imported URL
  size: 200,
  width: 200,
  height: 200,
  rotationSpeed: 1.0,
  hoverSpeedMultiplier: 2.0,
  clickAnimationDuration: 200,
};

// Export factory function for easy initialization
export function createSoda3DButton(config: Partial<Soda3DConfig> = {}): Soda3DButton {
  const finalConfig = { ...defaultSoda3DConfig, ...config };
  return new Soda3DButton(finalConfig);
}
