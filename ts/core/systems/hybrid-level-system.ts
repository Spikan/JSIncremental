// Hybrid Level System - Combines SDP authentic levels with incremental mechanics
// Integrates 100+ real Soda Drinker Pro levels with our progression system

export interface HybridLevel {
  id: number;
  name: string;
  description: string;
  category: 'main' | 'bonus' | 'historical' | 'vivian' | 'special';
  unlockRequirement: {
    sips: number;
    clicks: number;
    level?: number; // Required level in our system
  };
  bonuses: {
    sipMultiplier: number;
    clickMultiplier: number;
    specialEffect?: string;
  };
  visualTheme: {
    backgroundColor: string;
    accentColor: string;
    backgroundImage?: string;
    particles?: string[];
  };
  // Audio removed to keep bundle size manageable
  // audio: {
  //   trackName: string;
  //   fileName: string;
  // };
  isUnlocked: boolean;
  isCompleted: boolean;
}

// Main progression levels (1-100) based on SDP soundtrack
export const SODA_DRINKER_PRO_LEVELS: HybridLevel[] = [
  // Early Levels (1-10) - Easy unlock requirements
  {
    id: 1,
    name: 'The Beach',
    description: 'Sip soda by the seaside with waves crashing in the background',
    category: 'main',
    unlockRequirement: { sips: 0, clicks: 0, level: 1 },
    bonuses: { sipMultiplier: 1.0, clickMultiplier: 1.0 },
    visualTheme: {
      backgroundColor: '#87CEEB',
      accentColor: '#FFD700',
      backgroundImage: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
      particles: ['🌊', '🐚', '☀️'],
    },
    // audio: { trackName: "The Beach", fileName: "1 The Beach.mp3" },
    isUnlocked: true,
    isCompleted: false,
  },
  {
    id: 2,
    name: 'The Park',
    description: 'Enjoy nature while drinking soda among trees and benches',
    category: 'main',
    unlockRequirement: { sips: 100, clicks: 25, level: 1 },
    bonuses: { sipMultiplier: 1.1, clickMultiplier: 1.0 },
    visualTheme: {
      backgroundColor: '#90EE90',
      accentColor: '#228B22',
      backgroundImage: 'linear-gradient(135deg, #90EE90 0%, #32CD32 100%)',
      particles: ['🍃', '🐦', '🌸'],
    },
    // audio: { trackName: "The Park", fileName: "2 The Park.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 3,
    name: 'Weird Room',
    description: 'A strange, surreal space where reality bends',
    category: 'main',
    unlockRequirement: { sips: 250, clicks: 50, level: 2 },
    bonuses: { sipMultiplier: 1.2, clickMultiplier: 1.1 },
    visualTheme: {
      backgroundColor: '#DDA0DD',
      accentColor: '#8B008B',
      backgroundImage: 'linear-gradient(135deg, #DDA0DD 0%, #DA70D6 100%)',
      particles: ['🌀', '✨', '🔮'],
    },
    // audio: { trackName: "Weird Room", fileName: "3 Weird Room.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 4,
    name: 'in SPACE',
    description: 'Zero-gravity soda drinking among the stars',
    category: 'main',
    unlockRequirement: { sips: 500, clicks: 100, level: 3 },
    bonuses: { sipMultiplier: 1.5, clickMultiplier: 1.2, specialEffect: 'floating' },
    visualTheme: {
      backgroundColor: '#000080',
      accentColor: '#00FFFF',
      backgroundImage: 'linear-gradient(135deg, #000080 0%, #191970 100%)',
      particles: ['⭐', '🌟', '💫', '🛸'],
    },
    // audio: { trackName: "in SPACE", fileName: "4 in SPACE.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 5,
    name: 'In a Castle',
    description: 'Medieval soda drinking in a grand castle',
    category: 'main',
    unlockRequirement: { sips: 1000, clicks: 200, level: 4 },
    bonuses: { sipMultiplier: 1.3, clickMultiplier: 1.1 },
    visualTheme: {
      backgroundColor: '#8B4513',
      accentColor: '#FFD700',
      backgroundImage: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      particles: ['🏰', '⚔️', '👑'],
    },
    // audio: { trackName: "In a Castle", fileName: "5 In a Castle.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 6,
    name: 'Inside a Mouth',
    description: 'A surreal journey inside a giant mouth',
    category: 'main',
    unlockRequirement: { sips: 2000, clicks: 400, level: 5 },
    bonuses: { sipMultiplier: 1.4, clickMultiplier: 1.3 },
    visualTheme: {
      backgroundColor: '#FFB6C1',
      accentColor: '#FF69B4',
      backgroundImage: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)',
      particles: ['👄', '🦷', '👅'],
    },
    // audio: { trackName: "Inside a Mouth", fileName: "6 Inside a Mouth.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 7,
    name: 'Before a convention',
    description: 'Corporate soda drinking before a big event',
    category: 'main',
    unlockRequirement: { sips: 4000, clicks: 800, level: 6 },
    bonuses: { sipMultiplier: 1.2, clickMultiplier: 1.1 },
    visualTheme: {
      backgroundColor: '#708090',
      accentColor: '#FFD700',
      backgroundImage: 'linear-gradient(135deg, #708090 0%, #2F4F4F 100%)',
      particles: ['🏢', '💼', '📊'],
    },
    // audio: { trackName: "Before a convention", fileName: "7 Before a convention.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 8,
    name: 'Empty Pool',
    description: 'Soda drinking in an empty swimming pool',
    category: 'main',
    unlockRequirement: { sips: 8000, clicks: 1600, level: 7 },
    bonuses: { sipMultiplier: 1.3, clickMultiplier: 1.2 },
    visualTheme: {
      backgroundColor: '#00CED1',
      accentColor: '#FF69B4',
      backgroundImage: 'linear-gradient(135deg, #00CED1 0%, #20B2AA 100%)',
      particles: ['🏊', '💦', '🏊‍♀️'],
    },
    // audio: { trackName: "Empty Pool", fileName: "8 Empty Pool.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 9,
    name: 'Dark Woods',
    description: 'Mysterious forest with eerie atmosphere',
    category: 'main',
    unlockRequirement: { sips: 16000, clicks: 3200, level: 8 },
    bonuses: { sipMultiplier: 1.6, clickMultiplier: 1.4 },
    visualTheme: {
      backgroundColor: '#2F4F2F',
      accentColor: '#8B0000',
      backgroundImage: 'linear-gradient(135deg, #2F4F2F 0%, #000000 100%)',
      particles: ['🌲', '🦉', '👻'],
    },
    // audio: { trackName: "Dark Woods", fileName: "9 Dark Woods.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 10,
    name: 'County Fair',
    description: 'Carnival atmosphere with rides and games',
    category: 'main',
    unlockRequirement: { sips: 32000, clicks: 6400, level: 9 },
    bonuses: { sipMultiplier: 1.4, clickMultiplier: 1.3 },
    visualTheme: {
      backgroundColor: '#FF6347',
      accentColor: '#FFD700',
      backgroundImage: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
      particles: ['🎡', '🎪', '🎠'],
    },
    // audio: { trackName: "County Fair", fileName: "10 County Fair.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  // Continue with more levels...
  // I'll add more levels in the next part to keep this manageable
];

