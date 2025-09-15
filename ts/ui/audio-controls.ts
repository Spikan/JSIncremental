// Audio Controls Manager - Handles volume sliders and audio settings UI
import { enhancedAudioManager } from '../services/enhanced-audio-manager';
import { logger } from '../services/logger';

export class AudioControlsManager {
  private static instance: AudioControlsManager;
  private masterSlider: HTMLInputElement | null = null;
  private musicSlider: HTMLInputElement | null = null;
  private sfxSlider: HTMLInputElement | null = null;
  private masterValue: HTMLSpanElement | null = null;
  private musicValue: HTMLSpanElement | null = null;
  private sfxValue: HTMLSpanElement | null = null;

  public static getInstance(): AudioControlsManager {
    if (!AudioControlsManager.instance) {
      AudioControlsManager.instance = new AudioControlsManager();
    }
    return AudioControlsManager.instance;
  }

  /**
   * Initialize audio controls and set up event listeners
   */
  public initialize(): void {
    try {
      this.findElements();
      this.setupEventListeners();
      this.syncWithAudioManager();
      logger.debug('Audio controls manager initialized');
    } catch (error) {
      logger.warn('Failed to initialize audio controls:', error);
    }
  }

  /**
   * Find all audio control elements
   */
  private findElements(): void {
    this.masterSlider = document.getElementById('masterVolumeSlider') as HTMLInputElement;
    this.musicSlider = document.getElementById('musicVolumeSlider') as HTMLInputElement;
    this.sfxSlider = document.getElementById('sfxVolumeSlider') as HTMLInputElement;
    this.masterValue = document.getElementById('masterVolumeValue') as HTMLSpanElement;
    this.musicValue = document.getElementById('musicVolumeValue') as HTMLSpanElement;
    this.sfxValue = document.getElementById('sfxVolumeValue') as HTMLSpanElement;
  }

  /**
   * Set up event listeners for sliders
   */
  private setupEventListeners(): void {
    if (this.masterSlider) {
      this.masterSlider.addEventListener('input', e => {
        const value = parseInt((e.target as HTMLInputElement).value);
        this.handleMasterVolumeChange(value);
      });
    }

    if (this.musicSlider) {
      this.musicSlider.addEventListener('input', e => {
        const value = parseInt((e.target as HTMLInputElement).value);
        this.handleMusicVolumeChange(value);
      });
    }

    if (this.sfxSlider) {
      this.sfxSlider.addEventListener('input', e => {
        const value = parseInt((e.target as HTMLInputElement).value);
        this.handleSFXVolumeChange(value);
      });
    }
  }

  /**
   * Handle master volume change
   */
  private handleMasterVolumeChange(value: number): void {
    try {
      const volume = value / 100;
      enhancedAudioManager.setMasterVolume(volume);

      if (this.masterValue) {
        this.masterValue.textContent = `${value}%`;
      }

      // Update slider visual progress
      this.updateSliderProgress(this.masterSlider, value);

      logger.debug(`Master volume set to ${value}%`);
    } catch (error) {
      logger.warn('Failed to set master volume:', error);
    }
  }

  /**
   * Handle music volume change
   */
  private handleMusicVolumeChange(value: number): void {
    try {
      const volume = value / 100;
      enhancedAudioManager.setMusicVolume(volume);

      if (this.musicValue) {
        this.musicValue.textContent = `${value}%`;
      }

      // Update slider visual progress
      this.updateSliderProgress(this.musicSlider, value);

      // If music is off but user is adjusting, start it
      if (value > 0 && !enhancedAudioManager.getAudioState().musicPlaying) {
        enhancedAudioManager.startBackgroundMusic();
      }

      logger.debug(`Music volume set to ${value}%`);
    } catch (error) {
      logger.warn('Failed to set music volume:', error);
    }
  }

  /**
   * Handle SFX volume change
   */
  private handleSFXVolumeChange(value: number): void {
    try {
      const volume = value / 100;
      enhancedAudioManager.setSFXVolume(volume);

      if (this.sfxValue) {
        this.sfxValue.textContent = `${value}%`;
      }

      // Update slider visual progress
      this.updateSliderProgress(this.sfxSlider, value);

      // Play a test sound if SFX volume is being adjusted
      if (value > 0) {
        enhancedAudioManager.playSound('click', { volume: 0.5 });
      }

      logger.debug(`SFX volume set to ${value}%`);
    } catch (error) {
      logger.warn('Failed to set SFX volume:', error);
    }
  }

  /**
   * Update slider visual progress using CSS custom properties
   */
  private updateSliderProgress(slider: HTMLInputElement | null, value: number): void {
    if (slider) {
      slider.style.setProperty('--slider-progress', `${value}%`);
    }
  }

  /**
   * Sync UI with current audio manager state
   */
  private syncWithAudioManager(): void {
    try {
      const state = enhancedAudioManager.getAudioState();

      // Update master volume
      const masterPercent = Math.round(state.masterVolume * 100);
      if (this.masterSlider) {
        this.masterSlider.value = masterPercent.toString();
        this.updateSliderProgress(this.masterSlider, masterPercent);
      }
      if (this.masterValue) {
        this.masterValue.textContent = `${masterPercent}%`;
      }

      // Update music volume
      const musicPercent = Math.round(state.musicVolume * 100);
      if (this.musicSlider) {
        this.musicSlider.value = musicPercent.toString();
        this.updateSliderProgress(this.musicSlider, musicPercent);
      }
      if (this.musicValue) {
        this.musicValue.textContent = `${musicPercent}%`;
      }

      // Update SFX volume
      const sfxPercent = Math.round(state.sfxVolume * 100);
      if (this.sfxSlider) {
        this.sfxSlider.value = sfxPercent.toString();
        this.updateSliderProgress(this.sfxSlider, sfxPercent);
      }
      if (this.sfxValue) {
        this.sfxValue.textContent = `${sfxPercent}%`;
      }

      logger.debug('Audio controls synced with audio manager');
    } catch (error) {
      logger.warn('Failed to sync audio controls:', error);
    }
  }

  /**
   * Refresh the UI (useful when settings modal opens)
   */
  public refresh(): void {
    this.syncWithAudioManager();
  }
}

// Export singleton instance
export const audioControlsManager = AudioControlsManager.getInstance();
