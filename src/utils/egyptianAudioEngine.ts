import type { EgyptianChapter } from './egyptianCodeFrequencies';
import { generatePhiIntervals, generateHarmonicStack } from './egyptianCodeFrequencies';

export class EgyptianAudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private analyserNode: AnalyserNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private isPlaying = false;
  private breathPulseInterval: number | null = null;

  async initialize(): Promise<void> {
    this.audioContext = new AudioContext({
      latencyHint: 'interactive',
      sampleRate: 48000,
    });

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 8192;
    this.analyserNode.smoothingTimeConstant = 0.85;

    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.merger = this.audioContext.createChannelMerger(2);
  }

  async playChapter(chapter: EgyptianChapter, intensity: number = 0.5): Promise<void> {
    if (!this.audioContext || !this.analyserNode || !this.compressor || !this.merger) {
      throw new Error('Audio engine not initialized');
    }

    this.stopAllOscillators();

    const masterGain = Math.min(0.5, intensity * 0.5);
    const { audio } = chapter;

    if (audio.base && audio.overlay) {
      this.createDualTone(audio.base, audio.overlay, masterGain);
    } else if (audio.stack) {
      this.createHarmonicStack(audio.stack, masterGain);
    } else if (audio.sweep) {
      this.createFrequencySweep(audio.sweep, chapter.duration, masterGain);
    } else if (audio.steps) {
      this.createStepSequence(audio.steps, chapter.duration, masterGain);
    } else if (audio.tones && audio.beat) {
      this.createBinauralBeat(audio.tones[0], audio.tones[1], masterGain);
    } else if (audio.base && audio.binaural) {
      this.createBinauralBeat(audio.base, audio.base + audio.binaural, masterGain);
    } else if (audio.base) {
      this.createSingleTone(audio.base, masterGain);
    }

    if (chapter.breath.isochronic) {
      this.startBreathPulse(chapter.breath.isochronic, chapter.breath.bpm || 6);
    }

    this.isPlaying = true;
  }

  private createSingleTone(frequency: number, gain: number): void {
    if (!this.audioContext || !this.compressor) return;

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + 2);

    osc.connect(gainNode);
    gainNode.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);

    if (this.analyserNode) {
      gainNode.connect(this.analyserNode);
    }

    osc.start();

    this.oscillators.push(osc);
    this.gainNodes.push(gainNode);
  }

  private createDualTone(freq1: number, freq2: number, gain: number): void {
    if (!this.audioContext || !this.compressor) return;

    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = freq1;
    osc2.frequency.value = freq2;

    const individualGain = gain * 0.5;

    gain1.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain1.gain.linearRampToValueAtTime(individualGain, this.audioContext.currentTime + 2);
    gain2.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain2.gain.linearRampToValueAtTime(individualGain, this.audioContext.currentTime + 2);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.compressor);
    gain2.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);

    if (this.analyserNode) {
      gain1.connect(this.analyserNode);
      gain2.connect(this.analyserNode);
    }

    osc1.start();
    osc2.start();

    this.oscillators.push(osc1, osc2);
    this.gainNodes.push(gain1, gain2);
  }

  private createHarmonicStack(frequencies: number[], gain: number): void {
    if (!this.audioContext || !this.compressor) return;

    const individualGain = gain / frequencies.length;

    frequencies.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const fadeGain = individualGain * (1 - index * 0.15);

      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(fadeGain, this.audioContext!.currentTime + 2);

      osc.connect(gainNode);
      gainNode.connect(this.compressor!);

      if (this.analyserNode && index === 0) {
        gainNode.connect(this.analyserNode);
      }

      osc.start();

      this.oscillators.push(osc);
      this.gainNodes.push(gainNode);
    });

    this.compressor.connect(this.audioContext.destination);
  }

  private createFrequencySweep(frequencies: number[], duration: number, gain: number): void {
    if (!this.audioContext || !this.compressor) return;

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequencies[0];

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + 2);

    const stepDuration = duration / frequencies.length;
    frequencies.forEach((freq, index) => {
      osc.frequency.linearRampToValueAtTime(
        freq,
        this.audioContext!.currentTime + (index + 1) * stepDuration
      );
    });

    osc.connect(gainNode);
    gainNode.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);

    if (this.analyserNode) {
      gainNode.connect(this.analyserNode);
    }

    osc.start();

    this.oscillators.push(osc);
    this.gainNodes.push(gainNode);
  }

  private createStepSequence(steps: number[], duration: number, gain: number): void {
    if (!this.audioContext || !this.compressor) return;

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = steps[0];

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + 1);

    const stepDuration = duration / steps.length;
    steps.forEach((freq, index) => {
      osc.frequency.setValueAtTime(
        freq,
        this.audioContext!.currentTime + index * stepDuration
      );
    });

    osc.connect(gainNode);
    gainNode.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);

    if (this.analyserNode) {
      gainNode.connect(this.analyserNode);
    }

    osc.start();

    this.oscillators.push(osc);
    this.gainNodes.push(gainNode);
  }

  private createBinauralBeat(leftFreq: number, rightFreq: number, gain: number): void {
    if (!this.audioContext || !this.compressor || !this.merger) return;

    const leftOsc = this.audioContext.createOscillator();
    const rightOsc = this.audioContext.createOscillator();
    const leftGain = this.audioContext.createGain();
    const rightGain = this.audioContext.createGain();

    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    leftOsc.frequency.value = leftFreq;
    rightOsc.frequency.value = rightFreq;

    leftGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    leftGain.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + 2);
    rightGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    rightGain.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + 2);

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);

    leftGain.connect(this.merger, 0, 0);
    rightGain.connect(this.merger, 0, 1);

    this.merger.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);

    if (this.analyserNode) {
      this.merger.connect(this.analyserNode);
    }

    leftOsc.start();
    rightOsc.start();

    this.oscillators.push(leftOsc, rightOsc);
    this.gainNodes.push(leftGain, rightGain);
  }

  private startBreathPulse(frequency: number, bpm: number): void {
    if (!this.audioContext) return;

    const intervalMs = (60 / bpm) * 1000;

    this.breathPulseInterval = window.setInterval(() => {
      this.gainNodes.forEach(gainNode => {
        if (this.audioContext) {
          const currentGain = gainNode.gain.value;
          gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(currentGain, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            currentGain * 1.2,
            this.audioContext.currentTime + 0.3
          );
          gainNode.gain.linearRampToValueAtTime(
            currentGain,
            this.audioContext.currentTime + 0.6
          );
        }
      });
    }, intervalMs);
  }

  stop(): void {
    this.stopAllOscillators();

    if (this.breathPulseInterval) {
      clearInterval(this.breathPulseInterval);
      this.breathPulseInterval = null;
    }

    this.isPlaying = false;
  }

  private stopAllOscillators(): void {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // already stopped
      }
    });

    this.gainNodes.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // already disconnected
      }
    });

    this.oscillators = [];
    this.gainNodes = [];
  }

  getSpectrumData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(0);

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async destroy(): Promise<void> {
    this.stop();

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.analyserNode = null;
    this.compressor = null;
    this.merger = null;
  }
}
