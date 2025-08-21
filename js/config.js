// Configuration file for Soda Clicker Pro
// 
// TEMPLEOS GOD FEATURE SETUP:
// Divine oracle feature - draws wisdom from sacred texts
// No external API keys needed for the divine guidance system

export const config = {
    // Divine oracle configuration
    // This feature provides sacred guidance and inspiration
    // Drawing wisdom from ancient spiritual texts
    
    // Game configuration
    GAME_VERSION: '1.0.0',
    GAME_TITLE: 'Soda Clicker Pro!',
    
    // Game balance constants
    BALANCE: {
        // Base costs and scaling
        STRAW_BASE_COST: 5,
        STRAW_SCALING: 1.08,
        CUP_BASE_COST: 15,
        CUP_SCALING: 1.15,
        SUCTION_BASE_COST: 40,
        SUCTION_SCALING: 1.10,
        FASTER_DRINKS_BASE_COST: 80,
        FASTER_DRINKS_SCALING: 1.10,
        CRITICAL_CLICK_BASE_COST: 60,
        CRITICAL_CLICK_SCALING: 1.10,
        WIDER_STRAWS_BASE_COST: 150,
        WIDER_STRAWS_SCALING: 1.12,
        BETTER_CUPS_BASE_COST: 400,
        BETTER_CUPS_SCALING: 1.12,
        LEVEL_UP_BASE_COST: 3000,
        LEVEL_UP_SCALING: 1.15,
        
        // Upgrade costs
        SUCTION_UPGRADE_BASE_COST: 800,
        FASTER_DRINKS_UPGRADE_BASE_COST: 1500,
        CRITICAL_CLICK_UPGRADE_BASE_COST: 1200,
        
        // Production values
        STRAW_BASE_SPD: 0.6,
        CUP_BASE_SPD: 1.2,
        SUCTION_CLICK_BONUS: 0.3,
        BASE_SIPS_PER_DRINK: 1,
        
        // Upgrade multipliers
        WIDER_STRAWS_MULTIPLIER: 0.5, // +50% per level
        BETTER_CUPS_MULTIPLIER: 0.4,  // +40% per level
        
        // Critical click system
        CRITICAL_CLICK_BASE_CHANCE: 0.001, // 0.1%
        CRITICAL_CLICK_CHANCE_INCREMENT: 0.0001, // +0.01% per purchase
        CRITICAL_CLICK_BASE_MULTIPLIER: 5,
        CRITICAL_CLICK_MULTIPLIER_INCREMENT: 2, // +2x per upgrade
        
        // Level up rewards
        LEVEL_UP_SIPS_MULTIPLIER: 1.5, // 150% increase
        
        // Faster drinks system
        FASTER_DRINKS_REDUCTION_PER_LEVEL: 0.01, // 1% reduction per level
        MIN_DRINK_RATE: 500, // Minimum 0.5 seconds between drinks
    },
    
    // Game timing constants
    TIMING: {
        DEFAULT_DRINK_RATE: 5000, // 5 seconds in milliseconds
        MIN_SAVE_INTERVAL: 1000, // Minimum 1 second between saves
        AUTOSAVE_INTERVAL: 10, // Default autosave every 10 seconds
        OFFLINE_MIN_TIME: 30, // Minimum 30 seconds offline to calculate earnings
        OFFLINE_MAX_TIME: 3600, // Maximum 1 hour offline earnings
        CLICK_STREAK_WINDOW: 1000, // 1 second window for click streaks
        CLICK_FEEDBACK_DURATION: 1000, // 1 second for regular click feedback
        CRITICAL_FEEDBACK_DURATION: 2000, // 2 seconds for critical click feedback
        LEVEL_UP_FEEDBACK_DURATION: 800, // 0.8 seconds for level up feedback
        PURCHASE_FEEDBACK_DURATION: 2000, // 2 seconds for purchase feedback
        UNLOCK_NOTIFICATION_DURATION: 3000, // 3 seconds for unlock notifications
        SODA_CLICK_ANIMATION_DURATION: 150, // 0.15 seconds for soda click animation
        SPLASH_TRANSITION_DELAY: 500, // 0.5 seconds delay for splash transition
        MUSIC_RETRY_DELAY: 2000, // 2 seconds between music retry attempts
        DOM_READY_DELAY: 100, // 0.1 seconds delay for DOM readiness
        MUSIC_INIT_DELAY: 1000, // 1 second delay for music initialization
    },
    
    // Game limits and thresholds
    LIMITS: {
        MAX_CLICK_TIMES: 100, // Keep only last 100 clicks for performance
        MAX_MUSIC_RETRIES: 10, // Maximum music retry attempts
        TARGET_FPS: 60, // Target frames per second for game loop
        STATS_UPDATE_INTERVAL: 1000, // Update stats every second
        AFFORDABILITY_CHECK_INTERVAL: 200, // Check affordability every 200ms
        CLICK_FEEDBACK_RANGE_X: 80, // -40px to +40px for click feedback positioning
        CLICK_FEEDBACK_RANGE_Y: 40, // -20px to +20px for click feedback positioning
        PROGRESS_BAR_NEARLY_COMPLETE: 75, // 75% for progress bar styling
        PROGRESS_BAR_COMPLETE: 100, // 100% for progress bar styling
    },
    
    // Audio configuration
    AUDIO: {
        SPLASH_MUSIC_VOLUME: 0.15,
        MAIN_MUSIC_VOLUME: 0.1,
        // Click sound parameters
        CLICK_SOUND_BASE_FREQ_MIN: 200,
        CLICK_SOUND_BASE_FREQ_MAX: 300,
        CLICK_SOUND_DURATION_MIN: 0.1,
        CLICK_SOUND_DURATION_MAX: 0.2,
        CLICK_SOUND_VOLUME_MIN: 0.3,
        CLICK_SOUND_VOLUME_MAX: 0.5,
        // Critical click sound parameters
        CRITICAL_CLICK_FREQ1_MIN: 150,
        CRITICAL_CLICK_FREQ1_MAX: 230,
        CRITICAL_CLICK_FREQ2_MIN: 300,
        CRITICAL_CLICK_FREQ2_MAX: 420,
        CRITICAL_CLICK_DURATION_MIN: 0.08,
        CRITICAL_CLICK_DURATION_MAX: 0.2,
        CRITICAL_CLICK_VOLUME_MIN: 0.25,
        CRITICAL_CLICK_VOLUME_MAX: 0.4,
        // Level up sound parameters
        LEVEL_UP_FREQ1_MIN: 180,
        LEVEL_UP_FREQ1_MAX: 240,
        LEVEL_UP_FREQ2_MIN: 350,
        LEVEL_UP_FREQ2_MAX: 450,
        LEVEL_UP_FREQ3_MIN: 500,
        LEVEL_UP_FREQ3_MAX: 650,
        LEVEL_UP_DURATION_MIN: 0.12,
        LEVEL_UP_DURATION_MAX: 0.2,
        LEVEL_UP_VOLUME_MIN: 0.2,
        LEVEL_UP_VOLUME_MAX: 0.35,
        // Purchase sound parameters
        PURCHASE_FREQ1_MIN: 400,
        PURCHASE_FREQ1_MAX: 600,
        PURCHASE_FREQ2_MIN: 800,
        PURCHASE_FREQ2_MAX: 1100,
        PURCHASE_FREQ3_MIN: 1200,
        PURCHASE_FREQ3_MAX: 1600,
        PURCHASE_DURATION_MIN: 0.3,
        PURCHASE_DURATION_MAX: 0.5,
        PURCHASE_VOLUME_MIN: 0.4,
        PURCHASE_VOLUME_MAX: 0.6,
        // Soda click sound parameters
        SODA_CLICK_FREQ1_MIN: 80,
        SODA_CLICK_FREQ1_MAX: 120,
        SODA_CLICK_FREQ2_MIN: 160,
        SODA_CLICK_FREQ2_MAX: 220,
        SODA_CLICK_DURATION_MIN: 0.4,
        SODA_CLICK_DURATION_MAX: 0.6,
        SODA_CLICK_VOLUME_MIN: 0.35,
        SODA_CLICK_VOLUME_MAX: 0.5
    },
    
    // Feature unlock thresholds
    UNLOCKS: {
        SUCTION: { sips: 25, clicks: 8 },
        CRITICAL_CLICK: { sips: 100, clicks: 20 },
        FASTER_DRINKS: { sips: 200, clicks: 30 },
        STRAWS: { sips: 500, clicks: 50 },
        CUPS: { sips: 1000, clicks: 80 },
        WIDER_STRAWS: { sips: 2000, clicks: 120 },
        BETTER_CUPS: { sips: 5000, clicks: 200 },
        LEVEL_UP: { sips: 3000, clicks: 150 },
        SHOP: { sips: 500, clicks: 30 },
        STATS: { sips: 1000, clicks: 60 },
        GOD: { sips: 5000, clicks: 300 },
        UNLOCKS_TAB: { sips: 25, clicks: 8 }
    },
    
    // Number formatting thresholds
    FORMATTING: {
        SMALL_NUMBER_THRESHOLD: 1000,
        MEDIUM_NUMBER_THRESHOLD: 1e6,
        LARGE_NUMBER_THRESHOLD: 1e9,
        HUGE_NUMBER_THRESHOLD: 1e12,
        MASSIVE_NUMBER_THRESHOLD: 1e15,
        ENORMOUS_NUMBER_THRESHOLD: 1e18,
        GIGANTIC_NUMBER_THRESHOLD: 1e21,
        TITANIC_NUMBER_THRESHOLD: 1e24,
        COSMIC_NUMBER_THRESHOLD: 1e27,
        INFINITE_NUMBER_THRESHOLD: 1e30,
        DECIMAL_PLACES_SMALL: 2,
        DECIMAL_PLACES_MEDIUM: 1,
        DECIMAL_PLACES_LARGE: 2,
    },
    
    // Mobile detection
    MOBILE: {
        MAX_WIDTH: 768,
        MAX_HEIGHT: 1024,
        USER_AGENT_PATTERNS: ['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'IEMobile', 'Opera Mini']
    },
    
    // Performance settings
    PERFORMANCE: {
        LOW_FPS_WARNING_THRESHOLD: 30,
        FRAME_COUNT_INTERVAL: 1000, // Count frames over 1 second
    }
};

// Make config available globally for non-module usage
if (typeof window !== 'undefined') {
    window.GAME_CONFIG = config;
}