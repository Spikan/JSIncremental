/**
 * Mobile Sidebar Navigation System
 * Simple, reliable mobile menu toggle
 */

export class SidebarNavigationManager {
  private sidebar: HTMLElement | null = null;
  private mobileMenuToggle: HTMLElement | null = null;
  private isMobile: boolean = false;

  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.initializeElements();
    this.setupEventListeners();
    this.setupResizeListener();
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
      this.mobileMenuToggle.addEventListener('click', () => {
        console.log('Mobile menu toggle clicked');
        this.toggleMobileSidebar();
      });
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
}

// Global instance
export const sidebarNavigation = new SidebarNavigationManager();
