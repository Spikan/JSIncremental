// Soda Drinker Pro Header Service: Low-poly, surreal aesthetic
// Matches the actual Soda Drinker Pro game's visual style
// Integrates with level themes and preserves level functionality

import { logger } from './logger';
import { useGameStore } from '../core/state/zustand-store';
import { performanceMonitor } from './performance';
import type { HybridLevel } from '../core/systems/hybrid-level-system';

export interface SodaDrinkerHeaderConfig {
  enabled: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  animationIntensity: number;
  respectReducedMotion: boolean;
  levelThemeIntegration: boolean;
}

export interface LevelThemeColors {
  primary: string;
  accent: string;
  background: string;
  particles: string[];
}

export class SodaDrinkerHeaderService {
  private static instance: SodaDrinkerHeaderService;
  private config: SodaDrinkerHeaderConfig;
  private isInitialized: boolean = false;
  private animationId: number | null = null;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private currentFPS: number = 60;
  private currentLevel: HybridLevel | null = null;
  private levelSystem: any = null;

  constructor() {
    this.config = {
      enabled: true,
      performanceMode: 'high',
      animationIntensity: 1.0,
      respectReducedMotion: true,
      levelThemeIntegration: true,
    };

    this.setupAccessibility();

    // Reference unused methods to prevent TypeScript warnings
    this.toggleLevelDropdown = this.toggleLevelDropdown.bind(this);
    this.unlockNextLevel = this.unlockNextLevel.bind(this);
  }

  public static getInstance(): SodaDrinkerHeaderService {
    if (!SodaDrinkerHeaderService.instance) {
      SodaDrinkerHeaderService.instance = new SodaDrinkerHeaderService();
    }
    return SodaDrinkerHeaderService.instance;
  }

  /**
   * Initialize the Soda Drinker Pro header service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('SodaDrinkerHeaderService already initialized');
      return;
    }

    try {
      logger.info('Initializing SodaDrinkerHeaderService...');

      // Check if we should enable effects
      if (!this.shouldEnableEffects()) {
        logger.info(
          'SodaDrinkerHeaderService disabled due to accessibility or performance settings'
        );
        return;
      }

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Hook into existing systems
      this.hookIntoExistingSystems();

      // Setup polygon animations
      this.setupPolygonAnimations();

      // Setup level integration (delayed to ensure hybrid system is loaded)
      this.setupLevelIntegrationWithRetry();

      // Setup level dropdown functionality
      this.setupLevelDropdown();

      // Setup periodic requirements update
      this.setupRequirementsUpdate();

      this.isInitialized = true;
      logger.info('SodaDrinkerHeaderService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SodaDrinkerHeaderService:', error);
      throw error;
    }
  }

  /**
   * Check if effects should be enabled based on accessibility and performance
   */
  private shouldEnableEffects(): boolean {
    // Check reduced motion preference
    if (
      this.config.respectReducedMotion &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return false;
    }

    // Check if we're in a low-performance environment
    if (performanceMonitor) {
      const score = performanceMonitor.getPerformanceScore();
      if (score < 40) {
        return false;
      }
    }

    return this.config.enabled;
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!performanceMonitor) return;

    // Monitor performance every 5 seconds
    setInterval(() => {
      this.checkPerformanceAndAdjust();
    }, 5000);

