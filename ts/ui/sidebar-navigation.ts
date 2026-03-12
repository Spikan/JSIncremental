/**
 * Mobile Sidebar Navigation System
 * Simple, reliable mobile menu toggle
 */

export class SidebarNavigationManager {
  private sidebar: HTMLElement | null = null;
  private mobileMenuToggle: HTMLElement | null = null;
  private isMobile: boolean = false;
  private initialized: boolean = false;
  private resizeListenerRegistered: boolean = false;
  private missingElementsLogged = false;

  constructor() {
    this.initializeWhenReady();
  }

  private initializeWhenReady(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    this.isMobile = window.innerWidth <= 768;
    this.setupResizeListener();

    if (document.readyState === 'loading' && typeof document.addEventListener === 'function') {
      document.addEventListener('DOMContentLoaded', () => this.initialize(), { once: true });
      return;
    }

    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;
    if (typeof document === 'undefined') return;

    this.initializeElements();
    if (!this.sidebar || !this.mobileMenuToggle) return;
    this.setupEventListeners();
    this.initialized = true;
  }

  private initializeElements(): void {
    if (typeof document === 'undefined') return;

    this.sidebar = document.querySelector('.game-sidebar');
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

    if (!this.sidebar) {
      this.logMissingElements();
      return;
    }

    if (!this.mobileMenuToggle) {
      this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
      if (!this.mobileMenuToggle) {
        this.logMissingElements();
        return;
      }
    }
    this.missingElementsLogged = false;
  }

  private setupEventListeners(): void {
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileSidebar();
      });
    } else {
      setTimeout(() => {
        if (typeof document === 'undefined') return;
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (this.mobileMenuToggle) {
          this.missingElementsLogged = false;
          this.setupEventListeners();
        } else {
          this.logMissingElements();
        }
      }, 1000);
    }

    // Add close button event listener
    this.setupCloseButton();

    // Add swipe-to-close functionality
    this.setupSwipeToClose();
  }

  private setupCloseButton(): void {
    const closeBtn = document.getElementById('sidebarCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMobileSidebar();
      });
    }
  }

  private setupSwipeToClose(): void {
    if (!this.sidebar) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    this.sidebar.addEventListener('touchstart', e => {
      if (e.touches && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = false;
      }
    });

    this.sidebar.addEventListener('touchmove', e => {
      if (!isDragging && e.touches && e.touches[0]) {
        const deltaX = Math.abs(e.touches[0].clientX - startX);
        const deltaY = Math.abs(e.touches[0].clientY - startY);
        isDragging = deltaX > 10 || deltaY > 10;
      }
    });

    this.sidebar.addEventListener('touchend', e => {
      if (isDragging && e.changedTouches && e.changedTouches[0]) {
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;

        // Swipe right to close (if swiped more than 50px to the right)
        if (deltaX > 50) {
          this.closeMobileSidebar();
        }
      }
    });
  }

  private setupResizeListener(): void {
    if (this.resizeListenerRegistered) return;
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;

      if (wasMobile !== this.isMobile) {
        this.updateSidebarState();
      }
    });
    this.resizeListenerRegistered = true;
  }

  private updateSidebarState(): void {
    if (!this.sidebar) return;

    if (this.isMobile) {
      // On mobile, hide sidebar by default
      this.sidebar.classList.remove('mobile-open');
    } else {
      // On desktop, always show sidebar
      this.sidebar.classList.add('mobile-open');
    }
  }

  public toggleMobileSidebar(): void {
    if (!this.sidebar) {
      this.sidebar = document.querySelector('.game-sidebar');
      if (!this.sidebar) {
        this.logMissingElements();
        return;
      }
    }

    const isOpen = this.sidebar.classList.contains('mobile-open');

    if (isOpen) {
      this.closeMobileSidebar();
    } else {
      this.openMobileSidebar();
    }
  }

  public openMobileSidebar(): void {
    if (!this.sidebar) {
      this.logMissingElements();
      return;
    }
    this.sidebar.classList.add('mobile-open');

    // Add overlay
    this.addSidebarOverlay();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  public closeMobileSidebar(): void {
    if (!this.sidebar) {
      this.logMissingElements();
      return;
    }
    this.sidebar.classList.remove('mobile-open');

    // Remove overlay
    this.removeSidebarOverlay();

    // Restore body scroll
    document.body.style.overflow = '';
  }

  private addSidebarOverlay(): void {
    // Remove existing overlay if any
    this.removeSidebarOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'mobile-sidebar-overlay active';
    overlay.addEventListener('click', () => {
      this.closeMobileSidebar();
    });

    document.body.appendChild(overlay);
  }

  private removeSidebarOverlay(): void {
    const overlay = document.querySelector('.mobile-sidebar-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  public forceInitialize(): void {
    if (!this.initialized) {
      this.initializeWhenReady();
    }
  }

  private logMissingElements(): void {
    if (this.missingElementsLogged) return;
    this.missingElementsLogged = true;
  }
}

// Global instance
export const sidebarNavigation = new SidebarNavigationManager();
