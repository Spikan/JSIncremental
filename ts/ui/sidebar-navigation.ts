/**
 * Sidebar Navigation System
 * Handles mobile sidebar toggle functionality
 */

export class SidebarNavigationManager {
  private sidebar: HTMLElement | null = null;
  private sidebarToggle: HTMLElement | null = null;
  private isMobile: boolean = false;

  constructor() {
    this.detectMobile();
    this.initializeSidebar();
  }

  private detectMobile(): void {
    this.isMobile = window.innerWidth <= 768;

    // Listen for resize events
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;

      if (wasMobile !== this.isMobile) {
        this.handleResponsiveChange();
      }
    });
  }

  private initializeSidebar(): void {
    this.sidebar = document.querySelector('.game-sidebar');
    this.sidebarToggle = document.querySelector('.sidebar-toggle');

    if (!this.sidebar) {
      console.warn('Sidebar element not found');
      return;
    }

    if (!this.sidebarToggle) {
      console.warn('Sidebar toggle button not found');
      return;
    }

    // Debug mobile detection
    console.log('Mobile detection:', {
      isMobile: this.isMobile,
      windowWidth: window.innerWidth,
      sidebarToggle: this.sidebarToggle,
      sidebarToggleDisplay: getComputedStyle(this.sidebarToggle).display,
    });

    // Set initial state
    this.updateSidebarState();

    // Add event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Sidebar toggle button
    if (this.sidebarToggle) {
      // Add click event
      this.sidebarToggle.addEventListener('click', () => {
        console.log('Sidebar toggle clicked');
        this.toggleSidebar();
      });

      // Add touch events for better mobile responsiveness
      this.sidebarToggle.addEventListener(
        'touchstart',
        e => {
          e.preventDefault();
          console.log('Sidebar toggle touch start');
          this.toggleSidebar();
        },
        { passive: false }
      );

      // Add pointer events for better cross-platform support
      this.sidebarToggle.addEventListener('pointerdown', e => {
        if (e.pointerType === 'touch') {
          e.preventDefault();
          console.log('Sidebar toggle pointer down (touch)');
          this.toggleSidebar();
        }
      });
    }

    // Close sidebar when clicking outside on mobile
    if (this.isMobile) {
      document.addEventListener('click', event => {
        const target = event.target as HTMLElement;
        if (
          this.sidebar?.classList.contains('expanded') &&
          !this.sidebar.contains(target) &&
          !this.sidebarToggle?.contains(target)
        ) {
          this.collapseSidebar();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.sidebar?.classList.contains('expanded')) {
        this.collapseSidebar();
      }
    });
  }

  public toggleSidebar(): void {
    if (!this.sidebar) return;

    if (this.sidebar.classList.contains('expanded')) {
      this.collapseSidebar();
    } else {
      this.expandSidebar();
    }
  }

  public expandSidebar(): void {
    if (!this.sidebar) return;

    this.sidebar.classList.add('expanded');
    this.sidebar.classList.remove('collapsed');

    // Add overlay for mobile
    if (this.isMobile) {
      this.addSidebarOverlay();
    }
  }

  public collapseSidebar(): void {
    if (!this.sidebar) return;

    this.sidebar.classList.remove('expanded');
    this.sidebar.classList.add('collapsed');

    // Remove overlay for mobile
    if (this.isMobile) {
      this.removeSidebarOverlay();
    }
  }

  private addSidebarOverlay(): void {
    // Remove existing overlay if any
    this.removeSidebarOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      backdrop-filter: blur(2px);
      animation: fadeIn 0.3s ease;
    `;

    overlay.addEventListener('click', () => {
      this.collapseSidebar();
    });

    // Prevent body scroll when sidebar is open
    document.body.style.overflow = 'hidden';

    document.body.appendChild(overlay);
  }

  private removeSidebarOverlay(): void {
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.remove();
    }

    // Restore body scroll
    document.body.style.overflow = '';
  }

  private updateSidebarState(): void {
    if (!this.sidebar) return;

    if (this.isMobile) {
      this.sidebar.classList.add('collapsed');
      this.sidebar.classList.remove('expanded');
    } else {
      this.sidebar.classList.remove('collapsed');
      this.sidebar.classList.remove('expanded');
    }
  }

  private handleResponsiveChange(): void {
    if (this.isMobile) {
      // Switching to mobile - collapse sidebar
      this.collapseSidebar();
    } else {
      // Switching to desktop - expand sidebar and remove overlay
      this.sidebar?.classList.remove('collapsed', 'expanded');
      this.removeSidebarOverlay();
    }
  }

  public isSidebarExpanded(): boolean {
    return this.sidebar?.classList.contains('expanded') || false;
  }

  public isMobileView(): boolean {
    return this.isMobile;
  }
}

// Global instance
export const sidebarNavigation = new SidebarNavigationManager();
