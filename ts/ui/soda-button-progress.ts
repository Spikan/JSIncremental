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
  let liquid: HTMLElement | null = null;
  let foam: HTMLElement | null = null;
  let bubbles: HTMLElement | null = null;
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
.soda-progress-cup {
  position: absolute;
  left: 16%;
  right: 16%;
  top: 8%;
  bottom: 8%;
  filter: drop-shadow(0 16px 26px rgba(19, 12, 9, 0.15));
}
.soda-progress-rim {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 0;
  height: 10%;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.32)),
    linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.45);
  box-shadow:
    0 2px 0 rgba(255,255,255,0.22),
    inset 0 -2px 4px rgba(87,57,33,0.18);
  z-index: 3;
}
.soda-progress-inner {
  position: absolute;
  inset: 6% 10% 4%;
  overflow: hidden;
  border-radius: 26px 26px 34px 34px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08) 16%, rgba(255,255,255,0.03) 100%);
  border: 2px solid rgba(255, 246, 234, 0.58);
  border-top-width: 3px;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.1),
    inset 0 -12px 18px rgba(36, 21, 12, 0.1),
    0 12px 20px rgba(14, 8, 5, 0.08);
}
.soda-progress-inner::before {
  content: '';
  position: absolute;
  top: 10%;
  bottom: 14%;
  left: 12%;
  width: 12%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.02));
  z-index: 2;
}
.soda-progress-inner::after {
  content: '';
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 4%;
  height: 10%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255,255,255,0.14), transparent 72%);
  z-index: 1;
}
.soda-progress-liquid {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0%;
  background:
    radial-gradient(circle at 22% 14%, rgba(255,255,255,0.24), transparent 22%),
    linear-gradient(180deg, rgba(242,187,99,0.94), var(--cola-caramel) 22%, var(--cola-amber) 42%, var(--cola-dark) 100%);
  will-change: height;
}
.soda-progress-foam {
  position: absolute;
  left: 6%;
  right: 6%;
  height: 14px;
  background:
    radial-gradient(circle at 12% 58%, rgba(255,255,255,0.98), rgba(255,255,255,0.76) 54%, transparent 56%),
    radial-gradient(circle at 34% 38%, rgba(255,255,255,1), rgba(255,255,255,0.82) 52%, transparent 53%),
    radial-gradient(circle at 58% 44%, rgba(255,255,255,0.96), rgba(255,255,255,0.76) 52%, transparent 54%),
    radial-gradient(circle at 84% 52%, rgba(255,255,255,0.96), rgba(255,255,255,0.74) 56%, transparent 58%);
  filter: drop-shadow(0 2px 6px rgba(255,255,255,0.28));
  bottom: 0;
  z-index: 2;
}
.soda-progress-bubbles {
  position: absolute;
  inset: 14% 10% 10%;
  opacity: 0.42;
}
.soda-progress-bubble {
  position: absolute;
  bottom: 0;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.88), rgba(255,255,255,0.18) 70%, transparent 72%);
  animation: sodaBubbleRise 3.8s linear infinite;
}
.soda-progress-bubble:nth-child(1) { left: 22%; animation-delay: 0s; }
.soda-progress-bubble:nth-child(2) { left: 48%; animation-delay: 1.1s; width: 6px; height: 6px; }
.soda-progress-bubble:nth-child(3) { left: 70%; animation-delay: 2.3s; width: 7px; height: 7px; }
.soda-progress-label {
  position: absolute;
  left: 50%;
  bottom: 1%;
  transform: translateX(-50%);
  min-width: 96px;
  padding: 6px 10px;
  border-radius: 999px;
  text-align: center;
  font-weight: 700;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  color: #fff8ef;
  text-shadow: 0 1px 2px rgba(0,0,0,0.45);
  background: linear-gradient(180deg, rgba(70,40,19,0.82), rgba(39,21,10,0.88));
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 8px 16px rgba(14,8,5,0.12);
}

@keyframes sodaBubbleRise {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  20% { opacity: 0.9; }
  100% { transform: translateY(-120px) scale(1.1); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .soda-progress-liquid { transition: none !important; }
  .soda-progress-foam { transition: none !important; }
  .soda-progress-bubble { animation: none !important; opacity: 0.18; }
}

@media (max-width: 600px) {
  .soda-progress-cup {
    left: 14%;
    right: 14%;
    top: 8%;
    bottom: 8%;
  }
  .soda-progress-inner {
    inset: 6% 8% 5%;
  }
  .soda-progress-foam {
    left: 5%;
    right: 5%;
    height: 12px;
  }
  .soda-progress-label {
    bottom: 1%;
    min-width: 84px;
    padding: 4px 8px;
    font-size: 0.58rem;
  }
  .soda-progress-bubbles {
    display: none;
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
      for (let i = 0; i < 3; i++) {
        const bubble = document.createElement('span');
        bubble.className = 'soda-progress-bubble';
        bubbleGroup.appendChild(bubble);
      }

      const lbl = document.createElement('div');
      lbl.className = 'soda-progress-label';
      lbl.textContent = 'FILL 0%';

      glass.appendChild(liq);
      glass.appendChild(fm);
      glass.appendChild(bubbleGroup);
      cup.appendChild(rim);
      cup.appendChild(glass);
      root.appendChild(cup);
      root.appendChild(lbl);

      liquid = liq;
      foam = fm;
      bubbles = bubbleGroup;
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
    foam.style.bottom = `max(6%, calc(${pct}% - 7px))`;
    label.textContent = `FILL ${Math.round(pct)}%`;
    if (bubbles) {
      bubbles.style.opacity = pct < 8 ? '0.12' : '0.42';
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
