// Main Game Logic - Legacy game logic being refactored into modular architecture (TypeScript)
// Thin shim that preserves runtime behavior while migration continues.

// Re-export nothing; this file sets up globals used by HTML and other modules

// Bring over the JS file contents verbatim with minimal edits for TS compatibility
// We import the existing JS via a triple-slash reference to keep order under Vite
// but here we inline the logic from js/main.js, adapted for TS types.

// Ported inline from js/main.js (TS-ified minimal changes)

const GC: any = (typeof window !== 'undefined' && (window as any).GAME_CONFIG) || {};
// DOM_CACHE and Decimal are declared in global types

const BAL = (GC && GC.BALANCE) || {};
const TIMING = (GC && GC.TIMING) || {};
const LIMITS = (GC && GC.LIMITS) || {};

(function ensureDomCacheReady() {
    try {
        if (typeof DOM_CACHE === 'undefined') {
            console.error('DOM_CACHE not loaded. Please ensure dom-cache.ts is loaded before main.ts');
            return;
        }
        if (!DOM_CACHE.isReady()) {
            console.warn('DOM_CACHE not ready, initializing...');
            DOM_CACHE.init();
        }
    } catch {}
})();

function initSplashScreen() { try { (window as any).App?.systems?.gameInit?.initSplashScreen?.(); } catch {} }