// Bonus levels (unlocked via achievements)
export const BONUS_LEVELS: HybridLevel[] = [
  {
    id: 101,
    name: 'An outdoor wedding',
    description: 'Celebrate with soda at a beautiful outdoor wedding',
    category: 'bonus',
    unlockRequirement: { sips: 100000, clicks: 20000, level: 10 },
    bonuses: { sipMultiplier: 2.0, clickMultiplier: 1.8 },
    visualTheme: {
      backgroundColor: '#FFB6C1',
      accentColor: '#FFD700',
      backgroundImage: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)',
      particles: ['💒', '💐', '💍'],
    },
    // audio: { trackName: "An outdoor wedding", fileName: "Bonus Levels - An outdoor wedding.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 102,
    name: 'Hall of faces',
    description: 'A surreal gallery of faces watching you drink',
    category: 'bonus',
    unlockRequirement: { sips: 200000, clicks: 40000, level: 15 },
    bonuses: { sipMultiplier: 2.5, clickMultiplier: 2.0 },
    visualTheme: {
      backgroundColor: '#2F2F2F',
      accentColor: '#00FF00',
      backgroundImage: 'linear-gradient(135deg, #2F2F2F 0%, #000000 100%)',
      particles: ['👥', '👤', '👁️'],
    },
    // audio: { trackName: "Hall of faces", fileName: "Bonus Levels - Hall of faces.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  // Add more bonus levels...
];

