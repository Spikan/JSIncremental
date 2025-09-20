// Soda Button Progress Overlay (Cup fill + foam)

import { config } from '../config';

export interface SodaButtonProgressAPI {
  mount: () => void;
  unmount: () => void;
  update: (progressPercent: number) => void;
  setReducedMotion: (value: boolean) => void;
}

export function isSodaButtonProgressEnabled(): boolean {
  try {
    return !!config.UI?.SODA_BUTTON_PROGRESS;
  } catch {
    return false;
  }
}

export function createSodaButtonProgress(targetButton: HTMLElement): SodaButtonProgressAPI {
  let root: HTMLElement | null = null;
  let liquid: HTMLElement | null = null;
  let foam: HTMLElement | null = null;
  let label: HTMLElement | null = null;
  let reducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ensureStyles() {
    if (document.getElementById('soda-button-progress-styles')) return;
    const style = document.createElement('style');
    style.id = 'soda-button-progress-styles';
    style.textContent = `
:root {
  --cola-dark: #2b130a;
  --cola-amber: #7a3b17;
  --foam: #ffffff;
}

.soda-progress-overlay { position: absolute; inset: 0; pointer-events: none; }
.soda-progress-cup {
  position: absolute; left: 10%; right: 10%; bottom: 8%; top: 8%;
  border-radius: 14% / 10%;
  overflow: hidden;
}
.soda-progress-liquid {
  position: absolute; left: 0; right: 0; bottom: 0; height: 0%;
  background: linear-gradient(180deg, var(--cola-amber), var(--cola-dark));
  will-change: height;
}
.soda-progress-foam {
  position: absolute; left: 0; right: 0; height: 6px; background: var(--foam);
  box-shadow: 0 0 6px rgba(255,255,255,0.7);
  bottom: 0; /* will be updated to match liquid top */
}
.soda-progress-shine {
  position: absolute; top: 8%; bottom: 8%; left: 12%; width: 8%;
  background: linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0));
  border-radius: 8px;
}
.soda-progress-label { position: absolute; bottom: 10%; right: 12%;
  font-weight: 700; font-size: 0.9rem; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.6); }

@media (prefers-reduced-motion: reduce) {
  .soda-progress-liquid { transition: none !important; }
  .soda-progress-foam { transition: none !important; }
}
`;
    document.head.appendChild(style);
  }

  function mount() {
    ensureStyles();
    if (!root) {
      root = document.createElement('div');
      root.className = 'soda-progress-overlay';

      const cup = document.createElement('div');
      cup.className = 'soda-progress-cup';

      const liq = document.createElement('div');
      liq.className = 'soda-progress-liquid';

      const fm = document.createElement('div');
      fm.className = 'soda-progress-foam';

      const sh = document.createElement('div');
      sh.className = 'soda-progress-shine';

      const lbl = document.createElement('div');
      lbl.className = 'soda-progress-label';
      lbl.textContent = '0%';

      cup.appendChild(liq);
      cup.appendChild(fm);
      root.appendChild(cup);
      root.appendChild(sh);
      root.appendChild(lbl);

      liquid = liq;
      foam = fm;
      label = lbl;
    }
    if (targetButton && root && !targetButton.contains(root)) {
      targetButton.style.position = targetButton.style.position || 'relative';
      targetButton.appendChild(root);
    }
  }

  function unmount() {
    if (root && root.parentElement) root.parentElement.removeChild(root);
  }

  function update(progressPercent: number) {
    if (!root || !liquid || !foam || !label) return;
    const pct = Math.min(Math.max(progressPercent, 0), 100);
    liquid.style.height = `${pct}%`;
    foam.style.bottom = `${pct}%`;
    label.textContent = `${Math.round(pct)}%`;
    if (!reducedMotion) {
      liquid.style.transition = 'height 120ms linear';
      foam.style.transition = 'bottom 120ms linear';
    } else {
      liquid.style.transition = 'none';
      foam.style.transition = 'none';
    }
  }

  function setReducedMotion(value: boolean) {
    reducedMotion = value;
  }

  return { mount, unmount, update, setReducedMotion };
}