    // Monitor frame rate
    this.startFrameRateMonitoring();
  }

  /**
   * Start frame rate monitoring
   */
  private startFrameRateMonitoring(): void {
    const measureFrameRate = (currentTime: number) => {
      this.frameCount++;

      if (currentTime - this.lastFrameTime >= 1000) {
        this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));

        // Adjust performance mode based on FPS
        if (this.currentFPS < 30) {
          this.setPerformanceMode('low');
        } else if (this.currentFPS < 45) {
          this.setPerformanceMode('medium');
        } else if (this.currentFPS >= 55) {
          this.setPerformanceMode('high');
        }

        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }

      this.animationId = requestAnimationFrame(measureFrameRate);
    };

    this.animationId = requestAnimationFrame(measureFrameRate);
  }

  /**
   * Check performance and adjust settings accordingly
   */
  private checkPerformanceAndAdjust(): void {
    if (!performanceMonitor) return;

    const score = performanceMonitor.getPerformanceScore();
    const memoryUsage = performanceMonitor.getMemoryUsage();

    // Adjust based on performance score
    if (score < 60) {
      this.setPerformanceMode('low');
    } else if (score < 80) {
      this.setPerformanceMode('medium');
    } else {
      this.setPerformanceMode('high');
    }

    // Adjust based on memory usage
    if (memoryUsage) {
      const usedMB = memoryUsage.usedJSHeapSize / 1024 / 1024;
      if (usedMB > 150) {
        this.setPerformanceMode('low');
      } else if (usedMB > 100) {
        this.setPerformanceMode('medium');
      }
    }
  }

  /**
   * Setup accessibility features
   */
  private setupAccessibility(): void {
    // Listen for changes in motion preference
    if (window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      motionQuery.addEventListener('change', e => {
        this.config.respectReducedMotion = true;
        this.setEnabled(!e.matches);
        logger.info('Motion preference changed, effects:', !e.matches);
      });
    }
  }

  /**
   * Setup block animations
   */
  private setupPolygonAnimations(): void {
    // Add subtle hover effects to block elements
    const blocks = document.querySelectorAll(
      '.polygon-shape, .level-polygon, .currency-polygon-main, .stat-polygon, .control-polygon, .upgrade-polygon, .level-switch-polygon, .level-unlock-polygon'
    );

    blocks.forEach(block => {
      block.addEventListener('mouseenter', () => {
        this.onBlockHover(block as HTMLElement);
      });

      block.addEventListener('mouseleave', () => {
        this.onBlockLeave(block as HTMLElement);
      });
    });
  }

  /**
   * Setup level integration with retry mechanism
   */
  private setupLevelIntegrationWithRetry(): void {
    if (!this.config.levelThemeIntegration) return;

    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 200;

    const trySetup = () => {
      const w = window as any;
      if (w.App?.systems?.hybridLevel) {
        this.levelSystem = w.App.systems.hybridLevel;
        this.continueLevelIntegration();
        return;
      }

      retryCount++;
      if (retryCount < maxRetries) {
        setTimeout(trySetup, retryDelay);
      } else {
        logger.warn('Level system not available after retries, level theme integration disabled');
      }
    };

    trySetup();
  }

  /**
   * Continue level integration after system is loaded
   */
  private continueLevelIntegration(): void {
    if (!this.levelSystem) {
      logger.warn('Level system not available, level theme integration disabled');
      return;
    }

    // Get current level
    this.currentLevel = this.levelSystem.getCurrentLevel();

    // Apply current level theme
    if (this.currentLevel) {
      this.applyLevelTheme(this.currentLevel);
    }

    // Update unlock requirements
    this.updateUnlockRequirements();

    // Listen for level changes
    this.setupLevelChangeListener();

    logger.info('Level integration setup complete');
  }

  /**
   * Setup level change listener
   */
  private setupLevelChangeListener(): void {
    if (!this.levelSystem) return;

    // Hook into the level system's switchToLevel method (the main method used for level changes)
    const originalSwitchToLevel = this.levelSystem.switchToLevel;
    if (originalSwitchToLevel) {
      this.levelSystem.switchToLevel = (levelId: number) => {
        const result = originalSwitchToLevel.call(this.levelSystem, levelId);

        if (result) {
          // Update our current level and apply theme
          this.currentLevel = this.levelSystem.getCurrentLevel();
          if (this.currentLevel) {
            this.applyLevelTheme(this.currentLevel);
          }
          this.updateUnlockRequirements();
          this.updateSettingsCurrentLevel();
          this.updateSettingsRequirements();
        }

        return result;
      };
    }

    // Note: setCurrentLevel doesn't exist in hybrid level system, only switchToLevel
  }

  /**
   * Apply level theme to header
   */
  private applyLevelTheme(level: HybridLevel): void {
    if (!this.config.levelThemeIntegration) return;

    const header = document.getElementById('sodaDrinkerHeader');
    if (!header) return;

    // Update CSS custom properties for level theme
    const root = document.documentElement;

    // Set the CSS variables that are actually used by the stylesheets
    root.style.setProperty('--primary-blue', level.visualTheme.backgroundColor);
    root.style.setProperty('--primary-green', level.visualTheme.accentColor);
    root.style.setProperty(
      '--primary-blue-dark',
      this.darkenColor(level.visualTheme.backgroundColor, 0.2)
    );
    root.style.setProperty(
      '--primary-green-light',
      this.lightenColor(level.visualTheme.accentColor, 0.3)
    );
    root.style.setProperty('--neutral-white', '#ffffff');
    root.style.setProperty(
      '--neutral-dark',
      this.darkenColor(level.visualTheme.backgroundColor, 0.4)
    );
    root.style.setProperty(
      '--neutral-medium',
      this.darkenColor(level.visualTheme.backgroundColor, 0.2)
    );
    root.style.setProperty(
      '--neutral-light',
      this.lightenColor(level.visualTheme.backgroundColor, 0.3)
    );

    // Also set the SDP-specific variables for compatibility
    root.style.setProperty('--sdp-primary', level.visualTheme.backgroundColor);
    root.style.setProperty('--sdp-accent', level.visualTheme.accentColor);

    if (level.visualTheme.backgroundImage) {
      root.style.setProperty('--sdp-background', level.visualTheme.backgroundImage);
    } else {
      root.style.setProperty('--sdp-background', level.visualTheme.backgroundColor);
    }

    // Force body background with !important to override CSS
    document.body.style.setProperty(
      'background',
      level.visualTheme.backgroundImage || level.visualTheme.backgroundColor,
      'important'
    );
    document.body.style.setProperty(
      'background-color',
      level.visualTheme.backgroundColor,
      'important'
    );
    document.body.style.setProperty('background-attachment', 'fixed', 'important');

    // Update level name in header
    const levelNameElement = document.getElementById('currentLevelName');
    if (levelNameElement) {
      levelNameElement.textContent = level.name.toUpperCase();
    }

    // Update level number
    const levelNumberElement = document.getElementById('levelNumber');
    if (levelNumberElement) {
      levelNumberElement.textContent = level.id.toString();
    }

    // Add level-specific particles to background
    this.updateLevelParticles(level);

    // Add level-specific class to header for additional styling
    header.className = `soda-drinker-header level-${level.id} performance-${this.config.performanceMode}`;

    logger.info(`Applied level theme: ${level.name} (Level ${level.id})`);
  }

  /**
   * Darken a color by a percentage
   */
  private darkenColor(color: string, amount: number): string {
    // Simple color darkening - convert hex to RGB, darken, convert back
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  /**
   * Lighten a color by a percentage
   */
  private lightenColor(color: string, amount: number): string {
    // Simple color lightening - convert hex to RGB, lighten, convert back
    const hex = color.replace('#', '');
    const r = Math.min(
      255,
      parseInt(hex.substr(0, 2), 16) + (255 - parseInt(hex.substr(0, 2), 16)) * amount
    );
    const g = Math.min(
      255,
      parseInt(hex.substr(2, 2), 16) + (255 - parseInt(hex.substr(2, 2), 16)) * amount
    );
    const b = Math.min(
      255,
      parseInt(hex.substr(4, 2), 16) + (255 - parseInt(hex.substr(4, 2), 16)) * amount
    );
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  /**
   * Update level particles
   */
  private updateLevelParticles(level: HybridLevel): void {
    if (!level.visualTheme.particles || level.visualTheme.particles.length === 0) return;

    // Remove existing particles
    const existingParticles = document.querySelectorAll('.level-particle');
    existingParticles.forEach(particle => particle.remove());

    // Add new particles
    const header = document.getElementById('sodaDrinkerHeader');
    if (!header) return;

    level.visualTheme.particles.forEach((particle, index) => {
      const particleElement = document.createElement('div');
      particleElement.className = 'level-particle';
      particleElement.textContent = particle;
      particleElement.style.cssText = `
        position: absolute;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        font-size: 1.5rem;
        opacity: 0.3;
        pointer-events: none;
        z-index: 2;
        animation: particleFloat ${3 + Math.random() * 2}s ease-in-out infinite;
        animation-delay: ${index * 0.5}s;
      `;

      header.appendChild(particleElement);
    });
  }

  /**
   * Get current level information
   */
  public getCurrentLevelInfo(): {
    level: HybridLevel | null;
    theme: LevelThemeColors | null;
  } {
    if (!this.currentLevel) {
      return { level: null, theme: null };
    }

    const theme: LevelThemeColors = {
      primary: this.currentLevel.visualTheme.backgroundColor,
      accent: this.currentLevel.visualTheme.accentColor,
      background:
        this.currentLevel.visualTheme.backgroundImage ||
        this.currentLevel.visualTheme.backgroundColor,
      particles: this.currentLevel.visualTheme.particles || [],
    };

    return {
      level: this.currentLevel,
      theme: theme,
    };
  }

  /**
   * Force level theme refresh
   */
  public refreshLevelTheme(): void {
    if (!this.levelSystem) return;

    this.currentLevel = this.levelSystem.getCurrentLevel();
    if (this.currentLevel) {
      this.applyLevelTheme(this.currentLevel);
    }
    this.updateUnlockRequirements();
  }

  /**
   * Update unlock requirements display
   */
  private updateUnlockRequirements(): void {
    if (!this.levelSystem) return;

    const currentLevelId = this.levelSystem.getCurrentLevelId();
    const nextLevelId = currentLevelId + 1;
    const nextLevel = this.levelSystem
      .getAllLevels()
      .find((level: any) => level.id === nextLevelId);

    const requirementsElement = document.getElementById('unlockRequirements');
    if (!requirementsElement) return;

    if (nextLevel) {
      const requirements = nextLevel.unlockRequirement;
      // Modernized - state handled by store
      const state = useGameStore.getState();
      const currentSips = state.sips || 0;
      const currentClicks = state.totalClicks || 0;
      // const currentLevel = state.level || 1; // Removed unused variable

      // Check individual requirements
      const sipsMet = currentSips >= requirements.sips;
      const clicksMet = currentClicks >= requirements.clicks;

      const canUnlock = sipsMet && clicksMet;

      if (canUnlock) {
        requirementsElement.innerHTML = `
          <div class="requirement-text clickable" style="color: #00ff88; cursor: pointer; text-decoration: underline;" data-action="switchToNextLevel">
            ✅ Next level unlocked! Click to switch.
          </div>
        `;

        // Add click handler for switching to next level
        const clickableElement = requirementsElement.querySelector('.clickable');
        if (clickableElement) {
          clickableElement.addEventListener('click', () => {
            console.log('🎮 Switching to next level from header');
            this.switchToLevel(nextLevelId);
          });
        }
      } else {
        requirementsElement.innerHTML = `
          <div class="requirement-text">
            Next: <span class="requirement-sips ${sipsMet ? '' : 'missing'}">${requirements.sips} sips</span>, 
            <span class="requirement-clicks ${clicksMet ? '' : 'missing'}">${requirements.clicks} clicks</span>
          </div>
        `;
      }
    } else {
      requirementsElement.innerHTML = `
        <div class="requirement-text" style="color: #666">
          All levels unlocked!
        </div>
      `;
    }
  }

  /**
   * Setup periodic requirements update
   */
  private setupRequirementsUpdate(): void {
    // Update requirements every 5 seconds to reflect current progress
    setInterval(() => {
      this.updateUnlockRequirements();
    }, 5000);
  }

  /**
   * Setup level dropdown functionality
   */
  public setupLevelDropdown(): void {
    // Setup settings level selector
    this.setupSettingsLevelSelector();
  }

  /**
   * Setup settings level selector
   */
  private setupSettingsLevelSelector(): void {
    console.log('🔧 Setting up settings level selector...');
    const levelList = document.getElementById('settingsLevelList');
    const currentLevelName = document.getElementById('settingsCurrentLevelName');
    const currentLevelNumber = document.getElementById('settingsCurrentLevelNumber');
    const levelRequirements = document.getElementById('settingsLevelRequirements');

    if (!levelList || !currentLevelName || !currentLevelNumber || !levelRequirements) {
      console.warn('❌ Required elements not found for level selector');
      return;
    }

    console.log('✅ All elements found, populating level list...');
    // Populate level list
    this.populateSettingsLevelList();

    // Update current level display
    this.updateSettingsCurrentLevel();

    // Update requirements display
    this.updateSettingsRequirements();
  }

  /**
   * Populate settings level list
   */
  private populateSettingsLevelList(): void {
    const levelList = document.getElementById('settingsLevelList');
    if (!levelList) {
      console.warn('❌ Level list element not found');
      return;
    }

    if (!this.levelSystem) {
      console.warn('❌ Level system not available, trying to get it...');
      // Try to get the level system again
      const w = window as any;
      if (w.App?.systems?.hybridLevel) {
        this.levelSystem = w.App.systems.hybridLevel;
        console.log('✅ Level system found and set');
      } else {
        console.warn('❌ Level system still not available');
        return;
      }
    }

    // Clear existing items
    levelList.innerHTML = '';

    // Get all levels
    const allLevels = this.levelSystem.getAllLevels();
    const currentLevelId = this.levelSystem.getCurrentLevelId();

    // Add all levels to list
    allLevels.forEach((level: any) => {
      const item = document.createElement('div');
      const isUnlocked = this.levelSystem.isLevelUnlocked(level.id);
      const isCurrent = level.id === currentLevelId;
      const canUnlock = this.canUnlockLevel(level.id);
      const canSwitch = isUnlocked || canUnlock;

      item.className = `level-item ${isCurrent ? 'current' : ''} ${!canSwitch ? 'locked' : ''} ${canUnlock && !isUnlocked ? 'ready-to-unlock' : ''}`;
      item.innerHTML = `
        <div class="level-item-name">${level.name}</div>
        <div class="level-item-number">Level ${level.id}</div>
        <div class="level-item-requirements">
          ${
            isUnlocked
              ? 'Unlocked'
              : canUnlock
                ? '✅ Ready to unlock!'
                : `${level.unlockRequirement.sips} sips, ${level.unlockRequirement.clicks} clicks`
          }
        </div>
      `;

      if (canSwitch) {
        item.addEventListener('click', () => {
          console.log(
            '🎮 Level item clicked:',
            level.id,
            level.name,
            'unlocked:',
            isUnlocked,
            'canUnlock:',
            canUnlock
          );

          // If not unlocked but can unlock, unlock it first
          if (!isUnlocked && canUnlock) {
            console.log('🔓 Unlocking level first:', level.id);
            this.levelSystem.unlockLevel(level.id);
          }

          this.switchToLevel(level.id);
          this.populateSettingsLevelList(); // Refresh the list
          this.updateSettingsCurrentLevel();
        });
      }

      levelList.appendChild(item);
    });
  }

  /**
   * Update settings current level display
   */
  private updateSettingsCurrentLevel(): void {
    const currentLevelName = document.getElementById('settingsCurrentLevelName');
    const currentLevelNumber = document.getElementById('settingsCurrentLevelNumber');

    if (!currentLevelName || !currentLevelNumber || !this.levelSystem) return;

    const currentLevel = this.levelSystem.getCurrentLevel();
    if (currentLevel) {
      currentLevelName.textContent = currentLevel.name;
      currentLevelNumber.textContent = currentLevel.id.toString();
    }
  }

  /**
   * Update settings requirements display
   */
  private updateSettingsRequirements(): void {
    const levelRequirements = document.getElementById('settingsLevelRequirements');
    if (!levelRequirements || !this.levelSystem) return;

    const currentLevelId = this.levelSystem.getCurrentLevelId();
    const nextLevelId = currentLevelId + 1;
    const nextLevel = this.levelSystem
      .getAllLevels()
      .find((level: any) => level.id === nextLevelId);

    if (nextLevel) {
      const requirements = nextLevel.unlockRequirement;
      // Modernized - state handled by store
      const state = useGameStore.getState();
      const currentSips = state.sips || 0;
      const currentClicks = state.totalClicks || 0;

      const sipsMet = currentSips >= requirements.sips;
      const clicksMet = currentClicks >= requirements.clicks;
      const canUnlock = sipsMet && clicksMet;

      levelRequirements.innerHTML = `
        <h5>Next Level: ${nextLevel.name}</h5>
        <p>Requirements: ${requirements.sips} sips, ${requirements.clicks} clicks</p>
        <p>Status: ${canUnlock ? '✅ Ready to unlock!' : '❌ Not yet met'}</p>
      `;
    } else {
      levelRequirements.innerHTML = `
        <h5>All Levels Unlocked!</h5>
        <p>You have unlocked all available levels.</p>
      `;
    }
  }

  /**
   * Toggle level dropdown
   */
  private toggleLevelDropdown(): void {
    const dropdown = document.getElementById('levelDropdown');
    if (!dropdown) return;

    const isVisible = dropdown.style.display !== 'none';

    if (isVisible) {
      dropdown.style.display = 'none';
    } else {
      // Position dropdown in center of screen
      dropdown.style.display = 'block';
      dropdown.style.top = '50%';
      dropdown.style.left = '50%';
      dropdown.style.transform = 'translate(-50%, -50%)';
      this.populateLevelDropdown();
    }
  }

  /**
   * Populate level dropdown with unlocked levels
   */
  private populateLevelDropdown(): void {
    const dropdown = document.getElementById('levelDropdown');
    if (!dropdown || !this.levelSystem) return;

    // Clear existing items
    dropdown.innerHTML = '';

    // Get all levels
    const allLevels = this.levelSystem.getAllLevels();
    const unlockedLevels = allLevels.filter((level: any) => level.isUnlocked);
    const currentLevelId = this.levelSystem.getCurrentLevelId();

    // Add unlocked levels to dropdown
    unlockedLevels.forEach((level: any) => {
      const item = document.createElement('div');
      item.className = `level-dropdown-item ${level.id === currentLevelId ? 'current' : ''}`;
      item.innerHTML = `
        <span class="level-number">${level.id}</span>
        <span class="level-name">${level.name}</span>
        <span class="level-status">${level.isCompleted ? '✓' : '○'}</span>
      `;

      item.addEventListener('click', () => {
        this.switchToLevel(level.id);
        dropdown.style.display = 'none';
      });

      dropdown.appendChild(item);
    });
  }

  /**
   * Switch to a specific level
   */
  private switchToLevel(levelId: number): void {
    if (!this.levelSystem) {
      console.warn('❌ Level system not available, trying to get it...');
      // Try to get the level system again
      const w = window as any;
      if (w.App?.systems?.hybridLevel) {
        this.levelSystem = w.App.systems.hybridLevel;
        console.log('✅ Level system found and set');
      } else {
        console.warn('❌ Level system still not available');
        return;
      }
    }

    try {
      console.log('🔄 Attempting to switch to level:', levelId);

      // Check if level is unlocked first
      const isUnlocked = this.levelSystem.isLevelUnlocked(levelId);
      console.log(`🔍 Level ${levelId} unlocked status:`, isUnlocked);

      // Check for unlocks first
      console.log('🔍 Checking for level unlocks...');
      console.log('🔍 Level system initialized:', this.levelSystem.isSystemInitialized);
      console.log(
        '🔍 Current unlocked levels:',
        Array.from(this.levelSystem.unlockedLevelsSet || new Set())
      );
      console.log('🔍 Current level:', this.levelSystem.currentLevel);

      const newlyUnlocked = this.levelSystem.checkForUnlocks();
      console.log('🔍 Newly unlocked levels:', newlyUnlocked);

      // Check if level can be unlocked
      const canUnlock = this.canUnlockLevel(levelId);
      console.log(`🔍 Level ${levelId} can unlock status:`, canUnlock);

      // Re-check if level is now unlocked after checkForUnlocks
      const isUnlockedAfterCheck = this.levelSystem.isLevelUnlocked(levelId);
      console.log(`🔍 Level ${levelId} unlocked status after check:`, isUnlockedAfterCheck);

      const success = this.levelSystem.switchToLevel(levelId);
      if (success) {
        console.log('✅ Successfully switched to level:', levelId);
        logger.info(`Switched to level ${levelId}`);
        // Refresh the settings display
        this.populateSettingsLevelList();
        this.updateSettingsCurrentLevel();
        this.updateSettingsRequirements();
      } else {
        console.warn('❌ Failed to switch to level:', levelId, '- level may not be unlocked');
        logger.warn(`Failed to switch to level ${levelId} - level may not be unlocked`);
      }
    } catch (error) {
      console.error('❌ Error switching to level:', levelId, error);
      logger.error(`Failed to switch to level ${levelId}:`, error);
    }
  }

  /**
   * Unlock next level
   */
  private unlockNextLevel(): void {
    if (!this.levelSystem) return;

    try {
      const currentLevelId = this.levelSystem.getCurrentLevelId();
      const nextLevelId = currentLevelId + 1;

      // Check if player meets requirements
      if (!this.canUnlockLevel(nextLevelId)) {
        logger.warn(`Cannot unlock level ${nextLevelId} - requirements not met`);
        return;
      }

      const success = this.levelSystem.unlockLevel(nextLevelId);
      if (success) {
        logger.info(`Unlocked level ${nextLevelId}`);
        this.populateLevelDropdown();
        this.updateUnlockRequirements();
      } else {
        logger.warn(`Failed to unlock level ${nextLevelId}`);
      }
    } catch (error) {
      logger.error('Failed to unlock next level:', error);
    }
  }

  /**
   * Get level unlock requirements
   */
  public getLevelUnlockRequirements(levelId: number): {
    sips: number;
    clicks: number;
    level: number;
  } | null {
    if (!this.levelSystem) return null;

    const level = this.levelSystem.getAllLevels().find((l: any) => l.id === levelId);
    return level?.unlockRequirement || null;
  }

  /**
   * Check if level can be unlocked
   */
  public canUnlockLevel(levelId: number): boolean {
    if (!this.levelSystem) {
      console.warn('❌ Level system not available for canUnlockLevel check');
      return false;
    }

    const requirements = this.getLevelUnlockRequirements(levelId);
    if (!requirements) {
      console.warn('❌ No requirements found for level:', levelId);
      return false;
    }

    // Check if player meets requirements
    // Modernized - state handled by store
    const state = useGameStore.getState();
    const currentSips = state.sips || 0;
    const currentClicks = state.totalClicks || 0;

    const sipsMet = currentSips >= requirements.sips;
    const clicksMet = currentClicks >= requirements.clicks;

    console.log(`🔍 Level ${levelId} unlock check:`, {
      requirements,
      currentSips,
      currentClicks,
      sipsMet,
      clicksMet,
      canUnlock: sipsMet && clicksMet,
    });

    return sipsMet && clicksMet;
  }

  /**
   * Handle block hover effects
   */
  private onBlockHover(element: HTMLElement): void {
    if (this.config.performanceMode === 'low') return;

    element.style.transform = 'scale(1.05) translateY(-2px)';
    element.style.transition = 'all 0.3s ease';
  }

  /**
   * Handle block leave effects
   */
  private onBlockLeave(element: HTMLElement): void {
    element.style.transform = 'scale(1) translateY(0px)';
  }

  /**
   * Hook into existing game systems
   */
  private hookIntoExistingSystems(): void {
    // Hook into display updates
    this.hookIntoDisplayUpdates();

    // Hook into click handlers
    this.hookIntoClickHandlers();

    // Hook into purchase handlers
    this.hookIntoPurchaseHandlers();
  }

  /**
   * Hook into existing display update system
   */
  private hookIntoDisplayUpdates(): void {
    // Modernized - UI updates are now handled by the store system
    // This method is kept for potential future hooking needs
    logger.debug('Display updates are handled by the store system');
  }

  /**
   * Hook into existing click handlers
   */
  private hookIntoClickHandlers(): void {
    // Modernized - clicks system is now handled by the store system
    // This method is kept for potential future hooking needs
    logger.debug('Click handlers are handled by the store system');
  }

  /**
   * Hook into existing purchase handlers
   */
  private hookIntoPurchaseHandlers(): void {
    // Modernized - purchase system is now handled by the store system
    // This method is kept for potential future hooking needs
    logger.debug('Purchase handlers are handled by the store system');
  }

  /**
   * Set performance mode
   */
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode;

    // Update header class for CSS adjustments
    const header = document.getElementById('sodaDrinkerHeader');
    if (header) {
      header.className = `soda-drinker-header performance-${mode}`;
    }

    logger.info(`Performance mode set to: ${mode}`);
  }

  /**
   * Set enabled state
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;

    if (enabled && this.isInitialized) {
      this.start();
    } else {
      this.stop();
    }

    logger.info(`SodaDrinkerHeaderService enabled: ${enabled}`);
  }

  /**
   * Start all effects
   */
  public start(): void {
    if (!this.isInitialized) {
      logger.warn('SodaDrinkerHeaderService not initialized, cannot start');
      return;
    }

    // Effects are handled by CSS animations
    logger.info('SodaDrinkerHeaderService started');
  }

  /**
   * Stop all effects
   */
  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    logger.info('SodaDrinkerHeaderService stopped');
  }

  /**
   * Get current configuration
   */
  public getConfig(): SodaDrinkerHeaderConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<SodaDrinkerHeaderConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Apply changes
    if (newConfig.performanceMode) {
      this.setPerformanceMode(newConfig.performanceMode);
    }

    if (newConfig.enabled !== undefined) {
      this.setEnabled(newConfig.enabled);
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    fps: number;
    memoryUsage: number | null;
  } {
    const memoryUsage = performanceMonitor?.getMemoryUsage();

    return {
      fps: this.currentFPS,
      memoryUsage: memoryUsage ? memoryUsage.usedJSHeapSize / 1024 / 1024 : null,
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stop();
    this.isInitialized = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    logger.info('SodaDrinkerHeaderService cleaned up');
  }
}

// Export singleton instance
export const sodaDrinkerHeaderService = SodaDrinkerHeaderService.getInstance();

// Export for legacy window access
if (typeof window !== 'undefined') {
  (window as any).sodaDrinkerHeaderService = sodaDrinkerHeaderService;
}
