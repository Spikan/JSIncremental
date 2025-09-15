// Offline Modal: Welcome back modal showing offline earnings
import { formatNumber } from './utils';
import {
  formatOfflineTime,
  type OfflineProgressionResult,
} from '../core/systems/offline-progression';
import { logger } from '../services/logger';

export interface OfflineModalConfig {
  showParticles?: boolean; // Show celebration particles
  autoCloseAfter?: number; // Auto-close after N milliseconds (0 = no auto-close)
  playSound?: boolean; // Play a welcome sound effect
}

/**
 * Create and show the offline progression modal
 */
export function showOfflineModal(
  result: OfflineProgressionResult,
  config: OfflineModalConfig = {}
): void {
  const { showParticles = true, autoCloseAfter = 0, playSound = false } = config;

  try {
    // Remove any existing offline modal
    const existingModal = document.getElementById('offlineModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'offlineModal';
    modal.className = 'offline-modal';

    const timeAwayFormatted = formatOfflineTime(result.timeAway);
    const cappedTimeFormatted = formatOfflineTime(result.cappedAt);
    const wasCapped = result.timeAway > result.cappedAt;

    modal.innerHTML = `
      <div class="offline-modal-overlay"></div>
      <div class="offline-modal-content">
        <div class="offline-modal-header">
          <h2 class="offline-modal-title">
            <span class="welcome-icon">🎉</span>
            Welcome Back!
          </h2>
        </div>
        
        <div class="offline-modal-body">
          <div class="offline-stats">
            <div class="offline-stat">
              <span class="offline-stat-label">Time Away:</span>
              <span class="offline-stat-value">${timeAwayFormatted}</span>
            </div>
            
            <div class="offline-stat offline-earnings">
              <span class="offline-stat-label">Sips Earned:</span>
              <span class="offline-stat-value offline-sips">+${formatNumber(result.sipsEarned)}</span>
            </div>
            
            <div class="offline-stat">
              <span class="offline-stat-label">Drinks Processed:</span>
              <span class="offline-stat-value">${result.drinksProcessed.toLocaleString()}</span>
            </div>
            
            ${
              wasCapped
                ? `
              <div class="offline-cap-notice">
                <span class="cap-icon">⏰</span>
                Offline earnings capped at ${cappedTimeFormatted}
              </div>
            `
                : ''
            }
          </div>
          
          <div class="offline-modal-actions">
            <button class="offline-claim-btn" data-action="closeOfflineModal">
              <span class="claim-icon">💰</span>
              Claim Earnings
            </button>
          </div>
        </div>
      </div>
    `;

    // Add modal styles
    const styles = `
      <style>
        .offline-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: offlineModalFadeIn 0.3s ease-out;
        }
        
        .offline-modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }
        
        .offline-modal-content {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          color: white;
          max-width: 400px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          transform: scale(0.9);
          animation: offlineModalSlideIn 0.4s ease-out 0.1s forwards;
        }
        
        .offline-modal-header {
          padding: 24px 24px 16px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .offline-modal-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        
        .welcome-icon {
          font-size: 1.8rem;
          animation: welcomeBounce 2s ease-in-out infinite;
        }
        
        .offline-modal-body {
          padding: 24px;
        }
        
        .offline-stats {
          margin-bottom: 24px;
        }
        
        .offline-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding: 8px 0;
        }
        
        .offline-stat-label {
          font-size: 1rem;
          opacity: 0.9;
        }
        
        .offline-stat-value {
          font-size: 1.1rem;
          font-weight: bold;
        }
        
        .offline-earnings {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        
        .offline-sips {
          color: #4CAF50;
          font-size: 1.3rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          animation: offlineSipsGlow 2s ease-in-out infinite;
        }
        
        .offline-cap-notice {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.4);
          border-radius: 8px;
          padding: 12px;
          margin-top: 16px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .cap-icon {
          font-size: 1.1rem;
        }
        
        .offline-modal-actions {
          text-align: center;
        }
        
        .offline-claim-btn {
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          transition: all 0.2s ease;
        }
        
        .offline-claim-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
        }
        
        .offline-claim-btn:active {
          transform: translateY(0);
        }
        
        .claim-icon {
          font-size: 1.2rem;
          animation: claimIconBounce 1.5s ease-in-out infinite;
        }
        
        @keyframes offlineModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes offlineModalSlideIn {
          from { 
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          to { 
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes welcomeBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        
        @keyframes offlineSipsGlow {
          0%, 100% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); }
          50% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(76, 175, 80, 0.6); }
        }
        
        @keyframes claimIconBounce {
          0%, 20%, 50%, 80%, 100% { transform: scale(1); }
          40% { transform: scale(1.1); }
          60% { transform: scale(1.05); }
        }
        
        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .offline-modal-content {
            width: 95%;
            margin: 20px;
          }
          
          .offline-modal-title {
            font-size: 1.3rem;
          }
          
          .offline-claim-btn {
            width: 100%;
          }
        }
      </style>
    `;

    // Add styles to head if not already present
    if (!document.getElementById('offline-modal-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'offline-modal-styles';
      styleElement.innerHTML = styles.replace('<style>', '').replace('</style>', '');
      document.head.appendChild(styleElement);
    }

    // Add modal to DOM
    document.body.appendChild(modal);

    // Set up event handlers
    const claimBtn = modal.querySelector('.offline-claim-btn');
    const overlay = modal.querySelector('.offline-modal-overlay');

    const closeModal = () => {
      modal.style.animation = 'offlineModalFadeIn 0.2s ease-in reverse';
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 200);
    };

    if (claimBtn) {
      claimBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }

    // Auto-close if configured
    if (autoCloseAfter > 0) {
      setTimeout(closeModal, autoCloseAfter);
    }

    // Play sound if enabled and available
    if (playSound) {
      try {
        // Try to play a welcome sound (if audio system is available)
        const w: any = window as any;
        w.App?.systems?.audio?.playWelcomeSound?.();
      } catch (error) {
        // Sound failed, but that's okay
        logger.debug('Welcome sound failed to play:', error);
      }
    }

    // Show particles if enabled
    if (showParticles) {
      try {
        showOfflineParticles();
      } catch (error) {
        logger.debug('Offline particles failed:', error);
      }
    }

    logger.info('Offline modal displayed successfully');
  } catch (error) {
    logger.error('Failed to show offline modal:', error);
  }
}

/**
 * Simple particle celebration effect
 */
function showOfflineParticles(): void {
  const particleCount = 20;
  const colors = ['#4CAF50', '#FFD700', '#FF6B35', '#667eea'];

  for (let i = 0; i < particleCount; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 10001;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        animation: particleFall ${2 + Math.random() * 2}s ease-out forwards;
      `;

      document.body.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 4000);
    }, i * 100);
  }

  // Add particle animation CSS if not present
  if (!document.getElementById('particle-styles')) {
    const style = document.createElement('style');
    style.id = 'particle-styles';
    style.innerHTML = `
      @keyframes particleFall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