function initGame() {
    try {
        console.log('🚀 initGame called - starting game initialization...');
        console.log('🔧 GAME_CONFIG available:', !!GC && Object.keys(GC).length > 0);
        console.log('🔧 DOM_CACHE available:', !!(window as any).DOM_CACHE);
        console.log('🔧 Unlocks system available:', !!((window as any).App?.systems?.unlocks));
        if (!(window as any).App?.systems?.unlocks) { console.log('⏳ Waiting for unlocks system to load...'); setTimeout(initGame, 100); return; }
        if (typeof DOM_CACHE === 'undefined') { console.log('⏳ Waiting for DOM_CACHE to load...'); setTimeout(initGame, 100); return; }
        if (!GC || (typeof GC === 'object' && Object.keys(GC).length === 0)) { console.log('⏳ Waiting for GAME_CONFIG to load...'); setTimeout(initGame, 100); return; }

        const CONF = GC || {};
        const BAL = CONF.BALANCE || {};
        const TIMING = CONF.TIMING || {};

        (window as any).sips = new Decimal(0);
        let straws = new Decimal(0);
        let cups = new Decimal(0);
        (window as any).straws = straws;
        (window as any).cups = cups;
        let suctions = new Decimal(0);
        (window as any).suctions = suctions;

        let sps = new Decimal(0);
        let strawSPD = new Decimal(0);
        let cupSPD = new Decimal(0);
        let suctionClickBonus = new Decimal(0);
        let widerStraws = new Decimal(0); (window as any).widerStraws = widerStraws;
        let betterCups = new Decimal(0); (window as any).betterCups = betterCups;
        let level = new Decimal(1); (window as any).level = level;

        const DEFAULT_DRINK_RATE = TIMING.DEFAULT_DRINK_RATE;
        let drinkRate = DEFAULT_DRINK_RATE;
        let drinkProgress = 0;
        let lastDrinkTime = Date.now() - DEFAULT_DRINK_RATE;
        try { (window as any).App?.state?.setState?.({ lastDrinkTime, drinkRate }); } catch {}
        if (!Object.getOwnPropertyDescriptor(window, 'lastDrinkTime')) {
            Object.defineProperty(window, 'lastDrinkTime', { get: function() { return lastDrinkTime; }, set: function(v) { lastDrinkTime = Number(v) || 0; try { (window as any).App?.stateBridge?.setLastDrinkTime(lastDrinkTime); } catch {} } });
        }

        let fasterDrinks = new Decimal(0); (window as any).fasterDrinks = fasterDrinks;
        let fasterDrinksUpCounter = new Decimal(1); (window as any).fasterDrinksUpCounter = fasterDrinksUpCounter;

        let criticalClickChance = new Decimal(BAL.CRITICAL_CLICK_BASE_CHANCE); (window as any).criticalClickChance = criticalClickChance;
        let criticalClickMultiplier = new Decimal(BAL.CRITICAL_CLICK_BASE_MULTIPLIER); (window as any).criticalClickMultiplier = criticalClickMultiplier;
        let criticalClicks = new Decimal(0);
        let criticalClickUpCounter = new Decimal(1);


        try { (window as any).App?.ui?.updateAutosaveStatus?.(); } catch {}
        let gameStartTime = Date.now();
        let lastSaveTime: any = null;
        if (!Object.getOwnPropertyDescriptor(window, 'lastSaveTime')) {
            Object.defineProperty(window, 'lastSaveTime', { get: function() { try { return Number((window as any).App?.state?.getState?.()?.lastSaveTime ?? lastSaveTime ?? 0); } catch {} return Number(lastSaveTime || 0); }, set: function(v) { lastSaveTime = Number(v) || 0; try { (window as any).App?.state?.setState?.({ lastSaveTime }); } catch {} } });
        }
        try { (window as any).App?.state?.setState?.({ sessionStartTime: gameStartTime, totalPlayTime: 0 }); } catch {}


        let gameStartDate = Date.now(); try { (window as any).App?.state?.setState?.({ sessionStartTime: Number(gameStartDate) }); } catch {}
        try { (window as any).App?.state?.setState?.({ lastClickTime: 0 }); } catch {}

        try { DOM_CACHE.init(); } catch {}

        // Load save
        let savegame: any = null;
        try {
            const w: any = window as any;
            if (w.App && w.App.storage && typeof w.App.storage.loadGame === 'function') {
                const payload = w.App.storage.loadGame();
                savegame = (payload && payload.sips !== undefined) ? payload : JSON.parse(localStorage.getItem('save') as any);
            } else {
                savegame = JSON.parse(localStorage.getItem('save') as any);
            }
        } catch (e) { console.warn('Failed to load save, starting fresh.', e); savegame = null; }

        if (savegame && typeof savegame.sips !== 'undefined' && savegame.sips !== null) {
            (window as any).sips = new Decimal(savegame.sips);
            straws = new Decimal(typeof savegame.straws === 'number' ? savegame.straws : (savegame.straws || 0));
            cups = new Decimal(typeof savegame.cups === 'number' ? savegame.cups : (savegame.cups || 0));
            (window as any).straws = straws; (window as any).cups = cups;
            suctions = new Decimal(savegame.suctions || 0); (window as any).suctions = suctions;
            fasterDrinks = new Decimal(savegame.fasterDrinks || 0); (window as any).fasterDrinks = fasterDrinks;
            widerStraws = new Decimal(savegame.widerStraws || 0); (window as any).widerStraws = widerStraws;
            betterCups = new Decimal(savegame.betterCups || 0); (window as any).betterCups = betterCups;
            criticalClickChance = new Decimal(savegame.criticalClickChance || 0.001); (window as any).criticalClickChance = criticalClickChance;
            criticalClickMultiplier = new Decimal(savegame.criticalClickMultiplier || 5); (window as any).criticalClickMultiplier = criticalClickMultiplier;
            criticalClicks = new Decimal(savegame.criticalClicks || 0); (window as any).criticalClicks = criticalClicks;
            criticalClickUpCounter = new Decimal(savegame.criticalClickUpCounter || 1);
            suctionClickBonus = new Decimal(savegame.suctionClickBonus || 0);
            level = new Decimal(typeof savegame.level === 'number' ? savegame.level : (savegame.level || 1)); (window as any).level = level;
            try { (window as any).App?.stateBridge?.setLevel(level); } catch {}

            try { (window as any).App?.state?.setState?.({ totalClicks: Number(savegame.totalClicks || 0) }); } catch {}
            gameStartDate = savegame.gameStartDate || Date.now();
            try { (window as any).App?.state?.setState?.({ lastClickTime: Number(savegame.lastClickTime || 0) }); } catch {}
            try { (window as any).App?.state?.setState?.({ totalPlayTime: Number(savegame.totalPlayTime || 0) }); } catch {}
        }

        try { (window as any).App?.events?.emit?.((window as any).App?.EVENT_NAMES?.GAME?.LOADED, { save: !!savegame }); } catch {}

        // Compute production
        const config = BAL || {};
        if ((window as any).App?.systems?.resources?.recalcProduction) {
            const up = (window as any).App?.data?.upgrades || {};
            const result = (window as any).App.systems.resources.recalcProduction({
                straws: straws.toNumber(), cups: cups.toNumber(), widerStraws: widerStraws.toNumber(), betterCups: betterCups.toNumber(),
                base: { strawBaseSPD: up?.straws?.baseSPD ?? config.STRAW_BASE_SPD, cupBaseSPD: up?.cups?.baseSPD ?? config.CUP_BASE_SPD, baseSipsPerDrink: config.BASE_SIPS_PER_DRINK },
                multipliers: { widerStrawsPerLevel: up?.widerStraws?.multiplierPerLevel ?? config.WIDER_STRAWS_MULTIPLIER, betterCupsPerLevel: up?.betterCups?.multiplierPerLevel ?? config.BETTER_CUPS_MULTIPLIER },
            });
            strawSPD = new Decimal(result.strawSPD); cupSPD = new Decimal(result.cupSPD); sps = new Decimal(result.sipsPerDrink);
        } else {
            strawSPD = new Decimal(config.STRAW_BASE_SPD); cupSPD = new Decimal(config.CUP_BASE_SPD);
            if (widerStraws && typeof widerStraws.gt === 'function' && widerStraws.gt(0)) { const upgradeMultiplier = new Decimal(1 + (widerStraws.toNumber() * config.WIDER_STRAWS_MULTIPLIER)); strawSPD = strawSPD.times(upgradeMultiplier); }
            if (betterCups && typeof betterCups.gt === 'function' && betterCups.gt(0)) { const upgradeMultiplier = new Decimal(1 + (betterCups.toNumber() * config.BETTER_CUPS_MULTIPLIER)); cupSPD = cupSPD.times(upgradeMultiplier); }
            const baseSipsPerDrink = new Decimal(config.BASE_SIPS_PER_DRINK);
            const passiveSipsPerDrink = strawSPD.times(straws).plus(cupSPD.times(cups));
            sps = baseSipsPerDrink.plus(passiveSipsPerDrink);
        }
        suctionClickBonus = new Decimal(config.SUCTION_CLICK_BONUS).times(suctions);

        // Restore drink timing if present in save
        try { if (savegame) { if (typeof savegame.lastDrinkTime === 'number' && savegame.lastDrinkTime > 0) { lastDrinkTime = savegame.lastDrinkTime; } else if (typeof savegame.drinkProgress === 'number' && savegame.drinkProgress >= 0) { const progressMs = (savegame.drinkProgress / 100) * drinkRate; lastDrinkTime = Date.now() - progressMs; } } } catch {}

        // Seed App.state snapshot
        try {
            const toNum = (v: any) => (v && typeof v.toNumber === 'function') ? v.toNumber() : Number(v || 0);
            (window as any).App?.state?.setState?.({
                sips: toNum((window as any).sips), straws: toNum(straws), cups: toNum(cups), suctions: toNum((window as any).suctions), widerStraws: toNum(widerStraws), betterCups: toNum(betterCups), fasterDrinks: toNum((window as any).fasterDrinks), criticalClicks: toNum(criticalClicks), level: toNum(level), sps: toNum(sps), strawSPD: toNum(strawSPD), cupSPD: toNum(cupSPD), drinkRate: Number(drinkRate || 0), drinkProgress: Number(drinkProgress || 0), lastDrinkTime: Number(lastDrinkTime || 0), criticalClickChance: toNum(criticalClickChance), criticalClickMultiplier: toNum(criticalClickMultiplier), suctionClickBonus: toNum(suctionClickBonus), fasterDrinksUpCounter: toNum(fasterDrinksUpCounter), criticalClickUpCounter: toNum(criticalClickUpCounter)
            });
        } catch {}

        (window as any).App?.ui?.updateTopSipsPerDrink?.();
        (window as any).App?.ui?.updateTopSipsPerSecond?.();
        try { (window as any).App?.systems?.unlocks?.init?.(); } catch {}
        setupMobileTouchHandling();
        try { (window as any).App?.systems?.audio?.button?.initButtonAudioSystem?.(); } catch {}
        try { (window as any).App?.systems?.audio?.button?.updateButtonSoundsToggleButton?.(); } catch {}
    } catch (error) {
        console.error('Error in initGame:', error);
        const splashScreen = document.getElementById('splashScreen');
        const gameContent = document.getElementById('gameContent');
        if (splashScreen && gameContent) { splashScreen.style.display = 'none'; gameContent.style.display = 'block'; }
    }
}

