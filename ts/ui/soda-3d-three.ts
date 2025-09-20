// Three.js Soda Button (minimal) - dynamically imported when enabled
import { config } from '../config';

export interface ThreeSodaAPI {
  mount: () => Promise<void>;
  unmount: () => void;
  updateProgress: (percent: number) => void;
  spawnBubble: () => void;
  setPaused?: (paused: boolean) => void;
  setReducedMotion?: (reduced: boolean) => void;
}

export function isThreeSodaEnabled(): boolean {
  try {
    return !!config.UI?.USE_THREE_SODA_BUTTON;
  } catch {
    return false;
  }
}

export async function createThreeSodaButton(targetSelector: string): Promise<ThreeSodaAPI> {
  // Consolidate all dynamic imports at the top level for better production build compatibility
  const [
    {
      Scene,
      PerspectiveCamera,
      WebGLRenderer,
      sRGBEncoding,
      Clock,
      Box3,
      Vector3,
      MathUtils,
      CylinderGeometry,
      CircleGeometry,
      BoxGeometry,
      SphereGeometry,
      PlaneGeometry,
      TorusGeometry,
      Mesh,
      MeshStandardMaterial,
      MeshBasicMaterial,
      Group,
      AmbientLight,
      DirectionalLight,
      HemisphereLight,
      CanvasTexture,
      DoubleSide,
      BackSide,
    },
    { GLTFLoader },
  ] = await Promise.all([import('three'), import('three/examples/jsm/loaders/GLTFLoader.js')]);

  // Load GLB URL with proper fallback
  const sodaGlbUrl =
    ((await import('../../res/Soda.glb?url')).default as string) || '/res/Soda.glb';

  // Runtime locals
  let container: HTMLElement | null = null;
  let renderer: any = null;
  let scene: any = null;
  let camera: any = null;
  let frameId: number | null = null;
  let isPaused: boolean = false;
  let liquidMesh: any = null;
  let cupGroup: any = null;
  let clock: any = null;
  // Bounds for clamping liquid top inside cup silhouette
  let modelYMin = 0;
  let modelYMax = 1;
  const liquidBaseMargin = 0.05; // fraction of model height reserved as bottom margin
  const liquidSideShrink = 0.75; // shrink radius vs model width to avoid side clipping
  let baseHeight = 0.8; // cylinder geometry height (world units)
  let lastBottomY = 0; // updated on progress
  let lastTopY = 0; // updated on progress

  type Bubble = { mesh: any; vy: number; age: number; life: number };
  const bubbles: Bubble[] = [];
  // Foam removed
  let surfaceMesh: any = null;
  let liquidUniforms: any = null;
  let prefersReducedMotion = false;
  let lastProgressPct = 0;
  let emissionRate = 0; // bubbles per second
  let emissionAccumulator = 0;
  let sloshX = 0;
  let sloshZ = 0;
  let streamMesh: any = null;
  let spoutMesh: any = null;
  let impactSprite: any = null;
  let fountainHousing: any = null;
  let colaReservoir: any = null;
  let connectingTube: any = null;
  let statusLed: any = null;
  let brandingOverlay: HTMLElement | null = null;
  let impactActive = false;
  let impactAge = 0;
  const impactLife = 0.45; // seconds
  let lastImpactAt = 0;
  // Fluid experiment removed

  async function mount(): Promise<void> {
    container = document.querySelector(targetSelector) as HTMLElement | null;
    if (!container) return;
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.background = 'transparent';

    // Scene
    scene = new Scene();

    // Camera
    const width =
      container.clientWidth ||
      container.offsetWidth ||
      Math.round(container.getBoundingClientRect().width) ||
      200;
    const height =
      container.clientHeight ||
      container.offsetHeight ||
      Math.round(container.getBoundingClientRect().height) ||
      400;
    camera = new PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 2.2);

    // Renderer
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputEncoding = sRGBEncoding;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // Reduced from 2 to 1.5
    renderer.setClearColor(0x000000, 0); // transparent
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Optionally load original GLB model unless using procedural-only cup
    let model: any = null;
    const loadOriginal = !config.UI?.USE_PROCEDURAL_CUP;
    if (loadOriginal) {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(sodaGlbUrl);
      model = gltf.scene;
      model.scale.set(1, 1, 1);
      scene.add(model);
    }

    // Apply vertical alpha gradient to likely cup materials only (name heuristic)
    const applyVerticalAlphaToMaterials = (yMin: number, yMax: number) => {
      try {
        model.traverse((obj: any) => {
          if (!obj.isMesh || !obj.material) return;
          const mat = obj.material;
          const name = `${obj.name || ''} ${mat.name || ''}`.toLowerCase();
          const looksLikeCup =
            name.includes('cup') ||
            name.includes('glass') ||
            name.includes('body') ||
            name.includes('container');
          if (!looksLikeCup) return; // don't alter straw/nozzle/other parts
          if (!('onBeforeCompile' in mat)) return; // only standard/physical materials
          mat.transparent = true; // enable alpha blending only on cup-like mesh
          mat.depthWrite = true;
          const minAlpha = 0.85; // keep mostly opaque; just a hint of transparency at bottom
          mat.onBeforeCompile = (shader: any) => {
            shader.uniforms.uBottomY = { value: yMin };
            shader.uniforms.uTopY = { value: yMax };
            shader.uniforms.uMinAlpha = { value: minAlpha };
            // Varying for world position
            shader.vertexShader = `varying vec3 vWorldPosition;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              '#include <worldpos_vertex>',
              `#include <worldpos_vertex>\n  vWorldPosition = worldPosition.xyz;`
            );
            // Fragment: apply alpha gradient based on world Y
            shader.fragmentShader =
              `varying vec3 vWorldPosition;\nuniform float uBottomY;\nuniform float uTopY;\nuniform float uMinAlpha;\n` +
              shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <output_fragment>',
              `float t = clamp((vWorldPosition.y - uBottomY) / max(0.0001, (uTopY - uBottomY)), 0.0, 1.0);\n  // Fade only in lower 25% of height; above that, keep fully opaque\n  float fade = smoothstep(0.0, 0.25, t);\n  float alphaMul = mix(uMinAlpha, 1.0, fade);\n  gl_FragColor = vec4( outgoingLight, diffuseColor.a * alphaMul );`
            );
          };
          mat.needsUpdate = true;
        });
      } catch {}
    };

    // Use already imported Three.js constructors

    // Optional: build procedural cup and hide original cup body
    if (config.UI?.USE_PROCEDURAL_CUP) {
      // Heuristic hide of original cup meshes
      if (model) {
        model.traverse((obj: any) => {
          const n = `${obj.name || ''}`.toLowerCase();
          if (obj.isMesh && (n.includes('cup') || n.includes('glass') || n.includes('body'))) {
            obj.visible = false;
          }
        });
      }

      cupGroup = new Group();
      // Cup dimensions (world units) relative to model center
      const outerTopR = 0.32;
      const outerBotR = 0.28;
      const wallHeight = 0.95;
      const innerThickness = 0.02;
      const innerTopR = outerTopR - innerThickness;
      const innerBotR = outerBotR - innerThickness;

      const cupMat = new MeshStandardMaterial({
        color: 0xeef4ff,
        opacity: 0.6,
        transparent: true,
        metalness: 0.1,
        roughness: 0.35,
        depthWrite: false,
      });
      const innerMat = cupMat.clone();
      innerMat.side = BackSide;

      const outer = new Mesh(
        new CylinderGeometry(outerTopR, outerBotR, wallHeight, 32, 1, true),
        cupMat
      );
      const inner = new Mesh(
        new CylinderGeometry(innerTopR, innerBotR, wallHeight * 0.98, 32, 1, true),
        innerMat
      );
      const bottomMat = cupMat.clone();
      bottomMat.transparent = false;
      bottomMat.opacity = 1;
      bottomMat.depthWrite = true;
      const bottom = new Mesh(new CircleGeometry(innerBotR, 32), bottomMat);
      bottom.rotation.x = -Math.PI / 2;
      bottom.position.y = -wallHeight / 2 + 0.005;

      const rim = new Mesh(new TorusGeometry(innerTopR, 0.01, 8, 32), cupMat.clone());
      rim.position.y = wallHeight / 2;
      rim.rotation.x = Math.PI / 2;

      // Ensure glass draws last so it overlays/tints interior
      outer.renderOrder = 2001;
      inner.renderOrder = 2001;
      rim.renderOrder = 2002;

      cupGroup.add(outer, inner, bottom, rim);

      // Removed depth-only mask; glass walls do not write depth; bottom does
      scene.add(cupGroup);

      // Place cup to model center if model exists; else keep at origin
      if (model) {
        const center = new Vector3();
        new Box3().setFromObject(model).getCenter(center);
        cupGroup.position.copy(center);
      } else {
        cupGroup.position.set(0, 0, 0);
      }
    }

    // Liquid inside procedural cup
    baseHeight = 0.8;
    const geo = new CylinderGeometry(0.23, 0.23, baseHeight, 24, 1, false);
    const mat = new MeshStandardMaterial({
      color: 0x3a1308,
      transparent: true,
      opacity: 0.95,
      depthWrite: true,
      depthTest: true,
    });
    // No shader override for liquid; keep standard shading for reliability
    liquidMesh = new Mesh(geo, mat);
    if (cupGroup) {
      liquidMesh.position.set(0, 0, 0);
      liquidMesh.position.y = 0; // will be set by updateProgress
      cupGroup.add(liquidMesh);
    } else {
      liquidMesh.position.set(0, 0.4, 0);
      scene.add(liquidMesh);
    }

    // Use scale + position to simulate filling from bottom (simpler than clipping plane)
    liquidMesh.scale.set(1, 0.001, 1);

    // Foam removed

    // Liquid top surface with subtle waves/slosh
    try {
      const discGeo = new CircleGeometry(0.212, 64);
      const discMat = new MeshStandardMaterial({
        color: 0x4a2010,
        transparent: true,
        opacity: 0.95,
        roughness: 0.4,
        metalness: 0.05,
        depthWrite: true,
      });
      // Flat surface: no shader-based slosh or ripples
      surfaceMesh = new Mesh(discGeo, discMat);
      surfaceMesh.rotation.x = -Math.PI / 2;
      surfaceMesh.renderOrder = 996;
      if (cupGroup) cupGroup.add(surfaceMesh);
      else scene.add(surfaceMesh);
    } catch {}

    // === NEW PROFESSIONAL FOUNTAIN MACHINE - PROPER PROPORTIONS ===
    try {
      // === MAIN HOUSING BASE ===
      // Professional commercial fountain base - wider, more stable
      const housingGeo = new BoxGeometry(0.35, 0.25, 0.15);
      const housingMat = new MeshStandardMaterial({
        color: 0x34495e, // Professional charcoal
        metalness: 0.3,
        roughness: 0.4,
      });
      fountainHousing = new Mesh(housingGeo, housingMat);
      fountainHousing.position.set(0.0, 0.7, 0.0); // Centered above cup, realistic height
      if (cupGroup) cupGroup.add(fountainHousing);
      else scene.add(fountainHousing);

      // === COLA RESERVOIR ===
      // More realistic size - like a real fountain syrup container
      const reservoirGeo = new CylinderGeometry(0.08, 0.08, 0.18, 16);
      const reservoirMat = new MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        metalness: 0.1,
        roughness: 0.1,
      });
      colaReservoir = new Mesh(reservoirGeo, reservoirMat);
      colaReservoir.position.set(0.0, 0.88, -0.02); // On top, slightly back
      if (cupGroup) cupGroup.add(colaReservoir);
      else scene.add(colaReservoir);

      // === COLA SYRUP INSIDE ===
      const syrupGeo = new CylinderGeometry(0.075, 0.075, 0.15, 16);
      const syrupMat = new MeshStandardMaterial({
        color: 0x4a2010, // Dark cola syrup color
        transparent: true,
        opacity: 0.7,
      });
      const colaLiquid = new Mesh(syrupGeo, syrupMat);
      colaLiquid.position.set(0.0, 0.86, -0.02);
      if (cupGroup) cupGroup.add(colaLiquid);
      else scene.add(colaLiquid);

      // === DISPENSING MECHANISM ===
      // Professional fountain spout assembly
      const spoutAssemblyGeo = new CylinderGeometry(0.04, 0.04, 0.06, 12);
      const spoutAssemblyMat = new MeshStandardMaterial({
        color: 0xbdc3c7, // Stainless steel
        metalness: 0.9,
        roughness: 0.1,
      });
      spoutMesh = new Mesh(spoutAssemblyGeo, spoutAssemblyMat);
      spoutMesh.position.set(0.0, 0.65, 0.08); // Front of housing, proper height, centered above cup
      if (cupGroup) cupGroup.add(spoutMesh);
      else scene.add(spoutMesh);

      // === CONNECTING PIPES ===
      // Realistic plumbing from reservoir to spout
      const pipeGeo = new CylinderGeometry(0.012, 0.012, 0.15, 8);
      const pipeMat = new MeshStandardMaterial({
        color: 0x95a5a6,
        metalness: 0.8,
        roughness: 0.2,
      });
      connectingTube = new Mesh(pipeGeo, pipeMat);
      connectingTube.position.set(0.0, 0.765, 0.04); // Between reservoir and spout
      connectingTube.rotation.x = Math.PI / 6; // Angled connection
      if (cupGroup) cupGroup.add(connectingTube);
      else scene.add(connectingTube);

      // === CONTROL PANEL AREA ===
      // Where the branding will appear
      const controlPanelGeo = new BoxGeometry(0.25, 0.08, 0.02);
      const controlPanelMat = new MeshStandardMaterial({
        color: 0x2c3e50,
        metalness: 0.2,
        roughness: 0.6,
      });
      const controlPanel = new Mesh(controlPanelGeo, controlPanelMat);
      controlPanel.position.set(0.0, 0.75, 0.085); // Front face for branding
      if (cupGroup) cupGroup.add(controlPanel);
      else scene.add(controlPanel);

      // Ribbon stream: camera-facing plane with cola color
      const streamGeo = new PlaneGeometry(0.05, 0.6, 1, 1);
      const streamMat = new MeshBasicMaterial({
        color: 0x4a2010,
        transparent: true,
        opacity: 0.85,
        depthTest: true,
        depthWrite: true,
        side: DoubleSide,
      });
      streamMesh = new Mesh(streamGeo, streamMat);
      // Start at spout location; will stretch down to surface
      streamMesh.position.copy(spoutMesh.position);
      streamMesh.rotation.set(0, 0, 0);
      streamMesh.renderOrder = 997; // draw after surface (996)
      streamMesh.frustumCulled = false;
      streamMesh.visible = false;
      if (cupGroup) cupGroup.add(streamMesh);
      else scene.add(streamMesh);

      // === SODA CLICKER PRO BRANDING ===
      // Remove 3D text - we'll use HTML overlay instead for perfect text rendering

      // === STATUS LED INDICATOR === (Properly positioned on control panel)
      const ledGeo = new SphereGeometry(0.008, 8, 8);
      const ledMat = new MeshStandardMaterial({
        color: 0x2ecc71, // Green "ready" indicator
        emissive: 0x2ecc71,
        emissiveIntensity: 0.4,
      });
      statusLed = new Mesh(ledGeo, ledMat);
      statusLed.position.set(-0.1, 0.78, 0.095); // Right side of control panel
      if (cupGroup) cupGroup.add(statusLed);
      else scene.add(statusLed);
    } catch {}

    // Impact ring sprite at surface
    try {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // radial alpha ring (thicker, brighter)
        const g = ctx.createRadialGradient(
          size / 2,
          size / 2,
          size * 0.2,
          size / 2,
          size / 2,
          size * 0.5
        );
        g.addColorStop(0.0, 'rgba(255,255,255,0.0)');
        g.addColorStop(0.45, 'rgba(255,255,200,0.35)');
        g.addColorStop(0.75, 'rgba(255,255,255,0.0)');
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.49, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new CanvasTexture(canvas);
      tex.needsUpdate = true;
      const { SpriteMaterial } = await import('three');
      const mat = new SpriteMaterial({
        map: tex,
        color: 0xffffff,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        opacity: 0.0,
        blending: (await import('three')).AdditiveBlending,
      });
      const { Sprite } = await import('three');
      impactSprite = new Sprite(mat);
      impactSprite.renderOrder = 2000; // under glass (2001+) but above surface/stream
      impactSprite.scale.set(0.14, 0.14, 1);
      impactSprite.visible = false;
      if (cupGroup) cupGroup.add(impactSprite);
      else scene.add(impactSprite);
    } catch {}

    // Reduced motion preference
    try {
      const win: any = typeof window !== 'undefined' ? window : {};
      const mediaReduced =
        win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)')?.matches;
      prefersReducedMotion = !!(win.__REDUCED_MOTION__ ?? mediaReduced);
    } catch {}

    // Experimental fluid removed

    // Basic lighting
    const amb = new AmbientLight(0xffffff, 0.85);
    const hemi = new HemisphereLight(0xffffff, 0x444444, 0.4);
    const dir = new DirectionalLight(0xffffff, 0.9);
    dir.position.set(1, 2, 2);
    scene.add(amb, hemi, dir);

    // Helper: frame model to fit container
    const frameModel = () => {
      try {
        const target = cupGroup || model;
        if (!target) return;
        const box = new Box3().setFromObject(target);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        const fov = MathUtils.degToRad(camera.fov);
        const canvas = renderer.domElement;
        const aspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
        const halfY = size.y / 2 || 0.5;
        const halfX = size.x / 2 || 0.5;
        const distY = halfY / Math.tan(fov / 2);
        const distX = halfX / Math.tan(fov / 2) / aspect;
        const dist = Math.max(distX, distY) * 1.35; // extra margin to avoid cropping
        camera.position.copy(center.clone().add(new Vector3(0, halfY * 0.15, dist)));
        camera.near = Math.max(0.01, dist / 50);
        camera.far = dist * 50;
        camera.updateProjectionMatrix();
        camera.lookAt(center);

        // Update model bounds for liquid clamping
        modelYMin = box.min.y;
        modelYMax = box.max.y;

        // Ensure cup transparency gradient uses the latest bounds
        if (model && !config.UI?.USE_PROCEDURAL_CUP) {
          applyVerticalAlphaToMaterials(modelYMin, modelYMax);
        }

        // Re-center liquid and shrink radius to avoid side clipping
        const safeRadius = cupGroup ? 0.23 : Math.min(size.x, size.z) * 0.5 * liquidSideShrink;
        if (liquidMesh && (liquidMesh.geometry as any)?.parameters) {
          // If needed, we could rebuild geometry; instead, scale XZ to fit
          const scaleXZ = Math.max(0.01, safeRadius / 0.25);
          liquidMesh.scale.x = scaleXZ;
          liquidMesh.scale.z = scaleXZ;
        }
        if (!cupGroup) {
          liquidMesh.position.x = center.x;
          liquidMesh.position.z = center.z;
        }
      } catch {}
    };

    frameModel();

    // Spin
    clock = new Clock();
    const animate = () => {
      if (isPaused) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      const dt = clock.getDelta();
      // Fountain is now stationary for better branding visibility
      // const rotTarget = cupGroup || model;
      // if (rotTarget) rotTarget.rotation.y += dt * 0.5;

      // Update bubbles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (!b) continue;
        b.age += dt;
        // accelerate upward slightly
        b.vy += dt * 0.15;
        b.mesh.position.y += b.vy * dt;
        // fade out as it rises
        const mat = b.mesh.material;
        if (mat && (mat as any).transparent) {
          (mat as any).opacity = Math.max(
            0,
            0.9 - b.age / b.life - 0.2 * (b.mesh.position.y - lastBottomY)
          );
        }
        // scale slightly as it rises
        const s = 1 + b.age * 0.3;
        b.mesh.scale.set(s, s, s);
        if (b.age >= b.life || b.mesh.position.y > lastTopY + 0.02) {
          // remove
          b.mesh.parent && b.mesh.parent.remove(b.mesh);
          bubbles.splice(i, 1);
        }
      }

      // Continuous emitter tied to emissionRate
      if (!prefersReducedMotion) {
        emissionAccumulator += dt * emissionRate;
        const maxSpawn = 3;
        let spawned = 0;
        while (emissionAccumulator >= 1 && spawned < maxSpawn) {
          spawnBubble();
          emissionAccumulator -= 1;
          spawned++;
        }
        // Clamp accumulator to avoid runaway
        emissionAccumulator = Math.min(emissionAccumulator, 4);
      }
      // Foam wobble removed

      // Flat surface: no wave uniforms

      // Experimental fluid removed

      // Animate impact glint
      if (impactActive && impactSprite) {
        impactAge += dt;
        const t = Math.min(1, impactAge / impactLife);
        const baseR = 0.23 * (liquidMesh?.scale?.x || 1);
        const scale = baseR * (0.18 + t * 0.2);
        impactSprite.scale.set(scale, scale, 1);
        const smat: any = impactSprite.material;
        if (smat) {
          const fadeIn = Math.min(1, t / 0.25);
          const fadeOut = Math.max(0, 1 - (t - 0.25) / 0.75);
          smat.opacity = 0.22 * fadeIn * fadeOut;
        }
        // keep on surface and under spout XZ
        const sp = spoutMesh ? spoutMesh.position : new Vector3(0.0, 0.65, 0.08); // Updated fountain position - centered above cup
        impactSprite.position.set(sp.x, lastTopY + 0.001, sp.z);
        if (t >= 1) {
          impactActive = false;
          impactSprite.visible = false;
        }
      }

      // Update branding overlay position to match 3D fountain
      updateBrandingOverlay();

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // Initialize HTML branding overlay
    createBrandingOverlay();

    // Create HTML branding overlay for perfect text rendering
    function createBrandingOverlay() {
      if (brandingOverlay) return;

      brandingOverlay = document.createElement('div');
      brandingOverlay.className = 'fountain-branding-overlay';
      brandingOverlay.innerHTML = `
      <div class="branding-main">SODA CLICKER PRO</div>
      <div class="branding-sub">COLA FOUNTAIN</div>
    `;

      // Style the overlay
      const style = document.createElement('style');
      style.textContent = `
      .fountain-branding-overlay {
        position: absolute;
        pointer-events: none;
        z-index: 1000;
        font-family: 'Arial', sans-serif;
        text-align: center;
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        border: 2px solid #ffffff;
        border-radius: 6px;
        padding: 5px 10px;
        transform-origin: center center;
        transform-style: preserve-3d;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-width: 100px;
        min-height: 26px;
        transition: transform 0.1s ease-out, filter 0.1s ease-out, opacity 0.1s ease-out;
        backface-visibility: hidden;
        will-change: transform, filter, opacity;
        box-sizing: border-box;
      }
      
      .branding-main {
        font-weight: 900;
        color: #ffffff;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
        line-height: 1.0;
        margin: 0 0 1px 0;
        max-width: 100%;
        display: block;
        text-align: center;
      }
      
      .branding-sub {
        font-weight: 700;
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.6);
        line-height: 1.0;
        margin: 0;
        max-width: 100%;
        display: block;
        text-align: center;
      }
    `;

      if (!document.getElementById('fountain-branding-styles')) {
        style.id = 'fountain-branding-styles';
        document.head.appendChild(style);
      }

      // Add to the 3D container
      const container = renderer.domElement.parentElement;
      if (container) {
        container.style.position = 'relative';
        container.appendChild(brandingOverlay);
      }
    }

    // Update overlay position and transforms to match 3D fountain surface
    function updateBrandingOverlay() {
      if (!brandingOverlay || !fountainHousing) return;

      // Calculate fountain housing corners in 3D space - IMPROVED CENTERING
      const housingSize = { width: 0.35, height: 0.25 }; // New housing geometry
      const panelCenterY = 0.75; // Control panel Y position
      const centerVector = new Vector3(0.0, panelCenterY, 0.095); // Center of control panel front face
      const leftVector = new Vector3(0.0 - housingSize.width / 2, panelCenterY, 0.095);
      const rightVector = new Vector3(0.0 + housingSize.width / 2, panelCenterY, 0.095);
      const depthVector = new Vector3(0.0, panelCenterY, 0.02); // Point behind for perspective

      // Project to screen space
      centerVector.project(camera);
      leftVector.project(camera);
      rightVector.project(camera);
      depthVector.project(camera);

      const canvas = renderer.domElement;
      const centerX = (centerVector.x * 0.5 + 0.5) * canvas.clientWidth;
      const centerY = (-centerVector.y * 0.5 + 0.5) * canvas.clientHeight;
      const leftX = (leftVector.x * 0.5 + 0.5) * canvas.clientWidth;
      const rightX = (rightVector.x * 0.5 + 0.5) * canvas.clientWidth;
      const depthX = (depthVector.x * 0.5 + 0.5) * canvas.clientWidth;

      // Calculate perspective effects - sized for control panel (0.25 wide × 0.08 tall)
      const housingScreenWidth = Math.abs(rightX - leftX);
      const controlPanelRatio = 0.25 / 0.35; // Control panel is 0.25 wide, housing is 0.35 wide
      const overlayWidth = Math.max(
        100,
        Math.min(250, housingScreenWidth * controlPanelRatio * 1.1)
      ); // Wider to prevent text truncation
      const overlayHeight = Math.max(26, overlayWidth * 0.32); // Proper height for text

      // Calculate 3D perspective transforms
      const perspectiveSkew = (depthX - centerX) / overlayWidth; // Horizontal skew from perspective
      const distance = centerVector.z; // Distance from camera (-1 to 1 after projection)
      const scale = Math.max(0.5, 1 - distance * 0.2); // Scale based on distance
      const rotationY = Math.atan2(depthX - centerX, 50) * (180 / Math.PI); // Y rotation from perspective

      // Calculate lighting effects based on 3D position
      const lightIntensity = Math.max(0.3, 1 - Math.abs(distance) * 0.4);

      // Apply 3D transforms to make it look attached to the fountain - IMPROVED CENTERING
      const transform = `
      translate(-50%, -50%) 
      scale(${scale}) 
      rotateY(${rotationY * 0.25}deg)
      skewX(${perspectiveSkew * 12}deg)
      perspective(1200px)
      translateZ(0)
    `;

      // Position and transform the overlay - IMPROVED CENTERING
      const offsetX = 8 * scale; // Move slightly right
      const offsetY = 6 * scale; // Move down instead of up
      brandingOverlay.style.left = centerX + offsetX + 'px';
      brandingOverlay.style.top = centerY + offsetY + 'px';
      brandingOverlay.style.width = overlayWidth + 'px';
      brandingOverlay.style.height = overlayHeight + 'px';
      brandingOverlay.style.transform = transform;

      // Apply 3D lighting effects
      const shadowBlur = Math.max(2, 8 * lightIntensity);
      const shadowOffset = Math.max(1, 3 * lightIntensity);
      const brightness = Math.max(0.7, lightIntensity);

      brandingOverlay.style.filter = `
      brightness(${brightness})
      drop-shadow(${shadowOffset}px ${shadowOffset}px ${shadowBlur}px rgba(0,0,0,0.4))
    `;

      // Adjust opacity based on viewing angle (more transparent when viewed edge-on)
      const viewingAngle = Math.abs(rotationY);
      const opacity = Math.max(0.7, 1 - viewingAngle / 90);
      brandingOverlay.style.opacity = opacity.toString();

      // Scale font size to fit control panel dimensions - IMPROVED SIZING
      const baseFontSize = Math.max(8, Math.min(16, overlayWidth * 0.13 * scale));
      const subFontSize = Math.max(5, Math.min(11, baseFontSize * 0.7));

      const mainText = brandingOverlay.querySelector('.branding-main') as HTMLElement;
      const subText = brandingOverlay.querySelector('.branding-sub') as HTMLElement;

      if (mainText) mainText.style.fontSize = baseFontSize + 'px';
      if (subText) subText.style.fontSize = subFontSize + 'px';
    }

    // Resize
    const onResize = () => {
      if (!container) return;
      const w =
        container.clientWidth ||
        container.offsetWidth ||
        Math.round(container.getBoundingClientRect().width) ||
        width;
      const h =
        container.clientHeight ||
        container.offsetHeight ||
        Math.round(container.getBoundingClientRect().height) ||
        height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameModel();
    };
    window.addEventListener('resize', onResize);
  }

  function unmount() {
    if (frameId) cancelAnimationFrame(frameId);
    if (renderer) renderer.dispose?.();
    const canvas = renderer?.domElement as HTMLCanvasElement | undefined;
    if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    renderer = null;
    scene = null;
    camera = null;
    liquidMesh = null;
  }

  function updateProgress(percent: number) {
    if (!liquidMesh) return;
    const s = Math.min(Math.max(percent, 0), 100) / 100; // 0..1
    // Compute bounds based on host (procedural cup vs model bounds)
    let bottomY: number;
    let targetHeight: number;
    if (cupGroup) {
      // Procedural cup coordinates: center at cupGroup origin
      const wallHeight = 0.95;
      const baseMargin = 0.04;
      bottomY = -wallHeight / 2 + baseMargin;
      const maxFillHeight = wallHeight - baseMargin * 2;
      targetHeight = Math.max(0.001, maxFillHeight * s);
    } else {
      // Clamp within model bounds
      const modelHeight = Math.max(0.001, modelYMax - modelYMin);
      bottomY = modelYMin + modelHeight * liquidBaseMargin;
      const maxFillHeight = modelHeight * (1 - 2 * liquidBaseMargin);
      targetHeight = Math.max(0.001, maxFillHeight * s);
    }
    // Our cylinder base height is baseHeight; we scale to match targetHeight
    const scaleY = Math.max(0.001, targetHeight / baseHeight);
    liquidMesh.scale.y = scaleY;
    // Position so bottom sits at bottomY and top at bottomY + targetHeight
    liquidMesh.position.y = bottomY + targetHeight / 2;
    lastBottomY = bottomY;
    lastTopY = bottomY + targetHeight;
    // Update liquid shader bounds if available
    if (liquidUniforms) {
      liquidUniforms.uBottomY.value = lastBottomY;
      liquidUniforms.uTopY.value = lastTopY;
    }

    // Foam removed

    // Update emission rate based on fill speed
    const deltaPct = Math.max(0, percent - lastProgressPct);
    lastProgressPct = percent;
    const baseRate = prefersReducedMotion ? 0 : 1.0 * s; // more bubbles when fuller
    const speedBoost = deltaPct * 0.2; // bubbles when filling fast
    emissionRate = Math.min(10, baseRate + speedBoost);

    // Update surface and foam positions/scales
    if (surfaceMesh) {
      surfaceMesh.position.y = lastTopY + 0.001;
      const sx = Math.max(0.001, liquidMesh.scale.x) * 0.88;
      surfaceMesh.scale.set(sx, 1, sx);
      // Kick slosh based on fill delta (smooth planar tilt toward spout)
      const impulse = deltaPct * 0.06;
      if (impulse > 0) {
        sloshX -= impulse * 0.5; // tilt slightly toward spout (negative X)
        sloshZ += impulse * 0.1;
      }
    }

    // Drive stream visibility by geometry (spout above surface) or pour delta
    if (streamMesh) {
      const spoutPos = spoutMesh ? spoutMesh.position : new Vector3(0.0, 0.65, 0.08); // Updated fountain position - centered above cup
      const surfaceY = lastTopY + 0.001;
      const distanceY = spoutPos.y - surfaceY;
      const isAboveSurface = distanceY > 0.01;
      const isPouring = deltaPct > 0; // even tiny progress should show briefly
      const visible = isAboveSurface || isPouring;
      streamMesh.visible = visible;
      if (visible) {
        // Camera-facing ribbon: face the camera each frame
        const cam = camera as any;
        if (cam && streamMesh.lookAt) {
          const target = new Vector3(cam.position.x, streamMesh.position.y, cam.position.z);
          (streamMesh as any).lookAt(target);
        }
        const distance = Math.max(0.06, isAboveSurface ? distanceY : 0.06);
        // base geometry height is 0.6, adjust scale.y to match distance
        let width = 1;
        if (config.UI?.STREAM_RIBBON_NOISE) {
          const t = performance.now() * 0.002;
          // subtle width noise and taper toward the bottom
          const noise = 0.9 + Math.sin(t * 2.3) * 0.08 + Math.cos(t * 1.7) * 0.05;
          width = Math.max(0.78, Math.min(1.15, noise));
        }
        streamMesh.scale.set(width, Math.max(0.25, distance / 0.6), 1);
        // Midpoint: if above surface, between spout and surface; else just below spout
        const midY = isAboveSurface ? surfaceY + distance * 0.5 : spoutPos.y - distance * 0.5;
        streamMesh.position.set(spoutPos.x, midY, spoutPos.z);
        const mat: any = streamMesh.material;
        if (mat) mat.opacity = 0.85;
      }
    }

    // Impact glint trigger
    if (!prefersReducedMotion && deltaPct > 0 && config.UI?.STREAM_IMPACT_GLINT) {
      const now = performance.now();
      if (now - lastImpactAt > 120) {
        lastImpactAt = now;
        impactActive = true;
        impactAge = 0;
        if (impactSprite) {
          impactSprite.visible = true;
          const sp = spoutMesh ? spoutMesh.position : new Vector3(0.0, 0.65, 0.08); // Updated fountain position - centered above cup
          // slight offset around impact point so it doesn't always center perfectly
          const r = 0.02;
          const jitterX = (Math.random() * 2 - 1) * r;
          const jitterZ = (Math.random() * 2 - 1) * r;
          impactSprite.position.set(sp.x + jitterX, lastTopY + 0.001, sp.z + jitterZ);
          const baseR = 0.23 * (liquidMesh?.scale?.x || 1);
          const start = Math.max(0.03, baseR * 0.18);
          impactSprite.scale.set(start, start, 1);
          const smat: any = impactSprite.material;
          if (smat) smat.opacity = 0.0;
        }
      }
    }
  }

  async function spawnBubble() {
    try {
      const geometry = new SphereGeometry(0.015, 10, 10);
      const material = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        depthTest: false,
      });
      const bubble = new Mesh(geometry, material);
      const host = (cupGroup || scene) as any;
      // random xz within safe radius
      const r = 0.16 * (0.7 + Math.random() * 0.3);
      const theta = Math.random() * Math.PI * 2;
      bubble.position.x = Math.cos(theta) * r;
      bubble.position.z = Math.sin(theta) * r;
      bubble.position.y = (lastBottomY || 0) + 0.03;
      bubble.renderOrder = 999; // draw on top of liquid
      host.add(bubble);
      bubbles.push({
        mesh: bubble,
        vy: 0.25 + Math.random() * 0.12,
        age: 0,
        life: 0.9 + Math.random() * 0.7,
      });
    } catch {}
  }

  function setPaused(paused: boolean) {
    isPaused = !!paused;
  }
  function setReducedMotion(reduced: boolean) {
    prefersReducedMotion = !!reduced;
  }
  return { mount, unmount, updateProgress, spawnBubble, setPaused, setReducedMotion };
}
