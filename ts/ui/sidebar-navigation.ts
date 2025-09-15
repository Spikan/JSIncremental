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

      // Add visual feedback for mobile debugging
      this.mobileMenuToggle.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Mobile menu toggle clicked');

        // Visual feedback - change button color briefly
        this.mobileMenuToggle!.style.backgroundColor = '#ff6b6b';
        setTimeout(() => {
          this.mobileMenuToggle!.style.backgroundColor = '';
        }, 200);

        this.toggleMobileSidebar();
      });

      // Also add touch events for better mobile response
      this.mobileMenuToggle.addEventListener('touchstart', e => {
        e.preventDefault();
        console.log('Mobile menu toggle touch start');
        this.mobileMenuToggle!.style.backgroundColor = '#4ecdc4';
      });

      this.mobileMenuToggle.addEventListener('touchend', e => {
        e.preventDefault();
        console.log('Mobile menu toggle touch end');
        this.mobileMenuToggle!.style.backgroundColor = '';
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
    console.log('Mobile sidebar opened, classes:', this.sidebar.className);

    // Visual feedback - make sidebar visible with animation
    this.sidebar.style.display = 'flex';
    this.sidebar.style.animation = 'slideIn 0.3s ease-out';

    // Also add a visible background to make it obvious
    this.sidebar.style.backgroundColor = 'rgba(0, 179, 107, 0.1)';
    this.sidebar.style.border = '3px solid #00b36b';
  }

  public closeMobileSidebar(): void {
    if (!this.sidebar) {
      console.error('Cannot close sidebar - no sidebar element');
      return;
    }

    console.log('Closing mobile sidebar...');
    this.sidebar.classList.remove('mobile-open');
    console.log('Mobile sidebar closed, classes:', this.sidebar.className);

    // Visual feedback - animate out then hide
    this.sidebar.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      this.sidebar!.style.display = 'none';
      this.sidebar!.style.animation = '';
      this.sidebar!.style.backgroundColor = '';
      this.sidebar!.style.border = '';
    }, 300);
  }

  public forceInitialize(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }
}

// Global instance
export const sidebarNavigation = new SidebarNavigationManager();
