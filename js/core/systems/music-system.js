// Music and Audio System
// Handles all music playback, sound effects, and audio context management

// Audio context for sound effects
let audioContext = null;
let clickSoundsEnabled = true;
let musicEnabled = true;
let musicStreamPreferences = {};

// Initialize audio context for sound effects
export function initAudioContext() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        console.log('Audio context initialized successfully');
    } catch (error) {
        console.error('Failed to initialize audio context:', error);
    }
}

// Sound effect functions
export function playStrawSipSound() {
    if (!clickSoundsEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.error('Error playing straw sip sound:', error);
    }
}

export function playBasicStrawSipSound() {
    if (!clickSoundsEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
    } catch (error) {
        console.error('Error playing basic straw sip sound:', error);
    }
}

export function playAlternativeStrawSipSound() {
    if (!clickSoundsEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(350, audioContext.currentTime + 0.12);
        
        gainNode.gain.setValueAtTime(0.28, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.12);
    } catch (error) {
        console.error('Error playing alternative straw sip sound:', error);
    }
}

export function playBubbleStrawSipSound() {
    if (!clickSoundsEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(450, audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.32, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
        console.error('Error playing bubble straw sip sound:', error);
    }
}

export function playCriticalClickSound() {
    if (!clickSoundsEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.error('Error playing critical click sound:', error);
    }
}

export function playPurchaseSound() {
    if (!clickSoundsEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
        console.error('Error playing purchase sound:', error);
    }
}

// Click sounds management
export function toggleClickSounds() {
    clickSoundsEnabled = !clickSoundsEnabled;
    
    // Update localStorage
    if (window.App?.storage?.setBoolean) {
        window.App.storage.setBoolean('clickSoundsEnabled', clickSoundsEnabled);
    } else {
        localStorage.setItem('clickSoundsEnabled', clickSoundsEnabled.toString());
    }
    
    // Update UI
    const clickSoundsToggle = document.getElementById('clickSoundsToggle');
    if (clickSoundsToggle) {
        clickSoundsToggle.textContent = clickSoundsEnabled ? '🔊 Click Sounds ON' : '🔇 Click Sounds OFF';
        clickSoundsToggle.classList.toggle('sounds-off', !clickSoundsEnabled);
    }
    
    console.log('Click sounds:', clickSoundsEnabled ? 'ON' : 'OFF');
}

export function loadClickSoundsPreference() {
    try {
        if (window.App?.storage?.getBoolean) {
            clickSoundsEnabled = window.App.storage.getBoolean('clickSoundsEnabled', true);
        } else {
            const stored = localStorage.getItem('clickSoundsEnabled');
            clickSoundsEnabled = stored !== null ? stored === 'true' : true;
        }
    } catch (error) {
        console.error('Error loading click sounds preference:', error);
        clickSoundsEnabled = true; // Default to enabled
    }
}

// Music player management
let currentMusicStream = null;
let musicPlayer = null;

export function initMusicPlayer() {
    try {
        // Initialize music stream preferences
        if (window.App?.storage?.getJSON) {
            musicStreamPreferences = window.App.storage.getJSON('musicStreamPreferences', {});
        } else {
            const stored = localStorage.getItem('musicStreamPreferences');
            musicStreamPreferences = stored ? JSON.parse(stored) : {};
        }
        
        // Set default stream if none selected
        if (!musicStreamPreferences.currentStream) {
            musicStreamPreferences.currentStream = 'title';
        }
        
        console.log('Music player initialized with preferences:', musicStreamPreferences);
    } catch (error) {
        console.error('Error initializing music player:', error);
        musicStreamPreferences = { currentStream: 'title' };
    }
}

export function initSplashMusic() {
    try {
        const audio = new Audio('res/Soda Drinker Title Music.mp3');
        audio.loop = true;
        audio.volume = 0.5;
        
        // Store reference for later control
        window.splashMusic = audio;
        
        // Start playing when user interacts
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', () => {
                audio.play().catch(console.error);
            });
        }
        
        console.log('Splash music initialized');
    } catch (error) {
        console.error('Error initializing splash music:', error);
    }
}

export function playTitleMusic() {
    try {
        if (window.splashMusic) {
            window.splashMusic.play().catch(console.error);
        }
    } catch (error) {
        console.error('Error playing title music:', error);
    }
}

export function stopTitleMusic() {
    try {
        if (window.splashMusic) {
            window.splashMusic.pause();
            window.splashMusic.currentTime = 0;
        }
    } catch (error) {
        console.error('Error stopping title music:', error);
    }
}