// Historical levels (time-travel themed)
export const HISTORICAL_LEVELS: HybridLevel[] = [
  {
    id: 201,
    name: 'in ancient times',
    description: 'Travel back to ancient civilizations',
    category: 'historical',
    unlockRequirement: { sips: 500000, clicks: 100000, level: 20 },
    bonuses: { sipMultiplier: 3.0, clickMultiplier: 2.5 },
    visualTheme: {
      backgroundColor: '#8B4513',
      accentColor: '#FFD700',
      backgroundImage: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      particles: ['🏺', '⚱️', '🏛️'],
    },
    // audio: { trackName: "in ancient times", fileName: "Sodas Through Time - in ancient times.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 202,
    name: 'The roaring 20s',
    description: 'Experience the jazz age with soda',
    category: 'historical',
    unlockRequirement: { sips: 1000000, clicks: 200000, level: 25 },
    bonuses: { sipMultiplier: 3.5, clickMultiplier: 3.0 },
    visualTheme: {
      backgroundColor: '#8B0000',
      accentColor: '#FFD700',
      backgroundImage: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)',
      particles: ['🎩', '🎷', '💃'],
    },
    // audio: { trackName: "The roaring 20s", fileName: "Sodas Through Time - The roaring 20s.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  // Add more historical levels...
];

// Vivian Clark levels (hidden game mode)
export const VIVIAN_CLARK_LEVELS: HybridLevel[] = [
  {
    id: 301,
    name: 'Vivian Clark Title',
    description: 'Enter the mysterious world of Vivian Clark',
    category: 'vivian',
    unlockRequirement: { sips: 10000000, clicks: 2000000, level: 30 },
    bonuses: { sipMultiplier: 5.0, clickMultiplier: 4.0, specialEffect: 'vivian_mode' },
    visualTheme: {
      backgroundColor: '#000000',
      accentColor: '#FF00FF',
      backgroundImage: 'linear-gradient(135deg, #000000 0%, #4B0082 100%)',
      particles: ['🌀', '✨', '🔮', '👻'],
    },
    // audio: { trackName: "Vivian Clark Title", fileName: "Vivian Clark Title Music.mp3" },
    isUnlocked: false,
    isCompleted: false,
  },
  // Add more Vivian Clark levels...
];

// Combined level system
export class HybridLevelSystem {
  private currentLevel: number = 1;
  private unlockedLevels: Set<number> = new Set([1]);
  private isInitialized: boolean = false;
  // private completedLevels: Set<number> = new Set(); // Future feature

  constructor() {
    console.log('🏗️ Initializing HybridLevelSystem...');
    this.loadUnlockedLevels();
    this.loadCurrentLevel();
    this.isInitialized = true;
    console.log('🏗️ HybridLevelSystem initialized:', {
      currentLevel: this.currentLevel,
      unlockedLevels: Array.from(this.unlockedLevels),
    });
  }

