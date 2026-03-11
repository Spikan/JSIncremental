// Level Selector UI - Interface for switching between SDP levels

import { hybridLevelSystem, HybridLevel } from '../core/systems/hybrid-level-system';
import { formatNumber } from './utils';
import { updateLevelText } from './displays';
import { errorHandler } from '../core/error-handling/error-handler';

export class LevelSelector {
  private container: HTMLElement | null = null;
  private isVisible: boolean = false;

  constructor() {
    this.createLevelSelector();
    this.setupEventListeners();
  }

  private createLevelSelector(): void {
    // Create the level selector container
    const selector = document.createElement('div');
    selector.id = 'levelSelector';
    selector.className = 'level-selector';
    selector.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #2c3e50, #34495e);
      border: 3px solid #3498db;
      border-radius: 15px;
      padding: 20px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 10000;
      display: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      font-family: 'Courier New', monospace;
    `;

    // Create header
    const header = document.createElement('div');
    header.className = 'level-selector-header';
    header.innerHTML = `
      <h2 style="color: #ecf0f1; margin: 0 0 15px 0; text-align: center; font-size: 24px;">
        🎮 Level Selector
      </h2>
      <p style="color: #bdc3c7; margin: 0 0 20px 0; text-align: center; font-size: 14px;">
        Choose your soda drinking destination
      </p>
    `;

    // Create levels grid
    const grid = document.createElement('div');
    grid.className = 'level-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    `;

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: #e74c3c;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    `;
    closeBtn.onclick = () => this.hide();

    selector.appendChild(closeBtn);
    selector.appendChild(header);
    selector.appendChild(grid);

    // Add to DOM
    document.body.appendChild(selector);
    this.container = selector;
  }

