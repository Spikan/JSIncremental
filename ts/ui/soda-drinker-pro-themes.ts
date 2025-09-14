// Soda Drinker Pro Thematic Enhancement System
// Adds absurd, minimalist charm inspired by the original game

import { useGameStore } from '../core/state/zustand-store';

export interface ThemeData {
  backgroundGradient: string;
  ambientSound?: string;
  flavorText: string;
  specialEffects?: string[];
  mood: 'mundane' | 'surreal' | 'transcendent';
}

/**
 * Get theme data for current level
 */
export function getThemeForLevel(level: number): ThemeData {
  const themes: ThemeData[] = [
    // Levels 1-10: Mundane locations
    {
      backgroundGradient: 'linear-gradient(180deg, #001789, #0024b3)',
      flavorText: 'The classic blue. Simple. Pure. Refreshing.',
      mood: 'mundane',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #2d3748, #4a5568)',
      flavorText: 'Asphalt stretches endlessly. Cars pass by. You sip.',
      mood: 'mundane',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #2b6cb0, #3182ce)',
      flavorText: 'The bus is 12 minutes late. Your soda is perfectly on time.',
      mood: 'mundane',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #f7fafc, #edf2f7)',
      flavorText: 'Familiar surroundings. The refrigerator hums approvingly.',
      mood: 'mundane',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #22543d, #2f855a)',
      flavorText: 'Birds chirp. Leaves rustle. Carbonation fizzes.',
      mood: 'mundane',
    },

    // Levels 6-15: Getting weirder
    {
      backgroundGradient: 'linear-gradient(180deg, #e53e3e, #fc8181)',
      flavorText: 'Fluorescent lights buzz overhead. Time moves differently here.',
      mood: 'mundane',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #553c9a, #805ad5)',
      flavorText: 'Forms to fill. Numbers to wait for. Soda to drink.',
      mood: 'mundane',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #1a202c, #2d3748)',
      flavorText: "The radio plays a song from 1987. You don't recognize it.",
      mood: 'mundane',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #2a4365, #3182ce)',
      flavorText: 'The city sprawls below. Your soda rises above it all.',
      mood: 'mundane',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #4a5568, #718096)',
      flavorText: 'Keyboards click. Phones ring. Your soda remains constant.',
      mood: 'mundane',
    },

    // Levels 16-25: Surreal territory
    {
      backgroundGradient: 'linear-gradient(45deg, #667eea, #764ba2)',
      flavorText: 'The washing machines spin in perfect harmony with your sips.',
      mood: 'surreal',
    },
    {
      backgroundGradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      flavorText: 'The bed is made. The TV is off. The soda is eternal.',
      mood: 'surreal',
    },
    {
      backgroundGradient: 'linear-gradient(90deg, #ffecd2, #fcb69f)',
      flavorText: 'Waves crash. Seagulls cry. Your soda defies the ocean.',
      mood: 'surreal',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #2d1b69, #11998e)',
      flavorText: 'Silence echoes between the shelves. Knowledge tastes fizzy.',
      mood: 'surreal',
    },
    {
      backgroundGradient: 'linear-gradient(45deg, #ff9a9e, #fecfef)',
      flavorText: 'Pump #3 is out of order. Your soda needs no fuel.',
      mood: 'surreal',
    },

    // Levels 26-30: Transcendent experiences
    {
      backgroundGradient: 'linear-gradient(0deg, #000000, #434343)',
      flavorText: 'Nothing exists here. Only you. Only soda. Only now.',
      mood: 'transcendent',
    },
    {
      backgroundGradient: 'linear-gradient(180deg, #ff006e, #8338ec, #3a86ff)',
      flavorText: 'Reality bends. Physics weep. Your soda consumption transcends dimension.',
      mood: 'transcendent',
    },
    {
      backgroundGradient: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
      flavorText: 'You are becoming the soda. The soda is becoming you.',
      mood: 'transcendent',
    },
    {
      backgroundGradient: 'radial-gradient(circle, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
      flavorText: 'All beverages bow before your supreme soda mastery.',
      mood: 'transcendent',
    },
    {
      backgroundGradient:
        'conic-gradient(from 0deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b, #ff006e)',
      flavorText: 'This is it. The ultimate soda experience. You have achieved soda enlightenment.',
      mood: 'transcendent',
    },
  ];

  const index = Math.min(Math.floor(level - 1), themes.length - 1);
  const selectedTheme = themes[index];
  if (selectedTheme) return selectedTheme;

  const fallbackTheme = themes[themes.length - 1];
  if (fallbackTheme) return fallbackTheme;

  // Ultimate fallback
  return {
    backgroundGradient: 'linear-gradient(180deg, #001789, #0024b3)',
    flavorText: 'The void stares back.',
    mood: 'mundane' as const,
  };
}

