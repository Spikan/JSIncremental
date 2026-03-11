import { describe, it, expect, beforeEach, vi } from 'vitest';
import { showOfflineProgress, showPurchaseFeedback } from '../ts/ui/feedback';

describe('UI injection safety', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="shopDiv"></div>';
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1)
    );
  });

  it('renders purchase feedback item name as text, not HTML', () => {
    showPurchaseFeedback('<img src=x onerror="window.__pwned=true">', 25, 10, 10);

    const item = document.querySelector('.purchase-item');
    expect(item?.textContent).toBe('<img src=x onerror="window.__pwned=true">');
    expect(item?.querySelector('img')).toBeNull();
  });

  it('renders offline progress values safely and avoids inline handlers', () => {
    showOfflineProgress(
      '</span><script>window.__xss=1</script>' as unknown as number,
      '<img src=x onerror=1>' as unknown as number
    );

    const modal = document.querySelector('.offline-progress-modal');
    expect(modal).not.toBeNull();

    const scriptTag = modal?.querySelector('script');
    expect(scriptTag).toBeNull();

    const continueButton = modal?.querySelector(
      '.offline-continue-btn'
    ) as HTMLButtonElement | null;
    expect(continueButton?.getAttribute('onclick')).toBeNull();

    continueButton?.click();
    expect(document.querySelector('.offline-progress-modal')).toBeNull();
  });
});
