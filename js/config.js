// Configuration file for Soda Clicker Pro
// IMPORTANT: Add this file to .gitignore to keep your API keys private
// Copy this file to config.local.js and add your actual API keys there

export const config = {
    // Giphy API key for the "Talk to God" feature
    // Get a free key at: https://developers.giphy.com/
    giphyApiKey: 'YOUR_GIPHY_API_KEY_HERE',
    
    // Game configuration
    GAME_VERSION: '1.0.0',
    GAME_TITLE: 'Soda Clicker Pro!'
};

// Local configuration override (create this file with your actual keys)
// This file should be added to .gitignore
try {
    const localConfig = await import('./config.local.js');
    Object.assign(config, localConfig.config);
} catch (error) {
    // Local config not found, using default config
    console.log('Using default configuration. Create config.local.js for custom settings.');
}