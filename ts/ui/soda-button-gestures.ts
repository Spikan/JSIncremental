// Soda button gesture handling extracted from buttons.ts

import { errorHandler } from '../core/error-handling/error-handler';
import { mobileInputHandler } from './mobile-input';
import { setLastPointerPosition } from '../services/pointer-tracker';
import { trackClickFactory, handleSodaClickFactory } from '../core/systems/clicks-system';
import { updateAllDisplaysOptimized } from './displays';
import { domQuery } from '../services/dom-query';
import { markPointerHandled, shouldSuppressClick } from './pointer-meta';

const MOVEMENT_THRESHOLD = 15;

// markPointerHandled/shouldSuppressClick now provided by pointer-meta

export async function setupSodaButtonGestures(): Promise<void> {
  // Try to ensure button exists
  const sodaDomCacheBtn = domQuery.getById('sodaButton') as HTMLElement | null | undefined;
  const sodaButton = (sodaDomCacheBtn ||
    document.getElementById('sodaButton')) as HTMLElement | null;
  if (!sodaButton) {
    errorHandler.handleError(new Error('Soda button not found'), 'sodaButtonNotFound', {
      critical: true,
    });
    return;
  }

  let touchHandled = false;

  // Store scroll start Y per element to avoid element property hacks
  const scrollStartYMap = new WeakMap<HTMLElement, number>();

  if ('PointerEvent' in window) {
    let active = false;
    let moved = false;
    let sx = 0;
    let sy = 0;
    const reset = () => {
      active = false;
      moved = false;
      if (sodaButton) scrollStartYMap.delete(sodaButton);
      setTimeout(() => {
        touchHandled = false;
      }, 100);
    };
    sodaButton.addEventListener('pointerdown', (e: PointerEvent) => {
      if (!e || e.pointerType === 'mouse') return;
      active = true;
      moved = false;
      sx = e.clientX || 0;
      sy = e.clientY || 0;
      try {
        setLastPointerPosition(sx, sy, e.pointerType as unknown as 'mouse' | 'touch' | 'pen');
      } catch {}
      scrollStartYMap.set(sodaButton, window.scrollY);
      try {
        sodaButton.classList.add('soda-clicked');
      } catch (err) {
        errorHandler.handleError(err, 'addVisualFeedback');
      }
    });
    sodaButton.addEventListener('pointermove', (e: PointerEvent) => {
      if (!active || !e || e.pointerType === 'mouse') return;
      const dx = (e.clientX || 0) - sx;
      const dy = (e.clientY || 0) - sy;
      if (Math.abs(dx) > MOVEMENT_THRESHOLD || Math.abs(dy) > MOVEMENT_THRESHOLD) moved = true;
      try {
        setLastPointerPosition(
          e.clientX || sx,
          e.clientY || sy,
          e.pointerType as unknown as 'mouse' | 'touch' | 'pen'
        );
      } catch {}
    });
    sodaButton.addEventListener('pointerup', (e: PointerEvent) => {
      if (!active || !e || e.pointerType === 'mouse') {
        reset();
        return;
      }
      const startY = scrollStartYMap.get(sodaButton) ?? window.scrollY;
      const scrollDelta = Math.abs(window.scrollY - startY);
      const isScroll =
        mobileInputHandler.isActive() &&
        mobileInputHandler.isLikelyScroll(sx, sy, e.clientX || sx, e.clientY || sy, scrollDelta);
      if (!moved && !isScroll) {
        markPointerHandled(sodaButton);
        touchHandled = true;
        try {
          setLastPointerPosition(
            e.clientX || sx,
            e.clientY || sy,
            e.pointerType as unknown as 'mouse' | 'touch' | 'pen'
          );
        } catch {}
        try {
          sodaButton.classList.remove('soda-clicked');
        } catch (err) {
          errorHandler.handleError(err, 'removeVisualFeedback');
        }
        try {
          const trackClick = trackClickFactory();
          const handleSodaClick = handleSodaClickFactory({ trackClick });
          handleSodaClick(1.0);
          try {
            updateAllDisplaysOptimized();
          } catch (err) {
            errorHandler.handleError(err, 'updateAllDisplays');
          }
        } catch (err) {
          // swallow to avoid breaking UX
        }
      }
      reset();
    });
    sodaButton.addEventListener('pointercancel', () => {
      touchHandled = false;
      scrollStartYMap.delete(sodaButton);
    });
  } else if ('ontouchstart' in window) {
    let active = false;
    let moved = false;
    let sx = 0;
    let sy = 0;
    const reset = () => {
      active = false;
      moved = false;
      scrollStartYMap.delete(sodaButton);
      setTimeout(() => {
        touchHandled = false;
      }, 100);
    };
    sodaButton.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (!e || !e.touches || !e.touches[0]) return;
        active = true;
        moved = false;
        sx = e.touches[0].clientX || 0;
        sy = e.touches[0].clientY || 0;
        try {
          setLastPointerPosition(sx, sy, 'touch');
        } catch {}
        scrollStartYMap.set(sodaButton, typeof window !== 'undefined' ? window.scrollY : 0);
        try {
          sodaButton.classList.add('soda-clicked');
        } catch (err) {
          errorHandler.handleError(err, 'addVisualFeedback');
        }
      },
      { passive: true }
    );
    sodaButton.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (!active || !e || !e.touches || !e.touches[0]) return;
        const dx = (e.touches[0].clientX || 0) - sx;
        const dy = (e.touches[0].clientY || 0) - sy;
        if (Math.abs(dx) > MOVEMENT_THRESHOLD || Math.abs(dy) > MOVEMENT_THRESHOLD) moved = true;
        try {
          setLastPointerPosition(e.touches[0].clientX || sx, e.touches[0].clientY || sy, 'touch');
        } catch {}
      },
      { passive: true }
    );
    sodaButton.addEventListener('touchend', (e: TouchEvent) => {
      if (!active) {
        reset();
        return;
      }
      const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      const startY = scrollStartYMap.get(sodaButton) ?? currentScrollY;
      const scrollDelta = Math.abs(currentScrollY - startY);
      const isScroll =
        mobileInputHandler.isActive() &&
        mobileInputHandler.isLikelyScroll(
          sx,
          sy,
          e.changedTouches[0]?.clientX || sx,
          e.changedTouches[0]?.clientY || sy,
          scrollDelta
        );
      if (!moved && !isScroll) {
        markPointerHandled(sodaButton);
        touchHandled = true;
        try {
          setLastPointerPosition(
            e.changedTouches[0]?.clientX || sx,
            e.changedTouches[0]?.clientY || sy,
            'touch'
          );
        } catch {}
        try {
          sodaButton.classList.remove('soda-clicked');
        } catch (err) {
          errorHandler.handleError(err, 'removeVisualFeedback');
        }
        try {
          const trackClick = trackClickFactory();
          const handleSodaClick = handleSodaClickFactory({ trackClick });
          handleSodaClick(1.0);
          try {
            updateAllDisplaysOptimized();
          } catch (err) {
            errorHandler.handleError(err, 'updateAllDisplays');
          }
        } catch (err) {
          // swallow
        }
      }
      reset();
    });
    sodaButton.addEventListener('touchcancel', () => {
      touchHandled = false;
      scrollStartYMap.delete(sodaButton);
    });
  }

  sodaButton.addEventListener('click', async (e: MouseEvent) => {
    if (shouldSuppressClick(sodaButton)) return;
    if (touchHandled) {
      touchHandled = false;
      return;
    }
    try {
      if (e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY)) {
        setLastPointerPosition(e.clientX, e.clientY, 'mouse');
      }
    } catch {}
    try {
      sodaButton.classList.add('soda-clicked');
      setTimeout(() => {
        try {
          sodaButton.classList.remove('soda-clicked');
        } catch {}
      }, 140);
    } catch {}
    try {
      const trackClick = trackClickFactory();
      const handleSodaClick = handleSodaClickFactory({ trackClick });
      await handleSodaClick(1.0);
      try {
        updateAllDisplaysOptimized();
      } catch (err) {
        errorHandler.handleError(err, 'updateAllDisplays');
      }
    } catch (err) {
      errorHandler.handleError(err, 'sodaClickHandler', { critical: true });
    }
  });
}
