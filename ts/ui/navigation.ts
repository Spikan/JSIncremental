/**
 * Enhanced Navigation System
 * Consolidates 7 tabs into 4 main categories for better usability
 */

export interface NavigationTab {
  id: string;
  label: string;
  icon: string;
  mobileLabel: string;
  mobileIcon: string;
  category: 'main' | 'progress' | 'tools' | 'settings';
  order: number;
}

export const NAVIGATION_TABS: NavigationTab[] = [
  {
    id: 'soda',
    label: 'Soda Clicking',
    icon: '🥤',
    mobileLabel: 'Soda',
    mobileIcon: '🥤',
    category: 'main',
    order: 1,
  },
  {
    id: 'shop',
    label: 'Shop & Upgrades',
    icon: '🛒',
    mobileLabel: 'Shop',
    mobileIcon: '🛒',
    category: 'main',
    order: 2,
  },
  {
    id: 'stats',
    label: 'Statistics',
    icon: '📊',
    mobileLabel: 'Stats',
    mobileIcon: '📊',
    category: 'progress',
    order: 4,
  },
  {
    id: 'god',
    label: 'Talk to God',
    icon: '🙏',
    mobileLabel: 'God',
    mobileIcon: '🙏',
    category: 'tools',
    order: 5,
  },
  {
    id: 'options',
    label: 'Options',
    icon: '⚙️',
    mobileLabel: 'Opt',
    mobileIcon: '⚙️',
    category: 'settings',
    order: 6,
  },
  {
    id: 'dev',
    label: 'Dev Tools',
    icon: '🔧',
    mobileLabel: 'Dev',
    mobileIcon: '🔧',
    category: 'settings',
    order: 7,
  },
];

export class NavigationManager {
  private currentTab: string = 'soda';
  private desktopNav: HTMLElement | null = null;
  private mobileNav: HTMLElement | null = null;

  constructor() {
    this.initializeNavigation();
  }

  public initializeNavigation(): void {
    this.desktopNav = document.querySelector('.tab-navigation.desktop-only');
    this.mobileNav = document.querySelector('.mobile-tab-navigation.mobile-only');

    if (this.desktopNav) {
      this.createDesktopNavigation();
    }

    if (this.mobileNav) {
      this.createMobileNavigation();
    }
  }

  private createDesktopNavigation(): void {
    if (!this.desktopNav) return;

    // Create simple horizontal navigation without categories
    this.desktopNav.innerHTML = '';

    NAVIGATION_TABS.forEach(tab => {
      // Skip dev tab if not enabled
      if (tab.id === 'dev' && !this.isDevToolsEnabled()) {
        return;
      }
      
      const button = this.createDesktopTabButton(tab);
      if (this.desktopNav) {
        this.desktopNav.appendChild(button);
      }
    });
  }

  private createMobileNavigation(): void {
    if (!this.mobileNav) return;

    // Create simple horizontal mobile navigation without categories
    this.mobileNav.innerHTML = '';

    NAVIGATION_TABS.forEach(tab => {
      // Skip dev tab if not enabled
      if (tab.id === 'dev' && !this.isDevToolsEnabled()) {
        return;
      }
      
      const tabItem = this.createMobileTabItem(tab);
      if (this.mobileNav) {
        this.mobileNav.appendChild(tabItem);
      }
    });
  }

  private createDesktopTabButton(tab: NavigationTab): HTMLElement {
    const button = document.createElement('button');
    button.className = 'tab-btn';
    button.setAttribute('data-action', `switchTab:${tab.id}`);
    button.setAttribute('aria-label', `${tab.label} Tab`);

    if (tab.id === this.currentTab) {
      button.classList.add('active');
    }

    button.innerHTML = `
      <span class="tab-icon">${tab.icon}</span>
      <span class="tab-label">${tab.label}</span>
    `;

    return button;
  }

  private createMobileTabItem(tab: NavigationTab): HTMLElement {
    const item = document.createElement('div');
    item.className = 'mobile-tab-item';
    item.setAttribute('data-action', `switchTab:${tab.id}`);
    item.setAttribute('aria-label', `${tab.label} Tab`);
    item.setAttribute('tabindex', '0');

    if (tab.id === this.currentTab) {
      item.classList.add('active');
    }

    item.innerHTML = `
      <div class="mobile-tab-icon">${tab.mobileIcon}</div>
      <div class="mobile-tab-label">${tab.mobileLabel}</div>
    `;

    return item;
  }

  public switchTab(tabId: string): void {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Show selected tab content
    const targetContent = document.getElementById(`${tabId}Tab`);
    if (targetContent) {
      targetContent.classList.add('active');
    }

    // Update navigation buttons
    document.querySelectorAll('.tab-btn, .mobile-tab-item').forEach(button => {
      button.classList.remove('active');
    });

    document.querySelectorAll(`[data-action="switchTab:${tabId}"]`).forEach(button => {
      button.classList.add('active');
    });

    this.currentTab = tabId;
  }

  public getCurrentTab(): string {
    return this.currentTab;
  }

  public getTabById(id: string): NavigationTab | undefined {
    return NAVIGATION_TABS.find(tab => tab.id === id);
  }

  private isDevToolsEnabled(): boolean {
    try {
      const w = window as any;
      return w.App?.state?.getState?.()?.options?.devToolsEnabled ?? false;
    } catch {
      return false;
    }
  }

  public refreshNavigation(): void {
    // If currently on dev tab and it gets disabled, switch to soda tab
    if (this.currentTab === 'dev' && !this.isDevToolsEnabled()) {
      this.switchTab('soda');
    }
    
    // Recreate navigation to show/hide dev tab
    this.createDesktopNavigation();
    this.createMobileNavigation();
  }
}

// Global instance
export const navigationManager = new NavigationManager();
