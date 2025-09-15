// Bubble Particle System: Soda-themed particle effects for the thematic header
// Provides floating bubbles, currency particles, and celebration effects

import { logger } from '../logger';

export interface BubbleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'currency' | 'ambient' | 'click' | 'celebration';
  text?: string;
  scale: number;
  rotation: number;
  vRotation: number;
}

export interface ParticleSystemConfig {
  maxParticles: number;
  spawnRate: number;
  gravity: number;
  wind: number;
  bubbleColors: string[];
  performanceMode: 'high' | 'medium' | 'low';
}

export class BubbleParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: BubbleParticle[] = [];
  private particlePool: BubbleParticle[] = [];
  private animationId: number | null = null;
  private isActive: boolean = false;
  private config: ParticleSystemConfig;
  private lastSpawnTime: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.config = {
      maxParticles: 50,
      spawnRate: 1000, // milliseconds between ambient spawns
      gravity: 0.02,
      wind: 0.001,
      bubbleColors: ['#00d97f', '#00b366', '#00ff88', '#ffffff', '#e6f7ff'],
      performanceMode: 'high',
    };

    this.setupCanvas();
    this.initializeParticlePool();
    this.setupEventListeners();
  }

  /**
   * Setup canvas for high DPI displays
   */
  private setupCanvas(): void {
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);

      // Set canvas size in CSS pixels
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  /**
   * Initialize particle pool for object pooling
   */
  private initializeParticlePool(): void {
    for (let i = 0; i < 100; i++) {
      this.particlePool.push(this.createEmptyParticle());
    }
  }

  /**
   * Create an empty particle for pooling
   */
  private createEmptyParticle(): BubbleParticle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      opacity: 0,
      life: 0,
      maxLife: 0,
      color: '',
      type: 'ambient',
      scale: 1,
      rotation: 0,
      vRotation: 0,
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Track mouse position for interactive effects
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    // Track mouse leave to stop interactive effects
    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = -1;
      this.mouseY = -1;
    });
  }

  /**
   * Get a pooled particle
   */
  private getPooledParticle(): BubbleParticle | null {
    return this.particlePool.find(p => p.life <= 0) || null;
  }

  /**
   * Spawn a currency bubble
   */
  public spawnCurrencyBubble(x: number, y: number, value: string): void {
    if (this.config.performanceMode === 'low') return;

    const particle = this.getPooledParticle();
    if (!particle) return;

    particle.x = x;
    particle.y = y;
    particle.vx = (Math.random() - 0.5) * 2;
    particle.vy = -Math.random() * 3 - 1;
    particle.size = Math.random() * 8 + 12;
    particle.opacity = 1;
    particle.life = 0;
    particle.maxLife = 2000; // 2 seconds
    particle.color = '#00d97f';
    particle.type = 'currency';
    particle.text = value;
    particle.scale = 1;
    particle.rotation = 0;
    particle.vRotation = (Math.random() - 0.5) * 0.1;

    this.particles.push(particle);
  }

  /**
   * Spawn a celebration bubble
   */
  public spawnCelebrationBubble(x: number, y: number, _type: string): void {
    if (this.config.performanceMode === 'low') return;

    const particle = this.getPooledParticle();
    if (!particle) return;

    particle.x = x;
    particle.y = y;
    particle.vx = (Math.random() - 0.5) * 4;
    particle.vy = -Math.random() * 4 - 2;
    particle.size = Math.random() * 12 + 8;
    particle.opacity = 1;
    particle.life = 0;
    particle.maxLife = 3000; // 3 seconds
    particle.color =
      this.config.bubbleColors[Math.floor(Math.random() * this.config.bubbleColors.length)] || '#ffffff';
    particle.type = 'celebration';
    particle.text = '✨';
    particle.scale = 1;
    particle.rotation = 0;
    particle.vRotation = (Math.random() - 0.5) * 0.2;

    this.particles.push(particle);
  }

  /**
   * Spawn ambient bubbles
   */
  public spawnAmbientBubbles(): void {
    if (this.config.performanceMode === 'low') return;

    const maxAmbient = this.getMaxAmbientParticles();
    const currentAmbient = this.particles.filter(p => p.type === 'ambient').length;

    if (currentAmbient >= maxAmbient) return;

    const particle = this.getPooledParticle();
    if (!particle) return;

    particle.x = Math.random() * this.canvas.width;
    particle.y = this.canvas.height + 10;
    particle.vx = (Math.random() - 0.5) * 0.5;
    particle.vy = -Math.random() * 1 - 0.5;
    particle.size = Math.random() * 6 + 4;
    particle.opacity = Math.random() * 0.5 + 0.2;
    particle.life = 0;
    particle.maxLife = Math.random() * 3000 + 2000;
    particle.color =
      this.config.bubbleColors[Math.floor(Math.random() * this.config.bubbleColors.length)] || '#ffffff';
    particle.type = 'ambient';
    particle.scale = 1;
    particle.rotation = 0;
    particle.vRotation = (Math.random() - 0.5) * 0.05;

    this.particles.push(particle);
  }

  /**
   * Get maximum ambient particles based on performance mode
   */
  private getMaxAmbientParticles(): number {
    switch (this.config.performanceMode) {
      case 'high':
        return 20;
      case 'medium':
        return 12;
      case 'low':
        return 5;
      default:
        return 10;
    }
  }

  /**
   * Start the particle system
   */
  public start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.lastSpawnTime = Date.now();
    this.animate();

    // Spawn ambient bubbles periodically
    this.startAmbientSpawning();

    logger.info('BubbleParticleSystem started');
  }

  /**
   * Stop the particle system
   */
  public stop(): void {
    this.isActive = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Clear all particles
    this.particles = [];

    logger.info('BubbleParticleSystem stopped');
  }

  /**
   * Start ambient particle spawning
   */
  private startAmbientSpawning(): void {
    const spawnAmbient = () => {
      if (!this.isActive) return;

      const now = Date.now();
      if (now - this.lastSpawnTime >= this.config.spawnRate) {
        if (Math.random() < 0.3) {
          // 30% chance to spawn
          this.spawnAmbientBubbles();
        }
        this.lastSpawnTime = now;
      }

      setTimeout(spawnAmbient, 100);
    };

    spawnAmbient();
  }

  /**
   * Main animation loop
   */
  private animate(): void {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      if (particle) {
        this.updateParticle(particle);
        this.drawParticle(particle);

        if (particle.life >= particle.maxLife) {
          this.particles.splice(i, 1);
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Update particle physics
   */
  private updateParticle(particle: BubbleParticle): void {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life += 16; // Assuming 60fps

    // Apply gravity
    particle.vy += this.config.gravity;

    // Apply wind
    particle.vx += this.config.wind;

    // Update rotation
    particle.rotation += particle.vRotation;

    // Fade out over time
    particle.opacity = 1 - particle.life / particle.maxLife;

    // Add some randomness to movement for ambient particles
    if (particle.type === 'ambient') {
      particle.vx += (Math.random() - 0.5) * 0.01;
    }

    // Interactive effects with mouse
    if (this.mouseX >= 0 && this.mouseY >= 0) {
      const dx = this.mouseX - particle.x;
      const dy = this.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.02;
        particle.vy += (dy / distance) * force * 0.02;
      }
    }
  }

  /**
   * Draw a particle
   */
  private drawParticle(particle: BubbleParticle): void {
    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation);
    this.ctx.scale(particle.scale, particle.scale);

    // Draw bubble with gradient
    const gradient = this.ctx.createRadialGradient(
      -particle.size * 0.3,
      -particle.size * 0.3,
      0,
      0,
      0,
      particle.size
    );

    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.7, particle.color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    this.ctx.fill();

    // Add highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.beginPath();
    this.ctx.arc(-particle.size * 0.3, -particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw text for currency and celebration particles
    if (particle.text) {
      this.ctx.fillStyle = '#000000';
      this.ctx.font = `${particle.size * 0.8}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(particle.text, 0, 0);
    }

    this.ctx.restore();
  }

  /**
   * Set performance mode
   */
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode;

    // Adjust max particles based on performance mode
    switch (mode) {
      case 'high':
        this.config.maxParticles = 50;
        this.config.spawnRate = 1000;
        break;
      case 'medium':
        this.config.maxParticles = 30;
        this.config.spawnRate = 1500;
        break;
      case 'low':
        this.config.maxParticles = 15;
        this.config.spawnRate = 2000;
        break;
    }

    // Clear excess particles
    if (this.particles.length > this.config.maxParticles) {
      this.particles = this.particles.slice(0, this.config.maxParticles);
    }
  }

  /**
   * Set particle density
   */
  public setDensity(density: number): void {
    this.config.maxParticles = Math.floor(50 * density);
    this.config.spawnRate = Math.floor(1000 / density);
  }

  /**
   * Get current particle count
   */
  public getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Get particle system status
   */
  public getStatus(): {
    active: boolean;
    particleCount: number;
    maxParticles: number;
    performanceMode: string;
  } {
    return {
      active: this.isActive,
      particleCount: this.particles.length,
      maxParticles: this.config.maxParticles,
      performanceMode: this.config.performanceMode,
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stop();
    this.particles = [];
    this.particlePool = [];

    // Remove event listeners
    window.removeEventListener('resize', this.setupCanvas);
  }
}