/**
 * Apply theme to the game background
 */
export function applyThemeToBackground(level: number): void {
  const theme = getThemeForLevel(level);

  // Apply background gradient
  document.body.style.background = theme.backgroundGradient;

  // Add theme class for additional styling
  document.body.className = document.body.className
    .replace(/theme-\w+/g, '') // Remove existing theme classes
    .concat(` theme-${theme.mood}`);
}

/**
 * Show flavor text for current location
 */
export function showLocationFlavorText(level: number): void {
  const theme = getThemeForLevel(level);

  // Find or create flavor text element
  let flavorElement = document.querySelector('.location-flavor-text') as HTMLElement;

  if (!flavorElement) {
    flavorElement = document.createElement('div');
    flavorElement.className = 'location-flavor-text';

    // Style the flavor text element
    flavorElement.style.cssText = `
      position: fixed;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: rgba(255, 255, 255, 0.9);
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-style: italic;
      text-align: center;
      max-width: 400px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      z-index: 500;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;

    document.body.appendChild(flavorElement);
  }

  // Update text and fade in
  flavorElement.textContent = theme.flavorText;
  flavorElement.style.opacity = '1';

  // Fade out after 4 seconds
  setTimeout(() => {
    if (flavorElement) {
      flavorElement.style.opacity = '0';
    }
  }, 4000);
}

/**
 * Add absurd upgrade descriptions in the spirit of Soda Drinker Pro
 */
export function getAbsurdUpgradeDescription(upgradeName: string, level: number): string {
  const descriptions: Record<string, string[]> = {
    Suction: [
      'Your lips achieve perfect vacuum seal.',
      'The straw bends to your will.',
      'Gravity becomes optional.',
      'You transcend the need for physics.',
      'The soda comes to you.',
    ],
    'Critical Click': [
      'Sometimes, clicking just feels right.',
      'The mouse knows what you want.',
      'Reality glitches in your favor.',
      'The universe briefly acknowledges your clicking prowess.',
      'Your finger achieves enlightenment.',
    ],
    'Faster Drinks': [
      'Time is merely a suggestion.',
      'Your throat defies the laws of fluid dynamics.',
      'Carbonation accelerates through pure willpower.',
      'You drink at the speed of thought.',
      'The soda exists in a quantum superposition until consumed.',
    ],
    'Extra Straw': [
      'More straws = more possibilities.',
      'Each straw opens a new dimension of flavor.',
      'The straws form a complex network of beverage delivery.',
      'Your drink becomes an ecosystem.',
      'The straws achieve consciousness.',
    ],
    'Bigger Cup': [
      'Size matters in the world of beverages.',
      'Your cup defies spatial limitations.',
      'The cup becomes a portal to infinite soda.',
      "Geometry weeps at your cup's majesty.",
      'The cup contains multitudes.',
    ],
  };

  const upgradeDescriptions = descriptions[upgradeName] ?? ['The upgrade does what upgrades do.'];
  const index = Math.min(level - 1, upgradeDescriptions.length - 1);
  return (
    upgradeDescriptions[index] ??
    upgradeDescriptions[upgradeDescriptions.length - 1] ??
    'The upgrade does what upgrades do.'
  );
}

/**
 * Add random absurd notifications
 */
export function showAbsurdNotification(): void {
  const notifications = [
    'A pigeon somewhere approves of your soda choice.',
    'The vending machine in sector 7 is jealous.',
    'Your soda consumption has been noted by the authorities.',
    'Somewhere, a can of soda sheds a single tear of joy.',
    'The Soda Council convenes to discuss your progress.',
    'A distant refrigerator hums in approval.',
    'The carbonation whispers ancient secrets.',
    'Your soda technique has achieved legendary status.',
    'The Bureau of Beverage Affairs has taken notice.',
    'A moth lands on your screen, impressed by your dedication.',
  ];

  const randomNotification =
    notifications[Math.floor(Math.random() * notifications.length)] ??
    'Something absurd has occurred.';

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'absurd-notification';
  notification.textContent = randomNotification;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    max-width: 250px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    z-index: 1000;
    transform: translateX(300px);
    transition: transform 0.3s ease;
    pointer-events: none;
  `;

  document.body.appendChild(notification);

  // Slide in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Slide out and remove
  setTimeout(() => {
    notification.style.transform = 'translateX(300px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * Initialize the Soda Drinker Pro theme system
 */
export function initializeSodaDrinkerProThemes(): void {
  console.log('🥤 Initializing Soda Drinker Pro theme system...');

  // Apply initial theme
  const state = useGameStore.getState();
  const initialLevel = typeof state.level === 'number' 
    ? state.level 
    : state.level && typeof state.level.toNumber === 'function' 
      ? state.level.toNumber() 
      : Number(state.level || 1);
  
  console.log('🥤 Applying initial theme for level:', initialLevel);
  applyThemeToBackground(initialLevel);
  showLocationFlavorText(initialLevel);

  // Listen for level changes
  useGameStore.subscribe(
    state => state.level,
    level => {
      // Convert level to number if it's a Decimal
      const levelNum = typeof level === 'number' 
        ? level 
        : level && typeof level.toNumber === 'function' 
          ? level.toNumber() 
          : Number(level || 1);
      
      console.log('🥤 Level changed, applying theme for level:', levelNum);
      applyThemeToBackground(levelNum);
      showLocationFlavorText(levelNum);
    },
    { fireImmediately: false }
  );

  // Show random absurd notifications occasionally
  const showRandomNotification = () => {
    if (Math.random() < 0.3) {
      // 30% chance every interval
      showAbsurdNotification();
    }

    // Schedule next check (between 30-120 seconds)
    const nextInterval = 30000 + Math.random() * 90000;
    setTimeout(showRandomNotification, nextInterval);
  };

  // Start the notification system after 30 seconds
  setTimeout(showRandomNotification, 30000);

  console.log('✅ Soda Drinker Pro theme system initialized');
}

/**
 * Add CSS for theme-specific styling
 */
export function addThemeStyles(): void {
  if (document.querySelector('#soda-drinker-pro-theme-styles')) return;

  const style = document.createElement('style');
  style.id = 'soda-drinker-pro-theme-styles';
  style.textContent = `
    /* Theme-specific body classes */
    .theme-mundane {
      transition: background 2s ease;
    }
    
    .theme-surreal {
      transition: background 3s ease;
      animation: subtleShift 20s ease-in-out infinite;
    }
    
    .theme-transcendent {
      transition: background 1s ease;
      animation: cosmicShift 15s ease-in-out infinite;
    }
    
    @keyframes subtleShift {
      0%, 100% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(5deg); }
    }
    
    @keyframes cosmicShift {
      0%, 100% { filter: hue-rotate(0deg) saturate(1); }
      25% { filter: hue-rotate(90deg) saturate(1.2); }
      50% { filter: hue-rotate(180deg) saturate(1.1); }
      75% { filter: hue-rotate(270deg) saturate(1.3); }
    }
    
    /* Enhanced flavor text animations */
    .location-flavor-text {
      animation: flavorTextFloat 4s ease-in-out;
    }
    
    @keyframes flavorTextFloat {
      0%, 100% { transform: translateX(-50%) translateY(0px); }
      50% { transform: translateX(-50%) translateY(-5px); }
    }
    
    /* Absurd notification styling */
    .absurd-notification {
      font-family: 'Comic Sans MS', cursive, sans-serif;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
  `;

  document.head.appendChild(style);
}
