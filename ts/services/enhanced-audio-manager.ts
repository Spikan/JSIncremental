// Enhanced Audio Manager: Professional audio system using Howler.js
import { Howl, Howler } from 'howler';
import { logger } from './logger';

export interface AudioConfig {
  volume?: number;
  loop?: boolean;
  rate?: number;
  sprite?: { [key: string]: [number, number] };
}

export interface SoundEffect {
  id: string;
  howl: Howl;
  config: AudioConfig;
}

export class EnhancedAudioManager {
  private static instance: EnhancedAudioManager;
  private soundEffects: Map<string, SoundEffect> = new Map();
  private titleMusic: Howl | null = null;
  private gameplayMusic: Howl | null = null;
  private currentTrack: 'title' | 'gameplay' | null = null;
  private titleMusicPlayed = false;
  private masterVolume = 0.7;
  private sfxVolume = 0.6;
  private musicVolume = 0.25;
  // Individual track volume adjustments to balance recording levels
  private titleMusicVolumeAdjustment = 1.0; // Title music baseline
  private gameplayMusicVolumeAdjustment = 0.75; // Reduce gameplay music to match title
  private muted = false;
  private musicEnabled = true;
  private sfxEnabled = true;
  private loopCheckInterval: number | null = null;

  public static getInstance(): EnhancedAudioManager {
    if (!EnhancedAudioManager.instance) {
      EnhancedAudioManager.instance = new EnhancedAudioManager();
    }
    return EnhancedAudioManager.instance;
  }

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize the audio system
   */
  private initializeAudio(): void {
    try {
      // Set global Howler settings
      Howler.volume(this.masterVolume);

      // Load existing music files
      this.loadBackgroundMusic();

      // Create procedural sound effects
      this.createProceduralSounds();

      logger.info('Enhanced audio manager initialized');
    } catch (error) {
      logger.error('Failed to initialize enhanced audio manager:', error);
    }
  }

  /**
   * Load background music from existing files
   */
  private loadBackgroundMusic(): void {
    try {
      // Load title music (plays once)
      this.titleMusic = new Howl({
        src: ['res/Soda Drinker Title Music.mp3'],
        loop: false, // Don't loop title music
        volume: this.musicVolume * this.masterVolume * this.titleMusicVolumeAdjustment,
        autoplay: false,
        html5: false, // Use Web Audio for better control
        preload: true,
        onload: () => {
          logger.debug('Title music loaded successfully');
        },
        onend: () => {
          logger.debug('Title music ended, transitioning to gameplay music');
          this.titleMusicPlayed = true;
          // Add small delay to ensure smooth transition
          setTimeout(() => {
            this.transitionToGameplayMusic();
          }, 100);
        },
        onloaderror: (_, error) => {
          logger.warn('Failed to load title music:', error);
        },
      });

      // Load gameplay music (loops continuously with optimized settings)
      this.gameplayMusic = new Howl({
        src: ['res/Between Level Music.mp3'],
        loop: false, // We'll handle looping manually to avoid dead air
        volume: this.musicVolume * this.masterVolume * this.gameplayMusicVolumeAdjustment,
        autoplay: false,
        html5: true, // Use HTML5 for simpler approach
        preload: true,
        onload: () => {
          logger.debug('Gameplay music loaded successfully');
        },
        onplay: () => {
          logger.debug('Gameplay music started playing');
          // Set a timer to restart before the dead air
          const duration = this.gameplayMusic?.duration() || 0;
          const loopPoint = Math.max(0, (duration - 5) * 1000); // 5 seconds before end

          if (loopPoint > 0) {
            setTimeout(() => {
              if (this.musicEnabled && !this.muted && this.currentTrack === 'gameplay') {
                logger.debug('Restarting gameplay music before dead air');
                this.gameplayMusic?.stop();
                setTimeout(() => {
                  if (this.gameplayMusic && this.currentTrack === 'gameplay') {
                    this.gameplayMusic.play();
                  }
                }, 100);
              }
            }, loopPoint);
          }
        },
        onend: () => {
          // Fallback restart if the timer approach fails
          if (this.musicEnabled && !this.muted && this.currentTrack === 'gameplay') {
            logger.debug('Gameplay music ended, restarting...');
            setTimeout(() => {
              if (this.gameplayMusic && !this.gameplayMusic.playing()) {
                this.gameplayMusic.play();
              }
            }, 100);
          }
        },
        onloaderror: (_, error) => {
          logger.warn('Failed to load gameplay music:', error);
        },
      });

      // Set initial current track to title music
      this.currentTrack = 'title';
    } catch (error) {
      logger.warn('Failed to create background music:', error);
    }
  }

