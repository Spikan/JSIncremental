// Lightweight 3D Soda Button using Model Viewer (No Three.js)
// Bundle size: ~100KB vs 1.5MB Three.js (93% reduction)

// Import the 3D model asset so Vite can process it
import sodaModelUrl from '../../res/Soda.glb?url';

// Fallback path for production compatibility
const FALLBACK_MODEL_PATH = './res/Soda.glb';

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
  performanceMode: 'high' | 'medium' | 'low';
  frameRateLimit: number; // FPS limit for animation
  // clickAnimationDuration removed
}

export class Soda3DButton {
  private modelViewer!: ModelViewerElement;
  private container: HTMLElement | null = null;
  private isLoaded = false;
  // clickAnimationDuration removed - no longer needed
  private clickHandlers: (() => void)[] = [];
  private rotationAngle = 0;
  private rotationSpeed = 0.5; // degrees per frame
  private animationId: number | null = null;
  private lastFrameTime = 0;
  private frameInterval = 1000 / 60; // Default 60fps, will be adjusted based on performance mode
  private frameCount = 0;
  private performanceMonitorStartTime = 0;
  private actualFPS = 0;
  private performanceDegradationCount = 0;

  constructor(private config: Soda3DConfig) {
    // clickAnimationDuration removed

    // Auto-detect performance mode if not specified
    this.autoDetectPerformance();

    // Set up performance mode
    this.setupPerformanceMode();

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

    // Performance optimizations based on mode
    this.applyPerformanceOptimizations();

    // Start custom rotation
    this.startRotation();
    // Remove all custom camera settings to use defaults
  }

  private applyPerformanceOptimizations() {
    switch (this.config.performanceMode) {
      case 'low':
        // Minimal quality settings for low-end devices
        this.modelViewer.setAttribute('shadow-intensity', '0');
        this.modelViewer.setAttribute('exposure', '0.5');
        this.modelViewer.setAttribute('tone-mapping', 'basic');
        break;
      case 'medium':
        // Balanced settings
        this.modelViewer.setAttribute('shadow-intensity', '0.3');
        this.modelViewer.setAttribute('exposure', '1.0');
        this.modelViewer.setAttribute('tone-mapping', 'neutral');
        break;
      case 'high':
        // High quality settings
        this.modelViewer.setAttribute('shadow-intensity', '1.0');
        this.modelViewer.setAttribute('exposure', '1.5');
        this.modelViewer.setAttribute('tone-mapping', 'aggressive');
        break;
    }
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

    // Click events - DISABLED to prevent double clicks
    // The parent button will handle clicks, not the 3D model
    // this.modelViewer.addEventListener('click', () => {
    //   this.handleClick();
    // });

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
      console.log('📍 Imported URL:', sodaModelUrl);
      console.log('📍 Fallback path:', FALLBACK_MODEL_PATH);
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

  // handleClick method removed - button events handle clicks now

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

  private autoDetectPerformance() {
    // Auto-detect device performance capabilities
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    // Check for hardware acceleration and device capabilities
    const isLowEndDevice =
      navigator.hardwareConcurrency <= 2 || // Low CPU cores
      (navigator as any).deviceMemory <= 2 || // Low RAM (if available)
      (gl && !(gl.getParameter(gl.RENDERER) as string).includes('GPU')) || // No GPU acceleration
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); // Mobile device

    if (isLowEndDevice) {
      this.config.performanceMode = 'low';
      this.config.frameRateLimit = 15;
      console.log('🔄 Auto-detected low-end device, using low performance mode');
    } else if (this.config.performanceMode === 'medium') {
      // Keep medium as default for most devices
      console.log('🔄 Using medium performance mode');
    }
  }

  private setupPerformanceMode() {
    // Set frame rate based on performance mode
    switch (this.config.performanceMode) {
      case 'high':
        this.frameInterval = 1000 / 60; // 60fps
        break;
      case 'medium':
        this.frameInterval = 1000 / 30; // 30fps
        break;
      case 'low':
        this.frameInterval = 1000 / 15; // 15fps
        break;
    }

    console.log(
      `🎯 Performance mode: ${this.config.performanceMode}, Target FPS: ${1000 / this.frameInterval}`
    );
  }

  private startRotation() {
    this.performanceMonitorStartTime = performance.now();

    const animate = (currentTime: number) => {
      // Frame rate limiting
      if (currentTime - this.lastFrameTime < this.frameInterval) {
        this.animationId = requestAnimationFrame(animate);
        return;
      }

      this.lastFrameTime = currentTime;
      this.frameCount++;

      // Performance monitoring
      this.monitorPerformance(currentTime);

      // Skip animation updates in low performance mode when not hovered
      if (this.config.performanceMode === 'low' && this.rotationSpeed === 0.5) {
        this.animationId = requestAnimationFrame(animate);
        return;
      }

      this.rotationAngle += this.rotationSpeed;
      if (this.rotationAngle >= 360) {
        this.rotationAngle -= 360;
      }

      // Update camera orbit with our custom rotation
      this.modelViewer.setAttribute('camera-orbit', `${this.rotationAngle}deg 75deg auto`);

      this.animationId = requestAnimationFrame(animate);
    };

    animate(0);
  }