function setupMobileTouchHandling() {
    const sodaButton = (DOM_CACHE && DOM_CACHE.sodaButton) || null;
    if (!sodaButton) { setTimeout(setupMobileTouchHandling, 100); return; }
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isMobile) {
        try { sodaButton.style.touchAction = 'pan-y'; sodaButton.style.webkitTouchCallout = 'none'; sodaButton.style.webkitUserSelect = 'none'; sodaButton.style.userSelect = 'none'; } catch {}
        try { sodaButton.addEventListener('contextmenu', function(e: Event) { e.preventDefault(); }); } catch {}
    }
}

function startGame() { try { (window as any).App?.systems?.gameInit?.startGame?.(); } catch (error) { console.error('Error in startGame:', error); } }

(window as any).initGame = initGame;
(window as any).startGame = startGame;

function areDependenciesReady() {
    const dependencies = {
        UNLOCKS_SYSTEM: !!((window as any).App?.systems?.unlocks),
        DOM_CACHE: typeof DOM_CACHE !== 'undefined',
        GAME_CONFIG: !!GC && Object.keys(GC).length > 0,
        Decimal: typeof Decimal !== 'undefined',
        App: typeof (window as any).App !== 'undefined'
    } as Record<string, boolean>;
    const missing = Object.entries(dependencies).filter(([, ok]) => !ok).map(([k]) => k);
    if (missing.length > 0) { console.log('⏳ Waiting for dependencies:', missing.join(', ')); return false; }
    console.log('✅ All dependencies are ready');
    return true;
}

function initializeGameWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { console.log('✅ DOM ready, checking dependencies...'); waitForDependencies(); });
    } else { console.log('✅ DOM already ready, checking dependencies...'); waitForDependencies(); }
}

function waitForDependencies() { if (areDependenciesReady()) { console.log('🚀 All dependencies ready, initializing game...'); initGame(); } else { console.log('⏳ Dependencies not ready, retrying in 100ms...'); setTimeout(waitForDependencies, 100); } }

initializeGameWhenReady();



