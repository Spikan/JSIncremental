// Game Init System: splash and start logic (TypeScript)

export function initSplashScreen(): void {
    try {
        const splashScreen = document.getElementById('splashScreen');
        const gameContent = document.getElementById('gameContent');
        if (!splashScreen || !gameContent) {
            console.error('Splash screen elements not found!');
            return;
        }

        function startGame(): void {
            try {
                const splash = document.getElementById('splashScreen');
                const game = document.getElementById('gameContent');
                if (splash && game) {
                    splash.style.display = 'none';
                    game.style.display = 'block';
                    try { (window as any).initGame?.(); } catch (error) {
                        console.error('Game init failed, but showing game anyway:', error);
                    }
                } else {
                    console.error('Could not find splash or game elements');
                }
            } catch {}
        }

        (window as any).startGame = startGame;

        // Ensure the explicit START button triggers start regardless of other handlers
        try {
            const startBtn = document.querySelector('.splash-start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startGame();
                });
            }
        } catch {}

        splashScreen.addEventListener('click', function (e: Event) {
            // Click anywhere on the splash should start the game
            e.preventDefault();
            e.stopPropagation();
            startGame();
        });

        document.addEventListener('keydown', function (event: KeyboardEvent) {
            if (splashScreen.style.display !== 'none') {
                if (event.code === 'Space' || event.code === 'Enter') {
                    event.preventDefault();
                    startGame();
                }
            }
        });
    } catch {}
}

export function startGameCore(): void {
    try {
        const splashScreen = document.getElementById('splashScreen');
        const gameContent = document.getElementById('gameContent');
        if (splashScreen && gameContent) {
            splashScreen.style.display = 'none';
            gameContent.style.display = 'block';
            try { (window as any).initGame?.(); } catch (error) {
                console.error('Game init failed, but showing game anyway:', error);
            }
        } else {
            console.error('Could not find splash or game elements');
        }
    } catch {}
}

// Initialize splash and basic options when DOM is ready
export function initOnDomReady(): void {
    try {
        const boot = () => {
            try { (window as any).loadWordBank?.(); } catch {}
            const config: any = (window as any).GAME_CONFIG?.TIMING || {};
            const domReadyDelay: number = Number(config.DOM_READY_DELAY || 0);
            setTimeout(() => {
                try {
                    initSplashScreen();
                    try { (window as any).App?.systems?.options?.loadOptions?.({ autosaveEnabled: true, autosaveInterval: 30 }); } catch {}
                    try { (window as any).App?.ui?.updatePlayTime?.(); } catch {}
                } catch (error) {
                    console.error('Error during splash screen initialization:', error);
                    const splashScreen = document.getElementById('splashScreen');
                    const gameContent = document.getElementById('gameContent');
                    if (splashScreen && gameContent) {
                        splashScreen.style.display = 'none';
                        gameContent.style.display = 'block';
                        try { (window as any).initGame?.(); } catch {}
                    }
                }
            }, domReadyDelay);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    } catch {}
}


