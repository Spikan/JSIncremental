/**
 * Mobile Sidebar Navigation System
 * Simple, reliable mobile menu toggle
 */

export class SidebarNavigationManager {
  private sidebar: HTMLElement | null = null;
  private mobileMenuToggle: HTMLElement | null = null;
  private isMobile: boolean = false;
  private initialized: boolean = false;

  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.setupResizeListener();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.initialized) return;

    this.initializeElements();
    this.setupEventListeners();
    this.initialized = true;

    console.log('SidebarNavigationManager initialized successfully');
  }

  private initializeElements(): void {
    this.sidebar = document.querySelector('.game-sidebar');
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

    // Debug: Check what elements exist
    console.log('Available elements:', {
      allButtons: document.querySelectorAll('button'),
      mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
      mobileMenuToggleById: document.getElementById('mobileMenuToggle'),
      gameSidebar: document.querySelector('.game-sidebar'),
    });

    if (!this.sidebar) {
      console.warn('Sidebar element not found');
      return;
    }

    if (!this.mobileMenuToggle) {
      console.warn('Mobile menu toggle button not found');
      // Try alternative selectors
      this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
      if (this.mobileMenuToggle) {
        console.log('Found mobile menu toggle by ID');
      } else {
        console.warn('Still not found by ID either');
        return;
      }
    }

    console.log('Mobile navigation initialized:', {
      isMobile: this.isMobile,
      windowWidth: window.innerWidth,
      sidebar: this.sidebar,
      mobileMenuToggle: this.mobileMenuToggle,
    });
  }

  private setupEventListeners(): void {
    if (this.mobileMenuToggle) {
      console.log('Setting up event listener for mobile menu toggle');

      // Simple click handler
      this.mobileMenuToggle.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileSidebar();
      });
    } else {
      console.warn('Mobile menu toggle button not found for event listener setup');

      // Try to find it again after a delay
      setTimeout(() => {
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (this.mobileMenuToggle) {
          console.log('Found mobile menu toggle on retry');
          this.setupEventListeners();
        }
      }, 1000);
    }

    // Add swipe-to-close functionality
    this.setupSwipeToClose();
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
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;

      if (wasMobile !== this.isMobile) {
        console.log('Mobile state changed:', this.isMobile);
        this.updateSidebarState();
      }
    });
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
    console.log('toggleMobileSidebar called:', {
      sidebar: this.sidebar,
      isMobile: this.isMobile,
      windowWidth: window.innerWidth,
    });

    if (!this.sidebar) {
      console.warn('No sidebar found, trying to find it again...');
      this.sidebar = document.querySelector('.game-sidebar');
      if (!this.sidebar) {
        console.error('Sidebar still not found!');
        return;
      }
    }

    if (!this.isMobile) {
      console.warn('Not on mobile, but toggling anyway for testing');
    }

    const isOpen = this.sidebar.classList.contains('mobile-open');
    console.log('Sidebar state:', { isOpen, classes: this.sidebar.className });

    if (isOpen) {
      this.closeMobileSidebar();
    } else {
      this.openMobileSidebar();
    }
  }

  public openMobileSidebar(): void {
    if (!this.sidebar) {
      console.error('Cannot open sidebar - no sidebar element');
      return;
    }

    console.log('Opening mobile sidebar...');
    this.sidebar.classList.add('mobile-open');

    // Add overlay
    this.addSidebarOverlay();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    console.log('Mobile sidebar opened');
  }

  public closeMobileSidebar(): void {
    if (!this.sidebar) {
      console.error('Cannot close sidebar - no sidebar element');
      return;
    }

    console.log('Closing mobile sidebar...');
    this.sidebar.classList.remove('mobile-open');

    // Remove overlay
    this.removeSidebarOverlay();

    // Restore body scroll
    document.body.style.overflow = '';

    console.log('Mobile sidebar closed');
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
      this.initialize();
    }
  }
}

// Global instance
export const sidebarNavigation = new SidebarNavigationManager();
