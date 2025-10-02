export interface SafetyConfig {
  maxMasterGain: number;
  maxBinauralHz: number;
  minAge: number;
  warningThresholdDb: number;
  maxOutputDb: number;
}

export const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  maxMasterGain: 0.5,
  maxBinauralHz: 8,
  minAge: 16,
  warningThresholdDb: 75,
  maxOutputDb: 85,
};

export interface SafetyWarning {
  type: 'volume' | 'binaural' | 'age' | 'duration';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export class SafetyMonitor {
  private config: SafetyConfig;
  private warnings: SafetyWarning[] = [];
  private sessionStartTime: number | null = null;
  private volumeCheckInterval: number | null = null;
  private userAge: number | null = null;

  constructor(config: Partial<SafetyConfig> = {}) {
    this.config = { ...DEFAULT_SAFETY_CONFIG, ...config };
  }

  setUserAge(age: number): void {
    this.userAge = age;
  }

  validateBinauralFrequency(binauralHz: number): {
    valid: boolean;
    adjustedHz: number;
    warning?: SafetyWarning;
  } {
    if (this.userAge !== null && this.userAge < this.config.minAge) {
      return {
        valid: false,
        adjustedHz: 0,
        warning: {
          type: 'age',
          severity: 'critical',
          message: `Binaural beats are restricted for users under ${this.config.minAge} years old.`,
          timestamp: Date.now(),
        },
      };
    }

    if (binauralHz > this.config.maxBinauralHz) {
      const warning: SafetyWarning = {
        type: 'binaural',
        severity: 'warning',
        message: `Binaural frequency capped at ${this.config.maxBinauralHz} Hz for safety.`,
        timestamp: Date.now(),
      };
      this.warnings.push(warning);
      return {
        valid: true,
        adjustedHz: this.config.maxBinauralHz,
        warning,
      };
    }

    if (binauralHz < 1) {
      return {
        valid: true,
        adjustedHz: 1,
        warning: {
          type: 'binaural',
          severity: 'info',
          message: 'Binaural frequency adjusted to minimum 1 Hz.',
          timestamp: Date.now(),
        },
      };
    }

    return { valid: true, adjustedHz: binauralHz };
  }

  validateGain(gain: number): {
    valid: boolean;
    adjustedGain: number;
    warning?: SafetyWarning;
  } {
    if (gain > this.config.maxMasterGain) {
      const warning: SafetyWarning = {
        type: 'volume',
        severity: 'critical',
        message: `Volume capped at ${Math.round(this.config.maxMasterGain * 100)}% for hearing safety.`,
        timestamp: Date.now(),
      };
      this.warnings.push(warning);
      return {
        valid: true,
        adjustedGain: this.config.maxMasterGain,
        warning,
      };
    }

    return { valid: true, adjustedGain: gain };
  }

  startSession(): void {
    this.sessionStartTime = Date.now();
    this.showInitialWarning();
  }

  private showInitialWarning(): void {
    const warning: SafetyWarning = {
      type: 'volume',
      severity: 'info',
      message:
        'For best results and hearing safety, use headphones at a comfortable volume. Take breaks every 30 minutes.',
      timestamp: Date.now(),
    };
    this.warnings.push(warning);
  }

  checkDuration(): SafetyWarning | null {
    if (!this.sessionStartTime) return null;

    const durationMin = (Date.now() - this.sessionStartTime) / 60000;

    if (durationMin >= 60) {
      return {
        type: 'duration',
        severity: 'warning',
        message:
          'You have been listening for over 1 hour. Consider taking a break to rest your ears.',
        timestamp: Date.now(),
      };
    }

    if (durationMin >= 30 && durationMin < 31) {
      return {
        type: 'duration',
        severity: 'info',
        message:
          'You have been listening for 30 minutes. Consider taking a short break.',
        timestamp: Date.now(),
      };
    }

    return null;
  }

  monitorVolume(analyserNode: AnalyserNode): SafetyWarning | null {
    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const averageLevel = sum / dataArray.length;
    const estimatedDb = (averageLevel / 255) * 100;

    if (estimatedDb > this.config.maxOutputDb) {
      return {
        type: 'volume',
        severity: 'critical',
        message: `Volume level too high (${Math.round(estimatedDb)} dB). Reducing to safe level automatically.`,
        timestamp: Date.now(),
      };
    }

    if (estimatedDb > this.config.warningThresholdDb) {
      return {
        type: 'volume',
        severity: 'warning',
        message: `Volume approaching unsafe levels (${Math.round(estimatedDb)} dB). Consider lowering.`,
        timestamp: Date.now(),
      };
    }

    return null;
  }

  getRecentWarnings(count: number = 5): SafetyWarning[] {
    return this.warnings.slice(-count);
  }

  getAllWarnings(): SafetyWarning[] {
    return [...this.warnings];
  }

  clearWarnings(): void {
    this.warnings = [];
  }

  endSession(): void {
    this.sessionStartTime = null;
    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }
  }

  getConfig(): SafetyConfig {
    return { ...this.config };
  }
}

export function createHeadphoneWarningMessage(): string {
  return `🎧 Headphone Safety Notice:

• Use headphones at a comfortable volume
• Start at a low volume and adjust gradually
• Take 5-minute breaks every 30 minutes
• Stop immediately if you experience discomfort
• Binaural beats may affect focus and relaxation

This tool is for wellness purposes and not a medical device.`;
}

export function shouldShowBinauralRestriction(age: number | null): boolean {
  return age !== null && age < DEFAULT_SAFETY_CONFIG.minAge;
}
