// Hybrid Level System - Combines SDP authentic levels with incremental mechanics
// Integrates 100+ real Soda Drinker Pro levels with our progression system

import { useGameStore } from '../state/zustand-store';

export interface HybridLevel {
  id: number;
  name: string;
  description: string;
  category: 'main' | 'bonus' | 'historical' | 'vivian' | 'special';
  unlockRequirement: {
    sips: number;
    clicks: number;
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
    unlockRequirement: { sips: 0, clicks: 0 },
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
    unlockRequirement: { sips: 100, clicks: 25 },
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
    unlockRequirement: { sips: 250, clicks: 50 },
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
    unlockRequirement: { sips: 500, clicks: 100 },
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
    unlockRequirement: { sips: 1000, clicks: 200 },
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
    unlockRequirement: { sips: 2000, clicks: 400 },
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
    unlockRequirement: { sips: 4000, clicks: 800 },
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
    unlockRequirement: { sips: 8000, clicks: 1600 },
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
    unlockRequirement: { sips: 16000, clicks: 3200 },
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
    unlockRequirement: { sips: 32000, clicks: 6400 },
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
    unlockRequirement: { sips: 100000, clicks: 20000 },
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
    unlockRequirement: { sips: 200000, clicks: 40000 },
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
    unlockRequirement: { sips: 500000, clicks: 100000 },
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
    unlockRequirement: { sips: 1000000, clicks: 200000 },
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
    unlockRequirement: { sips: 10000000, clicks: 2000000 },
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
    this.loadUnlockedLevels();
    this.loadCurrentLevel();
    this.isInitialized = true;

    // Expose force theme application for debugging
    (window as any).forceThemeApplication = () => this.forceThemeApplication();
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
    return this.currentLevel;
  }

  get isSystemInitialized(): boolean {
    return this.isInitialized;
  }

  get unlockedLevelsSet(): Set<number> {
    return this.unlockedLevels;
  }

  getUnlockedLevelIds(): number[] {
    return Array.from(this.unlockedLevels);
  }

  // Method for save loader to restore state
  restoreState(currentLevel: number, unlockedLevels: number[]): void {
    // Restore unlocked levels
    this.unlockedLevels = new Set(unlockedLevels);

    // Restore current level (only if it's unlocked)
    if (this.unlockedLevels.has(currentLevel)) {
      this.currentLevel = currentLevel;
      // Apply theme for the restored level
      this.applyLevelTheme();
    } else {
      this.currentLevel = 1;
      this.applyLevelTheme();
    }
  }

  applyInitialTheme(): void {
    this.applyLevelTheme();

    // Also update the level text display
    try {
      // Modernized - level text updates handled by store
    } catch (error) {
      console.warn('Failed to update level text during initialization:', error);
    }
  }

  getUnlockedLevels(): HybridLevel[] {
    return this.getAllLevels().filter(level => this.unlockedLevels.has(level.id));
  }