export function startMainGameMusic() {
    try {
        const audio = new Audio('res/Between Level Music.mp3');
        audio.loop = true;
        audio.volume = 0.4;
        
        // Store reference for later control
        window.mainGameMusic = audio;
        
        // Start playing
        audio.play().catch(console.error);
        
        console.log('Main game music started');
    } catch (error) {
        console.error('Error starting main game music:', error);
    }
}

export function toggleMusic() {
    musicEnabled = !musicEnabled;
    
    // Update localStorage
    if (window.App?.storage?.setBoolean) {
        window.App.storage.setBoolean('musicEnabled', musicEnabled);
    } else {
        localStorage.setItem('musicEnabled', musicEnabled.toString());
    }
    
    // Update music playback
    if (window.splashMusic) {
        if (musicEnabled) {
            window.splashMusic.play().catch(console.error);
        } else {
            window.splashMusic.pause();
        }
    }
    
    if (window.mainGameMusic) {
        if (musicEnabled) {
            window.mainGameMusic.play().catch(console.error);
        } else {
            window.mainGameMusic.pause();
        }
    }
    
    // Update UI
    updateMusicPlayerUI();
    
    console.log('Music:', musicEnabled ? 'ON' : 'OFF');
}

export function updateMusicPlayerUI() {
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.textContent = musicEnabled ? '🎵 Music ON' : '🔇 Music OFF';
        musicToggle.classList.toggle('music-off', !musicEnabled);
    }
}

export function changeMusicStream() {
    try {
        const streamSelect = document.getElementById('musicStreamSelect');
        if (!streamSelect) return;
        
        const newStream = streamSelect.value;
        musicStreamPreferences.currentStream = newStream;
        
        // Save preference
        if (window.App?.storage?.setJSON) {
            window.App.storage.setJSON('musicStreamPreferences', musicStreamPreferences);
        } else {
            localStorage.setItem('musicStreamPreferences', JSON.stringify(musicStreamPreferences));
        }
        
        // Update display
        updateMusicPlayerDisplay({ currentStream: newStream });
        
        console.log('Music stream changed to:', newStream);
    } catch (error) {
        console.error('Error changing music stream:', error);
    }
}

export function updateMusicPlayerDisplay(streamInfo) {
    try {
        const streamDisplay = document.getElementById('currentStreamDisplay');
        if (streamDisplay && streamInfo.currentStream) {
            streamDisplay.textContent = `Current: ${streamInfo.currentStream}`;
        }
    } catch (error) {
        console.error('Error updating music player display:', error);
    }
}

export function loadFallbackMusic() {
    try {
        // Load fallback music if primary fails
        const fallbackAudio = new Audio('res/Between Level Music.mp3');
        fallbackAudio.loop = true;
        fallbackAudio.volume = 0.3;
        
        window.fallbackMusic = fallbackAudio;
        
        console.log('Fallback music loaded');
    } catch (error) {
        console.error('Error loading fallback music:', error);
    }
}

export function cleanupAudioResources() {
    try {
        // Clean up audio contexts and elements
        if (audioContext) {
            audioContext.close().catch(console.error);
            audioContext = null;
        }
        
        if (window.splashMusic) {
            window.splashMusic.pause();
            window.splashMusic.src = '';
            window.splashMusic = null;
        }
        
        if (window.mainGameMusic) {
            window.mainGameMusic.pause();
            window.mainGameMusic.src = '';
            window.mainGameMusic = null;
        }
        
        if (window.fallbackMusic) {
            window.fallbackMusic.pause();
            window.fallbackMusic.src = '';
            window.fallbackMusic = null;
        }
        
        console.log('Audio resources cleaned up');
    } catch (error) {
        console.error('Error cleaning up audio resources:', error);
    }
}

// Test functions (for development)
export function testClickSounds() {
    console.log('Testing click sounds...');
    playBasicStrawSipSound();
    setTimeout(() => playCriticalClickSound(), 200);
    setTimeout(() => playPurchaseSound(), 400);
}

export function testPurchaseSound() {
    console.log('Testing purchase sound...');
    playPurchaseSound();
}

export function testCriticalClickSound() {
    console.log('Testing critical click sound...');
    playCriticalClickSound();
}

// Export state getters
export function getClickSoundsEnabled() {
    return clickSoundsEnabled;
}

export function getMusicEnabled() {
    return musicEnabled;
}

export function getMusicStreamPreferences() {
    return { ...musicStreamPreferences };
}
