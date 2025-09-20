export class HeaderAccessibilityController {
  private respectReducedMotion: boolean;
  private onReducedMotionChange: (enabled: boolean) => void;

  constructor(options: { respectReducedMotion: boolean; onReducedMotionChange: (enabled: boolean) => void }) {
    this.respectReducedMotion = options.respectReducedMotion;
    this.onReducedMotionChange = options.onReducedMotionChange;
  }

  public shouldEnableForAccessibility(): boolean {
    if (!this.respectReducedMotion) return true;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  public installListeners(): void {
    if (!this.respectReducedMotion) return;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', e => {
      this.onReducedMotionChange(!e.matches);
    });
  }
}


