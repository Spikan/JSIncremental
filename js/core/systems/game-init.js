// @ts-nocheck
// Game Init System: splash and start logic

export function initSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (!splashScreen || !gameContent) {
        console.error('Splash screen elements not found!');
        return;
    }

    function startGame() {
        const splash = document.getElementById('splashScreen');
        const game = document.getElementById('gameContent');
        if (splash && game) {
            splash.style.display = 'none';
            game.style.display = 'block';
            try { window.initGame?.(); } catch (error) {
                console.error('Game init failed, but showing game anyway:', error);
            }
        } else {
            console.error('Could not find splash or game elements');
        }
    }

    window.startGame = startGame;

    splashScreen.addEventListener('click', function(e) {
        if (e.target === splashScreen || e.target.classList.contains('splash-content') || 
            e.target.classList.contains('splash-title') || e.target.classList.contains('splash-subtitle-text') ||
            e.target.classList.contains('splash-instruction') || e.target.classList.contains('splash-version') ||
            e.target.tagName === 'H1' || e.target.tagName === 'H2' || e.target.tagName === 'P') {
            startGame();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (splashScreen.style.display !== 'none') {
            if (event.code === 'Space' || event.code === 'Enter') {
                event.preventDefault();
                startGame();
            }
        }
    });
}

export function startGameCore() {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    if (splashScreen && gameContent) {
        splashScreen.style.display = 'none';
        gameContent.style.display = 'block';
        try { window.initGame?.(); } catch (error) {
            console.error('Game init failed, but showing game anyway:', error);
        }
    } else {
        console.error('Could not find splash or game elements');
    }
}


// Initialize splash and basic options when DOM is ready
export function initOnDomReady() {
    document.addEventListener('DOMContentLoaded', function() {
        // Load the word bank for the god feature (kept here to centralize init)
        try { window.loadWordBank?.(); } catch {}
        const config = window.GAME_CONFIG?.TIMING || {};
        const domReadyDelay = config.DOM_READY_DELAY;
        setTimeout(() => {
            try {
                initSplashScreen();
                try { window.App?.systems?.options?.loadOptions?.({ autosaveEnabled: true, autosaveInterval: 30 }); } catch {}
                try { window.App?.ui?.updatePlayTime?.(); } catch {}
            } catch (error) {
                console.error('Error during splash screen initialization:', error);
                const splashScreen = document.getElementById('splashScreen');
                const gameContent = document.getElementById('gameContent');
                if (splashScreen && gameContent) {
                    splashScreen.style.display = 'none';
                    gameContent.style.display = 'block';
                    try { window.initGame?.(); } catch {}
                }
            }
        }, domReadyDelay);
    });
}

