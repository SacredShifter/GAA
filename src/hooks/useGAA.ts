import { useState, useCallback } from 'react';
import { useEnhancedAudio, type AudioEngineState, type WaveType, type AudioMode } from './useEnhancedAudio';
import { useSync, type SyncState } from './useSync';
import { usePresets, type Preset } from './usePresets';
import type { GeometryMode } from '../components/EnhancedVisuals';

export interface GAAState extends AudioEngineState {
  pulseSpeed: number;
  geometryMode: GeometryMode;
  enableOrbitControls: boolean;
}

export interface GAAConfig {
  frequency?: number;
  intensity?: number;
  waveType?: WaveType;
  audioMode?: AudioMode;
  pulseSpeed?: number;
  geometryMode?: GeometryMode;
  harmonicCount?: number;
  sweepStart?: number;
  sweepEnd?: number;
  sweepDuration?: number;
  binauralBeat?: number;
}

export interface UseGAAOptions {
  userId?: string;
  circleId?: string;
  initialConfig?: GAAConfig;
  onResonanceChange?: (state: GAAState) => void;
  enableSync?: boolean;
}

export const useGAA = (options: UseGAAOptions = {}) => {
  const {
    userId,
    circleId,
    initialConfig,
    onResonanceChange,
    enableSync = false,
  } = options;

  const audio = useEnhancedAudio();
  const sync = useSync(circleId, userId);
  const presetsHook = usePresets(userId);

  const [pulseSpeed, setPulseSpeed] = useState(initialConfig?.pulseSpeed || 1);
  const [geometryMode, setGeometryMode] = useState<GeometryMode>(initialConfig?.geometryMode || 'waves');
  const [enableOrbitControls, setEnableOrbitControls] = useState(false);

  const state: GAAState = {
    ...audio.state,
    pulseSpeed,
    geometryMode,
    enableOrbitControls,
  };

  const start = useCallback(async (config?: GAAConfig) => {
    const audioConfig = {
      frequency: config?.frequency || state.frequency,
      intensity: config?.intensity || state.intensity,
      waveType: config?.waveType || state.waveType,
      mode: config?.audioMode || state.mode,
      harmonicCount: config?.harmonicCount || state.harmonicCount,
      sweepStart: config?.sweepStart || state.sweepStart,
      sweepEnd: config?.sweepEnd || state.sweepEnd,
      sweepDuration: config?.sweepDuration || state.sweepDuration,
      binauralBeat: config?.binauralBeat || state.binauralBeat,
    };

    audio.start(audioConfig);

    if (config?.pulseSpeed) setPulseSpeed(config.pulseSpeed);
    if (config?.geometryMode) setGeometryMode(config.geometryMode);

    if (enableSync && userId) {
      await sync.joinSync({
        frequency: audioConfig.frequency,
        intensity: audioConfig.intensity,
        wave_type: audioConfig.waveType,
        pulse_speed: config?.pulseSpeed || pulseSpeed,
        geometry_mode: config?.geometryMode || geometryMode,
      });
    }

    onResonanceChange?.(state);
  }, [audio, sync, enableSync, userId, state, pulseSpeed, geometryMode, onResonanceChange]);

  const stop = useCallback(async () => {
    audio.stop();

    if (enableSync) {
      await sync.leaveSync();
    }

    onResonanceChange?.(state);
  }, [audio, sync, enableSync, state, onResonanceChange]);

  const updateConfig = useCallback(async (config: GAAConfig) => {
    if (config.frequency !== undefined) {
      audio.updateFrequency(config.frequency);
    }
    if (config.intensity !== undefined) {
      audio.updateIntensity(config.intensity);
    }
    if (config.pulseSpeed !== undefined) {
      setPulseSpeed(config.pulseSpeed);
    }
    if (config.geometryMode !== undefined) {
      setGeometryMode(config.geometryMode);
    }

    if (enableSync && sync.state.mySession) {
      await sync.updateSyncState({
        frequency: config.frequency,
        intensity: config.intensity,
        wave_type: config.waveType,
        pulse_speed: config.pulseSpeed,
        geometry_mode: config.geometryMode,
      });
    }

    onResonanceChange?.(state);
  }, [audio, sync, enableSync, state, onResonanceChange]);

  const loadPreset = useCallback(async (preset: Preset) => {
    const config: GAAConfig = {
      frequency: preset.frequency,
      intensity: preset.intensity,
      waveType: preset.wave_type,
      pulseSpeed: preset.pulse_speed,
      geometryMode: preset.geometry_mode,
      audioMode: preset.audio_mode,
      harmonicCount: preset.harmonic_count,
      sweepStart: preset.sweep_start,
      sweepEnd: preset.sweep_end,
      sweepDuration: preset.sweep_duration,
      binauralBeat: preset.binaural_beat,
    };

    if (audio.state.isPlaying) {
      await start(config);
    } else {
      audio.setState(prev => ({
        ...prev,
        frequency: config.frequency!,
        intensity: config.intensity!,
        waveType: config.waveType!,
        mode: config.audioMode || prev.mode,
        harmonicCount: config.harmonicCount || prev.harmonicCount,
        sweepStart: config.sweepStart || prev.sweepStart,
        sweepEnd: config.sweepEnd || prev.sweepEnd,
        sweepDuration: config.sweepDuration || prev.sweepDuration,
        binauralBeat: config.binauralBeat || prev.binauralBeat,
      }));
      setPulseSpeed(config.pulseSpeed!);
      setGeometryMode(config.geometryMode!);
    }
  }, [audio, start]);

  return {
    state,
    audio,
    sync: enableSync ? sync.state : undefined,
    presets: presetsHook,
    start,
    stop,
    updateConfig,
    loadPreset,
    setPulseSpeed,
    setGeometryMode,
    setEnableOrbitControls,
    getSpectrumData: audio.getSpectrumData,
  };
};

export type UseGAAReturn = ReturnType<typeof useGAA>;
