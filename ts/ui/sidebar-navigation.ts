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

    if (!this.sidebar) {
      console.warn('Sidebar element not found');
      return;
    }

    if (!this.mobileMenuToggle) {
      console.warn('Mobile menu toggle button not found');
      return;
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
      this.mobileMenuToggle.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Mobile menu toggle clicked');
        this.toggleMobileSidebar();
      });
    } else {
      console.warn('Mobile menu toggle button not found for event listener setup');
    }
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
    if (!this.sidebar || !this.isMobile) return;

    const isOpen = this.sidebar.classList.contains('mobile-open');
    if (isOpen) {
      this.closeMobileSidebar();
    } else {
      this.openMobileSidebar();
    }
  }

  public openMobileSidebar(): void {
    if (!this.sidebar) return;

    this.sidebar.classList.add('mobile-open');
    console.log('Mobile sidebar opened');
  }

  public closeMobileSidebar(): void {
    if (!this.sidebar) return;

    this.sidebar.classList.remove('mobile-open');
    console.log('Mobile sidebar closed');
  }

  public forceInitialize(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }
}

// Global instance
export const sidebarNavigation = new SidebarNavigationManager();
