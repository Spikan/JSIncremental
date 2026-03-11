// Browser bootstrapping previously in inline scripts (moved for CSP compliance)

(function setupDiagnostics() {
  (window as any).__diag = Array.isArray((window as any).__diag) ? (window as any).__diag : [];

  window.addEventListener('error', e => {
    (window as any).__diag.push({ type: 'error', msg: e.message, src: e.filename, ln: e.lineno });
  });

  window.addEventListener('unhandledrejection', e => {
    const reason = e?.reason;
    (window as any).__diag.push({
      type: 'unhandledrejection',
      reason: `${reason && (reason.message || reason)}`,
    });
  });
})();

window.addEventListener('load', () => {
  console.log('✅ Modern UI loaded, TypeScript will handle initialization');
});

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    const gameContent = document.getElementById('gameContent');

    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        if (gameContent) {
          gameContent.style.display = 'block';
          gameContent.style.opacity = '0';
          requestAnimationFrame(() => {
            gameContent.style.transition = 'opacity 0.5s ease-out';
            gameContent.style.opacity = '1';
          });
        }
      }, 300);
    }
  }, 1000);

  let currentTheme = 'theme-beach';

  (window as any).switchTheme = (newTheme: string) => {
    document.body.classList.add('theme-transition');
    document.body.classList.remove(currentTheme);
    document.body.classList.add(newTheme);
    currentTheme = newTheme;

    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 500);
  };

  document.addEventListener('click', e => {
    const target = e.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(
      '.btn, .suction-btn, .upgrade-btn, .soda-button'
    ) as HTMLButtonElement | null;

    if (button && !button.disabled) {
      const ripple = document.createElement('div');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.className = 'click-ripple';
      ripple.style.cssText = `width: ${size}px; height: ${size}px; left: ${x}px; top: ${y}px;`;

      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 700);
    }
  });

  console.log('✅ Modern UI initialized with enhanced interactions');
});