  private setupEventListeners(): void {
    // Add keyboard shortcut (L key)
    document.addEventListener('keydown', e => {
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  private renderLevels(): void {
    const grid = this.container?.querySelector('.level-grid');
    if (!grid) return;

    const levels = hybridLevelSystem.getAllLevels();
    const currentLevel = hybridLevelSystem.getCurrentLevel();

    grid.innerHTML = '';

    // Group levels by category
    const categories = {
      main: levels.filter(l => l.category === 'main'),
      bonus: levels.filter(l => l.category === 'bonus'),
      historical: levels.filter(l => l.category === 'historical'),
      vivian: levels.filter(l => l.category === 'vivian'),
    };

    // Render each category
    Object.entries(categories).forEach(([categoryName, categoryLevels]) => {
      if (categoryLevels.length === 0) return;

      const categorySection = this.createCategorySection(
        categoryName,
        categoryLevels,
        currentLevel?.id
      );
      grid.appendChild(categorySection);
    });
  }

  private createCategorySection(
    categoryName: string,
    levels: HybridLevel[],
    currentLevelId?: number
  ): HTMLElement {
    const section = document.createElement('div');
    section.className = `level-category ${categoryName}`;

    const categoryTitles = {
      main: 'Main Levels',
      bonus: 'Bonus Levels',
      historical: 'Historical Levels',
      vivian: 'Vivian Clark',
    };

    const title = document.createElement('h3');
    title.style.cssText =
      'color: #3498db; margin: 0 0 10px 0; font-size: 16px; text-align: center;';
    title.textContent = categoryTitles[categoryName as keyof typeof categoryTitles] || categoryName;

    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'category-levels';
    categoryGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 12px;
    `;

    levels.forEach(level => {
      const levelCard = this.createLevelCard(level, currentLevelId === level.id);
      categoryGrid.appendChild(levelCard);
    });

    section.appendChild(title);
    section.appendChild(categoryGrid);

    return section;
  }

  private createLevelCard(level: HybridLevel, isCurrent: boolean): HTMLElement {
    const isUnlocked = hybridLevelSystem.isLevelUnlocked(level.id);
    const canUnlock = hybridLevelSystem.canUnlockLevel(level.id);
    const card = document.createElement('div');
    card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;

    card.style.cssText = `
      background: ${
        isUnlocked
          ? `linear-gradient(135deg, ${level.visualTheme.backgroundColor}, ${level.visualTheme.accentColor})`
          : 'linear-gradient(135deg, #2c3e50, #34495e)'
      };
      border: 2px solid ${isCurrent ? '#f39c12' : isUnlocked ? '#27ae60' : '#7f8c8d'};
      border-radius: 10px;
      padding: 18px;
      cursor: ${isUnlocked ? 'pointer' : 'default'};
      transition: all 0.3s ease;
      opacity: ${isUnlocked ? '1' : '0.6'};
      position: relative;
      overflow: visible;
      min-height: 200px;
      display: flex;
      flex-direction: column;
    `;

    if (isCurrent) {
      card.style.boxShadow = '0 0 20px rgba(243, 156, 18, 0.5)';
    }

    const statusIcon = isUnlocked ? '✅' : canUnlock ? '🔓' : '🔒';
    const statusText = isUnlocked
      ? isCurrent
        ? 'Current'
        : 'Available'
      : canUnlock
        ? 'Can Unlock'
        : 'Locked';

    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display: flex; align-items: flex-start; margin-bottom: 12px;';

    const icon = document.createElement('span');
    icon.style.cssText = 'font-size: 24px; margin-right: 12px; flex-shrink: 0;';
    icon.textContent = this.getCategoryIcon(level.category);

    const titleWrap = document.createElement('div');
    titleWrap.style.cssText = 'flex: 1; min-width: 0;';

    const title = document.createElement('h4');
    title.style.cssText = `margin: 0 0 4px 0; color: ${isUnlocked ? '#2c3e50' : '#7f8c8d'}; font-size: 16px; font-weight: bold; line-height: 1.2;`;
    title.textContent = `Level ${level.id}: ${level.name}`;

    const status = document.createElement('span');
    status.style.cssText = `font-size: 12px; color: ${isUnlocked ? '#27ae60' : '#7f8c8d'}; font-weight: 500;`;
    status.textContent = `${statusIcon} ${statusText}`;

    titleWrap.append(title, status);
    headerRow.append(icon, titleWrap);

    const body = document.createElement('div');
    body.style.cssText = 'flex: 1; margin-bottom: 12px;';

    const description = document.createElement('p');
    description.style.cssText = `margin: 0 0 12px 0; font-size: 12px; color: ${isUnlocked ? '#2c3e50' : '#7f8c8d'}; line-height: 1.4; word-wrap: break-word;`;
    description.textContent = level.description;

    const bonuses = document.createElement('div');
    bonuses.style.marginBottom = '8px';

    const bonusLine = document.createElement('div');
    bonusLine.style.cssText = `font-size: 11px; color: ${isUnlocked ? '#2c3e50' : '#7f8c8d'}; margin-bottom: 4px; font-weight: 500;`;
    bonusLine.textContent = `Bonuses: ${level.bonuses.sipMultiplier}x Sips, ${level.bonuses.clickMultiplier}x Clicks`;

    bonuses.appendChild(bonusLine);

    if (level.bonuses.specialEffect) {
      const special = document.createElement('div');
      special.style.cssText = `font-size: 11px; color: ${isUnlocked ? '#2c3e50' : '#7f8c8d'}; font-weight: 500;`;
      special.textContent = `Special: ${level.bonuses.specialEffect}`;
      bonuses.appendChild(special);
    }

    body.append(description, bonuses);

    card.append(headerRow, body);

    if (!isUnlocked) {
      const reqBox = document.createElement('div');
      reqBox.style.cssText =
        'background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 6px; padding: 10px; margin-bottom: 12px;';

      const reqTitle = document.createElement('div');
      reqTitle.style.cssText =
        'font-size: 11px; color: #e74c3c; font-weight: bold; margin-bottom: 4px;';
      reqTitle.textContent = '🔒 Unlock Requirements:';

      const reqContent = document.createElement('div');
      reqContent.style.cssText = `font-size: 9px; color: ${canUnlock ? '#27ae60' : '#e74c3c'}; line-height: 1.3; text-align: center;`;

      const sipsReq = document.createElement('div');
      sipsReq.style.marginBottom = '2px';
      sipsReq.textContent = `${formatNumber(level.unlockRequirement.sips)} Sips`;

      const clicksReq = document.createElement('div');
      clicksReq.style.marginBottom = '2px';
      clicksReq.textContent = `${level.unlockRequirement.clicks.toLocaleString()} Clicks`;

      reqContent.append(sipsReq, clicksReq);

      if ((level.unlockRequirement as any).level) {
        const levelReq = document.createElement('div');
        levelReq.style.fontSize = '9px';
        levelReq.textContent = `Level ${(level.unlockRequirement as any).level}`;
        reqContent.appendChild(levelReq);
      }

      reqBox.append(reqTitle, reqContent);
      card.appendChild(reqBox);
    }

    const footer = document.createElement('div');
    footer.style.marginTop = 'auto';

    if (isUnlocked && !isCurrent) {
      const selectBtn = document.createElement('button');
      selectBtn.className = 'select-level-btn';
      selectBtn.style.cssText = `
        background: #3498db;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        font-weight: bold;
        width: 100%;
        transition: all 0.2s ease;
      `;
      selectBtn.textContent = 'Select Level';
      selectBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.selectLevel(level.id);
      });
      footer.appendChild(selectBtn);
    }

    if (!isUnlocked && canUnlock) {
      const unlockBtn = document.createElement('button');
      unlockBtn.className = 'unlock-level-btn';
      unlockBtn.style.cssText = `
        background: #f39c12;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        font-weight: bold;
        width: 100%;
        transition: all 0.2s ease;
      `;
      unlockBtn.textContent = 'Unlock Level';
      unlockBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.unlockLevel(level.id);
      });
      footer.appendChild(unlockBtn);
    }

    if (isCurrent) {
      const currentBadge = document.createElement('div');
      currentBadge.style.cssText = `
        background: rgba(243, 156, 18, 0.2);
        color: #f39c12;
        padding: 8px;
        border-radius: 6px;
        text-align: center;
        font-weight: bold;
        font-size: 12px;
        border: 1px solid rgba(243, 156, 18, 0.3);
      `;
      currentBadge.textContent = '🎯 Currently Active';
      footer.appendChild(currentBadge);
    }

    card.appendChild(footer);

    if (isUnlocked) {
      card.addEventListener('mouseenter', () => {
        if (!isCurrent) {
          card.style.transform = 'translateY(-2px)';
          card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        }
      });

      card.addEventListener('mouseleave', () => {
        if (!isCurrent) {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = isCurrent ? '0 0 20px rgba(243, 156, 18, 0.5)' : 'none';
        }
      });
    }

    return card;
  }

  private getCategoryIcon(category: string): string {
    const icons = {
      main: '🎮',
      bonus: '⭐',
      historical: '⏰',
      vivian: '👻',
      special: '✨',
    };
    return icons[category as keyof typeof icons] || '❓';
  }

  private selectLevel(levelId: number): void {
    if (hybridLevelSystem.switchToLevel(levelId)) {
      this.showLevelNotification(levelId);
      this.hide();

      // Update UI to reflect new level
      this.updateLevelDisplay();

      // Update main UI displays
      try {
        updateLevelText();
        // Modernized - level number updates handled by store
        // Modernized - display updates handled by store
      } catch (error) {
        errorHandler.handleError(error, 'updateMainUIDisplays', { levelId });
      }

      // Emit event for other systems
      try {
        // Modernized - events handled by store
        console.log('Level changed:', {
          levelId,
          level: hybridLevelSystem.getCurrentLevel(),
        });
      } catch (error) {
        errorHandler.handleError(error, 'emitLevelChangedEvent', { levelId });
      }
    }
  }

  private unlockLevel(levelId: number): void {
    if (hybridLevelSystem.unlockLevel(levelId)) {
      this.showUnlockNotification(levelId);
      this.renderLevels(); // Refresh the display

      // Emit event for other systems
      try {
        // Modernized - event emission handled by store
        console.log('Level unlocked event modernized:', levelId);
      } catch (error) {
        errorHandler.handleError(error, 'emitLevelUnlockedEvent', { levelId });
      }
    }
  }

  private showLevelNotification(_levelId: number): void {
    const level = hybridLevelSystem.getCurrentLevel();
    if (!level) return;

    const notification = document.createElement('div');
    notification.className = 'level-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, ${level.visualTheme.backgroundColor}, ${level.visualTheme.accentColor});
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10001;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      max-width: 300px;
      animation: slideInRight 0.3s ease-out;
    `;

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center;';

    const icon = document.createElement('span');
    icon.style.cssText = 'font-size: 20px; margin-right: 10px;';
    icon.textContent = this.getCategoryIcon(level.category);

    const textContainer = document.createElement('div');
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.textContent = 'Level Changed!';
    const subtitle = document.createElement('div');
    subtitle.textContent = `Now in: ${level.name}`;

    textContainer.append(title, subtitle);
    row.append(icon, textContainer);
    notification.appendChild(row);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  public showUnlockNotification(levelId: number): void {
    const level = hybridLevelSystem.getAllLevels().find(l => l.id === levelId);
    if (!level) return;

    const notification = document.createElement('div');
    notification.className = 'level-unlock-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10001;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-width: 250px;
      animation: slideInRight 0.3s ease-out;
      pointer-events: none;
    `;

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center;';

    const icon = document.createElement('span');
    icon.style.cssText = 'font-size: 20px; margin-right: 10px;';
    icon.textContent = '🔓';

    const textContainer = document.createElement('div');
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.textContent = 'New Level Unlocked!';
    const subtitle = document.createElement('div');
    subtitle.textContent = `${this.getCategoryIcon(level.category)} Level ${level.id}: ${level.name}`;

    textContainer.append(title, subtitle);
    row.append(icon, textContainer);
    notification.appendChild(row);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutLeft 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  private updateLevelDisplay(): void {
    // Update any UI elements that show current level
    const levelDisplay = document.getElementById('currentLevel');
    if (levelDisplay) {
      const level = hybridLevelSystem.getCurrentLevel();
      if (level) {
        levelDisplay.textContent = `${level.name}`;
      }
    }
  }

  public show(): void {
    if (this.container) {
      this.renderLevels();
      this.container.style.display = 'block';
      this.isVisible = true;

      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'level-selector-backdrop';
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
      `;
      backdrop.onclick = () => this.hide();
      document.body.appendChild(backdrop);
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;

      // Remove backdrop
      const backdrop = document.querySelector('.level-selector-backdrop');
      if (backdrop) backdrop.remove();
    }
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // Check for new level unlocks
  public checkForUnlocks(): void {
    const newlyUnlocked = hybridLevelSystem.checkForUnlocks();
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(levelId => {
        this.showUnlockNotification(levelId);
      });
    }
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutLeft {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(-100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

export const levelSelector = new LevelSelector();
