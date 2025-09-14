// 3D Soda Button Implementation using Three.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Soda3DConfig {
  containerSelector: string;
  modelPath: string;
  size: number;
  rotationSpeed: number;
  hoverSpeedMultiplier: number;
  clickAnimationDuration: number;
}

export class Soda3DButton {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private model: THREE.Group | null = null;
  private container: HTMLElement | null = null;
  private isLoaded = false;
  private isHovered = false;
  private isAnimating = false;
  private rotationSpeed: number;
  private hoverSpeedMultiplier: number;
  private clickAnimationDuration: number;
  private animationId: number | null = null;
  private clickHandlers: (() => void)[] = [];
  private baseScale = 1; // Store the calculated base scale
  private centerPosition = new THREE.Vector3(0, 0, 0); // Store the centered position

  constructor(private config: Soda3DConfig) {
    this.rotationSpeed = config.rotationSpeed;
    this.hoverSpeedMultiplier = config.hoverSpeedMultiplier;
    this.clickAnimationDuration = config.clickAnimationDuration;

    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.setupScene();
    this.loadModel();
  }

  private setupScene(): void {
    // Set up camera position
    this.camera.position.z = 3;

    // Set up renderer
    this.renderer.setSize(this.config.size, this.config.size);
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Add directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);

    // Add point light for nice reflections
    const pointLight = new THREE.PointLight(0x00ff88, 0.3, 10);
    pointLight.position.set(-3, 2, 3);
    this.scene.add(pointLight);
  }

  private async loadModel(): Promise<void> {
    const loader = new GLTFLoader();

    try {
      console.log('🥤 Loading 3D soda model...');
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(
          this.config.modelPath,
          resolve,
          progress => {
            console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
          },
          reject
        );
      });

      this.model = gltf.scene;

      // Configure model
      if (this.model) {
        this.model.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Enhance materials for better appearance
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => this.enhanceMaterial(mat));
              } else {
                this.enhanceMaterial(child.material);
              }
            }
          }
        });

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model and store the centered position
        this.model.position.sub(center);
        this.centerPosition.copy(this.model.position);

        // Scale to fit nicely in view - increased size for better visibility
        const maxDimension = Math.max(size.x, size.y, size.z);
        this.baseScale = 3.5 / maxDimension; // Increased from 2 to 3.5 for larger model
        this.model.scale.setScalar(this.baseScale);

        this.scene.add(this.model);
      }
      this.isLoaded = true;

      // Mark container as having 3D model
      if (this.container) {
        this.container.classList.add('has-3d-model');
      }

      console.log('✅ 3D soda model loaded successfully');

      // Start animation loop
      this.animate();
    } catch (error) {
      console.error('❌ Failed to load 3D soda model:', error);
      this.showFallback();
    }
  }

  private enhanceMaterial(material: THREE.Material): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      material.metalness = 0.1;
      material.roughness = 0.3;
      material.envMapIntensity = 1;
    }
  }

  private showFallback(): void {
    // Create a simple fallback geometry if model fails to load
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 12);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      metalness: 0.1,
      roughness: 0.3,
    });

    this.model = new THREE.Group();
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    this.model.add(cylinder);

    this.scene.add(this.model);
    this.isLoaded = true;

    // Mark container as having 3D model
    if (this.container) {
      this.container.classList.add('has-3d-model');
    }

    this.animate();

    console.log('🔄 Using fallback 3D model');
  }

  private animate = (): void => {
    if (!this.model) return;

    // Rotation animation
    const currentSpeed = this.isHovered
      ? this.rotationSpeed * this.hoverSpeedMultiplier
      : this.rotationSpeed;

    this.model.rotation.y += currentSpeed;

    // Click animation (bounce effect)
    if (this.isAnimating) {
      const time = Date.now() * 0.01;
      const bounce = Math.sin(time) * 0.1;
      this.model.position.copy(this.centerPosition);
      this.model.position.y += bounce; // Add bounce to the centered Y position
      // Maintain the larger base scale during animation
      this.model.scale.setScalar(this.baseScale * (1 + Math.sin(time) * 0.05));
    }

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };

  public mount(container: HTMLElement): void {
    this.container = container;
    container.appendChild(this.renderer.domElement);

    // Add interaction handlers
    this.setupInteraction();

    // Mark container as having 3D model when loaded
    if (this.isLoaded) {
      container.classList.add('has-3d-model');
    }

    console.log('🎮 3D soda button mounted');
  }

  private setupInteraction(): void {
    if (!this.container) return;

    const canvas = this.renderer.domElement;

    // Hover effects
    canvas.addEventListener('mouseenter', () => {
      this.isHovered = true;
      canvas.style.cursor = 'pointer';
    });

    canvas.addEventListener('mouseleave', () => {
      this.isHovered = false;
      canvas.style.cursor = 'default';
    });

    // Click handling
    canvas.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.handleClick();
    });

    // Touch handling for mobile
    canvas.addEventListener('touchstart', event => {
      event.preventDefault();
      this.handleClick();
    });
  }

  private handleClick(): void {
    if (!this.isLoaded) return;

    // Trigger click animation
    this.triggerClickAnimation();

    // Call registered click handlers
    this.clickHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.warn('Click handler error:', error);
      }
    });
  }

  private triggerClickAnimation(): void {
    if (!this.model) return;

    this.isAnimating = true;

    // Reset position and scale after animation
    setTimeout(() => {
      if (this.model) {
        this.model.position.copy(this.centerPosition); // Reset to centered position
        this.model.scale.setScalar(this.baseScale); // Reset to base scale, not 1
      }
      this.isAnimating = false;
    }, this.clickAnimationDuration);
  }

  public onSodaClick(handler: () => void): void {
    this.clickHandlers.push(handler);
  }

  public setRotationSpeed(speed: number): void {
    this.rotationSpeed = speed;
  }

  public resize(size: number): void {
    this.config.size = size;
    this.renderer.setSize(size, size);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Clean up Three.js resources
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();

    if (this.container && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    console.log('🧹 3D soda button disposed');
  }
}

