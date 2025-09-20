// Soda Button Percentage Indicator (ring + label)

export interface SodaIndicatorAPI {
  mount: () => void;
  unmount: () => void;
  update: (percent: number) => void;
}

export function createSodaButtonIndicator(targetButton: HTMLElement): SodaIndicatorAPI {
  let root: HTMLElement | null = null;
  let ring: HTMLElement | null = null;
  let label: HTMLElement | null = null;

  function ensureStyles() {
    if (document.getElementById('soda-indicator-styles')) return;
    const style = document.createElement('style');
    style.id = 'soda-indicator-styles';
    style.textContent = `
.soda-indicator { position: absolute; inset: 0; pointer-events: none; }
.soda-indicator__ring { display: none; }
.soda-indicator__label {
  position: absolute;
  left: 50%; transform: translateX(-50%);
  bottom: 6%;
  font-weight: 800; font-size: 0.9rem; color: #111;
  background: linear-gradient(180deg, #fff, #f0f0f0);
  padding: 2px 8px; border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  border: 1px solid rgba(0,0,0,0.08);
  transition: background 150ms ease, color 150ms ease;
}
/* Radial ticks removed per design */
@media (max-width: 600px) {
  .soda-indicator__label { font-size: 0.8rem; padding: 2px 6px; }
}
`;
    document.head.appendChild(style);
  }

  function mount() {
    ensureStyles();
    if (!root) {
      root = document.createElement('div');
      root.className = 'soda-indicator';
      ring = document.createElement('div');
      ring.className = 'soda-indicator__ring';
      label = document.createElement('div');
      label.className = 'soda-indicator__label';
      label.textContent = '0%';
      label.setAttribute('role', 'status');
      label.setAttribute('aria-live', 'polite');
      label.setAttribute('aria-atomic', 'true');
      root.appendChild(ring);
      root.appendChild(label);
    }
    if (targetButton && root && !targetButton.contains(root)) {
      const previousPosition = window.getComputedStyle(targetButton).position;
      if (previousPosition === 'static' || !previousPosition) {
        (targetButton as HTMLElement).style.position = 'relative';
      }
      targetButton.appendChild(root);
    }
  }

  function unmount() {
    if (root && root.parentElement) root.parentElement.removeChild(root);
  }

  function update(percent: number) {
    if (!ring || !label) return;
    const clamped = Math.min(Math.max(percent, 0), 100);
    const angle = (clamped / 100) * 360;
    (ring as HTMLElement).style.setProperty('--ring-angle', `${angle}deg`);
    const pct = Math.round(clamped);
    label.textContent = `${pct}%`;
    // Color ramp: 0-100 maps amber -> cola -> cream
    const t = pct / 100;
    const bg =
      t < 0.5
        ? `linear-gradient(180deg, #fff, #f0f0f0)`
        : `linear-gradient(180deg, #fffbe6, #ffe9b3)`;
    const text = t < 0.85 ? '#111' : '#3a2a00';
    (label as HTMLElement).style.background = bg;
    (label as HTMLElement).style.color = text;
  }

  return { mount, unmount, update };
}
