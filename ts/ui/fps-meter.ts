// Lightweight FPS meter overlay

let rafId: number | null = null;
let meterEl: HTMLElement | null = null;
let lastTime = 0;
let frameCount = 0;
let lastFps = 0;

function ensureStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('fps-meter-styles')) return;
  const style = document.createElement('style');
  style.id = 'fps-meter-styles';
  style.textContent = `
.fps-meter{position:fixed;right:8px;bottom:8px;z-index:9999;background:rgba(0,0,0,0.6);color:#fff;font:600 12px/1.2 system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:6px 8px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.35);pointer-events:none}
.fps-meter.ok{background:rgba(0,128,0,.55)}
.fps-meter.warn{background:rgba(255,165,0,.55)}
.fps-meter.crit{background:rgba(178,34,34,.6)}
`;
  document.head.appendChild(style);
}

function classifyFps(fps: number): 'ok' | 'warn' | 'crit' {
  if (fps >= 50) return 'ok';
  if (fps >= 30) return 'warn';
  return 'crit';
}

function loop(ts: number): void {
  if (!meterEl) return;
  if (!lastTime) lastTime = ts;
  frameCount += 1;
  const delta = ts - lastTime;
  if (delta >= 500) {
    lastFps = Math.round((frameCount * 1000) / delta);
    meterEl.textContent = `FPS: ${lastFps}`;
    meterEl.classList.remove('ok', 'warn', 'crit');
    meterEl.classList.add(classifyFps(lastFps));
    frameCount = 0;
    lastTime = ts;
  }
  rafId = requestAnimationFrame(loop);
}

export function initFPSMeter(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  ensureStyles();
  if (!meterEl) {
    meterEl = document.createElement('div');
    meterEl.className = 'fps-meter ok';
    meterEl.textContent = 'FPS: --';
    document.body.appendChild(meterEl);
  }
  if (!rafId) rafId = requestAnimationFrame(loop);
}

export function destroyFPSMeter(): void {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  if (meterEl && meterEl.parentElement) meterEl.parentElement.removeChild(meterEl);
  meterEl = null;
  lastTime = 0;
  frameCount = 0;
  lastFps = 0;
}
