// Soda Button Progress Overlay (Cup fill + foam)

import { config } from '../config';

/* eslint-disable no-unused-vars */
export interface SodaButtonProgressAPI {
  mount(): void;
  unmount(): void;
  update(progressPercent: number): void;
  setReducedMotion(value: boolean): void;
}
/* eslint-enable no-unused-vars */

export function isSodaButtonProgressEnabled(): boolean {
  try {
    return !!config.UI?.SODA_BUTTON_PROGRESS;
  } catch {
    return false;
  }
}

export function createSodaButtonProgress(targetButton: HTMLElement): SodaButtonProgressAPI {
  let root: HTMLElement | null = null;
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
  --cola-amber: #945021;
  --cola-caramel: #cf8b3b;
  --foam: #ffffff;
}

.soda-progress-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 2;
  --soda-progress: 0;
}
.soda-progress-halo {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 217, 117, 0.28), transparent 64%);
  filter: blur(14px);
  animation: sodaHaloPulse 3s ease-in-out infinite;
}

.soda-progress-ring {
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  background:
    conic-gradient(
      from -90deg,
      rgba(255, 236, 186, 0.98) 0 calc(var(--soda-progress) * 1%),
      rgba(255, 255, 255, 0.18) calc(var(--soda-progress) * 1%) 100%
    );
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.16);
}

.soda-progress-ring::after {
  content: '';
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08)),
    rgba(255,255,255,0.04);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.14),
    inset 0 12px 18px rgba(255,255,255,0.08);
}

.soda-progress-core {
  position: absolute;
  inset: 22%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 24%, rgba(255,255,255,0.2), transparent 22%),
    linear-gradient(180deg, #7a4219, #35190b 72%, #261108);
  border: 1px solid rgba(255, 234, 198, 0.2);
  box-shadow:
    inset 0 14px 18px rgba(255,255,255,0.08),
    inset 0 -14px 18px rgba(0,0,0,0.18),
    0 16px 24px rgba(18,10,7,0.18);
}

.soda-progress-copy {
  position: absolute;
  inset: 28%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
  z-index: 1;
}

.soda-progress-title {
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  color: #fff4d3;
  text-transform: uppercase;
}

.soda-progress-subtitle {
  font-size: 0.56rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: rgba(255, 245, 224, 0.7);
  text-transform: uppercase;
}

.soda-progress-label {
  position: absolute;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
  min-width: 104px;
  padding: 7px 10px;
  border-radius: 999px;
  text-align: center;
  font-weight: 700;
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  color: #fff8ef;
  text-shadow: 0 1px 2px rgba(0,0,0,0.45);
  background: linear-gradient(180deg, rgba(50,29,14,0.88), rgba(27,14,8,0.9));
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 10px 18px rgba(14,8,5,0.16);
}

@keyframes sodaHaloPulse {
  0%, 100% { opacity: 0.7; transform: scale(0.98); }
  50% { opacity: 1; transform: scale(1.03); }
}

@media (prefers-reduced-motion: reduce) {
  .soda-progress-halo { animation: none !important; }
}

@media (max-width: 600px) {
  .soda-progress-core {
    inset: 20%;
  }
  .soda-progress-copy {
    inset: 26%;
  }
  .soda-progress-label {
    bottom: 11%;
    min-width: 92px;
    padding: 4px 8px;
    font-size: 0.58rem;
  }
  .soda-progress-title {
    font-size: 0.76rem;
  }
  .soda-progress-subtitle {
    font-size: 0.52rem;
  }
}
`;
    document.head.appendChild(style);
  }

  function mount() {
    ensureStyles();
    if (!root) {
      root = document.createElement('div');
      root.className = 'soda-progress-overlay';

      const halo = document.createElement('div');
      halo.className = 'soda-progress-halo';

      const ring = document.createElement('div');
      ring.className = 'soda-progress-ring';

      const core = document.createElement('div');
      core.className = 'soda-progress-core';

      const copy = document.createElement('div');
      copy.className = 'soda-progress-copy';

      const title = document.createElement('div');
      title.className = 'soda-progress-title';
      title.textContent = 'Drink';

      const subtitle = document.createElement('div');
      subtitle.className = 'soda-progress-subtitle';
      subtitle.textContent = 'Tap to Sip';

      const lbl = document.createElement('div');
      lbl.className = 'soda-progress-label';
      lbl.textContent = 'FILL 0%';

      copy.appendChild(title);
      copy.appendChild(subtitle);
      root.appendChild(halo);
      root.appendChild(ring);
      root.appendChild(core);
      root.appendChild(copy);
      root.appendChild(lbl);

      label = lbl;
    }
    if (targetButton && root && !targetButton.contains(root)) {
      targetButton.style.position = targetButton.style.position || 'relative';
      root.classList.toggle('reduced-motion', reducedMotion);
      targetButton.appendChild(root);
    }
  }

  function unmount() {
    if (root && root.parentElement) root.parentElement.removeChild(root);
  }

  function update(progressPercent: number) {
    if (!root || !label) return;
    const pct = Math.min(Math.max(progressPercent, 0), 100);
    root.style.setProperty('--soda-progress', pct.toFixed(2));
    label.textContent = `FILL ${Math.round(pct)}%`;
    root.classList.toggle('reduced-motion', reducedMotion);
  }

  function setReducedMotion(value: boolean) {
    reducedMotion = value;
    if (root) root.classList.toggle('reduced-motion', reducedMotion);
  }

  return { mount, unmount, update, setReducedMotion };
}