  /**
   * Create procedural sound effects using Web Audio API
   */
  private createProceduralSounds(): void {
    // These will be created using the existing button-audio.ts system
    // We'll enhance it rather than replace it entirely
    this.createClickSounds();
    this.createPurchaseSounds();
    this.createAchievementSounds();
  }

  /**
   * Create click sound variations
   */
  private createClickSounds(): void {
    // We'll use the existing tone generation system from button-audio.ts
    // This is just a placeholder for the interface
  }

  /**
   * Create purchase sound effects
   */
  private createPurchaseSounds(): void {
    // Success and error sounds using procedural generation
  }

  /**
   * Create achievement sound effects
   */
  private createAchievementSounds(): void {
    // Celebration sounds for achievements
  }

  /**
   * Play a sound effect by ID
   */
  public playSound(soundId: string, options: { volume?: number; rate?: number } = {}): void {
    if (!this.sfxEnabled || this.muted) return;

    try {
      // For now, we'll delegate to the existing button audio system
      // and enhance it gradually
      this.playProceduralSound(soundId, options);
    } catch (error) {
      logger.warn(`Failed to play sound ${soundId}:`, error);
    }
  }

  /**
   * Play procedural sounds using the existing system
   */
  private playProceduralSound(soundId: string, options: { volume?: number; rate?: number }): void {
    const volume = (options.volume || 1) * this.sfxVolume * this.masterVolume;

    switch (soundId) {
      case 'click':
        this.playClickSound(volume);
        break;
      case 'click-critical':
        this.playCriticalClickSound(volume);
        break;
      case 'purchase-success':
        this.playPurchaseSuccessSound(volume);
        break;
      case 'purchase-error':
        this.playPurchaseErrorSound(volume);
        break;
      case 'level-up':
        this.playLevelUpSound(volume);
        break;
      case 'achievement':
        this.playAchievementSound(volume);
        break;
      default:
        logger.warn(`Unknown sound ID: ${soundId}`);
    }
  }

  /**
   * Play click sound using Web Audio API
   */
  private playClickSound(volume: number): void {
    this.playTone({
      frequency: 800 + Math.random() * 400,
      duration: 0.1,
      type: 'sine',
      volume: volume * 0.3,
    });
  }

  /**
   * Play critical click sound
   */
  private playCriticalClickSound(volume: number): void {
    // Play a more dramatic sound for critical clicks
    this.playTone({
      frequency: 1200,
      duration: 0.15,
      type: 'triangle',
      volume: volume * 0.5,
    });

    // Add a second harmonic
    setTimeout(() => {
      this.playTone({
        frequency: 1600,
        duration: 0.1,
        type: 'sine',
        volume: volume * 0.3,
      });
    }, 50);
  }

  /**
   * Play purchase success sound
   */
  private playPurchaseSuccessSound(volume: number): void {
    // Rising tone for success
    this.playTone({
      frequency: 600,
      endFrequency: 900,
      duration: 0.3,
      type: 'sine',
      volume: volume * 0.4,
    });
  }

  /**
   * Play purchase error sound
   */
  private playPurchaseErrorSound(volume: number): void {
    // Descending tone for error
    this.playTone({
      frequency: 400,
      endFrequency: 200,
      duration: 0.2,
      type: 'sawtooth',
      volume: volume * 0.3,
    });
  }

