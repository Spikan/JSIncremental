/**
 * Sidebar Navigation System
 * Handles collapsible sidebar sections and mobile navigation
 */

export interface SidebarSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  expanded: boolean;
}

export class SidebarNavigationManager {
  private sections: Map<string, SidebarSection> = new Map();
  private sidebar: HTMLElement | null = null;
  private sidebarToggle: HTMLElement | null = null;
  private isMobile: boolean = false;

  constructor() {
    this.initializeSections();
    this.detectMobile();
    this.initializeSidebar();
  }

  private initializeSections(): void {
    const sectionData: SidebarSection[] = [
      {
        id: 'shop',
        title: 'Shop',
        subtitle: 'Production buildings',
        icon: '🛒',
        expanded: true, // Start with shop expanded since upgrades is removed
      },
      {
        id: 'stats',
        title: 'Statistics',
        subtitle: 'Track your progress',
        icon: '📊',
        expanded: false,
      },
      {
        id: 'settings',
        title: 'Settings',
        subtitle: 'Options & tools',
        icon: '⚙️',
        expanded: false,
      },
      {
        id: 'god',
        title: 'Talk to God',
        subtitle: 'Seek divine guidance',
        icon: '🙏',
        expanded: false,
      },
    ];

    sectionData.forEach(section => {
      this.sections.set(section.id, section);
    });
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

    // Set initial state
    this.updateSidebarState();

    // Add event listeners
    this.setupEventListeners();

    // Initialize section states
    this.initializeSectionStates();
  }

  private setupEventListeners(): void {
    // Sidebar toggle button
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Section header clicks
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const sectionHeader = target.closest('.section-header');

      if (sectionHeader) {
        const action = sectionHeader.getAttribute('data-action');
        if (action && action.startsWith('toggleSection:')) {
          const sectionId = action.split(':')[1];
          if (sectionId) {
            this.toggleSection(sectionId);
            event.preventDefault();
          }
        }
      }
    });

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

  private initializeSectionStates(): void {
    this.sections.forEach((section, sectionId) => {
      const sectionElement = document.querySelector(`[data-section="${sectionId}"]`);
      if (sectionElement) {
        if (section.expanded) {
          sectionElement.classList.add('expanded');
        } else {
          sectionElement.classList.remove('expanded');
        }
      }
    });
  }

  public toggleSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (!section) {
      console.warn(`Section ${sectionId} not found`);
      return;
    }

    // Toggle the section state
    section.expanded = !section.expanded;
    this.sections.set(sectionId, section);

    // Update the UI
    const sectionElement = document.querySelector(`[data-section="${sectionId}"]`);
    if (sectionElement) {
      if (section.expanded) {
        sectionElement.classList.add('expanded');
      } else {
        sectionElement.classList.remove('expanded');
      }
    }

    // On mobile, expand sidebar when opening a section
    if (this.isMobile && section.expanded) {
      this.expandSidebar();
    }

    console.log(`Toggled section ${sectionId}:`, section.expanded ? 'expanded' : 'collapsed');
  }

  public expandSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (section && !section.expanded) {
      this.toggleSection(sectionId);
    }
  }

  public collapseSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (section && section.expanded) {
      this.toggleSection(sectionId);
    }
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

  public getSectionState(sectionId: string): boolean {
    const section = this.sections.get(sectionId);
    return section?.expanded || false;
  }

  public getAllSections(): SidebarSection[] {
    return Array.from(this.sections.values());
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