  getAllLevels(): HybridLevel[] {
    return [
      ...SODA_DRINKER_PRO_LEVELS,
      ...BONUS_LEVELS,
      ...HISTORICAL_LEVELS,
      ...VIVIAN_CLARK_LEVELS,
    ];
  }

  getCurrentLevel(): HybridLevel | null {
    return this.getAllLevels().find(level => level.id === this.currentLevel) || null;
  }

  isLevelUnlocked(levelId: number): boolean {
    return this.unlockedLevels.has(levelId);
  }

  getCurrentLevelId(): number {
    console.log('🔍 getCurrentLevelId called, returning:', this.currentLevel);
    return this.currentLevel;
  }

  getUnlockedLevelIds(): number[] {
    return Array.from(this.unlockedLevels);
  }

  // Method for save loader to restore state
  restoreState(currentLevel: number, unlockedLevels: number[]): void {
    console.log('🔄 Restoring hybrid level state:', { currentLevel, unlockedLevels });

    // Restore unlocked levels
    this.unlockedLevels = new Set(unlockedLevels);
    console.log('✅ Restored unlocked levels:', Array.from(this.unlockedLevels));

    // Restore current level (only if it's unlocked)
    if (this.unlockedLevels.has(currentLevel)) {
      this.currentLevel = currentLevel;
      console.log('✅ Restored current level:', this.currentLevel);

      // Apply theme for the restored level
      this.applyLevelTheme();
    } else {
      console.log('⚠️ Saved level not unlocked, defaulting to level 1');
      this.currentLevel = 1;
      this.applyLevelTheme();
    }
  }

  applyInitialTheme(): void {
    console.log('🎨 Applying initial theme from hybrid level system');
    this.applyLevelTheme();

    // Also update the level text display
    try {
      (window as any).App?.ui?.updateLevelText?.();
    } catch (error) {
      console.warn('Failed to update level text during initialization:', error);
    }
  }

  getUnlockedLevels(): HybridLevel[] {
    return this.getAllLevels().filter(level => this.unlockedLevels.has(level.id));
  }

  getNextUnlockableLevel(): HybridLevel | null {
    const allLevels = this.getAllLevels();
    const state = (window as any).App?.state?.getState?.() || {};
    const sips = state.sips || new Decimal(0);
    const clicks = state.totalClicks || 0;
    const currentLevelNum = state.level || 1;

    // Find the next level that can be unlocked
    for (const level of allLevels) {
      if (!this.unlockedLevels.has(level.id)) {
        const canUnlock =
          sips.gte(level.unlockRequirement.sips) &&
          clicks >= level.unlockRequirement.clicks &&
          currentLevelNum >= (level.unlockRequirement.level || 1);
        if (canUnlock) {
          return level;
        }
      }
    }

    // If no level can be unlocked, return the next locked level
    for (const level of allLevels) {
      if (!this.unlockedLevels.has(level.id)) {
        return level;
      }
    }

    return null;
  }

  canUnlockLevel(levelId: number): boolean {
    const level = this.getAllLevels().find(l => l.id === levelId);
    if (!level || this.unlockedLevels.has(levelId)) {
      console.log(`🔒 Level ${levelId} cannot be unlocked:`, {
        levelExists: !!level,
        alreadyUnlocked: this.unlockedLevels.has(levelId),
        unlockedLevels: Array.from(this.unlockedLevels),
      });
      return false;
    }

    const state = (window as any).App?.state?.getState?.() || {};
    const sips = state.sips || new Decimal(0);
    const clicks = state.totalClicks || 0;
    // Use hybrid system's current level instead of old system's level
    const currentHybridLevel = this.currentLevel;

    const sipsMet = sips.gte
      ? sips.gte(level.unlockRequirement.sips)
      : Number(sips) >= level.unlockRequirement.sips;
    const clicksMet = clicks >= level.unlockRequirement.clicks;
    const levelMet = currentHybridLevel >= (level.unlockRequirement.level || 1);

    console.log(`🔍 Checking unlock for level ${levelId}:`, {
      sips: sips.toString(),
      clicks,
      currentHybridLevel,
      requirements: level.unlockRequirement,
      sipsMet,
      clicksMet,
      levelMet,
      canUnlock: sipsMet && clicksMet && levelMet,
    });

    return sipsMet && clicksMet && levelMet;
  }

