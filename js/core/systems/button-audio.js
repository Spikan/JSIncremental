// Button Audio System
// Handles button click/purchase/critical sound effects and preference state

let audioContext = null;
let buttonSoundsEnabled = true;

function initButtonAudioContext() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        console.log('Button audio context initialized');
    } catch (error) {
        console.error('Failed to initialize button audio context:', error);
    }
}

export function initButtonAudioSystem() {
    initButtonAudioContext();
    try {
        const stored = localStorage.getItem('buttonSoundsEnabled');
        buttonSoundsEnabled = stored !== null ? stored === 'true' : true;
    } catch (error) {
        buttonSoundsEnabled = true;
    }
    updateButtonSoundsToggleButton();
    console.log('Button audio system initialized');
}

export function toggleButtonSounds() {
    buttonSoundsEnabled = !buttonSoundsEnabled;
    try { localStorage.setItem('buttonSoundsEnabled', buttonSoundsEnabled.toString()); } catch {}
    updateButtonSoundsToggleButton();
    console.log('Button sounds:', buttonSoundsEnabled ? 'ON' : 'OFF');
}

export function updateButtonSoundsToggleButton() {
    const buttonSoundsToggle = document.getElementById('buttonSoundsToggle');
    if (buttonSoundsToggle) {
        buttonSoundsToggle.textContent = buttonSoundsEnabled ? '🔊 Button Sounds ON' : '🔇 Button Sounds OFF';
        try { buttonSoundsToggle.classList.toggle('sounds-off', !buttonSoundsEnabled); } catch {}
    }
}

export function playButtonClickSound() {
    if (!buttonSoundsEnabled || !audioContext) return;
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
        console.error('Error playing button click sound:', error);
    }
}

export function playButtonPurchaseSound() {
    if (!buttonSoundsEnabled || !audioContext) return;
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
        console.error('Error playing button purchase sound:', error);
    }
}

export function playButtonCriticalClickSound() {
    if (!buttonSoundsEnabled || !audioContext) return;
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
        console.error('Error playing button critical click sound:', error);
    }
}

export function getButtonSoundsEnabled() { return buttonSoundsEnabled; }


