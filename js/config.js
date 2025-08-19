// Configuration file for Soda Clicker Pro
// 
// TALK TO GOD FEATURE SETUP:
// The Giphy API key is now set via environment variables for security
// Your API key is: 3VLc3MMzckOZbH8i605UV0m1dDjRaYt6

export const config = {
    // Giphy API key for the "Talk to God" feature
    // Set via environment variable or use the provided key
    giphyApiKey: process.env.GIPHY_API_KEY || '3VLc3MMzckOZbH8i605UV0m1dDjRaYt6',
    
    // Game configuration
    GAME_VERSION: '1.0.0',
    GAME_TITLE: 'Soda Clicker Pro!'
};