import { ClockSyncManager } from './clockSync';
import { TempoGrid, type SyncConfig, calculateSweepFactor } from './syncProtocol';
import { calculateHarmonicStack, type GeometricFrequencyPack } from './geometricFrequencies';

export interface PrecisionAudioEngineConfig {
  syncConfig: SyncConfig;
  clockSync: ClockSyncManager;
  geometricPack?: GeometricFrequencyPack;
}

export class PrecisionAudioEngine {
  private audioContext: AudioContext | null = null;
  private workletNodes: AudioWorkletNode[] = [];
  private gainNodes: GainNode[] = [];
  private analyserNode: AnalyserNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private isRunning = false;
  private scheduledStartTime: number | null = null;
  private barResetInterval: number | null = null;
  private config: PrecisionAudioEngineConfig | null = null;
  private tempoGrid: TempoGrid | null = null;
  private startServerEpochMs: number = 0;

  async initialize(): Promise<void> {
    this.audioContext = new AudioContext({
      latencyHint: 'interactive',
      sampleRate: 48000,
    });

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      await this.audioContext.audioWorklet.addModule('/audio-worklet-processor.js');
    } catch (error) {
      console.error('Failed to load AudioWorklet:', error);
      throw new Error('AudioWorklet not supported. Please use a modern browser.');
    }

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 8192;
    this.analyserNode.smoothingTimeConstant = 0.85;
    this.analyserNode.minDecibels = -90;
    this.analyserNode.maxDecibels = -10;

    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.merger = this.audioContext.createChannelMerger(2);
  }

  async scheduleStart(config: PrecisionAudioEngineConfig): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized');
    }

    this.config = config;
    this.tempoGrid = new TempoGrid(
      config.syncConfig.bpm,
      config.syncConfig.beatsPerBar,
      config.syncConfig.bar0EpochMs
    );

    const serverNow = config.clockSync.getServerTime();
    const nextBarEpochMs = this.tempoGrid.getNextBarStartTime(serverNow);
    this.startServerEpochMs = nextBarEpochMs;

    const startContextTime = config.clockSync.toContextTime(
      nextBarEpochMs,
      this.audioContext
    );

    this.scheduledStartTime = startContextTime;

    await this.createOscillatorGraph(config);

    this.isRunning = true;

    this.startBarResetLoop();
  }

  private async createOscillatorGraph(config: PrecisionAudioEngineConfig): Promise<void> {
    if (!this.audioContext || !this.analyserNode || !this.compressor || !this.merger) {
      throw new Error('Audio context not ready');
    }

    this.stopAllOscillators();

    const { syncConfig, geometricPack } = config;
    const harmonics = geometricPack
      ? calculateHarmonicStack(syncConfig.f0, geometricPack.ratios, geometricPack.gains)
      : [{ frequency: syncConfig.f0, gain: 0.5 }];

    const masterGain = Math.min(0.5, 0.5);

    if (syncConfig.binauralHz && harmonics.length === 1) {
      const leftWorklet = new AudioWorkletNode(
        this.audioContext,
        'precision-oscillator-processor'
      );
      const rightWorklet = new AudioWorkletNode(
        this.audioContext,
        'precision-oscillator-processor'
      );

      const leftGain = this.audioContext.createGain();
      const rightGain = this.audioContext.createGain();

      leftGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      rightGain.gain.setValueAtTime(0, this.audioContext.currentTime);

      if (this.scheduledStartTime) {
        leftGain.gain.linearRampToValueAtTime(
          masterGain,
          this.scheduledStartTime + 0.5
        );
        rightGain.gain.linearRampToValueAtTime(
          masterGain,
          this.scheduledStartTime + 0.5
        );
      }

      leftWorklet.connect(leftGain);
      rightWorklet.connect(rightGain);

      leftGain.connect(this.merger, 0, 0);
      rightGain.connect(this.merger, 0, 1);

      this.merger.connect(this.analyserNode);
      this.merger.connect(this.compressor);
      this.compressor.connect(this.audioContext.destination);

      leftWorklet.port.postMessage({
        type: 'start',
        data: {
          frequency: syncConfig.f0,
          waveType: syncConfig.waveform,
          gain: masterGain,
        },
      });

      rightWorklet.port.postMessage({
        type: 'start',
        data: {
          frequency: syncConfig.f0 + syncConfig.binauralHz,
          waveType: syncConfig.waveform,
          gain: masterGain,
        },
      });

      this.workletNodes.push(leftWorklet, rightWorklet);
      this.gainNodes.push(leftGain, rightGain);
    } else {
      for (const harmonic of harmonics) {
        const worklet = new AudioWorkletNode(
          this.audioContext,
          'precision-oscillator-processor'
        );

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);

        if (this.scheduledStartTime) {
          gain.gain.linearRampToValueAtTime(
            harmonic.gain * masterGain,
            this.scheduledStartTime + 0.5
          );
        }

        worklet.connect(gain);
        gain.connect(this.analyserNode);
        gain.connect(this.compressor);

        worklet.port.postMessage({
          type: 'start',
          data: {
            frequency: harmonic.frequency,
            waveType: syncConfig.waveform,
            gain: harmonic.gain * masterGain,
          },
        });

        this.workletNodes.push(worklet);
        this.gainNodes.push(gain);
      }

      this.compressor.connect(this.audioContext.destination);
    }
  }

  private startBarResetLoop(): void {
    if (!this.config || !this.tempoGrid || !this.audioContext) return;

    const checkInterval = 25;

    this.barResetInterval = window.setInterval(() => {
      if (!this.audioContext || !this.config || !this.tempoGrid) return;

      const serverNow = this.config.clockSync.getServerTime();
      const timeUntilNextBar = this.tempoGrid.getTimeUntilNextBar(serverNow);

      if (timeUntilNextBar < 200) {
        const nextBarEpochMs = this.tempoGrid.getNextBarStartTime(serverNow);
        const nextBarContextTime = this.config.clockSync.toContextTime(
          nextBarEpochMs,
          this.audioContext
        );

        this.workletNodes.forEach(node => {
          node.port.postMessage({
            type: 'resetPhase',
            data: {},
          });
        });
      }
    }, checkInterval);
  }

  applyDriftCorrection(driftMs: number): void {
    if (Math.abs(driftMs) < 2) return;

    const cents = driftMs > 0 ? -2 : 2;

    this.workletNodes.forEach(node => {
      node.port.postMessage({
        type: 'updateDetune',
        data: { cents },
      });
    });

    setTimeout(() => {
      this.workletNodes.forEach(node => {
        node.port.postMessage({
          type: 'updateDetune',
          data: { cents: 0 },
        });
      });
    }, 300);
  }

  stop(): void {
    this.stopAllOscillators();

    if (this.barResetInterval !== null) {
      clearInterval(this.barResetInterval);
      this.barResetInterval = null;
    }

    this.isRunning = false;
    this.scheduledStartTime = null;
  }

  private stopAllOscillators(): void {
    this.workletNodes.forEach(node => {
      node.port.postMessage({ type: 'stop' });
      node.disconnect();
    });

    this.gainNodes.forEach(gain => gain.disconnect());

    this.workletNodes = [];
    this.gainNodes = [];
  }

  getSpectrumData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(0);

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getScheduledStartTime(): number | null {
    return this.scheduledStartTime;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
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
