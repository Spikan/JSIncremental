// Button Audio System (TypeScript)

let audioContext: AudioContext | null = null;
let buttonSoundsEnabled = true;

function ensureContext() {
  try { (audioContext as any)?.resume?.(); } catch {}
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
}: { freqStart: number; freqEnd?: number; duration: number; type?: OscillatorType; gain?: number; when?: number; }) {
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
  try { osc.start(now); osc.stop(end); } catch {}
}

function initButtonAudioContext() {
  try {
    if (!audioContext) {
      const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContext = new Ctx();
    }
    console.log('Button audio context initialized');
  } catch (error) {
    console.error('Failed to initialize button audio context:', error);
  }
}

export function initButtonAudioSystem() {
  initButtonAudioContext();
  // iOS Safari requires a user gesture to resume the audio context
  ensureContext();
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
    ensureContext();
    const base = randBetween(700, 900);
    playTone({ freqStart: base, freqEnd: base * 0.5, duration: 0.08, type: 'triangle', gain: 0.28 });
  } catch (error) {
    console.error('Error playing button click sound:', error);
  }
}

export function playButtonPurchaseSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    const start = randBetween(700, 850);
    // Softer purchase: triangle primary + sine undertone, gentler gain
    playTone({ freqStart: start, freqEnd: start * 0.65, duration: 0.1, type: 'triangle', gain: 0.16 });
    playTone({ freqStart: start * 0.6, freqEnd: start * 0.5, duration: 0.12, type: 'sine', gain: 0.09 });
  } catch (error) {
    console.error('Error playing button purchase sound:', error);
  }
}

export function playButtonCriticalClickSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    const base = randBetween(1100, 1400);
    playTone({ freqStart: base, freqEnd: base * 0.55, duration: 0.18, type: 'square', gain: 0.32 });
    playTone({ freqStart: base * 0.5, freqEnd: base * 0.35, duration: 0.18, type: 'triangle', gain: 0.18 });
  } catch (error) {
    console.error('Error playing button critical click sound:', error);
  }
}

export function getButtonSoundsEnabled() { return buttonSoundsEnabled; }

// More differentiated sounds
export function playSodaClickSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    const base = randBetween(180, 240);
    playTone({ freqStart: base, freqEnd: base * 1.15, duration: 0.05, type: 'triangle', gain: 0.22 });
    playTone({ freqStart: base * 1.2, freqEnd: base * 0.9, duration: 0.06, type: 'sine', gain: 0.18, when: 0.03 });
  } catch {}
}

export function playLevelUpSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    const root = randBetween(300, 360);
    // Upward arpeggio: root, major third, fifth
    playTone({ freqStart: root, freqEnd: root, duration: 0.09, type: 'sine', gain: 0.25 });
    playTone({ freqStart: root * 1.25, freqEnd: root * 1.25, duration: 0.09, type: 'triangle', gain: 0.22, when: 0.09 });
    playTone({ freqStart: root * 1.5, freqEnd: root * 1.5, duration: 0.12, type: 'square', gain: 0.2, when: 0.18 });
  } catch {}
}

export function playTabSwitchSound() {
  if (!buttonSoundsEnabled || !audioContext) return;
  try {
    ensureContext();
    const base = randBetween(450, 520);
    // Soft UI tick: quick up then down, low gain
    playTone({ freqStart: base, freqEnd: base * 1.1, duration: 0.04, type: 'sine', gain: 0.12 });
    playTone({ freqStart: base * 0.9, freqEnd: base * 0.8, duration: 0.05, type: 'triangle', gain: 0.08, when: 0.04 });
  } catch {}
}


