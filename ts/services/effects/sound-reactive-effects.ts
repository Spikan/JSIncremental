// Sound Reactive Effects: Audio-driven visual effects for the thematic header
// Connects to the existing audio system to create sound-reactive visual feedback

import { logger } from '../logger';
import { BubbleParticleSystem } from '../particle-systems/bubble-particle-system';
import { LiquidProgressAnimator } from '../animations/liquid-progress-animator';

export interface SoundReactiveConfig {
  enabled: boolean;
  sensitivity: number;
  responseDelay: number;
  effectIntensity: number;
  audioThreshold: number;
}

export interface AudioEvent {
  type: 'click' | 'purchase' | 'music' | 'sfx';
  volume: number;
  timestamp: number;
  data?: any;
}

export class SoundReactiveEffects {
  private audioManager: any;
  private bubbleSystem: BubbleParticleSystem | null;
  private liquidAnimator: LiquidProgressAnimator | null;
  private config: SoundReactiveConfig;
  private isActive: boolean = false;
  private audioHistory: AudioEvent[] = [];
  private lastAudioTime: number = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationId: number | null = null;

  constructor(
    audioManager: any,
    bubbleSystem: BubbleParticleSystem | null,
    liquidAnimator: LiquidProgressAnimator | null
  ) {
    this.audioManager = audioManager;
    this.bubbleSystem = bubbleSystem;
    this.liquidAnimator = liquidAnimator;

    this.config = {
      enabled: true,
      sensitivity: 1.0,
      responseDelay: 50,
      effectIntensity: 1.0,
      audioThreshold: 0.1,
    };

    this.setupAudioAnalysis();
    this.setupAudioListeners();
  }

  /**
   * Setup Web Audio API for real-time audio analysis
   */
  private setupAudioAnalysis(): void {
    try {
      // Create audio context for analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      logger.info('Audio analysis setup complete');
    } catch (error) {
      logger.warn('Failed to setup audio analysis:', error);
    }
  }

  /**
   * Setup listeners for audio events from the existing audio manager
   */
  private setupAudioListeners(): void {
    if (!this.audioManager) {
      logger.warn('Audio manager not available, sound reactive effects disabled');
      return;
    }

    // Listen for button click sounds
    if (this.audioManager.onButtonClick) {
      this.audioManager.onButtonClick((volume: number) => {
        this.onButtonClick(volume);
      });
    }

    // Listen for purchase sounds
    if (this.audioManager.onPurchase) {
      this.audioManager.onPurchase((volume: number) => {
        this.onPurchase(volume);
      });
    }

    // Listen for music volume changes
    if (this.audioManager.onVolumeChange) {
      this.audioManager.onVolumeChange((volume: number) => {
        this.onVolumeChange(volume);
      });
    }

    // Listen for sound effects
    if (this.audioManager.onSoundEffect) {
      this.audioManager.onSoundEffect((effect: string, volume: number) => {
        this.onSoundEffect(effect, volume);
      });
    }

    // Start audio analysis if available
    if (this.analyser) {
      this.startAudioAnalysis();
    }
  }

  /**
   * Start real-time audio analysis
   */
  private startAudioAnalysis(): void {
    if (!this.analyser || !this.dataArray) return;

    const analyzeAudio = () => {
      if (!this.isActive || !this.analyser || !this.dataArray) return;

      this.analyser.getByteFrequencyData(this.dataArray as any);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i] || 0;
      }
      const averageVolume = sum / this.dataArray.length / 255;

      // Trigger effects based on audio level
      if (averageVolume > this.config.audioThreshold) {
        this.onAudioLevelChange(averageVolume);
      }

