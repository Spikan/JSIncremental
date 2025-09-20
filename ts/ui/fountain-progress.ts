// Fountain Cola Progress Component (Phase 1)
// Cup mask + cola liquid + foam band + percentage text

import { config } from '../config';

export interface FountainProgressOptions {
  reducedMotion?: boolean;
  ariaLabel?: string;
}

export interface FountainProgressAPI {
  mount: () => void;
  unmount: () => void;
  update: (progressPercent: number, drinkRateMs?: number) => void;
  setReducedMotion: (value: boolean) => void;
}

export function createFountainProgress(
  targetContainer: HTMLElement,
  options: FountainProgressOptions = {}
): FountainProgressAPI {
  let root: HTMLElement | null = null;
  let liquid: HTMLElement | null = null;
  let foam: HTMLElement | null = null;
  let label: HTMLElement | null = null;
  let reducedMotion = !!options.reducedMotion;

  function ensureStylesInjected() {
    if (document.getElementById('fountain-progress-styles')) return;
    const style = document.createElement('style');
    style.id = 'fountain-progress-styles';
    style.textContent = `
:root {
  --cola-dark: #2b130a;
  --cola-amber: #7a3b17;
  --foam: #ffffff;
  --cup-red: #d62828;
  --cup-white: #ffffff;
}

.fountain-host {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
  overflow: visible;
}

.fountain-panel {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0 4px;
}

.fountain-progress {
  position: relative;
  width: min(260px, 90%);
  height: 28px;
  margin: 0 auto;
}
.fountain-progress[hidden] { display: none !important; }

/* Container behaves like existing bar height */
.fountain-progress__cup {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(180deg, var(--cup-white) 0%, var(--cup-white) 40%, var(--cup-red) 41%);
  overflow: hidden;
}

.fountain-progress__mask {
  position: absolute;
  inset: 2px;
  border-radius: 4px;
  overflow: hidden;
  background: transparent;
}

.fountain-progress__liquid {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 0%;
  background: linear-gradient(180deg, var(--cola-amber), var(--cola-dark));
  transform-origin: bottom;
  will-change: transform, height;
}

.fountain-progress__foam {
  position: absolute;
  left: 0; right: 0;
  height: 5px;
  background: var(--foam);
  box-shadow: 0 0 4px rgba(255,255,255,0.6);
  transform: translateY(0);
}

.fountain-progress__label {
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-weight: 700;
  font-size: 0.9rem;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .fountain-progress__liquid { transition: none !important; }
  .fountain-progress__foam { transition: none !important; }
}
`;
    document.head.appendChild(style);
  }

  function createDom() {
    root = document.createElement('div');
    root.className = 'fountain-progress';
    if (options.ariaLabel) root.setAttribute('aria-label', options.ariaLabel);
    root.setAttribute('role', 'progressbar');

    const cup = document.createElement('div');
    cup.className = 'fountain-progress__cup';

    const mask = document.createElement('div');
    mask.className = 'fountain-progress__mask';

    const liq = document.createElement('div');
    liq.className = 'fountain-progress__liquid';

    const fm = document.createElement('div');
    fm.className = 'fountain-progress__foam';

    const lbl = document.createElement('div');
    lbl.className = 'fountain-progress__label';
    lbl.textContent = '0%';

    mask.appendChild(liq);
    mask.appendChild(fm);
    cup.appendChild(mask);
    root.appendChild(cup);
    root.appendChild(lbl);

    liquid = liq;
    foam = fm;
    label = lbl;
  }

  function mount() {
    ensureStylesInjected();
    if (!root) createDom();
    if (!root || !targetContainer) return;
    if (!targetContainer.contains(root)) {
      // If this is the legacy bar container, avoid nuking content; otherwise append
      if (targetContainer.id === 'drinkProgressBar') {
        targetContainer.innerHTML = '';
        targetContainer.appendChild(root);
      } else {
        targetContainer.appendChild(root);
      }
    }
  }

  function unmount() {
    if (root && root.parentElement) root.parentElement.removeChild(root);
  }

  function update(progressPercent: number, _drinkRateMs?: number) {
    if (!root || !liquid || !foam || !label) return;
    const pct = Math.min(Math.max(progressPercent, 0), 100);

    // Height fill and foam position
    liquid.style.height = `${pct}%`;
    // Foam anchors to liquid top
    foam.style.bottom = `${pct}%`;

    // Label
    label.textContent = `${Math.round(pct)}%`;
    root.setAttribute('aria-valuenow', String(Math.round(pct)));
    root.setAttribute('aria-valuemin', '0');
    root.setAttribute('aria-valuemax', '100');

    // Motion preferences
    if (!reducedMotion) {
      liquid.style.transition = 'height 120ms linear';
      foam.style.transition = 'bottom 120ms linear, height 120ms linear';
    } else {
      liquid.style.transition = 'none';
      foam.style.transition = 'none';
    }
  }

  function setReducedMotion(value: boolean) {
    reducedMotion = value;
  }

  // Phase 1 returns API without bubbles/ice/streams
  return { mount, unmount, update, setReducedMotion };
}

// Helper to check if feature flag is on
export function isFountainEnabled(): boolean {
  try {
    return !!config.UI?.FOUNTAIN_SODA_PROGRESS;
  } catch {
    return false;
  }
}
