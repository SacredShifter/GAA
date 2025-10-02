import { useRef, useCallback, useState, useEffect } from 'react';

export type WaveType = 'sine' | 'triangle' | 'square' | 'sawtooth';
export type AudioMode = 'single' | 'harmonic' | 'sweep' | 'binaural';

export interface AudioEngineState {
  isPlaying: boolean;
  frequency: number;
  intensity: number;
  waveType: WaveType;
  mode: AudioMode;
  harmonicCount: number;
  sweepStart: number;
  sweepEnd: number;
  sweepDuration: number;
  binauralBeat: number;
}

export interface SpectrumData {
  frequencies: Uint8Array;
  timeDomain: Uint8Array;
  averageEnergy: number;
  peakFrequency: number;
}

export const useEnhancedAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const mainOscillatorRef = useRef<OscillatorNode | null>(null);
  const harmonicOscillatorsRef = useRef<OscillatorNode[]>([]);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const sweepIntervalRef = useRef<number | null>(null);

  const [state, setState] = useState<AudioEngineState>({
    isPlaying: false,
    frequency: 432,
    intensity: 0.5,
    waveType: 'sine',
    mode: 'single',
    harmonicCount: 3,
    sweepStart: 396,
    sweepEnd: 852,
    sweepDuration: 10,
    binauralBeat: 10,
  });

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
    analyserRef.current.smoothingTimeConstant = 0.8;
    pannerRef.current = audioContextRef.current.createStereoPanner();

    return () => {
      stop();
      audioContextRef.current?.close();
    };
  }, []);

  const stopAllOscillators = useCallback(() => {
    if (mainOscillatorRef.current) {
      mainOscillatorRef.current.stop();
      mainOscillatorRef.current.disconnect();
      mainOscillatorRef.current = null;
    }

    harmonicOscillatorsRef.current.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    harmonicOscillatorsRef.current = [];

    if (leftOscillatorRef.current) {
      leftOscillatorRef.current.stop();
      leftOscillatorRef.current.disconnect();
      leftOscillatorRef.current = null;
    }

    if (rightOscillatorRef.current) {
      rightOscillatorRef.current.stop();
      rightOscillatorRef.current.disconnect();
      rightOscillatorRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (leftGainRef.current) {
      leftGainRef.current.disconnect();
      leftGainRef.current = null;
    }

    if (rightGainRef.current) {
      rightGainRef.current.disconnect();
      rightGainRef.current = null;
    }

    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }
  }, []);

  const startSingleMode = useCallback((frequency: number, intensity: number, waveType: WaveType) => {
    if (!audioContextRef.current || !analyserRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    gainNode.gain.setValueAtTime(intensity, audioContextRef.current.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    oscillator.start();

    mainOscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
  }, []);

  const startHarmonicMode = useCallback((
    frequency: number,
    intensity: number,
    waveType: WaveType,
    harmonicCount: number
  ) => {
    if (!audioContextRef.current || !analyserRef.current) return;

    const mainGain = audioContextRef.current.createGain();
    mainGain.gain.setValueAtTime(intensity, audioContextRef.current.currentTime);

    for (let i = 1; i <= harmonicCount; i++) {
      const oscillator = audioContextRef.current.createOscillator();
      const harmonic = audioContextRef.current.createGain();

      oscillator.type = waveType;
      oscillator.frequency.setValueAtTime(frequency * i, audioContextRef.current.currentTime);
      harmonic.gain.setValueAtTime(1 / i, audioContextRef.current.currentTime);

      oscillator.connect(harmonic);
      harmonic.connect(mainGain);
      oscillator.start();

      harmonicOscillatorsRef.current.push(oscillator);
    }

    mainGain.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    gainNodeRef.current = mainGain;
  }, []);

  const startSweepMode = useCallback((
    startFreq: number,
    endFreq: number,
    duration: number,
    intensity: number,
    waveType: WaveType
  ) => {
    if (!audioContextRef.current || !analyserRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(startFreq, audioContextRef.current.currentTime);
    gainNode.gain.setValueAtTime(intensity, audioContextRef.current.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    oscillator.start();

    mainOscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    let currentFreq = startFreq;
    const step = (endFreq - startFreq) / (duration * 10);

    sweepIntervalRef.current = window.setInterval(() => {
      currentFreq += step;
      if ((step > 0 && currentFreq >= endFreq) || (step < 0 && currentFreq <= endFreq)) {
        currentFreq = startFreq;
      }
      if (mainOscillatorRef.current && audioContextRef.current) {
        mainOscillatorRef.current.frequency.setValueAtTime(
          currentFreq,
          audioContextRef.current.currentTime
        );
      }
    }, 100);
  }, []);

  const startBinauralMode = useCallback((
    frequency: number,
    intensity: number,
    waveType: WaveType,
    beatFrequency: number
  ) => {
    if (!audioContextRef.current || !analyserRef.current) return;

    const leftOsc = audioContextRef.current.createOscillator();
    const rightOsc = audioContextRef.current.createOscillator();
    const leftGain = audioContextRef.current.createGain();
    const rightGain = audioContextRef.current.createGain();
    const merger = audioContextRef.current.createChannelMerger(2);

    leftOsc.type = waveType;
    rightOsc.type = waveType;
    leftOsc.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    rightOsc.frequency.setValueAtTime(frequency + beatFrequency, audioContextRef.current.currentTime);

    leftGain.gain.setValueAtTime(intensity, audioContextRef.current.currentTime);
    rightGain.gain.setValueAtTime(intensity, audioContextRef.current.currentTime);

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    leftOsc.start();
    rightOsc.start();

    leftOscillatorRef.current = leftOsc;
    rightOscillatorRef.current = rightOsc;
    leftGainRef.current = leftGain;
    rightGainRef.current = rightGain;
  }, []);

  const start = useCallback((config: Partial<AudioEngineState>) => {
    stopAllOscillators();

    const newState = { ...state, ...config, isPlaying: true };
    setState(newState);

    const { mode, frequency, intensity, waveType, harmonicCount, sweepStart, sweepEnd, sweepDuration, binauralBeat } = newState;

    switch (mode) {
      case 'harmonic':
        startHarmonicMode(frequency, intensity, waveType, harmonicCount);
        break;
      case 'sweep':
        startSweepMode(sweepStart, sweepEnd, sweepDuration, intensity, waveType);
        break;
      case 'binaural':
        startBinauralMode(frequency, intensity, waveType, binauralBeat);
        break;
      default:
        startSingleMode(frequency, intensity, waveType);
    }
  }, [state, stopAllOscillators, startSingleMode, startHarmonicMode, startSweepMode, startBinauralMode]);

  const stop = useCallback(() => {
    stopAllOscillators();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [stopAllOscillators]);

  const updateFrequency = useCallback((frequency: number) => {
    if (mainOscillatorRef.current && audioContextRef.current && state.mode === 'single') {
      mainOscillatorRef.current.frequency.setValueAtTime(
        frequency,
        audioContextRef.current.currentTime
      );
    }
    setState(prev => ({ ...prev, frequency }));
  }, [state.mode]);

  const updateIntensity = useCallback((intensity: number) => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        intensity,
        audioContextRef.current.currentTime
      );
    }
    if (leftGainRef.current && audioContextRef.current) {
      leftGainRef.current.gain.setValueAtTime(
        intensity,
        audioContextRef.current.currentTime
      );
    }
    if (rightGainRef.current && audioContextRef.current) {
      rightGainRef.current.gain.setValueAtTime(
        intensity,
        audioContextRef.current.currentTime
      );
    }
    setState(prev => ({ ...prev, intensity }));
  }, []);

  const getSpectrumData = useCallback((): SpectrumData => {
    if (!analyserRef.current) {
      return {
        frequencies: new Uint8Array(0),
        timeDomain: new Uint8Array(0),
        averageEnergy: 0,
        peakFrequency: 0,
      };
    }

    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
    const timeDomainData = new Uint8Array(analyserRef.current.frequencyBinCount);

    analyserRef.current.getByteFrequencyData(frequencyData);
    analyserRef.current.getByteTimeDomainData(timeDomainData);

    const sum = Array.from(frequencyData).reduce((a, b) => a + b, 0);
    const averageEnergy = sum / frequencyData.length / 255;

    const maxIndex = frequencyData.indexOf(Math.max(...Array.from(frequencyData)));
    const peakFrequency = (maxIndex / frequencyData.length) * (audioContextRef.current?.sampleRate || 44100) / 2;

    return {
      frequencies: frequencyData,
      timeDomain: timeDomainData,
      averageEnergy,
      peakFrequency,
    };
  }, []);

  return {
    state,
    start,
    stop,
    updateFrequency,
    updateIntensity,
    getSpectrumData,
    setState,
  };
};