  unlockLevel(levelId: number, silent: boolean = false): boolean {
    if (!silent) {
      console.log(`🔓 Attempting to unlock level ${levelId}...`);
    }

    // For silent unlocks (like during save loading), just add to unlocked set
    if (silent) {
      this.unlockedLevels.add(levelId);
      this.saveUnlockedLevels();
      return true;
    }

    if (this.canUnlockLevel(levelId)) {
      console.log(`✅ Unlocking level ${levelId}`);
      this.unlockedLevels.add(levelId);
      this.saveUnlockedLevels();
      console.log(
        `✅ Level ${levelId} unlocked successfully! Unlocked levels:`,
        Array.from(this.unlockedLevels)
      );
      return true;
    }
    console.log(`❌ Failed to unlock level ${levelId}`);
    return false;
  }

  switchToLevel(levelId: number): boolean {
    console.log('🔄 switchToLevel called with levelId:', levelId);
    console.log('🔄 Current unlocked levels:', Array.from(this.unlockedLevels));

    if (this.unlockedLevels.has(levelId)) {
      console.log('✅ Level is unlocked, switching to:', levelId);
      this.currentLevel = levelId;
      this.saveCurrentLevel();

      console.log('🎨 Applying theme for level:', levelId);
      this.applyLevelTheme();

      // this.playLevelAudio(); // Audio removed
      return true;
    } else {
      console.log('❌ Level not unlocked:', levelId);
    }
    return false;
  }

  private applyLevelTheme(): void {
    const level = this.getCurrentLevel();
    if (!level) {
      console.log('🎨 No level found for theme application');
      return;
    }

    console.log('🎨 Applying theme for level:', level.id, level.name, level.visualTheme);
    console.log('🎨 Current body background before theme:', document.body.style.background);
    console.log('🎨 Current unlocked levels:', Array.from(this.unlockedLevels));

    // Apply visual theme
    const root = document.documentElement;
    root.style.setProperty('--level-bg-color', level.visualTheme.backgroundColor);
    root.style.setProperty('--level-accent-color', level.visualTheme.accentColor);

    if (level.visualTheme.backgroundImage) {
      root.style.setProperty('--level-bg-image', level.visualTheme.backgroundImage);
    }

    // Also apply background directly to body for immediate effect
    document.body.style.background =
      level.visualTheme.backgroundImage || level.visualTheme.backgroundColor;
    document.body.style.backgroundAttachment = 'fixed';

    console.log('🎨 Theme applied:', {
      backgroundColor: level.visualTheme.backgroundColor,
      backgroundImage: level.visualTheme.backgroundImage,
      bodyBackground: document.body.style.background,
    });

    // Add level-specific particles
    this.addLevelParticles(level);
  }

  // Audio integration removed to keep bundle size manageable
  // private playLevelAudio(): void {
  //   const level = this.getCurrentLevel();
  //   if (!level) return;
  //   // Audio functionality removed
  // }