  /**
   * Play level up sound
   */
  private playLevelUpSound(volume: number): void {
    // Celebratory chord progression
    const frequencies = [523, 659, 784]; // C, E, G
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          duration: 0.4,
          type: 'sine',
          volume: volume * 0.3,
        });
      }, index * 100);
    });
  }

  /**
   * Play achievement sound
   */
  private playAchievementSound(volume: number): void {
    // Fanfare-like sound
    const melody = [523, 659, 784, 1047]; // C, E, G, C
    melody.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          duration: 0.2,
          type: 'triangle',
          volume: volume * 0.4,
        });
      }, index * 150);
    });
  }

  /**
   * Play a tone using Web Audio API
   */
  private playTone(config: {
    frequency: number;
    endFrequency?: number;
    duration: number;
    type?: OscillatorType;
    volume?: number;
  }): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = config.type || 'sine';
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);

      if (config.endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(
          config.endFrequency,
          audioContext.currentTime + config.duration
        );
      }

      gainNode.gain.setValueAtTime(config.volume || 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
    } catch (error) {
      logger.warn('Failed to play tone:', error);
    }
  }

  /**
   * Transition from title music to gameplay music
   */
  private transitionToGameplayMusic(): void {
    if (!this.musicEnabled || this.muted || !this.gameplayMusic) return;

    try {
      // Stop title music if it's still playing
      if (this.titleMusic && this.titleMusic.playing()) {
        this.titleMusic.stop();
      }

      // Switch to gameplay music
      this.currentTrack = 'gameplay';

      // Ensure gameplay music is fully loaded before starting
      if (this.gameplayMusic.state() === 'loaded') {
        this.startGameplayMusicLoop();
      } else {
        // Wait for load if not ready
        this.gameplayMusic.once('load', () => {
          this.startGameplayMusicLoop();
        });
      }
    } catch (error) {
      logger.warn('Failed to transition to gameplay music:', error);
    }
  }

  /**
   * Start gameplay music with optimized loop settings
   */
  private startGameplayMusicLoop(): void {
    if (!this.gameplayMusic || this.gameplayMusic.playing()) return;

    try {
      // Start the gameplay music (timer-based loop will handle dead air)
      this.gameplayMusic.play();

      // Start loop monitoring to ensure seamless playback
      this.startLoopMonitoring();

      logger.debug('Transitioned to gameplay music with timer-based looping');
    } catch (error) {
      logger.warn('Failed to start gameplay music loop:', error);
    }
  }

  /**
   * Monitor gameplay music to ensure it keeps looping
   */
  private startLoopMonitoring(): void {
    // Clear any existing interval
    if (this.loopCheckInterval) {
      clearInterval(this.loopCheckInterval);
    }

    // Check every 2 seconds if gameplay music should be playing but isn't
    this.loopCheckInterval = window.setInterval(() => {
      if (
        this.currentTrack === 'gameplay' &&
        this.musicEnabled &&
        !this.muted &&
        this.gameplayMusic &&
        !this.gameplayMusic.playing()
      ) {
        logger.debug('Gameplay music stopped unexpectedly, restarting...');
        this.gameplayMusic.play();
      }
    }, 2000);
  }

  /**
   * Stop loop monitoring
   */
  private stopLoopMonitoring(): void {
    if (this.loopCheckInterval) {
      clearInterval(this.loopCheckInterval);
      this.loopCheckInterval = null;
    }
  }

  /**
   * Start background music (smart selection based on state)
   */
  public startBackgroundMusic(): void {
    if (!this.musicEnabled || this.muted) return;

    try {
      // If title music hasn't played yet, start with title music
      if (!this.titleMusicPlayed && this.titleMusic) {
        if (!this.titleMusic.playing()) {
          this.currentTrack = 'title';
          this.titleMusic.play();
          logger.debug('Started title music');
        }
      }
      // Otherwise, start gameplay music
      else if (this.gameplayMusic) {
        if (!this.gameplayMusic.playing()) {
          this.currentTrack = 'gameplay';
          this.startGameplayMusicLoop();
        }
      }
    } catch (error) {
      logger.warn('Failed to start background music:', error);
    }
  }

  /**
   * Stop background music
   */
  public stopBackgroundMusic(): void {
    try {
      // Stop loop monitoring
      this.stopLoopMonitoring();

      // Stop whichever track is currently playing
      if (this.titleMusic && this.titleMusic.playing()) {
        this.titleMusic.stop();
      }
      if (this.gameplayMusic && this.gameplayMusic.playing()) {
        this.gameplayMusic.stop();
      }
      logger.debug('Background music stopped');
    } catch (error) {
      logger.warn('Failed to stop background music:', error);
    }
  }

  /**
   * Set master volume (0-1)
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);

    // Update volume for both music tracks with individual adjustments
    if (this.titleMusic) {
      this.titleMusic.volume(
        this.musicVolume * this.masterVolume * this.titleMusicVolumeAdjustment
      );
    }
    if (this.gameplayMusic) {
      this.gameplayMusic.volume(
        this.musicVolume * this.masterVolume * this.gameplayMusicVolumeAdjustment
      );
    }
  }

  /**
   * Set SFX volume (0-1)
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set music volume (0-1)
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));

    // Update volume for both music tracks with individual adjustments
    if (this.titleMusic) {
      this.titleMusic.volume(
        this.musicVolume * this.masterVolume * this.titleMusicVolumeAdjustment
      );
    }
    if (this.gameplayMusic) {
      this.gameplayMusic.volume(
        this.musicVolume * this.masterVolume * this.gameplayMusicVolumeAdjustment
      );
    }
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): void {
    this.muted = !this.muted;

    if (this.muted) {
      Howler.volume(0);
      this.stopBackgroundMusic();
    } else {
      Howler.volume(this.masterVolume);
      if (this.musicEnabled) {
        this.startBackgroundMusic();
      }
    }
  }

  /**
   * Toggle music on/off
   */
  public toggleMusic(): void {
    this.musicEnabled = !this.musicEnabled;

    if (this.musicEnabled && !this.muted) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }

  /**
   * Toggle sound effects on/off
   */
  public toggleSFX(): void {
    this.sfxEnabled = !this.sfxEnabled;
  }

  /**
   * Manually trigger transition to gameplay music (useful for testing or immediate gameplay)
   */
  public forceTransitionToGameplay(): void {
    if (!this.titleMusicPlayed) {
      this.titleMusicPlayed = true;
      this.transitionToGameplayMusic();
    }
  }

  /**
   * Adjust individual track volume levels for balancing (dev tool)
   */
  public adjustTrackVolumes(titleAdjustment: number, gameplayAdjustment: number): void {
    this.titleMusicVolumeAdjustment = Math.max(0, Math.min(2, titleAdjustment));
    this.gameplayMusicVolumeAdjustment = Math.max(0, Math.min(2, gameplayAdjustment));

    // Apply the new adjustments immediately
    if (this.titleMusic) {
      this.titleMusic.volume(
        this.musicVolume * this.masterVolume * this.titleMusicVolumeAdjustment
      );
    }
    if (this.gameplayMusic) {
      this.gameplayMusic.volume(
        this.musicVolume * this.masterVolume * this.gameplayMusicVolumeAdjustment
      );
    }

    logger.debug(
      `Track volume adjustments: Title=${this.titleMusicVolumeAdjustment}, Gameplay=${this.gameplayMusicVolumeAdjustment}`
    );
  }

  /**
   * Get current audio state
   */
  public getAudioState(): {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    muted: boolean;
    musicEnabled: boolean;
    sfxEnabled: boolean;
    musicPlaying: boolean;
    currentTrack: 'title' | 'gameplay' | null;
    titleMusicPlayed: boolean;
    titleVolumeAdjustment: number;
    gameplayVolumeAdjustment: number;
  } {
    const titlePlaying = this.titleMusic ? this.titleMusic.playing() : false;
    const gameplayPlaying = this.gameplayMusic ? this.gameplayMusic.playing() : false;

    return {
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      muted: this.muted,
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      musicPlaying: titlePlaying || gameplayPlaying,
      currentTrack: this.currentTrack,
      titleMusicPlayed: this.titleMusicPlayed,
      titleVolumeAdjustment: this.titleMusicVolumeAdjustment,
      gameplayVolumeAdjustment: this.gameplayMusicVolumeAdjustment,
    };
  }

  /**
   * Cleanup audio resources
   */
  public cleanup(): void {
    try {
      this.stopBackgroundMusic();
      this.stopLoopMonitoring();

      this.soundEffects.forEach(sound => {
        sound.howl.unload();
      });

      this.soundEffects.clear();

      // Cleanup both music tracks
      if (this.titleMusic) {
        this.titleMusic.unload();
        this.titleMusic = null;
      }

      if (this.gameplayMusic) {
        this.gameplayMusic.unload();
        this.gameplayMusic = null;
      }

      this.currentTrack = null;

      logger.debug('Audio manager cleaned up');
    } catch (error) {
      logger.warn('Failed to cleanup audio manager:', error);
    }
  }
}

// Export singleton instance
export const enhancedAudioManager = EnhancedAudioManager.getInstance();