  getNextUnlockableLevel(): HybridLevel | null {
    const allLevels = this.getAllLevels();
    // Modernized - state handled by store
    const state = useGameStore.getState();
    const sips = state.sips || new Decimal(0);
    const clicks = state.totalClicks || 0;

    // Find the next level that can be unlocked
    for (const level of allLevels) {
      if (!this.unlockedLevels.has(level.id)) {
        const canUnlock =
          sips.gte(level.unlockRequirement.sips) && clicks >= level.unlockRequirement.clicks;
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
      return false;
    }

    // Modernized - state handled by store
    const state = useGameStore.getState();
    const sips = state.sips || new Decimal(0);
    const clicks = state.totalClicks || 0;

    const sipsMet = sips.gte
      ? sips.gte(level.unlockRequirement.sips)
      : Number(sips) >= level.unlockRequirement.sips;
    const clicksMet = clicks >= level.unlockRequirement.clicks;

    return sipsMet && clicksMet;
  }

  unlockLevel(levelId: number, silent: boolean = false): boolean {
    // For silent unlocks (like during save loading), just add to unlocked set
    if (silent) {
      this.unlockedLevels.add(levelId);
      this.saveUnlockedLevels();
      return true;
    }

    if (this.canUnlockLevel(levelId)) {
      this.unlockedLevels.add(levelId);
      this.saveUnlockedLevels();
      return true;
    }
    return false;
  }

  switchToLevel(levelId: number): boolean {
    if (this.unlockedLevels.has(levelId)) {
      this.currentLevel = levelId;
      this.saveCurrentLevel();
      this.applyLevelTheme();
      return true;
    } else {
      return false;
    }
  }

  private applyLevelTheme(): void {
    const level = this.getCurrentLevel();
    if (!level) {
      return;
    }

    // Apply global theme variables
    this.applyGlobalTheme(level);

    // Apply visual theme
    const root = document.documentElement;
    root.style.setProperty('--level-bg-color', level.visualTheme.backgroundColor);
    root.style.setProperty('--level-accent-color', level.visualTheme.accentColor);

    if (level.visualTheme.backgroundImage) {
      root.style.setProperty('--level-bg-image', level.visualTheme.backgroundImage);
    }

    // Also apply background directly to body for immediate effect with !important
    document.body.style.setProperty(
      'background',
      level.visualTheme.backgroundImage || level.visualTheme.backgroundColor,
      'important'
    );
    document.body.style.setProperty('background-attachment', 'fixed', 'important');
    document.body.style.setProperty(
      'background-color',
      level.visualTheme.backgroundColor,
      'important'
    );

    // Add level-specific particles
    this.addLevelParticles(level);
  }

  /**
   * Apply theme to root element for global theming
   */
  private applyGlobalTheme(level: HybridLevel): void {
    const root = document.documentElement;
    const gameContent = document.querySelector('.game-content') as HTMLElement;

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

    // Also set the legacy theme variables for compatibility
    root.style.setProperty('--theme-bg', level.visualTheme.backgroundColor);
    root.style.setProperty('--theme-accent', level.visualTheme.accentColor);
    root.style.setProperty('--theme-text', '#ffffff');
    root.style.setProperty('--theme-border', level.visualTheme.accentColor);

    // Set level-specific data attribute for CSS targeting
    if (gameContent) {
      gameContent.setAttribute('data-level', level.id.toString());
    }

    console.log(`🎨 Applied universal theme for level ${level.id}:`, {
      primary: level.visualTheme.backgroundColor,
      accent: level.visualTheme.accentColor,
    });
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
   * Apply level theme to all UI elements
   */
  private applyThemeToUIElements(level: HybridLevel): void {
    // Apply theme to shop elements
    this.applyThemeToShopElements(level);

    // Apply theme to upgrade elements
    this.applyThemeToUpgradeElements(level);

    // Apply theme to stat elements
    this.applyThemeToStatElements(level);

    // Apply theme to button elements
    this.applyThemeToButtonElements(level);

    // Apply theme to modal and tab elements
    this.applyThemeToModalElements(level);

    // Apply theme to main game content
    this.applyThemeToMainGameElements(level);
  }

  /**
   * Public method to apply current level theme (called from affordability system)
   */
  public applyCurrentLevelTheme(): void {
    const currentLevel = this.getCurrentLevel();
    if (currentLevel) {
      console.log('🎨 Applying current level theme:', currentLevel.name);
      this.applyThemeToUIElements(currentLevel);
    }
  }

  /**
   * Force theme application (for debugging and manual calls)
   */
  public forceThemeApplication(): void {
    console.log('🎨 Force applying theme...');
    this.applyCurrentLevelTheme();

    // Also force apply to specific problematic elements
    const currentLevel = this.getCurrentLevel();
    if (currentLevel) {
      this.forceApplyToProblematicElements(currentLevel);
    }
  }

  /**
   * Force apply theme to problematic elements that might not be caught by CSS
   */
  private forceApplyToProblematicElements(level: HybridLevel): void {
    const problematicSelectors = [
      '.suction-btn',
      '.upgrade-polygon',
      '.upgrade-card',
      '.upgrade-btn',
      '.suction-button-container',
    ];

    problematicSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const el = element as HTMLElement;
        el.style.setProperty('background', level.visualTheme.backgroundColor, 'important');
        el.style.setProperty('border-color', level.visualTheme.accentColor, 'important');
        el.style.setProperty('color', level.visualTheme.accentColor, 'important');
        el.style.setProperty('background-image', 'none', 'important');
      });
    });

    console.log('🎨 Force applied theme to problematic elements');
  }

  /**
   * Apply theme to shop elements
   */
  private applyThemeToShopElements(level: HybridLevel): void {
    const shopElements = document.querySelectorAll(
      '.shop-btn, .upgrade-btn, .suction-btn, .upgrade-card, .upgrade-polygon, .suction-button-container, .game-sidebar, .sidebar-content, .sidebar-header, .upgrade-header, .upgrade-info, .upgrade-stats, .upgrade-name, .upgrade-description, .upgrade-cost, .upgrade-owned, .upgrade-effect, .suction-info, .suction-name, .suction-cost, .suction-effect, .click-power-display, .click-power-label, .click-power-value, .suction-bonus, .upgrade-icon, .suction-icon'
    );

    // console.log('🎨 Applying theme to shop elements:', shopElements.length, 'elements found');
    // console.log('🎨 Theme colors:', {
    //   bg: level.visualTheme.backgroundColor,
    //   accent: level.visualTheme.accentColor,
    // });

    shopElements.forEach((element) => {
      const el = element as HTMLElement;

      // Set theme variables - CSS will handle the actual styling
      el.style.setProperty('--theme-bg', level.visualTheme.backgroundColor);
      el.style.setProperty('--theme-accent', level.visualTheme.accentColor);
      el.style.setProperty('--theme-text', '#ffffff');
      el.style.setProperty('--theme-border', level.visualTheme.accentColor);
    });
  }

  /**
   * Apply theme to upgrade elements
   */
  private applyThemeToUpgradeElements(level: HybridLevel): void {
    const upgradeElements = document.querySelectorAll(
      '.upgrade-card, .upgrade-btn, .suction-btn, .upgrade-polygon, .suction-button-container, .upgrade-header, .upgrade-info, .upgrade-stats'
    );

    upgradeElements.forEach(element => {
      const el = element as HTMLElement;

      // Set theme variables - CSS will handle the actual styling
      el.style.setProperty('--theme-bg', level.visualTheme.backgroundColor);
      el.style.setProperty('--theme-accent', level.visualTheme.accentColor);
      el.style.setProperty('--theme-text', '#ffffff');
      el.style.setProperty('--theme-border', level.visualTheme.accentColor);
    });
  }

  /**
   * Apply theme to stat elements
   */
  private applyThemeToStatElements(level: HybridLevel): void {
    const statElements = document.querySelectorAll('.stat, .stat-value, .stat-label');

    statElements.forEach(element => {
      const el = element as HTMLElement;
      el.style.setProperty('--theme-bg', level.visualTheme.backgroundColor);
      el.style.setProperty('--theme-accent', level.visualTheme.accentColor);
      el.style.color = level.visualTheme.accentColor;
    });
  }

  /**
   * Apply theme to button elements
   */
  private applyThemeToButtonElements(level: HybridLevel): void {
    const buttonElements = document.querySelectorAll('button, .button, .btn');

    buttonElements.forEach(element => {
      const el = element as HTMLElement;

      // Set theme variables - CSS will handle the actual styling
      el.style.setProperty('--theme-bg', level.visualTheme.backgroundColor);
      el.style.setProperty('--theme-accent', level.visualTheme.accentColor);
      el.style.setProperty('--theme-text', '#ffffff');
      el.style.setProperty('--theme-border', level.visualTheme.accentColor);
    });
  }

  /**
   * Apply theme to modal and tab elements
   */
  private applyThemeToModalElements(level: HybridLevel): void {
    const modalElements = document.querySelectorAll(
      '.settings-modal, .settings-modal-content, .settings-tab-btn, .settings-tab-content, .level-item, .level-selector-container'
    );

    modalElements.forEach(element => {
      const el = element as HTMLElement;

      // Set theme variables
      el.style.setProperty('--theme-bg', level.visualTheme.backgroundColor);
      el.style.setProperty('--theme-accent', level.visualTheme.accentColor);

      // Apply theme colors to modal elements
      if (
        el.classList.contains('settings-modal') ||
        el.classList.contains('settings-modal-content')
      ) {
        el.style.borderColor = level.visualTheme.accentColor;
      }

      if (el.classList.contains('settings-tab-btn')) {
        el.style.borderColor = level.visualTheme.accentColor;
        el.style.color = level.visualTheme.accentColor;
      }

      if (el.classList.contains('level-item') && !el.classList.contains('locked')) {
        el.style.borderColor = level.visualTheme.accentColor;
        el.style.color = level.visualTheme.accentColor;
      }
    });
  }

  /**
   * Apply theme to main game content elements
   */
  private applyThemeToMainGameElements(level: HybridLevel): void {
    const mainGameElements = document.querySelectorAll(
      '.main-game-content, .main-content-area, .soda-main-section, .soda-container, .click-indicator, .progress-bar-main, .progress-fill-main, .progress-info-minimal, .countdown-minimal'
    );

    mainGameElements.forEach(element => {
      const el = element as HTMLElement;

      // Set theme variables
      el.style.setProperty('--theme-bg', level.visualTheme.backgroundColor);
      el.style.setProperty('--theme-accent', level.visualTheme.accentColor);

      // Apply theme colors to specific elements
      if (el.classList.contains('progress-bar-main')) {
        el.style.borderColor = level.visualTheme.accentColor;
      }

      if (el.classList.contains('progress-fill-main')) {
        el.style.backgroundColor = level.visualTheme.accentColor;
      }

      if (el.classList.contains('countdown-minimal')) {
        el.style.color = level.visualTheme.accentColor;
      }
    });
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
    // Don't trigger notifications during initial load
    if (!this.isInitialized) {
      return [];
    }

    const newlyUnlocked: number[] = [];
    // Modernized - state handled by store
    const state = useGameStore.getState();
    const sips = state.sips || new Decimal(0);
    const clicks = state.totalClicks || 0;

    this.getAllLevels().forEach(level => {
      if (!this.unlockedLevels.has(level.id)) {
        const sipsMet = sips.gte
          ? sips.gte(level.unlockRequirement.sips)
          : Number(sips) >= level.unlockRequirement.sips;
        const clicksMet = clicks >= level.unlockRequirement.clicks;

        if (sipsMet && clicksMet) {
          this.unlockedLevels.add(level.id);
          newlyUnlocked.push(level.id);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveUnlockedLevels();
    }

    return newlyUnlocked;
  }

  // Get level-specific bonuses
  getLevelBonuses(): { sipMultiplier: number; clickMultiplier: number; specialEffect?: string } {
    const level = this.getCurrentLevel();
    return level?.bonuses || { sipMultiplier: 1.0, clickMultiplier: 1.0 };
  }

  // Alias for compatibility
  getCurrentLevelBonuses(): {
    sipMultiplier: number;
    clickMultiplier: number;
    specialEffect?: string;
  } {
    return this.getLevelBonuses();
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