  private addLevelParticles(level: HybridLevel): void {
    // Remove existing particles
    const existingParticles = document.querySelectorAll('.level-particle');
    existingParticles.forEach(p => p.remove());

    if (!level.visualTheme.particles) return;

    // Add new particles
    const particleContainer = document.createElement('div');
    particleContainer.className = 'level-particles';
    particleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;

    document.body.appendChild(particleContainer);

    // Create floating particles
    level.visualTheme.particles.forEach((particle, index) => {
      const particleEl = document.createElement('div');
      particleEl.className = 'level-particle';
      particleEl.textContent = particle;
      particleEl.style.cssText = `
        position: absolute;
        font-size: 20px;
        opacity: 0.3;
        animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${index * 0.5}s;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      particleContainer.appendChild(particleEl);
    });
  }

  private saveUnlockedLevels(): void {
    try {
      // Don't save here - let the main save system handle it
      // The main save system will call getUnlockedLevelIds() when saving
      console.log('💾 Hybrid system unlocked levels updated:', Array.from(this.unlockedLevels));
    } catch (error) {
      console.warn('Failed to update unlocked levels state:', error);
    }
  }

  private loadUnlockedLevels(): void {
    try {
      // Don't load from storage here - the main save system will handle loading
      // Just initialize with level 1 unlocked by default
      this.unlockedLevels = new Set([1]);
      console.log(
        '🏗️ Hybrid system initialized with default unlocked levels:',
        Array.from(this.unlockedLevels)
      );
    } catch (error) {
      console.warn('Failed to initialize unlocked levels:', error);
      this.unlockedLevels = new Set([1]);
    }
  }

  private loadCurrentLevel(): void {
    try {
      // Don't load from storage here - the main save system will handle loading
      // Just initialize with level 1 by default
      this.currentLevel = 1;
      console.log('🏗️ Hybrid system initialized with default current level:', this.currentLevel);
    } catch (error) {
      console.warn('Failed to initialize current level:', error);
      this.currentLevel = 1;
    }
  }

  private saveCurrentLevel(): void {
    try {
      // Don't save here - let the main save system handle it
      // The main save system will call getCurrentLevelId() when saving
      console.log('💾 Hybrid system current level updated:', this.currentLevel);
    } catch (error) {
      console.warn('Failed to update current level state:', error);
    }
  }

  // Check for new level unlocks
  checkForUnlocks(): number[] {
    console.log('🔍 checkForUnlocks called, isInitialized:', this.isInitialized);

    // Don't trigger notifications during initial load
    if (!this.isInitialized) {
      console.log('⏸️ Skipping unlock check during initialization');
      return [];
    }

    const newlyUnlocked: number[] = [];
    const state = (window as any).App?.state?.getState?.() || {};
    const sips = state.sips || new Decimal(0);
    const clicks = state.totalClicks || 0;
    // Use hybrid system's current level instead of old system's level
    const currentLevel = this.currentLevel;

    console.log('🔍 Checking unlocks with state:', { sips: sips.toString(), clicks, currentLevel });

    this.getAllLevels().forEach(level => {
      if (!this.unlockedLevels.has(level.id)) {
        const sipsMet = sips.gte
          ? sips.gte(level.unlockRequirement.sips)
          : Number(sips) >= level.unlockRequirement.sips;
        const clicksMet = clicks >= level.unlockRequirement.clicks;
        const levelMet = currentLevel >= (level.unlockRequirement.level || 1);

        if (sipsMet && clicksMet && levelMet) {
          console.log('🎉 Unlocking level:', level.id, level.name);
          this.unlockedLevels.add(level.id);
          newlyUnlocked.push(level.id);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      console.log('💾 Saving newly unlocked levels:', newlyUnlocked);
      this.saveUnlockedLevels();
    }

    return newlyUnlocked;
  }

  // Get level-specific bonuses
  getLevelBonuses(): { sipMultiplier: number; clickMultiplier: number; specialEffect?: string } {
    const level = this.getCurrentLevel();
    return level?.bonuses || { sipMultiplier: 1.0, clickMultiplier: 1.0 };
  }

  // Get level text for display
  getLevelText(levelNumber: number): string {
    const level = this.getAllLevels().find(l => l.id === levelNumber);
    return level?.name || `Level ${levelNumber}`;
  }
}

// CSS for floating animation
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  .level-particles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }
`;
document.head.appendChild(style);

export const hybridLevelSystem = new HybridLevelSystem();