  private monitorPerformance(currentTime: number) {
    // Monitor FPS every 2 seconds
    if (currentTime - this.performanceMonitorStartTime >= 2000) {
      this.actualFPS = this.frameCount / ((currentTime - this.performanceMonitorStartTime) / 1000);
      const targetFPS = 1000 / this.frameInterval;

      // Check if performance is significantly below target
      if (this.actualFPS < targetFPS * 0.7) {
        this.performanceDegradationCount++;
        console.warn(
          `⚠️ 3D Model performance degraded: ${this.actualFPS.toFixed(1)}fps vs target ${targetFPS}fps`
        );

        // Auto-downgrade performance after 3 consecutive poor performance checks
        if (this.performanceDegradationCount >= 3) {
          this.autoDowngradePerformance();
        }
      } else {
        this.performanceDegradationCount = 0;
      }

      // Reset monitoring
      this.frameCount = 0;
      this.performanceMonitorStartTime = currentTime;
    }
  }

  private autoDowngradePerformance() {
    const currentMode = this.config.performanceMode;

    if (currentMode === 'high') {
      this.setPerformanceMode('medium');
      console.log('🔄 Auto-downgraded 3D model performance from high to medium');
    } else if (currentMode === 'medium') {
      this.setPerformanceMode('low');
      console.log('🔄 Auto-downgraded 3D model performance from medium to low');
    }

    this.performanceDegradationCount = 0;

    // Show user notification
    // Modernized - notifications handled by store
    console.log('3D Model performance set to', this.config.performanceMode);
  }

  private setRotationSpeed(speed: number) {
    this.rotationSpeed = speed;
  }

  // Performance management methods
  public setPerformanceMode(mode: 'high' | 'medium' | 'low') {
    this.config.performanceMode = mode;
    this.setupPerformanceMode();
  }

  public setFrameRateLimit(fps: number) {
    this.config.frameRateLimit = fps;
    this.frameInterval = 1000 / fps;
  }

  public pauseAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resumeAnimation() {
    if (!this.animationId && this.isLoaded) {
      this.startRotation();
    }
  }

  public getPerformanceStatus() {
    return {
      performanceMode: this.config.performanceMode,
      frameRateLimit: this.config.frameRateLimit,
      currentFrameInterval: this.frameInterval,
      actualFPS: this.actualFPS,
      performanceDegradationCount: this.performanceDegradationCount,
      isAnimating: this.animationId !== null,
      isLoaded: this.isLoaded,
    };
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Export default configuration - use function to avoid hoisting issues
export const getDefaultSoda3DConfig = (): Soda3DConfig => ({
  containerSelector: '#sodaButton',
  modelPath: sodaModelUrl || FALLBACK_MODEL_PATH, // Use Vite-processed asset URL with fallback
  size: 200,
  width: 200,
  height: 200,
  rotationSpeed: 1.0,
  hoverSpeedMultiplier: 2.0,
  performanceMode: 'medium', // Default to medium performance
  frameRateLimit: 30, // Default to 30fps
  // clickAnimationDuration removed
});

// Keep the old export for backward compatibility - but delay initialization
export const defaultSoda3DConfig = {
  get containerSelector() {
    return getDefaultSoda3DConfig().containerSelector;
  },
  get modelPath() {
    return getDefaultSoda3DConfig().modelPath;
  },
  get size() {
    return getDefaultSoda3DConfig().size;
  },
  get width() {
    return getDefaultSoda3DConfig().width;
  },
  get height() {
    return getDefaultSoda3DConfig().height;
  },
  get rotationSpeed() {
    return getDefaultSoda3DConfig().rotationSpeed;
  },
  get hoverSpeedMultiplier() {
    return getDefaultSoda3DConfig().hoverSpeedMultiplier;
  },
  get performanceMode() {
    return getDefaultSoda3DConfig().performanceMode;
  },
  get frameRateLimit() {
    return getDefaultSoda3DConfig().frameRateLimit;
  },
  // clickAnimationDuration removed
};

// Export factory function for easy initialization
export function createSoda3DButton(config: Partial<Soda3DConfig> = {}): Soda3DButton {
  const baseConfig = getDefaultSoda3DConfig();
  const finalConfig = { ...baseConfig, ...config };
  return new Soda3DButton(finalConfig);
}
