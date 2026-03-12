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
  let inner: HTMLElement | null = null;
  let liquid: HTMLElement | null = null;
  let foam: HTMLElement | null = null;
  let bubbles: HTMLElement | null = null;
  let badge: HTMLElement | null = null;
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
  pointer-events: none;
  z-index: 2;
}
.soda-progress-aura {
  position: absolute;
  left: 17%;
  right: 17%;
  top: 18%;
  bottom: 10%;
  border-radius: 42% 42% 26% 26%;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 232, 194, 0.22), transparent 26%),
    radial-gradient(circle at 50% 100%, rgba(83, 43, 18, 0.28), transparent 60%);
  filter: blur(12px);
}
.soda-progress-cup {
  position: absolute;
  left: 18%;
  right: 18%;
  top: 7%;
  bottom: 14%;
}
.soda-progress-rim {
  position: absolute;
  left: 10%;
  right: 10%;
  top: 0;
  height: 10%;
  border-radius: 999px / 80%;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,255,255,0.18)),
    linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02));
  box-shadow:
    0 2px 0 rgba(255,255,255,0.2),
    inset 0 -2px 4px rgba(87,57,33,0.22);
  z-index: 3;
}
.soda-progress-inner {
  position: absolute;
  inset: 5% 10% 0;
  overflow: hidden;
  clip-path: polygon(16% 0, 84% 0, 72% 100%, 28% 100%);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.04) 12%, rgba(93,61,35,0.14) 100%);
  border: 2px solid rgba(255, 246, 234, 0.5);
  border-top-width: 3px;
  border-bottom-width: 4px;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.08),
    inset 0 -18px 24px rgba(36, 21, 12, 0.18),
    0 12px 20px rgba(14, 8, 5, 0.12);
}
.soda-progress-liquid {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0%;
  background:
    radial-gradient(circle at 20% 18%, rgba(255,255,255,0.18), transparent 24%),
    linear-gradient(180deg, rgba(242,187,99,0.9), var(--cola-caramel) 18%, var(--cola-amber) 40%, var(--cola-dark) 100%);
  will-change: height;
}
.soda-progress-foam {
  position: absolute;
  left: 8%;
  right: 8%;
  height: 12px;
  background:
    radial-gradient(circle at 18% 50%, rgba(255,255,255,0.96), rgba(255,255,255,0.74) 56%, transparent 57%),
    radial-gradient(circle at 50% 42%, rgba(255,255,255,0.98), rgba(255,255,255,0.78) 54%, transparent 55%),
    radial-gradient(circle at 80% 54%, rgba(255,255,255,0.96), rgba(255,255,255,0.74) 56%, transparent 57%);
  filter: drop-shadow(0 0 5px rgba(255,255,255,0.42));
  bottom: 0;
  z-index: 2;
}
.soda-progress-bubbles {
  position: absolute;
  inset: 8% 10% 6%;
  opacity: 0.62;
}
.soda-progress-bubble {
  position: absolute;
  bottom: 0;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.88), rgba(255,255,255,0.18) 70%, transparent 72%);
  animation: sodaBubbleRise 3.2s linear infinite;
}
.soda-progress-bubble:nth-child(1) { left: 16%; animation-delay: 0s; }
.soda-progress-bubble:nth-child(2) { left: 40%; animation-delay: 0.9s; width: 7px; height: 7px; }
.soda-progress-bubble:nth-child(3) { left: 66%; animation-delay: 1.6s; width: 9px; height: 9px; }
.soda-progress-bubble:nth-child(4) { left: 54%; animation-delay: 2.2s; width: 6px; height: 6px; }
.soda-progress-badge {
  position: absolute;
  left: 50%;
  top: 36%;
  transform: translateX(-50%);
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: rgba(255, 247, 234, 0.92);
  background: rgba(56, 29, 14, 0.5);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 6px 16px rgba(15, 8, 4, 0.18);
  z-index: 3;
}
.soda-progress-shine {
  position: absolute;
  top: 14%;
  bottom: 12%;
  left: 24%;
  width: 12%;
  background: linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.04));
  border-radius: 999px;
  transform: skew(-8deg);
}
.soda-progress-label {
  position: absolute;
  left: 50%;
  bottom: 4%;
  transform: translateX(-50%);
  min-width: 112px;
  padding: 7px 12px;
  border-radius: 999px;
  text-align: center;
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: #fff8ef;
  text-shadow: 0 1px 2px rgba(0,0,0,0.45);
  background: linear-gradient(180deg, rgba(85,48,22,0.88), rgba(45,24,12,0.94));
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow: 0 10px 20px rgba(14,8,5,0.2);
}

@keyframes sodaBubbleRise {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  20% { opacity: 0.9; }
  100% { transform: translateY(-140px) scale(1.15); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .soda-progress-liquid { transition: none !important; }
  .soda-progress-foam { transition: none !important; }
  .soda-progress-bubble { animation: none !important; opacity: 0.18; }
}
`;
    document.head.appendChild(style);
  }

  function mount() {
    ensureStyles();
    if (!root) {
      root = document.createElement('div');
      root.className = 'soda-progress-overlay';

      const aura = document.createElement('div');
      aura.className = 'soda-progress-aura';

      const cup = document.createElement('div');
      cup.className = 'soda-progress-cup';

      const rim = document.createElement('div');
      rim.className = 'soda-progress-rim';

      const glass = document.createElement('div');
      glass.className = 'soda-progress-inner';

      const liq = document.createElement('div');
      liq.className = 'soda-progress-liquid';

      const fm = document.createElement('div');
      fm.className = 'soda-progress-foam';

      const bubbleGroup = document.createElement('div');
      bubbleGroup.className = 'soda-progress-bubbles';
      for (let i = 0; i < 4; i++) {
        const bubble = document.createElement('span');
        bubble.className = 'soda-progress-bubble';
        bubbleGroup.appendChild(bubble);
      }

      const sh = document.createElement('div');
      sh.className = 'soda-progress-shine';

      const bdg = document.createElement('div');
      bdg.className = 'soda-progress-badge';
      bdg.textContent = 'COLA';

      const lbl = document.createElement('div');
      lbl.className = 'soda-progress-label';
      lbl.textContent = 'FILL 0%';

      glass.appendChild(liq);
      glass.appendChild(fm);
      glass.appendChild(bubbleGroup);
      cup.appendChild(rim);
      cup.appendChild(glass);
      cup.appendChild(sh);
      cup.appendChild(bdg);
      root.appendChild(aura);
      root.appendChild(cup);
      root.appendChild(lbl);

      inner = glass;
      liquid = liq;
      foam = fm;
      bubbles = bubbleGroup;
      badge = bdg;
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
    if (!root || !inner || !liquid || !foam || !label) return;
    const pct = Math.min(Math.max(progressPercent, 0), 100);
    liquid.style.height = `${pct}%`;
    foam.style.bottom = `max(6%, calc(${pct}% - 6px))`;
    label.textContent = `FILL ${Math.round(pct)}%`;
    if (badge) {
      badge.style.opacity = pct > 72 ? '0.42' : '0.88';
    }
    if (bubbles) {
      bubbles.style.opacity = pct < 8 ? '0.18' : '0.62';
    }
    if (!reducedMotion) {
      liquid.style.transition = 'height 150ms cubic-bezier(0.2, 0.8, 0.2, 1)';
      foam.style.transition = 'bottom 150ms cubic-bezier(0.2, 0.8, 0.2, 1)';
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
