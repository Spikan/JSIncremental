// Button Audio System (TypeScript)

import { errorHandler } from '../error-handling/error-handler';

let audioContext: AudioContext | null = null;
let buttonSoundsEnabled = true;

function ensureContext() {
  try {
    (audioContext as any)?.resume?.();
  } catch (error) {
    errorHandler.handleError(error, 'resumeAudioContext');
  }
}

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function playTone({
  freqStart,
  freqEnd,
  duration,
  type = 'sine',
  gain = 0.3,
  when = 0,
}: {
  freqStart: number;
  freqEnd?: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  when?: number;
}) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const g = audioContext.createGain();
  osc.type = type as OscillatorType;
  osc.connect(g);
  g.connect(audioContext.destination);
  const now = audioContext.currentTime + when;
  const end = now + duration;
  osc.frequency.setValueAtTime(freqStart, now);
  if (typeof freqEnd === 'number' && freqEnd >= 0) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), end);
  }
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, end);
  try {
    osc.start(now);
    osc.stop(end);
  } catch (error) {
    errorHandler.handleError(error, 'playSound', { freqStart, freqEnd, duration });
  }
}

function initButtonAudioContext() {
  try {
    if (!audioContext) {
      const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContext = new Ctx();
    }
    console.log('Button audio context initialized');
  } catch (error) {
    errorHandler.handleError(error, 'initializeButtonAudioContext', { critical: true });
  }
}

export function initButtonAudioSystem() {
  initButtonAudioContext();
  // iOS Safari requires a user gesture to resume the audio context
  ensureContext();
  try {
    const stored = localStorage.getItem('buttonSoundsEnabled');
    buttonSoundsEnabled = stored !== null ? stored === 'true' : true;
  } catch (_error) {
    buttonSoundsEnabled = true;
  }
  updateButtonSoundsToggleButton();
  console.log('Button audio system initialized');
}

export function toggleButtonSounds() {
  buttonSoundsEnabled = !buttonSoundsEnabled;
  try {
    localStorage.setItem('buttonSoundsEnabled', buttonSoundsEnabled.toString());
  } catch (error) {
    errorHandler.handleError(error, 'saveButtonSoundsEnabledState', {
      enabled: buttonSoundsEnabled,
    });
  }
  updateButtonSoundsToggleButton();
  console.log('Button sounds:', buttonSoundsEnabled ? 'ON' : 'OFF');
}

export function updateButtonSoundsToggleButton() {
  const buttonSoundsToggle = document.getElementById('buttonSoundsToggle');
  if (buttonSoundsToggle) {
    buttonSoundsToggle.textContent = buttonSoundsEnabled
      ? '🔊 Button Sounds ON'
      : '🔇 Button Sounds OFF';
    try {
      buttonSoundsToggle.classList.toggle('sounds-off', !buttonSoundsEnabled);
    } catch (error) {
      errorHandler.handleError(error, 'toggleButtonSoundsClass', { enabled: buttonSoundsEnabled });
    }
  }
}

export function playButtonClickSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    // Simple, satisfying click sound
    playTone({
      freqStart: 800,
      freqEnd: 400,
      duration: 0.1,
      type: 'square',
      gain: 0.15,
    });
  } catch (error) {
    // Error handling - logging removed for production
  }
}

export function playButtonPurchaseSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    // Simple purchase sound - ascending tone
    playTone({
      freqStart: 600,
      freqEnd: 800,
      duration: 0.15,
      type: 'sine',
      gain: 0.12,
    });
  } catch (error) {
    // Error handling - logging removed for production
  }
}

export function playButtonCriticalClickSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    // Simple critical click sound - higher pitch
    playTone({
      freqStart: 1000,
      freqEnd: 1200,
      duration: 0.2,
      type: 'square',
      gain: 0.2,
    });
  } catch (error) {
    // Error handling - logging removed for production
  }
}

export function getButtonSoundsEnabled() {
  return buttonSoundsEnabled;
}

// More differentiated sounds
export function playSodaClickSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    // Simple soda click sound - lower pitch
    playTone({
      freqStart: 200,
      freqEnd: 300,
      duration: 0.08,
      type: 'triangle',
      gain: 0.18,
    });
  } catch (error) {
    // Error handling - logging removed for production
  }
}

export function playLevelUpSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    // Simple level up sound - ascending chord
    playTone({
      freqStart: 400,
      freqEnd: 600,
      duration: 0.3,
      type: 'sine',
      gain: 0.2,
    });
  } catch (error) {
    // Error handling - logging removed for production
  }
}

export function playTabSwitchSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    const base = randBetween(450, 520);
    // Soft UI tick: quick up then down, low gain
    playTone({ freqStart: base, freqEnd: base * 1.1, duration: 0.04, type: 'sine', gain: 0.12 });
    playTone({
      freqStart: base * 0.9,
      freqEnd: base * 0.8,
      duration: 0.05,
      type: 'triangle',
      gain: 0.08,
      when: 0.04,
    });
  } catch (error) {
    errorHandler.handleError(error, 'playTabSwitchSound');
  }
}
