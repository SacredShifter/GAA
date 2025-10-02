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
  frequencyData: Uint8Array;
  averageEnergy: number;
  peakFrequency: number;
  bassEnergy: number;
  midEnergy: number;
  trebleEnergy: number;
}

export const useEnhancedAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);
  const splitterRef = useRef<ChannelSplitterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

  const [state, setState] = useState<AudioEngineState>({
    isPlaying: false,
    frequency: 432,
    intensity: 0.5,
    waveType: 'sine',
    mode: 'binaural',
    harmonicCount: 3,
    sweepStart: 396,
    sweepEnd: 852,
    sweepDuration: 10,
    binauralBeat: 10,
  });

  useEffect(() => {
    audioContextRef.current = new AudioContext({ sampleRate: 48000 });

    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 8192;
    analyserRef.current.smoothingTimeConstant = 0.85;
    analyserRef.current.minDecibels = -90;
    analyserRef.current.maxDecibels = -10;

    compressorRef.current = audioContextRef.current.createDynamicsCompressor();
    compressorRef.current.threshold.setValueAtTime(-24, audioContextRef.current.currentTime);
    compressorRef.current.knee.setValueAtTime(30, audioContextRef.current.currentTime);
    compressorRef.current.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
    compressorRef.current.attack.setValueAtTime(0.003, audioContextRef.current.currentTime);
    compressorRef.current.release.setValueAtTime(0.25, audioContextRef.current.currentTime);

    return () => {
      stop();
      audioContextRef.current?.close();
    };
  }, []);

  const stopAllOscillators = useCallback(() => {
    try {
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

      if (leftGainRef.current) {
        leftGainRef.current.disconnect();
        leftGainRef.current = null;
      }

      if (rightGainRef.current) {
        rightGainRef.current.disconnect();
        rightGainRef.current = null;
      }

      if (mergerRef.current) {
        mergerRef.current.disconnect();
        mergerRef.current = null;
      }

      if (splitterRef.current) {
        splitterRef.current.disconnect();
        splitterRef.current = null;
      }
    } catch (error) {
      console.warn('Error stopping oscillators:', error);
    }
  }, []);

  const startBinauralBeats = useCallback((
    baseFrequency: number,
    beatFrequency: number,
    intensity: number,
    waveType: WaveType
  ) => {
    if (!audioContextRef.current || !analyserRef.current || !compressorRef.current) return;

    const context = audioContextRef.current;
    const currentTime = context.currentTime;

    const leftFreq = baseFrequency;
    const rightFreq = baseFrequency + beatFrequency;

    const leftOsc = context.createOscillator();
    const rightOsc = context.createOscillator();
    const leftGain = context.createGain();
    const rightGain = context.createGain();
    const merger = context.createChannelMerger(2);
    const splitter = context.createChannelSplitter(2);

    leftOsc.type = waveType;
    rightOsc.type = waveType;

    leftOsc.frequency.setValueAtTime(leftFreq, currentTime);
    rightOsc.frequency.setValueAtTime(rightFreq, currentTime);

    const safeIntensity = Math.max(0.01, Math.min(0.8, intensity));

    leftGain.gain.setValueAtTime(0, currentTime);
    rightGain.gain.setValueAtTime(0, currentTime);
    leftGain.gain.linearRampToValueAtTime(safeIntensity, currentTime + 0.5);
    rightGain.gain.linearRampToValueAtTime(safeIntensity, currentTime + 0.5);

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);

    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);

    merger.connect(splitter);
    splitter.connect(analyserRef.current, 0);
    splitter.connect(analyserRef.current, 1);

    merger.connect(compressorRef.current);
    compressorRef.current.connect(context.destination);

    leftOsc.start(currentTime);
    rightOsc.start(currentTime);

    leftOscillatorRef.current = leftOsc;
    rightOscillatorRef.current = rightOsc;
    leftGainRef.current = leftGain;
    rightGainRef.current = rightGain;
    mergerRef.current = merger;
    splitterRef.current = splitter;
  }, []);

  const start = useCallback((config: Partial<AudioEngineState> = {}) => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    stopAllOscillators();

    const newState = { ...state, ...config, isPlaying: true };
    setState(newState);

    const { frequency, intensity, waveType, binauralBeat } = newState;

    startBinauralBeats(frequency, binauralBeat, intensity, waveType);
  }, [state, stopAllOscillators, startBinauralBeats]);

  const stop = useCallback(() => {
    stopAllOscillators();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [stopAllOscillators]);

  const updateFrequency = useCallback((frequency: number) => {
    setState(prev => ({ ...prev, frequency }));

    if (state.isPlaying && leftOscillatorRef.current && rightOscillatorRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      const leftFreq = frequency;
      const rightFreq = frequency + state.binauralBeat;

      leftOscillatorRef.current.frequency.setTargetAtTime(leftFreq, currentTime, 0.1);
      rightOscillatorRef.current.frequency.setTargetAtTime(rightFreq, currentTime, 0.1);
    }
  }, [state.isPlaying, state.binauralBeat]);

  const updateIntensity = useCallback((intensity: number) => {
    setState(prev => ({ ...prev, intensity }));

    if (state.isPlaying && leftGainRef.current && rightGainRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      const safeIntensity = Math.max(0.01, Math.min(0.8, intensity));

      leftGainRef.current.gain.setTargetAtTime(safeIntensity, currentTime, 0.1);
      rightGainRef.current.gain.setTargetAtTime(safeIntensity, currentTime, 0.1);
    }
  }, [state.isPlaying]);

  const updateBinauralBeat = useCallback((binauralBeat: number) => {
    setState(prev => ({ ...prev, binauralBeat }));

    if (state.isPlaying && rightOscillatorRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      const rightFreq = state.frequency + binauralBeat;

      rightOscillatorRef.current.frequency.setTargetAtTime(rightFreq, currentTime, 0.1);
    }
  }, [state.isPlaying, state.frequency]);

  const getSpectrumData = useCallback((): SpectrumData => {
    if (!analyserRef.current) {
      return {
        frequencyData: new Uint8Array(0),
        averageEnergy: 0,
        peakFrequency: 0,
        bassEnergy: 0,
        midEnergy: 0,
        trebleEnergy: 0,
      };
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    let maxValue = 0;
    let maxIndex = 0;

    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    const averageEnergy = sum / bufferLength / 255;

    const sampleRate = audioContextRef.current?.sampleRate || 48000;
    const peakFrequency = (maxIndex * sampleRate) / (analyserRef.current.fftSize * 2);

    const bassEnd = Math.floor(bufferLength * 0.1);
    const midEnd = Math.floor(bufferLength * 0.4);

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    for (let i = 0; i < bassEnd; i++) {
      bassSum += dataArray[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += dataArray[i];
    }
    for (let i = midEnd; i < bufferLength; i++) {
      trebleSum += dataArray[i];
    }

    const bassEnergy = bassSum / bassEnd / 255;
    const midEnergy = midSum / (midEnd - bassEnd) / 255;
    const trebleEnergy = trebleSum / (bufferLength - midEnd) / 255;

    return {
      frequencyData: dataArray,
      averageEnergy,
      peakFrequency,
      bassEnergy,
      midEnergy,
      trebleEnergy,
    };
  }, []);

  const getActualFrequencies = useCallback((): { left: number; right: number; beat: number } => {
    if (!leftOscillatorRef.current || !rightOscillatorRef.current) {
      return { left: 0, right: 0, beat: 0 };
    }

    const leftFreq = leftOscillatorRef.current.frequency.value;
    const rightFreq = rightOscillatorRef.current.frequency.value;
    const beat = rightFreq - leftFreq;

    return { left: leftFreq, right: rightFreq, beat };
  }, []);

  return {
    state,
    start,
    stop,
    updateFrequency,
    updateIntensity,
    updateBinauralBeat,
    getSpectrumData,
    getActualFrequencies,
  };
};