// Factory function for easy initialization
export function createSoda3DButton(containerSelector: string): Soda3DButton {
  const config: Soda3DConfig = {
    containerSelector,
    modelPath: '/res/Soda.glb',
    size: 200,
    rotationSpeed: 0.01,
    hoverSpeedMultiplier: 3,
    clickAnimationDuration: 500,
  };

  return new Soda3DButton(config);
}

// Global instance for easy access
let globalSoda3D: Soda3DButton | null = null;

export function initializeSoda3D(): void {
  console.log('🎮 Initializing 3D soda button...');

  const container = document.getElementById('sodaButton');
  if (!container) {
    console.error('❌ Soda button container not found');
    return;
  }

  console.log('📦 Found soda button container:', container);

  // Don't clear all content, just prepare for 3D
  // The fallback image should remain until 3D loads

  // Create and mount 3D button
  globalSoda3D = createSoda3DButton('#sodaButton');
  globalSoda3D.mount(container);

  // Connect to existing click handler
  globalSoda3D.onSodaClick(() => {
    try {
      // Call the existing soda click handler
      const handleSodaClick = (window as any).App?.systems?.clicks?.handleSodaClick;
      if (typeof handleSodaClick === 'function') {
        handleSodaClick(1);
        console.log('🥤 3D soda click triggered!');
      } else {
        console.warn('⚠️ Soda click handler not found');
      }
    } catch (error) {
      console.warn('Failed to call soda click handler:', error);
    }
  });

  // Make globally accessible for debugging
  (window as any).soda3D = globalSoda3D;

  console.log('✅ 3D soda button initialized');
}

export function getSoda3D(): Soda3DButton | null {
  return globalSoda3D;
}