      this.animationId = requestAnimationFrame(analyzeAudio);
    };

    this.animationId = requestAnimationFrame(analyzeAudio);
  }

  /**
   * Handle button click audio events
   */
  private onButtonClick(volume: number): void {
    if (!this.config.enabled) return;

    const event: AudioEvent = {
      type: 'click',
      volume: volume * this.config.sensitivity,
      timestamp: Date.now(),
    };

    this.audioHistory.push(event);
    this.cleanupAudioHistory();

    // Spawn click bubbles
    const intensity = Math.min(volume * this.config.effectIntensity, 1);
    this.spawnClickBubbles(intensity);

    // Add liquid ripple effect
    this.addLiquidRipple(intensity);

    logger.debug('Button click effect triggered:', { volume, intensity });
  }

  /**
   * Handle purchase audio events
   */
  private onPurchase(volume: number): void {
    if (!this.config.enabled) return;

    const event: AudioEvent = {
      type: 'purchase',
      volume: volume * this.config.sensitivity,
      timestamp: Date.now(),
    };

    this.audioHistory.push(event);
    this.cleanupAudioHistory();

    // Spawn celebration bubbles
    const intensity = Math.min(volume * this.config.effectIntensity * 1.5, 1);
    this.spawnCelebrationBubbles(intensity);

    // Intensify liquid flow
    this.intensifyLiquidFlow(intensity);

    logger.debug('Purchase effect triggered:', { volume, intensity });
  }

  /**
   * Handle volume change events
   */
  private onVolumeChange(volume: number): void {
    if (!this.config.enabled) return;

    const event: AudioEvent = {
      type: 'music',
      volume: volume * this.config.sensitivity,
      timestamp: Date.now(),
    };

    this.audioHistory.push(event);
    this.cleanupAudioHistory();

    // Adjust bubble density based on music volume
    this.adjustBubbleDensity(volume);

    // Adjust liquid animation speed
    this.adjustLiquidSpeed(volume);

    logger.debug('Volume change effect triggered:', { volume });
  }

  /**
   * Handle sound effect events
   */
  private onSoundEffect(effect: string, volume: number): void {
    if (!this.config.enabled) return;

    const event: AudioEvent = {
      type: 'sfx',
      volume: volume * this.config.sensitivity,
      timestamp: Date.now(),
      data: { effect },
    };

    this.audioHistory.push(event);
    this.cleanupAudioHistory();

    // Custom effects based on sound effect type
    switch (effect) {
      case 'levelup':
        this.onLevelUpEffect(volume);
        break;
      case 'achievement':
        this.onAchievementEffect(volume);
        break;
      case 'error':
        this.onErrorEffect(volume);
        break;
      default:
        this.onGenericEffect(volume);
        break;
    }

    logger.debug('Sound effect triggered:', { effect, volume });
  }

  /**
   * Handle real-time audio level changes
   */
  private onAudioLevelChange(volume: number): void {
    if (!this.config.enabled) return;

    const now = Date.now();
    if (now - this.lastAudioTime < this.config.responseDelay) return;

    this.lastAudioTime = now;

    // Subtle ambient effects based on audio level
    if (volume > this.config.audioThreshold * 2) {
      this.addAmbientEffects(volume);
    }
  }

  /**
   * Spawn click bubbles
   */
  private spawnClickBubbles(intensity: number): void {
    if (!this.bubbleSystem) return;

    const count = Math.floor(intensity * 3) + 1;
    for (let i = 0; i < count; i++) {
      this.bubbleSystem.spawnCurrencyBubble(
        Math.random() * window.innerWidth,
        Math.random() * 100 + 50,
        '+1'
      );
    }
  }

  /**
   * Spawn celebration bubbles
   */
  private spawnCelebrationBubbles(intensity: number): void {
    if (!this.bubbleSystem) return;

    const count = Math.floor(intensity * 5) + 2;
    for (let i = 0; i < count; i++) {
      this.bubbleSystem.spawnCelebrationBubble(
        Math.random() * window.innerWidth,
        Math.random() * 100 + 50,
        'purchase'
      );
    }
  }

  /**
   * Add liquid ripple effect
   */
  private addLiquidRipple(intensity: number): void {
    if (!this.liquidAnimator) return;

    this.liquidAnimator.addRippleEffect(
      'drinkProgressBar',
      Math.random() * 100,
      Math.random() * 100,
      intensity * 0.6
    );
  }

  /**
   * Intensify liquid flow
   */
  private intensifyLiquidFlow(intensity: number): void {
    if (!this.liquidAnimator) return;

    this.liquidAnimator.intensifyFlow(intensity);
  }

  /**
   * Adjust bubble density based on volume
   */
  private adjustBubbleDensity(volume: number): void {
    if (!this.bubbleSystem) return;

    const density = 0.5 + volume * 0.5;
    this.bubbleSystem.setDensity(density);
  }

  /**
   * Adjust liquid animation speed
   */
  private adjustLiquidSpeed(volume: number): void {
    if (!this.liquidAnimator) return;

    const speed = 0.5 + volume * 0.5;
    this.liquidAnimator.setComplexity(speed);
  }

  /**
   * Add ambient effects based on audio level
   */
  private addAmbientEffects(volume: number): void {
    if (!this.bubbleSystem) return;

    // Spawn ambient bubbles more frequently with higher volume
    if (Math.random() < volume * 0.3) {
      this.bubbleSystem.spawnAmbientBubbles();
    }
  }

  /**
   * Handle level up effects
   */
  private onLevelUpEffect(_volume: number): void {
    // const _intensity = Math.min(volume * this.config.effectIntensity * 2, 1); // Removed unused variable

    // Spawn special level up bubbles
    if (this.bubbleSystem) {
      for (let i = 0; i < 8; i++) {
        this.bubbleSystem.spawnCelebrationBubble(
          Math.random() * window.innerWidth,
          Math.random() * 100 + 50,
          'levelup'
        );
      }
    }

    // Intense liquid celebration
    if (this.liquidAnimator) {
      this.liquidAnimator.intensifyFlow(1.0);
    }
  }

  /**
   * Handle achievement effects
   */
  private onAchievementEffect(_volume: number): void {
    // const _intensity = Math.min(volume * this.config.effectIntensity * 1.5, 1); // Removed unused variable

    // Spawn achievement bubbles
    if (this.bubbleSystem) {
      for (let i = 0; i < 6; i++) {
        this.bubbleSystem.spawnCelebrationBubble(
          Math.random() * window.innerWidth,
          Math.random() * 100 + 50,
          'achievement'
        );
      }
    }
  }

  /**
   * Handle error effects
   */
  private onErrorEffect(_volume: number): void {
    // Subtle error indication - maybe a brief red tint
    const header = document.getElementById('thematicHeader');
    if (header) {
      header.style.filter = 'hue-rotate(180deg)';
      setTimeout(() => {
        header.style.filter = '';
      }, 200);
    }
  }

  /**
   * Handle generic effects
   */
  private onGenericEffect(volume: number): void {
    const intensity = Math.min(volume * this.config.effectIntensity, 1);
    this.addLiquidRipple(intensity);
  }

  /**
   * Cleanup old audio history
   */
  private cleanupAudioHistory(): void {
    const now = Date.now();
    this.audioHistory = this.audioHistory.filter(
      event => now - event.timestamp < 5000 // Keep last 5 seconds
    );
  }

  /**
   * Set enabled state
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.isActive = enabled;

    if (enabled) {
      this.startAudioAnalysis();
    } else {
      this.stopAudioAnalysis();
    }

    logger.info(`Sound reactive effects enabled: ${enabled}`);
  }

  /**
   * Stop audio analysis
   */
  private stopAudioAnalysis(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<SoundReactiveConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): SoundReactiveConfig {
    return { ...this.config };
  }

  /**
   * Get audio history for debugging
   */
  public getAudioHistory(): AudioEvent[] {
    return [...this.audioHistory];
  }

  /**
   * Get status
   */
  public getStatus(): {
    enabled: boolean;
    active: boolean;
    audioHistoryLength: number;
    sensitivity: number;
  } {
    return {
      enabled: this.config.enabled,
      active: this.isActive,
      audioHistoryLength: this.audioHistory.length,
      sensitivity: this.config.sensitivity,
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopAudioAnalysis();
    this.audioHistory = [];

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
  }
}
